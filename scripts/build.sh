#!/bin/sh

set -x

if [ ! -d ./scripts -o ! -d ./data ]; then
  echo "Please run from root directory"
  exit 1
fi

./scripts/make_catalog.py ./data > ./data/study_catalog.tsv
