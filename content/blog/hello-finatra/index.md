---
layout:    post
title:     "Hello Finatra - An Introduction to Giter8 Templates"
date:      2018-07-17
tags:      programming
comments:  true
active:    "blog"
---

[Giter8 templates](http://www.foundweekends.org/giter8/) are an amazing tool for spinning up new Scala projects quickly. I recently [created a template](https://github.com/robinske/hello-finatra.g8/blob/master/README.markdown) for a lightweight [Finatra](https://github.com/twitter/finatra) API.

Check out the template on my GitHub: [https://github.com/robinske/hello-finatra.g8](https://github.com/robinske/hello-finatra.g8)

## Giter8 Templates

> Giter8 is a command line tool to generate files and directories from templates published on Github or any other git repository. It’s implemented in Scala and runs through the sbt launcher, but it can produce output for any purpose.

You can learn more about how to create your own templates [in their documentation](http://www.foundweekends.org/giter8/template.html).

## Using the Hello Finatra template

Requirements:

* [Java JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [SBT](https://www.scala-sbt.org/download.html), I’m using version 0.13.6

In a terminal window type:

```bash
sbt new robinske/hello-finatra.g8
```

You can name your project anything you like, but avoid using numbers or dashes.

![image](https://user-images.githubusercontent.com/3673341/39088781-36029586-456d-11e8-9940-28fa04a7bfed.png)

## Running 'Hello World'

Navigate into your directory, in my case:

```bash
cd finatra_demo
```

Then run using SBT:

```bash
sbt run
```

Finatra will start on [port 8888](http://localhost:8888/hello?name=Kelley).

Hooray!

## Next Steps

I originally built this so that I could have a way to [respond to incoming SMS messages with Twilio and Scala](https://www.twilio.com/blog/2018/04/responding-to-incoming-text-messages-with-scala-and-finatra.html). Check out that post on the Twilio blog if you want to build on this example.
