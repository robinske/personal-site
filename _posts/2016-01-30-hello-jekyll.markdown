---
layout:    post
title:     "Hello, Jekyll"
date:      2016-01-30
permalink: /posts/:title
tags:      programming meta-blog
active:    "blog"
---

Migrating this site from ~5 static pages to a static site generator took some time, but it will provide enough convenience for updating that it was worth it. This site is now generated using [Jekyll](https://jekyllrb.com/), a Ruby project that takes a handful of text files and transforms them into a fully functioning blog or site without requiring a server to back it up.

Some of the most useful components for me:

* **Templating**

Being able to 'include' the site navigation in all of your files or loop through blog posts to generate a list allow you to stay DRY in the rest of your pages. This saves a lot of time and prevents complexity. 

* **Markdown**

This blog post was written in [Markdown](https://daringfireball.net/projects/markdown/) instead of raw HTML. It's also possible to include `<code>` snippets without manually escaping characters.

* **Environments**

I can now programmatically determine actions based on the environment. This is especially useful for things like file references and linking - in production I want to link to an absolute path for my CSS file, but while developing I want it to be a relative link to my local directory. You can see how I do that [here](https://github.com/robinske/personal-site/blob/master/_includes/head.html#L5).

<div class="line"></div>
