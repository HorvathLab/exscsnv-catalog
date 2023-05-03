
"use strict";

let d3table = {
    init: function() {
        var elts = document.getElementsByClass('d3table');
        for (var i=0; i<elts.length; i++) {
            var elt = elts[i];
            var dataurl = elt.getAttribute('data');
            var colsurl = elt.getAttribute('cols');
            var t = new D3Table(elt, dataurl, colsurl);
	}
    }
}

function D3Table(elt,dataurl,colsurl) {
    this.dataurl = dataurl;
    this.colsurl = colsurl;
    this.thetable = null;
    this.value = null;
    if (this.elt) {
        this.divid = elt.getAttribute('id');
        this.tableid = this.divid + "-thetable";
        var datatype = dataurl.substring(dataurl.lastIndexOf(".")+1).toLowerCase();
        var parser = d3.json;
        if (datatype == "tsv") {
            parser = d3.tsv;
        } else if (datatype == "csv") {
            parser = d3.csv;
        }
        dataurl = dataurl +"?random=" + Math.random();
        colsurl = dataurl +"?random=" + Math.random();
        parser(dataurl, function(data) {
            d3.json(colsurl, function(columns) {
                var table = elt.append("table")
                               .attr("id",this.tableid)
		               .attr("class","ExcelTable2007")
		               .attr("style","table-layout:fixed;")
                var thead = table.append("thead");
                var tbody = table.append("tbody").attr("class","list");

                thead.append("tr")
                     .selectAll("th")
                     .data(columns)
                     .enter()
                     .append("th")
	             .attr("align","center")
	             .attr("valign","bottom")
	             .attr("width",function(column) {
	                 if (column.width !== undefined) {
	                     return column.width;
                         }
	                 return null;
                     })
	             .attr("class",function(column) {
	                 if (column.oddeven !== undefined && column.oddeven) {
	                     return "mysort oddeven";
                         } 
	                 return "mysort";
                     })
	             .attr("data-sort",function(column) { return column.tag; })
	             .attr("data-type",function(column) { 
                         if (column.type == "extid") {
                             if (column.idtype == "int") {
                               return "urlint"
                             } else {
                               return "url"
                             }
                         } else {
                             return column.type;
                         }
                     })
                     .text(function(column) { return column.label; });
            });
        });
    }
}
D3Table.prototype = new D3Table();
D3Table.prototype.constructor = D3Table;
