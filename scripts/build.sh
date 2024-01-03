#!/bin/sh

set -x

if [ ! -d ./scripts -o ! -d ./data ]; then
  echo "Please run from root directory"
  exit 1
fi

./scripts/make_catalog.py ./data > ./data/study_catalog.tsv
./scripts/make_samples.py ./data > ./data/sample_catalog.tsv
./scripts/make_study_json.py ./data
./scripts/make_study_readme ./data
