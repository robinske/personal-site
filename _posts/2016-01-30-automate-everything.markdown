---
layout:    post
title:     "Automate Everything"
date:      2016-01-30
tags:      programming meta-blog
comments:  true
active:    "blog"
---

It's pretty easy to [host a static site on Amazon](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html), all you have to do is copy files to an S3 bucket, update a couple of properties on the bucket, and voila! You can upload files via the GUI, but it's relatively time consuming and definitely repetitive. Naturally there is an easier way.

I wrote the following [script](https://github.com/robinske/personal-site/blob/master/deploy.sh) to deploy my site in one step. It manages the environments, jekyll build, and copying of files in one step. It even removes the extensions from my blog posts so that I have cleaner URL paths.

{% highlight bash %}
#!/bin/bash

# deploy.sh

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
s3cmd put -r --exclude='blog.html' --exclude='posts/*' _site/ s3://krobinson.me

# deploy blog
s3cmd put _site/blog.html s3://blog.krobinson.me
s3cmd put _site/error.html s3://blog.krobinson.me

# strip extension so we can serve clean urls
for POST in $(ls -1 _site/posts/); do
    EXT=".html"
    STRIPPED=${POST%$EXT}
    mv "_site/posts/$POST" "_site/posts/$STRIPPED"
done
s3cmd put -r -m text/html _site/posts/ s3://blog.krobinson.me/posts/

export JEKYLL_ENV="development"
{% endhighlight %}

All you have to do is `chmod +x deploy.sh` and then you can deploy your site with `./deploy.sh`.

I have a love/hate relationship with bash, but in this case it was the right tool for the job - grouping a bunch of CLI operations into a single command.
<div class="line"></div>
