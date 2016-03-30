---
layout:    post
title:     "A Comprehensive Explanation of Monads without touching Category Theory"
date:      2016-03-27
permalink: /posts/:title
tags:      programming scala
comments:  true
active:    "blog"

---

Scala developers love to discuss Monads, their metaphors, and their many use cases. We joke that Monads are 'just Monoids in the category of Endofunctors', but other than being intentionally condescending, what does that mean? 

Parts of functional programming (FP) may be built on the mathematical principles from category theory, but at its core, FP is a style of programming. This post aims to prove you don't need a PhD or be a Haskell programmer to understand these patterns. One disclaimer - the explanation does assume that you know some basics of Scala (like types, polymorphism, and traits).

We'll start by defining some of the most referenced components in order to define Monads. We also explore why Monadic design is useful, why it's dangerous, and discuss some tradeoffs of using these types.

## Monoid

A `Monoid` is a type that carries the following properties:

* has some `append` method that can take two instances of `A` such that it produces another, singular, instance of `A`

* has some `identity` element such that performing `append` with `identity` as one of the arguments returns the other argument.

In code:

{% highlight scala %}
trait Monoid[A] {
  def append(a: A, b: A): A
  def identity: A
  
  /*
   * Such that:
   *   `append(a, identity) == append(identity, a) == a`
   */
}
{% endhighlight %}


####Examples

**Integer addition**

{% highlight scala %}
object IntegerAddition extends Monoid[Int] {
  def append(a: Int, b: Int): Int = a + b
  def identity: Int = 0
  // append(1, identity) == append(identity, 1) == 1
}
{% endhighlight %}

**Integer multiplication**

{% highlight scala %}
object IntegerMultiplication extends Monoid[Int] {
  def append(a: Int, b: Int): Int = a * b
  def identity: Int = 1
  // append(2, identity) == append(identity, 2) == 2
}
{% endhighlight %}

**String concatenation**

{% highlight scala %}
object StringConcat extends Monoid[String] {
  def append(a: String, b: String): String = a + b
  def identity: String = ""
  // append("foo", identity) == append(identity, "foo") == "foo"
}
{% endhighlight %}

**List concatenation**

{% highlight scala %}
object ListConcat[A] extends Monoid[List[A]] {
  def append(a: List[A], b: List[A]): List[A] = a ++ b
  def identity: List[A] = List.empty[A]
  // append(List("bar"), identity) == append(identity, List("bar")) == List("bar")
}
{% endhighlight %}

Monoids are a useful construct in every language. While not always explicitly defined as this type, the four examples above are ubiquitous language features.

There is such a thing as the **Free Monoid**. A `Monoid` is "free" when it's defined in the simplest terms possible and when the `append` method doesn't lose any data in its result. 

This is vague, but let's look at some examples. From above, `ListConcat` is "free" - we still have the individual elements of each input list after we've concatenated them. We didn't perform any fancier combinations on the elements given other than throwing them together in sequential order (Integer addition, on the other hand, defines a special algebra for combining a numbers, losing the inputs in the result). It's important that we defined `ListConcat` with a generic type `A` - the only operations you can perform on the generic list are the `Monoid` operations (since you don't know anything about its members, if they're Strings, Ints, other complex types, or even functions). This satisfies the "simplest terms possible" clause for free-ness, and gives meaning to this technical explanation of Free Objects:

> Informally, a free object over a set `A` can be thought of as being a "generic" algebraic structure over `A`: the only equations that hold between elements of the free object are those that follow from the defining axioms of the algebraic structure. [^1]

