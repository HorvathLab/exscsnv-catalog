#!/bin/env python3

import sys, os, glob, csv, configparser

headers = """
  studyid
  name
  bioprojectid
  pmid
  organism
  sample_count
""".split()

print("\t".join(headers))
for mdf in glob.glob('data/study/*/*_metadata.txt'):
    md = configparser.ConfigParser()
    md.read(mdf)
    study = dict(md.items('study'))
    row = {}
    for h in headers:
        if h in study:
            row[h] = study[h]
    sample_count = 0
    for sec in md.sections():
        if sec.startswith('sample:'):
            sample_count += 1
    row['sample_count'] = sample_count
    print("\t".join(map(lambda h: str(row.get(h,"")),headers)))
