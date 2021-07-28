
/**
 *   {
            "name": "FlameSimulated",
            "description": {
                "imageWidth": 1362,
                "imageHeight": 874,
                "numRows": 29,
                "numCols": 48,
                "Communicator": "http://chaost-hawebui.lnf.infn.it:8081",
                "Controls": [
                    {
                        "row": 14,
                        "col": 46,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMPKOFF",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 16,
                        "col": 46,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMDIP01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 14,
                        "col": 38,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMLNX01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 16,
                        "col": 38,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMLNX02",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 19,
                        "col": 42,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLAFOCUS",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 20,
                        "col": 43,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/MOTOR/ZFOCUS01",
                            "Color": "GreenYellow",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 20,
                        "col": 42,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/MOTOR/VFOCUS01",
                            "Color": "GreenYellow",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 20,
                        "col": 41,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/MOTOR/HFOCUS01",
                            "Color": "GreenYellow",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "out",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "out"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "in",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "in"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 19,
                        "col": 38,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMITF01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 22,
                        "col": 40,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-V2SP",
                            "Color": "DarkGreen",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 23,
                        "col": 39,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-H2SP",
                            "Color": "DarkGreen",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 25,
                        "col": 40,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-V1SP",
                            "Color": "Chartreuse",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 26,
                        "col": 39,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-H1SP",
                            "Color": "Chartreuse",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 25,
                        "col": 42,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-VPAR",
                            "Color": "Green",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 26,
                        "col": 41,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TLI/MOTOR/FLA-HPAR",
                            "Color": "Green",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 28,
                        "col": 45,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TRL/CAMERA/FLMPRB01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 20,
                        "col": 46,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/CAMERA/FLMTHM01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 17,
                        "col": 41,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/ICH/MOTOR/DIPOLE01",
                            "Color": "Green",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "out",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "out"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "in",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "in"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 3,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 18,
                        "col": 22,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/TRL/CAMERA/FLMTRNFF",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 18,
                        "col": 19,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/CMP/CAMERA/FLMCMP02",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 27,
                        "col": 15,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/CMP/CAMERA/FLACMPFF",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 26,
                        "col": 17,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/CMP/CAMERA/FLMCMP01",
                            "Color": "Peru",
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    },
                    {
                        "row": 26,
                        "col": 20,
                        "description": {
                            "Type": "OpenCUButton",
                            "CUName": "TEST/FLAME/CMP/MOTOR/COMPRESS",
                            "Color": "LightGreen",
                            "PredefinedCommands": [
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn ON",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "1"
                                        }
                                    ]
                                },
                                {
                                    "Name": "poweron",
                                    "Description": "Turn on the power of the actuator",
                                    "UniqueID": "Turn OFF",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "on",
                                            "Description": "on state",
                                            "Type": 1,
                                            "Flag": 1,
                                            "InstanceValue": "0"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "out",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "out"
                                        }
                                    ]
                                },
                                {
                                    "Name": "mov_abs",
                                    "Description": "Move from current position to an absolute position",
                                    "UniqueID": "in",
                                    "priority": 0,
                                    "associatedColor": "DarkBlue",
                                    "Parameters": [
                                        {
                                            "Name": "poi",
                                            "Description": "position of interest",
                                            "Type": 4,
                                            "Flag": 0,
                                            "InstanceValue": "in"
                                        }
                                    ]
                                }
                            ],
                            "colSpan": 2,
                            "rowSpan": 1
                        }
                    }
                ]
            }
        },
 */