[^1]: [https://en.wikipedia.org/wiki/Free_object](https://en.wikipedia.org/wiki/Free_object)

## Why do we call it "Free"?

> The word "free" is used in the sense of "unrestricted" rather than "zero-cost" [^2]

[^2]: [https://hackage.haskell.org/package/free](https://hackage.haskell.org/package/free)

As we saw in the concatenation examples above, the `append` operation just shoves the data together, "free" of interpretation of the contained data.

> But still - why that specific word, "free"? ...[It] is free from any specific interpretation, or free to be interpreted in any way. [^3]

[^3]: [https://softwaremill.com/free-monads/](https://softwaremill.com/free-monads/)

## Functors

A `Functor` is a type that has implemented the `map` method.

{% highlight scala %}
Trait Functor[F[_]] {
  def map[A, B](a: F[A])(fn: A => B): F[B]
}
{% endhighlight %}

If you have experience programming in Scala, you'll know this encompasses a lot of types. `map` is a useful method because it allows you to chain operations together (commonly known as composition) and defer evaluation and side effects until you have already defined all of the business logic. [^4]

[^4]: Implementations of `Functor` in Scala are also `Endofunctors` ('endo' meaning "internal" or "within") because the input and output parameters are always Scala Types. See: [http://www.dictionary.com/browse/endo-](http://www.dictionary.com/browse/endo-) and [http://hseeberger.github.io/blog/2010/11/25/introduction-to-category-theory-in-scala/](http://hseeberger.github.io/blog/2010/11/25/introduction-to-category-theory-in-scala/)

## Monads

> The term monad is a bit vacuous if you are not a mathematician. An alternative term is computation builder. [^5]

[^5]: [https://stackoverflow.com/questions/44965/what-is-a-monad](https://stackoverflow.com/questions/44965/what-is-a-monad)

We've established that we don't have to be mathematicians to do this, so let's take a look at the practical implementation details. 

A `Monad` is a type that has implemented the `pure` and `flatMap` [^6] methods.

[^6]: `pure` is also known as `return` or `lift`. `flatMap` is also known as `bind`

{% highlight scala %}
trait Monad[M[_]] {
  def pure[A](a: A): M[A]
  def flatMap[A, B](a: M[A])(fn: A => M[B]): M[B]
}
{% endhighlight %}

`pure` is a method that takes any type and creates the "computation builder", wrapping it in the container type. (Why some people have described monads as burritos [^7]).

[^7]: [https://byorgey.wordpress.com/2009/01/12/abstraction-intuition-and-the-monad-tutorial-fallacy/](https://byorgey.wordpress.com/2009/01/12/abstraction-intuition-and-the-monad-tutorial-fallacy/)

With these two methods, you can define `map`:

{% highlight scala %}
def map[A, B](a: M[A])(fn: A => B): M[B] = {
  flatMap(a){ b: A => pure(fn(b)) }
}
{% endhighlight %}

You can also define the Monoid operations `append` and `identity` by using `flatMap` and `pure`. Above, we defined the trait `Monoid` with a generic type. Here, that type ]is a function: `A => M[B]` where `A` and `B` are not fixed and can be any type. [^8]

[^8]: It's really difficult to define this "forall" type in Scala, people have done it trying to emulate something similar in Haskell [https://stackoverflow.com/questions/7213676/forall-in-scala](https://stackoverflow.com/questions/7213676/forall-in-scala).

{% highlight scala %}
def append[A, B, C](f1: A => M[B], f2: B => M[C]): A => M[C] = { a: A =>
  val bs: M[B] = f1(a)
  val cs: M[C] = flatMap(bs) { b: B => f2(b) }
  cs
}

def identity[A](a: A): M[A] = pure(a)
{% endhighlight %}

Like `Monoids` allow composition of objects (think back to string concatenation), `Monads` allow composition of functions. Building composable programs is extremely useful, it's one of the things that functional programmers love the most about all their functional-programming-ness. When we talk about composable architecture we often cite the benefits of modularity, statelessness, and deferring side effects:

> A functional style pushes side effects to the edges: "gather information, make decisions, act."
> A good plan in most life situations too. - Jessica Kerr [^9]

[^9]: [https://twitter.com/jessitron/status/713432439746654209](https://twitter.com/jessitron/status/713432439746654209)

Building systems in this manner can provide greater maintainability and code reuse, and increase understanding of complex logic by breaking it into smaller, simpler pieces. What's better is that the benefits of `Monads` are largely builtin to the Scala language whether you realize it or not. Using types like `Option` and `List` means using `Monads`, without having to do any of the complicated setup or method definitions.

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

Sound interesting? Want to convince me that your use of Free Monads is ingenious *and* necessary? I'm talking more about this at [Scaladays](http://event.scaladays.org/scaladays-nyc-2016) in May - or send me a note on Twitter [@kelleyrobinson](https://www.twitter.com/kelleyrobinson)


<div class="line"></div>

<p class="references" style="margin-bottom: 0;">References:</p>
