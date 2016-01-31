#!/bin/bash

# deploy.sh

rm -rf _site/
export JEKYLL_ENV="production"
jekyll build

# deploy main site
s3cmd put -r _site/ s3://krobinson.me
s3cmd del s3://krobinson.me/blog.html
s3cmd del -r s3://krobinson.me/posts/

# deploy blog
s3cmd put _site/blog.html s3://blog.krobinson.me
s3cmd put _site/error.html s3://blog.krobinson.me
s3cmd put -r _site/posts/ s3://blog.krobinson.me/posts/

# strip extension so we can serve clean urls
for POST in `ls _site/posts/`; do
    EXT=".html"
    STRIPPED=${POST%$EXT}
    s3cmd mv s3://blog.krobinson.me/posts/$POST s3://blog.krobinson.me/posts/$STRIPPED
done

export JEKYLL_ENV="development"
