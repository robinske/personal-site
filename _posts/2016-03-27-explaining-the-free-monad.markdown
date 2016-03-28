---
layout:    post
title:     "A Comprehensive Explanation of Monads without touching Category Theory"
date:      2016-03-19
permalink: /posts/:title
tags:      programming scala
comments:  true
active:    "blog"
---

Scala developers love to discuss Monads, their metaphors, and their many use cases. We joke that Monads are Monoids in the category of Endofunctor, but what does that mean? While [parts of] functional programming may be built on the mathematical principles from category theory, at the end of the day it is a style of programming. We're going to prove you don't need a PhD (or be a Haskell programmer) to understand these data structures. This explanation does assume that you know the building blocks of Scala (like traits, types, polymorphism).

Let's define the building blocks and talk about why these things are useful (and dangerous).

## Monoid

Every `monoid` has the following properties:

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
There's such a thing as the **Free Monoid**. A monoid is "free" when it's defined in the simplest terms possible and when the `append` method doesn't lose any data in its result.

In the above examples, `ListConcat` is "free" - we still have the individual elements of each input list after we've concatenated them. We didn't perform any fancier combinations on the elements given other than throwing them together in sequential order. It's important that we defined `ListConcat` with a generic type `A` - the only operations you can perform on the generic list are the monoid operations (since you don't know anything about its members, if they're Strings, Ints, other complex types, or even functions). This satisfies the "simplest terms possible" clause for free-ness, and gives meaning to this technical explanation of Free Objects:

> Informally, a free object over a set A can be thought of as being a "generic" algebraic structure over A: the only equations that hold between elements of the free object are those that follow from the defining axioms of the algebraic structure. [^1]

