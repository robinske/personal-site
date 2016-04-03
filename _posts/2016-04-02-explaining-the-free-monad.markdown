---
layout:    post
title:     "Monads are just WTF in the category of huh?"
date:      2016-04-02
permalink: /posts/:title
tags:      programming scala
comments:  true
active:    "blog"

---

Scala developers love to discuss Monads, their metaphors, and their many use cases. We joke that Monads are 'just Monoids in the category of Endofunctors', but other than being condescending, what does that really mean?

Parts of functional programming (FP) may be built on the mathematical principles from category theory, but at its core, FP is a style of programming. This post aims to prove you don't need a PhD or be a Haskell programmer to understand these patterns. One disclaimer - the explanation does assume that you know some basics of Scala (like types, polymorphism, and traits).

We'll start by defining some of the most referenced components in order to define Monads. We also explore why Monadic design is useful, why it's dangerous, and discuss some tradeoffs of using these types.

## Monoid

A `Monoid` is any type `A` that carries the following properties:

* Has some `append` method that can take two instances of `A` such that it produces another, singular, instance of `A`. This method is [associative](http://www.merriam-webster.com/dictionary/associative); if you use it to append multiple values together, the order and grouping of values doesn't matter.

* Has some `identity` element such that performing `append` with `identity` as one of the arguments returns the other argument.

In code:

{% highlight scala %}
trait Monoid[A] {
  def append(a: A, b: A): A
  def identity: A
  
  /*
   * Such that:
   * Associativity property: `append(a, append(b,c)) == append(append(a,b),c)`
   * Identity property: `append(a, identity) == append(identity, a) == a`
   */
}
{% endhighlight %}


####Examples

**Integer addition**

{% highlight scala %}
object IntegerAddition extends Monoid[Int] {
  def append(a: Int, b: Int): Int = a + b
  def identity: Int = 0
  // Associativity: 2 + (3 + 4) == (2 + 3) + 4
  // Identity: (1 + 0) == (0 + 1) == 1
}
{% endhighlight %}

<span id="fncomp">**Function composition**</span>

{% highlight scala %}
object FunctionComposition /* extends Monoid[_ => _] */ {
  def append[A, B, C](a: A => B, b: B => C): A => C = a.andThen(b)
  def identity[A]: A => A = a => a
  // Associativity: (f.andThen(g.andThen(h)))(x) == ((f.andThen(g)).andThen(h))(x)
  // Identity: identitity(f(x)) == f(identity(x)) == f(x)
}
{% endhighlight %}
The extension here wouldn't quite compile, but it's a good example of using functions as types which will be important later. [^0]

[^0]: It's really difficult to define this "forall" type in Scala, people have done it trying to emulate something similar in Haskell [https://stackoverflow.com/questions/7213676/forall-in-scala](https://stackoverflow.com/questions/7213676/forall-in-scala).

**String concatenation**

{% highlight scala %}
object StringConcat extends Monoid[String] {
  def append(a: String, b: String): String = a + b
  def identity: String = ""
  // Associativity: "foo" + ("bar" + "baz") == ("foo" + "bar") + "baz"
  // Identity: ("foo" + "") == ("" + "foo") == "foo"
}
{% endhighlight %}

**List concatenation**

{% highlight scala %}
class ListConcat[A] extends Monoid[List[A]] {
  def append(a: List[A], b: List[A]): List[A] = a ++ b
  def identity: List[A] = List.empty[A]
  // Associativity: List(1,2,3) ++ (List(4,5,6) ++ List(7,8,9)) == (List(1,2,3) ++ List(4,5,6)) ++ List(7,8,9)
  // Identity: (List(1,2,3) ++ Nil) == (Nil ++ List(1,2,3)) == List(1,2,3)
}
{% endhighlight %}

Monoids are a useful construct in every language. While not always explicitly defined as this type, the four examples above are ubiquitous language features.

## Functors

A `Functor` is  concept that applies to a family of types `F` with a single generic type parameter. For example, `List` is a type family, because `List[A]` is a distinct type for each distinct type `A`. A type family `F` is a `Functor` if it can define a `map` method with the following properties:

* Identity: calling `map` with the `identity` function is a no-op;
* Composition: calling `map` with a composition of functions is equivalent to composing separate calls to `map` on each function individually.

{% highlight scala %}
trait Functor[F[_]] {
  def map[A, B](a: F[A])(fn: A => B): F[B]
  // Identity: map(fa)(identity) == fa
  // Composition: map(fa)(f andThen g) == map(map(fa)(f))(g)
}
{% endhighlight %}

If you have experience programming in Scala, you'll know this encompasses a lot of types. `map` is a useful method because it allows you to chain operations together (composition). Since mapped functions don't need to be executed immediately, you can also defer evaluation and side effects until the result is needed.

Implementations of `Functors` in Scala are also `Endofunctors` ('endo' meaning "internal" or "within") because the input and output parameters are always Scala Types. [^4]

[^4]: [http://www.dictionary.com/browse/endo-](http://www.dictionary.com/browse/endo-) and [http://hseeberger.github.io/blog/2010/11/25/introduction-to-category-theory-in-scala/](http://hseeberger.github.io/blog/2010/11/25/introduction-to-category-theory-in-scala/)

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

`pure` is a method that takes any type and creates the "computation builder", wrapping it in the container type or "context". (Why some people have described monads as burritos [^7]).

[^7]: [https://byorgey.wordpress.com/2009/01/12/abstraction-intuition-and-the-monad-tutorial-fallacy/](https://byorgey.wordpress.com/2009/01/12/abstraction-intuition-and-the-monad-tutorial-fallacy/)

With these two methods, you can define `map`:

{% highlight scala %}
trait Monad[M[_]] {
  def pure[A](a: A): M[A]
  def flatMap[A, B](a: M[A])(fn: A => M[B]): M[B]

  def map[A, B](a: M[A])(fn: A => B): M[B] = {
    flatMap(a){ b: A => pure(fn(b)) }
  }
}
{% endhighlight %}

You can also define the Monoid operations `append` and `identity` by using `flatMap` and `pure`. Above, we defined the trait `Monoid` with a generic type. Here, that type ]is a function: `A => M[B]` where `A` and `B` are not fixed and can be any type. [^0]

[^8]: It's really difficult to define this "forall" type in Scala, people have done it trying to emulate something similar in Haskell [https://stackoverflow.com/questions/7213676/forall-in-scala](https://stackoverflow.com/questions/7213676/forall-in-scala).

{% highlight scala %}
trait Monad[M[_]] /* extends Monoid[_ => M[_]] */ {
  def pure[A](a: A): M[A]
  def flatMap[A, B](a: M[A])(fn: A => M[B]): M[B]
  
  def map[A, B](a: M[A])(fn: A => B): M[B] = {
    flatMap(a){ b: A => pure(fn(b)) }
  }
  
  def append[A, B, C](f1: A => M[B], f2: B => M[C]): A => M[C] = { a: A =>
    val bs: M[B] = f1(a)
    val cs: M[C] = flatMap(bs) { b: B => f2(b) }
    cs
  }

  def identity[A]: A => M[A] = a => pure(a)
}
{% endhighlight %}

`Monoids` already allow composition of functions as we saw [above](#fncomp). `Monads` are useful because they allow you to compose functions for **values in a context** (`M[_]`), something that we see all over our programs (like `Lists` and `Options`). Building composable programs is extremely useful, it's one of the things that functional programmers love the most about all their functional-programming-ness. When we talk about composable architecture we often cite the benefits of modularity, statelessness, and deferring side effects:

> A functional style pushes side effects to the edges: "gather information, make decisions, act."
> A good plan in most life situations too. - Jessica Kerr [^9]

[^9]: [https://twitter.com/jessitron/status/713432439746654209](https://twitter.com/jessitron/status/713432439746654209)

Building systems in this manner can provide greater maintainability and code reuse, and increase understanding of complex logic by breaking it into smaller, simpler pieces. What's better is that the benefits of `Monads` are largely builtin to the Scala language whether you realize it or not. Using types like `List` and `Option` means using `Monads`, without having to do any of the tedious setup or method definitions.

## Takeaways

These are complicated concepts, but hopefully ( by applying the principles of FP! ) we have broken it into smaller, digestable explanations. If anything is still confusing, leave me a note in the comments. The resources and references below are useful if you want to explore this more; I promised not to reference Haskell, but I especially like this [explanation using pictures](http://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html).

<div class="line"></div>

Stay tuned for Part 2 where I'll dive into the details of the Free Monad.

Sound interesting? Want to convince me of your metaphor? I'm talking more about this at [Scaladays](http://event.scaladays.org/scaladays-nyc-2016) in May - or send me a note on Twitter [@kelleyrobinson](https://www.twitter.com/kelleyrobinson)

<div class="line"></div>

<p class="references" style="margin-bottom: 0;">Notes and references:</p>
