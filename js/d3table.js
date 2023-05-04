
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
    },
    htmlescape: function(unsafe) {
        return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
    }
};

function D3Table(divid,dataurl,colsurl) {
    if (divid!==undefined) {
        this.divid = divid;
        this.tableid = this.divid + "-thetable";
        this.dataurl = dataurl;
        this.colsurl = colsurl;
        this.thetable = null;
        this.value = null;
        this.border = 20;
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
                              .attr("width","100%;");
                var thead = table.append("thead");
                var tbody = table.append("tbody").attr("class","list");

                thead.append("tr")
		     .attr("class","ExcelTable2007")
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

                //
                var rows = tbody.selectAll("tr")
                                .data(data)
                                .enter()
                                .append("tr")
                                .attr("class","rowshow");
                //
                var cells = rows.selectAll("td")
                                .data(function(row,i) {
                                    return columns.map(function(column) {
		                        return {column: column, value: row[column.tag], row: row};
                                    });
                                })
                                .enter()
                                .append("td")
	                        .attr("align",function(d) { 
	                            if (d.column.align !== undefined) {
	                                return d.column.align;
                                    }
	                            return "left";
	                        })
	                        .attr("valign","top")
	                        .attr("class",function (d) {
	                            return d.column.tag; 
	                        })
                                .html(function(d) { 
	                            if (d.column.type == "float" && d.column.fixed !== undefined) {
	                                return parseFloat(d.value).toFixed(d.column.fixed);
                                    } else if (d.column.type == "extid" && d.column.exturl !== undefined) {
	                                return "<A href="+d.column.exturl+d.value+" target=\"_blank\">"+d.value+"</A>";
                                    } else if (d.column.type == "img" && d.column.imgurl !== undefined) {
	                                url = d.column.imgurl.replace(/{}/g, d.value);
		                        var height = ""
		                        if (d.column.height !== undefined) {
		                            height = " height=\""+d.column.height+"\"";
		                        }
		                        if (d.column.width !== undefined) {
		                            width = " width=\""+d.column.width+"\"";
		                        }
		                        if (d.column.caption !== undefined) {
		                            return "<P align=\"center\"><IMG style=\"margin: 10px;\" src=\""+url+"\""+height+width+" loading=\"lazy\" ><br/>"+d.value+"</P>";
		                        }
                                        if (d.column.exturl !== undefined) {
                                            var exturl = d.column.exturl.replace(/{}/g, d.row[d.column.exturltag]);
	                                    return "<A href=\""+exturl+"\" target=\"_blank\"><IMG src=\""+url+"\""+height+width+" loading=\"lazy\" ></A>";
                                        }
	                                return "<IMG src=\""+url+"\""+height+width+" loading=\"lazy\" >";
                                   };
	                           return d.value; 
	                       });

            });
        });
    }
}
D3Table.prototype = new D3Table();
D3Table.prototype.constructor = D3Table;
