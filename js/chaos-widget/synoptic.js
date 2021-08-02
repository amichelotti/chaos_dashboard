
var tableborderVisible = 0;
var clist = {};
var dragging = false;
var draggingobj = null;
var syn_opt = null;
var canvas = null;
var nrows = 0;
var ncols = 0;

function coordToTable(x, y) {

    if (ncols == 0 || nrows == 0) {
        alert("Invalid Table");
    }
    return { col: Math.round((ncols * (x / canvas.width))), row: Math.round((nrows * (y / canvas.height))) };
}
function tableToCoord(col, row) {

    if (ncols == 0 || nrows == 0) {
        alert("Invalid Table");
    }
    return { x: Math.round((canvas.width * (col / ncols))), y: Math.round((canvas.height * (row / nrows))) };
}
function checkEventOnObj(event) {
    var p = eventToPos(event);
    for (var r = 0; r < nrows; r++) {
        for (var c = 0; c < ncols; c++) {
            if ((clist[r][c] != null) && (clist[r][c]['runtime']['circle'] !== undefined)) {
                var objx = clist[r][c]['runtime']['circle'].x;
                var objy = clist[r][c]['runtime']['circle'].y;
                var objr = clist[r][c]['runtime']['circle'].r;
                if (((p.x >= objx - objr) && p.x < (objx + objr)) && ((p.y >= objy - objr) && p.y < (objy + objr))) {
                    return clist[r][c];
                }
            }
        }
    }
    return null;
}
function eventToPos(event) {
    var elemLeft = canvas.offsetLeft + canvas.clientLeft;
    var elemTop = canvas.offsetTop + canvas.clientTop;
    return { x: event.offsetX - elemLeft, y: event.offsetY - elemTop };

}
function draw_all() {
    const ctx = canvas.getContext('2d');
    var encoden = jchaos.encodeName(syn_opt.name);

    canvas.width = $("#synopticImage-" + encoden).width();
    canvas.height = $("#synopticImage-" + encoden).height();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var r = 0; r < nrows; r++) {
        for (var c = 0; c < ncols; c++) {
            if ((clist[r][c] != null)) {
                var t = tableToCoord(c, r);
                draw_object(ctx, t.x, t.y, clist[r][c]);
            }


        }

    }

}
function getSynoptic() {
    var ret = syn_opt;
    ret['controls'] = [];
    for (var r = 0; r < nrows; r++) {
        for (var c = 0; c < ncols; c++) {
            if ((clist[r][c] != null)) {
                var newObj = Object.assign({}, clist[r][c]);
                delete newObj['runtime'];
                ret['controls'].push(newObj);
            }
        }
    }
    return ret;

}
function draw_object(ctx, x, y, obj, col, lnd, tex) {
    var name = obj.description.uid;
    var decoded = jchaos.pathToZoneGroupId(name);
    var imgsrc = "/img/devices/" + decoded["group"] + ".png"
    var lndepth = 3;
    var color = "black";
    var text = "";
    var colspan = 1;
    var rowspan = 1;
    var fontsize = 10;
    var font = "Arial";
    var imgsizex = 0, imgsizey = 0;
    if (obj.hasOwnProperty("color")) {
        color = obj['color'];
    }
    if (obj.hasOwnProperty("depth")) {
        lndepth = obj['depth'];
    }
    if (typeof col == "string") {
        color = col;
    }

    if (typeof lnd == "number") {
        lndepth = lnd;
    }

    if (typeof tex === "string") {
        text = tex;
    }
    if (obj.hasOwnProperty("img")) {
        imgsrc = obj.img;
    }
    if (obj.hasOwnProperty("colspan")) {
        colspan = obj.colspan;
    }
    if (obj.hasOwnProperty("rowspan")) {
        rowspan = obj.rowspan;
    }
    if (obj.hasOwnProperty("fontsize")) {
        fontsize = obj.fontsize;
    }
    if (obj.hasOwnProperty("font")) {
        font = obj.font;
    }
    const img = new Image();
    img.onload = function () {
        ctx.beginPath();


        //  alert(this.width + 'x' + this.height);
        imgsizex = img.width * colspan;

        imgsizey = img.height * rowspan;

        var r = (imgsizex > imgsizey) ? imgsizex : imgsizey;
        ctx.clearRect(x - (r + lndepth), y - (r + lndepth), 2 * (r + lndepth), 2 * (r + lndepth));
        if (clist[obj.row][obj.col]['runtime'].hasOwnProperty('text')) {
            ctx.clearRect(obj['runtime']['text'].x, obj['runtime']['text'].y - fontsize, obj['runtime']['text'].w, obj['text'].h);
            delete clist[obj.row][obj.col]['runtime']['text'];
        }
        ctx.arc(x, y, r, 2 * Math.PI, false);
        ctx.lineWidth = lndepth;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.font = fontsize + "px " + font;
        ctx.drawImage(img, x - Math.round(imgsizex / 2), y - Math.round(imgsizey / 2), imgsizex, imgsizey);
        if (text.length) {
            ctx.fillText(text, x - r, y + r + fontsize);
            const textMetrics = ctx.measureText(text);
            //console.log("METRICS:"+JSON.stringify(textMetrics));
            clist[obj.row][obj.col]['runtime']['text'] = { "text": text, "x": x - r, "y": y + r + fontsize, "w": textMetrics.width, "h": fontsize };

        }
        clist[obj.row][obj.col]['runtime']['circle'] = { "x": x, "y": y, "r": r };

        //console.log(img["cu"].description.uid+" ("+img["cu"].col+","+img["cu"].row+") ("+x+","+ y+") "+img.src);
    }
    img.src = imgsrc;
    img.title = name;

}
function draw_circle(context, x, y, r, color) {
    context.beginPath();

    context.arc(x, y, r, 2 * Math.PI, false);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
    console.log("circle:(" + x + "," + y + " r=" + r + " color:" + color + ")");
}
function draw_circle_text(context, x, y, r, text, color) {
    context.beginPath();
    context.arc(x, y, r, 2 * Math.PI, false);
    context.lineWidth = 7;
    context.strokeStyle = color;
    context.stroke();
    context.font = "10px Arial";
    context.fillText(text, x - r, y + r + 10);
    //console.log("circle:("+x+","+y+" r="+r+" color:"+color+")");
}
$.fn.buildSynoptic = function (opt) {
    this.html(buildSyn(opt));
    var encoden = jchaos.encodeName(opt.name);
    syn_opt = opt;
    var checkExist = setInterval(function () {
        console.log("Loading..." + opt.name);
        if (($("#synopticImageCanv-" + encoden).length) && ($("#synopticImage-" + encoden).length)) {
            console.log("Loaded " + opt.name);
            clearInterval(checkExist);


            canvas = document.getElementById("synopticImageCanv-" + encoden);
            const ctx = canvas.getContext('2d');

            if (opt.hasOwnProperty("imgsrc")) {

                canvas.width = $("#synopticImage-" + encoden).width();
                canvas.height = $("#synopticImage-" + encoden).height();

                nrows = opt.numRows;
                ncols = opt.numCols;

                draw_all();



                $("#synopticImageCanv-" + encoden).on("click", (event) => {
                    var obj = checkEventOnObj(event);
                    if (obj != null) {
                        console.log("click on " + obj.description.uid);
                    }


                });
                $("#synopticImageCanv-" + encoden).mousedown((event) => {
                    var obj = checkEventOnObj(event);
                    if (obj != null) {
                        console.log("mouse down " + obj.description.uid);
                        draggingobj = obj;
                        dragging = false;
                    }

                });
                $("#synopticImageCanv-" + encoden).mouseup((event) => {
                    var wasDragging = dragging;
                    dragging = false;
                    if (wasDragging && (draggingobj != null)) {
                        var pos = eventToPos(event);
                        var t = coordToTable(pos.x, pos.y);
                        if ((clist[t.row][t.col] != null)) {
                            if ((draggingobj.description.uid != clist[t.row][t.col].description.uid)) {
                                alert("Cannot drop \"" + draggingobj.description.uid + "\"  here, another element \"" + clist[t.row][t.col].description.uid + "\"");
                            }

                            draw_all();

                        } else {
                            var oldr = draggingobj.row;
                            var oldc = draggingobj.col;

                            console.log("Dragged " + draggingobj.description.uid + " from:(" + oldc + "," + oldr + ") to:(" + t.col + "," + t.row + ")");
                            draggingobj.col = t.col;
                            draggingobj.row = t.row;
                            clist[t.row][t.col] = draggingobj;
                            clist[oldr][oldc] = null;


                            draw_all();
                        }
                        draggingobj = null;


                    }


                });
                var last_obj = null;
                $("#synopticImageCanv-" + encoden).mousemove((event) => {

                    var obj = checkEventOnObj(event);

                    if (dragging && (draggingobj != null)) {
                        var pos = eventToPos(event);
                        draggingobj["depth"] = 5;
                        draw_object(ctx, pos.x, pos.y, draggingobj);

                    } else {

                        dragging = true;


                        if (obj != null) {
                            console.log("MOVE on:" + obj.description.uid + "(" + obj.col + "," + obj.row + ")");
                            last_obj = obj
                            obj["depth"] = 8;
                            draw_object(ctx, obj['runtime']['circle'].x, obj['runtime']['circle'].y, obj);


                        } else {
                            if (last_obj) {
                                last_obj["depth"] = 5;

                                draw_object(ctx, last_obj['runtime']['circle'].x, last_obj['runtime']['circle'].y, last_obj);
                            }

                        }
                    }




                });

                $.contextMenu('destroy', '.synoptic_menu');
                $.contextMenu({
                    selector: '.synoptic_menu',
                    zIndex: 10000,
                    build: function ($trigger, e) {
                        var cuitem = {};
                        dragging = false;
                        draggingobj = null;

                        cuitem['add'] = {
                            name: "Add",
                            callback: function (itemKey, opt, e) {
                                // draw_all();
                            }
                        };
                        if (last_obj != null) {
                            cuitem['remove'] = {
                                name: "Remove",
                                callback: function (itemKey, opt, e) {
                                    // draw_all();
                                    jqccs.confirm("Remove Node", "Do you wanto to remove :" + last_obj.description.uid, "Ok", function () {
                                        clist[last_obj.row][last_obj.col] = null;
                                        draw_all();
                                    });
                                }
                            };
                            cuitem['edit'] = {
                                name: "Edit..",
                                callback: function (itemKey, opt, e) {
                                    var row = last_obj.row;
                                    var col = last_obj.col;
                                    jqccs.editJSON("Edit " + last_obj.description.uid, last_obj, (res) => {
                                        clist[row][col] = null;

                                        clist[res.row][res.col] = res;
                                        last_obj = res;
                                        draw_all();
                                    });

                                    // draw_all();
                                }
                            };
                            cuitem['sep2'] = "---------";

                            cuitem['desc'] = {
                                name: "Description..",
                                callback: function (itemKey, opt, e) {
                                    var currsel = last_obj.description.uid;
                                    jchaos.node(currsel, "desc", "all", function (data) {

                                        jqccs.showJson("Description " + currsel, data);
                                    }, (err) => {
                                        alert("Error:" + JSON.stringify(err));
                                    });
                                }
                            };
                            cuitem['dataset'] = {
                                name: "Dataset..",
                                callback: function (itemKey, opt, e) {
                                    var currsel = last_obj.description.uid;
                                    var dashboard_settings = jqccs.initSettings();

                                    jqccs.showDataset(currsel, currsel, dashboard_settings['generalRefresh']);
                                }
                            };
                        }
                        cuitem['sep3'] = "---------";
                        cuitem['refresh'] = {
                            name: "Refresh",
                            callback: function (itemKey, opt, e) {
                                draw_all();
                            }
                        };
                        cuitem['savedb'] = {
                            name: "Save " + syn_opt.name,
                            callback: function (itemKey, opt, e) {
                                jchaos.variable("synoptics", "get", null, function (synoptic) {
                                    if (!(synoptic instanceof Object)) {
                                        synoptic = {};

                                    }
                                    var syn = getSynoptic();
                                    synoptic[syn.name] = syn;
                                    jchaos.variable("synoptics", "set", synoptic, function (ok) {
                                        jqccs.instantMessage("Saved " + syn.name, "OK", 3000, true);

                                    });
                                }, (bad) => {
                                    jqccs.instantMessage("Cannot retrive " + syn.name, JSON.stringify(bad), 2000, false);

                                });


                            }
                        };
                        cuitem['save'] = {
                            name: "Save Synoptic on Local File",
                            callback: function (itemKey, opt, e) {
                                var syn = getSynoptic();
                                jqccs.getEntryWindow("Save to Disk", "Synoptic Name", syn.name, "Save", function (name) {
                                    syn['name'] = name;
                                    var blob = new Blob([JSON.stringify(syn)], { type: "json;charset=utf-8" });
                                    saveAs(blob, name + ".synoptic.json");
                                });
                                // draw_all();
                            }
                        };




                        cuitem['sep2'] = "---------";

                        cuitem['quit'] = {
                            name: "Quit", icon: function () {
                                return 'context-menu-icon context-menu-icon-quit';
                            }

                        };


                        return {
                            items: cuitem
                        }
                    }

                });
            }
        }
    }, 100); //

}

