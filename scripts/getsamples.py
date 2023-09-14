#!/bin/env python3

import sys, json

from Bio import Entrez
Entrez.email = "nje5@georgetown.edu"

from xml.etree import ElementTree as ET

studyid = int(sys.argv[1])
bioprjacc = sys.argv[2]
assert bioprjacc.startswith('PRJNA')

handle = Entrez.efetch(id=bioprjacc,db='bioproject')
bioprj = ET.fromstring(handle.read())
handle.close()

# print(ET.tostring(bioprj).decode('utf-8'))

bioprj = bioprj.find('./DocumentSummary/Project')
title = bioprj.find('ProjectDescr/Title').text
name = bioprj.find('ProjectDescr/Name').text
pub = bioprj.find('ProjectDescr/Publication')
if pub:
    pmid = pub.attrib['id']
else:
    pmid = ""

study_templ = """
[study]
studyid: ST%(studyid)04d
name: %(name)s
bioprojectid: %(bprjacc)s
pubmed: %(pubmed)s
organism: Homo sapiens (9606)
chromium version: 
read length:
""".strip()
study_block = study_templ%dict(studyid=int(studyid),
                               name=name,
                               bprjacc=bioprjacc,
                               pubmed=pmid)
print(study_block.strip())
print()

handle = Entrez.elink(dbfrom='bioproject',db='biosample',id=bioprjacc[5:])
result = Entrez.read(handle)
handle.close()

sampleids = set()
for ls in result[0]['LinkSetDb']:
    if ls['LinkName'] == 'bioproject_biosample':
        for item in ls['Link']:
            sampleids.add(int(item['Id']))

sample_tmpl = """
[sample:%(title)s]
name: %(title)s
biosampleid: %(sampleid)s
%(keyvalpairs)s
id:
""".strip()

for sid in sorted(sampleids):
    handle = Entrez.efetch(id=sid,db='biosample')
    sample = ET.fromstring(handle.read())
    handle.close()
    biosample = sample.find('./BioSample')
    # print(ET.tostring(biosample).decode('utf-8'))
    sample_acc = biosample.attrib['accession']
    sample_title = biosample.find('./Description/Title').text
    sample_keyval = {}
    for attr in biosample.findall('./Attributes/Attribute'):
        # print(attr.attrib,attr.text)
        sample_keyval[attr.attrib['attribute_name']] = attr.text
    sample_keyval_str = "\n".join(["%s: %s"%(k,v) for k,v in sorted(sample_keyval.items())])
    sample_block = sample_tmpl%dict(title=sample_title,
                                    sampleid=sample_acc,
                                    keyvalpairs=sample_keyval_str)
    print("\n".join(filter(str.strip, sample_block.splitlines())))
    print()
