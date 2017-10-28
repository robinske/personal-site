#!/bin/bash

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
s3cmd put -r --exclude='blog/*' --exclude='posts/*' --exclude='talks/*' _site/ s3://krobinson.me

# deploy blog
s3cmd sync -r _site/blog s3://blog.krobinson.me
s3cmd sync -r _site/error s3://blog.krobinson.me
s3cmd sync -r -m text/html _site/posts/ s3://blog.krobinson.me/posts/

# deploy talks
s3cmd sync -r _site/talks s3://talks.krobinson.me
s3cmd sync -r _site/error s3://blog.krobinson.me


export JEKYLL_ENV="development"
