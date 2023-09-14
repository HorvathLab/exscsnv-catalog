#!/bin/env python3

import sys, os, glob, csv, configparser

headers = list(filter(None,map(str.strip,"""
  studyid
  name
  biosampleid
  organism
  source name
  cell type
  disease
""".splitlines())))

print("\t".join(headers))
for mdf in glob.glob('data/study/*/*_metadata.txt'):
    md = configparser.ConfigParser()
    md.read(mdf)
    study = dict(md.items('study'))
    samples = []
    for sec in md.sections():
        if sec.startswith('sample:'):
            samples.append(sec)
    samples = sorted(set(samples),key=samples.index)
    for s in samples:
        sample = dict(md.items(s))
        row = dict(studyid=study['studyid'],organism=study['organism'])
        for h in headers:
            if h in sample:
                row[h] = sample[h]
            elif h in study:
                row[h] = study[h]
        print("\t".join(map(lambda h: str(row.get(h,"")),headers)))
