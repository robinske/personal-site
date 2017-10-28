#!/bin/bash

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
s3cmd put -r --exclude='blog.html' --exclude='posts/*' --exclude='talks.html' _site/ s3://krobinson.me

# deploy blog
s3cmd sync _site/blog.html s3://blog.krobinson.me
s3cmd sync _site/error.html s3://blog.krobinson.me
s3cmd sync -r -m text/html _site/posts/ s3://blog.krobinson.me/posts/

# deploy talks
s3cmd sync _site/talks.html s3://talks.krobinson.me
s3cmd sync _site/error.html s3://blog.krobinson.me


export JEKYLL_ENV="development"