var tableborderVisible=0;
var clist={};
function draw_circle(context,x,y,r,color){
    context.beginPath();

    context.arc(x, y, r, 2 * Math.PI, false);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
    console.log("circle:("+x+","+y+" r="+r+" color:"+color+")");
}
function draw_circle_text(context,x,y,r,text,color){
    context.beginPath();
    context.arc(x, y, r, 2 * Math.PI, false);
    context.lineWidth = 7;
    context.strokeStyle = color;
    context.stroke();
    context.font = "10px Arial";
    context.fillText(text, x-r,y+r+10 );
    //console.log("circle:("+x+","+y+" r="+r+" color:"+color+")");
}
$.fn.buildSynoptic = function (opt) {
	this.html(buildSyn(opt));
    var encoden=jchaos.encodeName(opt.name);
    const canvas = document.getElementById("synopticImageCanv-" + encoden);
    const ctx = canvas.getContext('2d');

	if(opt.description.hasOwnProperty("imgsrc")){
       
        canvas.width = $("#synopticImage-"+encoden).width();
        canvas.height = $("#synopticImage-"+encoden).height();
      
        var nrows=opt.description.numRows;
	    var ncols=opt.description.numCols;
      //  var width = $(window).width();
//var height = $(window).height();
        for (var r = 0; r < nrows; r++) {
            for (var c = 0; c < ncols; c++) {
                if((clist[r]!==undefined)&&(clist[r][c]!==undefined)){
                    var name=clist[r][c].description.CUName;
                    var decoded = jchaos.pathToZoneGroupId(name);
                    //const image = document.getElementById(decoded["group"] );
                 //   console.log(name+" ("+r+","+c+") "+img.src);

                    const img = new Image();
                    img["cu"]=clist[r][c];
                    img.onload = function() {
                      //  alert(this.width + 'x' + this.height);
                      var x=img["cu"].col*(canvas.width/ncols);
                      var y=img["cu"].row*(canvas.height/nrows);
                      ctx.drawImage(img, x, y);
                      draw_circle(ctx,x+(img.width/2),y+(img.height/2),img.width,"green");
                      clist[img["cu"].row][img["cu"].col]['circle']={"x":x+(img.width/2),"y":y+(img.height/2),"r":img.width};
                      //console.log(img["cu"].description.CUName+" ("+img["cu"].col+","+img["cu"].row+") ("+x+","+ y+") "+img.src);
                    }
                    img.src ="/img/devices/" + decoded["group"] + ".png";
                    img.title=name;
                
            }
        }

    }
    var elemLeft = canvas.offsetLeft + canvas.clientLeft;
    var elemTop =  canvas.offsetTop +  canvas.clientTop;
    $("#synopticImageCanv-" + encoden).on("click",(event)=>{
        //var x = event.pageX- elemLeft;
        //var y = event.pageY- elemTop;
        var x = event.offsetX- elemLeft;
        var y = event.offsetY- elemTop;
        console.log("event on "+x+","+y);
        for (var r = 0; r < nrows; r++) {
            for (var c = 0; c < ncols; c++) {
                if((clist[r]!==undefined)&&(clist[r][c]!==undefined)){
                var objx=clist[r][c]['circle'].x;
                var objy=clist[r][c]['circle'].y;
                var objr=clist[r][c]['circle'].r;
                if(((x>=objx-objr) && x<(objx+objr)) &&((y>=objy-objr) && y<(objy+objr))){
                    console.log("Event on:"+clist[r][c].description.CUName);

                }
            }
        }
        }

    });
    $("#synopticImageCanv-" + encoden).mousemove((event)=>{
         //var y = event.pageY- elemTop;
         var x = event.offsetX- elemLeft;
         var y = event.offsetY- elemTop;
        // console.log("move on "+x+","+y);
        for (var r = 0; r < nrows; r++) {
            for (var c = 0; c < ncols; c++) {
                if((clist[r]!==undefined)&&(clist[r][c]!==undefined)){
                var objx=clist[r][c]['circle'].x;
                var objy=clist[r][c]['circle'].y;
                var objr=clist[r][c]['circle'].r;
                if(((x>=objx-objr) && x<(objx+objr)) &&((y>=objy-objr) && y<(objy+objr))){
                    console.log("MOVE on:"+clist[r][c].description.CUName);
                    if(clist[r][c]['circle'].hasOwnProperty("text")){
                        draw_circle(ctx,objx,objy,objr,"green");

                    } else {
                        clist[r][c]['circle']['text']=clist[r][c].description.CUName;
                        draw_circle_text(ctx,objx,objy,objr,clist[r][c].description.CUName,"green");
                    }


                }
            }
        }
        }
    });
	}
	
}

function buildSyn(opt){
	var html="";
	var encoden="synoptic";
	var width = $(window).width();
  	var height = $(window).height();
	if(opt.hasOwnProperty("name")){
		encoden=jchaos.encodeName(opt.name);
	}
	if(opt.description.hasOwnProperty("imageWidth")){
		width=opt.description.imageWidth;
	}

	if(opt.description.hasOwnProperty("imageHeight")){
		height=opt.description.imageHeight;
	}
	
	var controls=[];
	if(opt.hasOwnProperty("description")&&opt.description.hasOwnProperty("Controls")){
		controls=opt.description.Controls;
	}
	var nrows=opt.description.numRows;
	var ncols=opt.description.numCols;
	controls.forEach(ele=>{
		clist[ele.row]={};
		clist[ele.row][ele.col]=ele;
	});
    if(opt.description.hasOwnProperty("imgsrc")){
		html += '<div id="insideWrapper-'+encoden+'">';
		html += '<img class="chaos_image" id="synopticImage-' + encoden + '" src="'+opt.description.imgsrc+'" />';
		html += '<canvas class="coveringCanvas" id="synopticImageCanv-' + encoden + '"/></canvas>';
		html += '</div>';
		html += '<div id="info-' + encoden + '"></div>';
    }
	/*if(opt.description.hasOwnProperty("imgsrc")){
      
	   html += '<div id="insideWrapper-'+encoden+'" style="width:'+width+'px; height:'+height+'px; background-repeat: no-repeat; background-size:cover; background-image:url(\''+opt.description.imgsrc+'\'")>';
        
       html += '<table  class="syn_table" >';
		for (var r = 0; r < nrows; r++) {
			html += '<tr style="height:'+Math.trunc(height/(nrows))+'px;">';		
			for (var c = 0; c < ncols; c++) {
			//	html += '<td class="syn_td">';
                html += '<td style="width:'+Math.trunc(width/ncols)+'px; height:'+Math.trunc(height/(nrows))+'px;">';

				if((clist[r]!==undefined)&&(clist[r][c]!==undefined)){
                    var name=clist[r][c].description.CUName;
                    var decoded = jchaos.pathToZoneGroupId(name);
					var icon_name = "/img/devices/" + decoded["group"] + ".png";

                    html+='<input class="syn_input" type="image" src="'+icon_name+'" title="'+name+'"/>';

					//html+=clist[r][c].description.CUName;
				}
				html += '</td>';


			}
			html += '</tr>';		

		}
        html += '</table></div>';		

	}*/
		  


	return html;

}
class OpenCUButton extends HTMLButtonElement
{
	constructor() 
	{
		HTMLButtonElement();
		this.CUName="ciao";
	}
}

