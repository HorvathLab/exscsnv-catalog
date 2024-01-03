
function init() {
  let currenturl = String(window.location.pathname);
  currenturl = currenturl.replace(/^[\/]+/,'');
  currenturl = currenturl.replace(/[\/]+$/,'');
  currenturl = currenturl.split('/');
  if (currenturl[currenturl.length-1] == "index.html") {
      currenturl.pop()
  }
  if (currenturl[currenturl.length-1] == "test.html") {
      currenturl.pop()
  }
  if (currenturl[0] == "") {
      currenturl.pop()
  }
  while (currenturl.includes('scesnv-catalog')) {
      currenturl.shift();
  }
  if (currenturl.length == 0) {
      console.log("landing");
      initlanding();
  } else if (currenturl[0] == 'data' && currenturl[1] == "study") {
      let studyid = currenturl[2];
      console.log(studyid);
      initstudy(studyid);
  }
}

function initlanding() {
  let studytable = document.getElementById('study_table');
  var t = new d3table.D3Table(studytable);
  // let sampletable = document.getElementById('sample_table');
  // var t = new d3table.D3Table(sampletable);
}

function initstudy(studyid) {
  let studydetails = document.getElementById('study_table');
  var t = new d3table.D3Table(studydetails,{'transform': studytrans, 'headers': false, 'paged': false, 'width': null})
  let sampletable = document.getElementById('sample_table');
  var t = new d3table.D3Table(sampletable,{'sort': 'biosampleid', 'transform': samptrans, 'indices': true, 'rowindex': rowindex, 'paged': false});
  let varianttable = document.getElementById('variant_table');
  let params = {
      'transform': vartrans,
      'indices': true,
      'sort': 'SNV'
  };
  var t = new d3table.D3Table(varianttable,params);
}

function studytrans(data,callback) {
    let colmap = {};
    for (let i in this.columns) {
	colmap[this.columns[i].tag] = this.columns[i];
	this.columns[i].index = i;
    }
    let newdata = [];
    let studyid = data['studyid'];
    data['metadata'] = 'Download';
    data['variants'] = 'Download';
    data['nsamples'] = data['samples'].length;
    for (let k of Object.keys(data)) {
	if (colmap[k]) {
	    if (colmap[k].type == 'extid' && colmap[k].exturl) {
		let url = colmap[k].exturl;
		if (url.includes("%%%studyid%%%") || url.includes('%%%value%%%')) {
		    url = url.replace("%%%studyid%%%",studyid);
		    url = url.replace("%%%value%%%",data[k]);
                } else {
		    url = url + data[k];
                }
		let value = "<A href=\""+url+"\">"+data[k]+"</A>";
		newdata.push({'key':"<b>"+colmap[k].label+"</b>",'value':value,'index':colmap[k].index});
	    } else {
		newdata.push({'key':"<b>"+colmap[k].label+"</b>",'value':data[k],'index':colmap[k].index});
            }
	}
    }
    newdata.sort(function (a,b) {
	return a['index'] - b['index'];
    });
    this.columns = [{'tag': 'key', 'align': 'right', 'cssclass': 'rowindex', 'width': '120px', 'oddeven': true}, {'tag': 'value', 'textwrap': true}];
    callback(newdata);
}

function rowindex(i) {
  return "S"+(i.toString());
}

function samptrans(data,callback) {
  rows = data['samples'];
  validtags = new Set();
  for (let r of rows) {
    for (let k of Object.keys(r)) {
      if (r[k] && r[k].trim()) {
	  validtags.add(k);
      }
    }
  }
  for (let r of rows) {
    for (let t of validtags) {
	if (!r[t] && data[t]) {
	    r[t] = data[t];
	}
    }
  }
  for (let i=this.columns.length-1;i>=0;i--) {
    let c = this.columns[i];
    if (!validtags.has(c.tag)) {
      this.columns.splice(i,1);
    }
  }
  callback(rows);
}

