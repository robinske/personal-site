---
layout:    post
title:     "Hello, Jekyll"
date:      2016-01-29
permalink: /posts/:title
tags:      programming meta-blog
references: www.google.com www.twitter.com
---

In my programming career so far, I've spent most of my time lurking behind the scenes - working with data, APIs, and infrastructure. Very little of my time has been dedicated to making websites look the way they do. Before this week I didn't know the difference between a [CSS class and id selector.](https://css-tricks.com/the-difference-between-id-and-class/)

Welcome to the results of my learning - my personal site! (style was adapted, code was original). Right now it's pure HTML and CSS - no frameworks or syntatic sugar.

I made the site responsive since mobile is the new black or whatever. An interesting hiccup I encountered: **viewport**. Turns out that Apple decided they wanted a default viewing experience on iPhone to be a full-size desktop site, so it sets the default window to a zoomed-out 980px.

The solution: using the [viewport meta tag](https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html). Your media queries will be useless unless your header contains the following:

{% highlight html %}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
{% endhighlight %}

<div class="line"></div>
<p class="references" style="margin-bottom: 0;">References:</p>
<ul class="references">
  <li><a href="http://webdesign.tutsplus.com/tutorials/quick-tip-dont-forget-the-viewport-meta-tag--webdesign-5972">http://webdesign.tutsplus.com/tutorials/quick-tip-dont-forget-the-viewport-meta-tag--webdesign-5972</a></li>
  <li><a href="https://stackoverflow.com/questions/13002731/responsive-design-media-query-not-working-on-iphone">https://stackoverflow.com/questions/13002731/responsive-design-media-query-not-working-on-iphone</a></li>
  <li><a href="https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html">https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html</a></li>
</ul>
