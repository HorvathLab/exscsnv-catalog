#!/bin/env python3

import sys, os, glob, csv, configparser
md = configparser.ConfigParser()

headers = list(filter(None,map(str.strip,"""
  studyid
  name
  biosampleid
  organism
  source name
  cell type
""".splitlines())))

print("\t".join(headers))
for mdf in glob.glob('data/study/*/*_metadata.tsv'):
    md.read(mdf)
    study = dict(md.items('study'))
    samples = map(str.strip,study['sample'].split(','))
    samples = sorted(set(samples),key=samples.index)
    for s in samples:
        sample = dict(md.items('sample:%s'%(s,)))
        row = dict(studyid=study['studyid'],organism=study['organism'])
        for h in headers:
            if h in sample:
                row[h] = sample[h]
        print("\t".join(map(lambda h: str(row.get(h,"")),headers)))