function vartrans(data,callback) {
    let thethis = this;
    let mdurl = this.dataurl.replace('sceSNV.tsv','metadata.json');
    let ready = false;
    d3.json(mdurl,function(md) {
	let allsamples = []
	for (let s of md['samples']) {
	    allsamples.push(s['biosampleid']);
	}
	allsamples.sort();
	for (let row of data) {
	    for (let key of ['polyPhen','keggPathway','genomesESP','aminoAcid','geneList','accession','rsID']) {
		if (row[key] == "unknown" || row[key] == "none" || row[key] == "0") {
		    row[key] = "";
		}
	    }
            let wt2var = row['SNV'].split('_')[1].split('>');
            let locus = row['SNV'].split('_')[0];
            row['locus'] = locus;
            let wtcnt = 0;
            let varcnt = 0;
            for (let al of row['genomesESP'].split('/')) {
                let ali = al.split('=');
                if (ali[0] == wt2var[0]) {
                    wtcnt = parseInt(ali[1]);
                } else if (ali[0] == wt2var[1]) {
                    varcnt = parseInt(ali[1]);
                }
            }
            if (varcnt > 0 || wtcnt > 0) {
                row['vaf'] = (varcnt/(varcnt+wtcnt)).toString();
            } else {
                row['vaf'] = "";
            }
	}
	goodsamples = new Set();
	for (let i=data.length-1;i>=0;i--) {
            let row = data[i];
	    let samples = row['Samples'].split(';');
	    let cnts = row['N_cells'].split(';');
	    for (let s of allsamples) {
		row[s] = '0';
	    }
	    let cnt = 0;
	    let seen = new Set();
	    for (let i=0; i<samples.length; i++) {
		if (!seen.has(samples[i]) && allsamples.includes(samples[i]) && parseInt(cnts[i]) > 0) {
		    row[samples[i]] = cnts[i];
		    cnt += 1;
		    seen.add(samples[i]);
		    goodsamples.add(samples[i]);
		}
	    }
            if (cnt == 0) {
                data.slice(i,1);
            } else {
	        row['N_samples'] = cnt;
            }
	}
	let newrows = [];
	for (let i=0; i<data.length; i++) {
	    let row = data[i];
	    if (row['geneList'].includes(';')) {
		genes = row['geneList'].split(';');
		for (let j=1;j<genes.length;j++) {
		    let newrow = { ...row };
		    newrow['geneList'] = genes[j];
		    newrows.push(newrow);
		}
		row['geneList'] = genes[0];
	    }
	}
	data.push.apply(data, newrows);
	data.sort(function (a,b) { return locuscmp(a['SNV'],b['SNV']); });
	goodsamples = Array.from(goodsamples);
	goodsamples.sort();
	for (let i in goodsamples) {
	    thethis.columns.push({'tag': allsamples[i], 'label': "S"+(parseInt(i)+1).toString(), 'type': 'int', 'align': 'right', 'searchable': true, 'sortable': true, 'width': "50px"});
	}
	thethis.columns[0].compare = locuscmp;
	callback(data);
    });
}

function locuscmp(a,b) {
  if (a === undefined) {
    if (b === undefined) {
      return 0;
    } else {
      return 1;
    }
  } else if (b == undefined) {
    return -1;
  }
  let achr = a.split(':')[0];
  let bchr = b.split(':')[0];
  if (achr != bchr) {
    if (!isNaN(parseInt(achr))) {
      if (!isNaN(parseInt(bchr))) {
	return parseInt(achr) - parseInt(bchr);
      } else {
        return -1;
      }
    } else if (!isNaN(parseInt(bchr))) {
      return 1;
    } else {
      return achr.localeCompare(bchr);
    }
  }
  let apos = a.split(':')[1].split('_')[0];
  let bpos = b.split(':')[1].split('_')[0];
  if (apos != bpos) {
    return parseInt(apos) - parseInt(bpos);
  }
  return a.localeCompare(b);
}
