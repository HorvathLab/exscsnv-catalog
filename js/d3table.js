
"use strict";

let d3table = {
    init: function() {
        var elts = document.getElementsByClassName('d3table');
        for (var i=0; i<elts.length; i++) {
            var elt = elts[i];
            var divid = elt.getAttribute('id');
            var dataurl = elt.getAttribute('data');
            var colsurl = elt.getAttribute('cols');
            var t = new D3Table(divid, dataurl, colsurl);
	}
    }
}

function D3Table(divid,dataurl,colsurl) {
    if (divid!==undefined) {
        this.divid = divid;
        this.tableid = this.divid + "-thetable";
        this.dataurl = dataurl;
        this.colsurl = colsurl;
        this.thetable = null;
        this.value = null;
        var datatype = dataurl.substring(dataurl.lastIndexOf(".")+1).toLowerCase();
        var parser = d3.json;
        if (datatype == "tsv") {
            parser = d3.tsv;
        } else if (datatype == "csv") {
            parser = d3.csv;
        }
        var dataurl1 = this.dataurl +"?random=" + Math.random();
        var colsurl1 = this.colsurl +"?random=" + Math.random();
        console.log(this);
        var self = this;
        parser(dataurl1, function(data) {
            d3.json(colsurl1, function(columns) {
                var table = d3.select('#'+self.divid)
                              .append("table")
                              .attr("id",self.tableid)
		              .attr("class","ExcelTable2007")
		              .attr("style","table-layout:fixed;")
                              .attr("width",(window.innerWidth-50)+"px");
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
