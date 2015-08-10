#!/bin/bash
# Commit fails if nothing to commit.
git checkout gh-pages && git rebase master && webpack && git commit -am 'update build' && git push -f && git checkout master
