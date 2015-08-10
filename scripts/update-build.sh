#!/bin/bash
git checkout gh-pages && git rebase master && webpack && git add -f ./build/app.js && git commit -am 'update build' && git push -f && git checkout master
