#!/bin/sh

set -x

if [ ! -d ./scripts -o ! -d ./data ]; then
  echo "Please run from root directory"
  exit 1
fi

./scripts/make_catalog.py ./data > ./data/study_catalog.tsv
./scripts/make_samples.py ./data > ./data/sample_catalog.tsv
for d in data/study/ST*; do
  ( cd $d; make_index_html.sh )
done
