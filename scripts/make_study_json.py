#!/bin/env python3

import sys, os, glob, configparser, json

for mdf in glob.glob('data/study/*/*_metadata.txt'):
    md = configparser.ConfigParser()
    md.read(mdf)
    study = dict(md.items('study'))
    samples = []
    for sec in md.sections():
        if sec.startswith('sample:'):
            samples.append(sec)
    samples = sorted(set(samples),key=samples.index)
    study['samples'] = []
    for s in samples:
        study['samples'].append(dict(md.items(s)))
    mdj = mdf.replace('.txt','.json')
    wh = open(mdj,'wt')
    wh.write(json.dumps(study,indent=2))
    wh.close()
