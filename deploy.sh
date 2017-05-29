#!/bin/bash

# deploy.sh

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
s3cmd put -r --exclude='blog.html' --exclude='posts/*' _site/ s3://krobinson.me

# deploy blog
s3cmd put _site/blog.html s3://blog.krobinson.me
s3cmd put _site/error.html s3://blog.krobinson.me

# deploy talks
s3cmd put _site/talks.html s3://talks.krobinson.me
s3cmd put _site/error.html s3://blog.krobinson.me

# strip extension so we can serve clean urls
for POST in $(ls -1 _site/posts/); do
    EXT=".html"
    STRIPPED=${POST%$EXT}
    mv "_site/posts/$POST" "_site/posts/$STRIPPED"
done
s3cmd put -r -m text/html _site/posts/ s3://blog.krobinson.me/posts/

export JEKYLL_ENV="development"
