---
layout:    post
title:     "The Free Monad and its Cost"
date:      2016-07-14
tags:      programming scala
comments:  true
active:    "blog"

---

This is the follow up post in to my explanation of `Monads` for Scala developers. [Read part one here](https://www.krobinson.me/blog/explaining-monads/).

Code examples can be found here: [https://github.com/robinske/monad-examples](https://github.com/robinske/monad-examples)

<div class="line"></div>

I had heard a lot of things about the `Free Monad` and never really understood what it was, so did the research that led me here. I wanted to grasp the mechanics within the Scala ecosystem and the reasoning behind its use. Again, we start with Monoids...

## Free Monoids

A quick refresh on `Monoids`:
{% highlight scala %}
trait Monoid[A] {

  def append(a: A, b: A): A

  def identity: A

}
{% endhighlight %}
There is such a thing as a **Free Monoid**. A `Monoid` is "free" when it's defined in the simplest terms possible and when the `append` method doesn't lose any data in its result.

This is vague, but let's look at some examples:

{% highlight scala %}
class ListConcat[A] extends Monoid[List[A]] {

  def append(a: List[A], b: List[A]): List[A] = a ++ b

  def identity: List[A] = List.empty[A]

}
{% endhighlight %}

`ListConcat` is "free" - we still have the individual elements of each input list after we've concatenated them. We didn't perform any fancier combinations on the elements given other than throwing them together in sequential order ([Integer addition](https://www.krobinson.me/blog/explaining-monads/#examples), on the other hand, defines a special algebra for combining numbers, losing the inputs in the result).

It's also important that we defined `ListConcat` with a generic type `A` - the only operations we can perform on the generic list are the `Monoid` operations (since you don't know anything about its members, if they're Strings, Ints, other complex types, or even functions). This satisfies the "simplest terms possible" clause for free-ness, and gives meaning to this technical explanation of Free Objects:

> Informally, a free object over a set `A` can be thought of as being a "generic" algebraic structure over `A`: the only equations that hold between elements of the free object are those that follow from the defining axioms of the algebraic structure. [^1]

[^1]: [https://en.wikipedia.org/wiki/Free_object](https://en.wikipedia.org/wiki/Free_object)

## So why do we call it "Free"?

> The word "free" is used in the sense of "unrestricted" rather than "zero-cost" [^2]

[^2]: [https://hackage.haskell.org/package/free](https://hackage.haskell.org/package/free)

As we saw in the concatenation example above, the `append` operation just shoves the data together, "free" of interpretation of the contained data.

> But still - why that specific word, "free"? ...[It] is free from any specific interpretation, or free to be interpreted in any way. [^3]

[^3]: [https://softwaremill.com/free-monads/](https://softwaremill.com/free-monads/)

## The Free Monad

Let's think now about what would make a `Monad` "free". We know we want the simplest definition possible, free from interpretation, without losing data.

The `append` definition we used for `Monad` [in the last post](https://www.krobinson.me/blog/explaining-monads/#monads) won’t work, since we lose information about the input functions and essentially create some special return function. Instead, we’re have to concatenate or chain the functions in a list-like structure to preserve the data.

We can illustrate this by building the following types: [^4]

[^4]: [https://github.com/robinske/monad-examples/blob/master/src/main/scala/me/krobinson/Free.scala](https://github.com/robinske/monad-examples/blob/master/src/main/scala/me/krobinson/Free.scala)

{% highlight scala %}
sealed trait Free[F[_], A] { self =>

  def flatMap[B](fn: A => Free[F, B]): Free[F, B] =
    FlatMap(self, (a: A) => fn(a))

  def pure[T](a: T): Free[F, T] = Return(a)

  def map[B](fn: A => B): Free[F, B] =
    flatMap(a => pure(fn(a)))

}

case class Return[F[_], A](given: A) extends Free[F, A]

case class Suspend[F[_], A](fn: F[A]) extends Free[F, A]

case class FlatMap[F[_], A, B](free: Free[F, A], fn: A => Free[F, B]) extends Free[F, B]
{% endhighlight %}

We need these classes (`Return`, `Suspend`, and `FlatMap`) to capture and store the functions as we chain our Free Monads together. Remember, if we want to stay "free" we can't evaluate any of the functions as we're doing this.

Let's build out an example. Here we have a Free Monad for actions on a Todo list:

{% highlight scala %}
sealed trait Todo[A]
case class NewTask[A](task: A) extends Todo[A]
case class CompleteTask[A](task: A) extends Todo[A]
case class GetTasks[A](default: A) extends Todo[A]

def newTask[A](task: A): Free[Todo, A] = Suspend(NewTask(task))

def completeTask[A](task: A): Free[Todo, A] = Suspend(CompleteTask(task))

def getTasks[A](default: A): Free[Todo, A] = Suspend(GetTasks(default))

{% endhighlight %}

You might start to see how we can now encode computations as data and chain the operations together in something like:

{% highlight scala %}
val todos: Free[Todo, Map[String, Boolean]] =
  for {
    _     <- newTask("Go to scala days")
    _     <- newTask("Write a novel")
    _     <- newTask("Meet Tina Fey")
    _     <- completeTask("Go to scala days")
    tasks <- getTasks(default = Map.empty[String, Boolean])
  } yield tsks
{% endhighlight %}

Neat! Now you can chain your functions together using a for-comprehension. Keep in mind that nothing has happened yet. We're "lifting" our actions into the free structures, building up a data structure to be evaluated later. Let's look at the resulting data structure:

{% highlight scala %}
val todosExpanded: Free[Todo, Map[String, Boolean]] =
  FlatMap(
    Suspend(NewTask("Go to scala days")), (a: String) =>
    FlatMap(
      Suspend(NewTask("Write a novel")), (b: String) =>
      FlatMap(
        Suspend(NewTask("Meet Tina Fey")), (c: String) =>
        FlatMap(
          Suspend(CompleteTask("Go to scala days")), (d: String) =>
          Suspend(GetTasks(default = Map.empty))
        )
      )
    )
  )
{% endhighlight %}

Now you can see the "list-like" data structure that is preserving the functions as we chain them together.

#### Hotel California

We've entered the `Monad`, but how do we leave? All of this "free from interpretation" has to come due at some point, and that point is in defining the interpreter(s). These interpreters will evaluate the monad, possibly with side effects, producing the result.

We can define our run function as follows:

{% highlight scala %}
def runFree[F[_], G[_]: Monad, A](f: Free[F, A])(transform: FunctorTransformer[F, G]): G[A] = {
  @annotation.tailrec
  def tailThis(free: Free[F, A]): Free[F, A] = free match {
    case FlatMap(FlatMap(fr, fn1), fn2) => tailThis(fr.flatMap(a1 => fn1(a1).flatMap(a2 => fn2(a2))))
    case FlatMap(Return(a), fn)         => tailThis(fn(a))
    case _                              => free
  }

  val G = Monad[G] // uses implicit objects in constructor

  tailThis(f) match {
    case Return(a)                => G.pure(a)
    case Suspend(fa)              => transform(fa)
    case FlatMap(Suspend(fa), fn) => G.flatMap(transform(fa)){ a => runFree(fn(a))(transform) }
    case _                        => throw new AssertionError("Unreachable")
  }
}
{% endhighlight %}

We use the `FunctorTransformer` to take our input context and transform it into its result. This is what enables us to have a generic run function and define multiple interpretations.

{% highlight scala %}
trait FunctorTransformer[F[_], G[_]] {
  def apply[A](f: F[A]): G[A]
}
{% endhighlight %}

You might also hear this called a `natural transformation` or see it defined using this symbolic operator: `~>`. In the interest of being explicit I called it a functor transformer.

It's important that the transformed functor, `G`, is also a `Monad` so we can use it to flatMap. That's because we want to stop execution in the chain if our transformation "fails".

Here's an example of a test interpreter we can define for our Todo list:
{% highlight scala %}
case object ActionTestInterpreter extends FunctorTransformer[Todo, Id] {
  var actions: List[Todo[String]] = List.empty
  def apply[A](a: Todo[A]): Id[A] = {
    a match {
      case NewTask(task) =>
        actions = actions :+ NewTask(task.toString)
        task
      case CompleteTask(task) =>
        actions = actions :+ CompleteTask(task.toString)
        task
      case GetTasks(default) =>
        actions = actions :+ GetTasks("")
        default
    }
  }
}
{% endhighlight %}

And now we can run this and test against a list of expected actions:

{% highlight scala %}
describe("Free") {
  it("should evaluate todos with an action evaluator") {
    runFree(todos)(ActionTestEvaluator)

    val expected: List[Todo[String]] =
      List(
        NewTask("Go to scala days"),
        NewTask("Write a novel"),
        NewTask("Meet Tina Fey"),
        CompleteTask("Go to scala days"),
        GetTasks("")
      )

    ActionTestEvaluator.actions shouldBe expected
  }
}
{% endhighlight %}

Play around with the code and build your own interpreters using by [forking this repo](https://github.com/robinske/monad-examples).

#### Monads vs. Free Monads
What's the point of using the `Free Monad`? `Monads` have the ability to `flatMap`, so we could compose functions for days to achieve a similar end result.

**1) Stack safety**

Imagine, though, a nested flatMap:
{% highlight scala %}
(1 to 1000).toList.flatMap { i =>
  doSomething(i).flatMap { j =>
    doSomethingElse(j).flatMap { k =>
      doAnotherThing(k).map { l =>
        println(l)
      }
    }
  }
}
{% endhighlight %}

Over the course of your programs you'll build up something similar - you have composed a bunch of functions that are each added to the stack. If your business logic is complicated enough (in this case, maybe the `doSomething` functions are recursive or making `n` additional function calls), you might encounter `StackOverflowError`s.

The `Free Monad`, on the other hand, created a nested, list-like structure that stores all of the functions on the _heap_. The trick is that these then have to be evaluated in a loop (or a tail recursive call).

The tradeoff? Stack for Heap.

**2) Multiple interpreters**

Because we're chaining the data together without any interpretation, we can later define multiple interpreters to handle our Free Monad. This could be something like a [test](https://github.com/robinske/monad-examples/blob/master/src/test/scala/me/krobinson/Spec.scala#L26) and [production](https://github.com/robinske/monad-examples/blob/master/src/main/scala/me/krobinson/FreeExamples.scala#L16) interpreter.

**3) Defer side effects**

We're deferring execution and interpretation by defining the DSL (domain specific language) to represent our data (the Todo list classes). We don't do anything with that until we define and run the interpreters, which means that handling of side effects is deferred until the interpretation stage at the very end.

## With Great Power...

`Free Monads` are a powerful construct, but even with their benefits, we should be judicious in our use of these tools. I get nervous every time I find a "neat" solution in Scala, it usually means there is an easier way. We already have a whole slew of tools (builtin to the language) that give the benefits of `Monads` (composability, side effect management) without the complexity that require blog posts like these to explain. Remember that the [wrong abstraction is dangerous](http://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) and our responsibility as programmers should still be to write reuseable, maintainable code. In short, more [#blueskyscala](https://twitter.com/search?q=%23blueskyscala&src=typd)!

<div class="line"></div>

If you're interested in learning more I talked about this at Scala Days in May, you can watch the video below!

<iframe width="595" height="345" src="https://www.youtube.com/embed/U0lK0hnbc4U" frameborder="0" align="center" marginwidth="0" marginheight="0" style="border:1px solid #CCC; border-width:1px; margin: 0 auto 5px auto; max-width: 100%; display:block;" allowfullscreen></iframe>

<div class="line"></div>

Slides from my Scala Days talk:

<iframe src="//www.slideshare.net/slideshow/embed_code/key/fKRooAbi7ZLXam" width="595" height="485" frameborder="0" align="center" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin: 0 auto 5px auto; max-width: 100%; display:block;" allowfullscreen> </iframe> <div style="margin-bottom:5px; text-align: center;"> <strong> <a href="//www.slideshare.net/KelleyRobinson1/why-the-free-monad-isnt-free-61836547" title="Why The Free Monad isn&#x27;t Free" target="_blank">Why The Free Monad isn&#x27;t Free</a> </strong></div>

<div class="line"></div>

<p class="references" style="margin-bottom: 0;">Notes and references:</p>
