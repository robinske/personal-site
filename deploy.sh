#!/bin/bash

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
echo "Deploying main site..."
s3cmd sync -r --exclude='blog/*' --exclude='posts/*' --exclude='talks/*' ./_site/ s3://krobinson.me

# deploy blog
echo "Deploying blog..."
s3cmd sync -r ./_site/blog/ s3://blog.krobinson.me
echo "Deploying blog posts..."
s3cmd sync -r -m text/html ./_site/posts/ s3://blog.krobinson.me/posts/

# deploy talks
echo "Deploying talks..."
s3cmd sync -r ./_site/talks/ s3://talks.krobinson.me


# This just does a copy, ignore it unless we need it for meow.
# s3cmd sync -m text/html ./_site/error/index.html s3://blog.krobinson.me/error.html
# s3cmd sync -r -m text/html ./_site/error/index.html s3://talks.krobinson.me/error.html


export JEKYLL_ENV="development"