[^1]: [https://en.wikipedia.org/wiki/Free_object](https://en.wikipedia.org/wiki/Free_object)

## Why do we call it "Free"?

> The word "free" is used in the sense of "unrestricted" rather than "zero-cost" [^2]

[^2]: [https://hackage.haskell.org/package/free](https://hackage.haskell.org/package/free)

As we saw in the concatenation examples above, the `append` operation just shoves the data together, "free" of interpretation of the contained data.

> But still - why that specific word, "free"? ...[It] is free from any specific interpretation, or free to be interpreted in any way. [^3]

[^3]: [https://softwaremill.com/free-monads/](https://softwaremill.com/free-monads/)

## Functors

A `functor` is a type that has implemented the `map` method.

{% highlight scala %}
Trait Functor[F[_]] {
  def map[A, B](a: F[A])(fn: A => B): F[B]
}
{% endhighlight %}
If you have experience programming in Scala, you'll know this encompasses a lot of types. `map` is a useful method because it allows you to chain operations together and defer evaluation until you have already defined all of the business logic. [^4]

[^4]: Implementations of `Functor` in Scala are also `Endofunctors` ('endo' meaning "internal" or "within") because the input and output parameters are always Scala Types. See: [http://www.dictionary.com/browse/endo-](http://www.dictionary.com/browse/endo-)

#### Is there a Free Functor?

You betcha. Like the Free Monoid, it doesn't know how to evaulate the operation, it will just store a sequence of `map` functions and defer the evaluation (and thus any side effects) until some interpreter is defined and executed.

## Monads

> The term monad is a bit vacuous if you are not a mathematician. An alternative term is computation builder. [^5]

[^5]: [https://stackoverflow.com/questions/44965/what-is-a-monad](https://stackoverflow.com/questions/44965/what-is-a-monad)

We've established that we don't have to be mathematicians to do this, so let's take a look at the practical implementation details. 

A `monad` is a type that has implemented the `pure` and `flatMap` [^6] methods.

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

And you can define the monoid operations `append` and `identity` by using `flatMap` and `pure`. Above, we defined the trait `Monoid` with a generic type, here that is a function: `A => M[B]` where `A` and `B` are not fixed and can be any type. [^8]

[^8]: It's really difficult to define this "forall" type in Scala, people have done it trying to emulate something similar in Haskell [https://stackoverflow.com/questions/7213676/forall-in-scala](https://stackoverflow.com/questions/7213676/forall-in-scala).

{% highlight scala %}
def append[A, B, C](f1: A => M[B], f2: B => M[C]): A => M[C] = { a: A =>
  val bs: M[B] = f1(a)
  val cs: M[C] = flatMap(bs) { b: B => f2(b) }
  cs
}

def identity[A](a: A): M[A] = pure(a)
{% endhighlight %}

Like Monoids allow composition of objects (think String concatenation), Monads allow composition of functions. Building composable programs is extremely useful, it's one of the things that functional programmers love the most about all their functional-programming-ness. When we talk about composable architecture we often are thinking about modularity, statelessness, and deferring side effects:

> A functional style pushes side effects to the edges: "gather information, make decisions, act."
> A good plan in most life situations too. - Jessica Kerr [^9]

[^9]: [https://twitter.com/jessitron/status/713432439746654209](https://twitter.com/jessitron/status/713432439746654209)

Building systems in this manner can provide greater maintainability and code reuse, and increase understanding of complex logic by breaking it into smaller, simpler pieces. The benefits of Monads are largely builtin to the Scala language whether you realize it or not - that's one of the most beautiful things. Using `Option` and `List` means using Monads, without having to do any of the complicated setup or type definition.

## The Free Monad

Let's think about what would make a monad "free" now. We know we want the simplest definition possible, free from interpretation, without losing data. It’s going to define 5 functions:
`pure`, `flatMap`, `map`, `append`, and `identity`.

The `append` definition we used for `Monad` above won’t work, since we lose `f1` and `f2` and essentially create some `f3`. Instead, we’re have to concatenate or chain the functions in a list-like structure to preserve the data. You can think of the Free Monad like a Functor, except it doesn't know how to `flatten`. [^10]

{% highlight scala %}
def flatten[A](ffa: F[F[A]]): F[A] = ???
{% endhighlight %}

[^10]: `flatten` also known as `join` [https://www.youtube.com/watch?v=T4956GI-6Lw](https://www.youtube.com/watch?v=T4956GI-6Lw)

We can illustrate this by building the following types (examples taken from David Hoyt [^11])

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
val result: Free[Context, String] =
  Return[Context, String]("chain") flatMap { chain =>
    Return[Context, String]("these") flatMap { these =>
      Return[Context, String]("together") map { together =>
        s"$chain $these $together"
      }
    }
  }
{% endhighlight %}

This is an arbitrary example (and you should never use the Free Monad to do string concatenation), but let's look at the resulting data structure:

{% highlight scala %}
$ result
Free[Context,String] = FlatMap(Return(chain),<function1>)
{% endhighlight %}

Expanded this would look like:

{% highlight scala %}
FlatMap(
  Return("chain"), a => FlatMap(
    Return("these"), b => FlatMap(
      Return("together"), c => Return(s"$chain $these $together")
    )
  )
)
{% endhighlight %}

Now you can see the "list-like" data structure that is preserving the functions as we chain them together. All of this "free from interpretation" has to come due at some point, and that point is in defining the interpreter[s]. These interpreters are the missing `flatten` operation mentioned above. 

An example of an interpreter:

{% highlight scala %}
def flatten[A](c: Free[Context, A]): A =
  c match {
    case Return(s) => s
    case FlatMap(given, fn) =>
      flatten(fn(flatten(given))
  }
{% endhighlight %}

Free monads are a powerful tool if you need multiple interpretations for outputs and effect. I would argue that's the _only_ reason they make sense. You have a whole slew of tools (builtin to the language) that give the benefits of Monads (composability, side-effect-safety) without the complexity that require articles like these to explain. Even with a need for multiple interpreters, this implementation is a heavy price to pay for that "freedom".

<div class="line"></div>

<p class="references" style="margin-bottom: 0;">References:</p>
