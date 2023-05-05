#!/bin/env python3

import sys, os, glob, csv, configparser
md = configparser.ConfigParser()

headers = """
  studyid
  name
  bioprojectid
  pmid
  organism
  sample_count
""".split()

print("\t".join(headers))
for mdf in glob.glob('data/study/*/*_metadata.tsv'):
    md.read(mdf)
    study = dict(md.items('study'))
    row = {}
    for h in headers:
        if h in study:
            row[h] = study[h]
    row['sample_count'] = len(set(filter(None,map(str.strip,study['sample'].split(',')))))
    print("\t".join(map(lambda h: str(row.get(h,"")),headers)))