function myFunction( name)
{
	
	let dims="height=300,width=420";
	var gg= window.open("",name,dims);
	gg.document.title=name;
	
	
}




function MakeSinoptic()
{

//Reading from DB
jchaos.setOptions({"uri":"chaost-hawebui.lnf.infn.it"+":8081","socketio":"chaost-hawebui.lnf.infn.it"+":4000"});
var syn=jchaos.variable("WindowsSynoptics","get").synopticList[3];
//Setting useful variables
var Iheight=syn.description.imageHeight;
var Iwidth=syn.description.imageWidth;
var Wheight=Iheight+20;
var Wwidth=Iwidth+20;
var numRows= syn.description.numRows;
var numCols= syn.description.numCols;
var urlImg="data:image/png;base64,"+syn.description.FRAMEBUFFER.binary.base64  ;
var Controls= syn.description.Controls;

//CREATING THE NEW WINDOW

var strdim="height="+Wheight+",width="+Wwidth;
var SynWin = window.open("", syn.name, strdim);
	var head = "";
	
	//head+= "<script type=\"text/javascript\" src=\"../js/jquery-3.5.1.min.js\"></script>";
    //head += "<script type=\"text/javascript\" src=\"../js/chaos-widget/chaos-ctrl.js\"></script>";

SynWin.document.write("<head>"+head+"</head><body id = \"body\" style = \"text-align:center;\"><table id = \"syn\"></table></body>");
SynWin.document.title=syn.name;
//creating style element
var style = document.createElement('style');
style.type = 'text/css';
SynWin.document.getElementsByTagName('head')[0].appendChild(style);

//CREATING TABLE
var table=SynWin.document.getElementById('syn');


for (var rw=0; rw < numRows; rw++)
{
	
	let row =table.insertRow();
	for (let col=0; col < numCols; col++)
	{
		let cell = row.insertCell();
		cell.id = rw+"_"+col;
		//var td= SynWin.document.getElementById("11_12").appendChild(btn);
	}
}
table.style.width=Iwidth + "px";
table.style.height=Iheight+"px";
var pxCellH = Math.floor(Iheight / numRows);


//styling the table class;
var lll="border-spacing:0;table-layout: fixed; background-size:"+Iwidth + "px "+Iheight+"px; ";
var bs=".cssClass {"+ lll+" background-repeat: no-repeat; background-image: url("+urlImg+");}" ;
style.innerHTML = bs.replace(/\n/g, '');
 
table.className = 'cssClass';
table.border = tableborderVisible;



var tdstyle="td {align:center; line-height:"+pxCellH+"px; overflow: hidden; border-spacing: 0;margin: 0; padding: 0; }";
var  cssButtons=".btn { background-color: Peru; border-radius: 50%; border-width: 0px; margin:0px 0px; height:70%; width: 70%; }"; 
style.innerHTML+=cssButtons + tdstyle ;



for (var i=0; i < Controls.length;++i)
{
  var item = Controls[i];
  var auxiliaryCss="";
	if (item.description.Type == "OpenCUButton")
	{
		let ctrl = document.createElement('button');
		
		
		let strID = item.row+"_"+item.col;
		let secClass= "B"+strID;
		let cssDescr= ".B"+strID+" { background-color: " +item.description.Color+ ";}";
		ctrl.className = "btn "+secClass;
		ctrl.title=item.description.CUName;
		auxiliaryCss+=cssDescr;
		
		//ctrl.setAttribute("onclick",function(){myFunction(ctrl.title)});
		ctrl.addEventListener('click', function(){myFunction(ctrl.title)});
		//alert("appending child "+ctrl.title);
	    SynWin.document.getElementById(strID).appendChild(ctrl);
	}
	style.innerHTML+=auxiliaryCss;
}

}