function buildSyn(opt) {
    const colspan = 1;
    const rowspan = 1;
    const fontsize = 10;
    const font = "Arial";
    const color = "black";
    const depth = 3;

    var html = "";
    var encoden = "synoptic";
    var width = $(window).width();
    var height = $(window).height();
    if (opt.hasOwnProperty("name")) {
        encoden = jchaos.encodeName(opt.name);
    }
    if (opt.hasOwnProperty("imageWidth")) {
        width = opt.imageWidth;
    }

    if (opt.hasOwnProperty("imageHeight")) {
        height = opt.imageHeight;
    }

    var controls = [];
    if (opt.hasOwnProperty("controls")) {
        controls = opt.controls;
    }
    nrows = opt.numRows;
    ncols = opt.numCols;
    for (var r = 0; r < nrows; r++) {
        clist[r] = {};

        for (var c = 0; c < ncols; c++) {
            clist[r][c] = null;
        }
    }
    controls.forEach(ele => {
        if (!ele.hasOwnProperty("color")) {
            ele['color'] = color;
        }
        if (!ele.hasOwnProperty("font")) {
            ele['font'] = font;
        }
        if (!ele.hasOwnProperty("fontsize")) {
            ele['fontsize'] = fontsize;
        }
        if (!ele.hasOwnProperty("depth")) {
            ele['depth'] = depth;
        }
        if (!ele.hasOwnProperty("colspan")) {
            ele['colspan'] = colspan;
        }
        if (!ele.hasOwnProperty("rowspan")) {
            ele['rowspan'] = rowspan;
        }
        ele['runtime'] = {};
        clist[ele.row][ele.col] = ele;
    });
    if (opt.hasOwnProperty("imgsrc")) {
        html += '<div id="insideWrapper-' + encoden + '">';
        html += '<img class="chaos_image" id="synopticImage-' + encoden + '" src="' + opt.imgsrc + '" />';
        html += '<canvas class="coveringCanvas synoptic_menu" id="synopticImageCanv-' + encoden + '"/></canvas>';
        html += '</div>';
        html += '<div id="info-' + encoden + '"></div>';
    }


    return html;

}
class OpenCUButton extends HTMLButtonElement {
    constructor() {
        HTMLButtonElement();
        this.uid = "ciao";
    }
}

