#!/bin/bash

gem install jekyll

rm -rf _site/
JEKYLL_ENV="production" jekyll build

# deploy main site
echo "Deploying main site..."
s3cmd sync -r --access_key="$AWS_ACCESS_KEY" --secret_key="$AWS_SECRET_KEY" --exclude='blog/*' --exclude='posts/*' --exclude='talks/*' ./_site/ s3://krobinson.me

# deploy blog
echo "Deploying blog..."
s3cmd sync -r --access_key="$AWS_ACCESS_KEY" --secret_key="$AWS_SECRET_KEY" ./_site/blog/ s3://blog.krobinson.me
echo "Deploying blog posts..."
s3cmd sync -r --access_key="$AWS_ACCESS_KEY" --secret_key="$AWS_SECRET_KEY" -m text/html ./_site/posts/ s3://blog.krobinson.me/posts/

# deploy talks
echo "Deploying talks..."
s3cmd sync -r --access_key="$AWS_ACCESS_KEY" --secret_key="$AWS_SECRET_KEY" ./_site/talks/ s3://talks.krobinson.me

export JEKYLL_ENV="development"
