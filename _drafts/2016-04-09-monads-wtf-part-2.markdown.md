---
layout:    post
title:     "The Free Monad and its Cost"
date:      2016-04-06
permalink: /posts/:title
tags:      programming scala
comments:  true
active:    "blog"

---

This is the second part to my series on explaining `Monads` for non type-theorists - [read Part One here](#link)

<div class="line"></div>

There is such a thing as a **Free Monoid**. A `Monoid` is "free" when it's defined in the simplest terms possible and when the `append` method doesn't lose any data in its result. 

This is vague, but let's look at some examples. From above, `ListConcat` is "free" - we still have the individual elements of each input list after we've concatenated them. We didn't perform any fancier combinations on the elements given other than throwing them together in sequential order (Integer addition, on the other hand, defines a special algebra for combining numbers, losing the inputs in the result). It's important that we defined `ListConcat` with a generic type `A` - the only operations you can perform on the generic list are the `Monoid` operations (since you don't know anything about its members, if they're Strings, Ints, other complex types, or even functions). This satisfies the "simplest terms possible" clause for free-ness, and gives meaning to this technical explanation of Free Objects:

> Informally, a free object over a set `A` can be thought of as being a "generic" algebraic structure over `A`: the only equations that hold between elements of the free object are those that follow from the defining axioms of the algebraic structure. [^1]

[^1]: [https://en.wikipedia.org/wiki/Free_object](https://en.wikipedia.org/wiki/Free_object)

## Why do we call it "Free"?

> The word "free" is used in the sense of "unrestricted" rather than "zero-cost" [^2]

[^2]: [https://hackage.haskell.org/package/free](https://hackage.haskell.org/package/free)

As we saw in the concatenation examples above, the `append` operation just shoves the data together, "free" of interpretation of the contained data.

> But still - why that specific word, "free"? ...[It] is free from any specific interpretation, or free to be interpreted in any way. [^3]

[^3]: [https://softwaremill.com/free-monads/](https://softwaremill.com/free-monads/)

## The Free Monad

Let's think now about what would make a `Monad` "free". We know we want the simplest definition possible, free from interpretation, without losing data.

The `append` definition we used for `Monad` above won’t work, since we lose `f1` and `f2` and essentially create some `f3`. Instead, we’re have to concatenate or chain the functions in a list-like structure to preserve the data. You can think of the `Free Monad` like a `Functor`, except it doesn't know how to `flatten`: [^10]

{% highlight scala %}
def flatten[A](ffa: F[F[A]]): F[A] = ???
{% endhighlight %}

[^10]: `flatten` also known as `join` [https://www.youtube.com/watch?v=T4956GI-6Lw](https://www.youtube.com/watch?v=T4956GI-6Lw)

We can illustrate this by building the following types: [^11]

[^11]: [https://github.com/davidhoyt/kool-aid](https://github.com/davidhoyt/kool-aid)

{% highlight scala %}
sealed trait Free[F[_], A] { self =>
  def map[B](fn: A => B): Free[F, B] = 
    flatMap(a => Return(fn(a)))
  
  def flatMap[B](fn: A => Free[F, B]): Free[F, B] =
    FlatMap(self, (a: A) => fn(a))
}

case class Return[F[_], A](given: A) extends Free[F, A]
case class FlatMap[F[_], A, B](given: Free[F, A], fn: A => Free[F, B]) extends Free[F, B]
{% endhighlight %}

You might start to see how we can now encode computations as data and chain the operations together in something like:

{% highlight scala %}
sealed trait Context

val result: Free[Context, String] =
  Return[Context, String]("chain") flatMap { chain =>
    Return[Context, String]("these") flatMap { these =>
      Return[Context, String]("together") map { together =>
        s"$a $b $c"
      }
    }
  }
{% endhighlight %}

This is an arbitrary example (and you should never use the `Free Monad` to do string concatenation), but let's look at the resulting data structure:

{% highlight scala %}
$ result
Free[Context,String] = FlatMap(Return(chain),<function1>)
{% endhighlight %}

Expanded this would look like:

{% highlight scala %}
FlatMap[Context, String, String](
  Return[Context, String]("chain"), a => FlatMap[Context, String, String](
    Return[Context, String]("these"), b => FlatMap[Context, String, String](
      Return[Context, String]("together"), c => Return[Context, String](s"$a $b $c")
    )
  )
)
{% endhighlight %}

Now you can see the "list-like" data structure that is preserving the functions as we chain them together. 

#### Monads vs. Free Monads
What's the point of using the `Free Monad`? `Monads` have the ability to `flatMap`, so we could compose functions for days to achieve a similar end result.

Imagine, though, a nested flatMap: 
{% highlight scala %}
def doSomething[A](a: A): List[A] = ???

(1 to 1000).toList.flatMap { i =>
  doSomething(i).flatMap { j =>
    doSomething(j).flatMap { k =>
      doSomething(k).map { l =>
        println(l)
      }
    }
  }
}
{% endhighlight %}

Maybe your code doesn't have functions that look like that, but the architecture is behaving the same - you have composed a bunch of functions that are each added to the stack. If your business logic is complicated enough (in this case, maybe `doSomething` is making `n` additional function calls), and you really want to defer side effects until the very end, you might encounter `StackOverflowError`s.

The `Free Monad`, on the other hand, created a nested, list-like structure that stores all of the functions. The trick is that these then have to be evaluated in a loop (or a tail recursive call). The tradeoff? Stack for Heap.

#### Hotel California

We've entered the `Monad`, but how do we leave? All of this "free from interpretation" has to come due at some point, and that point is in defining the interpreter[s]. These interpreters are the missing `flatten` operation mentioned above. 

An example of an interpreter for the above problem:

{% highlight scala %}
def flatten[A](c: Free[Context, A]): A = {
  @annotation.tailrec
  def step(f: Free[Context, A]): Free[Context, A] = f match {
    case Return(s)                         => f
    case FlatMap(FlatMap(given, fn1), fn2) => step(given.flatMap(s1 => fn1(s1).flatMap(s2 => fn2(s2))))
    case FlatMap(Return(given), fn)        => step(fn(given))
  }

  step(c) match {
    case Return(s)          => s
    case FlatMap(given, fn) => flatten(fn(flatten(given)))
  }
}
{% endhighlight %}

Let's be even more explicit by using some horribly non-idiomatic Scala that illustrates the loop we're performing:

{% highlight scala %}
def flatten[A](c: Free[Context, A]): A = {
  var eval: List[Free[Context, A]] = List(c)
  var res: Any = null

  while (eval.nonEmpty) {
    eval.head match {
      case Return(s) =>
        eval = eval.tail
        res = s
      case FlatMap(FlatMap(given, fn1), fn2) =>
        eval = List(given.flatMap(s1 => fn1(s1).flatMap(s2 => fn2(s2))))
      case FlatMap(Return(s), fn) =>
        eval = List(fn(s))
    }
  }
  res.asInstanceOf[A]
}
{% endhighlight %}

## With Great Power...

`Free Monads` are a powerful construct if you need multiple interpretations for outputs and effects [^12]. Once you begin to grasp the mechanics, defining multiple interpreters to evaluate the "list" of functions is a neat solution - something like a production interpreter and a test interpreter. You already have a whole slew of tools (builtin to the language) that give the benefits of `Monads` (composability, side-effect-safety) without the complexity that require blog posts like these to explain. 

[^12]: David Hoyt has some examples of using multiple interpreters by defining a more [extendable flatten](https://github.com/davidhoyt/kool-aid/blob/master/free/src/main/scala/sbtb/koolaid/fun/free/package.scala) he calls `runFree`. Rob Norris also uses `Free` heavily in his JDBC library Doobie [https://github.com/tpolecat/doobie](https://github.com/tpolecat/doobie)

Even with a need for multiple interpreters and stack safety, we should be judicious in our use of these tools. I get nervous every time I find a "neat" solution in Scala, it usually means there is an easier way. Remember that the [wrong abstraction is dangerous](http://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) and our responsibility as programmers should still be to write reuseable, maintainable code.

<div class="line"></div>

Sound interesting? Want to convince me that your use of Free Monads is ingenious *and* necessary? I'm talking more about this at [Scaladays](http://event.scaladays.org/scaladays-nyc-2016) in May - or send me a note on Twitter [@kelleyrobinson](https://www.twitter.com/kelleyrobinson)


<div class="line"></div>

<p class="references" style="margin-bottom: 0;">References:</p>
