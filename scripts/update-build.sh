#!/bin/bash
git checkout gh-pages && git rebase master && webpack && git commit -am 'update build' && echo 'updated'
# && git push -f && git checkout master
