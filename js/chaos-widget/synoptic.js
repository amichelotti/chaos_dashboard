
var tableborderVisible = 0;
var clist = {};
var dragging = false;
var draggingobj = null;
var syn_opt = null;
var canvas = null;
var canvasState = null;

var nrows = 0;
var ncols = 0;
var ccol=0;
var crow=0;
var currx=0,curry=0;
var last_obj = null;
var dscache={};

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
   currx=event.offsetX - elemLeft;
    curry=event.offsetY - elemTop;
    return { x:currx , y: curry };

}
function draw_all() {
    const ctx = canvas.getContext('2d');
    const ctx2 = canvasState.getContext('2d');

    var encoden = jchaos.encodeName(syn_opt.name);

    canvas.width = $("#synopticImage-" + encoden).width();
    canvas.height = $("#synopticImage-" + encoden).height();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.clearRect(0, 0, canvasState.width, canvasState.height);

    var showid=syn_opt.settings.showid;
    for (var r = 0; r < nrows; r++) {
        for (var c = 0; c < ncols; c++) {
            if ((clist[r][c] != null)) {
                var t = tableToCoord(c, r);
               /* if(!dscache.hasOwnProperty(clist[r][c].object.uid)){
                    dscache[clist[r][c].object.uid]={};
                }
                if(clist[r][c].object.hasOwnProperty('setpoint'))){
                    if(!dscache[clist[r][c].object.hasOwnProperty('input'))
                    ['input']
                }*/
                if(showid){
                    draw_object(ctx, false,t.x, t.y, clist[r][c],null,null, clist[r][c].object.uid);

                } else{
                    draw_object(ctx, false,t.x, t.y, clist[r][c]);
                }
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
function updateObject(obj,fn){
    var ch=4;
    if(obj.object.hasOwnProperty('setpoint')||obj.object.hasOwnProperty('readout')){
        ch=-1;
    }
    jchaos.getChannel(obj.object.uid,ch,(ds)=>{
        if(obj.object.hasOwnProperty('setpoint')){
            for(var k in obj.object.setpoint){
                var val=ds[0]['input'][k];
                if(typeof val === "number"){
                    val=val.toFixed( obj.object.setpoint[k].digit);
                }
                obj.object['setpoint'][k]["value"]=val;
            }
        }
        if(obj.object.hasOwnProperty('readout')){
            for(var k in obj.object.readout){
                var val=ds[0]['output'][k];
                if(typeof val === "number"){
                    val=val.toFixed(obj.object.readout[k].digit);
                }
                obj.object['readout'][k]["value"]=val;
            }
        }
        if(ch==-1){
            obj['runtime']['state']=ds[0]['health'];
        } else {
            obj['runtime']['state']=ds[0];

        }
        fn(obj);
    });

}
function draw_object_state(ctx, obj) {
    var now= Date.now();
    var state=obj['runtime']['state'];
    var color=obj.color;
    if(state.nh_status=="Start" ){
            if((now-state.dpck_ats)<10000){
                if(state.dpck_seq_id&1){
                    if(state.cuh_alarm_lvl){
                        color="red";
                    } else {
                        color="LightGreen";
                    }
                }else {
                    if(state.cuh_alarm_lvl){
                        color="LightRed";
                    } else {
                        color="Green";
                    }
                }
            }
    } else if(state.nh_status=="Stop" ){
            color="orange";
    } else if(state.nh_status=="Init" ){
            color="yellow";
    }
    var x=obj['runtime']['circle'].x;
    var y=obj['runtime']['circle'].y;
    var r=obj['runtime']['circle'].r;
    if(obj['runtime'].hasOwnProperty("error")){

        ctx.clearRect(obj['runtime']['error'].x,obj['runtime']['error'].y,obj['runtime']['error'].width,obj['runtime']['error'].height);
        delete clist[obj.row][obj.col]['runtime']['error'];
    }
    if(state.cuh_alarm_lvl){
        const img = new Image();
        img.onload = function () {
            ctx.drawImage(img, x+r+1, y );
            clist[obj.row][obj.col]['runtime']['error'] = { "x": x+r+1, "y": y, "width": img.width,"height":img.height };

        }
        if(state.cuh_alarm_lvl==1){
            img.src="../img/icon/warning.png";
        } else {
            img.src="../img/icon/error.png"
        }
    } 
    
        ctx.beginPath();
        
        ctx.arc(x, y, r, 2 * Math.PI, false);
        ctx.lineWidth = obj.depth;
        ctx.strokeStyle = color;
        ctx.stroke();
        if(obj.object.hasOwnProperty('setpoint')){
            for(var k in obj.object.setpoint){
                var v=obj.object.setpoint[k];
                const textMetrics = ctx.measureText(v.value);
                ctx.clearRect(x +v.offsetx,y +v.offsety-obj.fontsize,textMetrics.width,obj.fontsize+1);
                if(v.hasOwnProperty("color")){
                    ctx.fillStyle=v.color;
                }
                ctx.fillText(v.value, x+v.offsetx, y +v.offsety);
            }
        }
        if(obj.object.hasOwnProperty('readout')){
            for(var k in obj.object.readout){
                var v=obj.object.readout[k];
                const textMetrics = ctx.measureText(v.value);
                ctx.clearRect(x +v.offsetx,y +v.offsety-obj.fontsize,textMetrics.width,obj.fontsize+1);
                if(v.hasOwnProperty("color")){
                    ctx.fillStyle=v.color;
                }
                ctx.fillText(v.value, x+v.offsetx, y +v.offsety);
            }
        }  
}
function draw_object(ctx, clear,x, y, obj, col, lnd, tex) {
    var name;
    name=obj.object.uid;
    
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
        if(clear&&clist[obj.row][obj.col]['runtime'].hasOwnProperty('circle')){
            ctx.clearRect(x - (r + lndepth), y - (r + lndepth), 2 * (r + lndepth), 2 * (r + lndepth));
        }
        if (clear&&clist[obj.row][obj.col]['runtime'].hasOwnProperty('text')) {
            ctx.clearRect(obj['runtime']['text'].x, obj['runtime']['text'].y - fontsize, obj['runtime']['text'].w, obj['runtime']['text'].h);
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
            clist[obj.row][obj.col]['runtime']['text'] = { "text": text, "x": x - r, "y": y + r + fontsize, "w": textMetrics.width, "h": (fontsize+1) };

        }
        clist[obj.row][obj.col]['runtime']['circle'] = { "x": x, "y": y, "r": r };

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
function checkUnique(name){
    for(var r=0;r<nrows;r++){
        for(var c=0;c<ncols;c++){
            if((clist[r][c]!=null)&&clist[r][c].hasOwnProperty("object")&&clist[r][c].object.uid==name){
                return false;
            }
        }

    }
    return true;
}
function refreshState(){

const ct = canvasState.getContext('2d');


//ct.clearRect(0, 0, canvasState.width, canvasState.height);


console.log("refresh");
for(var r=0;r<nrows;r++){
    for(var c=0;c<ncols;c++){
        if((clist[r][c]!=null)&&(clist[r][c]['runtime'].hasOwnProperty("circle"))){
            updateObject(clist[r][c],(obj)=>{
                draw_object_state(ct,obj);

            });
        }

    }
    }
}
$.fn.buildSynoptic = function (opt) {
    syn_opt = opt;

    this.html(buildSyn(syn_opt));
    var encoden = jchaos.encodeName(opt.name);
    var checkExist = setInterval(function () {
        console.log("Loading..." + opt.name);
        if (($("#synopticImageCanv-" + encoden).length) && ($("#synopticImageCanvState-" + encoden).length)&&($("#synopticImage-" + encoden).length)&&($("#synopticImage-" + encoden).width()>0)&&($("#synopticImage-" + encoden).height()>0)) {
            console.log("Loaded " + opt.name);
            clearInterval(checkExist);


            canvas = document.getElementById("synopticImageCanv-" + encoden);
            canvasState = document.getElementById("synopticImageCanvState-" + encoden);

            const ctx = canvas.getContext('2d');

            if (opt.hasOwnProperty("imgsrc")) {

                canvas.width = $("#synopticImage-" + encoden).width();
                canvas.height = $("#synopticImage-" + encoden).height();
                canvasState.width = $("#synopticImage-" + encoden).width();
                canvasState.height = $("#synopticImage-" + encoden).height();
                if(syn_opt.numRows==-1){
                    syn_opt.numRows= Math.round(canvas.width/opt.cellsizex);
                }
                if(syn_opt.numCols==-1){
                    syn_opt.numCols= Math.round(canvas.height/opt.cellsizey);
                }
                nrows = syn_opt.numRows;
                ncols = syn_opt.numCols;
                console.log("Synoptic grid "+nrows+"x"+ncols);
                var controls = [];
                if (opt.hasOwnProperty("controls")) {
                    controls = opt.controls;
                }
                for (var r = 0; r < nrows; r++) {
                    clist[r] = {};

                    for (var c = 0; c < ncols; c++) {
                        clist[r][c] = null;
                    }
                }
                controls.forEach(ele => {
                    var o = buildDefaultNode(ele);
                
                    clist[ele.row][ele.col] = o;
                });
                draw_all();



                $("#synopticImageCanvState-" + encoden).on("click", (event) => {
                    var obj = checkEventOnObj(event);
                    if (obj != null) {
                        console.log("click on " + obj.object.uid);
                        dragging = false;
                        draggingobj = null;
                        draw_all();

                    }


                });
                $("#synopticImageCanvState-" + encoden).on('dblclick', function (e) {
                    var obj = checkEventOnObj(event);
                    if (obj != null) {
                        console.log("dblclick on " + obj.object.uid);
                        dragging = false;
                        draggingobj = null;
                        var decoded = jchaos.pathToZoneGroupId(obj.object.uid);

                        if(decoded['group']=="CAMERA"){
                            jqccs.showPicture(obj.object.uid, obj.object.uid, 1000);

                        } else {
                            jqccs.openControl(obj.object.uid, obj.object.uid);
                        }

                    }
                });

                $("#synopticImageCanvState-" + encoden).mousedown((event) => {
                    var obj = checkEventOnObj(event);
                    if (obj != null) {
                        console.log("mouse down " + obj.object.uid);
                        draggingobj = obj;
                        dragging = false;
                    }

                });
                $("#synopticImageCanvState-" + encoden).mouseup((event) => {
                    var wasDragging = dragging;
                    dragging = false;
                    if (wasDragging && (draggingobj != null)) {
                        var pos = eventToPos(event);
                        var t = coordToTable(pos.x, pos.y);
                        if ((clist[t.row][t.col] != null)) {
                            if ((draggingobj.object.uid != clist[t.row][t.col].object.uid)) {
                                alert("Cannot drop \"" + draggingobj.object.uid + "\"  here, another element \"" + clist[t.row][t.col].object.uid + "\"");
                            }

//                            draw_all();

                        } else {
                            var oldr = draggingobj.row;
                            var oldc = draggingobj.col;

                            console.log("Dragged " + draggingobj.object.uid + " from:(" + oldc + "," + oldr + ") to:(" + t.col + "," + t.row + ")");
                            draggingobj.col = t.col;
                            draggingobj.row = t.row;
                            clist[t.row][t.col] = draggingobj;
                            clist[oldr][oldc] = null;


                        //    draw_all();
                        }
                        draggingobj = null;
                        draw_all();

                    }


                });
                $("#synopticImageCanvState-" + encoden).mousemove((event) => {

                    var obj = checkEventOnObj(event);

                    if (dragging && (draggingobj != null)) {
                        var pos = eventToPos(event);
                        draggingobj["depth"] = 5;
                        draw_object(ctx,true, pos.x, pos.y, draggingobj);

                    } else {

                        dragging = true;


                        if (obj != null) {
                            console.log("MOVE on:" + obj.object.uid + "(" + obj.col + "," + obj.row + ")");
                            last_obj = obj
                            obj["depth"] = 8;
                            
                            draw_object(ctx,true, obj['runtime']['circle'].x, obj['runtime']['circle'].y, obj,null,null,obj.object.uid );


                        } else {
                            if (last_obj) {
                                last_obj["depth"] = 5;
                                
                                draw_object(ctx, true,last_obj['runtime']['circle'].x, last_obj['runtime']['circle'].y, last_obj);
                            }
                            last_obj=null;
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

                        
                        if (last_obj != null) {
                            cuitem['readout'] = {
                                name: "Add Readout",
                                callback: function (itemKey, opt, e) {
                                    jchaos.getChannel(last_obj.object.uid, 0, function (imdata) {
                                        var readout=[];
                                        for(var k in imdata[0]){
                                            readout.push(k);
                                        }

                                    jqccs.getEntryWindow("Readout", "name", readout, "Create", function (name) {
                                        if(!clist[last_obj.row][last_obj.col]['object'].hasOwnProperty("readout")){
                                            clist[last_obj.row][last_obj.col]['object']['readout']={};
                                        }
                                        var pos=0;
                                        const ctx = canvasState.getContext('2d');
                                        var value=imdata[0][name];
                                        if(typeof value === "number"){
                                            value=value.toFixed(3);
                                        }
                                        const textMetrics = ctx.measureText(value);
                                        
                                        for(var k in clist[last_obj.row][last_obj.col]['object']['setpoint']){
                                            pos+=clist[last_obj.row][last_obj.col].fontsize;
                                        }
                                        var val={
                                            "name":name,
                                                "color":"black",
                                                "value":value,
                                                "row":last_obj.row,
                                                "col":last_obj.col,
                                                "offsetx":last_obj['runtime']['circle'].r+1,
                                                "offsety":-last_obj['runtime']['circle'].r+pos,
                                                "font":last_obj.font,
                                                "digit":3,
                                                "fontsize":last_obj.fontsize

                                            };
                                        console.log("LAST OBJECT:"+JSON.stringi)
                                        clist[last_obj.row][last_obj.col]['object']['readout'][name]=val;
                                        draw_all();
                                        console.log("ADDING Readout"+name);
                                    });
                                });

                                }
                            };
                            cuitem['readout-rm'] = {
                                name: "Remove Readout",
                                callback: function (itemKey, opt, e) {
                                    var readout=[];
                                    for(var k in clist[last_obj.row][last_obj.col]['object']['readout']){
                                        readout.push(k);
                                    }
                                       

                                    jqccs.getEntryWindow("Readout", "name", readout, "Remove", function (name) {
                                        delete clist[last_obj.row][last_obj.col]['object']['readout'][name];
                                        draw_all()
                                        
                                    });
                                }
                            };
                            cuitem['setpoint'] = {
                                name: "Add Setpoint",
                                callback: function (itemKey, opt, e) {
                                    jchaos.getChannel(last_obj.object.uid, 1, function (imdata) {
                                        var readout=[];
                                        for(var k in imdata[0]){
                                            readout.push(k);
                                        }

                                    jqccs.getEntryWindow("SetPoint", "name", readout, "Create", function (name) {
                                        if(!clist[last_obj.row][last_obj.col]['object'].hasOwnProperty("setpoint")){
                                            clist[last_obj.row][last_obj.col]['object']['setpoint']={};
                                        }
                                        const ctx = canvasState.getContext('2d');
                                        var value=imdata[0][name];
                                        if(typeof value === "number"){
                                            value=value.toFixed(3);
                                        }
                                        var pos=0;
                                        const textMetrics = ctx.measureText(value);
                                        
                                        for(var k in clist[last_obj.row][last_obj.col]['object']['setpoint']){
                                            pos+=clist[last_obj.row][last_obj.col].fontsize;
                                        }
                                        var val={
                                            "name":name,
                                                "color":"brown",
                                                "value":imdata[0][name],
                                                "row":last_obj.row,
                                                "col":last_obj.col,
                                                "offsetx":-last_obj['runtime']['circle'].r-1-textMetrics.width,
                                                "offsety":-last_obj['runtime']['circle'].r+pos,
                                                "font":last_obj.font,
                                                "digit":3,
                                                "fontsize":last_obj.fontsize

                                            };
                                        clist[last_obj.row][last_obj.col]['object']['setpoint'][name]=val;
                                        draw_all()

                                        console.log("ADDING Setpoint "+name);
                                    });
                                });

                                }
                                
                            };
                            cuitem['setpoint-rm'] = {
                                name: "Remove Setpoint",
                                callback: function (itemKey, opt, e) {
                                    var readout=[];
                                    for(var k in clist[last_obj.row][last_obj.col]['object']['setpoint']){
                                        readout.push(k);
                                    }
                                       

                                    jqccs.getEntryWindow("Setpoint", "name", readout, "Remove", function (name) {
                                        delete clist[last_obj.row][last_obj.col]['object']['setpoint'][name];
                                        draw_all()
                                        
                                    });
                                }
                            };
                            cuitem['remove'] = {
                                name: "Remove Node",
                                callback: function (itemKey, opt, e) {
                                    // draw_all();
                                    jqccs.confirm("Remove Node", "Do you wanto to remove :" + last_obj.object.uid, "Ok", function () {
                                        clist[last_obj.row][last_obj.col] = null;
                                        draw_all();
                                    });
                                }
                            };
                            cuitem['edit'] = {
                                name: "Edit Node..",
                                callback: function (itemKey, opt, e) {
                                    var row = last_obj.row;
                                    var col = last_obj.col;
                                    var templ = {
                                        $ref: "synoptic-node.json",
                                        format: "tabs"
                                    }
                                    jqccs.jsonEditWindow("Edit "+ last_obj.object.uid, templ, last_obj, function (res) {
                                        clist[row][col] = null;

                                        clist[res.row][res.col] = res;
                                        last_obj = res;
                                        draw_all();
                                    });
                                                                       
                                    // draw_all();
                                }
                            };
                            cuitem['sep2'] = "---------";
                            cuitem['fullctrl'] = {
                                name: "Open Full Control...",
                                callback: function (itemKey, opt, e) {
                                    jqccs.openControl(last_obj.object.uid, last_obj.object.uid);

                                    
                                }
                            };
                            cuitem['desc'] = {
                                name: "Description..",
                                callback: function (itemKey, opt, e) {
                                    var currsel = last_obj.object.uid;
                                    jchaos.node(currsel, "desc", "all", function (data) {

                                        jqccs.showJson("object " + currsel, data);
                                    }, (err) => {
                                        alert("Error:" + JSON.stringify(err));
                                    });
                                }
                            };
                            cuitem['dataset'] = {
                                name: "Dataset..",
                                callback: function (itemKey, opt, e) {
                                    var currsel = last_obj.object.uid;
                                    var dashboard_settings = jqccs.initSettings();

                                    jqccs.showDataset(currsel, currsel, dashboard_settings['generalRefresh']);
                                }
                            };
                        } else {
                            cuitem['add'] = {
                                name: "Add Node",
                                callback: function (itemKey, opt, e) {
                                    var templ = {
                                        $ref: "synoptic-node.json",
                                        format: "tabs"
                                        }
                                    
                                    var p=coordToTable(currx,curry);
                                    if ((clist[p.row][p.col] != null)) {
                                        alert("cannot create a node here");
                                        return;
                                    }
                                    
                                    jqccs.getEntryWindow("Node Name", "name", "<NODE NAME>", "Create", function (name) {
                                        var t={
                                            row:p.row,
                                            col:p.col,
                                            object:{'uid':name,type:"button"}
                                        };
                                        // check if the name exists already
                                        if(checkUnique(name)==false){
                                            alert(name+ " already present in synoptic ");
                                            return;
                                        }  
                                        jchaos.search(name,"ceu",false,function(d){
                                            if(d.length==0){
                                                jqccs.confirm("WARNING", name+" does not exits as CHAOS Node, do you want to create anyway?", "Yes", function () {
                                                    clist[t.row][t.col] = buildDefaultNode(t);
                                                    
                                                },"Cancel");
                                            } else {
                                                clist[t.row][t.col] = buildDefaultNode(t);
    
                                            }
                                            draw_all();
    
                                        });
                                        
                                    });
                                    
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
                console.log("Setting update to:"+syn_opt.settings.generalRefresh);
                setInterval(refreshState,syn_opt.settings.generalRefresh);

            }
        }
    }, 100); //

}
function buildDefaultNode(el){
    var ele={};
    if(el !== undefined){
        ele=el;
    }
    
    var colspan = 1;
    var rowspan = 1;
    var fontsize = 10;
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("fontsize")){
        fontsize=syn_opt.settings.fontsize;
    }

    var font = "Arial";
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("font")){
        font=syn_opt.settings.font;
    }
    var color = "black";
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("color")){
        color=syn_opt.settings.color;
    }
    var depth = 3;
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("depth")){
        depth=syn_opt.settings.depth;
    }
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("colspan")){
        colspan=syn_opt.settings.colspan;
    }
    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("rowspan")){
        rowpan=syn_opt.settings.rowspan;
    }
    
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
    
    ele['runtime'] = {state:{},text:{},circle:{}};

    if(syn_opt.hasOwnProperty("settings")&&syn_opt.settings.hasOwnProperty("showuid")&&syn_opt.settings.showuid){
        ele['runtime']['text']={"text":ele.object['uid']} ;
    }
    return ele;
}
function buildSyn(opt) {
   

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

    
    if (opt.hasOwnProperty("imgsrc")) {
        html += '<div id="insideWrapper-' + encoden + '">';
        html += '<img class="chaos_image" id="synopticImage-' + encoden + '" src="' + opt.imgsrc + '" />';
        html += '<canvas class="coveringCanvas synoptic_menu" style="z-index: 1;" id="synopticImageCanvState-' + encoden + '"/></canvas>';

        html += '<canvas class="coveringCanvas synoptic_menu" style="z-index: 0;" id="synopticImageCanv-' + encoden + '"/></canvas>';

        html += '</div>';
        html += '<div id="info-' + encoden + '"></div>';
    }


    return html;

}