function myFunction(name) {

    let dims = "height=300,width=420";
    var gg = window.open("", name, dims);
    gg.document.title = name;


}




function MakeSinoptic() {

    //Reading from DB
    jchaos.setOptions({ "uri": "chaost-hawebui.lnf.infn.it" + ":8081", "socketio": "chaost-hawebui.lnf.infn.it" + ":4000" });
    var syn = jchaos.variable("WindowsSynoptics", "get").synopticList[3];
    //Setting useful variables
    var Iheight = syn.description.imageHeight;
    var Iwidth = syn.description.imageWidth;
    var Wheight = Iheight + 20;
    var Wwidth = Iwidth + 20;
    var numRows = syn.description.numRows;
    var numCols = syn.description.numCols;
    var urlImg = "data:image/png;base64," + syn.description.FRAMEBUFFER.binary.base64;
    var Controls = syn.description.Controls;

    //CREATING THE NEW WINDOW

    var strdim = "height=" + Wheight + ",width=" + Wwidth;
    var SynWin = window.open("", syn.name, strdim);
    var head = "";

    //head+= "<script type=\"text/javascript\" src=\"../js/jquery-3.5.1.min.js\"></script>";
    //head += "<script type=\"text/javascript\" src=\"../js/chaos-widget/chaos-ctrl.js\"></script>";

    SynWin.document.write("<head>" + head + "</head><body id = \"body\" style = \"text-align:center;\"><table id = \"syn\"></table></body>");
    SynWin.document.title = syn.name;
    //creating style element
    var style = document.createElement('style');
    style.type = 'text/css';
    SynWin.document.getElementsByTagName('head')[0].appendChild(style);

    //CREATING TABLE
    var table = SynWin.document.getElementById('syn');


    for (var rw = 0; rw < numRows; rw++) {

        let row = table.insertRow();
        for (let col = 0; col < numCols; col++) {
            let cell = row.insertCell();
            cell.id = rw + "_" + col;
            //var td= SynWin.document.getElementById("11_12").appendChild(btn);
        }
    }
    table.style.width = Iwidth + "px";
    table.style.height = Iheight + "px";
    var pxCellH = Math.floor(Iheight / numRows);


    //styling the table class;
    var lll = "border-spacing:0;table-layout: fixed; background-size:" + Iwidth + "px " + Iheight + "px; ";
    var bs = ".cssClass {" + lll + " background-repeat: no-repeat; background-image: url(" + urlImg + ");}";
    style.innerHTML = bs.replace(/\n/g, '');

    table.className = 'cssClass';
    table.border = tableborderVisible;



    var tdstyle = "td {align:center; line-height:" + pxCellH + "px; overflow: hidden; border-spacing: 0;margin: 0; padding: 0; }";
    var cssButtons = ".btn { background-color: Peru; border-radius: 50%; border-width: 0px; margin:0px 0px; height:70%; width: 70%; }";
    style.innerHTML += cssButtons + tdstyle;



    for (var i = 0; i < Controls.length; ++i) {
        var item = Controls[i];
        var auxiliaryCss = "";
        if (item.description.Type == "OpenCUButton") {
            let ctrl = document.createElement('button');


            let strID = item.row + "_" + item.col;
            let secClass = "B" + strID;
            let cssDescr = ".B" + strID + " { background-color: " + item.description.Color + ";}";
            ctrl.className = "btn " + secClass;
            ctrl.title = item.description.uid;
            auxiliaryCss += cssDescr;

            //ctrl.setAttribute("onclick",function(){myFunction(ctrl.title)});
            ctrl.addEventListener('click', function () { myFunction(ctrl.title) });
            //alert("appending child "+ctrl.title);
            SynWin.document.getElementById(strID).appendChild(ctrl);
        }
        style.innerHTML += auxiliaryCss;
    }

}
