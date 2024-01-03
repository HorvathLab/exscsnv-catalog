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
    readme = os.path.join(os.path.split(mdf)[0],'README.md')
    wh = open(readme,'wt')
    wh.write('''
## %(studyid)s: %(name)s

<div id="study_table" class="d3table" d3table_data="%(studyid)s_metadata.json" d3table_cols="../../study_details.col"></div>

### Samples

<div id="sample_table" class="d3table" d3table_data="%(studyid)s_metadata.json" d3table_cols="../../study_sample.col"></div>

### Single-Cell Expressed SNVs

<div id="variant_table" class="d3table" d3table_data="%(studyid)s_sceSNV.tsv" d3table_cols="../../study_variants.col"></div> 
'''%study)
    wh.close()
