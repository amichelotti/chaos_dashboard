
/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function ($) {

    // library jquery chaos control studio
    var jqccs = {};
    var json_editor;
    var dashboard_settings = null;
    var interface;
    var cu_copied = {};
    var us_copied = {};
    var algo_copied;
    var save_obj;
    var snap_selected = "";
    var node_selected = "";
    var pather_selected = "";
    var options;
    var cu_name_to_saved = []; // cuname saved state if any
    var node_list_interval; // update interval of the CU list
    var node_list_check; // update interval for CU check live
    var main_dom;
    var last_index_selected = -1;
    var active_plots = [];
    var trace_selected;
    var trace_list = [];
    var high_graphs; // highchart graphs
    var eu_process;
    var graph_selected;
    var search_string;
    var notupdate_dataset = 1;
    var implementation_map = { "powersupply": "SCPowerSupply", "motor": "SCActuator", "camera": "RTCamera", "BPM": "SCLibera" };
    var hostWidth = 640;
    var hostHeight = 640;
    function GetURLParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }
    jqccs.getSettings = function () {
        return dashboard_settings;
    }
    function getInterfaceFromClass(impl_class) {
        for (var key in implementation_map) {
            if (impl_class.includes(implementation_map[key])) {
                return key;
            }
        };
        return null;
    }

    function removeElementByName(name, tlist) {
        for (var cnt = 0; cnt < tlist.length; cnt++) {
            if (tlist[cnt].name == name) {
                tlist.splice(cnt, 1);
                return;
            }
        }
        return;
    }

    function replaceElementByName(name_dst, elemsrc, tlist) {
        for (var cnt = 0; cnt < tlist.length; cnt++) {
            if (tlist[cnt].name == name_dst) {
                tlist[cnt] = elemsrc
                return;
            }
        }
        return;
    }

    function convertToCSV(json) {
        return json;
    }

    function string2buffer(str) {
        var buf = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            buf[i] = str.charCodeAt(i);
        }
        return buf.buffer;
    }
    jqccs.convertBinaryToArrays=function(obj){
        return convertBinaryToArrays(obj);
    }
    function convertBinaryToArrays(obj) {

        if (obj.hasOwnProperty("$binary")) {
            var objtmp;
            var type = obj.$binary.subType;
            if (type == "84") {
                // integers
                var binary_string = atob(obj.$binary.base64);
                if ((binary_string.length % 4) != 0) {
                    binary_string = binary_string.substring(0, binary_string.length - (binary_string.length % 4));
                }
                //  if ((binary_string.length % 4) == 0) {
                var arrbuf = string2buffer(binary_string);
                var arr = new Int32Array(arrbuf);
                objtmp = Array.prototype.slice.call(arr);
                //  }
            } else if (type == "86") {

                var binary_string = atob(obj.$binary.base64);
                if ((binary_string.length % 8) == 0) {

                    var arr = new Float64Array(string2buffer(binary_string));
                    objtmp = Array.prototype.slice.call(arr);
                }
            } else {
                objtmp = obj;
            }
            return objtmp;
        }

        for (var k in obj) {
            if (obj[k] instanceof Object) {
                obj[k] = convertBinaryToArrays(obj[k]);
            }

        }
        return obj;
    }

    function getElementByName(name, tlist) {
        for (var cnt = 0; cnt < tlist.length; cnt++) {
            if (tlist[cnt].name == name) {
                return tlist[cnt];
            }
        }
        return null;
    }
    /*
    function progressBar(msg,id,lab){
      var instant = $('<div id='+id+'></div>').progressbar({
        value:false,
        open: function () {
       
        },
        complete: function() {
         // $(this).dialog("close");
        }
  
     }).dialog({ 
        title: msg,
        position: "top",
        

      })
    }*/
    function saveAsBinary(binary_string, name) {
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }

        var blob = new Blob([bytes], { type: "application/octet-stream" });
        saveAs(blob, name);
    }

    function progressBar(msg, id, lab) {
        var progressbar;
        var instant = $('<div></div>').html('<div id="' + id + '"><div class="progress-label">' + lab + '</div></div>').dialog({

            title: msg,
            position: "top",
            open: function () {
                progressbar = $("#" + id)
                var progressLabel = $(".progress-label");
                progressbar.progressbar({
                    value: false,
                    /*    change: function () {
                          var val = progressbar.progressbar("value");
                          progressLabel.text(val + "%");
                        },*/
                    complete: function () {
                        $(this).parent().dialog("close");
                    }
                });
            },
            close: function () {
                $(this).remove();
            }
        });
    }
    jqccs.getFile = function (msghead, msg, handler) {
        return getFile(msghead, msg, handler);
    }
    function getFile(msghead, msg, handler) {
        var instant = $('<div></div>').html('<div><p>' + msg + '</p></div><div><input type="file" id="upload-file" class="col-md-3" /></div>').dialog({
            width: 680,
            height: 400,
            title: msghead,
            position: "center",
            open: function () {
                $(this).css("opacity", 0.5);
                var main = $(this);
                $('#upload-file').on('change', function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        try {
                            var json = JSON.parse(e.target.result);
                            handler(json);
                        } catch (err) {
                            var obj = {};
                            obj['name'] = $('#upload-file').val();
                            obj['data'] = e.target.result;
                            handler(obj);
                        }

                        $(main).dialog("close").remove();
                    };
                    reader.readAsText(this.files[0]);

                });
            },
            buttons: [{
                text: "Close",
                click: function (e) {
                    $(this).dialog("close").remove();

                }
            }]
        });
    }

    function openControl(msg, tmpObj, cutype, refresh) {
        var newObj = Object.assign({}, tmpObj);
        var html = '<div><div id="specific-table-ctrl"></div>';
        html += '<div id="specific-control-ctrl"></div></div>';
        newObj.template = "ctrl";
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        changeView(newObj, cutype, function (newObj) {
            var nintervals = 0;
            var orginal_list = [];
            var instant = $(html).dialog({
                minWidth: hostWidth / 2,
                minHeight: hostHeight / 4,
                title: msg,
                position: "center",
                resizable: true,
                buttons: [{
                    text: "close",
                    click: function (e) {
                        $(this).dialog('close');


                    }
                }


                ],
                close: function (event, ui) {
                    //var last_interval = setInterval(function () { }, 100000);
                    /*for (var i = nintervals; i <= last_interval; i++) {
                      clearInterval(i);
                    }*/
                    if ((newObj.node_list_interval != null)) {
                        console.log(name + " CLOSING interval:" + newObj.node_list_interval);

                        clearInterval(newObj.node_list_interval);
                    }
                    $(this).remove();
                    /*        var interface = $("#classe option:selected").val();
                            console.log("restoring view :" + interface);
        
                            buildCUPage(tmpObj, implementation_map[interface], "cu");
                            */
                },
                open: function () {
                    nintervals = setInterval(function () { }, 100000); // Get a reference to the last
                    // interval +1
                    orginal_list = node_list;
                    console.log(name + " OPEN control interval:" + nintervals);
                    newObj.elems = newObj.node_multi_selected;
                    newObj.node_list_interval = null;
                    updateInterface(newObj);

                }
            });
        });
    }

    function showJson(msg, json, tmpObj) {
        var name = jchaos.encodeName(msg);
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var instant = $('<div id=desc-' + name + '></div>').dialog({
            minWidth: hostWidth / 4,
            minHeight: hostHeight / 4,
            title: msg,
            resizable: true,
            buttons: [{
                text: "save",
                click: function (e) {
                    var blob = new Blob([JSON.stringify(json)], { type: "json;charset=utf-8" });
                    saveAs(blob, name + ".json");
                }
            },
            {
                text: "close",
                click: function (e) {
                    $("#desc-" + name).dialog('close');
                }
            }


            ],
            close: function (event, ui) {

                $(this).remove();
            },
            open: function () {
                console.log(msg + " description");
                //   $("#desc-"+name).width(hostWidth/4);
                //  $("#desc-"+name).height(hostHeight/4);
                var jsonhtml = json2html(json, options, null);
                if (jchaos.isCollapsable(json)) {
                    jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
                }
                $("#desc-" + name).html(jsonhtml);
                jsonSetup($(this), tmpObj);
                $(".json-toggle").trigger("click");
                $(this).before($(this).parent().find('.ui-dialog-buttonpane'));

            }
        });
    }
    jqccs.showScript = function (msghead, group, type, handler, actions) {
        return showScript(msghead, group, type, handler, actions);
    }
    function showScript(msghead, group, type, handler, actions) {
        var name = "script-" + (new Date()).getTime();
        var opt = {
            _name_: name,
            minWidth: hostWidth / 2,
            minHeight: hostHeight / 2,
            title: msghead,
            resizable: true,
            dialogClass: 'no-close',
            buttons: [
                {
                    text: "close",
                    click: function (e) {
                        $(this).dialog("close");

                    }
                }
            ],

            open: function () {
                jchaos.search("", "script", false, function (l) {
                    var scripts = {};
                    var scripts_flat = {}
                    if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)) {
                        var list_algo = l['found_script_list'];
                        list_algo.forEach(function (p) {
                            if ((typeof type === "string") && (type != "")) {
                                if (p['eudk_script_language'] != type) {
                                    return;
                                }
                            }
                            if ((typeof group === "string") && (group != "")) {
                                if (p.hasOwnProperty("script_group")) {
                                    if ((p["script_group"] != "ALL") && (p["script_group"] != group)) {
                                        return;
                                    }
                                } else {
                                    return;
                                }
                            }
                            var group_name = "ALL";
                            if (p["script_group"] != "") {
                                group_name = p["script_group"];
                            }
                            var encoden = jchaos.encodeName(p.script_name);
                            delete p._id;
                            if (p.seq > 0) {
                                p['date'] = jchaos.getDateTime(p.seq);
                            }
                            var sgroup = "";
                            if ((typeof group === "string") && (p.hasOwnProperty("script_group"))) {
                                if ((group != "")) {
                                    if (p.script_group == group) {
                                        sgroup = group;
                                    }
                                } else {
                                    sgroup = p.script_group;

                                }
                            }
                            if (sgroup != "") {
                                if (scripts.hasOwnProperty(sgroup)) {
                                    scripts[sgroup][encoden] = p;

                                } else {
                                    scripts[sgroup] = {};
                                    scripts[sgroup][encoden] = p;

                                }
                                scripts_flat[encoden] = p;

                            }

                        });
                    }
                    var jsonhtml = json2html(scripts, { collapsed: true }, "");
                    $("#" + name).html(jsonhtml);
                    if (typeof handler === "function") {
                        handler($("#" + name), scripts_flat);
                    }

                });
            }
        }
        if ((typeof actions !== "undefined") && (actions instanceof Array)) {
            opt.buttons = actions.concat(opt.buttons);

        }
        createCustomDialog(opt);

    }
    /*   var instant = $('<div id=dataset-' + name + '></div>').dialog({
           minWidth: hostWidth / 4,
           minHeight: hostHeight / 4,
           closeOnEscape: true,
           title: msghead,
           resizable: true,
           buttons: [ 
           {
               text: "save",
               click: function (e) {
                   var blob = new Blob([JSON.stringify(last_dataset)], { type: "json;charset=utf-8" });
                   saveAs(blob, name + ".json");
               }
           },
           {
               text: "close",
               click: function (e) {
                   // var interval=$(this).attr("refresh_time");
                   $("#dataset-" + name).dialog('close');

               }
           }


           ],
           close: function (event, ui) {

               $(this).remove();
           },
         
           
       });
   }*/
    function showDataset(msghead, cuname, refresh, tmpObj) {
        var update;
        var started = 0;
        var stop_update = false;
        var showformat = 0;
        var showdataset = 8;
        var vardir = "";
        var last_dataset = {};
        var name = jchaos.encodeName(cuname);
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var instant = $('<div id=dataset-' + name + '></div>').dialog({
            minWidth: hostWidth / 4,
            minHeight: hostHeight / 4,
            closeOnEscape: true,
            title: msghead,
            resizable: true,
            buttons: [{
                text: "Update",
                id: 'dataset-update-' + name,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    stop_update = !stop_update;
                    if (stop_update) {
                        // $('#dataset-update-' + name).text("Update");
                        $(e.target).text("Update");
                    } else {
                        // $('#dataset-update-' + name).text("Not Update");
                        $(e.target).text("Not Update");

                    }
                    // $(instant).dialog("close");
                }
            }, {
                text: "Dataset",
                id: 'dataset-type-' + name,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    showdataset++;
                    switch (showdataset) {
                        case 0:
                            $(e.target).text("Output");
                            vardir = "output";
                            break;
                        case 1:
                            $(e.target).text("Input");
                            vardir = "input";

                            break;
                        case 2:
                            $(e.target).text("Custom");
                            vardir = "custom";

                            break;
                        case 3:
                            $(e.target).text("System");
                            vardir = "system";

                            break;
                        case 4:
                            $(e.target).text("Health");
                            vardir = "health";

                            break;
                        case 5:
                            $(e.target).text("DevAlarm");
                            vardir = "device_alarms";

                            break;

                        case 6:
                            $(e.target).text("CUAlarm");
                            vardir = "cu_alarms";

                            break;
                        case 7:
                            $(e.target).text("Stat");
                            vardir = "stat";

                            break;
                        case 8:
                            $(e.target).text("All");
                            vardir = "";

                            break;

                        default:
                            showdataset = 0;
                            $(e.target).text("Output");
                            vardir = "output";

                    }

                    // $(instant).dialog("close");
                }
            },
            {
                text: "Format",
                id: 'dataset-radix-' + name,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    showformat++;
                    switch (showformat) {
                        case 0:
                            $(e.target).text("Dec(s)");
                            break;
                        case 1:
                            $(e.target).text("Dec(u)");
                            break;
                        case 2:
                            $(e.target).text("Hex");
                            break;
                        case 3:
                            $(e.target).text("Bin");
                            break;
                        default:
                            showformat = 0;
                            $(e.target).text("Dec(s)");
                    }

                    // $(instant).dialog("close");
                }
            }, {
                text: "save",
                click: function (e) {
                    var blob = new Blob([JSON.stringify(last_dataset)], { type: "json;charset=utf-8" });
                    saveAs(blob, name + ".json");
                }
            },
            {
                text: "close",
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    $("#dataset-" + name).dialog('close');

                }
            }


            ],
            close: function (event, ui) {

                clearInterval(update);
                $(this).remove();
            },
            open: function () {

                console.log(cuname + "dataset update refresh:" + refresh);
                //$(".ui-dialog-titlebar-close", ui.dialog | ui).show();
                update = setInterval(function () {

                    var isediting = false;
                    if (tmpObj.hasOwnProperty('json_editing')) {
                        isediting = tmpObj.json_editing;
                    }
                    if ((!stop_update) && (isediting == false)) {
                        var chnum = showdataset;
                        if (showdataset == 7) {
                            chnum = 128;
                        } else if (chnum > 7) {
                            chnum = -1;
                        }

                        jchaos.getChannel(cuname, chnum, function (imdata) {
                            last_dataset = imdata[0];
                            if (showformat == 1) {
                                options["format"] = 10 + 0x100;
                            } else if (showformat == 2) {
                                options["format"] = 16;
                            } else if (showformat == 3) {
                                options["format"] = 2;
                            } else {
                                options["format"] = 10;
                            }
                            var converted = {};
                            if (vardir != "") {
                                converted[vardir] = convertBinaryToArrays(imdata[0]);
                            } else {
                                converted = convertBinaryToArrays(imdata[0]);
                            }
                            var jsonhtml = json2html(converted, options, cuname);
                            if (jchaos.isCollapsable(converted)) {
                                jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
                            }
                            var html = "";
                            var lat = imdata[0].dpck_ts_diff / 1000.0;
                            html = "<label>CU-MDS Latency(ms):" + lat + "</label>";

                            html += jsonhtml;
                            $("#dataset-" + name).html(html);
                            if (started == 0) {
                                started = 1;
                                stop_update = true;
                                //var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
                                //target.toggle();
                                $(".json-toggle").trigger("click");
                                jsonEnableDSContext(cuname);
                            }
                        }, function (err) {
                            console.log(err);
                        });
                    }

                }, refresh);

                jsonSetup($(this), tmpObj);
                $(this).before($(this).parent().find('.ui-dialog-buttonpane'));

            }
        });
    }


    jqccs.editJSON = function (msghead, json, applyfunc) {
        var last_dataset = {};
        var showformat = 0;
        var name = jchaos.encodeName(msghead);
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var instant = $('<div id=dataset-' + name + '></div>').dialog({
            minWidth: hostWidth / 4,
            minHeight: hostHeight / 4,
            closeOnEscape: true,
            title: msghead,
            resizable: true,
            buttons: [
                {
                    text: "Format",
                    id: 'dataset-radix-' + name,
                    click: function (e) {
                        // var interval=$(this).attr("refresh_time");
                        showformat++;
                        switch (showformat) {
                            case 0:
                                $(e.target).text("Dec(s)");
                                break;
                            case 1:
                                $(e.target).text("Dec(u)");
                                break;
                            case 2:
                                $(e.target).text("Hex");
                                break;
                            case 3:
                                $(e.target).text("Bin");
                                break;
                            default:
                                showformat = 0;
                                $(e.target).text("Dec(s)");
                        }
                        if (showformat == 1) {
                            options["format"] = 10 + 0x100;
                        } else if (showformat == 2) {
                            options["format"] = 16;
                        } else if (showformat == 3) {
                            options["format"] = 2;
                        } else {
                            options["format"] = 10;
                        }
                        var converted = convertBinaryToArrays(json);

                        var jsonhtml = json2html(converted, options, "");
                        $("#dataset-" + name).html(jsonhtml);

                        // $(instant).dialog("close");
                    }
                },
                {
                    text: "Save to Disk",
                    click: function (e) {
                        var blob = new Blob([JSON.stringify(json)], { type: "json;charset=utf-8" });
                        saveAs(blob, name + ".json");
                    }
                },
                {
                    text: "Upload From Disk",
                    click: function (e) {
                        getFile("Upload", "upload the json", function (obj) {
                            json = obj;
                            var converted = convertBinaryToArrays(json);
                            var jsonhtml = json2html(converted, options, "");
                            $("#dataset-" + name).html(jsonhtml);
                        });

                    }
                }, {
                    text: "Apply",
                    id: 'apply-' + name,
                    click: function (e) {
                        if (typeof applyfunc === "function") {
                            applyfunc(json, function (newjson) {
                                if (typeof newjson === "object") {
                                    var converted = convertBinaryToArrays(newjson);
                                    var jsonhtml = json2html(converted, options, "");
                                    $("#dataset-" + name).html(jsonhtml);
                                }
                            });
                        }

                    }
                },
                {
                    text: "close",
                    click: function (e) {
                        // var interval=$(this).attr("refresh_time");
                        $("#dataset-" + name).dialog('close');
                        $(this).remove();

                    }
                }


            ],
            close: function (event, ui) {

                $(this).remove();
            },
            open: function () {
                var converted = {};
                converted = convertBinaryToArrays(json);
                if (showformat == 1) {
                    options["format"] = 10 + 0x100;
                } else if (showformat == 2) {
                    options["format"] = 16;
                } else if (showformat == 3) {
                    options["format"] = 2;
                } else {
                    options["format"] = 10;
                }
                var jsonhtml = json2html(converted, options, "");
                if (jchaos.isCollapsable(converted)) {
                    jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
                }

                $("#dataset-" + name).html(jsonhtml);
                if (typeof applyfunc !== "function") {
                    $('#apply-' + name).remove();
                }



                jqccs.jsonSetup($(this), function (e) {

                }, function (e) {
                    if (e.keyCode == 13) {

                        var value = e.target.value;
                        var attrname = e.target.name;
                        var desc = jchaos.decodeCUPath(attrname);

                        var obj = jchaos.changejsonfrompath(json, attrname, value);
                        var converted = convertBinaryToArrays(json);

                        var jsonhtml = json2html(converted, options, "");
                        if (jchaos.isCollapsable(converted)) {
                            jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
                        }

                        $("#dataset-" + name).html(jsonhtml);
                    }
                })


                $(this).before($(this).parent().find('.ui-dialog-buttonpane'));

            }
        });
    }
    /**
     * 
     * @param {string} msgHead Title of the window
     * @param {function} nodeFn function that creates node, menu and handlers 
     */
    jqccs.createBrowserWindow = function (msgHead, opt, nodeFn) {
        var width = $(window).width() / 2;
        var height = $(window).height() / 2;
        if (typeof opt === "function") {
            nodeFn = opt;
        } else if (opt !== undefined) {
            if (opt['width'] !== undefined) {
                width = opt['width'];
            }
            if (opt['height'] !== undefined) {
                height = opt['height'];
            }
        }

        var pid = (new Date()).getTime();
        var hier = "hier-" + pid;
        var desc = "desc-" + pid;
        var html = '<div class="row"><div id="' + hier + '" class="col-md-6"></div><div id="' + desc + '" class="col-md-6"></div></div>';

        if (typeof nodeFn !== "function") {
            throw "must provide a mode creation handler";
        }
        var opt = {
            minWidth: width,
            minHeight: height,
            title: msgHead,
            resizable: true,
            dialogClass: 'no-close',
            buttons: [
                {
                    text: "refresh",
                    id: 'refresh-' + pid,
                    click: function (e) {
                        // var interval=$(this).attr("refresh_time");
                        //    $('#console-' + pid).terminal().exit();
                        nodeFn(pid);
                    }

                },
                {
                    text: "close",
                    id: 'console-close-' + pid,
                    click: function (e) {
                        // var interval=$(this).attr("refresh_time");
                        //    $('#console-' + pid).terminal().exit();
                        $(this).dialog("close");
                    }

                }
            ],
            close: function (event, ui) {
                //    $('#console-' + pid).terminal().exit();
                $(this).dialog("close");

            },

            open: function (e) {
                console.log(msgHead + " opening browser :" + pid + " " + width + "x" + height);
                nodeFn(pid);


            }
        }


        createCustomDialog(opt, html);
    }
    jqccs.execConsole = function (msghead, execHandler, okhandle, nokhandle) {
        var pid = (new Date()).getTime();

        var html = '<div id=console-' + pid + '></div><div class="wait_modal"></div>';
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var opt = {
            minWidth: hostWidth / 2,
            minHeight: hostHeight / 4,
            title: msghead,
            resizable: true,
            dialogClass: 'no-close',
            buttons: [{
                text: "download",
                id: 'console-download-' + pid,
                click: function (e) {
                    var name = jchaos.encodeName(msghead) + pid;
                    // var interval=$(this).attr("refresh_time");
                    var output = $('#console-' + pid).terminal().get_output();
                    var blob = new Blob([output], { type: "json;charset=utf-8" });
                    saveAs(blob, name + ".log");


                }
            },
            {
                text: "pause",
                id: 'console-pause-' + pid,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    $('#console-' + pid).terminal().pause();

                }
            },
            {
                text: "resume",
                id: 'console-resume-' + pid,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    $('#console-' + pid).terminal().resume();

                }
            },
            {
                text: "close",
                id: 'console-close-' + pid,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    //    $('#console-' + pid).terminal().exit();
                    $(this).dialog("close");
                }

            }],
            close: function (event, ui) {
                //    $('#console-' + pid).terminal().exit();
                $(this).dialog("close");
                jchaos.exit = function (str) {
                    alert(str);
                }
            },

            open: function (e) {
                console.log(msghead + " opening terminal :" + pid);

                //$(e.target).parent().css('background-color', 'black');
                $('#console-' + pid).css('background-color', 'black');
                $('#console-' + pid).terminal(function (command) {
                    if (command !== '') {
                        try {
                            if (command == "help") {
                                return;
                            }
                            var regxp = /^\s*console\.([a-z]{3,})\((.*)\)\s*;/;
                            var match = regxp.exec(command);

                            if (match != null) {

                                var result = window.eval(match[2]);
                                if (result !== undefined) {
                                    if (match[1] == "error") {
                                        this.error(new String(result));

                                    } else {
                                        this.echo(new String(result));
                                    }
                                }
                            }

                            var result = window.eval(command);

                            if (result !== undefined) {
                                this.echo(new String(result));
                            }


                        } catch (e) {
                            this.error(new String(e));
                        }
                    } else {
                        this.echo('');
                    }
                }, {
                    greetings: 'JavaScript Chaos Interpreter',
                    name: 'JChaos',
                    height: 600,
                    prompt: 'chaos-js> '


                });
                setTimeout(() => {
                    if (typeof execHandler === "string") {
                        $('#console-' + pid).terminal().exec(execHandler, false);
                    } else if (typeof execHandler === "function") {
                        $('#console-' + pid).terminal().exec(execHandler(), false);
                    }
                }, 500);
                jchaos.exit = function (str) {
                    console.log("pausing: " + str);
                    $('#console-' + pid).terminal().logout();

                    $('#console-' + pid).terminal().disable();
                }
                jchaos.setOptions({ "console_log": $('#console-' + pid).terminal().echo, "console_err": $('#console-' + pid).terminal().error });
            }

        }


        createCustomDialog(opt, html);
    }


    jqccs.getConsoleByUid = function (msghead, uid) {
        jchaos.node(uid, "desc", "all", (d) => {
            if (d.ndk_parent !== undefined) {
                jchaos.node(d.ndk_parent, "get", "agent", uid, null, function (data) {
                    console.log("getConsoleByUid->" + JSON.stringify(data));
                    jchaos.node(d.ndk_parent,"desc","all",(dd)=>{
                    var server = dd.ndk_host_name + ":" + dd.ndk_rest_port;
                    getConsole(msghead, data.association_uid, server, 2, 1, 1000);
                    });
                });
            }
        });

    }
    jqccs.getConsole = function (msghead, pid, server, lines, consolen, refresh, type) {
        return getConsole(msghead, pid, server, lines, consolen, refresh, type);
    }
    function getConsole(msghead, pid, server, lines, consolen, refresh, type) {
        var update;
        var data;
        var stop_update = false;
        var html = '<div id=console-' + pid + '></div>';

        html += '<div class="row"><label class="col-md-4">Console buffering:</label><input class="col-md-4" id="buffer-update" type="text" title="Remote flush Update(bytes)" value=1 /></div>';
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var opt = {
            minWidth: hostWidth / 2,
            minHeight: hostHeight / 4,
            title: msghead,
            resizable: true,
            dialogClass: 'no-close',
            buttons: [{
                text: "download",
                id: 'console-download-' + pid,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    jchaos.rmtGetConsole(server, pid, 0, -1, function (r) {
                        var str = decodeURIComponent(escape(atob(r.data.console)));
                        var name = pid + "_" + r.data.process.last_log_time;
                        var blob = new Blob([str], { type: "json;charset=utf-8" });
                        saveAs(blob, name + ".log");
                    }, function (bad) {
                        console.log("Some error getting console occur:" + JSON.stringify(bad));
                    });
                }
            },
            {
                text: "update",
                id: 'console-update-' + pid,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    stop_update = !stop_update;

                }
            },

            {
                text: "close",
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");

                    clearInterval(update);
                    // $(instant).dialog("close");
                    $(this).remove();
                }
            }

            ],
            close: function (event, ui) {
                //  var interval=$(this).attr("refresh_time");

                clearInterval(update);
                // $(instant).dialog("close");
                $(this).remove();
            },
            open: function (e) {
                console.log(msghead + "opening terminal refresh:" + refresh);
                //$(e.target).parent().css('background-color', 'black');
                $('#console-' + pid).css('background-color', 'black')
                var consoleParam = {
                    "uid": pid,
                    "fromline": 0,
                    "toline": -1
                };
                $("#buffer-update").keypress(function (e) {
                    if (e.keyCode == 13) {
                        var update = Number($("#buffer-update").val());
                        var prop = {
                            uid: pid,
                            consoleBuffering: update
                        }
                        jchaos.rmtSetProp(server, prop, function () {
                            instantMessage("Remote Console Buffering ", "Updated " + update, 2000, null, null, true);

                        }, function () {
                            instantMessage("Remote Console Buffering ", "Failed " + update, 2000, null, null, false);

                        });
                    }
                });
                $('#console-' + pid).terminal(function (command) {
                    if (command !== '') {
                        jchaos.rmtSetConsole(server, pid, command, function (r) {
                            console.log("sent command:" + command)

                        }, function (bad) {
                            console.log("Some error getting console occur:" + bad);
                        }, server);
                    } else {
                        this.echo('');
                    }
                }, {
                    greetings: 'Remote Console',
                    name: 'Remote Console',
                    height: 600

                });
                var last_log_time = 0;
                update = setInterval(function () {
                    if (stop_update) {
                        $('#console-update-' + pid).text("Update");
                    } else {
                        $('#console-update-' + pid).text("Not Update");
                    }
                    if (!stop_update) {

                        jchaos.rmtGetConsole(server, pid, consoleParam.fromline, -1, function (r) {
                            if (r.data !== undefined) {
                                if (r.data.process.last_log_time != last_log_time) {
                                    //  var str = decodeURIComponent(escape(atob(r.data.console)));
                                    var str = atob(r.data.console);
                                    $('#console-' + pid).terminal().echo(str);
                                    consoleParam.fromline = Number(r.data.process.output_line) - 1;
                                }
                                last_log_time = r.data.process.last_log_time;
                            } else {
                                var str = "[" + jchaos.getDateTime() + "] Cannot retrieve process on " + server;
                                $('#console-' + pid).terminal().error(str);

                            }
                        }, function (bad) {
                            console.log("Some error getting console occur:" + JSON.stringify(bad));
                        });

                    }
                    //$(this).attr("refresh_time",update);
                }, refresh);
            }
        };
        if (typeof type !== "undefined" && (type == "CPP")) {
            opt['buttons'].push({
                text: "Root EXIT",
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    jchaos.rmtSetConsole(server, pid, ".exit", function (r) {

                    }, function (bad) {
                        console.log("Some error getting console occur:" + bad);
                    }, server);
                }
            })
        }
        createCustomDialog(opt, html);
    }
    jqccs.showPicture = function (msghead, cuname, refresh, channel) {
        return showPicture(msghead, cuname, refresh, channel);
    }
    function showPicture(msghead, cuname, refresh, channel) {
        var update;
        var data;
        var stop_update = false;
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var name = jchaos.encodeName(cuname) + (new Date()).getTime();
        if (typeof channel === "undefined") {
            channel = 0;
        }
        var instant = $('<div><img id="pict-' + name + '" src=""><div id="info-' + name + '"></div></div>').dialog({
            minWidth: hostWidth / 4,
            minHeight: hostHeight / 4,
            title: msghead,
            position: "center",
            resizable: true,
            dialogClass: 'no-close',
            buttons: [{
                text: "save",
                click: function (e) {
                    var binary_string = atob(data.FRAMEBUFFER.$binary.base64);
                    /* var len = binary_string.length;
                     var bytes = new Uint8Array(len);
                     for (var i = 0; i < len; i++) {
                       bytes[i] = binary_string.charCodeAt(i);
                     }
                     var blob = new Blob([bytes], { type: "image/png" });
                    */
                    saveAsBinary(binary_string, name + ".png");

                }
            },
            {
                text: "update",
                id: 'pict-update-' + name,
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");
                    stop_update = !stop_update;

                }
            },
            {
                text: "close",
                click: function (e) {
                    // var interval=$(this).attr("refresh_time");

                    clearInterval(update);
                    // $(instant).dialog("close");
                    $(this).remove();
                }
            }


            ],
            close: function (event, ui) {
                //  var interval=$(this).attr("refresh_time");

                clearInterval(update);
                // $(instant).dialog("close");
                $(this).remove();
            },
            open: function () {
                console.log(msghead + " refresh:" + refresh);

                update = setInterval(function () {
                    if (refresh == 0) {
                        clearInterval(update);
                    }
                    if (stop_update) {
                        $('#pict-update-' + name).text("Update");
                    } else {
                        $('#pict-update-' + name).text("Not Update");
                    }
                    if (!stop_update) {
                        jchaos.getChannel(cuname, channel, function (imdata) {
                            data = imdata[0];
                            if (data.hasOwnProperty("FRAMEBUFFER") && data.FRAMEBUFFER.hasOwnProperty("$binary") && data.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
                                var bin = data.FRAMEBUFFER.$binary.base64;
                                //  $("#pict-"+name).attr("src", "data:image/" + fmt + ";base64," + bin);
                                $("#pict-" + name).attr("src", "data:;base64," + bin);
                                var info_size = "";
                                if (data.hasOwnProperty("WIDTH")) {
                                    info_size = data.WIDTH + "x" + data.HEIGHT + "(" + data.OFFSETX + "," + data.OFFSETY + ") ";
                                }
                                $("#info-" + name).html(info_size + "frame:" + data.dpck_seq_id);
                            } else {
                                alert("NO 'FRAMEBUFFER.$binary.base64' key EXISTS");
                                clearInterval(update);
                                $(this).remove();

                            }
                        }, function (err) {
                        });
                    }
                    //$(this).attr("refresh_time",update);
                }, refresh);
            }
        });
    }

    function instantMessage(msghead, msg, tim, sizex, sizey, ok) {

        if (sizex == null) {
            sizex = $(window).width() / 2;
        }
        if (sizey == null) {
            sizey = $(window).height() / 4;
        }
        if (typeof (sizex) === "boolean") {
            ok = sizex;
            sizex = $(window).width() / 2;
        }
        if (typeof (sizey) === "boolean") {
            ok = sizey;
            sizey = $(window).height() / 4;
        }
        var instant = $('<div></div>').html(msg).dialog({
            width: sizex,
            height: sizey,
            title: msghead,
            // position: "center",
            dialogClass: 'instantOk',
            open: function () {
                if (ok != null) {
                    if (ok) {
                        console.log(msghead + ":" + msg);
                        $(this).prev().css("background", "green");
                        //$(this).dialog({dialogClass: 'instantOk'});
                    } else {
                        console.error(msghead + ":" + msg);
                        $(this).prev().css("background", "red");

                        // $(this).dialog({dialogClass: 'instantError'});

                    }
                } else {
                    console.log(msghead + ":" + msg);
                }

                $(this).css("opacity", 0.5);

                setTimeout(function () {
                    $(instant).dialog("close");
                }, tim);
            }
        });
    }

    function copyToClipboard(testo) {
        var $temp = $("<textarea>");

        $("body").append($temp);
        var brRegex = /<br\s*[\/]?>/gi;
        testo.replace(brRegex, "\r\n");
        $temp.val(testo);
        $temp.select();
        document.execCommand("copy");
        $temp.remove();
    }

    function encodeCUPath(path) {
        if (path == null || path == "timestamp") {
            return "timestamp";
        }
        if ((path.const == null) && (path.cu == null)) {
            return path.origin;
        }

        if (path.const) {
            return path.const;
        }
        var str = path.cu + "/" + path.dir + "/" + path.var;
        if (path.index != null) {
            str += "[" + path.index + "]";
        }
        return str;
    }


    function findImplementationName(type) {

        var ret = "uknown";
        if (type != null) {
            var r = type.lastIndexOf(":");
            var tmp = type.substring(r + 1);

            if (implementation_map[tmp] != null) {
                ret = implementation_map[tmp];
            } else if (tmp != null) {
                ret = tmp;
            }
        }
        return ret;

    }

    function retriveCurrentCmdArguments(tmpObj, alias) {
        var arglist = [];
        var node_selected = tmpObj.node_selected;
        if (node_selected == null) {
            return arglist;
        }
        //var name = jchaos.encodeName(tmpObj.node_selected);
        var name = tmpObj.node_selected;
        var descr=jchaos.node(name,"desc","all");
        if (tmpObj.node_selected != null && descr.hasOwnProperty("cudk_ds_desc") && descr.cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
            var desc = descr.cudk_ds_desc.cudk_ds_command_description;
            desc.forEach(function (item) {
                if (item.bc_alias == alias) {
                    var params = item.bc_parameters;
                    if ((params == null) || (params.length == 0)) {
                        return arglist;
                    }
                    params.forEach(function (par) {
                        var arg = {};
                        arg['name'] = par.bc_parameter_name;
                        arg['desc'] = par.bc_parameter_description;
                        arg['optional'] = (par.bc_parameter_flag == 0);
                        arg['value'] = null;
                        switch (par.bc_parameter_type) {
                            case 0:
                                arg['type'] = "bool";
                                break;
                            case 1:
                                arg['type'] = "int32";
                                break;
                            case 2:
                                arg['type'] = "int64";
                                break;
                            case 4:
                                arg['type'] = "string";
                                break;
                            case 3:
                                arg['type'] = "double";
                                break;
                            case 5:
                                arg['type'] = "binary";
                                break;

                        }
                        arglist.push(arg);
                    });
                }
            });
        }
        return arglist;
    }
    // encode the arguments value as extended json
    // alias: command name
    // argument values arglist['name'] ...
    // return a filled argument list ready to be send
    function buildCmdParams(arglist) {
        var cmdparam = {};
        arglist.forEach(function (par) {
            var parname = par['name'];
            var parvalue = par['value'];
            var type = par['type'];
            if (parvalue != null) {
                switch (type) {
                    case "bool":
                        //bool
                        if (parvalue == "true") {
                            cmdparam[parname] = true;

                        } else if (parvalue == "false") {
                            cmdparam[parname] = true;
                        } else {
                            cmdparam[parname] = parseInt(parvalue);

                        }
                        break;
                    case "int32":
                        //integer
                        if (parvalue != "") {
                            cmdparam[parname] = parseInt(parvalue);
                        }
                        break;
                    case "double":
                        {
                            var d = {};
                            if (parvalue != "") {
                                if (typeof parvalue === 'string') {
                                    d['$numberDouble'] = parvalue;
                                } else {
                                    d['$numberDouble'] = parvalue.toString();
                                }
                                cmdparam[parname] = d;
                            }
                            break;
                        }
                    case "string":
                        {
                            cmdparam[parname] = parvalue;
                            break;
                        }
                    case "int64":
                        {
                            if (parvalue != "") {
                                var d = {};
                                if (typeof parvalue === 'string') {
                                    d['$numberLong'] = parvalue;
                                } else {
                                    d['$numberLong'] = parvalue.toString();
                                }
                                cmdparam[parname] = d;
                            }
                            break;
                        }

                }
            }
        });
        return cmdparam;
    }

    function cusWithInterface(tmpObj, culist, interface) {
        var retlist = [];
        culist.forEach(function (name) {
            if (tmpObj.node_name_to_desc[name] == null || (!tmpObj.node_name_to_desc[name].hasOwnProperty('instance_description'))) {
                var desc = jchaos.node(name,"desc","all", null);
                tmpObj.node_name_to_desc[name] = desc;
            }
            var node_name_to_desc = tmpObj.node_name_to_desc;
            var impl="";
            if(node_name_to_desc[name].hasOwnProperty("cudk_view")){
                impl=node_name_to_desc[name].cudk_view;
            } else if( (node_name_to_desc[name].hasOwnProperty('instance_description') && node_name_to_desc[name].instance_description.hasOwnProperty("control_unit_implementation") )){
                impl=node_name_to_desc[name].instance_description.control_unit_implementation;
            }
            if( (impl.indexOf(interface) != -1)) {
                retlist.push(name);
            }
        });


        return retlist;
    }
    //Funzione per controllare che il timestamp di ogni singolo magnete si stia aggiornando
    function checkTimestamp() {
        setInterval(function () {
            for (var i = 0; i < refresh_time.length; i++) {
                if (refresh_time[i] != old_time[i]) {
                    $("#name_element_" + i).css('color', 'green');
                    old_time[i] = refresh_time[i];
                } else {
                    $("#name_element_" + i).css('color', 'red');
                }
            }
        }, 10000); /*** il setInterval è impostato a 6 secondi perché non può essere minore delq refresh cu ***/
    }

    //var index = 0;
    //38 up, 40down
    /*     $(document).keydown(function (e) {
          
                  if (e.keyCode === 40) {
                      if (num_row + 1 >= $(".row_element").length) {
                          num_row = $(".row_element").length - 1;
                      } else {
                          num_row = num_row + 1;
                      }
                      $(".row_element").removeClass("row_selected");
                      selectElement(num_row);
                      return false;
                  }
                  if (e.keyCode === 38) {
                      if (num_row == 0) {
                          num_row = 0;
                      } else {
                          num_row = num_row - 1;
                      }
                      $(".row_element").removeClass("row_selected");
                      selectElement(num_row);
                      return false;
                  }
              });
     */
    /**
     * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
     * @return boolean
     */



    function show_dev_alarm(id) {
        var dataset = node_live_selected[node_name_to_index[jchaos.encodeName(id)]];
        if ((dataset != null) && (dataset.hasOwnProperty("device_alarms"))) {
            decodeDeviceAlarm(dataset.device_alarms);
        }
    }

    function show_cu_alarm(id) {
        var dataset = node_live_selected[node_name_to_index[jchaos.encodeName(id)]];
        if (dataset.hasOwnProperty("cu_alarms")) {
            decodeDeviceAlarm(dataset.cu_alarms);
        }
    }

    function decodeDeviceAlarm(dev_alarm) {
        showJson("Alarm " + dev_alarm.ndk_uid, jchaos.filterAlarmObject(dev_alarm));
        //$("#name-device-alarm").html(dev_alarm.ndk_uid);
        //$("#table_device_alarm").html(jqccs.generateAlarmTable(dev_alarm));
    }
    /**
     * Check if a string represents a valid url
     * @return boolean
     */
    function isUrl(string) {
        var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(string);
    }



    function buildAlgoBody() {
        var html = '<div class="row">';
        /*html += '<div class="statbox purple" onTablet="col-md-4" onDesktop="col-md-3">'
    html += '<h3>Algorithm Type</h3>';
    html += '<select id="classe" size="auto"></select>';
    html += '</div>';
*/
        html += '<div class="statbox purple row" onTablet="col-md-8" onDesktop="col-md-6">'
        html += '<div class="col-md-6">'
        html += '<label for="search-algo">Search Algorithms</label><input class="input-xlarge" id="search-algo" title="Search Algorithms" name="search-algo" type="radio" value=true>';
        html += '</div>'
        html += '<div class="col-md-6">'
        html += '<label for="search-algo">Search Instanced</label><input class="input-xlarge" id="search-instance" title="Search Instanced Algorithms" name="search-algo" type="radio" value=false>';
        html += '</div>'
        // html += '<h3 class="col-md-3">Search</h3>';

        html += '<input class="input-xlarge focused col-md-6" id="search-chaos" title="Free form Search" type="text" value="">';
        html += '</div>';
        html += '</div>';

        return html;
    }

    function updateAlgoMenu(cu, name) {
        var items = {};
        items['edit-algo'] = { name: "Edit..", icon: "Edit" };
        items['new-algo'] = { name: "New..", icon: "New" };
        items['copy-algo'] = { name: "Copy", icon: "copy" };
        items['paste-algo'] = { name: "Paste", icon: "paste" };
        items['delete-algo'] = { name: "Delete", icon: "delete" };
        items['create-instance'] = { name: "Create Instance", icon: "Create" };
        return items;
    }

    function updateInstanceAlgoMenu(cu, name) {
        var items = {};
        items['edit-instance'] = { name: "Edit Instance..", icon: "Delete" };

        items['delete-instance'] = { name: "Delete Instance", icon: "Delete" };
        return items;
    }
    /*
      function buildAlgoBody() {
        var html = '<div class="row">';
  
        html += '<div class="statbox purple row" onTablet="col-md-4" onDesktop="col-md-8">'
        html += '<div class="col-md-6">'
        html += '<label for="search-alive">Search All Alghoritm</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
        html += '</div>'
        html += '<div class="col-md-6">'
        html += '<label for="search-alive">Search Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
        html += '</div>'
        // html += '<h3 class="col-md-3">Search</h3>';
  
        html += '<input class="input-xlarge focused col-md-6" id="search-chaos" title="Free form Search" type="text" value="">';
        html += '</div>';
        html += '</div>';
        return html;
      }*/
    function generateAlgoTable(cu, interface, template) {
        var html = '<div class="row" id="table-space">';

        html += '<div class="box col-md-12" id="container-main-table">';
        html += '<div class="box-content col-md-12">';

        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        if (interface == "algo-instance") {
            html += '<tr class="algoInstanceMenu">';
            html += '<th>Instance Name</th>';
            html += '<th>Algorithm Name</th>';
            html += '<th>Language</th>';
            html += '<th>RPC Address</th>';
            html += '<th>Hostname</th>';
            html += '<th>Bind Type</th>';
            html += '<th>Bind Node</th>';
            html += '<th>Instance seq</th>';
            html += '</tr>';
            html += '</thead> ';
            cu.forEach(function (elem) {
                var name = elem.instance_name;
                var nameid = jchaos.encodeName(name);
                html += "<tr class='row_element algoInstanceMenu' cuname='" + name + "' id='" + nameid + "'>";
                html += "<td class='name_element'>" + name + "</td>";
                html += "<td>" + pather_selected + "</td>";
                html += "<td>" + node_name_to_desc[pather_selected].eudk_script_language + "</td>";

                html += "<td>" + elem.ndk_rpc_addr + "</td>";
                html += "<td>" + elem.ndk_host_name + "</td>";
                html += "<td>" + elem.script_bind_type + "</td>";
                html += "<td>" + elem.script_bind_node + "</td>";
                html += "<td>" + elem.instance_seq + "</td></tr>";
            });
        } else {
            html += '<tr class="algoMenu">';
            html += '<th>Name</th>';
            html += '<th>Description</th>';
            html += '<th>Language</th>';
            html += '</tr>';
            html += '</thead> ';
            cu.forEach(function (elem) {
                var name = elem.script_name;
                var nameid = jchaos.encodeName(name);
                html += "<tr class='row_element algoMenu' cuname='" + name + "' id='" + nameid + "'>";
                html += "<td class='name_element'>" + elem.script_name + "</td>";
                html += "<td>" + elem.script_description + "</td>";
                html += "<td>" + elem.eudk_script_language + "</td></tr>";
            });
        }
        html += '</table>';
        html += '</div>';
        html += '</div>';

        html += '<div class="box col-md-12 hide" id="container-table-helper">';
        html += '<div class="box-content-helper col-md-12">';
        html += '</div>';
        html += '</div>';

        html += '</div>';

        return html;

    }

    function generateProcessTable(tmpObj) {
        var cu = [];
        if (tmpObj['elems'] instanceof Array) {
            cu = tmpObj.elems;
        }
        var template = tmpObj.type;
        var html = '<div class="row" z-index=-1 id="table-space">';
        html += '<div class="col-md-12">';
        html += '<div class="box-content col-md-12">';
        if (cu.length == 0) {
            html += '<p id="no-result-monitoring">No results match</p>';

        } else {
            html += '<p id="no-result-monitoring"></p>';

        }

        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Instance</th>';
        html += '<th>Name</th>';
        html += '<th>Type</th>';
        html += '<th>Start</th>';
        html += '<th>End</th>';
        html += '<th>LastLog(s ago)</th>';
        html += '<th>Hostname</th>';
        html += '<th>PID</th>';
        html += '<th>Status</th>';
        html += '<th>TimeStamp</th>';
        html += '<th>Uptime</th>';
        html += '<th>System Time</th>';
        html += '<th>User Time</th>';
        html += '<th>VMem(KB)</th>';
        html += '<th colspan="2">RMem(KB)|%</th>';
        html += '<th>Parent</th>';

        html += '</tr>';


        html += '</thead> ';

        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }
    /*
        function generateProcessTable(tmpObj) {
            var cu = tmpObj.elems;
            var template = tmpObj.type;
            var html = "";
            html += '<div class="row">';
            html += '<table class="table table-striped" id="graph_table-' + template + '">';
            html += '</table></div>';
    
    
           // html += '<div class="box col-md" id="container-main-table">';
            html += '<div class="row"><label class="col-md-1">Search:</label><input class="input-xlarge focused" id="process_search" class="col-md-5" type="text" title="Search a Process" value=""></div>';
            html += '<div class="row">';
            html += '<div class="col-md">';
    
            html += '<table class="table table-striped" id="main_table-' + template + '">';
            html += '<thead class="box-header processMenu">';
            html += '<tr>';
            html += '<th>Instance</th>';
            html += '<th>Name</th>';
            html += '<th>Type</th>';
            html += '<th>Start</th>';
            html += '<th>End</th>';
            html += '<th>LastLog(s ago)</th>';
            html += '<th>Hostname</th>';
            html += '<th>PID</th>';
            html += '<th>Status</th>';
            html += '<th>TimeStamp</th>';
            html += '<th>Uptime</th>';
            html += '<th>System Time</th>';
            html += '<th>User Time</th>';
            html += '<th>VMem(KB)</th>';
            html += '<th colspan="2">RMem(KB)|%</th>';
            html += '<th>Parent</th>';
    
            html += '</tr>';
    
    
            html += '</thead> ';
    
            html += '</table>';
            html += '</div>';
    
            html += '</div>';
            html += '</div>';
            html += '</div>';
    
         //   html += generateScriptAdminModal();
            return html;
    
        }
    */
    function generateNodeTable(tmpObj) {
        var cu = tmpObj.elems;
        var template = tmpObj.type;
        var html = '<div class="row" id="table-space">';

        html += '<div class="box col-md-12" id="container-main-table">';
        html += '<div class="box-content col-md-12">';

        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr class="nodeMenu">';
        html += '<th>Node</th>';
        html += '<th>Type</th>';
        html += '<th>Registration Timestamp</th>';
        html += '<th>Hostname</th>';
        html += '<th>(RPC) address</th>';
        html += '<th>Status</th>';
        html += '<th>TimeStamp</th>';
        html += '<th>Uptime</th>';
        html += '<th>System Time</th>';
        html += '<th>User Time</th>';
        html += '<th>Parent</th>';

        html += '</tr>';


        html += '</thead> ';
        $(cu).each(function (i) {
            var cuname = jchaos.encodeName(cu[i]);
            html += "<tr class='row_element nodeMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
            html += "<td class='name_element'>" + cu[i] + "</td>";
            html += "<td id='" + cuname + "_type'></td>";

            html += "<td id='" + cuname + "_timestamp'></td>";
            html += "<td id='" + cuname + "_hostname'></td>";
            html += "<td id='" + cuname + "_rpcaddress'></td>";
            html += "<td id='" + cuname + "_health_status'></td>";
            html += "<td id='" + cuname + "_health_timestamp'></td>";
            html += "<td id='" + cuname + "_health_uptime'></td>";
            html += "<td id='" + cuname + "_health_systemtime'></td>";
            html += "<td id='" + cuname + "_health_usertime'></td>";
            html += "<td id='" + cuname + "_parent'></td></tr>";

        });

        html += '</table>';
        html += '</div>';
        html += '</div>';

        html += '<div class="box col-md-12 hide" id="container-table-helper">';
        html += '<div class="box-content-helper col-md-12">';
        html += '</div>';
        html += '</div>';

        html += '</div>';

        return html;

    }

    function updateNode(tmpObj) {
        var node_list = tmpObj['elems'];
        var cutype = tmpObj.type;

        jchaos.node(node_list, "health", cutype, function (data) {
            tmpObj.data = data;
            updateGenericTableDataset(tmpObj);

        });


        /*
        cu_list.forEach(function (item) {
          cu_live_selected.push(jchaos.node(item, "desc", cutype));
        })
        */

        // update all generic





        updateNodeTable(tmpObj);

    }

    function updateNodeTable(tmpObj) {
        var cu = tmpObj['elems'];
        cu.forEach(function (v) {
            if (tmpObj.node_name_to_desc != null && tmpObj.node_name_to_desc[v] != null) {
                var elem = tmpObj.node_name_to_desc[v];

                if (elem.desc.hasOwnProperty("ndk_uid")) {
                    var id = elem['desc'].ndk_uid;
                    var cuname = jchaos.encodeName(id);
                    if (elem.desc.hasOwnProperty("ndk_heartbeat")) {
                        $("#" + cuname + "_timestamp").html(elem.desc.ndk_heartbeat.$date);
                    } else {
                        $("#" + cuname + "_timestamp").html("NA");
                    }
                    if (elem.desc.hasOwnProperty("ndk_group_set")) {
                        $("#" + cuname + "_type").html(elem.desc.ndk_group_set);
                    } else if (elem.desc.hasOwnProperty("ndk_sub_type")) {
                        $("#" + cuname + "_type").html(elem.desc.ndk_sub_type);

                    } else {
                        $("#" + cuname + "_type").html(elem.desc.ndk_type);
                    }
                    if (elem.desc.hasOwnProperty("ndk_host_name")) {
                        $("#" + cuname + "_hostname").html(elem.desc.ndk_host_name);
                    } else {
                        $("#" + cuname + "_hostname").html("NA");

                    }
                    $("#" + cuname + "_rpcaddress").html(elem.desc.ndk_rpc_addr);
                    if (elem.desc.hasOwnProperty("ndk_parent")) {
                        $("#" + cuname + "_parent").html(elem.desc.ndk_parent);

                    }
                }
            }
        });
    }

    function algoLoadFromFile(obj, target) {
        getFile("Script Loading", "select the Script to load", function (script) {
            var scriptTmp = {};
            var name = script['name'];
            var language = "bash";
            var regex = /.*[/\\](.*)$/;
            var match = regex.exec(name);
            if (match != null) {
                name = match[1];
            }
            if (name.includes(".sh") || name.includes(".bash")) {
                language = "BASH";
            }
            if (name.includes(".c") || name.includes(".C") || name.includes(".cpp") || name.includes(".CPP") || name.includes(".h")) {
                language = "CPP";
            }
            if (name.includes(".js")) {
                language = "JS";
            }
            if (name.includes(".py")) {
                language = "PYTHON";
            }
            if (name.includes(".lua")) {
                language = "LUA";
            }
            scriptTmp['script_name'] = name;
            scriptTmp['target'] = "remote";

            if (typeof target !== "undefined") {
                scriptTmp['target'] = target;
            }

            scriptTmp['eudk_script_content'] = script['data'];
            scriptTmp['eudk_script_language'] = language;
            scriptTmp['script_description'] = "Imported from " + script['name'];
            scriptTmp['default_argument'] = "";
            if (script.hasOwnProperty("eudk_script_keepalive")) {
                scriptTmp['eudk_script_keepalive'] = script['eudk_script_keepalive'];
            } else {
                scriptTmp['eudk_script_keepalive'] = false;
            }

            var templ = {
                $ref: "algo.json",
                format: "tabs"
            }

            jsonEditWindow("Loaded", templ, scriptTmp, algoSave, obj);
        });
    }

    jqccs.algoSave = function (json) {
        return algoSave(json);
    }
    function algoSave(json) {
        console.log("newScript :" + JSON.stringify(json));
        var proc = {};
        if (json.script_name == null || json.script_name == "") {
            alert("Script name cannot be empty");
            return;
        }
        if (json.eudk_script_content == null || json.eudk_script_content == "") {
            alert("Script content cannot be empty");
            return;
        }
        if (json.eudk_script_language == null || json.eudk_script_language == "") {
            alert("Script type cannot be empty");
            return;
        }
        //json['seq']=(new Date()).getTime();
        /*var str=str.replace(/[\u00A0-\u2666]/g, function(c) {
        return '&#' + c.charCodeAt(0) + ';';
        });*/
        json.eudk_script_content = btoa(unescape(encodeURIComponent(json.eudk_script_content)));

        json['eudk_script_language'] = ((json.eudk_script_language instanceof Array) ? json.eudk_script_language[0] : json.eudk_script_language);
        json['script_target'] = ((json.script_target instanceof Array) ? json.script_target[0] : json.script_target);
        json['script_group'] = ((json.script_group instanceof Array) ? json.script_group[0] : json.script_group);
        proc[json.script_name] = json;
        //    jchaos.variable("script", "set", proc, null);
        delete json['_id'];

        jchaos.search(json.script_name, "script", false, function (l) {
            var script_inst = l['found_script_list'];
            if (!(script_inst instanceof Array) || (script_inst.length == 0)) {
                //     json['seq'] = 0;
                jchaos.saveScript(json, function (data) {
                    console.log("Saving script:" + JSON.stringify(json));
                    instantMessage("Script " + json.script_name, " Saved", 1000, null, null, true)

                }, (bad) => {
                    instantMessage("Error Saving Script " + json.script_name, JSON.stringify(bad), 4000, null, null, false)

                });
            } else {
                confirm("Script Already Exist", "Do you want to replace:" + json.script_name, "Ok", function () {
                    var cnt = 0;
                    script_inst.forEach(function (elem) {
                        if (elem.seq == json.seq) {
                            console.log(cnt + "] Updating script:" + json.script_name + " with seq:" + json.seq, " content:" + JSON.stringify(json));
                            jchaos.saveScript(json, function (data) {
                                instantMessage("Updated Script " + json.script_name, "Saved", 2000, null, null, true)

                            }, (bad) => {
                                instantMessage("Error updating Script " + json.script_name, JSON.stringify(bad), 4000, null, null, false)

                            });
                            cnt++;
                        } else {
                            jchaos.rmScript(elem, function (data) {
                                cnt++;
                                console.log(cnt + "] removing script:" + json.script_name);

                                if (cnt == script_inst.length) {
                                    //        json['seq'] = 0;
                                    delete json['_id'];

                                    jchaos.saveScript(json, function (data) {
                                        console.log("Replacing script:" + json.script_name);
                                        instantMessage("Replacing Script " + json.script_name, "Saved", 1000, null, null, true)

                                    });
                                }
                            }, (bad) => {
                                instantMessage("Error removing Script " + json.script_name, JSON.stringify(bad), 4000, null, null, false)

                            });
                        }
                    });

                }, "Cancel");
            }
        });


    }

    function algoSaveInstance(json, obj) {
        var node_name_to_desc = obj.node_name_to_desc;
        jchaos.updateScriptInstance(json, node_name_to_desc[pather_selected], function (data) {
            console.log("saving Instance:" + JSON.stringify(json));
        });


    }

    function newMCCuSave(json, obj) {
        var node_selected = obj.node_selected;
        if ((node_selected == null || node_selected == "")) {
            if (json.ndk_parent == "") {
                alert("not US selected!");
                return 1;
            } else {
                console.log("using US specified into CU:" + json.ndk_parent);
                var us_list = jchaos.search(json.ndk_parent, "us", false, false);
                if (us_list.length == 0) {
                    alert("US specified in CU does not exist (create before)");
                    return -1;
                }
                node_selected = json.ndk_parent;
            }
        }
        if ((!json.hasOwnProperty("mc_server")) || json['mc_server'] == "") {
            alert("bad memcache server specified");
            return;
        }
        if (!json.hasOwnProperty("mc_keys") || (json.mc_keys.length == 0)) {
            alert("bad keys specified");
            return 1;
        }

        if (!json.hasOwnProperty("mc_imported_keys") || (json.mc_imported_keys.length == 0)) {
            alert("No Output specified!");
            return 1;
        }
        var cudk_load_param = {};
        cudk_load_param['dataset'] = [];
        json['ndk_parent'] = node_selected;
        json['control_unit_implementation'] = "DataImport";
        json.mc_imported_keys.forEach(function (elem) {
            var tmp = elem;
            tmp['type'] = elem.type[0];
            cudk_load_param['dataset'].push(tmp);
        });
        json['cudk_load_param'] = JSON.stringify(cudk_load_param);

        json['cudk_driver_description'] = [];
        var drv = {};
        /**
         * "server_url":["192.168.192.107:11211"],"data_keys":"DCTEL002_DYN","data_pack_len":256}
         * cudk_load_param:{"dataset": [{"name": "current","description": "readout current","type": "double","factor": 1.1,"offset": 24,"len": 8,"lbe":false}]}
         */
        var param = {};
        param["server_url"] = [json.mc_server];
        param["data_keys"] = json.mc_keys;
        param["data_pack_len"] = json.mc_buffer_size;
        drv['cudk_driver_description_name'] = "MemcachedDataImporterDriver"; //1.0.0
        drv['cudk_driver_description_version'] = "1.0.0";
        drv['cudk_driver_description_init_parameter'] = JSON.stringify(param);
        json['cudk_driver_description'].push(drv);
        var cudk_load_param = {};
        cudk_load_param['dataset'] = [];

        delete json.mc_imported_keys;
        delete json.mc_keys;
        delete json.mc_server;
        delete json.mc_buffer_size;

        if (json.hasOwnProperty("ndk_uid") && (json.ndk_uid != "")) {
            jchaos.node(node_selected, "get", "us", "", null, function (data) {
                console.log("adding \"" + json.ndk_uid + "\" to US:\"" + node_selected + "\"");
                json.ndk_parent = node_selected;
                if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
                    data.us_desc.cu_desc.push(json);
                } else {
                    data.us_desc["cu_desc"] = [json];
                }
                jchaos.node(node_selected, "set", "us", "", data.us_desc, function (data) {
                    console.log("unitServer [" + json.ndk_parent + "] save: \"" + json.ndk_uid + "\" value:" + JSON.stringify(json));
                });
            });
        } else {
            alert("missing required field ndk_uid");
            return 1;
        }
        return 0;
    }
    jqccs.busyWindow=function(enable,timeoutms){
        if(enable){
            $("div").addClass("loading");
        } else {
            $("div").removeClass("loading");
        }
        if(typeof timeout === "number"){
            setTimeout(()=>{$(this).removeClass("loading");},timeoutms);
        }

    }

    jqccs.tagConfigStart=function(selection,ok,bad){
        var templ = {
            $ref: "tag_entry.json",
            format: "tabs"
        }
        var def = {};
        def['tag_elements'] = selection;
        def['tag_type'] = "CYCLE";
        def['tag_name'] = "NONAME_" + (new Date()).getTime();
        def['tag_duration'] = 1;
        def['tag_desc'] = JSON.stringify(selection) + " at:" + (new Date());
        jsonEditWindow("TAG Editor", templ, def, function (data, obj) {
            var ttype = 2;
            if (data.tag_type == "CYCLE") {
                ttype = 1;
            }
            jchaos.tag(data.tag_name, selection, ttype, data.tag_duration,
                function (k) {
                    var tag_obj = jchaos.variable("tags", "get", null, null);
                    data.tag_ts = (new Date()).getTime();
                    data.tag_elements = selection;
                    tag_obj[data.tag_name] = data;
                    jchaos.variable("tags", "set", tag_obj, null);
                    jqccs.instantMessage("Creating " + data.tag_type + " Tag \"" + data.tag_name + "\"", " during " + data.tag_duration + " cycles", 3000, true);
                    if(typeof ok === "function"){
                        ok(data)
                    }

                },
                function (b) {
                    if(typeof bad === "function"){
                        bad(b);
                    } else {
                        jqccs.instantMessage("ERROR Creating " + data.tag_type + " Tag \"" + data.tag_name + "\"", " during " + data.tag_duration + " cycles", 5000, false);
                    }

                });
            return 0;
        }, null);

    }

    jqccs.jsonEditWindow = function (name, jsontemp, jsonin, editorFn, tmpObj, ok, nok, eventFn) {
        return jsonEditWindow(name, jsontemp, jsonin, editorFn, tmpObj, ok, nok, eventFn);
    }
    /***
     * 
     */
    function jsonEditWindow(name, jsontemp, jsonin, editorFn, tmpObj, ok, nok, eventFn) {
        var instant = $('<div id=edit-temp></div>').dialog({
            minWidth: $(window).width() / 2,
            minHeight: $(window).height() / 4,
            title: name,
            position: "center",
            resizable: true,
            buttons: [{
                text: "save",
                click: function (e) {
                    // editor validation
                    var errors = json_editor.validate();
                    var ret = 0;
                    if (errors.length) {
                        alert("JSON NOT VALID");
                        console.log(errors);
                    } else {
                        // It's valid!
                        var json_editor_value = json_editor.getValue();
                        try {
                            ret = editorFn(json_editor_value, tmpObj, ok, nok);
                        } catch (err) {
                            if ((typeof err === "object")) {
                                if (err.hasOwnProperty('error_status')) {
                                    instantMessage("Error ", err.error_status, 4000, false);
                                } else {
                                    instantMessage("Error ", JSON.stringify(err), 4000, false);

                                }
                            } else {
                                alert(err)

                            }
                        }
                    }
                    if (ret <= 0) {
                        $(this).remove();
                    }
                }
            }, {
                text: "download",
                click: function (e) {
                    var errors = json_editor.validate();

                    if (errors.length) {
                        alert("JSON NOT VALID");
                        console.log(errors);
                    } else {
                        // It's valid!
                        var json_editor_value = json_editor.getValue();
                        var blob = new Blob([JSON.stringify(json_editor_value)], { type: "json;charset=utf-8" });
                        saveAs(blob, name + ".json");
                    }

                }
            }, {
                text: "Upload",
                click: function (e) {
                    getFile("Upload", "upload the json", function (obj) {
                        $("#edit-temp").dialog('close');
                        console.log("uploaded:" + JSON.stringify(obj));
                        jsonEditWindow(name, jsontemp, obj, editorFn, tmpObj);
                        $(this).remove();
                    });

                }
            },
            {
                text: "close",
                click: function (e) {
                    $("#edit-temp").dialog('close');
                    $(this).remove();
                }
            }


            ],
            close: function (event, ui) {

                $(this).remove();
            },
            open: function () {
                console.log("Open Editor");
                var element = $("#edit-temp");
                var jopt = {};
                jopt['ajax'] = true;
                if (typeof jsontemp === "object") {
                    jopt['schema'] = jsontemp;
                }


                if (jsonin != null) {
                    jopt['startval'] = jsonin;
                }

                if (json_editor != null) {
                    delete json_editor;
                }
                JSONEditor.defaults.options.theme = 'bootstrap4';
                //JSONEditor.defaults.options.iconlib = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css";
                JSONEditor.defaults.options.iconlib = 'fontawesome3';
                // JSONEditor.defaults.options.iconlib ='fundation3';
                //JSONEditor.defaults.options.theme = 'bootstrap3';
                //JSONEditor.defaults.options.theme = 'jqueryui';
                // JSONEditor.defaults.iconlib = 'bootstrap3';
                json_editor = new JSONEditor(element.get(0), jopt);
                if (typeof eventFn === "function") {
                    // jopt['onEvent']=eventFn;
                    json_editor.on('change', () => { eventFn(json_editor); });
                }
                $(this).before($(this).parent().find('.ui-dialog-buttonpane'));

            }
        });
    }
    /***
     * JSON EDITOR
     */
    function jsonEdit(jsontemp, jsonin) {
        var element = $("#json-edit");
        var jopt = {};
        jopt['ajax'] = true;
        jopt['schema'] = jsontemp;


        if (jsonin != null) {
            jopt['starval'] = jsonin;
        }
        $("#json-edit").empty();
        if (json_editor != null) {
            delete json_editor;
        }
        JSONEditor.defaults.options.theme = 'bootstrap2';
        JSONEditor.defaults.options.iconlib = "bootstrap2";

        //    JSONEditor.defaults.iconlib = 'fontawesome4';
        json_editor = new JSONEditor(element.get(0), jopt);
        $("#mdl-jsonedit").modal("show");
        //json_editor.enable();
    }

    function element_sel(field, arr, add_all) {
        $(field).empty();
        //$(field).append("<option value='ALL'>ALL</option>");

        if (add_all == 1) {
            $(field).append("<option>--Select--</option>");

            $(field).append("<option value='ALL'>ALL</option>");

        }
        $(arr).each(function (i) {
            $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");

        });

    }

    function logSetup(tempObj) {
        $("a.show_log").click(function () {
            updateLog(tempObj.node_selected);
            //$("#mdl-log").modal("show");
        });
        $("#log_search").off('keypress');
        $("#log_search").keypress(function (e) {
            var sel = $("#log_search").val();
            updateLog(sel);
        });
        $("#log-search-go").off('click');
        $("#log-search-go").click(function () {
            var sel = $("#log_search").val();
            updateLog(sel);
            //$("#mdl-log").modal("show");
        });
        $("#log-close").click(function () {
            $("#mdl-log").modal("hide");

        });

        $("#mdl-log").resizable().draggable();
        // $("#mdl-log").dialog({width: hostWidth / 2,height: hostHeight / 4,resizable:true,draggable:true});

    }

    function snapSetup(tmpObj) {
        var node_multi_selected = tmpObj.node_multi_selected;
        var node_selected = tmpObj.node_selected;
        $("#snap-load").on('click', function () {
            $("#mdl-snap").modal("hide");
            getFile("LOAD JSON SNAPSHOT/SETPOINT", "select the JSON to load", function (config) {
                getEntryWindow("JSON Loaded", "Snapshot Name", "name", "Save", function (name) {
                    var vsets;
                    if (config instanceof Array) {
                        vsets = config;
                    } else {
                        vsets = [config];
                    }
                    vsets.forEach(function (elem) {
                        jchaos.snapshot(name, "set", "", JSON.stringify(elem), function (d) {
                            console.log("saving " + elem.name + " in " + name);
                        });
                    });
                }, "Cancel");
            });
        });
        $("#snap-save").on('click', function () {
            var value = $("#snap_save_name").val();
            if (snap_selected != "") {
                var dataset = jchaos.snapshot(snap_selected, "load", null, "", null);
                save_obj = {
                    obj: dataset,
                    fname: "snapshot_" + snap_selected,
                    fext: "json"
                };
                var blob = new Blob([JSON.stringify(save_obj.obj)], { type: "json;charset=utf-8" });
                saveAs(blob, save_obj.fname + "." + save_obj.fext);


            }
            /*if (node_multi_selected.length > 1) {
                jchaos.snapshot(value, "create", node_multi_selected, null, function() {});

            } else {
                jchaos.snapshot(value, "create", node_selected, null, function() {
                    updateSnapshotTable(tmpObj);

                });
            }*/
            //var snap_table = $(this).find('a.show_snapshot');
        });

        $("#snap-close").on('click', function () {
            $("#mdl-snap").modal("hide");
            cu_name_to_saved = [];
        });


        $("a.show_snapshot").click(function () {

            updateSnapshotTable(tmpObj, true);
        });

        $("#snap-delete").on('click', function (e) {
            $("#mdl-snap").modal("hide");

            if (snap_selected != "") {

                confirm("Delete Snapshot", "Your are deleting snapshot: " + snap_selected, "Ok", function () {

                    jchaos.snapshot(snap_selected, "delete", "", function () {
                        instantMessage(snap_selected + " deleted ", 1000, null, null, true);

                        updateSnapshotTable(tmpObj, true);

                    }, function (err) {
                        instantMessage(snap_selected + " error deleting " + err, 2000, null, null, false);

                    });
                }, "Cancel");

            } else {
                alert("No snapshot selected");
            }
        });

        $("#snap-show").on('click', function (e) {
            $("#mdl-snap").modal("hide");

            if (snap_selected != "") {
                jchaos.snapshot(snap_selected, "load", null, "", function (dataset) {
                    showJson("Snapshot " + snap_selected, dataset);
                });
            }
        });
        $("#snap-apply").on('click', function (e) {

            if (snap_selected != "") {
                $("#mdl-snap").modal("hide");

                jchaos.snapshot(snap_selected, "restore", "", function () {
                    instantMessage(snap_selected, " Sending restore ok .. ", 1000, true);

                }, function (err) {
                    instantMessage(snap_selected, " Sending error restoring: " + err, 2000, false);

                });
            } else {
                alert("no snapshot name selected");
            }
        });

    }


    /**
     * Setup CU Description
     */

    function descriptionSetup() {
        $("#description-close").on('click', function () {
            $("#mdl-description").modal("hide");
        });
        /*
        $("a.show_description").click(function () {
          jchaos.getDesc(node_selected, function(dataset){
            node_name_to_desc[node_selected]=dataset[0];
            var jsonhtml = json2html(dataset[0], options, node_selected);
            save_obj = {
              obj: dataset[0],
              fname: "description_" + jchaos.encodeName(node_selected),
              fext: "json"
            };
            if (jchaos.isCollapsable(dataset)) {
              jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
            }
            $("#desc_text").html("Description of " + node_selected);
            $("#cu-description").html(jsonhtml);
          });
        });
        */
    }
    function jsonEnableScriptContext(dom, scripts) {
        dom.contextMenu('destroy', '.json-key');

        dom.contextMenu({
            selector: '.json-toggle',
            build: function ($trigger, e) {
                var cuitem = {};
                //  var portdir = $(e.currentTarget).attr("portdir");
                var name = e.currentTarget.text;
                console.log("choosing " + name);
                if (scripts.hasOwnProperty(name) && scripts[name].hasOwnProperty("eudk_script_language")) {
                    var language = scripts[name].eudk_script_language.toUpperCase();
                    if (language == "JS" || language == "NODEJS") {
                        cuitem['run-script'] = { name: "Run Script " + name, script: scripts[name] };
                    }
                    cuitem['delete-script'] = { name: "Delete Script " + name, script: scripts[name] };
                    cuitem['save-script'] = { name: "Save Script " + name, script: scripts[name] };
                }
                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {

                        var fullname;
                        var script = options.commands[cmd].script;
                        if (cmd == "run-script") {
                            console.log("Running script " + JSON.stringify(script));
                            jchaos.loadScript(script.script_name, script.seq, function (data) {
                                if (typeof data === "object" && data.hasOwnProperty('eudk_script_content')) {
                                    var obj = atob(data['eudk_script_content']);
                                    jqccs.execConsole(script.script_name, obj);
                                } else {
                                    instantMessage("Empty content ", script.script_name, 5000, false);

                                }
                            }, function (bad) {
                                instantMessage("Error retriving ", script.script_name, 5000, false);

                            });

                        } else if (cmd == "delete-script") {
                            console.log("Delete script ");
                            confirm("Delete script", "Your are deleting Script: " + script.scriot_name, "Ok", function () {
                                jchaos.rmScript(script.scriot_name, function (data) {
                                    instantMessage("Remove Script", "removed:" + script.scriot_name, 2000);

                                });

                            }, "Cancel");

                        } else if (cmd == "save-script") {
                            jchaos.loadScript(script.scriot_name, script.seq, function (data) {

                                var obj = atob(data['eudk_script_content']);
                                var blob = new Blob([obj], { type: "json;charset=utf-8" });
                                saveAs(blob, data['script_name']);
                            });

                        }
                        return;
                    },
                    items: cuitem
                }
            }
        });
    }
    jqccs.createEditGraph=function(def,cb,bad){
        var templ = {
            $ref: "graph.json",
            format: "tabs"
        }
        var d =def;
        if(d === undefined){
            d={};
        }
        jqccs.jsonEditWindow("Graph ", templ,d, (gtsave)=>{
            jchaos.variable("graphs", "get", function (gphs) {
                if(gtsave.hasOwnProperty("name") && gtsave['name']!=""){
                if(typeof gphs !== "object"){
                    gphs={}

                    
                }

                gphs[gtsave.name]=gtsave;
                gphs[gtsave.name]["time"]=jchaos.getDateTime();
                jchaos.variable("graphs", "set",gphs, function (gphs) {
                    if(typeof cb === "function"){
                        cb(gphs)
                    }
                    jqccs.instantMessage("Graph", "Graph " + gtsave.name + " uploaded", 2000, true);

                },bad);

            } else {
                jqccs.instantMessage("Graph", "Invalid graph name", 5000, false);
                if(bad!== "undefined"){
                    bad();
                }
            }


        },bad);
        });
        
    }
    function jsonEnableDSContext(node_selected) {
        $.contextMenu('destroy', '.json-key');

        $.contextMenu({
            selector: '.json-key',
            build: function ($trigger, e) {
                var cuitem = {};
                //  var portdir = $(e.currentTarget).attr("portdir");
                var portname = $(e.currentTarget).attr("portname");
                var portarray = $(e.currentTarget).attr("portarray");
                cuitem['show-graph'] = { name: "Show Graphs.." };
                var cnt = 0;
                
                var subitem = {};
                if((active_plots !== undefined)&& (typeof active_plots === "object")){

                    for(var k in active_plots){
                        subitem['graph-'+k] = { name: k,callback: function(key, opt){
                            jchaos.variable("graphs", "get", (gphs)=>{

                                if(gphs.hasOwnProperty(k)){
                                    var graph=gphs[k];
                                    var tr={
                                        "name":portname,
                                        "x":"timestamp",
                                        "y":portname
                                    }
                                    if(!(graph['traces'] instanceof Array)){
                                        graph['traces']=[];
                                    }
                                    graph['traces'].push(tr);

                                }
                                jqccs.createEditGraph(graph);

                            });

                           /* var tr={
                                "name":portname,
                                "x":"timestamp",
                                "y":portname
                            }
                            var graph={};
                            graph['name']=portname;
                            graph['traces']=[];
                            graph['traces'].push(tr);

                            jqccs.createEditGraph(graph);*/

                        }};
                        cnt++;
                    }
                }
                if(cnt>0){
                   // if (portarray == "0") {
                       // cuitem['add-plot-x'] = { name: "Plot " + portname + " on X","items":subitem };
                        cuitem['add-plot-y'] = { name: "Plot " + portname + " on ","items":subitem };
                   //     cuitem['add-plot-histo'] = { name: "Histogram " + portname,"items":subitem  };
    
                   // } else {
                      //  cuitem['add-plot-x'] = { name: "Plot Array(" + portarray + ") " + portname + "[] on X","items":subitem  };
                   //     cuitem['add-plot-y'] = { name: "Plot Array(" + portarray + ") " + portname + "[] on Y","items":subitem  };
                   //     cuitem['add-plot-histo'] = { name: "Histogram Array(" + portarray + ") " + portname + "[] on X","items":subitem  };
    
                   // }
                } else {
                    //if (portarray == "0") {
                        cuitem['new-plot-y'] = { name: "New Plot " + portname + "  ",callback: function(key, opt){
                            var tr={
                                "name":portname,
                                "x":"timestamp",
                                "y":portname
                            }
                            var graph={};
                            graph['name']=portname;
                            graph['traces']=[];
                            graph['traces'].push(tr);

                            jqccs.createEditGraph(graph);

                        }
                   // };
                     //   cuitem['new-plot-y'] = { name: "Plot " + portname + " on Y" };
                     //   cuitem['new-plot-histo'] = { name: "Histogram " + portname,"items":subitem  };
    
                    } /*else {
                        cuitem['new-plot-y'] = { name: "New Plot Array(" + portarray + ") " + portname + "[]  ",callback: function(key, opt){ alert("plotting:"+JSON.stringify(opt));} };
                      //  cuitem['new-plot-y'] = { name: "Plot Array(" + portarray + ") " + portname + "[] on Y","items":subitem  };
                     //   cuitem['new-plot-histo'] = { name: "Histogram Array(" + portarray + ") " + portname + "[] on X","items":subitem  };
    
                    }*/
                }
                



                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {

                        var fullname;
                        if (portarray == "0") {
                            //fullname = node_selected + "/" + portdir + "/" + portname;
                            fullname = portname;
                        } else {
                            //fullname = node_selected + "/" + portdir + "/" + portname + "[0]";
                            fullname = portname + "[0]";
                        }
                        if (cmd == "show-graph") {
                            graph_selected = null;
                            trace_list = [];
                            $("#table_trace").find("tr:gt(0)").remove();

                            $("#mdl-graph-list").modal("show");
                        } else if (cmd == "plot-x") {
                            graph_selected = null;
                            trace_list = [];
                            $("#table_trace").find("tr:gt(0)").remove();

                            $("#mdl-graph").modal("show");

                            $("#trace-name").val(fullname);
                            $("#xvar").val(fullname);
                            $("#graph_save_name").val(jchaos.encodeName(fullname));

                        } else if (cmd == "plot-y") {
                            graph_selected = null;
                            trace_list = [];
                            $("#table_trace").find("tr:gt(0)").remove();

                            $("#mdl-graph").modal("show");

                            $("#trace-name").val(fullname);
                            $("#yvar").val(fullname);
                            $("#graph_save_name").val(jchaos.encodeName(fullname));

                        } else if (cmd == "plot-histo") {
                            graph_selected = null;
                            trace_list = [];
                            $("#table_trace").find("tr:gt(0)").remove();

                            $("#mdl-graph").modal("show");

                            $("#trace-name").val(fullname);
                            $("#yvar").val("histogram");
                            $("#xvar").val(fullname);
                            $("#xtype").val("linear");
                            $("#ytype").val("linear");
                            $("#graph_save_name").val(jchaos.encodeName(fullname));

                            $("#graphtype").val("histogram");

                        }
                        return;
                    },
                    items: cuitem
                }
            }
        });
    }
    /***
     * Setup CU Dataset
     * **/

    function datasetSetup(tmpObj) {
        var node_selected = tmpObj.node_selected;
        $("a.show_dataset").on('click', function () {
            var dataset = jchaos.getChannel(node_selected, -1, null);
            var converted = convertBinaryToArrays(dataset[0]);
            var jsonhtml = json2html(converted, options, node_selected);
            save_obj = {
                obj: dataset[0],
                fname: "dataset_" + jchaos.encodeName(node_selected),
                fext: "json"
            };

            if (jchaos.isCollapsable(dataset[0])) {
                jsonhtml = '<a class="json-toggle"></a>' + jsonhtml;
            }

            $("#cu-dataset").html(jsonhtml);

            $(".json-key").draggable({

                cursor: 'move',
                helper: 'clone',
                containment: 'window'
            });
            $("#X-axis").droppable({
                drop: function (e, ui) {
                    var draggable = ui.draggable;
                    alert('Something X "' + draggable.attr('id') + '" was dropped onto me!');
                }
            });

            $("#Y-axis").droppable({
                drop: function (e, ui) {
                    var draggable = ui.draggable;
                    alert('Something Y "' + draggable.attr('id') + '" was dropped onto me!');

                }
            });
            jsonEnableDSContext(node_selected);
        });

        $("#dataset-close").on('click', function () {
            $("#mdl-dataset").modal("hide");
        });
        if (notupdate_dataset) {
            $("#dataset-update").html('Update');
        } else {
            $("#dataset-update").html('Pause');
        }
        $("#dataset-update").on('click', function () {
            notupdate_dataset = !notupdate_dataset;
            if (notupdate_dataset) {
                $("#dataset-update").html('Update');
            } else {
                $("#dataset-update").html('Pause');
            }
        });
    }


    /**
     * 
     * JSON SETUP
     */


    function jsonSetup(dom, tmpObj) {
        var collapsed = options.collapsed;
        var node_selected = "none";
        if (tmpObj != null && tmpObj.hasOwnProperty("node_selected")) {
            node_selected = tmpObj.node_selected;
            tmpObj['json_editing'] = false;

        }
        jqccs.jsonSetup(dom, function (e) {
            tmpObj['json_editing'] = true;

        }, function (e) {
            if (e.keyCode == 13) {

                var value = e.target.value;
                var attrname = e.target.name;
                var desc = jchaos.decodeCUPath(attrname);
                jchaos.setAttribute(desc.cu, desc.var, value, function () {
                    instantMessage(desc.cu + " Attribute " + desc.dir, "\"" + desc.var + "\"=\"" + value + "\" sent", 1000, true)

                }, function () {
                    instantMessage(desc.cu + " Attribute Error " + desc.dir, "\"" + desc.var + "\"=\"" + value + "\" sent", 1000, false)

                });
                tmpObj['json_editing'] = false;

                return true;
            } else {
                return false;
            }
        })

    }
    /*
     * 
     * Setup Graphs
     */
    function graphSetup() {
        $("#mdl-graph").draggable();
        $("#mdl-graph-list").draggable();
        $('#mdl-graph-list').on('shown.bs.modal', function () {
            graph_selected = null;
        });

        $('#mdl-graph').on('shown.bs.modal', function () {
            var $radio = $("input:radio[name=graph-shift]");
            if ($radio.is(":checked") === false) {
                $radio.filter("[value=false]").prop('checked', true);
            }
            if (($("#trace-name").val() != "") && (($("#xvar").val() != "") || ($("#yvar").val() != ""))) {
                $("#trace-add").attr('title', "Add Trace");
                $("#trace-add").removeAttr('disabled');
            } else {
                $("#trace-add").attr('title', "You must specify a valid trace name and at least a X/Y path");
                $("#trace-add").attr('disabled', true);

            }
            if (($("#xvar").val() == "") && ($("#xtype option:selected").val() == "datetime")) {
                $("#xvar").val("timestamp")
            }
            if (($("#yvar").val() == "") && ($("#ytype option:selected").val() == "datetime")) {
                $("#yvar").val("timestamp")
            }

            if ((graph_selected != null) && (high_graphs[graph_selected] != null)) {
                // initialize with the value of selected graph
                var info = high_graphs[graph_selected].highchart_opt;
                $("#graph_save_name").val(graph_selected);
                if (info.xAxis instanceof Array) {
                    $("#xname").val(info.xAxis[0].title.text);

                } else {
                    $("#xname").val(info.xAxis.title.text);
                }

                // $("#xtype option:selected").val(info.xAxis.type);
                if (info.xAxis.type != null && info.xAxis.type != "") {
                    $("#xtype").val(info.xAxis.type);
                }

                $("#xmax").val(info.xAxis.max);
                $("#xmin").val(info.xAxis.min);
                if (info.yAxis instanceof Array) {
                    $("#yname").val(info.yAxis[0].title.text);
                } else {
                    $("#yname").val(info.yAxis.title.text);
                }
                //    $("#ytype option:selected").val(info.yAxis.type);
                if (info.yAxis.type != null && info.yAxis.type != "") {
                    $("#ytype").val(info.yAxis.type);
                }

                $("#ymax").val(info.yAxis.max);
                $("#ymin").val(info.yAxis.min);
                $("#graph-width").val(high_graphs[graph_selected].width);
                $("#graph-high").val(high_graphs[graph_selected].height);
                $("#graph-update").val(high_graphs[graph_selected].update);
                $("#graph-keepseconds").val(info.timebuffer);
                if (info.shift == "true") {
                    $radio.filter("[value=true]").prop('checked', true);

                } else {
                    $radio.filter("[value=false]").prop('checked', true);

                }

                $("#trace-type").val(info.tracetype);
                $("#graphtype").val(info.chart.type);
                $("#table_graph_items").find("tr:gt(0)").remove();
                var trace = high_graphs[graph_selected].trace;
                for (var k = 0; k < trace.length; k++) {
                    var tname = jchaos.encodeName(trace[k].name);
                    var xpath, ypath;
                    xpath = encodeCUPath(trace[k].x);
                    ypath = encodeCUPath(trace[k].y);
                    var color = "";
                    if (trace[k].hasOwnProperty("color")) {
                        if (trace[k].color != null) {
                            color = trace[k].color;
                        }
                    }
                    $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '" tracename="' + trace[k].name + '""><td>' + trace[k].name + '</td><td>' + xpath + '</td><td>' + ypath + '</td><td>' + color + '</td></tr>');

                };
            }

        });
        $(main_dom).on("click", "#table_graph_items tbody tr", function (e) {
            $(".row_element").removeClass("bg-warning");
            var tname = $(this).attr("tracename");
            $(this).addClass("bg-warning");
            $("#trace-name").val(tname);
            var tlist = getElementByName(tname, trace_list);
            $("#xvar").val(encodeCUPath(tlist.x));
            $("#yvar").val(encodeCUPath(tlist.y));
            if (tlist.hasOwnProperty("color")) {
                $("#trace-color").val(tlist.color);
            }
            trace_selected = $(this).attr("id");
        });
        $("#mdl-graph").css('width', 800);
        $("#mdl-graph-list").css('width', 800);

        $("#graph-save").attr('disabled', true);
        $("#graph-run").attr('disabled', true);
        $("#graph-close").off('click');
        $("#graph-save").off('click');
        $("#graph-delete").off('click');

        $("#graph-list-close").off('click');
        $("#graph-list-edit").off('click');
        $("#graph-list-save").off('click');
        $("#graph-list-upload").off('click');

        $("#graph-close").on('click', function () {
            $("#mdl-graph").modal("hide");

        });
        $("xtype").on("change", function () {
            if ($("#xtype option:selected").val() == "datetime") {
                $("#xvar").val("timestamp");
            }
        });
        $("ytype").on("change", function () {
            if ($("#ytype option:selected").val() == "datetime") {
                $("#yvar").val("timestamp");
            }
        });
        $("#graph-list-close").on('click', function () {
            $("#mdl-graph-list").modal("hide");

        });

        $("#graph-save").on('click', function () {
            saveGraph(function () {
                graph_selected = $("#graph_save_name").val();
                $("#graph-save").effect("highlight", { color: 'green' }, 1000);
                $("#graph-run").removeAttr('disabled');
                instantMessage("Graph", "Graph " + graphname + " saved", 2000, true);
            }, function () {
                instantMessage("Graph", "Graph " + graphname + " Error saving", 2000, false);

            });


        });
        $("#graph-run").off('click');

        $("#graph-run").on('click', function () {
            $("#graph-run").effect("highlight", { color: 'green' }, 1000);

            runGraph(graph_selected);
            $("#mdl-graph").modal("hide");

        });
        $("#graph_search").off('keypress');
        $("#graph_search").on('keypress', function (event) {
            var t = $(event.target);
            var value = $(t).val();
            updateGraph(value);
            // if ((event.which == 13)) {
            //  var name = $(t).attr("cuname");
            // var value = $(t).attr("value");
            // updateGraph( value);

            // }

        });
        $("#graph-list-run").off('click');
        $("#graph-list-run").on('click', function () {
            runGraph(graph_selected);
            $("#mdl-graph-list").modal("hide");

        });
        $("#graph-list-edit").on('click', function () {
            if (graph_selected != null) {
                $("#mdl-graph-list").modal("hide");
                $("#mdl-graph").modal("show");
            }
        });
        $("#graph-list-save").on('click', function () {
            if ((graph_selected != null) && (high_graphs[graph_selected] != null)) {
                var tmp = {
                    graph_name: graph_selected,
                    graph_settings: high_graphs[graph_selected]
                };
                var blob = new Blob([JSON.stringify(tmp)], { type: "json;charset=utf-8" });
                saveAs(blob, graph_selected + ".json");
            }
        });
        $("#graph-list-upload").on('click', function () {
            getFile("Graph Loading", "select a graph to  upload", function (g) {
                if (g.hasOwnProperty("graph_name") && g.hasOwnProperty("graph_settings")) {
                    high_graphs[g.graph_name] = g.graph_settings;
                    jchaos.variable("highcharts", "set", high_graphs, function () {
                        instantMessage("Graph", "Graph " + g.graph_name + " uploaded", 2000, true);

                    });


                }
            });

        });
        $("#graph-delete").on('click', function () {
            if (graph_selected == null) {
                alert("no graph selected");
                return;
            }
            $("#mdl-graph-list").modal("hide");

            confirm("Delete Graph", "Your are deleting GRAPH: " + graph_selected, "Ok", function () {

                delete high_graphs[graph_selected];


                if (active_plots[graph_selected] != null) {
                    if (active_plots[graph_selected].hasOwnProperty('interval')) {

                        clearInterval(active_plots[graph_selected].interval);
                        delete active_plots[graph_selected].interval;
                    }
                    $("#dialog-" + active_plots[grap_selected].count).modal("hide");
                    delete active_plots[graph_selected];
                }
                graph_selected = null;
                trace_list = [];
                jchaos.variable("highcharts", "set", high_graphs, null);

                updateGraph($("#graph_search").val());
            }, "Cancel", function () {
                $("#mdl-graph-list").modal("show");

            });
        });




        $("#graph_save_name").on("keypress", function () {
            if ($("#graph_save_name").val() != "") {
                var rowCount = $('#table_graph_items tr').length;
                if (rowCount > 1) {
                    $("#graph-save").removeAttr('disabled');
                    $("#graph-save").attr('title', "Save current Trace");

                } else {
                    $("#graph-save").attr('disabled', true);
                    $("#graph-save").attr('title', "At least one trace must be present ");
                }

            } else {
                $("#graph-save").attr('title', "Must specify a valid Graph name");
                $("#graph-save").attr('disabled', true);

            }
        });
        $("#trace-add").click(function () {
            var tracename = $("#trace-name").val();
            var xpath = $("#xvar").val();
            var ypath = $("#yvar").val();
            var xtype = $("#xtype option:selected").val();
            var ytype = $("#ytype option:selected").val();
            var trace_color = $("#trace-color").val();
            var tmpx, tmpy, tmpc;
            if (trace_color != null && trace_color != "") {
                tmpc = trace_color;
            }
            if (xtype == "datetime") {
                xpath = "timestamp";
            }
            if (ytype == "datetime") {
                ypath = "timestamp";
            }
            tmpx = jchaos.decodeCUPath(xpath);
            tmpy = jchaos.decodeCUPath(ypath);
            var tname = jchaos.encodeName(tracename);
            $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '" tracename="' + tracename + '"><td>' + tracename + '</td><td>' + xpath + '</td><td>' + ypath + '</td></tr>');
            if (tmpx == null && tmpy == null) {
                alert("INVALID scale type options");
            }
            trace_selected = tname;
            var telem = {
                name: tracename,
                x: tmpx,
                y: tmpy,
                color: tmpc
            };
            trace_list.push(telem);

        });

        $("#trace-replace").click(function () {
            var tracename = $("#trace-name").val();
            var trace_color = $("#trace-color").val();
            var xpath = $("#xvar").val();
            var ypath = $("#yvar").val();
            var tmpx, tmpy, tmpc;
            if (trace_color != null && trace_color != "") {
                tmpc = trace_color;
            }
            if (xpath == "") {
                xpath = "timestamp";
            } else {
                tmpx = jchaos.decodeCUPath(xpath);
            }
            if (ypath == "") {
                ypath = "timestamp";
            } else {
                tmpy = jchaos.decodeCUPath(ypath);
            }
            if ((tmpx == null) && (tmpy == null)) {
                alert("INVALID paths");
                return;
            }


            var tname = jchaos.encodeName(tracename);
            var replace_row = '<tr class="row_element" id="trace-' + tname + '" tracename="' + tracename + '"><td>' + tracename + '</td><td>' + xpath + '</td><td>' + ypath + '</td><td>' + trace_color + '</td></tr>';
            var toreplaceTrace = $("#" + trace_selected).attr("tracename");

            $("#" + trace_selected).replaceWith(replace_row);

            var telem = {
                name: tracename,
                x: tmpx,
                y: tmpy,
                color: tmpc
            };
            replaceElementByName(toreplaceTrace, telem, trace_list);
            trace_selected = tname;
        });

        $("#trace-up").click(function (e) {
            var tname = $("#" + trace_selected);
            var prev = $(tname).prev();
            var index = $(tname).index();
            var index_prev = $(prev).index();

            $(tname).insertBefore(prev);

            if (index > index_prev) {
                var elem = trace_list[index - 1];
                trace_list[index - 1] = trace_list[index];
                trace_list[index] = elem;
            }

        });
        $("#trace-down").click(function (e) {
            var tname = $("#" + trace_selected);
            var next = $(tname).next();
            var index = $(tname).index();
            var index_after = $(next).index();

            $(tname).insertAfter(next);
            if (index_after > index) {
                var elem = trace_list[index_after];
                trace_list[index_after] = trace_list[index];
                trace_list[index] = elem;
            }

        });
        $("#trace-rem").click(function () {
            if (trace_selected != null) {
                var tname = $("#" + trace_selected).attr("tracename");
                $("#" + trace_selected).remove();
                removeElementByName(tname, trace_list);
                trace_selected = null;

            }
        });

        $("a.show_graph").on('click', function () {
            updateGraph();
            //$("#mdl-log").modal("show");
        });
    }


    jqccs.updateInterfaceCU = function (t) {
        return updateInterfaceCU(t);
    }
    /****
     * 
     * Setup CU Interface
     * 
     */
    // the interface has all the main elements
    function updateInterfaceCU(tmpObj) {
        var template = tmpObj.type;
        var descs = jchaos.getDesc(tmpObj['elems'], null);
        if (descs instanceof Array) {
            descs.forEach(function (elem, id) {
                var name = tmpObj['elems'][id];
                if (!elem.hasOwnProperty("ndk_parent") && (elem.hasOwnProperty("instance_description") && elem.instance_description.hasOwnProperty("ndk_parent"))) {
                    elem["ndk_parent"] = elem.instance_description.ndk_parent;
                }

                tmpObj.node_name_to_desc[name] = elem;
            });
        }
        $("#main_table-" + template + " tbody tr").off('click');
        $("#main_table-" + template + " tbody tr").click(function (e) {
            mainTableCommonHandling("main_table-" + template, tmpObj, e);
            if (tmpObj.hasOwnProperty('tableClickFn')) {
                tmpObj.tableClickFn(tmpObj);
            }
        });
        /*     n = $('#main_table-' + template + ' tr').size();
             if (n > 22) { 
                 $("#table-scroll").css('height', '280px');
             } else {
                 $("#table-scroll").css('height', '');
             }
     */

        $(".setSchedule").off('keypress');
        $(".setSchedule").on('keypress', function (event) {
            var t = $(event.target);

            if ((event.which == 13)) {
                //  var name = $(t).attr("cuname");
                var value = $(t).val();
                jchaos.setSched(tmpObj.node_multi_selected, value, function () {
                    instantMessage("Set scheduling", "to " + value + " us Hz:" + 1000000 / Number(value), 2000, true);

                }, function (err) {
                    instantMessage("ERROR Set scheduling", "to " + value + " err:" + err, 2000, false);

                });

            }
        });
        $(".cucmd").click(function () {
            var alias = $(this).attr("cucmdid");
            var parvalue = $(this).attr("cucmdvalue");
            var mult = $(this).attr("cucmdvalueMult");
            var complete_command = false;
            var cmdparam = {};
            var cuselection;
            if (tmpObj.node_multi_selected.length > 0) {
                cuselection = tmpObj.node_multi_selected;
            } else {
                cuselection = tmpObj.node_selected;
            }
            if (alias == "cu_clear_current_cmd") {
                jchaos.node(cuselection, "killcmd", "cu", function () {
                    instantMessage("Clear Current Command", "Clearing last command OK", 1000, true);
                }, function () {
                    instantMessage("ERROR Clear Current Command", "Clearing last command ", 3000, false);
                });
                return;
            }

            if (parvalue != null) {
                try {
                    cmdparam = JSON.parse(parvalue);
                    if (cmdparam instanceof Object) {
                        for (var key in cmdparam) {
                            if ($("#" + alias + "_" + key).length) {
                                var inputType = $("#" + alias + "_" + key).attr('type');
                                if (inputType == "number") {
                                    cmdparam[key] = Number($("#" + alias + "_" + key).val());
                                } else {
                                    cmdparam[key] = $("#" + alias + "_" + key).val();

                                }
                            }
                        }
                        complete_command = true;
                    }
                } catch (e) {

                }
            }
            if (!complete_command) {
                var arglist;
                var arguments = {};
                arglist = retriveCurrentCmdArguments(tmpObj, alias);
                arglist.forEach(function (item, index) {
                    // search for values
                    if (parvalue == null) {
                        parvalue = $("#" + alias + "_" + item['name']).val();
                    }
                    if ((parvalue == null) && (item['optional'] == false)) {
                        alert("argument '" + item['name'] + "' is required in command:'" + alias + "'");
                        return;
                    }
                    if ((parvalue != null) && (mult != null)) {
                        parvalue = parvalue * mult;
                    }
                    item['value'] = parvalue;
                });

                cmdparam = buildCmdParams(arglist);
            }

            jchaos.sendCUCmd(cuselection, alias, cmdparam, function (d) {
                var pp;
                if ((cmdparam != null) && (cmdparam instanceof Object)) {
                    pp = JSON.stringify(cmdparam);
                } else {
                    pp = cmdparam;
                }
                instantMessage(cuselection, "Command:\"" + alias + "\" params:\"" + pp + "\" sent", 1000, true)
            }, function (d) {
                instantMessage(cuselection, "ERROR OCCURRED:" + d, 2000, 350, 400, false);

            });

        });

        $(".cucmdbase").click(function () {
            var cmd = $(this).attr("cucmdid");
            var cuselection;
            if (tmpObj.node_multi_selected.length > 0) {
                cuselection = tmpObj.node_multi_selected;
            } else {
                cuselection = tmpObj.node_selected;
            }
            if (cuselection != null && cmd != null) {
                if (cmd == "init") {
                    jchaos.node(cuselection, "init", "cu", function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                } else if (cmd == "deinit") {
                    jchaos.node(cuselection, "deinit", "cu", function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                } else if (cmd == "bypasson") {
                    jchaos.setBypass(cuselection, true, function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                    return;
                } else if (cmd == "bypassoff") {
                    jchaos.setBypass(cuselection, false, function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                    return;
                } else if (cmd == "load") {
                    jchaos.loadUnload(cuselection, true, function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                    return;
                } else if (cmd == "unload") {
                    jchaos.loadUnload(cuselection, false, function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                    return;
                } else if (cmd == "start") {
                    jchaos.node(cuselection, "start", "cu", function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                } else if (cmd == "stop") {
                    jchaos.node(cuselection, "stop", "cu", function (data) {
                        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                    }, function (data) {
                        instantMessage("Command ERROR", "Command:\"" + cmd + "\" sent", 1000, false);

                    });
                }

                jchaos.sendCUCmd(cuselection, cmd, "", function (data) {
                    instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);

                }, function (d) {
                    instantMessage(cuselection, "ERROR OCCURRED:" + d, 2000, 350, 400, false);

                });

            }
        });


        $("input[type=radio][name=live-enable]").change(function (e) {
            var dslive = ($("input[type=radio][name=live-enable]:checked").val() == "true");
            var dshisto = ($("input[type=radio][name=histo-enable]:checked").val() == "true");
            var dslog = ($("input[type=radio][name=log-enable]:checked").val() == "true");

            var storage_type = ((dslive) ? 2 : 0) | ((dshisto) ? 1 : 0) | ((dslog) ? 0x10 : 0);
            var node_multi_selected = tmpObj.node_multi_selected;
            jchaos.setProperty(node_multi_selected, [{ "dsndk_storage_type": storage_type }],
                function () { instantMessage("Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 1000, true); },
                function () { instantMessage("ERROR Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 3000, false); });

        });
        $("input[type=radio][name=log-enable]").change(function (e) {
            var dslive = ($("input[type=radio][name=log-enable]:checked").val() == "true");
            var dshisto = ($("input[type=radio][name=histo-enable]:checked").val() == "true");
            var dslog = ($("input[type=radio][name=log-enable]:checked").val() == "true");

            var storage_type = ((dslive) ? 2 : 0) | ((dshisto) ? 1 : 0) | ((dslog) ? 0x10 : 0);
            var node_multi_selected = tmpObj.node_multi_selected;
            jchaos.setProperty(node_multi_selected, [{ "dsndk_storage_type": storage_type }],
                function () { instantMessage("Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 1000, true); },
                function () { instantMessage("ERROR Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 3000, false); });

        });
        $("input[type=radio][name=histo-enable]").change(function (e) {
            var dslive = ($("input[type=radio][name=live-enable]:checked").val() == "true");
            var dshisto = ($("input[type=radio][name=histo-enable]:checked").val() == "true");
            var dslog = ($("input[type=radio][name=log-enable]:checked").val() == "true");

            var storage_type = ((dslive) ? 2 : 0) | ((dshisto) ? 1 : 0) | ((dslog) ? 0x10 : 0);
            var node_multi_selected = tmpObj.node_multi_selected;

            jchaos.setProperty(node_multi_selected, [{ "dsndk_storage_type": storage_type }],
                function () { instantMessage("Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 1000, true); },
                function () { instantMessage("ERROR Property Set", node_multi_selected[0] + " dsndk_storage_type:" + storage_type, 3000, false); });

        });
        $("#cu_clear_current_cmd").click(function (e) {
            var node_multi_selected = tmpObj.node_multi_selected;

            jchaos.node(node_multi_selected, "killcmd", "cu", function () {
                instantMessage("Clear Current Command", node_multi_selected + ":Clearing last command OK", 1000, true);
            }, function () {
                instantMessage("ERROR Clear Current Command", node_multi_selected[0] + ":Clearing last command ", 3000, false);
            });
        });

        $("#cu_clear_queue").click(function (e) {
            var node_multi_selected = tmpObj.node_multi_selected;

            jchaos.node(node_multi_selected, "clrcmdq", "cu", function () {
                instantMessage("Clear  Command Queue", node_multi_selected[0] + ":Clearing Command Queue OK", 1000, true);
            }, function () {
                instantMessage("ERROR Command Queue", node_multi_selected[0] + ":Clearing Command Queue ", 3000, false);
            });

        });

        $("#cu_full_commands_send").click(function (e) {
            //show the command
            var cmdselected = $("#cu_full_commands option:selected").val();
            generateCmdModal(tmpObj, cmdselected, curr_cu_selected);

        });
        $.contextMenu('destroy', '.cuMenu');

        $.contextMenu({
            selector: '.cuMenu',
            build: function ($trigger, e) {
                var template = tmpObj.type;
                var cuname = $(e.currentTarget).attr(template + "-name");
                var cuitem = updateCUMenu(tmpObj, cuname);
                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        //$('.context-menu-list').trigger('contextmenu:hide');
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {
                        // $('.context-menu-list').trigger('contextmenu:hide');

                        executeCUMenuCmd(tmpObj, cmd, options);
                        return;

                    },
                    items: cuitem
                }
            }


        });
        $("#mdl-dataset").draggable();
        $("#mdl-description").draggable();
        $("#mdl-snap").draggable();
        $("#mdl-log").resizable().draggable();
        /* configureSliderCommands(tmpObj,"slider-GAIN", "image_gain");
         configureSliderCommands(tmpObj,"slider-BRIGHTNESS", "image_brightness");
         configureSliderCommands(tmpObj,"slider-SHUTTER", "image_shutter");
         configureSliderCommands(tmpObj,"slider-CONTRAST", "image_contrast");
         configureSliderCommands(tmpObj,"slider-SHARPNESS", "image_sharpness");
         */
        $(main_dom).on("keypress", "input.cucmdattr", function (e) {
            if (e.keyCode == 13) {
                var value = e.target.value;
                var attrname = e.target.name;
                var desc = jchaos.decodeCUPath(attrname);
                jchaos.setAttribute(desc.cu, desc.var, value, function () {
                    instantMessage(desc.cu + " Attribute " + desc.dir, "\"" + desc.var + "\"=\"" + value + "\" sent", 1000, null, null, true)

                }, function () {
                    instantMessage(desc.cu + " Attribute Error " + desc.dir, "\"" + desc.var + "\"=\"" + value + "\" sent", 1000, null, null, false)

                });

                return false;
            }
            //var tt =prompt('type value');
            return this;
        });

    }

    function findTagsOf(tmpObj, currsel) {
        var names = [];
        var tags = jchaos.variable("tags", "get", null, null);
        tmpObj['tags'] = tags;
        for (var key in tags) {
            var elems = tags[key].tag_elements;
            elems.forEach(function (elem) {
                if (elem == currsel) {
                    names.push(key);
                }
            });
        }
        return names;
    }

    function executeCameraMenuCmd(tmpObj, cmd, opt) {
        if (cmd == 'set-reference') {
            var crop_opt = opt.items[cmd].crop_opt;

            var width = crop_opt.width.toFixed();
            var height = crop_opt.height.toFixed();
            var x = crop_opt.x.toFixed();
            var y = crop_opt.y.toFixed();

            jchaos.setAttribute(crop_opt.cu, "REFOFFSETX", String(x), function () {
                jchaos.setAttribute(crop_opt.cu, "REFOFFSETY", String(y), function () {
                    jchaos.setAttribute(crop_opt.cu, "REFSIZEX", String(width), function () {
                        jchaos.setAttribute(crop_opt.cu, "REFSIZEY", String(height), function () {
                            instantMessage("SET REFERENCE " + crop_opt.cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);

                        });
                    });
                });
            });
        } else if (cmd == 'set-roi') {
            var crop_opt = opt.items[cmd].crop_opt;

            console.log("CROP_OBJ:" + JSON.stringify(crop_opt));
            var x = crop_opt.x.toFixed();
            var y = crop_opt.y.toFixed();
            var width = crop_opt.width.toFixed();
            var height = crop_opt.height.toFixed();
            /*   jchaos.setAttribute(crop_opt.cu, "WIDTH", String(width),null);
               jchaos.setAttribute(crop_opt.cu, "HEIGHT", String(height),null);
               setTimeout(() => {
                   jchaos.setAttribute(crop_opt.cu, "OFFSETX", String(x), null);
               }, 1000);
               setTimeout(() => {
                   jchaos.setAttribute(crop_opt.cu, "OFFSETY", String(y), null);
               }, 1000);
   */
            console.log("setting WIDTH:" + width);

            jchaos.setAttribute(crop_opt.cu, "WIDTH", String(width), function () {
                console.log("setting HEIGHT:" + height);
                jchaos.setAttribute(crop_opt.cu, "HEIGHT", String(height), function () {
                    setTimeout(() => {
                        console.log("setting OFFSETX:" + x);

                        jchaos.setAttribute(crop_opt.cu, "OFFSETX", String(x), function () {
                            setTimeout(() => {
                                console.log("setting OFFSETY:" + y);

                                jchaos.setAttribute(crop_opt.cu, "OFFSETY", String(y), function () {
                                    instantMessage("ROI " + crop_opt.cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);
                                });
                            }, 1000);
                        });
                    }, 1000);
                });
            });
        } else if (cmd == 'exit-crop') {
            var encoden = jchaos.encodeName(opt.items[cmd].cu);
            $("#cameraImage-" + encoden).cropper('destroy');
        }
    }

    function executeCUMenuCmd(tmpObj, cmd, opt) {
        if (cmd == "quit") {
            return;
        }
        var node_multi_selected = tmpObj.node_multi_selected
        var currsel = tmpObj.node_multi_selected[0];
        if (cmd == "snapshot-cu") {
            var instUnique = (new Date()).getTime();

            getEntryWindow("Snapshotting", "Snap Name", "NONAME_" + instUnique, "Create", function (inst_name) {
                jchaos.snapshot(inst_name, "create", tmpObj.node_multi_selected, null, function () {
                    instantMessage("Snapshot \"" + inst_name + "\"", " created ", 1000, true);

                }, function () {
                    instantMessage("Snapshot ERROR \"" + inst_name + "\"", " NOT created ", 1000, false);

                });


            }, "Cancel");

        } else if (cmd == "tag-cu") {
            jqccs.tagConfigStart(node_multi_selected);
            
        } else if (cmd == "calibrate") {

            jchaos.command(tmpObj.node_multi_selected, { "act_name": "calibrateNodeUnit" }, function (data) {
                instantMessage("Calibration of:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent", 1000, true);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR Calibrating:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" :" + JSON.stringify(data), 5000, false);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "load") {

            jchaos.loadUnload(tmpObj.node_multi_selected, true, function (data) {
                instantMessage("LOAD ", "Command:\"" + cmd + "\" sent", 1000, true);
                //  $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR LOAD ", "Command:\"" + cmd + "\" sent", 1000, false);
                //  $('.context-menu-list').trigger('contextmenu:hide')

            });

        } else if (cmd == "unload") {
            jchaos.loadUnload(tmpObj.node_multi_selected, false, function (data) {
                instantMessage("UNLOAD ", "Command:\"" + cmd + "\" sent", 1000, true);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR UNLOAD ", "Command:\"" + cmd + "\" sent", 1000, true);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "init") {
            jchaos.node(tmpObj.node_multi_selected, "init", "cu", function (data) {
                instantMessage("INIT ", "Command:\"" + cmd + "\" sent", 1000, true);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR INIT ", "Command:\"" + cmd + "\" sent", 1000, false);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "deinit") {
            jchaos.node(tmpObj.node_multi_selected, "deinit", "cu", function (data) {
                instantMessage("DEINIT ", "Command:\"" + cmd + "\" sent", 1000, true);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR DEINIT ", "Command:\"" + cmd + "\" sent", 1000, false);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "start") {
            jchaos.node(tmpObj.node_multi_selected, "start", "cu", function (data) {
                instantMessage("START ", "Command:\"" + cmd + "\" sent", 1000, true);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("ERROR START ", "Command:\"" + cmd + "\" sent", 1000, false);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "stop") {
            jchaos.node(tmpObj.node_multi_selected, "stop", "cu", function (data) {
                instantMessage("STOP ", "Command:\"" + cmd + "\" sent", 1000, true);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            }, function (data) {
                instantMessage("STOP ", "Command:\"" + cmd + "\" sent", 1000, false);
                //    $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "open-ctrl") {
            var desc = tmpObj.node_name_to_desc[currsel];
            var tt = getInterfaceFromClass(desc.instance_description.control_unit_implementation);
            openControl("Control ", tmpObj, desc.instance_description.control_unit_implementation, 1000);


        } else if (cmd == "live-cu-disable") {
            jchaos.storageLive(node_multi_selected, 0,
                function () { instantMessage("Live CU disabled", node_multi_selected[0], 2000, true); },
                function () { instantMessage("Error Live CU disabled", node_multi_selected[0], 2000, false); });


        } else if (cmd == "live-cu-enable") {
            jchaos.storageLive(node_multi_selected, 1,
                function () { instantMessage("Live CU enabled", node_multi_selected[0], 2000, true); },
                function () { instantMessage("Error Live CU enabled", node_multi_selected[0], 2000, false); });

        } else if (cmd == "histo-cu-disable") {
            jchaos.storageHisto(node_multi_selected, 0,
                function () { instantMessage("History CU disabled", node_multi_selected[0], 2000, true); },
                function () { instantMessage("Error History CU disabled", node_multi_selected[0], 2000, false); });

        } else if (cmd == "histo-cu-enable") {
            jchaos.storageHisto(node_multi_selected, 1,
                function () { instantMessage("History CU disabled", node_multi_selected[0], 2000, true); },
                function () { instantMessage("Error History CU disabled", node_multi_selected[0], 2000, false); });

        } else if (cmd == "show-dataset") {
            showDataset(currsel, currsel, 1000, tmpObj);
        } else if(cmd== "save-default"){
            jchaos.saveSetPointAsDefault(currsel,1,(ok)=>{
                instantMessage("New default setpoint saved successfully, will be applied next Initialization", JSON.stringify(ok['attribute_value_descriptions']), 2000, true);
            },(bad)=>{
                instantMessage("Error setting setpoint:", JSON.stringify(bad), 4000, false); 

            });

        } else if(cmd== "save-readout-default"){
            jchaos.saveSetPointAsDefault(currsel,0,(ok)=>{
                instantMessage("New default setpoint saved successfully, will be applied next Initialization", JSON.stringify(ok['attribute_value_descriptions']), 2000, true);
            },(bad)=>{
                instantMessage("Error setting setpoint:", JSON.stringify(bad), 4000, false); 

            });

        } else if (cmd == "driver-prop") {
            //jchaos.sendCUCmd(tmpObj.node_multi_selected,"cu_prop_drv_get",null, function (data) {
            jchaos.command(tmpObj.node_multi_selected, { "act_name": "cu_prop_drv_get" }, function (data) {

                var origin_json = JSON.parse(JSON.stringify(data[0])); // not reference
                jqccs.editJSON("Driver Prop " + currsel, data[0], (json, fupdate) => {

                    var changed = {};
                    for (var key in json) {

                        if (JSON.stringify(json[key]) !== JSON.stringify(origin_json[key])) {
                            changed[key] = json[key];

                        }
                    }
                    var msg = {
                        "act_msg": changed,
                        "act_name": "cu_prop_drv_set"
                    };
                    console.log("sending changed:" + JSON.stringify(changed));
                    jchaos.command(tmpObj.node_multi_selected, msg, function (data) {
                        instantMessage("Setting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent", 5000, true);
                        jchaos.command(tmpObj.node_multi_selected, { "act_name": "cu_prop_drv_get" }, function (dd) {
                            //read back
                            fupdate(dd[0]);
                        });

                    }, (bad) => {
                        instantMessage("Error Setting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent err: " + JSON.stringify(bad), 5000, false);

                    });

                });

            }, function (data) {
                instantMessage("Getting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" :" + JSON.stringify(data), 5000, false);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "cu-prop") {
            jchaos.command(tmpObj.node_multi_selected, { "act_name": "ndk_get_prop" }, function (data) {
                var origin_json = JSON.parse(JSON.stringify(data[0])); // not reference
                jqccs.editJSON("CU/EU Prop " + currsel, data[0], (json) => {

                    var changed = {};
                    for (var key in json) {

                        if (JSON.stringify(json[key]) !== JSON.stringify(origin_json[key])) {
                            changed[key] = json[key];

                        }
                    }
                    var msg = {
                        "act_msg": changed,
                        "act_name": "ndk_set_prop"
                    };
                    console.log("sending changed:" + JSON.stringify(changed));
                    jchaos.command(tmpObj.node_multi_selected, msg, function (data) {
                        instantMessage("Setting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent", 5000, true);

                    }, (bad) => {
                        instantMessage("Error Setting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent err: " + JSON.stringify(bad), 5000, false);

                    });

                });
            }, function (data) {
                instantMessage("Getting Node prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" sent", 5000, false);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            });
        } else if (cmd == "show-desc") {
            jchaos.node(currsel, "desc","all",function (data) {
                tmpObj.node_name_to_desc[currsel] = data;

                showJson("Description " + currsel, data);
            });

        } else if (cmd == "show-tags") {
            jchaos.variable("tags", "get", null, function (tags) {
                var names = [];
                for (var key in tags) {
                    var elems = tags[key].tag_elements;
                    elems.forEach(function (elem) {
                        if (elem == currsel) {
                            names.push(tags[key]);
                        }
                    });
                }
                if (names.length) {
                    showJson("Tags of " + currsel, names);
                } else {
                    alert("No tag associated to " + currsel);
                }

            });


        } else if (cmd == "show-picture") {
            jchaos.getChannel(currsel, -1, function (imdata) {
                var cu = imdata[0];
                var refresh = 1000;
                if (cu.hasOwnProperty("health") && cu.health.hasOwnProperty("cuh_dso_prate")) {
                    refresh = 1000 / (cu.health.cuh_dso_prate);
                }
                if (cu && cu.hasOwnProperty("output") &&
                    cu.output.hasOwnProperty("FRAMEBUFFER") &&
                    cu.output.FRAMEBUFFER.hasOwnProperty("$binary") &&
                    cu.output.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
                    // $("#mdl-dataset").modal("hide");

                    showPicture(currsel + " output", currsel, refresh);

                } else {
                    alert(currsel + " cannot be viewed as a Picture, missing 'FRAMEBUFFER'");
                }
                if (cu && cu.hasOwnProperty("custom") &&
                    cu.custom.hasOwnProperty("FRAMEBUFFER") &&
                    cu.custom.FRAMEBUFFER.hasOwnProperty("$binary") &&
                    cu.custom.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
                    // $("#mdl-dataset").modal("hide");

                    showPicture(currsel + " custom", currsel, 0, 2);

                }
            }, function (err) {
                console.log(err);
            });

        } else if (cmd == "execute-jscript") {
            showScript("Scripts", "", "", (dom, scripts) => {
                jqccs.jsonSetup(dom, function (e) {

                }, function (e) {
                    if (e.keyCode == 13) {

                        return true;
                    } else {
                        return false;
                    }
                });
                $(".json-toggle").trigger("click");
                jsonEnableScriptContext(dom, scripts);

            });

        } else if (cmd == "load-jscript") {
            getFile("Control Script Loading", "select the Script to load", function (script) {
                var regex = /.*[/\\](.*)$/;
                var scriptTmp = {};
                var name = script['name'];
                var match = regex.exec(name);
                if (match != null) {
                    name = match[1];
                }
                if (name.includes(".js")) {
                    language = "JS";
                } else {
                    instantMessage("cannot load" + name, " You must load a .js extension:");
                    return;
                }
                var zone_selected = $("#zones option:selected").val();
                if (typeof zone_selected === "string") {
                    scriptTmp['group'] = zone_selected;
                } else {
                    scriptTmp['group'] = "SYSTEM";
                }
                scriptTmp['script_name'] = name;
                scriptTmp['target'] = "local";
                scriptTmp['eudk_script_content'] = script['data'];
                scriptTmp['eudk_script_language'] = language;
                scriptTmp['script_description'] = "Imported from " + script['name'];
                scriptTmp['default_argument'] = "";
                var templ = {
                    $ref: "algo.json",
                    format: "tabs"
                }

                jsonEditWindow("Loaded", templ, scriptTmp, algoSave, obj);
            });


        } else if (cmd == "history-cu-root") {
            createQueryDialog(function (query) {
                // var start_s = $.datepicker.formatDate("yymmddhhmmss", new Date(query.start));
                //var end_s = $.datepicker.formatDate("yymmddhhmmss", new Date(query.stop));
                //console.log("start:"+start_s + " end:"+end_s);
                // var start_s=new Date(query.start).toLocaleFormat("%y%m%d%h%m%s");
                var args = "(\"" + tmpObj.node_multi_selected[0] + "\"," + query.start + "," + query.stop + "," + query.chunk + "," + query.page + ")";

                runScript("CU2Tree.C", args);
            })

        } else if (cmd == "history-cu") {
            createQueryDialog(function (query) {
                //query call back
                progressBar("Retrive and Zip", "zipprogress", "zipping");
                jchaos.setOptions({ "timeout": 60000 });

                jchaos.fetchHistoryToZip(query.tag, tmpObj.node_multi_selected, query.start, query.stop, query.tag, function (meta) {
                    $("#zipprogress").progressbar("option", { value: parseInt(meta.percent.toFixed(2)) });
                    console.log("percent:" + parseInt(meta.percent.toFixed(2)));

                }, function (msg) {
                    $("#zipprogress").parent().remove();

                    instantMessage("fetchHistoryToZip ", "failed:" + msg, 3000, false);
                });


            }, function () {
                // open CB 
                var names = findTagsOf(tmpObj, currsel);
                element_sel("#select-tag", names, 0);
                $("#select-tag").on("click", function () {
                    var tagname = $("#select-tag option:selected").val();
                    $("#query-tag").val(tagname);
                    var tags = jchaos.variable("tags", "get", null, null);
                    if (tags.hasOwnProperty(tagname)) {
                        var tag = tags[tagname];
                        var desc = "<b>" + tag['tag_desc'] + "</b> involved:" + JSON.stringify(tag['tag_elements']);
                        // $("#query-start").val(tagname);
                        $("#query-tag").attr('title', desc);
                        $("#select-tag").attr('title', desc);
                    }

                });

            });

        } else if (cnd == 'set-roi') {
            return executeCameraMenuCmd(tmpObj, cmd, opt);
        } else {
            jchaos.sendCUCmd(tmpObj.node_multi_selected, cmd, "", function (data) {
                instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000, true);
                //   $('.context-menu-list').trigger('contextmenu:hide')

            }, function (d) {
                instantMessage(cuselection, "ERROR OCCURRED:" + d, 2000, false)

            });
        }
    }


    /**** 
     * 
     * NEW HANDLERS
     */
    function buildCUInterface(tempObj) {

        var html = '<div class="row">';

        html += '<div class="statbox purple col-sm-2" >';
        html += '<h3>Zone</h3>';
        html += '<select id="zones"></select>';
        html += '</div>';

        html += '<div class="statbox purple col-sm-2">';
        html += '<h3>Family</h3>';
        html += '<select id="elements"></select>';
        html += '</div>';

        html += '<div class="statbox purple col-sm-2">'
        html += '<h3>Interface</h3>';
        html += '<select id="classe"></select>';
        html += '</div>';

        html += '<div class="statbox purple row col-sm-3 align-items-center">'
        html += '<div class="col-sm-3">'
        html += '<label for="search-alive">Search: All</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
        html += '</div>'
        html += '<div class="col-sm-3">'
        html += '<label for="search-alive">Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
        html += '</div>'
        // html += '<h3 class="col-md-3">Search</h3>';

        html += '<input class="input-xlarge focused col-sm-6" id="search-chaos" title="Free form Search" type="text" value="">';
        html += '</div>';
        // html += generateActionBox();
        html += '</div>';
        html += generateModalActions();

        html += '<div class="chaosrow pageindex">';
        html += '<a href="#" class="chaositem previous_page round">&#8249;</a>';
        html += '<div id="page_number" class="chaositem">0/0</div>';
        html += '<a href="#" class="chaositem next_page round">&#8250;</a>';
        html += '</div>';

        html += '<div class="container-fluid" id="specific-table-' + tempObj.template + '"></div>';
        html += '<div class="container-fluid" id="specific-control-' + tempObj.template + '"></div>';
        return html;
    }

    function buildNodeInterface(tempObj) {
        var html = '<div class="row">';
        html += '<div class="statbox purple col-md-3">'
        html += '<h3>Node Type</h3>';
        html += '<select id="classe" size="auto"></select>';
        html += '</div>';

        html += '<div class="statbox purple row col-md-3">'
        html += '<div class="col-md-6">'
        html += '<label for="search-alive">Search All</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
        html += '</div>'
        html += '<div class="col-md-6">'
        html += '<label for="search-alive">Search Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true checked>';
        html += '</div>'

        // html += '<h3 class="col-md-3">Search</h3>';

        html += '<input class="input-xlarge focused col-md-6" id="search-chaos" title="Free form Search" type="text" value="">';
        html += '</div>';
        html += '</div>';
        html += '<div class="chaosrow pageindex">';
        html += '<a href="#" class="chaositem previous_page round">&#8249;</a>';
        html += '<div id="page_number" class="chaositem">0/0</div>';
        html += '<a href="#" class="chaositem next_page round">&#8250;</a>';
        html += '</div>';
        html += generateEditJson();
        html += '<div id="specific-table-' + tempObj.template + '"></div>';

        return html;
    }

    function setupCU(tempObj) {
        //    graphSetup(tempObj);
        //    snapSetup(tempObj);
        datasetSetup(tempObj);
        descriptionSetup(tempObj);
        //     logSetup(tempObj);
        mainCU(tempObj);
    }

    function setupNode(tempObj) {
        var list_cu = [];

        var $radio = $("input:radio[name=search-alive]");
        dashboard_settings.current_page = 0;

        if ($radio.is(":checked") === false) {
            $radio.filter("[value=true]").prop('checked', true);
        }

        element_sel('#classe', ["us", "agent", "cu", "webui", "mds", "root"], 1);
        $("#classe").off('change');
        $("#classe").change(function (e) {
            dashboard_settings.current_page = 0;

            interface2NodeList(tempObj, function (list_cu) {
                tempObj['elems'] = list_cu;

                updateInterface(tempObj);

            });
        });
        $("#search-chaos").keypress(function (e) {
            if (e.keyCode == 13) {
                dashboard_settings.current_page = 0;

                interface2NodeList(tempObj, function (list_cu) {
                    tempObj['elems'] = list_cu;

                    updateInterface(tempObj);

                });
            }
            //var tt =prompt('type value');
        });

        $("input[type=radio][name=search-alive]").change(function (e) {
            dashboard_settings.current_page = 0;

            interface2NodeList(tempObj, function (list_cu) {
                tempObj['elems'] = list_cu;
                updateInterface(tempObj);
            });

        });


    }

    function buildProcessInterface(tempObj) {
        var html = "";
        /*var html = '<div class="row">';
 
     html += '<div class="statbox purple" onTablet="col-md-6" onDesktop="col-md-2">';
     html += '<h3>Zones</h3>';
     html += '<select id="zones" size="auto"></select>';
     html += '</div>';
 
     html += '<div class="statbox purple" onTablet="col-md-6" onDesktop="col-md-2">';
     html += '<h3>Instances</h3>';
     html += '<select id="elements" size="auto"></select>';
     html += '</div>';
 
     html += '<div class="statbox purple" onTablet="col-md-4" onDesktop="col-md-2">'
     html += '<h3>Class Algorithm</h3>';
     html += '<select id="classe" size="auto"></select>';
     html += '</div>';
 
     html += '<div class="statbox purple row" onTablet="col-md-4" onDesktop="col-md-3">'
     html += '<div class="col-md-3">'
     html += '<label for="search-alive">Search All</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
     html += '</div>'
     html += '<div class="col-md-3">'
     html += '<label for="search-alive">Search Running</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
     html += '</div>'
     // html += '<h3 class="col-md-3">Search</h3>';
 
     html += '<input class="input-xlarge focused col-md-6" id="search-chaos" title="Free form Search" type="text" value="">';
     html += '</div>';
     //    html += generateActionBox();
     html += '</div>';
     html += generateEditJson();
     */
        html += '<div id="specific-table-' + tempObj.template + '"></div>';


        return html;
    }

    function updateProcessServer(tmpObj, cb) {
        jchaos.activeAgentList(function (agents) {
            tmpObj['agent_list'] = agents;
            if (typeof cb === "function") {
                cb(tmpObj);
            }

        })
    }

    function setupProcess(tempObj) {
        var list_eu = [];
        var list_eu_full = [];

        var list_class = [];
        var list_zone = [];
        if (tempObj.hasOwnProperty('update-server-interval')) {
            clearInterval('update-server-interval');
            delete tempObj['update-server-interval'];
        }
        updateProcessServer(tempObj);
        tempObj['update-server-interval'] = setInterval(function () {
            updateProcessServer(tempObj);
        }, 10000);

        updateProcessList(tempObj, function (tmpObj) {
            updateProcessTable(tmpObj);
            var proclist = tmpObj.data;

            //eu_process = jchaos.variable("eu", "get", null, null);
            for (var g in proclist) {
                getZoneClassElement(g, list_zone, list_class, list_eu);
                list_eu_full.push(g);
            }
            element_sel('#zones', list_zone, 1);
            element_sel('#classe', list_class, 1);
            element_sel('#elements', list_eu, 1);
        });
        updateInterface(tempObj);
        var $radio = $("input:radio[name=search-alive]");
        if ($radio.is(":checked") === false) {
            $radio.filter("[value=true]").prop('checked', true);
        }
        $("#zones").change(function () {
            var zone_selected = $("#zones option:selected").val();
            var alive = $("[input=search-alive]:checked").val()
            var str_name = $("#search-chaos").val();
            search_string = zone_selected;
            list_class = [];
            list_zone = [];
            list_eu = [];
            if (zone_selected == "--Select--") { //Disabilito la select dei magneti se non � selezionata la zona
                $("#elements").attr('disabled', 'disabled');
            } else {
                $("#elements").removeAttr('disabled');
            }
            if (zone_selected == "ALL") {
                search_string = "";

            } else {
                search_string = zone_selected;

            }
            list_eu = searchEu(search_string, alive, list_zone, list_class, list_eu);
            tempObj['elems'] = list_eu;
            updateInterface(tempObj);
        });

        $("#elements").change(function () {
            var element_selected = $("#elements option:selected").val();
            var zone_selected = $("#zones option:selected").val();
            search_string = "";
            if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
                search_string = zone_selected;
            }
            if ((element_selected != "ALL") && (node_selected != "--Select--")) {
                search_string += "/" + element_selected;
            }


            if (element_selected == "--Select--" || zone_selected == "--Select--") {
                $(".btn-main-function").hasClass("disabled");

            } else {
                $(".btn-main-function").removeClass("disabled");

            }
            $("#search-chaos").val(search_string);
            var alive = $("input[type=radio][name=search-alive]:checked").val()

            //  list_eu = searchEu(search_string, alive, list_zone, list_class, list_eu);
            //  tempObj['elems'] = list_eu;
            updateInterface(tempObj);

        });
        $("#classe").change(function () {
            var interface = $("#classe option:selected").val();
            var alive = $("input[type=radio][name=search-alive]:checked").val()
            var zone_selected = $("#zones option:selected").val();
            search_string = "";
            if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
                search_string = zone_selected;
            }
            if ((element_selected != "ALL") && (node_selected != "--Select--")) {
                search_string += "/" + interface;
            }
            list_eu = searchEu(search_string, alive, list_zone, list_class, list_eu);
            tempObj['elems'] = list_eu;
            updateInterface(tempObj);

        });
        $("#search-chaos").keypress(function (e) {
            if (e.keyCode == 13) {
                var interface = $("#classe").val();
                search_string = $(this).val();
                var alive = $("input[type=radio][name=search-alive]:checked").val()

                //  list_eu = searchEu(search_string, alive, list_zone, list_class, list_eu);
                //    tempObj['elems'] = list_eu;
                updateInterface(tempObj);
            }
            //var tt =prompt('type value');
        });

        $("input[type=radio][name=search-alive]").change(function (e) {
            var alive = $("input[type=radio][name=search-alive]:checked").val()
            list_eu = searchEu(search_string, alive, list_zone, list_class, list_eu);
            tempObj['elems'] = list_eu;
            updateInterface(tempObj);

        });

        $("#process_search").off('keypress');
        $("#process_search").on('keypress', function (event) {
            var t = $(event.target);
            var value = $(t).val();
            tempObj['filter'] = value;
            updateProcessInterface(tempObj);
        });

    }




    function updateGenericCU(tmpObj) {
        var node_live_selected = tmpObj.data;
        if (tmpObj.node_selected != null) {
            curr_cu_selected = node_live_selected[tmpObj.index];
            updateGenericControl(tmpObj, curr_cu_selected);

        }
        updateGenericTableDataset(tmpObj);
    }

    function checkLiveCU(tmpObj) {
        var node_live_selected = tmpObj.data;

        node_live_selected.forEach(function (elem, index) {
            var curr_time;
            var name = "";
            if (elem.hasOwnProperty("dpck_ats")) {
                curr_time = elem.dpck_ats;
            } else if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("dpck_ats")) {
                curr_time = elem.health.dpck_ats;
            } else if (elem.hasOwnProperty("output") && elem.output.hasOwnProperty("dpck_ats")) {
                curr_time = elem.output.dpck_ats;
            }
            if (elem.hasOwnProperty("ndk_uid")) {
                name = elem.ndk_uid;
            } else if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("ndk_uid")) {
                name = elem.health.ndk_uid;
            } else if (elem.hasOwnProperty("output") && elem.output.hasOwnProperty("ndk_uid")) {
                name = elem.output.ndk_uid;
            }
            var ename = jchaos.encodeName(name);

            if ((curr_time != null) && (name != null)) {
                if (tmpObj.health_time_stamp_old.hasOwnProperty(name) && ((tmpObj.health_time_stamp_old[name] == 0) || (tmpObj.health_time_stamp_old[name] == null))) {
                    tmpObj.off_line[name] = 2; // just contacted;
                    tmpObj.health_time_stamp_old[name] = curr_time;
                    $("#" + ename).css('color', 'orange');
                    $("#" + ename).find('td').css('color', 'orange');
                } else {
                    var diff = (curr_time - tmpObj.health_time_stamp_old[name]);
                    if (diff != 0) {
                        $("#" + ename).css('color', 'green');
                        $("#" + ename).find('td').css('color', 'green');

                        tmpObj.off_line[name] = 0;

                    } else {
                        $("#" + ename).css('color', 'black');
                        $("#" + ename).find('td').css('color', 'black');
                        tmpObj.off_line[name] = 1;
                    }
                    tmpObj.health_time_stamp_old[name] = curr_time;
                }
            }

        });

    }

    function stateOutput(v, isError) {
        if (typeof errorCount === "undefined") {
            errorCount = 0;
        }
        if (isError) {
            errorCount++;
            $("#refresh_rate_update").html('<b><font color="red">' + errorCount + "-" + v + '</font></b>');
        } else {
            $("#refresh_rate_update").html(v);

        }

    }

    function updateInterface(tmpObj) {
        var cuids = tmpObj['elems'];
        var template = tmpObj.type;
        if (cuids == null) {
            node_list = [];
        } else {
            if (!(cuids instanceof Array)) {
                node_list = [cuids];
            } else {
                node_list = cuids;
            }
        }
        node_list.forEach(function (elem, id) {
            tmpObj.index = -1;
            tmpObj.health_time_stamp_old[elem] = 0;
            tmpObj.off_line[elem] = 2;
            tmpObj.node_name_to_index[elem] = id;
        });
        tmpObj.node_selected = null;
        var htmlt, htmlc;
        htmlt = tmpObj.generateTableFn(tmpObj);
        htmlc = tmpObj.generateCmdFn(tmpObj);

        $("#specific-table-" + tmpObj.template).html(htmlt);
        $("#specific-control-" + tmpObj.template).html(htmlc);
        tmpObj.updateInterfaceFn(tmpObj);
        if (tmpObj.hasOwnProperty('update-server-interval')) {
            clearInterval('update-server-interval');
            delete tmpObj['update-server-interval'];
        }
        if ((tmpObj.node_list_interval != null)) {
            clearInterval(tmpObj.node_list_interval);
        }
        tmpObj.last_check = 0;
        tmpObj.updateErrors = 0;
        tmpObj.skip_fetch = 0;
        if(tmpObj.upd_chan==-4){
            // completely custom, not setInterval 
            tmpObj.updateFn(tmpObj);

        } else {
        tmpObj.node_list_interval = setInterval(function () {
            if (tmpObj.skip_fetch > 0) {
                return;
            }
            var now = (new Date()).getTime();

            //$("#refresh_rate_update").html('<font color="white"><p>Update:'+tmpObj.updateRefresh+'</p><p>Errors:'+tmpObj.updateErrors+'</p></font>');
            if (tmpObj.upd_chan > -2) {
                jchaos.getChannel(tmpObj['elems'], tmpObj.upd_chan, function (dat) {
                    lat = (new Date()).getTime() - now;

                    var node_live_selected = dat;
                    if (node_live_selected.length == 0) {
                        return;
                    }

                    tmpObj.data = node_live_selected;
                    tmpObj.updateFn(tmpObj);

                }, function (err) {
                    console.log(err);
                    stateOutput(err, true);

                });
            } else {
                tmpObj.updateFn(tmpObj);


            }

            stateOutput('<b><font color="white"><p>Update:' + tmpObj.updateRefresh + ' Latency:' + jchaos['latency'] + ' LatencyAvg:' + jchaos['latency_avg'].toFixed(2) + ' OpsOk:' + jchaos['numok'] + ' Errors:' + jchaos['errors'] + 'Timeouts:' + jchaos['timeouts'] + '</p></font></b>', false);

            if ((now - tmpObj.last_check) > tmpObj.check_interval) {
                if (tmpObj.data != null) {
                    tmpObj.checkLiveFn(tmpObj);
                    tmpObj.last_check = now;

                }
            }
            tmpObj.updateRefresh = now - tmpObj.lastUpdate;

            tmpObj.lastUpdate = now;
        }, tmpObj.refresh_rate, tmpObj.updateTableFn);
    }
    }


    /**********
     * 
     */
    function changeView(tmpObj, cutype, handler) {

        tmpObj.upd_chan = 255;
        tmpObj.type = "cu";

        tmpObj.generateTableFn = generateGenericTable;
        tmpObj.generateCmdFn = generateGenericControl;
        tmpObj.updateFn = updateGenericCU;
        tmpObj.refresh_rate = dashboard_settings.generalRefresh;
        tmpObj.updateInterfaceFn = updateInterfaceCU;

        if ((cutype.indexOf("SCPowerSupply") != -1)) {
            tmpObj.upd_chan = -1;
            tmpObj.type = "SCPowerSupply";


            //   tmpObj.htmlFn=$.getScript( "/js/chaos-widget/"+tmpObj.type +".js");

        } else if ((cutype.indexOf("SCActuator") != -1)) {
            tmpObj.type = "SCActuator";
            tmpObj.upd_chan = -1;
        } else if ((cutype.indexOf("RTCamera") != -1)) {
            tmpObj.type = "RTCamera";
            tmpObj.upd_chan = -2;

            tmpObj.maxCameraCol = dashboard_settings.camera.maxCameraCol;
            tmpObj.cameraPerRow = dashboard_settings.camera.cameraPerRow;
            tmpObj.refresh_rate = dashboard_settings.camera.cameraRefresh;
            jchaos.setOptions({ "timeout": dashboard_settings.camera.restTimeout });
        } else if ((cutype.indexOf("SCLibera") != -1)) {
            tmpObj.type = "SCLibera";
            tmpObj.upd_chan = -1;


        }
        $.getScript("/js/chaos-widget/" + tmpObj.type + ".js").done(function (data, textStatus, jqxhr) {
            var w = getWidget();
            tmpObj.htmlFn = w.dsFn;
            tmpObj.generateTableFn = w.tableFn;
            if (w.hasOwnProperty('cmdFn')) {
                tmpObj.generateCmdFn = w.cmdFn;
            }
            if (w.hasOwnProperty('updateFn')) {
                tmpObj.updateFn = w.updateFn;
            }
            if (w.hasOwnProperty('updateInterfaceFn')) {
                tmpObj.updateInterfaceFn = w.updateInterfaceFn;
            }
            if (w.hasOwnProperty('tableClickFn')) {
                tmpObj['tableClickFn'] = w.tableClickFn;
            }
            handler(tmpObj);

        }).fail(()=>{
            handler(tmpObj);
        });
        
    }

    function buildCUPage(tmpObj, cuids, cutype) {
        var node_list = [];
        if (cuids != null) {
            if (cuids instanceof Array) {
                node_list = cuids;
            } else {
                node_list = [cuids];
            }
        }

        if (cutype == null) {
            cutype = "cu";
        }

        if ((cutype != "cu") && (cutype != "all") && (cutype != "ALL")) {
            node_list = cusWithInterface(tmpObj, node_list, cutype);
        }
        tmpObj['elems'] = node_list;
        /*****
         * 
         * clear all interval interrupts
         */
        /**
         * fixed part
         */
        changeView(tmpObj, cutype, updateInterface);


    }

    function updateNodeEvent() {
        var e = jQuery.Event("keypress");
        e.keyCode = 13; // # Some key code value
        $("#search-chaos").trigger(e);

    }

    function executeNodeMenuCmd(tmpObj, cmd, opt) {
        try {
            node_selected = tmpObj.node_selected;
            var node_multi_selected = tmpObj.node_multi_selected;
            var node_name_to_desc = tmpObj.node_name_to_desc;

            if (cmd == "edit-nt_agent") {
                var templ = {
                    $ref: "agent.json",
                    format: "tabs"
                }

                jchaos.node(node_selected, "info", "agent", function (data) {
                    if (data != null) {
                        // editorFn = agentSave;
                        //jsonEdit(templ, data);
                        jsonEditWindow("Agent Editor", templ, data, jchaos.agentSave, tmpObj,
                            () => {
                                instantMessage("Agent saved " + node_selected, " OK", 2000, true);

                            }, (bad) => {
                                instantMessage("Agent  " + node_selected, "Save Error:" + JSON.stringify(bad), 4000, false);

                            }
                        );
                        /* if (data.hasOwnProperty("andk_node_associated") && (data.andk_node_associated instanceof Array)) {
                           //rimuovi tutte le associazioni precedenti.
                           data.andk_node_associated.forEach(function (item) {
                             if (item.hasOwnProperty("ndk_uid")) {
                               jchaos.node(node_selected, "del", "agent", item.ndk_uid, function (daa) { });
                             }
                           });
                         }*/
                    };
                });
                return;
            } else if ((cmd == "edit-nt_control_unit")) {
                var templ = {
                    $ref: "cu.json",
                    format: "tabs"
                }
                jchaos.node(node_selected, "get", "cu", function (data) {
                    if (data != null) {
                        //editorFn = cuSave;
                        //jsonEdit(templ, data);
                        jsonEditWindow("CU Editor", templ, data, jchaos.cuSave, tmpObj, function (ok) {
                            instantMessage("CU saved " + node_selected, " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("Error saving CU " + node_selected, JSON.stringify(bad), 2000, false);

                        });

                    }
                });
                return;
            } else if (cmd == "edit-nt_root") {
                var templ = {
                    $ref: "cu.json",
                    format: "tabs"
                }
                var stype = cmd.split("-");

                var typ = jchaos.nodeTypeToHuman(stype[1]);
                jchaos.node(node_selected, "desc", typ, function (desc) {
                    jsonEditWindow("Edit EU ", templ, desc, (json, obj, ok, bad) => {
                        jchaos.node(node_selected, "nodeupdate", typ, json.ndk_parent, json, ok, bad);

                    }, tmpObj, function (ok) {
                        instantMessage("EU save ", " OK", 2000, true);

                    }, function (bad) {
                        instantMessage("EU save failed", JSON.stringify(bad), 2000, false);

                    });
                });
            } else if ((cmd == "edit-nt_unit_server")) {
                var templ = {
                    $ref: "us.json",
                    format: "tabs"
                }
                if (node_selected == null || node_selected == "") {
                    alert("not US selected!");
                    return;
                }
                var stype = cmd.split("-");

                var typ = jchaos.nodeTypeToHuman(stype[1]);

                jchaos.node(node_selected, "get", typ, function (data) {
                    if (data.hasOwnProperty("us_desc")) {
                        //    editorFn = unitServerSave;
                        //    jsonEdit(templ, data.us_desc);
                        jsonEditWindow("US Editor", templ, data.us_desc, jchaos.unitServerSave, tmpObj, function (ok) {
                            instantMessage("Unit server save ", " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("Unit server failed", bad, 2000, false);

                        });

                    }
                });
                return;
            } /*else if ((cmd == "edit-nt_root")) {
                jchaos.loadScript(node_selected, 0, function (data) {
                    var templ = {
                        $ref: "algo.json",
                        format: "tabs"
                    }
                    if (!data.hasOwnProperty('eudk_script_content')) {
                        instantMessage("Load Script", tmpObj.node_selected + " has no content", 4000, false);
                        return;
                    }
                    node_selected = null;
                    data['eudk_script_content'] = decodeURIComponent(escape(atob(data['eudk_script_content'])));
                    jsonEditWindow(tmpObj.node_selected, templ, data, algoSave, tmpObj);

                });
            }*/ else if (cmd == "new-nt_unit_server") {
                var templ = {
                    $ref: "us.json",
                    format: "tabs"
                }
                //editorFn = unitServerSave;
                //jsonEdit(templ, null);
                jsonEditWindow("US Editor", templ, null, jchaos.unitServerSave, tmpObj, function (ok) {
                    instantMessage("Unit server save ", " OK", 2000, true);

                    $("#search-alive-false").prop('checked', true);
                    $("#search-chaos").val(ok.ndk_uid);
                    updateNodeEvent();

                }, function (bad) {
                    instantMessage("Unit server failed", bad, 2000, false);

                }

                );

                return;
            } else if (cmd.includes("desc-")) {
                var stype = cmd.split("-");

                var typ = jchaos.nodeTypeToHuman(stype[1]);
                jchaos.node(node_selected, "desc", typ, function (data) {

                    showJson("Description " + node_selected, data);
                });

            } else if (cmd == "delete-histo-data") {

                createQueryDialog(function (query) {
                    // var start_s = $.datepicker.formatDate("yymmddhhmmss", new Date(query.start));
                    //var end_s = $.datepicker.formatDate("yymmddhhmmss", new Date(query.stop));
                    //console.log("start:"+start_s + " end:"+end_s);
                    // var start_s=new Date(query.start).toLocaleFormat("%y%m%d%h%m%s");
                    // var args = "(\"" + tmpObj.node_multi_selected[0] + "\"," + query.start + "," + query.stop + "," + query.chunk + "," + query.page + ")";

                    var val = {
                        'start': query.start.toString(),
                        'end': query.stop.toString()
                    };
                    var st = jchaos.getDateTime(query.start);
                    var en = jchaos.getDateTime(query.end);

                    jchaos.node(node_selected, "deletedata", "all", null, val, function (data) {
                        instantMessage("Node Data deleted ", "from:" + st + "[" + query.start + "] end:" + en + "[" + query.stop + "]", 4000, true);

                    }, function (data) {
                        instantMessage("Node Data deleting ", "from:" + st + "[" + query.start + "] end:" + en + "[" + query.stop + "]", 4000, false);

                    });
                })

            } else if (cmd == "del-nt_unit_server" || (cmd == "del-nt_root")) {
                var stype = cmd.split("-");

                var typ = jchaos.nodeTypeToHuman(stype[1]);

                confirm("Delete " + typ, "Your are deleting : " + node_selected, "Ok", function () {
                    if (cmd == "del-nt_unit_server") {

                        jchaos.node(node_selected, "desc", "all", (info) => {
                            if (info.hasOwnProperty("ndk_parent") && info.ndk_parent != "") {
                                jchaos.node(info.ndk_parent, "del", "agent", node_selected, function (daa) {
                                    instantMessage("Removed association " + info.ndk_parent, " OK", 1000, true);

                                });

                            }
                        });
                        jchaos.node(node_selected, "get", typ, function (data) {

                            if (data.hasOwnProperty('us_desc') && data.us_desc.hasOwnProperty('cu_desc')) {
                                var culist = data.us_desc.cu_desc;
                                if (culist instanceof Array) {
                                    confirm("US  " + node_selected, "Contains : " + culist.length + " CUs do you want to proceed?", "Proceed", function () {
                                        culist.forEach((elem) => {
                                            jchaos.node(elem.ndk_uid, "deletenode", "cu", function () {
                                                instantMessage("Node deleted " + elem.ndk_uid, " OK", 1000, true);
                                            }, function (err) {
                                                instantMessage("cannot delete cu:", JSON.stringify(err), 2000, false);

                                            });
                                        });

                                        updateNodeEvent();

                                    }, "Cancel");

                                }
                            }
                            jchaos.node(node_selected, "deletenode", typ, function () {
                                instantMessage("Node deleted " + node_selected, " OK", 1000, true);
                            }, function (err) {
                                instantMessage("cannot delete:", JSON.stringify(err), 2000, false);

                            });
                        })

                    }
                    jchaos.node(node_selected, "deletenode", typ, function () {
                        instantMessage("Node deleted ", " OK", 2000, true);
                        updateNodeEvent();
                    }, function (err) {
                        instantMessage("cannot delete server:", JSON.stringify(err), 2000, false);

                    });
                }, "Cancel");
                return;
            } else if (cmd == "delete-node") {


                confirm("Delete Node", "Your are deleting : " + node_selected, "Ok", function () {
                    jchaos.node(node_selected, "deletenode", "", function () {
                        instantMessage("Node deleted ", " OK", 2000, true);
                        updateNodeEvent();
                    }, function (err) {
                        instantMessage("cannot delete server:", JSON.stringify(err), 2000, false);

                    });
                }, "Cancel");
                return;
            } else if (cmd == "maketemplate-nt_control_unit") {
                var template = jchaos.variable("cu_templates", "get", null, null);
                if (typeof template !== "object") {
                    template = {};
                }
                var cu = jchaos.node(node_selected, "get", "cu", null, null);
                var impl = null;
                var driver = null;
                if (typeof cu === "object") {
                    if (typeof cu['control_unit_implementation'] === "string") {
                        if (((impl = getInterfaceFromClass(cu['control_unit_implementation'])) == null)) {
                            impl = cu['control_unit_implementation'];
                        }

                    }
                    if (impl == null) {
                        alert("cannot create a template from a null implementation");
                        return;
                    }
                    driver = "generic";
                    cu['ndk_uid'] = "<here " + impl + " CU unique name>";
                    cu["ndk_parent"] = "<here pather US unique name>";
                    cu['cudk_desc'] = "<here your CU " + impl + " description with drivers " + driver + ">";
                    if (cu['cudk_driver_description'] instanceof Array) {
                        driver = "";

                        cu['cudk_driver_description'].forEach(function (item, index) {
                            if (typeof item['cudk_driver_description_name'] === "string") {
                                if (cu['cudk_driver_description'].length == 1) {
                                    driver = item.cudk_driver_description_name;

                                } else {
                                    driver += item.cudk_driver_description_name + "[" + index + "]";

                                }
                            }
                        });
                    }
                    var templ = {
                        $ref: "cu.json",
                        format: "tabs"
                    }
                    jsonEditWindow("Template Editor " + impl, templ, cu, function (json, obj, ok, bad) {
                        if ((json != null) && json.hasOwnProperty("ndk_uid")) {

                            template[impl] = {};
                            template[impl][driver] = json;
                            jchaos.variable("cu_templates", "set", template, ok, bad);
                            return 0;
                        }
                        bad("cu not valid:" + JSON.stringify(json));
                        return 0;
                    }, tmpObj, function (ok) {
                        instantMessage("Created template:" + impl, " Driver:" + driver, 1000, true);

                    }, function (bad) {
                        instantMessage("Failed create template:" + impl, " Driver:" + driver, 2000, false);

                    });


                }



            } else if (cmd == "del-nt_control_unit") {
                node_multi_selected.forEach(function (nod, index) {
                    jchaos.node(nod,"desc","all", function (desc) {
                        if (desc != null && desc.hasOwnProperty("instance_description")) {
                            var parent = desc.instance_description.ndk_parent;
                            confirm("Delete CU", "Your are deleting CU: \"" + nod + "\"(" + parent + ")", "Ok", function () {
                                jchaos.node(nod, "del", "cu", parent, null, function (ok) {
                                    instantMessage("Deleted", "CU " + nod, 1000, true);
                                    tmpObj['elems'].splice(index, 1);
                                    updateNodeEvent();
                                }, function (bad) {
                                    instantMessage("Deleting", "CU " + nod, 2000, false);

                                });

                            }, "Cancel");
                        }
                    });
                });
                return;
            } else if (cmd == "copy-nt_control_unit") {


                jchaos.node(node_selected, "get", "cu", function (data) {
                    if (data != null) {
                        cu_copied = data;
                        //  copyToClipboard(JSON.stringify(data));
                    }
                });
                return;
            } else if (cmd == "save-nt_control_unit") {


                jchaos.node(node_selected, "get", "cu", function (data) {
                    if (data != null) {
                        if (data instanceof Object) {
                            var tmp = { cu_desc: data };
                            var blob = new Blob([JSON.stringify(tmp)], { type: "json;charset=utf-8" });
                            saveAs(blob, node_selected + ".json");
                        }
                    }
                });
                return;
            } else if (cmd == "paste-nt_control_unit") {
                var copia = cu_copied;
                /*check the status of the device must be not alive*/

                copia.ndk_parent = node_selected;
                confirm("Move or Copy", "Copy or Moving CU: \"" + cu_copied.ndk_uid + "\" into US:\"" + node_selected + "\"", "Move", function () {
                    if (tmpObj.off_line[cu_copied.ndk_uid] == 0) {
                        alert("CU " + cu_copied.ndk_uid + " cannot be MOVED if alive, please bring it to 'unload' state");
                        return;
                    }
                    jchaos.node(cu_copied.ndk_uid, "set", "cu", node_selected, copia, function () { });
                }, "Copy", function () {

                    var def_obj = copia;
                    var templ = {
                        $ref: "cu.json",
                        format: "tabs"
                    }
                    def_obj['ndk_uid'] = copia.ndk_uid + "_copied";
                    def_obj['ndk_parent'] = node_selected;
                    //jsonEdit(templ, tmp);
                    jsonEditWindow("Copied CU", templ, def_obj, jchaos.newCuSave, tmpObj, function (ok) {
                        instantMessage("CU save ", " OK", 2000, true);

                    }, function (bad) {
                        instantMessage("CU save failed", bad, 2000, false);

                    });

                });
                return;
            } else if (cmd == "copy-nt_unit_server") {
                jchaos.node(node_selected, "get", "us", function (data) {
                    if (data.hasOwnProperty("us_desc")) {
                        us_copied = data.us_desc;
                        copyToClipboard(JSON.stringify(data));

                    }
                });
                return;
            } else if (cmd == "copy-nt_root") {
                jchaos.node(node_selected, "get", "root", function (data) {
                    copyToClipboard(JSON.stringify(data));
                });
                return;
            } else if (cmd == "save-nt_unit_server") {
                jchaos.node(node_selected, "get", "us", function (data) {
                    if (data.hasOwnProperty("us_desc")) {
                        if (data.us_desc instanceof Object) {
                            var blob = new Blob([JSON.stringify(data.us_desc)], { type: "json;charset=utf-8" });
                            saveAs(blob, node_selected + ".json");
                        }

                    }
                });
                return;
            } else if (cmd == "new-nt_control_unit-fromfile") {
                getFile("LOAD JSON CU description", "select the JSON to load", function (config) {
                    //console.log("loaded:"+JSON.stringify(data));
                    var cuname;
                    var def_obj;

                    if (config.hasOwnProperty("cu_desc") && config.cu_desc.hasOwnProperty("ndk_uid")) {
                        cuname = config.cu_desc.ndk_uid;
                        def_obj = config.cu_desc;
                    } else if (config.hasOwnProperty("ndk_uid")) {
                        cuname = config.ndk_uid;
                        def_obj = config;

                    } else {
                        alert("Invalid CU");
                        return;
                    }
                    confirm("Add CU " + cuname, "Add CU to " + node_selected + "?", "Add", function () {
                        var templ = {
                            $ref: "cu.json",
                            format: "tabs"
                        }
                        // editorFn = jchaos.newCuSave;
                        def_obj.ndk_parent = node_selected;
                        //jsonEdit(templ, tmp);
                        jsonEditWindow("New CU", templ, def_obj, jchaos.newCuSave, tmpObj, function (ok) {
                            instantMessage("CU save ", " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("CU save failed", bad, 2000, false);

                        });


                    }, "Cancel", function () { });

                });
                return;
            } else if (cmd.includes("new-nt_control_unit-mcimport")) {

                // custom
                var templ = {
                    $ref: "cu_mc_import.json",
                    format: "tabs"
                }
                //var def = {};
                //def['ndk_parent']=node_selected;
                //editorFn = jchaos.newCuSave;
                //jsonEdit(templ, template);
                jsonEditWindow("New MemCache import CU", templ, null, newMCCuSave, tmpObj);
                var templ = {
                    $ref: "cu.json",
                    format: "tabs"
                }
                // editorFn = jchaos.newCuSave;
                def_obj.ndk_parent = node_selected;



                return;
            } else if (cmd.includes("new-nt_control_unit-custom")) {

                // custom
                var templ = {
                    $ref: "cu.json",
                    format: "tabs"
                }
                var def = {};

                def['ndk_parent'] = node_selected;
                def['ndk_type'] = "nt_control_unit";
                def['auto_load'] = true;
                def['auto_init'] = true;
                def['auto_start'] = true;
                def['cudk_thr_sch_delay'] = 1000000;
                def["cudk_desc"] = "<CU description>";
                def["cudk_load_param"] = "{}";
                def["cudk_props"] = "{}";

                def['dsndk_storage_type'] = 2;



                //editorFn = jchaos.newCuSave;
                //jsonEdit(templ, template);
                jsonEditWindow("New Custom CU", templ, def, jchaos.newCuSave, tmpObj);



                return;
            } else if (cmd.includes("shutdown-")) {
                var shuttype = cmd.split("-");

                var typ = jchaos.nodeTypeToHuman(shuttype[1]);

                confirm("Do you want to IMMEDIATELY SHUTDOWN " + typ + " " + node_selected, "Pay attention all childrent will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "shutdown", typ, function () {
                            instantMessage("SHUTDOWN NODE", "Killing " + node_selected + "", 1000, true);
                        }, function () {
                            instantMessage("SHUTDOWN NODE ", "Killing " + node_selected + "", 1000, false);
                        }, function () {
                            // handle error ok
                        })
                    }, "Joke",
                    function () { });
                return;
            } /* else if (cmd == "shutdown-nt_unit_server") {
                confirm("Do you want to IMMEDIATELY SHUTDOWN US:" + node_selected, "Pay attention ANY CU will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "shutdown", "us", function () {
                            instantMessage("US SHUTDOWN", "Killing " + node_selected + "", 1000, true);
                        }, function () {
                            instantMessage("US SHUTDOWN", "Killing " + node_selected + "", 1000, false);
                        }, function () {
                            // handle error ok
                        })
                    }, "Joke",
                    function () { });
                return;
            } else if (cmd == "shutdown-nt_agent") {
                confirm("Do you want to IMMEDIATELY SHUTDOWN AGENT:" + node_selected, "Pay attention ANY US/CU will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "shutdown", "agent", function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, true);
                        }, function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, false);
                        }, function () {
                            // handle error ok
                        })
                    }, "Joke",
                    function () { });
                return;
            } else if (cmd == "shutdown-nt_root") {
                confirm("Do you want to IMMEDIATELY SHUTDOWN AGENT:" + node_selected, "Pay attention ANY US/CU will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "shutdown", "root", function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, true);
                        }, function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, false);
                        }, function () {
                            // handle error ok
                        })
                    }, "Joke",
                    function () { });
                return;
            } else if (cmd == "shutdown-nt_wan_proxy") {
                confirm("Do you want to IMMEDIATELY SHUTDOWN AGENT:" + node_selected, "Pay attention ANY US/CU will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "shutdown", "webui", function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, true);
                        }, function () {
                            instantMessage("AGENT SHUTDOWN", "Killing " + node_selected + "", 1000, false);
                        }, function () {
                            // handle error ok
                        })
                    }, "Joke",
                    function () { });
                return;
            }*/ else if (cmd.includes("new-nt_control_unit")) {
                var regex = /new-nt_control_unit-(.*)-(.*)$/;
                var match = regex.exec(cmd);
                if (match != null) {
                    var cu_templates = jchaos.variable("cu_templates", "get", null, null);

                    var template = cu_templates[match[1]][match[2]];

                    if (template != null) {
                        template["ndk_parent"] = node_selected;

                        console.log("selected template:\"" + match[1]);
                        var templ = {
                            $ref: "cu.json",
                            format: "tabs"
                        }
                        // editorFn = jchaos.newCuSave;
                        // jsonEdit(templ, template);
                        jsonEditWindow("New CU from Template", templ, template, jchaos.newCuSave, tmpObj, function (ok) {
                            instantMessage("CU save ", " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("CU save failed", bad, 2000, false);

                        });

                    } else {
                        // custom
                        var template = {};
                        var templ = {
                            $ref: "cu.json",
                            format: "tabs"
                        }
                        template["ndk_parent"] = node_selected;

                        //editorFn = jchaos.newCuSave;
                        //jsonEdit(templ, template);
                        jsonEditWindow("New CU from Template", templ, template, jchaos.newCuSave, tmpObj, function (ok) {
                            instantMessage("CU save ", " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("CU save failed", bad, 2000, false);

                        });

                    }
                }
                return;
            } else if (cmd == "paste-nt_unit_server") {
                alert("Not Implemented, try with Edit.. ");
                return;
            } else if (cmd == "start-node") {
                jchaos.node(node_multi_selected, "start", "us", function () {
                    instantMessage("US START", "Starting " + node_selected + " via agent", 1000, true);
                }, function (bad) {
                    instantMessage("ERROR US START", "Starting " + node_selected + " via agent:" + JSON.stringify(bad), 1000, false);
                });
                return;
            } else if (cmd == "stop-node") {
                jchaos.node(node_multi_selected, "stop", "us", function () {
                    instantMessage("US STOP", "Stopping " + node_selected + " via agent", 1000, true);

                }, function (bad) {
                    instantMessage("ERROR US STOP", "Stopping " + node_selected + " via agent:" + JSON.stringify(bad), 1000, false);

                });
                return;
            } else if (cmd == "console-node") {
                var agentn = node_name_to_desc[node_selected].desc.ndk_parent;
                var server = node_name_to_desc[node_selected].desc.ndk_host_name;
                //  getConsole(server + ":" + node_selected, data.association_uid, server, 2, 1, 1000);

                jchaos.node(agentn, "get", "agent", node_selected, null, function (data) {
                    console.log("->" + JSON.stringify(data));
                    getConsole(server + ":" + node_selected, data.association_uid, server, 2, 1, 1000);
                });


            } else if (cmd == "kill-node") {
                confirm("Do you want to KILL?", "Pay attention ANY CU will be killed as well", "Kill",
                    function () {
                        jchaos.node(node_selected, "kill", "us", function () {
                            instantMessage("US KILL", "Killing " + node_selected + " via agent", 1000, true);
                        }, function () {
                            instantMessage("ERROR US KILL", "Killing " + node_selected + " via agent", 1000, false);
                        })
                    }, "Joke",
                    function () { });
                return;
            } else if (cmd == "restart-node") {
                confirm("Do you want to RESTART?", "Pay attention ANY CU will be restarted as well", "Restart",
                    function () {
                        jchaos.node(node_selected, "restart", "us", function () {
                            instantMessage("US RESTARTING", "Restarting " + node_selected + " via agent", 1000, true);
                        }, function (bad) {
                            instantMessage("US RESTARTING", "Restarting " + node_selected + " via agent:" + JSON.stringify(bad), 1000, false);
                        })
                    }, "Joke",
                    function () { });
                return;
            } else if (cmd == "associate-node") {
                var templ = {
                    $ref: "agent.json",
                    format: "tabs"
                }
                jchaos.node(node_selected, "info", "agent", function (data) {
                    if (data != null) {

                        if (data.hasOwnProperty("andk_node_associated") && (data.andk_node_associated instanceof Array)) {
                            var found = 0;
                            data.andk_node_associated.forEach(function (item) {
                                if (item.hasOwnProperty("ndk_uid")) {
                                    if (item.ndk_uid == us_copied.ndk_uid) {
                                        alert("node already associated");
                                        found = 1;
                                    }
                                    //        jchaos.node(node_selected, "del", "agent", item.ndk_uid, function (daa) { });
                                }
                            });
                            if (found == 0) {
                                var tmp = {
                                    ndk_uid: us_copied.ndk_uid,
                                    association_uid: 0,
                                    node_launch_cmd_line: "UnitServer",
                                    node_auto_start: true,
                                    node_keep_alive: false,
                                    node_log_at_launch: false
                                };
                                data.andk_node_associated.push(tmp);
                            }
                        }
                        //editorFn = agentSave;
                        //jsonEdit(templ, data);
                        jsonEditWindow("Agent Editor", templ, data, jchaos.agentSave, tmpObj, function (ok) {
                            instantMessage("Agent save ", " OK", 2000, true);

                        }, function (bad) {
                            instantMessage("Agent save failed:", JSON.stringify(bad), 2000, false);

                        });

                    };
                });
                return;
            } else {
                executeCUMenuCmd(tmpObj, cmd, options);
            }
            return;


        } catch (err) {
            if ((typeof err === "object")) {
                if (err.hasOwnProperty('error_status')) {
                    instantMessage("Error ", err.error_status, 4000, false);
                } else {
                    instantMessage("Error ", JSON.stringify(err), 4000, false);

                }
            } else {
                alert(err)

            }


        }
    }
    /**** ALGO MENU */

    function executeAlgoMenuCmd(cmd, opt) {
        if (cmd == "edit-algo") {
            var templ = {
                $ref: "algo.json",
                format: "tabs"
            }
            if (node_selected != null && node_name_to_desc[node_selected] != null) {
                jchaos.loadScript(node_selected, node_name_to_desc[node_selected].seq, function (data) {
                    console.log("script:" + node_selected + " =" + JSON.stringify(data));

                    jsonEditWindow(node_selected, templ, data, algoSave, tmpObj);

                });
            }

            return;
        }


        if (cmd == "delete-algo") {

            confirm("Delete Algorithm", "Your are deleting Algorithm: " + node_selected, "Ok", function () {
                jchaos.rmScript(node_name_to_desc[node_selected], function (data) {
                    instantMessage("Remove Script", "removed:" + node_selected, 2000);

                });

            }, "Cancel");
            return;
        }


        if (cmd == "copy-algo") {

            jchaos.loadScript(node_selected, node_name_to_desc[node_selected].seq, function (data) {
                algo_copied = data;
                instantMessage("Copy Script", "copied " + node_selected, 1000);
            });

            return;
        }
        if (cmd == "save-algo") {
            jchaos.loadScript(node_selected, node_name_to_desc[node_selected].seq, function (data) {
                if (data != null) {
                    if (data instanceof Object) {
                        var blob = new Blob([JSON.stringify(data)], { type: "json;charset=utf-8" });
                        saveAs(blob, node_selected + ".json");
                    }
                }
            });

            return;

        }
        if (cmd == "paste-algo") {
            if ((algo_copied instanceof Object) && algo_copied.hasOwnProperty("script_name")) {
                var instUnique = (new Date()).getTime();
                var templ = {
                    $ref: "algo.json",
                    format: "tabs"
                }
                getEntryWindow("Rename Algo", "Algo Name", node_selected + "_" + instUnique, "Create", function (inst_name) {
                    //editorFn = algoSave;
                    algo_copied.script_name = inst_name;
                    //jsonEdit(algo_copied, null);
                    jsonEditWindow("Algo Editor", algo_copied, null, algoSave, tmpObj);


                }, "Cancel");
            }

            return;
        }

        if (cmd == "create-instance") {
            var instUnique = (new Date()).getTime();

            getEntryWindow("Create Instance", "Instance Name", node_selected + "/" + node_selected + "_" + instUnique, "Create", function (inst_name) {
                jchaos.manageInstanceScript(node_selected, node_name_to_desc[node_selected].seq, inst_name, true, function (data) {
                    instantMessage("Create Instance", "instance of " + node_selected + "created with name:" + inst_name, 1000);

                });

            }, "Cancel");

            return;
        }
        if (cmd == "edit-instance") {
            var templ = {
                $ref: "algo-instance.json",
                format: "tabs"
            }

            if (node_name_to_desc[pather_selected] != null && node_name_to_desc[pather_selected].hasOwnProperty('instances')) {
                var arr = node_name_to_desc[pather_selected].instances;
                arr.forEach(function (item) {
                    if (item.instance_name == node_selected) {
                        console.log("editing instance: " + node_selected + " of:" + pather_selected + ":" + JSON.stringify(item));
                        var fname = jchaos.encodeName(node_selected);
                        jsonEditWindow(fname, templ, item, algoSaveInstance, tmpObj);
                    }
                })
            }

            return;
        }
        if (cmd == "delete-instance") {
            confirm("Delete Algorithm Instance", "Your are deleting Instance Algorithm: " + node_selected + "(" + pather_selected + ")", "Ok", function () {
                jchaos.manageInstanceScript(pather_selected, node_name_to_desc[pather_selected].seq, node_selected, false, function (data) {
                    instantMessage("Delete Instance", "instance of " + pather_selected + "created with name:" + node_selected, 1000);

                });

            }, "Cancel");

            return;
        }

        return;
    }

    /****** */




    function updateNodeInterface(tmpObj) {
        var template = tmpObj.type;
        var node_list = tmpObj['elems'];
        var cutype = tmpObj.type;
        jchaos.node(node_list, "desc", cutype, function (data) {
            var cnt = 0;
            var us_list = [];
            var cu_list = [];
            node_list.forEach(function (elem, index) {
                var ds = data[index];

                if (!ds.hasOwnProperty("ndk_parent") && (ds.hasOwnProperty("instance_description") && ds.instance_description.hasOwnProperty("ndk_parent"))) {
                    ds["ndk_parent"] = ds.instance_description.ndk_parent;
                }
                tmpObj.node_name_to_desc[elem] = { desc: ds };

            });
        });
        $("#main_table-" + template + " tbody tr").click(function (e) {
            mainTableCommonHandling("main_table-" + template, tmpObj, e);
        });
        /*    n = $('#main_table-' + template + ' tr').size();
            if (n > 22) { 
                $("#table-scroll").css('height', '280px');
            } else {
                $("#table-scroll").css('height', '');
            }
    */

        $("#cuname").draggable({

            cursor: 'move',
            helper: 'clone',
            containment: 'window'
        });
        $.contextMenu('destroy', '.nodeMenu');

        $.contextMenu({
            selector: '.nodeMenu',
            build: function ($trigger, e) {
                var template = tmpObj.type;

                var cuname = $(e.currentTarget).attr(template + "-name");
                var cuitem = updateNodeMenu(tmpObj, cuname);

                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {
                        executeNodeMenuCmd(tmpObj, cmd, options);
                        return;
                    },
                    items: cuitem
                }
            }


        });
        actionJsonEditor(tmpObj);

    }

    /*
      function buildNodeInterface(nodes, cutype, template) {
        if (nodes == null) {
          alert("NO Nodes given!");
          return;
        }
        if (!(nodes instanceof Array)) {
          node_list = [nodes];
        } else {
          node_list = nodes;
        }
  
        node_list.forEach(function (elem, id) {
          var name = jchaos.encodeName(elem);
          node_name_to_index[name] = id;
          health_time_stamp_old[name] = 0;
          off_line[name] = false;
        });
        // cu_selected = cu_list[0];
        node_selected = null;
        var htmlt, htmlc, htmlg;
        var updateTableFn = new Function;
       
        htmlt = generateNodeTable(node_list, template);
        updateTableFn = updateNodeTable;
  
  
        $("#specific-table-" + tmpObj.template).html(htmlt);
        // $("div.specific-control").html(htmlc);
        checkRegistration = 0;
        setupNode(template);
  
        jchaos.node(node_list, "desc", cutype, null, null, function (data) {
          var cnt = 0;
          var us_list = [];
          var cu_list = [];
          node_list.forEach(function (elem, index) {
            var type = data[index].ndk_type;
            node_name_to_desc[elem] = { desc: data[index], parent: null, detail: null };
            if ((type == "nt_control_unit")) {
              cu_list.push(elem);
            } else if ((type == "nt_unit_server")) {
              us_list.push(elem);
            }
  
          });
          if (cu_list.length > 0) {
            jchaos.getDesc(cu_list, function (data) {
              var cnt = 0;
              data.forEach(function (cu) {
                if (cu.hasOwnProperty("instance_description")) {
                  node_name_to_desc[cu_list[cnt]].detail = cu.instance_description;
                  node_name_to_desc[cu_list[cnt]].parent = cu.instance_description.ndk_parent;
                }
                cnt++;
              });
            });
          }
          if (us_list.length > 0) {
            jchaos.node(us_list, "parent", "us", null, null, function (data) {
              var cnt = 0;
              data.forEach(function (us) {
                if (us.hasOwnProperty("ndk_uid") && us.ndk_uid != "") {
                  node_name_to_desc[us_list[cnt]].parent = us.ndk_uid;
                }
                cnt++;
              });
            });
          }
        });
  
  
        if (node_list_interval != null) {
          clearInterval(node_list_interval);
        }
        updateTableFn(node_list);
        node_list_interval = setInterval(function (e) {
          var start_time = (new Date()).getTime();
          if ((start_time - checkRegistration) > 60000) {
            checkRegistration = start_time;
            jchaos.node(node_list, "desc", cutype, null, null, function (data) {
              var cnt = 0;
              node_list.forEach(function (elem, index) {
                node_name_to_desc[elem].desc = data[index];
              });
            });
            updateTableFn(node_list);
  
          }
          jchaos.node(node_list, "health", cutype, null, null, function (data) {
            node_live_selected = data;
            updateGenericTableDataset(node_live_selected);
  
          });
  
  
         
          // update all generic
  
          if (node_live_selected.length == 0 || node_selected == null || node_name_to_index[node_selected] == null) {
            return;
          }
  
  
  
  
        }, options.Interval, updateTableFn);
  
        installCheckLive();
  
  
      } */

    function buildAlgoInterface(nodes, interface, template) {
        if (nodes == null) {
            alert("NO Nodes given!");
            return;
        }
        node_list = [];
        for (var key in nodes) {
            if (nodes[key] instanceof Array) {
                node_list = node_list.concat(nodes[key]);

            }
        }
        if (interface !== "algo-instance") {
            node_list.forEach(function (elem) {
                node_name_to_desc[elem.script_name] = elem;
                var tmp_array = [];
                jchaos.searchScriptInstance(elem.script_name, "", function (script_inst) {
                    for (var key in script_inst) {
                        if (script_inst[key] instanceof Array) {
                            tmp_array = tmp_array.concat(script_inst[key]);
                        }
                    }
                    node_name_to_desc[elem.script_name]['instances'] = tmp_array;
                });
            });
        }

        /*****
         * 
         * clear all interval interrupts
         */
        /**
         * fixed part
         */
        htmlt = generateAlgoTable(node_list, interface, template);


        $("#specific-table-" + type).html(htmlt);


        $("#main_table-" + template + " tbody tr").click(function (e) {
            mainTableCommonHandling("main_table-" + template, tmpObj, e);
        });
        /*     n = $('#main_table-' + template + ' tr').size();
             if (n > 22) { 
                 $("#table-scroll").css('height', '280px');
             } else {
                 $("#table-scroll").css('height', '');
             }
     */

        $.contextMenu('destroy', '.algoMenu');

        $.contextMenu({
            selector: '.algoMenu',
            build: function ($trigger, e) {
                var algoname = $(e.currentTarget).attr("cuname");
                var cuitem = updateAlgoMenu(algoname);
                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {
                        executeAlgoMenuCmd(cmd, options);
                        return;
                    },
                    items: cuitem
                }
            }


        });
        $.contextMenu('destroy', '.algoInstanceMenu');

        $.contextMenu({
            selector: '.algoInstanceMenu',
            build: function ($trigger, e) {
                var algoname = $(e.currentTarget).attr("cuname");
                var cuitem = updateInstanceAlgoMenu(algoname);
                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {
                        executeAlgoMenuCmd(cmd, options);
                        return;
                    },
                    items: cuitem
                }
            }


        });

    }

    function getZoneClassElement(str, list_zone, list_class, list_eu_name) {
        var regex = /(.*)\/(.*)\/(.*)$/;
        var match = regex.exec(str);
        if (match != null) {
            list_zone.push(match[1]);
            list_class.push(match[2]);
            list_eu_name.push(match[3]);
        }
    }


    function executeProcessMenuCmd(tmpObj, cmd, opt) {
        node_selected = tmpObj.node_selected;

        if (cmd == "open-process-console" || cmd == "open-process-errconsole") {
            var console = 1;
            if (cmd == "open-process-errconsole") {
                console = 2;
            }
            //   var agentn = tmpObj[node_selected].parent;
            var server = tmpObj.data[node_selected].hostname;
            var friendname = tmpObj.data[node_selected].pname;
            getConsole(tmpObj.data[node_selected].hostname + ":" + friendname + "(" + node_selected + ")", node_selected, server, 2, console, 1000, tmpObj.data[node_selected].ptype);

        } else if (cmd == "download-output") {
            var server = tmpObj.data[node_selected].hostname;
            jchaos.setOptions({ "timeout": 60000 });

            jchaos.rmtDownload(server, node_selected, "", function (r) {
                instantMessage("Downloading", "Zipping Output of " + node_selected + " ", 1000, true);
                var zipname = node_selected + ".zip";
                var binary_string = atob(r.data.base64);
                saveAsBinary(binary_string, zipname);
                jchaos.setOptions({ "timeout": 5000 });


            }, function (bad) {
                instantMessage("Downloading", "Zipping Output of " + node_selected + " via agent:" + bad.errmsg, 5000, false);
                jchaos.setOptions({ "timeout": 5000 });

            });
        } else if (cmd == "kill-process") {
            confirm("Do you want to KILL?", "Pay attention ANY CU will be killed as well", "Kill",
                function () {
                    var server = tmpObj.data[node_selected].hostname;
                    jchaos.rmtKill(server, node_selected, function (r) {
                        instantMessage("US KILL", "Killing " + node_selected + " ", 1000, true);

                    }, function (bad) {
                        instantMessage("ERROR US KILL", "Killing " + node_selected + " via agent", 1000, false);
                    });

                }, "Joke",
                function () { });
            return;
        } else if (cmd == "start-process") {
            jchaos.node(tmpObj.data[node_selected].pname, "start", "us", function () {
                instantMessage("START", "Starting " + tmpObj.data[node_selected].pname + " via agent", 1000, true);
            }, function () {
                instantMessage("ERROR START", "Starting " + tmpObj.data[node_selected].pname + " via agent", 3000, false);
            });
            return;
        } else if (cmd == "new-script") {
            var templ = {
                $ref: "algo.json",
                format: "tabs"
            }
            var scriptTmp = {};
            scriptTmp['script_name'] = "NONAME";
            scriptTmp['eudk_script_content'] = "";
            scriptTmp['eudk_script_language'] = "bash";
            scriptTmp['script_description'] = "PUT YOUR DESCRIPTION";
            scriptTmp['default_argument'] = "";
            scriptTmp['eudk_script_keepalive'] = false;
            jsonEditWindow("NewScript", templ, scriptTmp, algoSave, tmpObj);
            return;
        } else if (cmd == "manage-script") {
            updateScriptModal(tmpObj);
        } else if (cmd == "load-script") {
            algoLoadFromFile(tmpOb, "remote");
        } else if (cmd == "root-script") {
            runRemoteScript(tmpObj, "Chaos Root", "CPP");
        } else if (cmd == "new-process-template") {
            var templ = {
                $ref: "app_template.json",
                format: "tabs"
            }

            jsonEditWindow("New Process Template", templ, null, function (data, obj) {
                var processTemplates = jchaos.variable("app_templates", "get", processTemplates, null);
                var name = data['app_name'];
                processTemplates[name] = data;
                jchaos.variable("app_templates", "set", processTemplates, null);
                obj['app-templates'] = processTemplates;

            }, tmpObj);

        } else if (cmd == "purge-script") {
            purgeScripts(tmpObj, 1);
        } else {
            var processTemplates = tmpObj['app-templates'];
            for (var k in processTemplates) {
                var cmdrm = "app-template-delete-" + k;
                if (cmd == cmdrm) {
                    delete processTemplates[k];
                    jchaos.variable("app_templates", "set", processTemplates, null);
                    return;
                }
                var cmdname = "app-template-" + k;
                if (cmd == cmdname) {
                    var templ = {
                        $ref: "app_template.json",
                        format: "tabs"
                    }

                    jsonEditWindow("Application Run", templ, processTemplates[k], function (data, obj) {
                        // save template and run template
                        jchaos.variable("app_templates", "set", processTemplates, null);
                        var server;
                        if (tmpObj.hasOwnProperty('target-agent')) {
                            server = tmpObj['target-agent'];
                        } else {
                            server = findBestServer(obj);
                        }

                        jchaos.rmtGetEnvironment(server, "CHAOS_PREFIX", function (r) {
                            if (r.err != 0) {
                                instantMessage("Cannot retrive environment", "cannot read CHAOS_PREFIX:" + r.errmsg, 5000, false);
                                return;
                            } else {
                                var chaos_prefix = r.data.value;
                                var cmd_line = chaos_prefix + "/bin/" + data['app_exec'] + " " + data['app_cmdline'];
                                var name = data['app_name'];
                                if (data['app_broadcast']) {
                                    var serverlist = obj['agents'];
                                    for (var server in serverlist) {
                                        jchaos.rmtCreateProcess(server, name, cmd_line, "exec", "", function (r) {
                                            console.log("Script running onto:" + server + " :" + JSON.stringify(r));
                                            instantMessage("Script " + name + "launched on:" + server, "Started " + JSON.stringify(r), 2000, true);
                                            getConsole(server + ":" + name + "(" + r.data.uid + ")", r.data.uid, server, 2, 1, 1000);

                                        }, function (bad) {
                                            console.log("Some error getting loading script:" + bad);
                                            instantMessage("Script " + name, "Failed to start " + bad, 2000, false);

                                        });
                                    }
                                } else {
                                    if (tmpObj.hasOwnProperty('target-agent')) {
                                        server = tmpObj['target-agent'];
                                    } else {
                                        server = findBestServer(obj);
                                    }

                                    jchaos.rmtCreateProcess(server, name, cmd_line, "exec", "", function (r) {
                                        console.log("Script running onto:" + server + " :" + JSON.stringify(r));
                                        instantMessage("Script " + name + "launched on:" + server, "Started " + JSON.stringify(r), 2000, true);
                                        getConsole(server + ":" + name + "(" + r.data.uid + ")", r.data.uid, server, 2, 1, 1000);

                                    }, function (bad) {
                                        console.log("Some error getting loading script:" + bad);
                                        instantMessage("Script " + name, "Failed to start " + bad, 2000, false);

                                    });
                                }
                            }
                        });
                    }, tmpObj);
                }
            }
        }

        return;
    }

    function purgeScripts(tmpObj, level) {
        var serverlist = tmpObj['agents'];
        for (var key in serverlist) {
            var server = key;
            jchaos.rmtPurge(server, level, function (r) { }, function (bad) {
                instantMessage("Purge Error", "Failed to purge ", 2000, false);

            })
        };
    }

    function findBestServer(func) {
        var kk = {};
        var maxIdle = 0;
        var server = null;
        if (typeof func == "function") {
            updateProcessServer(kk, function (kk) {

                updateProcessList(kk, function (tt) {
                    var serverlist = tt['agents'];
                    for (var key in serverlist) {
                        if (serverlist[key].idle > maxIdle) {
                            maxIdle = serverlist[key].idle;
                            server = key;
                        }
                    }
                    func(server);
                });
            });
        } else if (typeof func == "object") {
            updateProcessServer(func);

            var serverlist = func['agents'];
            for (var key in serverlist) {
                if (serverlist[key].idle > maxIdle) {
                    maxIdle = serverlist[key].idle;
                    server = key;
                }
            };
        }
        return server;
    }

    function runRemoteApp(tmpObj, app) {
        var best_server;

    }

    function runRemoteScript(tmpObj, name, language, additional_args) {
        var launch_arg = "";
        var chaos_prefix = "";
        findBestServer(function (server) {
            if (tmpObj.hasOwnProperty('target-agent')) {
                server = tmpObj['target-agent'];
            }
            if (server == null) {
                alert("NO Server Available");
                return;
            }
            jchaos.rmtGetEnvironment(server, "CHAOS_PREFIX", function (r) {
                if (r.err != 0) {
                    instantMessage("Cannot retrive environment", "cannot read CHAOS_PREFIX:" + r.errmsg, 5000, false);
                    return;
                } else {
                    chaos_prefix = r.data.value;
                    if (language == "CPP") {
                        launch_arg = chaos_prefix + "/bin/chaosRoot --conf-file " + chaos_prefix + "/etc/chaos_root.cfg";
                    } else if (language == "bash") {
                        launch_arg = "bash ";
                    } else if (language == "nodejs") {
                        launch_arg = "node ";

                    } else if (language == "python") {
                        launch_arg = "python ";

                    } else {
                        launch_arg = language;
                    }
                    if (typeof additional_args === "undefined") {


                        getEntryWindow(name, "Additional args", '', "Run", function (parm) {

                            jchaos.rmtCreateProcess(server, name, launch_arg + " " + parm, language, "", function (r) {
                                console.log("Script running onto:" + server + " :" + JSON.stringify(r));
                                var node_selected = tmpObj.node_selected;
                                instantMessage("Script " + name + "launched on:" + server, "Started " + JSON.stringify(r), 2000, true);
                                getConsole(server + ":" + name + "(" + r.data.uid + ")", r.data.uid, server, 2, 1, 1000, language);
                            }, function (bad) {
                                console.log("Some error getting loading script:" + bad);
                                instantMessage("Script " + name, "Failed to start " + bad, 2000, false);

                            });
                        }, "Cancel");
                    } else {
                        jchaos.rmtCreateProcess(server, name, launch_arg + " " + additional_args, language, "", function (r) {
                            console.log("Script running onto:" + server + " :" + JSON.stringify(r));
                            var node_selected = tmpObj.node_selected;
                            instantMessage("Script " + name + "launched on:" + server, "Started " + JSON.stringify(r), 2000, true);
                            getConsole(server + ":" + name + "(" + r.data.uid + ")", r.data.uid, server, 2, 1, 1000), language;
                        }, function (bad) {
                            console.log("Some error getting loading script:" + bad);
                            instantMessage("Script " + name, "Failed to start " + bad, 2000, false);

                        });
                    }
                }
            }, function (bad) {
                console.log("Some error getting environment:" + bad);
                instantMessage("Script " + name, "Failed to start " + bad, 2000, false);

            });
        });
    }

    function updateProcessMenu(tmpObj, target) {
        var items = {};
        var interface = tmpObj.type;
        node_selected = tmpObj.node_selected;
        // var cindex = tmpObj.node_name_to_index[node_name];
        var attr = target.attr('agent-name');
        items['new-script'] = { name: "New Script..." };
        items['load-script'] = { name: "Load Script from file..." };
        var prorunsub = processRunSubMenu(tmpObj);
        var protemsub = processAppTemplateSubMenu(tmpObj);

        if (typeof attr === "string") {
            tmpObj['target-agent'] = attr;
            items['manage-script'] = { name: "Manage/Run Script on " + attr };
            items['fold1'] = { name: "Run Chaos Application on " + attr, "items": prorunsub };
        } else {
            if (tmpObj.hasOwnProperty('target-agent')) {
                delete tmpObj['target-agent'];
            }
            items['manage-script'] = { name: "Manage/Run Script..." };
            items['purge-script'] = { name: "Purge END scripts" };
            items['fold1'] = { name: "Run Chaos Application...", "items": prorunsub };
            items['fold2'] = { name: "Manage Application Template...", "items": protemsub };

            if (node_selected != null) {
                items['open-process-console'] = { name: "Open Console " };
                // items['open-process-errconsole'] = { name: "Open Error console" };
                items['download-output'] = { name: "Download Files" };
                items['kill-process'] = { name: "Kill " };
                if (tmpObj.data.hasOwnProperty(node_selected) && tmpObj.data[node_selected].hasOwnProperty("msg") && (tmpObj.data[node_selected].msg !== "RUNNING")) {
                    items['start-process'] = { name: "Start " };
                }

            }
        }







        return items;
    }

    function updateProcessTable(tmpObj) {
        var tablename = "main_table-" + tmpObj.template;
        var template = tmpObj.type;
        var now = (new Date()).getTime();

        for (var p in tmpObj.data) {
            var pname = tmpObj.data[p].pname;

            if (tmpObj.hasOwnProperty('filter') && !(pname.includes(tmpObj['filter']))) {
                continue;
            }
            var ptype = tmpObj.data[p].ptype;

            var started_timestamp = jchaos.getDateTime(tmpObj.data[p].start_time);
            var end_timestamp = (tmpObj.data[p].end_time > 0) ? jchaos.getDateTime(Number(tmpObj.data[p].end_time)): "--";
            var last_log = (now - tmpObj.data[p].last_log_time) / 1000;
            var pid = tmpObj.data[p].pid;
            var timestamp = jchaos.getDateTime(Number(tmpObj.data[p].ts));
            var uptime = tmpObj.data[p].uptime;
            var systime = parseFloat(tmpObj.data[p].Psys).toFixed(3);
            var cputime = parseFloat(tmpObj.data[p].Puser).toFixed(3);
            var vmem = parseFloat(tmpObj.data[p].Vmem / 1024).toFixed(1);
            var rmem = tmpObj.data[p].Rmem / 1024;
            var pmem = parseFloat(tmpObj.data[p].pmem).toFixed(2);

            var hostname = tmpObj.data[p].hostname;
            var status = tmpObj.data[p].msg;
            var ndk_parent = tmpObj.data[p].parent;
            var infoServer = tmpObj.agents[hostname];
            var parent_str = ndk_parent;
            var encoden = jchaos.encodeName(p);
            $("#" + encoden + "_start_ts").html(started_timestamp);
            $("#" + encoden + "_end_ts").html(end_timestamp);
            $("#" + encoden + "_last_log_ts").html(jchaos.toHHMMSS(last_log.toFixed(0)));
            if (status == "RUNNING") {
                $("#" + encoden + "_status").html('<font color="green">' + status + "</font>");

            } else {
                $("#" + encoden + "_status").html('<font color="orange">' + status + "</font>");

            }
            $("#" + encoden + "_ts").html(timestamp);
            $("#" + encoden + "_uptime").html(uptime);
            $("#" + encoden + "_systime").html(systime);
            $("#" + encoden + "_cputime").html(cputime);
            $("#" + encoden + "_vmem").html(vmem);
            $("#" + encoden + "_rmem").html(rmem);
            $("#" + encoden + "_pmem").html(pmem);

            $("#" + encoden + "_parent").html(parent_str);
        }
        /*   if (tmpObj.hasOwnProperty("server_charts")) {
               var now = (new Date()).getTime();
               for (var server in tmpObj['agents']) {
                   var infoServer = tmpObj.agents[server];
                   var enc = jchaos.encodeName(server);
                   var chart = tmpObj['server_charts'][enc];
                   if ((chart != null) && chart.hasOwnProperty("series") && (chart.series instanceof Array)) {
                       chart.series[0].addPoint([now, infoServer.idle], false, false);
                       chart.series[1].addPoint([now, infoServer.user], false, false);
                       chart.series[2].addPoint([now, infoServer.sys], false, false);
                       chart.series[3].addPoint([now, infoServer.io], false, false);
                       chart.series[4].addPoint([now, infoServer.pmem], false, false);
   
                       chart.redraw();
                   }
               }
   
   
           }
           */

    }

    function updateScriptModal(tmpObj) {
        $("#table_script").find("tr:gt(0)").remove();
        var template = tmpObj.type;
        tmpObj['node_name_to_desc'] = {};

        jchaos.search("", "script", false, function (l) {
            if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)) {
                var list_algo = l['found_script_list'];
                list_algo.forEach(function (p) {
                    var encoden = jchaos.encodeName(p.script_name);
                    var date = jchaos.getDateTime(p.seq);
                    tmpObj.node_name_to_desc[p.script_name] = p;
                    $("#table_script").append('<tr class="row_element" title="' + p.script_description + '" id="' + encoden + '"' + template + '-name="' + p.script_name + '">' +
                        '<td>' + p.script_name + '</td>' +
                        '<td>' + p.eudk_script_language + '</td>' +
                        '<td>' + p.script_description + '</td>' +
                        '<td>' + date + '</td></tr>');
                });
            }
            $("#mdl-script").resizable().draggable();
            $("#mdl-script").width(hostWidth / 2);

            //  $("#mdl-script").css('width', hostWidth/2);
            // $("#mdl-script").css('height', hostHeight/2);

            $("#mdl-script").modal("show");

            $("#table_script tbody tr").click(function (e) {
                mainTableCommonHandling("table_script", tmpObj, e);
            });


        });
    }

    function loadScriptOnServer(tmpObj, jsonscript, serveList, handler) {
        if ((serveList == null) || (!(serverList instanceof Array))) {
            // load on all servers
            var ag = tmpObj['agent_list'];
            var cnt = ag.length;
            ag.forEach(function (ser) {
                var server = ser.ndk_host_name;
                jchaos.rmtUploadScript(server, jsonscript, function (r) {
                    if (r.err != 0) {
                        instantMessage(server + ": Load Script", "cannot load:" + r.errmsg, 5000, false);
                    } else {
                        instantMessage("Script loaded onto:" + server, 2000, false);
                        if (--cnt == 0) {
                            handler(r);
                        }
                    }


                }, function (bad) {
                    console.log("Some error getting loading script:" + bad);
                    instantMessage("Load Script", "Exception  loading:" + bad, 5000, false);

                });
            });
        } else {
            serveList.forEach(function (elem) {
                jchaos.rmtUploadScript(elem, jsonscript, function (r) {

                    console.log("Script loaded onto:" + elem + " :" + JSON.stringify(r));

                }, function (bad) {
                    console.log("Some error getting loading script:" + bad);
                });
            });

        }

    }
  jqccs.makeDynamicGraphTable=function(tmpObj, graph_table_name, highchartOpt, culist) {
    return makeDynamicGraphTable(tmpObj, graph_table_name, highchartOpt, culist);

}
  
    function makeDynamicGraphTable(tmpObj, graph_table_name, highchartOpt, culist) {
        var cnt = 0;
        var num_chart = 3;
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        var server_charts = {};
        var html = "";
        $("#" + graph_table_name).find("tr:gt(0)").remove();
        highchartOpt['chart']['height'] = (1 / (num_chart) * 100) + '%';
        highchartOpt['chart']['width'] = (hostWidth / (num_chart + 1));
        culist.forEach(function (key) {
            var encoden = jchaos.encodeName(key);
            if ((cnt % num_chart) == 0) {
                if (cnt > 0) {
                    html += "</tr>"
                }
                html += '<tr class="row_element" id=graph-row"' + cnt + '">';
            }
            html += '<td class="td_element" id="graph-' + encoden + '"></td>';

            cnt++;
        });
        if (cnt > 0) {
            html += "</tr>";
            $("#" + graph_table_name).append(html);
            culist.forEach(function (key) {
                var encoden = jchaos.encodeName(key);
                highchartOpt.title.text = key;

                server_charts[encoden] = new Highcharts.chart("graph-" + encoden, highchartOpt);

            });
            tmpObj[graph_table_name] = server_charts;

        }
    }

    function runScript(name, parm) {
        jchaos.runScript(name, parm, function (ok) {
            instantMessage("runScript:" + JSON.stringify(ok), 2000, true);

        }, function (bad) {
            instantMessage("runScript:" + bad, 2000, false);

        });

    }

    function updateProcessInterface(tmpObj) {
        //  updateProcessList(tmpObj);
        var tablename = "main_table-" + tmpObj.template;
        //   var graph_table = "graph_table-" + tmpObj.template;
        var template = tmpObj.type;
        var cnt = 0;
        var num_chart = 3;
        var hostWidth = $(window).width();
        var hostHeight = $(window).height();
        $("#" + tablename).find("tr:gt(0)").remove();

        /*  if (typeof tmpObj['agents'] === "undefined") {
              var ag_list = {};
              var obj = {
                  idle: 100,
                  io: 0,
                  pmem: 0,
                  sys: 0,
                  ts: 0,
                  user: 0
              }
              var list = jchaos.search("", "agent", true, false);
              list.forEach(function (ele) {
                  ag_list[ele] = obj;
              })
              tmpObj['agents'] = ag_list;
  
          }*/
        if ((typeof tmpObj['agents'] === "undefined"))
            return;
        if ((typeof tmpObj['agent_list'] === "undefined") || (JSON.stringify(tmpObj['agent_list']) !== JSON.stringify(tmpObj['old_agent_list']) || (typeof tmpObj['old_agent_list'] === "undefined"))) {
            tmpObj['old_agent_list'] = tmpObj['agent_list'];

            /*     var chart_options = {
                     chart: {
                         height: (1 / (num_chart) * 100) + '%',
                         width: (hostWidth / (num_chart + 1))
     
                     },
                     title: {
                         text: ''
                     },
     
                     xAxis: {
                         type: "datetime",
                         title: {
                             text: 'Time'
                         }
                     },
                     yAxis: {
                         title: {
                             text: '%'
                         },
                         max: 100
                     },
                     legend: {
                         layout: 'vertical',
                         align: 'right',
                         verticalAlign: 'middle'
                     },
     
                     plotOptions: {
                         series: {
                             label: {
                                 connectorAllowed: false
                             },
                         }
                     },
                     series: [{
                         name: 'idle',
                         data: []
                     }, {
                         name: 'cpu',
                         data: []
                     }, {
                         name: 'sys',
                         data: []
                     }, {
                         name: 'iow',
                         data: []
                     }, {
                         name: 'mem',
                         data: []
                     }]
                 };
                 $("#" + graph_table).find("tr:gt(0)").remove();
     */
            var serverlist = tmpObj['agents'];
            var html = "";
            var server_charts = {};

            /*    for (var key in serverlist) {
                    var encoden = jchaos.encodeName(key);
                    if ((cnt % num_chart) == 0) {
                        if (cnt > 0) {
                            html += "</tr>"
                        }
                        html += '<tr class="row_element" id=graph-row"' + cnt + '">';
                    }
                    html += '<td class="td_element processMenu" id="graph-' + encoden + '" agent-name="' + key + '"></td>';
    
                    cnt++;
                };
                if (cnt > 0) {
                    html += "</tr>";
                    $("#" + graph_table).append(html);
                    for (var key in serverlist) {
                        var encoden = jchaos.encodeName(key);
                        chart_options.title.text = "Agent on " + key;
    
                        server_charts[encoden] = new Highcharts.chart("graph-" + encoden, chart_options);
    
                    }
                    tmpObj['server_charts'] = server_charts;
    
                }
            }*/
            var ordered = [];
            for (var p in tmpObj.data) {
                if (tmpObj.data.hasOwnProperty(p)) {
                    ordered.push(p);
                }
            }
            ordered.sort();

            for (var cnt = 0; cnt < ordered.length; cnt++) {
                var obj = tmpObj.data[ordered[cnt]];
                var ptype = obj.ptype;
                var pname = obj.pname;

                if (tmpObj.hasOwnProperty('filter') && !(pname.includes(tmpObj['filter']))) {
                    continue;
                }
                var started_timestamp = obj.start_time;
                var end_timestamp = obj.end_time;
                var last_log = (obj.ts - obj.last_log_time);
                var pid = obj.pid;
                var timestamp = obj.ts;
                var uptime = obj.uptime;
                var systime = parseFloat(obj.systime).toFixed(3);
                var cputime = parseFloat(obj.cputime).toFixed(3);
                var vmem = obj.vmem;
                var rmem = obj.rmem;
                var pmem = obj.pmem;
                var hostname = obj.hostname;
                var status = obj.msg;
                var parent = obj.ndk_parent;
                var encoden = jchaos.encodeName(obj.uid);

                $("#" + tablename).append('<tr class="row_element processMenu" id="' + encoden + '"' + template + '-name=' + obj.uid + '>' +
                    '<td class="col-sm" id="' + encoden + '">' + obj.uid + '</td>' +
                    '<td class="col-sm">' + pname + '</td>' +
                    '<td class="col-sm">' + ptype + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_start_ts"' + started_timestamp + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_end_ts">' + end_timestamp + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_last_log_ts">' + last_log + '</td>' +
                    '<td class="col-sm">' + hostname + '</td>' +
                    '<td class="col-sm">' + pid + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_status">' + status + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_ts">' + timestamp + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_uptime">' + uptime + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_systime">' + systime + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_cputime">' + cputime + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_vmem">' + vmem + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_rmem">' + rmem + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_pmem">' + pmem + '</td>' +
                    '<td class="col-sm" id="' + encoden + '_parent">' + parent + '</td></tr>'
                );

            }
        }

        $("#" + tablename + " tr").click(function (e) {
            mainTableCommonHandling("main_table-" + template, tmpObj, e);
        });
        /*   n = $('#main_table-' + template + ' tr').size();
           if (n > 22) { 
               $("#table-scroll").css('height', '280px');
           } else {
               $("#table-scroll").css('height', '');
           }*/
        $.contextMenu('destroy', '.processMenu');

        $.contextMenu({
            selector: '.processMenu',
            build: function ($trigger, e) {
                var template = tmpObj.type;

                var cuitem = updateProcessMenu(tmpObj, $(e.currentTarget));

                cuitem['sep1'] = "---------";

                cuitem['quit'] = {
                    name: "Quit",
                    icon: function () {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    callback: function (cmd, options) {
                        executeProcessMenuCmd(tmpObj, cmd, options);
                        return;
                    },
                    items: cuitem
                }
            }


        });
        actionJsonEditor(tmpObj);
        $("#script-delete").off('click');

        $("#script-delete").on('click', function () {
            console.log("delete " + tmpObj.node_selected);
            jchaos.rmScript(tmpObj.node_name_to_desc[tmpObj.node_selected], function (data) {
                instantMessage("Remove Script", "removed:" + tmpObj.node_selected, 2000, true);
                updateScriptModal(tmpObj);

            });
        });
        // $("#script-edit").off('click');
        $("#script-edit").on('click', function () {
            console.log("show " + tmpObj.node_selected);

            jchaos.loadScript(tmpObj.node_selected, tmpObj.node_name_to_desc[tmpObj.node_selected].seq, function (data) {
                var templ = {
                    $ref: "algo.json",
                    format: "tabs"
                }
                $("#mdl-script").modal("hide");
                if (!data.hasOwnProperty('eudk_script_content')) {
                    instantMessage("Load Script", tmpObj.node_selected + " has no content", 4000, false);
                    return;
                }
                tmpObj.node_selected = null;
                data['eudk_script_content'] = decodeURIComponent(escape(atob(data['eudk_script_content'])));
                jsonEditWindow(tmpObj.node_selected, templ, data, algoSave, tmpObj);

            }, function (data) {
                instantMessage("Load Script", "failed:" + JSON.stringify(data), 4000, false);
            });

        });
        $("#script-run").off('click');
        $("#script-run").on('click', function () {
            $("#mdl-script").modal("hide");
            jchaos.loadScript(tmpObj.node_selected, tmpObj.node_name_to_desc[tmpObj.node_selected].seq, function (data) {
                var defargs = data['default_argument']
                getEntryWindow(data['script_name'], "Additional args", defargs, "Run", function (parm) {
                    runScript(tmpObj.node_selected, parm);
                }, "Cancel");
            });
        });
        $("#script-associate").off('click');

        $("#script-associate").on('click', function () {
            $("#mdl-script").modal("hide");
            var templ = {
                $ref: "agent.json",
                format: "tabs"
            }
            var supported = false;
            var script_type = "";


            jchaos.findBestServer(function (server, best_agent) {
                jchaos.loadScript(tmpObj.node_selected, tmpObj.node_name_to_desc[tmpObj.node_selected].seq, function (dscript) {

                    jchaos.node(best_agent, "info", "agent", function (data) {
                        var supported = false;
                        if (data != null) {
                            if (!(data.hasOwnProperty("andk_node_associated") || !(data.andk_node_associated instanceof Array))) {
                                data['andk_node_associated'] = []
                            }
                            var tmp = {
                                ndk_uid: tmpObj.node_selected + "_RENAME",
                                association_uid: 0,
                                node_launch_cmd_line: "",
                                node_script_id: tmpObj.node_selected,
                                node_workdir: "",
                                node_auto_start: true,
                                node_keep_alive: false,
                                node_log_on_console: true
                            };
                            var script_type = "";
                            getEntryWindow(tmpObj.node_selected + " arguments ", tmpObj.node_selected, "()", "Continue", function (fargs) {

                                if (dscript['eudk_script_language'] == "CPP") {
                                    fargs.replace("\"", "\\\"");

                                    tmp['node_launch_cmd_line'] = "chaosRoot --rootopt \"-q " + tmpObj.node_selected + fargs + "\"";
                                    supported = true;
                                    data['instance_name'] = best_agent;
                                    script_type = "nt_root";
                                }

                                if (supported) {
                                    getEntryWindow("Specify Unique Identifier for " + dscript['eudk_script_language'] + " SCript", tmpObj.node_selected, "NONAME_" + tmpObj.node_selected, "Create", function (inst_name) {
                                        tmp['ndk_uid'] = inst_name;

                                        data.andk_node_associated.push(tmp);
                                        var template = {};
                                        var templ = {
                                            $ref: "cu.json",
                                            format: "tabs"
                                        }
                                        template['ndk_uid'] = inst_name;
                                        template["ndk_parent"] = best_agent;
                                        template['ndk_type'] = script_type;
                                        template['cudk_desc'] = dscript['script_description'];
                                        template['auto_load'] = true;
                                        template['auto_init'] = true;
                                        template['auto_start'] = true;
                                        template['cudk_thr_sch_delay'] = 1;
                                        template['control_unit_implementation'] = tmp['node_launch_cmd_line'];
                                        template['seq_id'] = 0;
                                        //editorFn = jchaos.newCuSave;
                                        //jsonEdit(templ, template);
                                        jsonEditWindow("New EU ", templ, template, (json, obj, ok, bad) => {
                                            jchaos.node(inst_name, "new", script_type, best_agent, json, ok, bad);

                                        }, tmpObj, function (ok) {
                                            var template = {};
                                            var templ = {
                                                $ref: "agent.json",
                                                format: "tabs"
                                            }
                                            jsonEditWindow("Agent Editor", templ, data, jchaos.agentSave, null, function (k) {
                                                instantMessage("Agent save ", " OK", 2000, true);

                                            }, function (bad) {
                                                instantMessage("Agent save failed", JSON.stringify(bad), 4000, false);

                                            });

                                        }, function (bad) {
                                            instantMessage("EU save failed", bad, 2000, false);

                                        });
                                        /* jchaos.node(inst_name,"new",script_type,best_agent,()=>{
         
                                             jsonEditWindow("Agent Editor", templ, data, jchaos.agentSave, null, function (ok) {
                                                 if(dscript['eudk_script_language']=="CPP"){
                         
                                                 }
                                                 instantMessage("Agent save ", " OK", 2000, true);
                 
                                             }, function (bad) {
                                                 instantMessage("Agent save failed", bad, 2000, false);
                 
                                             });
                                     },(bad)=>{
                                         instantMessage("Cannot create container", bad, 5000, false);
         
                                     });*/


                                    }, "Cancel");


                                    //editorFn = agentSave;
                                    //jsonEdit(templ, data);


                                } else {
                                    alert("association with " + dscript['eudk_script_language'] + " not supported yet");
                                }
                            }, "Cancel");
                        };
                    });
                });
            });

        });// end associate
        $("#script-save").off('click');
        $("#script-save").on('click', function () {
            jchaos.loadScript(tmpObj.node_selected, tmpObj.node_name_to_desc[tmpObj.node_selected].seq, function (data) {

                var obj = atob(data['eudk_script_content']);
                var blob = new Blob([obj], { type: "json;charset=utf-8" });
                saveAs(blob, data['script_name']);
            });

        });
        $("#script-load").off('click');
        $("#script-load").on('click', function () {
            $("#mdl-script").modal("hide");
            algoLoadFromFile(tmpObj);
            tmpObj.node_selected = null;

        });
        $("#script-close").off('click');
        $("#script-close").on('click', function () {
            $("#mdl-script").modal("hide");
            tmpObj.node_selected = null;
        });

    }

    function updateProcess(tmpObj) {
        updateProcessList(tmpObj, function (t) {
            var new_ele;
            var old_ele;
            if (typeof t['elems'] === "undefined") {
                t['elems'] = [];
            }
            if (t['elems'] instanceof Array) {
                new_ele = t['elems'].sort();
            }
            if (t['old_elems'] instanceof Array) {
                old_ele = t['old_elems'].sort();
            }

            if ((JSON.stringify(new_ele) !== JSON.stringify(old_ele)) && ((typeof t['agents'] !== "undefined"))) {
                updateProcessInterface(t);
                t['old_elems'] = t['elems'];

            }
            updateProcessTable(t);
        });


    }

    function updateProcessList(tmpObj, handler) {
        if (!tmpObj.hasOwnProperty('agent_list')) {
            return;
        }
        var ag = tmpObj['agent_list'];

        jchaos.getAllProcessInfo(ag, function (pl) {
            tmpObj['data'] = pl['data'];
            tmpObj['elems'] = pl['elems'];
            tmpObj['agents'] = pl['agents'];
            handler(tmpObj);
        });
        handler(tmpObj);

    }

    function searchEu(str, alive, list_zone, list_class, list_eu_name) {
        var list_eu = [];
        eu_process = updateProcessList();
        for (var g in eu_process) {
            if (str != "") {
                if (g.indexOf(str) > 0) {
                    if (alive == true) {
                        if (eu_process[g].alive == true) {
                            list_eu.push(g);
                            getZoneClassElement(g, list_zone, list_class, list_eu_name);
                        }
                    } else {
                        list_eu.push(g);
                        getZoneClassElement(g, list_zone, list_class, list_eu_name);

                    }
                }
            } else {
                if (alive == true) {
                    if (eu_process[g].alive == true) {
                        list_eu.push(g);
                        getZoneClassElement(g, list_zone, list_class, list_eu_name);
                    }
                } else {
                    list_eu.push(g);
                    getZoneClassElement(g, list_zone, list_class, list_eu_name);
                }
            }
        }
        return list_eu;
    }

    function buildInterfaceFromPagedSearch(tmpObj, what) {
        var alive = $("input[type=radio][name=search-alive]:checked").val()
        var interface = $("#classe option:selected").val();
        var element_selected = $("#elements option:selected").val();
        var zone_selected = $("#zones option:selected").val();

        dashboard_settings['last_alive'] = alive;
        dashboard_settings['last_interface'] = interface;
        dashboard_settings['last_group'] = element_selected;
        dashboard_settings['last_zone'] = zone_selected;
        localStorage['chaos_dashboard_settings'] = JSON.stringify(dashboard_settings);

        var search_string = "";
        if ((typeof GetURLParameter('ALIVE') === "string") && (GetURLParameter('ALIVE') != "")) {
            alive = GetURLParameter('ALIVE');
        }

        if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
            search_string = zone_selected;
        }
        if ((typeof element_selected !== "undefined") && (element_selected != "ALL") && (element_selected != "--Select--")) {
            search_string += "/" + element_selected;
        }
        if ((typeof GetURLParameter('SEARCH') === "string") && (GetURLParameter('SEARCH') != "")) {
            if (search_string.length > 0) {
                search_string += "/" + GetURLParameter('SEARCH');
            } else {
                search_string += GetURLParameter('SEARCH');
            }
            $("#search-chaos").val(GetURLParameter('SEARCH'));
        } else {
            if ($("#search-chaos").val() != null && $("#search-chaos").val().length > 0) {
                if (search_string.length > 0) {
                    search_string += "/" + $("#search-chaos").val();
                } else {
                    search_string += $("#search-chaos").val();
                }
            }
        }

        var sopt = { "pagestart": dashboard_settings.current_page, "pagelen": dashboard_settings.maxNodesPerPage };
        if (interface != "--Select--" && interface != "ALL") {
            sopt['impl'] = implementation_map[interface];
        }
        dashboard_settings['search'] = search_string;
        jchaos.search(search_string, what, (alive == "true"), sopt, function (list_cu) {
            var search_query = {
                search: search_string,
                type: "ceu",
                alive: (alive == "true"),
                opt: { "pagestart": dashboard_settings.current_page, "pagelen": dashboard_settings.maxNodesPerPage }
            }
            dashboard_settings['pages'] = list_cu.pages;
            tmpObj['search_query'] = search_query;
            $(".pageindex").css("visibility", "visible");
            $("#page_number").html((dashboard_settings.current_page + 1) + "/" + dashboard_settings.pages);

            buildCUPage(tmpObj, list_cu.list, implementation_map[interface]);

        });
        $(".previous_page").off('click');
        $(".previous_page").click(function (e) {
            if (!dashboard_settings.hasOwnProperty('current_page')) {
                dashboard_settings['current_page'] = 0;
            }
            if (dashboard_settings.current_page > 0) {
                dashboard_settings.current_page--;
                if (tmpObj.hasOwnProperty('search_query')) {
                    var query = tmpObj['search_query'];
                    buildInterfaceFromPagedSearch(tmpObj, query.what);

                }
            }

        });
        $(".next_page").off('click');

        $(".next_page").click(function (e) {
            if (!dashboard_settings.hasOwnProperty('current_page')) {
                dashboard_settings['current_page'] = 0;
            }
            if (!dashboard_settings.hasOwnProperty('pages')) {
                dashboard_settings['pages'] = 1;
            }
            if (dashboard_settings.current_page < dashboard_settings.pages) {
                dashboard_settings.current_page++;
                var query = tmpObj['search_query'];
                buildInterfaceFromPagedSearch(tmpObj, query.what);

            }
        });

    }

    function mainCU(tmpObj) {
        var list_cu = [];
        var classe = ["powersupply", "motor", "camera", "BPM"];
        var $radio = $("input:radio[name=search-alive]");
        if ($radio.is(":checked") === false) {
            $radio.filter("[value=true]").prop('checked', true);
        }
        var alive = ($("[name=search-alive]:checked").val() == "true");

        var zones = jchaos.search("", "zone", alive);
        element_sel('#zones', zones, 1);


        $("#zones").click(function () {
            var zone_selected = $("#zones option:selected").val();
            if (zone_selected == "ALL") {
                var alive = ($("[name=search-alive]:checked").val() == "true");
                jchaos.search("", "zone", alive, function (zones) {
                    element_sel('#zones', zones, 1);
                }, function (error) {
                    stateOutput(error, true);
                });
            }
        });
        element_sel('#classe', classe, 1);

        $("#zones").change(function () {
            var zone_selected;
            var zone_selected = $("#zones option:selected").val();
            $("#search-chaos").val("");

            if (zone_selected == "--Select--") { //Disabilito la select dei magneti se non � selezionata la zona
                $("#elements").attr('disabled', 'disabled');
            } else {
                $("#elements").removeAttr('disabled');
            }
            if (zone_selected == "ALL") {
                jchaos.search(search_string, "class", alive, function (ll) {
                    element_sel('#elements', ll, 1);
                });

            } else {

                jchaos.search(zone_selected, "class", alive, function (ll) {
                    element_sel('#elements', ll, 1);
                });
            }
            buildInterfaceFromPagedSearch(tmpObj, "ceu");


            //   list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);

        });

        $("#elements").change(function () {
            var element_selected = $("#elements option:selected").val();
            var zone_selected = $("#zones option:selected").val();
            $("#search-chaos").val("");

            if (element_selected == "--Select--" || zone_selected == "--Select--") {
                $(".btn-main-function").hasClass("disabled");

            } else {
                $(".btn-main-function").removeClass("disabled");

            }

            dashboard_settings.current_page = 0;
            buildInterfaceFromPagedSearch(tmpObj, "ceu");

        });
        $("#classe").change(function () {
            dashboard_settings.current_page = 0;
            $("#search-chaos").val("");
            buildInterfaceFromPagedSearch(tmpObj, "ceu");


        });
        $("#search-chaos").keypress(function (e) {
            if (e.keyCode == 13) {
                search_string = $(this).val();
                dashboard_settings.current_page = 0;

                buildInterfaceFromPagedSearch(tmpObj, "ceu");

            }
            //var tt =prompt('type value');
        });

        $("input[type=radio][name=search-alive]").change(function (e) {
            dashboard_settings.current_page = 0;
            var alive = ($("[name=search-alive]:checked").val() == "true");
            jchaos.search("", "zone", alive, function (zones) {
                element_sel('#zones', zones, 1);
            }, function (error) {
                stateOutput(error, true);
            });
            jchaos.search(search_string, "class", alive, function (ll) {
                element_sel('#elements', ll, 1);
            });
            buildInterfaceFromPagedSearch(tmpObj, "ceu");

        });
        var defzone = "";
        var defgroup = "";
        var definterface = "";
        if ((typeof GetURLParameter('ZONE') === "string") && (GetURLParameter('ZONE') != "")) {
            defzone = GetURLParameter('ZONE');
        } else {
            if (dashboard_settings.hasOwnProperty("defaultZone") && (dashboard_settings.defaultZone != "") && (dashboard_settings.defaultZone != "ALL")) {
                defzone = dashboard_settings.defaultZone;
            } else if (dashboard_settings.hasOwnProperty("last_zone") && (dashboard_settings.last_zone != "")) {
                defzone = dashboard_settings.last_zone;
            }
        }
        if ((typeof GetURLParameter('GROUP') === "string") && (GetURLParameter('GROUP') != "")) {
            defgroup = GetURLParameter('GROUP');
        } else {
            if (dashboard_settings.hasOwnProperty("defaultGroup") && (dashboard_settings.defaultGroup != "")) {
                defgroup = dashboard_settings.defaultGroup;
            } else if (dashboard_settings.hasOwnProperty("last_group") && (dashboard_settings.last_group != "")) {
                defgroup = dashboard_settings.last_group;
            }
        }
        if ((typeof GetURLParameter('CLASS') === "string") && (GetURLParameter('CLASS') != "")) {
            definterface = GetURLParameter('CLASS');
        } else {
            if (dashboard_settings.hasOwnProperty("defaultInterface") && (dashboard_settings.defaultInterface != "")) {
                definterface = dashboard_settings.defaultInterface;
            } else if (dashboard_settings.hasOwnProperty("last_interface") && (dashboard_settings.last_interface != "")) {
                definterface = dashboard_settings.last_interface;
            }
        }
        if (defzone != "") {
            $("#zones option[value=\"" + defzone + "\"]").prop('selected', true);
            //$("#zones").val(defzone);

        }
        if (defgroup != "") {
            var cl = jchaos.search((defzone == "ALL") ? "" : defzone, "class", true);

            element_sel('#elements', cl, 1);

            $("#elements option[value=\"" + defgroup + "\"]").prop('selected', true);
        }
        if (definterface != "") {
            $("#classe option[value=\"" + definterface + "\"]").prop('selected', true);
            $("#classe").val(definterface);

        }
        if (defzone != "" || defgroup != "" || definterface != "") {
            buildInterfaceFromPagedSearch(tmpObj, "ceu");

        }

    }


    function interface2NodeList(tempObj, handler) {
        var inter = $("#classe").val();
        var search_string = $("#search-chaos").val();
        var alive = $("input[type=radio][name=search-alive]:checked").val();

        var tmp = [];
        var sopt = { "pagestart": dashboard_settings.current_page, "pagelen": dashboard_settings.maxNodesPerPage };
        var search_query = {
            search: search_string,
            type: inter,
            alive: (alive == "true"),
            opt: { "pagestart": dashboard_settings.current_page, "pagelen": dashboard_settings.maxNodesPerPage }
        }
        if ((inter == "ALL") || (inter == "--Select--")) {
            search_query['type'] = "server";
            jchaos.search(search_string, "server", (alive == "true"), sopt, function (node) {
                dashboard_settings['pages'] = node.pages;
                tempObj['search_query'] = search_query;
                tempObj.type = "ALL";
                $(".pageindex").css("visibility", "visible");
                $("#page_number").html((dashboard_settings.current_page + 1) + "/" + dashboard_settings.pages);
                handler(node.list.filter((val) => { return (val != ""); }));

            });

        } else {
            tempObj.type = inter;
            jchaos.search(search_string, inter, (alive == "true"), sopt,
                function (list) {
                    dashboard_settings['pages'] = list.pages;
                    tempObj['search_query'] = search_query;
                    $(".pageindex").css("visibility", "visible");
                    $("#page_number").html((dashboard_settings.current_page + 1) + "/" + dashboard_settings.pages);
                    var filt_list = [];
                    if (list.list instanceof Array) {
                        filt_list = list.list.filter((val) => { return (val != "") });

                    }
                    handler(filt_list);
                });

        }
        $(".previous_page").off('click');
        $(".previous_page").click(function (e) {
            if (!dashboard_settings.hasOwnProperty('current_page')) {
                dashboard_settings['current_page'] = 0;
            }
            if (dashboard_settings.current_page > 0) {
                dashboard_settings.current_page--;
                interface2NodeList(tempObj, function (list_cu) {
                    tempObj['elems'] = list_cu;
                    updateInterface(tempObj);
                });
            }

        });
        $(".next_page").off('click');
        $(".next_page").click(function (e) {
            if (!dashboard_settings.hasOwnProperty('current_page')) {
                dashboard_settings['current_page'] = 0;
            }
            if (!dashboard_settings.hasOwnProperty('pages')) {
                dashboard_settings['pages'] = 1;
            }
            if (dashboard_settings.current_page < dashboard_settings.pages) {
                dashboard_settings.current_page++;
                interface2NodeList(tempObj, function (list_cu) {
                    tempObj['elems'] = list_cu;
                    updateInterface(tempObj);
                });

            }
        });
        if (inter == "eu") {
            jchaos.variable("eu", "get", function (eu_process) {
                ;
                for (var g in eu_process) {
                    if (search_string != "") {
                        if (g.indexOf(search_string)) {
                            tmp.push(g);
                        }
                    } else {
                        tmp.push(g);
                    }
                }
                handler(tmp);
            });
        }
        return tmp;
    }


    function rebuildAlgoInterface(template) {

        var search_string = $("#search-chaos").val();
        //  var interface=$("#classe option:selected").val();
        var algo_instance = ($("input[type=radio][name=search-algo]:checked").val() == "true");
        if (algo_instance) {
            jchaos.search(search_string, "script", true, function (list_algo) {
                buildAlgoInterface(list_algo, interface, template);

            });

        } else {
            if ((node_selected != null) && (node_selected != "")) {
                pather_selected = node_selected;
            }
            if (pather_selected == null || pather_selected == "") {
                alert("Please select an algorithm before");
                return;
            }
            jchaos.searchScriptInstance(node_selected, search_string, function (list_instances) {

                buildAlgoInterface(list_instances, "algo-instance", template);

            });
        }
    }

    function mainAlgo(template) {
        search_string = "";

        var $radio = $("input:radio[name=search-algo]");
        var interface = $("#classe option:selected").val();
        var algos = [];
        var algos_names = [];
        /*jchaos.search(search_string, "script", true, function (list_algo) {
          for(var key in list_algo){
            if(list_algo[key] instanceof Array){
              algos=algos.concat(list_algo[key]);
             
            }
          }
          algos.forEach(function(elem){
            if(elem.hasOwnProperty("script_name")){
              algos_names.push(elem.script_name)
            }
          });
          element_sel('#classe',algos_names, 0);

        });
         */

        if ($radio.is(":checked") === false) {
            $radio.filter("[value=true]").prop('checked', true);
        }

        /*  $("#classe").change(function () {
            rebuildAlgoInterface(template);
          });*/
        $("#search-chaos").keypress(function (e) {
            if (e.keyCode == 13) {
                algos_names = [];
                algos = [];
                jchaos.search(search_string, "script", true, function (list_algo) {
                    for (var key in list_algo) {
                        if (list_algo[key] instanceof Array) {
                            algos = algos.concat(list_algo[key]);
                        }
                    }
                    algos.forEach(function (elem) {
                        if (elem.hasOwnProperty("script_name")) {
                            algos_names.push(elem.script_name)
                        }
                    });
                    element_sel('#classe', algos_names, 0);

                });
                rebuildAlgoInterface(template);
            }
            //var tt =prompt('type value');
        });

        $("input[type=radio][name=search-alive]").change(function (e) {
            rebuildAlgoInterface(template);

        });

    }
    /******************
     * MAIN TABLE HANDLING
     * 
     */
    function mainTableCommonHandling(id, tmpObj, e) {
        var node_list = tmpObj['elems'];
        $("#mdl-commands").modal("hide");
        if (tmpObj.node_selected == $(e.currentTarget).attr(tmpObj.type + "-name")) {
            $(".row_element").removeClass("bg-warning");
            tmpObj.node_multi_selected = [];
            tmpObj.node_selected = null;
            tmpObj.last_index_selected = -1;
            dashboard_settings['selection'] = [];
            return;
        }
        tmpObj.node_selected = $(e.currentTarget).attr(tmpObj.type + "-name");
        tmpObj.index = $(e.currentTarget).index();
        var name = jchaos.encodeName(tmpObj.node_selected);

        if (!e.ctrlKey) {
            $(".row_element").removeClass("bg-warning");
            tmpObj.node_multi_selected = [];
            tmpObj.node_multi_selected.push(tmpObj.node_selected);
        } else {
            if (!tmpObj.node_multi_selected.includes(tmpObj.node_selected)) {
                tmpObj.node_multi_selected.push(tmpObj.node_selected);
            }

        }
        $(e.currentTarget).addClass("bg-warning");

        if (e.shiftKey) {
            var nrows = $(e.currentTarget).index();
            if (tmpObj.last_index_selected != -1) {
                tmpObj.node_multi_selected = [];
                //alert("selected shift:"+nrows+" interval:"+(nrows-last_index_selected));
                if (nrows > tmpObj.last_index_selected) {
                    //$('#main_table tr:gt('+(last_index_selected)+'):lt('+(nrows)+')').addClass("bg-warning");
                    $("#" + id + " tr").slice(tmpObj.last_index_selected + 1, nrows + 1).addClass("bg-warning");
                    for (var cnt = tmpObj.last_index_selected; cnt <= nrows; cnt++) {
                        tmpObj.node_multi_selected.push(node_list[cnt]);

                    }

                }
            }
        } else if (e.ctrlKey) {
            var nrows = $(e.currentTarget).index();
            tmpObj.node_multi_selected.push(node_list[nrows])
        }
        tmpObj.last_index_selected = $(e.currentTarget).index();
        dashboard_settings['selection'] = tmpObj.node_multi_selected;
    }



    /********************* */
    function generateGenericTable(tmpObj) {
        var cu = [];
        if (tmpObj['elems'] instanceof Array) {
            cu = tmpObj.elems;
        }
        var template = tmpObj.type;
        var html = '<div class="row" z-index=-1 id="table-space">';
        html += '<div class="col-md-12">';
        html += '<div class="box-content col-md-12">';
        if (cu.length == 0) {
            html += '<p id="no-result-monitoring">No results match</p>';

        } else {
            html += '<p id="no-result-monitoring"></p>';

        }

        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Name CU</th>';
        html += '<th colspan="3">Status</th>';
        html += '<th>Timestamp</th>';
        html += '<th>Uptime</th>';
        html += '<th colspan="2">Time sys/usr [%]</th>';
        html += '<th colspan="2">Command Current/Queue</th>';
        html += '<th colspan="2">Alarms dev/cu</th>';
        html += '<th colspan="3">Hz KB/s</th>';
        html += '</tr>';


        html += '</thead> ';
        $(cu).each(function (i) {
            var cuname = jchaos.encodeName(cu[i]);
            html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
            html += "<td class='name_element'>" + cu[i] + "</td>";
            html += "<td id='" + cuname + "_health_status'></td>";
            html += "<td id='" + cuname + "_system_busy'></td>";
            html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
            html += "<td id='" + cuname + "_health_timestamp'></td>";
            html += "<td id='" + cuname + "_health_uptime'></td>";
            html += "<td id='" + cuname + "_health_systemtime'></td>";
            html += "<td id='" + cuname + "_health_usertime'></td>";
            html += "<td id='" + cuname + "_system_current_command'></td>";
            html += "<td id='" + cuname + "_system_command'></td>";
            html += "<td title='Device alarms' id='" + cuname + "_system_device_alarm'></td>";
            html += "<td title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td>";
            html += "<td id='" + cuname + "_health_prate'></td><td id='" + cuname + "_health_pband'></tr>";


        });

        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }


    jqccs.updateGenericTableDataset = function (tmpObj) {
        return updateGenericTableDataset(tmpObj);
    }

    function updateGenericTableDataset(tmpObj) {

        if (typeof updateGenericTableDataset.count === "undefined") {
            updateGenericTableDataset.count = 1;
        } else {
            updateGenericTableDataset.count++;
        }
        updateCUDS(tmpObj);


        $("a.device-alarm").off();
        $("a.device-alarm").click(function (e) {
            //var id = $(this).attr("cuname");
            //show_dev_alarm(id);
            //var node=tmpObj.node_selected;
            var node = $(this).attr("cuname");
            var cindex = tmpObj.node_name_to_index[node];

            var alarm = tmpObj.data[cindex];

            if (alarm != null && alarm.hasOwnProperty("device_alarms")) {
                decodeDeviceAlarm(alarm.device_alarms);
            }
        });
        $("a.cu-alarm").off();
        $("a.cu-alarm").click(function (e) {

            //      var node=tmpObj.node_selected;
            var node = $(this).attr("cuname");
            var cindex = tmpObj.node_name_to_index[node];

            var alarm = tmpObj.data[cindex];
            if (alarm != null && alarm.hasOwnProperty("cu_alarms")) {
                var obj = {};
                if (alarm.health.nh_lem != "") {
                    obj = Object.assign({ 'message': alarm.health.nh_lem, 'domain': alarm.health.nh_led }, alarm.cu_alarms);
                } else {
                    obj = Object.assign({}, alarm.cu_alarms);

                }

                decodeDeviceAlarm(obj);
            }
        });
    }





    function generateScraperTable(tmpObj) {

    }





    function notSelectedElems(tmpObj) {
        var ret = [];
        if (!(tmpObj.node_multi_selected instanceof Array)) {
            return tmpObj['elems'];
        }

        tmpObj['elems'].forEach(function (g) {
            if (!tmpObj.node_multi_selected.includes(g)) {
                ret.push(g);
            }

        });
        return ret;
    }

    function updateCUDS(tmpObj) {
        if (tmpObj.data == null || !(tmpObj.data instanceof Array)) {
            return;
        }
        var cu = tmpObj.data;
        cu.forEach(function (el) {
            try {
                var name_device_db, name_id;
                var status;
                if (el.hasOwnProperty('health') && (el.health.hasOwnProperty("ndk_uid"))) { //if el health
                    name_device_db = el.health.ndk_uid;
                    name_id = jchaos.encodeName(name_device_db);
                    el.systTime = Number(el.health.nh_st).toFixed(3);
                    el.usrTime = Number(el.health.nh_ut).toFixed(3);
                    el.tmStamp = Number(el.health.dpck_ats);

                    el.tmUtm = jchaos.toHHMMSS(el.health.nh_upt);
                    status = el.health.nh_status;
                    $("#" + name_id + "_health_uptime").html(el.tmUtm);
                    $("#" + name_id + "_health_timestamp").html(jchaos.getDateTime(el.tmStamp));
                    $("#" + name_id + "_health_usertime").html(el.usrTime);
                    $("#" + name_id + "_health_systemtime").html(el.systTime);
                    $("#" + name_id + "_health_prate").html(Number(el.health.cuh_dso_prate).toFixed(3));
                    if (el.health.hasOwnProperty("cuh_dso_size")) {
                        var band = Number(el.health.cuh_dso_prate) * Number(el.health.cuh_dso_size) / 1024;
                        $("#" + name_id + "_health_pband").html(band.toFixed(3));
                    }
                    if ((status != "Unload") && (status != "Fatal Error")) {
                        switch (tmpObj.off_line[name_device_db]) {
                            case 1:
                                status = "Dead";
                                break;
                            case 2:
                                status = "Checking";
                                break;

                        }
                    }

                    $("#" + name_id + "_health_status").attr('title', "Device status:" + status);


                    if (status == 'Start') {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:green">play_arrow</i>');
                    } else if (status == 'Stop') {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:orange">stop</i>');
                    } else if (status == 'Calibrating') {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:green">assessment</i>');
                    } else if (status == 'Init') {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:yellow">trending_up</i>');

                    } else if (status == 'Deinit') {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:red">trending_down</i>');

                    } else if (status == 'Fatal Error' || status == 'Recoverable Error') {
                        $("#" + name_id + "_health_status").html('<a id="Error-' + name_id + '" cuname="' + name_device_db + '" role="button" class="cu-alarm" ><i class="material-icons" style="color:red">cancel</i></a>');
                        $("#" + name_id + "_health_status").attr('title', "Device status:'" + status + "' " + el.health.nh_lem);

                    } else if (status == "Unload") {
                        $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:red">power</i>');


                    } else if (status == "Load") {
                        $("#" + name_id + "_health_status").html('<i class="material-icons verde" style="color:green">power</i>');

                    } else if (tmpObj.off_line[name_device_db] == 2) {
                        $("#" + name_id + "_health_status").html('<i class="material-icons">update</i>');

                    } else {
                        $("#" + name_id + "_health_status").html('<i class="material-icons red">block</i>');

                    }
                }
                if (el.hasOwnProperty('system') && (tmpObj.off_line[name_device_db] == 0)) { //if el system
                    var busy = $.trim(el.system.busy);
                    var dev_alarm = Number(el.system.cudk_dalrm_lvl);
                    var cu_alarm = Number(el.system.cudk_calrm_lvl);
                    if (dev_alarm == 1) {
                        $("#" + name_id + "_system_device_alarm").attr('title', "Device Warning");
                        $("#" + name_id + "_system_device_alarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" role="button"  ><i class="material-icons" style="color:yellow">error</i></a>');
                    } else if (dev_alarm == 2) {
                        $("#" + name_id + "_system_device_alarm").attr('title', "Device Error");
                        $("#" + name_id + "_system_device_alarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" role="button" ><i class="material-icons" style="color:red">error</i></a>');
                    } else {
                        $("#" + name_id + "_system_device_alarm").html('');
                    }

                    if (cu_alarm == 1) {
                        $("#" + name_id + "_system_cu_alarm").attr('title', "Control Unit Warning");

                        $("#" + name_id + "_system_cu_alarm").html('<a id="cu-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="cu-alarm"  role="button" ><i class="material-icons" style="color:yellow">error_outline</i></a>');
                    } else if (cu_alarm == 2) {
                        $("#" + name_id + "_system_cu_alarm").attr('title', "Control Unit Error");

                        $("#" + name_id + "_system_cu_alarm").html('<a id="cu-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="cu-alarm" role="button"><i  class="material-icons" style="color:red">error_outline</i></a>');
                    } else {
                        $("#" + name_id + "_system_cu_alarm").html('');
                    }

                    if (el.system.hasOwnProperty("running_cmd_alias")) {
                        var cmd_state = el.system.running_cmd_alias;
                        if (el.system.hasOwnProperty("cudk_set_tag") && el.system.hasOwnProperty("cudk_set_state")) {
                            if (el.system.cudk_set_state == 3) {
                                cmd_state = el.system.running_cmd_alias + " (<b>" + el.system.cudk_set_tag + "</b>)";
                            } else if (el.system.cudk_set_state < 0) {
                                cmd_state = el.system.running_cmd_alias + ' (<font color="red">' + el.system.cudk_set_tag + '</font>)';
                            } else {
                                if (updateGenericTableDataset.count & 1) {
                                    cmd_state = el.system.running_cmd_alias + ' (<font color="yellow"><b>' + el.system.cudk_set_tag + '</b></font>)';
                                } else {
                                    cmd_state = el.system.running_cmd_alias + ' (<font color="orange"><b>' + el.system.cudk_set_tag + '</b></font>)';

                                }
                            }
                        }
                        if (busy == "true") {
                            if (updateGenericTableDataset.count & 1) {
                                $("#" + name_id + "_system_current_command").html("<b>" + cmd_state + "</b>");
                            } else {
                                $("#" + name_id + "_system_current_command").html(cmd_state);
                            }
                        } else {
                            $("#" + name_id + "_system_current_command").html(cmd_state);
                        }
                    } else {
                        $("#" + name_id + "_system_current_command").html("NA");
                    }
                    $("#" + name_id + "_system_command").html(el.system.dp_sys_que_cmd);

                    if (status == 'Start') {
                        if (updateGenericTableDataset.count & 1) {
                            if (el.system.hasOwnProperty("cudk_burst_state") && el.system.cudk_burst_state) {
                                $("#" + name_id + "_health_status").html('<i class="material-icons verde" style="color:green">videocam</i>');
                                $("#" + name_id + "_health_status").attr('title', "TAG:'" + el.system.cudk_burst_tag + "'");
                            } else if (el.system.hasOwnProperty("dsndk_storage_type") && (el.system.dsndk_storage_type & 0x1)) {
                                $("#" + name_id + "_health_status").html('<i class="material-icons" style="color:green">save</i>');
                            }
                        }
                    }



                    if (busy == 'true') {
                        $("#" + name_id + "_system_busy").attr('title', "The device is busy command in queue:" + el.system.dp_sys_que_cmd + " cmd:" + el.system.running_cmd_alias);
                        if (updateGenericTableDataset.count & 1) {
                            $("#" + name_id + "_system_busy").html('<i id="busy_' + name_id + '" class="material-icons" style="color:green">hourglass_empty</i>');
                        } else {
                            $("#" + name_id + "_system_busy").html('<i id="busy_' + name_id + '" class="material-icons" style="color:green">hourglass_full</i>');
                        }
                    } else {
                        $("#" + name_id + "_system_busy").html('');
                    }
                    if (el.system.hasOwnProperty("dp_sys_unit_type") && (el.system.dp_sys_unit_type == "nt_script_eu")) {
                        $("#" + name_id + "_system_bypass").attr('title', "Script EU")
                        $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons" style="color:green">settings</i>');
                    } else {
                        if (el.system.hasOwnProperty("cudk_bypass_state")) {
                            if (el.system.cudk_bypass_state == false) {
                                $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons" style="color:green">usb</i>');
                                $("#" + name_id + "_system_bypass").attr('title', "Bypass disabled")

                            } else {
                                $("#" + name_id + "_system_bypass").attr('title', "Bypass enabled")

                                $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons yellow">cached</i>');
                            }
                        } else if (!el.system.hasOwnProperty("dp_sys_unit_type") || (el.system.dp_sys_unit_type != "nt_rt_cu")) {
                            $("#" + name_id + "_system_bypass").attr('title', "Rest CU")
                            $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons" style="color:green">http</i>');
                        }
                    }
                }

                /*if (el.hasOwnProperty("output")){
                    var lat=el.output.dpck_mds_ats-el.output.dpck_ats;
                    if(typeof lat === "number"){
                        $("#" + name_id + "_latenza").html(lat);
                    } else {
                        $("#" + name_id + "_latenza").html("NA");

                    }

                }*/
                for (var dstype of ["output", "input", "custom"]) {
                    if (el.hasOwnProperty(dstype) && (el[dstype].hasOwnProperty("ndk_uid"))) {
                        name_device_db = el[dstype].ndk_uid;
                        name_id = jchaos.encodeName(name_device_db);

                        for (var key in el[dstype]) {
                            var val = el[dstype][key];
                            var val_saved;
                            var selector = "#" + name_id + "_" + dstype + "_" + key;
                            var selector_save = "#" + name_id + "_" + dstype + "_saved_" + key;
                            if ((cu_name_to_saved != null) && (cu_name_to_saved[name_device_db] != null) && (cu_name_to_saved[name_device_db][dstype] != null)) {
                                val_saved = cu_name_to_saved[name_device_db][dstype][key];
                                if (val_saved != null) {
                                    html_save = val_saved;
                                }
                            }
                            var html = "NA";
                            var html_save = "";
                            if (typeof val === "number") {

                                var attr = $(selector).attr('digits');
                                var digits = tmpObj.digits;

                                if (typeof attr !== typeof undefined && attr !== false) {
                                    digits = attr;

                                }
                                html = val.toFixed(digits)
                            } else if (typeof val !== "object") {
                                html = val;
                            }
                            if (tmpObj.htmlFn.hasOwnProperty(dstype) &&
                                tmpObj.htmlFn[dstype].hasOwnProperty(key) && (typeof tmpObj.htmlFn[dstype][key] === "function")) {
                                html = tmpObj.htmlFn[dstype][key](val);
                                if ((val_saved != null)) {
                                    html_save = tmpObj.htmlFn[dstype][key](val_saved);

                                }
                            }
                            $(selector).html(html);
                            if ($(selector_save).length) {
                                $(selector_save).html(html_save);

                            }

                        }
                    }
                }

            } catch (e) {
                console.log(name_device_db + " warning :", e);
            }
        });
    }

    function updateCameraFields(ds) {
        if (ds.hasOwnProperty('output')) {
            var name_device_db = ds.output.ndk_uid;
            var name_id = jchaos.encodeName(name_device_db);
            if (ds.hasOwnProperty('SHUTTER')) {
                $("#" + name_id + "_output_shutter").html(ds.SHUTTER);
            } else {

            }
            $("#" + name_id + "_output_gain").html(ds.GAIN);
            $("#" + name_id + "_output_brightness").html(ds.BRIGHTNESS);
            if (ds.hasOwnProperty("TRIGGER_MODE")) {
                $("#" + name_id + "_camera_mode").html(ds.BRIGHTNESS);

            }

        }
    }


    function generateGraphList() {
        var html = '<div class="modal hide fade" id="mdl-graph-list">';

        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3 id="list_graphs">List Graphs</h3>';

        html += '<div class="row"><label class="col-md-2">Search:</label><input class="input-xlarge focused" id="graph_search" class="col-md-5" type="text" title="Search a graph" value=""></div>';

        html += '</div>';

        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';

        html += '<table class="table table-striped" id="table_graph">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Name</th>';
        html += '<th>Date</th>';
        html += '<th>Type</th>';

        html += '</tr>';
        html += '</thead>';
        html += '</table>';

        html += '<table class="table table-striped" id="table_trace">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Name</th>';
        html += '<th>X</th>';
        html += '<th>Y</th>';
        html += '</tr>';
        html += '</thead>';
        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '<div class="modal-footer">';

        html += '<a href="#" class="btn" title="Delete the selected Graph" id="graph-delete">Delete</a>';
        html += '<a href="#" class="btn" title="Launch the selected Graph" id="graph-list-run">Run</a>';
        html += '<a href="#" class="btn" title="Save the selected Graph settings to Disk" id="graph-list-save">Download</a>';
        html += '<a href="#" class="btn" title="Restore the Graph setting from Disk" id="graph-list-upload">Upload</a>';

        html += '<a href="#" class="btn" title="Edit the Graph setting" id="graph-list-edit">Edit..</a>';

        html += '<a href="#" class="btn" title="Close this modal" id="graph-list-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;


    }

    function generateQueryTable() {
        var html = '<div class="modal hide fade draggable" id="mdl-query">';

        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3>Query History</h3>';
        html += '</div>';

        html += '<div class="modal-body">';
        html += '<div class="row">';

        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<h3 class="box-header">Query options</h3>';

        html += '<div id="reportrange-" class="col-md-12" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">';
        html += '<i class="fa fa-calendar"></i>&nbsp';
        html += '<span></span> <i class="fa fa-caret-down"></i>';
        html += '</div>';

        html += '<label class="label col-md-3">Start </label>';
        html += '<input class="input-xlarge focused col-md-9" id="query-start" title="Start of the query (epoch in ms or hhmmss offset )" type="text" value="">';
        html += '<label class="label col-md-3">Stop </label>';
        html += '<input class="input-xlarge focused col-md-9" id="query-stop" title="End of the query (empty means: now)" type="text" value="NOW">';

        html += '<label class="label col-md-3">Available Tag</label>';
        html += '<select class="col-md-9" id="select-tag" title="Existing tags"></select>';
        html += '<label class="label col-md-3">Tag Name </label>';
        html += '<input class="input-xlarge focused col-md-9" id="query-tag" title="Tag Name" type="text" value="">';

        html += '<label class="label col-md-3">Page </label>';
        html += '<input class="input-xlarge focused col-md-9" id="query-page" title="page length" type="number" value=30>';
        html += '<label class="label col-md-3">Query chunk </label>';
        html += '<input class="input-xlarge focused col-md-9" id="query-chunk" title="if supported cut the query in chunk of the given seconds" type="number" value=3600>';

        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '<div class="modal-footer">';


        /*
          html += '<a href="#" class="btn" id="query-yesterday">Yesterday</a>';
          html += '<a href="#" class="btn" id="query-today">Today</a>';
          */
        html += '<a href="#" class="btn" id="query-run">Run</a>';
        html += '<a href="#" class="btn" id="query-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;

    }

    function generateGraphTable() {
        var html = '<div class="modal hide fade" id="mdl-graph">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3>Graph options</h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div class="row">';

        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<h3 class="box-header">Graph options</h3>';
        html += '<label class="label col-md-3">Width </label>';
        html += '<input class="input-xlarge focused col-md-9" id="graph-width" title="Width px" type="number" value="640">';
        html += '<label class="label col-md-3">High </label>';
        html += '<input class="input-xlarge focused col-md-9" id="graph-high" title="High px" type="number" value="480">';

        html += '<label class="label col-md-3" >Graph Type </label>';
        html += '<select id="graphtype" class="col-md-9">';
        html += '<option value="line" selected="selected">Line</option>';
        html += '<option value="scatter">Scatter</option>';
        html += '<option value="column">Column</option>';
        html += '<option value="histogram">Histogram</option>';
        html += '</select>';
        html += '<label class="label col-md-3">Graph update (ms) </label>';
        html += '<input class="input-xlarge col-md-9" id="graph-update" type="number" value="1000">';

        html += '<label class="label col-md-3">Graph Scroll </label>';
        html += '<div class="col-md-3">'
        html += '<label for="graph-shift">enable scroll</label><input class="input-xlarge" id="shift-true" title="ENABLE scroll graph whenever keep seconds are reached" name="graph-shift" type="radio" value="true">';
        html += '</div>'
        html += '<div class="col-md-3">'
        html += '<label for="graph-shift">disable scroll</label><input class="input-xlarge" id="shift-false" title="DISABLE scroll graph whenever keep seconds are reached" name="graph-shift" type="radio" value="false">';
        html += '</div>'

        html += '<label class="label col-md-3">Graph keep seconds (s) </label>';
        html += '<input class="input-xlarge col-md-9" id="graph-keepseconds" type="number" value="3600">';

        html += '<label class="label col-md-3" >Trace Type </label>';
        html += '<select id="trace-type" class="col-md-9">';
        html += '<option value="multi" selected="multi">Multiple Independent Traces</option>';
        html += '<option value="single">Single Trace</option>';
        html += '</select>';

        html += '</div>';
        html += '</div>';

        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<h3 class="box-header" id="X-axis">X-axis Options</h3>';

        html += '<label class="label col-md-3">Name </label>';
        html += '<input class="input-xlarge focused col-md-9" id="xname" type="text" value="X">';
        html += '<label class="label col-md-3">Max </label>';
        html += '<input class="input-xlarge focused col-md-9" id="xmax" title="Max X Scale" type="text" value="Auto">';
        html += '<label class="label col-md-3">Min </label>';
        html += '<input class="input-xlarge focused col-md-9" id="xmin" title="Min X Scale" type="text" value="Auto">';
        html += '<label class="label col-md-3" >Scale </label>';
        html += '<select id="xtype" class="col-md-9">';
        html += '<option value="linear">Linear scale</option>';
        html += '<option value="logarithmic">Logarithmic</option>';
        html += '<option value="datetime" selected="selected">DateTime</option>';
        html += '<option value="category">Category</option>';

        html += '</select>';

        html += '</div>';
        html += '</div>';

        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<h3 class="box-header">Y-axis Options</h3>';

        html += '<label class="label col-md-3">Name </label>';
        html += '<input class="input-xlarge col-md-9" id="yname" type="text" value="Y">';
        html += '<label class="label col-md-3">Max </label>';
        html += '<input class="input-xlarge col-md-9" id="ymax" type="text" title="Max Y Scale" value="Auto">';
        html += '<label class="label col-md-3">Min </label>';
        html += '<input class="input-xlarge col-md-9" id="ymin" type="text" title="Min Y Scale" value="Auto">';
        html += '<label class="label col-md-3" >Scale </label>';
        html += '<select id="ytype" class="col-md-9">';
        html += '<option value="linear" selected="selected">Linear scale</option>';
        html += '<option value="logarithmic">Logarithmic</option>';
        html += '<option value="datetime">DateTime</option>';
        html += '<option value="category">Category</option>';

        html += '</select>';

        html += '</div>';
        html += '</div>';

        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<h3 class="box-header">Trace Options</h3>';

        html += '<label class="label col-md-2">Name </label>';
        html += '<input class="input-xlarge col-md-10" id="trace-name" title="Name of the trace" type="text" value="">';

        html += '<label class="label col-md-1">X:</label>';
        html += '<input class="input-xlarge col-md-11" type="text" title="port path to plot on X (timestamp,sequence,fullpath,[-1] all array components)" id="xvar" value="timestamp">';
        html += '<label class="label col-md-1">Y:</label>';
        html += '<input class="input-xlarge col-md-11" type="text" id="yvar" title="port path to plot on Y (timestamp,sequence,fullpath,[-1] all array components)" value="">';
        html += '<label class="label col-md-1">Color:</label>';
        html += '<input class="input-xlarge col-md-11" type="text" id="trace-color" title="Trace Color (empty = auto)" value="">';

        html += '<a href="#" class="btn col-md-2" id="trace-add" title="Add the following trace to the Graph" >Add Trace</a>';
        html += '<a href="#" class="btn col-md-2" id="trace-replace" title="Replace the following trace to the Graph" >Replace Trace</a>';

        html += '<a href="#" class="btn col-md-2" id="trace-rem" title="Remove the selected trace" >Remove Trace</a>';
        html += '<a href="#" class="btn col-md-2" id="trace-up" title="Move Trace up" >Trace UP</a>';
        html += '<a href="#" class="btn col-md-2" id="trace-down" title="Move Trace down" >Trace Down</a>';


        html += '</div>';
        html += '</div>';


        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<table class="table table-striped" id="table_graph_items">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Trace Name</th>';
        html += '<th id="X-axis">X-Axis</th>';
        html += '<th id="Y-axis">Y-Axis</th>';
        html += '<th id="Color">Color</th>';

        html += '</tr>';
        html += '</thead>';
        html += '</table>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        html += '</div>';
        html += '<div class="modal-footer">';

        html += '<input class="input-xlarge" id="graph_save_name" title="Graph Name" type="text" value="">';
        html += '<a href="#" class="btn" id="graph-run">Run</a>';
        html += '<a href="#" class="btn" id="graph-save">Save</a>';
        html += '<a href="#" class="btn" id="graph-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function getValueFromCUList(culist, path) {
        for (var cnt = 0; cnt < culist.length; cnt++) {
            var item = culist[cnt];
            for (var keys in item) {
                if (path.cu == item[keys].ndk_uid) {
                    if ((path.dir == keys) && (item[keys].hasOwnProperty(path.var))) {
                        if (path.index != null) {
                            var val = convertBinaryToArrays(item[keys][path.var]);
                            if (path.index == "-1") {
                                return val;
                            } else {
                                return Number(val[path.index]);
                            }
                        }
                        return Number(item[keys][path.var]);
                    }
                }
            }
            /* if (path.cu == item.health.ndk_uid) {
                 if (path.dir == "output") {
                     if (item.output.hasOwnProperty(path.var)) {
                         if (path.index != null) {
                             var val = convertBinaryToArrays(item.output[path.var]);
                             if (path.index == "-1") {
                                 return val;
                             } else {
                                 return Number(val[path.index]);
                             }
                         }
                         return Number(item.output[path.var]);
                     }
                 } else if (path.dir == "input") {
                     if (item.input.hasOwnProperty(path.var)) {
                         if (path.index != null) {
                             var val = convertBinaryToArrays(item.input[path.var]);
                             if (path.index == "-1") {
                                 return val;
                             } else {
                                 return Number(val[path.index]);
                             }
                         }
                         return Number(item.input[path.var]);
                     }
                 } else if (path.dir == "health") {
                     if (item.health.hasOwnProperty(path.var)) {
                         if (path.index != null) {
                             var val = convertBinaryToArrays(item.health[path.var]);


                             return Number(val[path.index]);
                         }
                         return item.health[path.var];
                     }
                 }

             }*/
        }
        return null;
    }

    function dir2channel(dir) {
        if (dir == "output") {
            return 0;
        } else if (dir == "health") {
            return 4;
        } else if (dir == "input") {
            return 1;
        }
        return 0;
    }

    function runQueryToGraph(gname, start, stop, options) {


        var av_graphs = jchaos.variable("graphs", "get", null, null);
        if (!(av_graphs[gname] instanceof Object)) {
            alert("\"" + gname + "\" not a valid graph "+gname);
            return;
        }
        var qtag = "";
        var page = 30;
        var chunk = 3600;
        var autoreduction = 1;
        if (options.hasOwnProperty("tag")) {
            qtag = options.tag;
        }
        if (options.hasOwnProperty("page")) {
            page = options.page;
        }
        if (options.hasOwnProperty("chunk")) {
            chunk = options.chunk;
        }
        if (options.hasOwnProperty("reduction") && (typeof options.reduction === "number")) {
            autoreduction = Number(options.reduction);
        }

        if (!(active_plots[gname] instanceof Object)) {
            alert("\"" + gname + "\" not a valid graph ");
            return;
        }
        var items = 0;
        if (stop == "" || stop == "NOW") {
            stop = (new Date()).getTime();
        }

        if (typeof chunk !== "number") {
            chunk = stop - start;
        }
        if (typeof start !== "number") {
            start = Number(start);
        }
        if (typeof stop !== "number") {
            stop = Number(stop);
        }
        chunk = chunk * 1000; // in ms

        jchaos.options.updateEachCall = true;
        jchaos.setOptions({ "timeout": 60000 });
        $("#query-start").val(start);
        $("#query-stop").val(stop);

        if (active_plots[gname].hasOwnProperty("interval") && (active_plots[gname].interval != null)) {
            clearInterval(active_plots[gname].interval);
            delete active_plots[gname].interval;
        }
        var graph_opt = jqccs.graphOpt2highchart(av_graphs[gname]);
        var tr = graph_opt.trace;
        var chart = active_plots[gname]['graph'];
        var dirlist = [];
        var seriesLength = chart.series.length;
        for (var i = seriesLength - 1; i > -1; i--) {
            chart.series[i].setData([]);
        }
        var projections = {};
        var query_opt = {
            tags: qtag,
            maxpoints: graph_opt.width,
            page: Number(page)
        };
        query_opt['reduction'] = autoreduction;
        query_opt['count'] = 0;
        graph_opt.culist.forEach(function (item) {
            projections[item] = {
                0: ["dpck_ats"],
                1: ["dpck_ats"],
                4: ["dpck_ats"]
            }
        });
        graph_opt.culist.forEach(function (item) {
            for (k in tr) {
                if (tr[k].x.cu === item) {
                    dirlist[tr[k].x.dir] = dir2channel(tr[k].x.dir);
                    console.log("X Trace " + tr[k].name + " path:" + tr[k].x.origin);
                    projections[item][dir2channel(tr[k].x.dir)].push(tr[k].x.var);
                }
                if (tr[k].y.cu === item) {
                    dirlist[tr[k].y.dir] = dir2channel(tr[k].y.dir);
                    console.log("Y Trace " + tr[k].name + " path:" + tr[k].y.origin);
                    projections[item][dir2channel(tr[k].y.dir)].push(tr[k].y.var);

                }
            }
        });
        var correlation = false;
        if ((graph_opt.xAxis.type != "datetime") && (graph_opt.chart.type != "histogram")) {
            correlation = true;
        }
        var histdataset = {};
        var encgname=jchaos.encodeName(gname);
        $("#info-download-" + encgname).html("retrieving data..")

        if (correlation) {
            for (k in tr) {
                histdataset[tr[k].name] = { x: [], tx: [], y: [], ty: [] };
            }
            // download all data before.

            for (var v in graph_opt.culist) {
                var item = graph_opt.culist[v];
                for (var dir in dirlist) {

                    for (var start_chunk = start; start_chunk < stop; start_chunk += chunk) {
                        var stop_chunk = ((start_chunk + chunk) > stop) ? stop : (start_chunk + chunk);
                        query_opt['projection'] = projections[item][dirlist[dir]];
                        jchaos.getHistory(item, dirlist[dir], start_chunk, stop_chunk, "", function (data) {

                            for (k in tr) {
                                var trname = tr[k].name;

                                if (tr[k].x.cu === item) {
                                    var variable = tr[k].x.var;
                                    if (data.Y[0].hasOwnProperty(variable)) {
                                        var cnt = 0;
                                        console.log("X acquiring " + trname + " path:" + tr[k].x.origin + " items:" + data.Y.length);
                                        items += data.Y.length;
                                        if (data.end) {
                                            $("#info-download-" + encgname).html("<b>" + items + "</b>").css('color', 'black');
                                        } else {
                                            $("#info-download-" + encgname).html(items).css('color', 'green');
                                        }

                                        data.Y.forEach(function (ds) {
                                            if (tr[k].x.index != null && tr[k].x.index != "-1") {
                                                var tmp = Number(ds[variable]);
                                                histdataset[trname].x.push(tmp[tr[k].x.index]);
                                            } else {
                                                histdataset[trname].x.push(Number(ds[variable]));

                                            }
                                            histdataset[trname].tx.push(data.X[cnt++]);

                                        });

                                    }
                                }
                                if (tr[k].y.cu === item) {
                                    var variable = tr[k].y.var;
                                    if (data.Y[0].hasOwnProperty(variable)) {
                                        var cnt = 0;
                                        console.log("Y acquiring " + trname + " path:" + tr[k].y.origin + " items:" + data.Y.length);
                                        items += data.Y.length;
                                        if (data.Y.length < page) {
                                            $("#info-download-" + encgname).html("<b>" + items + "</b>").css('color', 'black');
                                        } else {
                                            $("#info-download-" + encgname).html(items).css('color', 'green');
                                        }

                                        data.Y.forEach(function (ds) {
                                            if (tr[k].y.index != null && tr[k].y.index != "-1") {
                                                var tmp = ds[variable];
                                                histdataset[trname].y.push(Number(tmp[tr[k].y.index]));
                                            } else {
                                                histdataset[trname].y.push(Number(ds[variable]));

                                            }
                                            histdataset[trname].ty.push(data.X[cnt++]);

                                        });
                                    }
                                }
                            }
                            query_opt['count'] = data.count;
                        }, query_opt);
                    }
                }
            };
            // ok plot
            var chartn = 0;
            for (k in tr) {
                var cnt = 0;
                var name = tr[k].name;

                var xpoints = histdataset[name].tx.length;
                var ypoints = histdataset[name].ty.length;
                for (cnt = 0; cnt < Math.min(xpoints, ypoints); cnt++) {
                    chart.series[chartn].addPoint([histdataset[name].x[cnt], histdataset[name].y[cnt]], false, false);
                }
                chartn++;
            }
        } else {
            // no correlation simple plot
            var targetDate = new Date();
            var time_off = (targetDate.getTimezoneOffset() * 60 * 1000);
            graph_opt.culist.forEach(function (item) {
                console.log("to retrive CU:" + item);

                for (var dir in dirlist) {
                    var dataset = [];
                    var start_chunk = start;

                    var stop_chunk = ((start_chunk + chunk) > stop) ? stop : (start_chunk + chunk);

                    query_opt['projection'] = projections[item][dirlist[dir]];

                    var download_handler = function (data) {
                        var dev = data['devs'];
                        var qstop = data['query']['end']
                        var cnt = 0,
                            ele_count = 0;
                        if (!data.hasOwnProperty("nitems")) { }
                        for (k in tr) {
                            if (tr[k].y.origin == "histogram") {
                                if (tr[k].x.cu === dev) {
                                    var variable = tr[k].x.var;

                                    data.Y.forEach(function (ds) {
                                        //dataset.push(ds[variable]);
                                        chart.series[cnt + 1].addPoint(ds[variable], false, false);

                                    });
                                }
                                cnt += 2;
                            } else {
                                if (tr[k].y.cu === dev) {
                                    //iterate on the datasets
                                    //   console.log("retrived \"" + dir + "/" + item + "\" count=" + data.Y.length);
                                    items += data.Y.length;
                                    var txt = "items:" + data.nitems + " runid:" + data.runid + " done:" + (stop * 100.0 / qstop);
                                    if (data.end && (qstop == stop)) {
                                        $("#info-download-" + encgname).html("<b>" + txt + "</b>").css('color', 'black');
                                    } else {
                                        $("#info-download-" + encgname).html(txt).css('color', 'green');
                                    }

                                    var variable = tr[k].y.var;
                                    var index = tr[k].y.index;
                                    ele_count = 0;
                                    data.Y.forEach(function (ds) {
                                        if (ds.hasOwnProperty(variable)) {
                                            var ts = data.X[ele_count++] - time_off;
                                            var tmp = ds[variable];

                                            if (index != null) {
                                                if (tmp.hasOwnProperty("$binary")) {
                                                    tmp = convertBinaryToArrays(tmp);
                                                }

                                                if (index == "-1") {
                                                    var incr = 1.0 / tmp.length;
                                                    var dataset = [];
                                                    for (var cntt = 0; cntt < tmp.length; cntt++) {
                                                        var t = ts + incr * cntt;
                                                        var v = Number(tmp[cntt]);
                                                        dataset.push([t, v]);
                                                        chart.series[cnt].addPoint([t, v], false, false);
                                                    }
                                                    // chart.series[cnt].setData(dataset, true, true, true);
                                                    chart.redraw();

                                                } else {
                                                    chart.series[cnt].addPoint([ts, Number(tmp[index])], false, false);
                                                }

                                            } else {
                                                chart.series[cnt].addPoint([ts, Number(tmp)], false, false);

                                            }
                                        }
                                    });
                                }
                                cnt++;
                            }

                        }
                        chart.redraw();
                        query_opt['count'] = data.count;
                        start_chunk += chunk;
                        if (start_chunk < stop) {
                            var stop_chunk = ((start_chunk + chunk) > stop) ? stop : (start_chunk + chunk);

                            jchaos.getHistory(dev, dirlist[dir], start_chunk, stop_chunk, "", download_handler, query_opt, function (err) {
                                alert(err);
                            });

                        }
                        // true until close if false the history loop retrive breaks
                        return true;
                    };
                    jchaos.getHistory(item, dirlist[dir], start_chunk, stop_chunk, "", download_handler, query_opt, function (err) {
                        alert(err);
                    });


                }
            });
        }

    }

    function initializeTimePicker(queryfn, id) {
        if (typeof query_params === "undefined") {
            query_params = {
                page: dashboard_settings.defaultPage,
                start: (new Date()).getTime() - 3600000,
                stop: (new Date()).getTime(),
                tag: "",
                chunk: dashboard_settings.defaultChunk,
                reduction: 1
            };
        }

        var start = moment(query_params.start);
        var end = moment(query_params.stop); //moment();
        if (id == null)
            id = "";

        function cb(start, end) {
            'M/DD hh:mm A'
            $('#reportrange-' + id).html(start.format('MMMM D, YYYY HH:mm') + ' - ' + end.format('MMMM D, YYYY HH:mm'));
        }

        $('#reportrange-' + id).daterangepicker({
            startDate: start,
            endDate: end,
            autoUpdateInput: true,
            timePicker: true,
            timePicker24Hour: true,
            linkedCalendars: false,
            timePickerSeconds: true,

            ranges: {
                'Today': [moment().startOf('day'), moment()],
                'Last 1h': [moment().subtract(1, 'hours'), moment()],
                'Last 6h': [moment().subtract(6, 'hours'), moment()],
                'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().startOf('day').subtract(1, 'days').endOf('day')],
                'Last 2 Days': [moment().startOf('day').subtract(2, 'days'), moment().startOf('day')],
                'Last 7 Days': [moment().startOf('day').subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().startOf('day').subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, cb);

        cb(start, end);
        if (typeof queryfn === "function") {
            $('#reportrange-' + id).off('apply.daterangepicker');
            $('#reportrange-' + id).on('apply.daterangepicker', function (ev, picker) {
                queryfn(ev, picker);

            });
        };

    }
    jqccs.createDialogFromFile=function(url,idname,title,opt){
        dopt=opt||{modal:false,draggable:true,
                            closeOnEscape: true,
                            title:title,
                            minWidth:$(window).width()/2,
                            minHeight:$(window).height()/2
                            

        };
        $('<div id=' + idname + ' class="chat-modal"></div>').dialog(dopt);
        $.get(url, function(data) {
            $("#"+idname).html( data );
        });
    }
    
    function createQueryDialog(querycb, opencb, gopt) {
        var dstart = new Date();
        dstart.setHours(0, 0, 0, 0);
        if (typeof query_params === "undefined") {
            query_params = {
                page: dashboard_settings.defaultPage,
                start: dstart.getTime(),
                stop: (new Date()).getTime(),
                tag: "",
                chunk: dashboard_settings.defaultChunk,
                reduction: 1
            };
        }

        /*var html = '<div class="modal fade draggable" id="dlg-query">';

        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3>Query History</h3>';
        html += '</div>';

        html += '<div class="modal-body">';
        */
        var html = "";
        html += '<div class="row">';

        html += '<div id="reportrange-query" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc;">';
        html += '<i class="fa fa-calendar"></i>&nbsp';
        html += '<span></span> <i class="fa fa-caret-down"></i>';
        html += '</div></div>';
        html += '<div class="row">';
        html += '<label class="label col-sm">Start </label>';
        html += '<input class="input-xlarge focused col-sm" id="query-start" title="Start of the query (epoch in ms)" type="text" value=' + query_params.start + '>';
        html += '</div>';
        html += '<div class="row">';
        html += '<label class="label col-sm">Stop </label>';
        html += '<input class="input-xlarge focused col-sm" id="query-stop" title="End of the query (empty means: now)" type="text" value=' + query_params.stop + '>';
        html += '</div>';
        if (gopt === undefined || (gopt.hasOwnProperty('tag') && gopt.tag)) {
            html += '<div class="row">';
            html += '<label class="label col-sm">Available Tag</label>';
            html += '<select class="col-sm" id="select-tag" title="Existing tags"></select>';
            html += '</div>';

            html += '<div class="row">';
            html += '<label class="label col-sm">Tag Name </label>';
            html += '<input class="input-xlarge focused col-sm" id="query-tag" title="Tag Name" type="text" value=' + query_params.tag + '>';
            html += '</div>';
        }

        if (gopt === undefined || (gopt.hasOwnProperty('page') && gopt.page)) {

            html += '<div class="row">';
            html += '<label class="label col-sm">Page </label>';
            html += '<input class="input-xlarge focused col-sm" id="query-page" title="page length" type="number" value=' + query_params.page + '>';
            html += '</div>';
            html += '<div class="row">';

            html += '<label class="label col-sm">Query chunk </label>';
            html += '<input class="input-xlarge focused col-sm" id="query-chunk" title="Cut the query in chunk of the given seconds" type="number" value=3600>';
            html += '</div>';
            html += '<div class="row">';

            html += '<label class="label col-sm">Data Factor reduction</label>';
            html += '<input class="input-xlarge focused col-sm" type="number" id="query-reduction" title="Reduction Factor" value=1>';
            html += '</div>';
        }
        html += '</div>';

        var opt = {
            modal: false,
            title: "Query Options",
            zIndex: 10000,
            autoOpen: true,
            width: 'auto',
            resizable: true
        }
        createCustomDialog(opt, html, "Run", function () {

            query_params['page'] = Number($("#query-page").val());
            query_params['start'] = Number($("#query-start").val());

            query_params['stop'] = Number($("#query-stop").val());

            query_params['tag'] = $("#query-tag").val();
            query_params['chunk'] = Number($("#query-chunk").val());
            query_params['reduction'] = Number($("#query-reduction").val());

            querycb(query_params)

        }, "Cancel", () => { if ((gopt!==undefined)&&(gopt.cancelHandler !== undefined)) { gopt.cancelHandler() } }, function () {
            //open handle
            initializeTimePicker(function (ev, picker) {
                //do something, like clearing an input
                // $('#daterange').val('');
                var start = new Date(picker.startDate.format('MMMM D, YYYY HH:mm'));
                var end = new Date(picker.endDate.format('MMMM D, YYYY HH:mm'));
                if (typeof start.getTime() === "number") {
                    query_params['start'] = start.getTime();
                    $('#query-start').val(start.getTime());

                }

                if (typeof end.getTime() === "number") {
                    query_params['stop'] = end.getTime();
                    $('#query-stop').val(end.getTime());

                }


                console.log(picker.startDate.format('MMMM D, YYYY HH:mm'));
                console.log(picker.endDate.format('MMMM D, YYYY HH:mm'));
            }, "query");
            if (typeof opencb === "function") {
                opencb();
            }
        });
    }

    function createGraphDialog(gname, id, options) {
        var av_graphs = jchaos.variable("graphs", "get", null, null);
        var opt = av_graphs[gname];
        if (typeof active_plots === "undefined") {
            active_plots = {};
        }
        if (!(opt instanceof Object)) {
            alert("\"" + gname + "\" not a valid graph ");
            return;
        }
        if (typeof options === "undefined") {
            options = {
                modal: false,
                title: gname,
                zIndex: 10000,
                autoOpen: true,
                width: opt.width,
                height: opt.height,
                resizable: true
            }
        }
        if (options.hasOwnProperty("width")) {
            opt.width = options.width;

        }
        if (options.hasOwnProperty("height")) {
            opt.height = options.height;

        }
        var html = "";
        var idname = gname;
        var html_target = "<div></div>";
        //html += '<div id="graph-' + id + '" style="height: 380px; width: 580px;z-index: 1000;">';
        html += '<div class="row" style="height: 100%; width: 100%">';
        //html += '<div id="createGraphDialog-' + id + '" style="height: 100%; width: 100%">';
        if (typeof id === "string") {
            idname = id;
            html_target = "#" + id;
        }
        idname=jchaos.encodeName(idname);
      //  html += '<div id="reportrange-' + idname + '" class="col-md-8" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc;">';
      //  html += '<i class="fa fa-calendar"></i>&nbsp';
      //  html += '<span></span> <i class="fa fa-caret-down"></i>';
      //  html += '</div>';
        //html += '<div class="col-md-2">count:</div>'
       // html += '<div id="info-download-' + gname + '" class="col-md-2" />'

        html += '<div id="createGraphDialog-' + idname + '">';
       // html += '</div>';

        html += '</div>';
        if (typeof id === "string") {

            $(html_target).children().remove();
            $(html_target).append(html);
        }
        active_plots[gname] = {
            graphname: gname,
            graph: null,
            dialog: idname,
            start_time: 0
        };
        var chart ={};
        dlg_opt = {
            open: function () {
                initializeTimePicker(function (ev, picker) {
                    //do something, like clearing an input
                    // $('#daterange').val('');
                    var start = new Date(picker.startDate.format('MMMM D, YYYY HH:mm'));
                    var end = new Date(picker.endDate.format('MMMM D, YYYY HH:mm'));
                    if (typeof query_params === "undefined") {
                        query_params = {
                            page: dashboard_settings.defaultPage,
                            start: 0,
                            stop: (new Date()).getTime(),
                            tag: "",
                            chunk: dashboard_settings.defaultChunk
                        };
                    }
                    query_params['start'] = start;
                    query_params['stop'] = end;

                    console.log(picker.startDate.format('MMMM D, YYYY HH:mm'));
                    console.log(picker.endDate.format('MMMM D, YYYY HH:mm'));
                    runQueryToGraph(gname, query_params.start, query_params.stop, { tag: query_params.tag, page: query_params.page, chunck: query_params.chunk });

                }, idname);
                var highchart_opt=jqccs.graphOpt2highchart(opt);
                chart = new Highcharts.chart("createGraphDialog-" + idname, highchart_opt);
                var start_time = (new Date()).getTime();
                console.log("New Graph:" + gname + " has been created :" + JSON.stringify(opt));
                active_plots[gname]['graph']=chart;
              

            },
            buttons: [{
                text: "Live",
                click: function (e) {

                    console.log("Start  Live Graph:" + gname);
                    console.log("graph options:" + JSON.stringify(opt));

                    if (active_plots[gname].hasOwnProperty('interval')) {
                        clearInterval(active_plots[gname].interval);
                        delete active_plots[gname].interval;
                        $(e.target).html("Continue Live");
                        return;
                    }
                    $(e.target).html("Pause Live");
            //        var chart = active_plots[gname]['highchart_opt'];
                    var seriesLength = chart.series.length;

                    for (var i = seriesLength - 1; i > -1; i--) {
                        chart.series[i].setData([]);
                    }
                    var timebuffer = Number(opt['timebuffer']) * 1000;
                    active_plots[gname].start_time = (new Date()).getTime();
                    var refresh = setInterval(function () {
                        
                        var data = jchaos.getChannel(opt.culist, -1, null);
                        var set = [];
                        var x, y;
                        var cnt = 0;
                        var tr = opt.trace;
                        var enable_shift = false;
                        var targetDate = new Date();

                        for (k in tr) {
                            if ((tr[k].x == null)) {
                                x = null;
                            } else if ((tr[k].x.origin == "timestamp")) {

                                x = targetDate.getTime() - (targetDate.getTimezoneOffset() * 60 * 1000); // current time
                                if (opt.shift && ((targetDate.getTime() - active_plots[gname].start_time) > timebuffer)) {
                                    enable_shift = true;
                                }
                            } else if (tr[k].x.const != null) {
                                x = tr[k].x.const;
                            } else if (tr[k].x.var != null) {
                                x = getValueFromCUList(data, tr[k].x);

                            } else {
                                x = null;
                            }
                            if ((tr[k].y == null)) {
                                y = null;
                            } else if ((tr[k].y.origin == "timestamp")) {
                                y = targetDate.getTime() - (targetDate.getTimezoneOffset() * 60 * 1000);
                            } else if (tr[k].y.const != null) {
                                y = tr[k].y.const;
                            } else if (tr[k].y.var != null) {
                                y = getValueFromCUList(data, tr[k].y);

                            } else {
                                y = null;
                            }
                            if (opt['tracetype'] == "multi") {
                                if ((y instanceof Array)) {
                                    var inc;
                                    if (x == null) {
                                        x = 0;
                                        inc = 1;
                                    } else {
                                        inc = 1.0 / y.length;
                                    }

                                    var set = [];

                                    for (var cntt = 0; cntt < y.length; cntt++) {
                                        set.push([x + inc * cntt, y[cntt]]);
                                    }


                                    chart.series[cnt].setData(set, true, true, true);

                                } else if (x instanceof Array) {
                                    var inc;
                                    var set = [];
                                    if (y == null) {
                                        y = 0;
                                        inc = 1;
                                    } else {
                                        inc = 1.0 / x.length;
                                    }
                                    if (tr[k].y.origin == "histogram") {
                                        set.push(x[cntt]);

                                        chart.series[cnt + 1].setData(set, true, true, true);

                                    } else {
                                        for (var cntt = 0; cntt < y.length; cntt++) {
                                            set.push([x[cntt], y + (inc * cntt)]);
                                        }
                                        chart.series[cnt].setData(set, true, true, true);

                                    }

                                } else {
                                    if (tr[k].y.origin == "histogram") {
                                        if ($.isNumeric(x)) {
                                            chart.series[cnt + 1].addPoint(x, false, false);
                                        }

                                    } else {
                                        chart.series[cnt].addPoint([x, y], false, enable_shift);
                                    }
                                }
                                if (tr[k].y.origin == "histogram") {
                                    cnt += 2;

                                } else {
                                    cnt++;
                                }
                            } else {
                                // single
                                if ((y instanceof Array)) {
                                    var inc = 1.0 / y.length;
                                    var xx = x;

                                    y.forEach(function (item, index) {
                                        if (x == null) {
                                            set.push([index, item]);

                                        } else {
                                            set.push([xx, item]);
                                            xx = (xx + inc);
                                        }

                                    });

                                } else if (x instanceof Array) {
                                    var inc = 1.0 / y;
                                    var yy = y;

                                    x.forEach(function (item, index) {
                                        if (y == null) {
                                            set.push([item, index]);

                                        } else {
                                            set.push([item, yy]);

                                            yy = (yy + inc);
                                        }
                                    });

                                } else {
                                    if (tr[k].y.origin == "histogram") {
                                        if ($.isNumeric(x)) {
                                            set.push(x);
                                        }
                                    } else {
                                        set.push({ x, y });
                                    }
                                }
                            }
                            if (opt['tracetype'] == "single") {
                                chart.series[0].setData(set, true, true, true);
                            }
                        }

                        chart.redraw();
                    }, opt.update);
                    active_plots[gname]['interval'] = refresh;

                }
            },
            {
                text: "Query..",
                click: function () {

                    console.log("Start  History Graph:" + gname);

                    if (opt.yAxis.type == "datetime") {
                        alert("Y axis cannot be as datetime!")
                        return;
                    }
                    /* $('input[name="datetimes"]').daterangepicker({
                       timePicker: true,
                       timePicker24Hour:true,
                       linkedCalendars:false,
                       startDate: moment().startOf('hour'),
                       endDate: moment().startOf('hour').add(32, 'hour'),
                       locale: {
                         format: 'DD/M hh:mm A'
                       }
                     });*/
                    createQueryDialog(function (query) {
                        runQueryToGraph(gname, query.start, query.stop, { tag: query.tag, page: query.page, chunck: query.chunk, reduction: query.reduction });
                    });


                }
            }, {
                text: "Save",
                click: function () {
                    var graph_opt = high_graphs[gname];
                    var chart = active_plots[gname]['graph'];
                    var obj = {};
                    if (chart.series instanceof Array) {
                        chart.series.forEach(function (item) {
                            obj[item.name] = [];
                            item.data.forEach(function (dat) {
                                var x = dat.x;
                                var y = dat.y;
                                obj[item.name].push([x, y]);
                            });
                        });
                        var blob = new Blob([JSON.stringify(obj)], { type: "json;charset=utf-8" });
                        saveAs(blob, gname + ".json");
                    }
                }
            }, {
                text: "Load",
                click: function () {
                    var graph_opt = high_graphs[gname];
                    var chart = active_plots[gname]['graph'];
                    getFile("TRACE LOAD", "select the trace to load", function (data) {
                        //console.log("loaded:"+JSON.stringify(data));

                        for (var key in data) {
                            var newseries = {};

                            var xy = data[key];
                            newseries['name'] = key;
                            newseries['data'] = xy;
                            chart.addSeries(newseries);
                            /*xy.forEach(function(c){
                              chart.series[index].addPoint(c, false, false);
                            });*/

                        }

                    });
                }

            }, {
                text: "Close",
                click: function () {
                    console.log("Removing graph:" + gname);
                    if (active_plots.hasOwnProperty(gname)) {
                        if (active_plots[gname].hasOwnProperty('interval')) {
                            clearInterval(active_plots[gname].interval);
                        }
                        delete active_plots[gname]['graph'];
                        delete active_plots[gname];
                    }

                    $(this).dialog('close');
                }
            }
            ]



        }
        for (var i in options) {
            dlg_opt[i] = options[i];
        }
        console.log("dialog options:" + JSON.stringify(dlg_opt));
        if (typeof id !== "string") {
            createCustomDialog(dlg_opt, html);

        } else {
            $(html_target).dialog(dlg_opt);
        }
    }
    jqccs.graphOpt2highchart=function(graphopt){
        var hc=graphopt;

        hc["title"]={
                "text": graphopt.name
            };
        hc["chart"]={
                "type": graphopt.type,
                "zoomType": "xy"
            };
        
        hc["xAxis"]["title"]={
            "text":graphopt.xAxis.name
        }
                
        hc["yAxis"]["title"]={
            "text":graphopt.yAxis.name
        }
        
        if (!$.isNumeric( graphopt.xAxis.max)) {
            hc.xAxis.max = null;
        }
        if (!$.isNumeric( graphopt.xAxis.min)) {
            hc.xAxis.min = null;
        }
        if (!$.isNumeric( graphopt.yAxis.max)) {
            hc.yAxis.max = null;
        }
        if (!$.isNumeric( graphopt.yAxis.min)) {
            hc.yAxis.min = null;
        }
        
        var serie = [];
        var tracecuo = {};
        var tracecu = [];
        var trace_list=graphopt.traces;
        hc['trace']=[];
        for (var cnt = 0; cnt < trace_list.length; cnt++) {
            //      if (tracetype == "multi") {
            var col;
            var seriespec = {};
             
            seriespec['name'] = trace_list[cnt].name;
            seriespec['type'] = graphopt.type;

            if (trace_list[cnt].hasOwnProperty("color") && (trace_list[cnt].color != "")) {
                col = trace_list[cnt].color;
                seriespec['color'] = col;
            }
            if (graphopt.type == "histogram") {
                var histo_data = {};

                seriespec['xAxis'] = 1;
                seriespec['yAxis'] = 1;
                seriespec['baseSeries'] = "histo_data" + (cnt + 1);
                histo_data['name'] = trace_list[cnt].name;
                histo_data['type'] = "scatter";
                histo_data['visible'] = false;

                histo_data['id'] = "histo_data" + (cnt + 1);
                histo_data['marker'] = { "radius": 1.5 };
                serie.push(seriespec);
                serie.push(histo_data);

            } else {
                serie.push(seriespec);
            }
            var tr={
                "name":trace_list[cnt].name,
                "x":jchaos.decodeCUPath(trace_list[cnt].x),
                "y":jchaos.decodeCUPath(trace_list[cnt].y),
                "color": trace_list[cnt].color
            }
            if ((tr.x != null) && tr.x.hasOwnProperty("cu") && tr.x.cu != null) {
                tracecuo[tr.x.cu] = "1";
            }
            if ((tr.y != null) && tr.y.hasOwnProperty("cu") && tr.y.cu != null) {
                tracecuo[tr.y.cu] = "1";
            }
            hc['trace'].push(tr);
        }
        for (var key in tracecuo) {
            // unique cu
            tracecu.push(key);
        }
        hc['series']=serie;
        hc['culist']=tracecu;
        return hc;
    }
    function runGraph(gname) {
        if (gname == null || gname == "") {
            alert("No Graph selected");
            return;
        }
        console.log("Selected graph:" + gname);
        var av_graphs = jchaos.variable("graphs", "get", null, null);
        var opt = av_graphs[gname];
        if (!(opt instanceof Object)) {
            alert("\"" + gname + "\" not a valid graph ");
            return;
        }
        /// fix things before

        if (!$.isNumeric(opt.xAxis.max)) {
            opt.xAxis.max = null;
        }
        if (!$.isNumeric(opt.xAxis.min)) {
            opt.xAxis.min = null;
        }
        if (!$.isNumeric(opt.yAxis.max)) {
            opt.yAxis.max = null;
        }
        if (!$.isNumeric(opt.yAxis.min)) {
            opt.yAxis.min = null;
        }

        // check if exist
        if (active_plots[gname] != null && active_plots[gname].dialog != null) {
            $("#dialog-" + active_plots[gname].dialog).show();
            return;
        }
        var count = 0;
        for (k in active_plots) {
            if (active_plots.hasOwnProperty(k)) count++;
        }
        if (count < 10) {
            var options = {
                modal: false,
                draggable: true,
                closeOnEscape: false,
                title: opt.name + "-" + count,
                width: opt.width,
                hright: opt.height,
                height: opt.height,
                resizable: true,
                dialogClass: 'no-close'
            };
            createGraphDialog(gname, "dialog-" + count, options);


        } else {
            alert("Too many graph dialog opened");
        }
    }

    function saveGraph(handler, badhandler) {
        var graphtype = $("#graphtype option:selected").val();
        var tracetype = $("#trace-type option:selected").val();

        var graphname = $("#graph_save_name").val();
        if (graphname == "") {
            alert("must specify a valid graph name");
            return;
        }
        var xname = $("#xname").val();
        var xtype = $("#xtype option:selected").val();
        var xmax = $("#xmax").val();
        var xmin = $("#xmin").val();
        var ymax = $("#ymax").val();
        var ymin = $("#ymin").val();
        var width_ = $("#graph-width").val();
        var height_ = $("#graph-high").val();
        var gupdate = $("#graph-update").val();
        var keepseconds = Number($("#graph-keepseconds").val());
        if (!$.isNumeric(xmax)) {
            xmax = null;
        }
        if (!$.isNumeric(xmin)) {
            xmin = null;
        }
        if (!$.isNumeric(ymax)) {
            ymax = null;
        }

        if (!$.isNumeric(ymin)) {
            ymin = null;
        }

        var yname = $("#yname").val();
        var ytype = $("#ytype option:selected").val();
        var serie = [];
        var tracecuo = {};
        var tracecu = [];
        var shift_true = $("input[type=radio][name=graph-shift]:checked").val();
        /*if (tracetype == "single") {
    
    
          serie.push({ name: graphname });
        }*/
        for (var cnt = 0; cnt < trace_list.length; cnt++) {
            //      if (tracetype == "multi") {
            var col;
            var seriespec = {};
            seriespec['name'] = trace_list[cnt].name;
            seriespec['type'] = graphtype;

            if (trace_list[cnt].hasOwnProperty("color") && (trace_list[cnt].color != "")) {
                col = trace_list[cnt].color;
                seriespec['color'] = col;
            }
            if (graphtype == "histogram") {
                var histo_data = {};

                seriespec['xAxis'] = 1;
                seriespec['yAxis'] = 1;
                seriespec['baseSeries'] = "histo_data" + (cnt + 1);
                histo_data['name'] = trace_list[cnt].name;
                histo_data['type'] = "scatter";
                histo_data['visible'] = false;

                histo_data['id'] = "histo_data" + (cnt + 1);
                histo_data['marker'] = { "radius": 1.5 };
                serie.push(seriespec);
                serie.push(histo_data);

            } else {
                serie.push(seriespec);
            }

            // }
            if ((trace_list[cnt].x != null) && trace_list[cnt].x.hasOwnProperty("cu") && trace_list[cnt].x.cu != null) {
                tracecuo[trace_list[cnt].x.cu] = "1";
            }
            if ((trace_list[cnt].y != null) && trace_list[cnt].y.hasOwnProperty("cu") && trace_list[cnt].y.cu != null) {
                tracecuo[trace_list[cnt].y.cu] = "1";
            }
        }
        for (key in tracecuo) {
            // unique cu
            tracecu.push(key);
        }
        var tmp = {
            chart: {
                type: graphtype,
                zoomType: "xy"
            },
            title: {
                text: graphname
            },

            series: serie
        }
        if (graphtype == "histogram") {
            tmp['xAxis'] = [];
            tmp['yAxis'] = [];
            tmp['xAxis'].push({ 'title': xname, alignTicks: false });
            tmp['xAxis'].push({ 'title': 'Histogram', 'alignTicks': false, 'opposite': false });
            tmp['yAxis'].push({ 'title': 'Frequence', alignTicks: false });
            tmp['yAxis'].push({ 'title': yname, 'alignTicks': false, 'opposite': false });
        } else {
            tmp['xAxis'] = {
                type: xtype,
                max: xmax,
                min: xmin,
                gridLineWidth: 1,
                title: {
                    text: xname
                }
            };
            tmp['yAxis'] = {
                type: ytype,
                max: ymax,
                min: ymin,
                title: {
                    text: yname
                }
            };
        }
        tmp['tracetype'] = tracetype;
        tmp['shift'] = shift_true;
        tmp['timebuffer'] = keepseconds;
        /*if(tracetype=="single"){
      var labels=[];
      for (var cnt=0;cnt<trace_list.length;cnt++) {
        if(trace_list[cnt].x.const!=null){
          var l={
            point: {
            xAxis: 0,
            yAxis: 0,
            x: trace_list[cnt].x.const,
            y: 1
        },
      text: trace_list[cnt].name
    };
      labels.push(l);
  } 
    }
    
    tmp['annotations']=[{
     
      'labels':labels}];
  }*/
        if (xtype == "datetime") {
            tmp['rangeSelector'] = {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1min'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5min'
                }, {
                    count: 1,
                    type: 'hour',
                    text: '1hour'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 0
            }
        }

        high_graphs = jchaos.variable("highcharts", "get", null, null);
        var tempo = jchaos.getDateTime();
        high_graphs[graphname] = {
            name: graphname,
            width: width_,
            height: height_,
            update: gupdate,
            highchart_opt: tmp,
            trace: trace_list,
            culist: tracecu,
            time: tempo
        };
        console.log("saving Graph:" + JSON.stringify(high_graphs[graphname]));

        jchaos.variable("highcharts", "set", high_graphs, handler, badhandler);

    }




    function generateScriptAdminModal() {
        var html = '<div class="modal hide fade" id="mdl-script">';

        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3 id="list_snapshot">Script Admin</h3>';
        html += '</div>';

        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';

        html += '<table class="table table-striped" id="table_script">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Name</th>';
        html += '<th>Type</th>';
        html += '<th>Desc</th>';
        html += '<th>Last Modified</th>';

        html += '</tr>';
        html += '</thead>';
        html += '</table>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        html += '</div>';

        html += '<div class="modal-footer">';
        html += '<a href="#" class="btn" id="script-edit">Show/Edit</a>';
        html += '<a href="#" class="btn" id="script-run">Run</a>';
        html += '<a href="#" class="btn" id="script-delete">Delete</a>';
        html += '<a href="#" class="btn" id="script-load">Upload</a>';
        html += '<a href="#" class="btn" id="script-associate">Associate</a>';

        html += '<a href="#" class="btn" id="script-save">Download</a>';
        html += '<a href="#" class="btn" id="script-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function generateSnapshotTable(cuid) {
        var html = '<div class="modal hide fade" id="mdl-snap">';

        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3 id="list_snapshot">Snapshot Editor</h3>';
        html += '</div>';

        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';

        html += '<table class="table table-striped" id="table_snap_nodes">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Element</th>';
        html += '<th>Type</th>';
        html += '</tr>';
        html += '</thead>';
        html += '</table>';

        html += '<table class="table table-striped" id="table_snap">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Date</th>';
        html += '<th>Name</th>';
        html += '</tr>';
        html += '</thead>';
        html += '</table>';
        html += '</div>';
        html += '</div>';

        html += '<label class="label col-md-3" for="snap_save_name">Snapshot name</label>';
        html += '<input class="input-xlarge focused col-md-9" id="snap_save_name" type="text" value="name">';

        html += '</div>';
        html += '</div>';

        html += '<div class="modal-footer">';
        html += '<a href="#" class="btn" id="snap-show">Show</a>';
        html += '<a href="#" class="btn" id="snap-apply">Apply</a>';
        html += '<a href="#" class="btn" id="snap-delete">Delete</a>';
        html += '<a href="#" class="btn" id="snap-load">Upload</a>';

        html += '<a href="#" class="btn" id="snap-save">Save</a>';
        html += '<a href="#" class="btn" id="snap-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function generateDataSet() {
        // var cu=jchaos.getChannel(cuid, -1,null);
        // var desc=jchaos.getDesc(cuid,null);

        var html = '<div class="modal hide fade " id="mdl-dataset">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3>DATASET</h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div id="cu-dataset" class="json-dataset"></div>';
        html += '</div>';
        html += '<div class="modal-footer">';
        // html += '<a href="#" class="btn btn-primary savetofilecsv" filename="description" extension="csv">Export To CSV</a>';
        html += '<a href="#" class="btn btn-primary savetofile" filename="dataset" extension="json">Save To File</a>';
        html += '<a href="#" class="btn btn-primary" id="dataset-update">Pause</a>';
        html += '<a href="#" class="btn btn-primary" id="dataset-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function actionJsonEditor(tmpObj) {
        $("#save_jsonedit").on('click', function () {
            // editor validation
            var errors = json_editor.validate();

            if (errors.length) {
                alert("JSON NOT VALID");
                console.log(errors);
            } else {
                // It's valid!
                var json_editor_value = json_editor.getValue();
                editorFn(json_editor_value);
                $("#mdl-jsonedit").modal("hide");

            }
        });

        $("#close_jsonclose").on('click', function () {
            $("#mdl-jsonedit").modal("hide");
        });
    }

    function generateEditJson() {
        // var cu=jchaos.getChannel(cuid, -1,null);
        // var desc=jchaos.getDesc(cuid,null);

        var html = '<div class="modal hide fade draggable" id="mdl-jsonedit">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3>Editor</h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div id="json-edit" class="json-edit medium-12 columns"></div>';
        html += '</div>';
        html += '<div class="modal-footer">';
        html += '<a href="#" class="btn btn-primary" id="save_jsonedit">Save</a>';
        html += '<a href="#" class="btn btn-primary" id="close_jsonclose">Close</a>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    function generateDescription() {
        // var cu=jchaos.getChannel(cuid, -1,null);
        // var desc=jchaos.getDesc(cuid,null);

        var html = '<div class="modal hide fade " id="mdl-description">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3 id="desc_text"></h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div id="cu-description" class="json-dataset"></div>';
        html += '</div>';
        html += '<div class="modal-footer">';
        // html += '<a href="#" class="btn btn-primary savetofilecsv" filename="description" extension="csv">Export To CSV</a>';
        html += '<a href="#" class="btn btn-primary savetofile glyphicon glyphicon-save" filename="description" extension="json">Save To File</a>';
        html += '<a href="#" class="btn btn-primary" id="description-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function generateLog() {
        var html = '<div class="modal hide fade resizable" id="mdl-log">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">×</button>';
        html += '<h3 id="list_logs">List logs</h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';

        html += '<table class="table table-striped table-fixed" id="table_logs">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Date</th>';
        html += '<th>Node</th>';
        html += '<th>Description</th>';
        html += '<th>Origin</th>';

        html += '</tr>';
        html += '</thead>';
        html += '</table>';

        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '<div class="modal-footer">';
        html += '<div class="control-group">';

        html += '<div class="controls">';


        html += '<select id="logtype">';
        html += '<option value="all" selected="selected">All</option>';
        html += '<option value="Info">Informative</option>';
        html += '<option value="error">Error</option>';
        html += '<option value="warning">Warning</option>';
        html += '<option value="log">Log</option>';
        html += '<option value="command">Commands</option>';

        html += '</select>';

        html += '<input class="input-xlarge focused" id="log_search" type="text" value="Node search..">';

        html += '</div>';
        html += '</div>';

        html += '<a href="#" class="btn" id="log-search-go">Search</a>';
        html += '<a href="#" class="btn" id="log-next">Next</a>';
        html += '<a href="#" class="btn" id="log-close">Close</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function generateCmdModal(tmpObj, cmdselected, cu) {
        var node_selected = tmpObj.node_selected;
        var arguments = retriveCurrentCmdArguments(tmpObj, cmdselected);
        var input_type = "number";
        var html = "";
        if (arguments.length == 0) {
            html += '<h3>"Command \"' + cmdselected + '\" NO ARGUMENTS</h3>';

        } else {
            html += '<h3>Command \"' + cmdselected + '\"</h3>';
        }
        html += '</div>';

        html += '<div class="modal-body">';
        html += '<table class="table table-striped" id="commands_argument_table">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Argument Name</th>';
        html += '<th>Description</th>';
        html += '<th>Type</th>';
        html += '<th>Value</th>';
        html += '</tr>';
        arguments.forEach(function (item) {
            if (item['type'] == "string") {
                input_type = "text";
            }
            if (item["optional"]) {
                html += '<tr class="row_element" ><td>' + item["name"] + '</td><td>' + item["desc"] + '</td><td>' + item["type"] + '</td><td><input class="input focused" id="' + cmdselected + '_' + item["name"] + '" type="' + input_type + '"></td></tr>';
            } else {
                html += '<tr class="row_element" ><td><b>' + item["name"] + '</b></td><td>' + item["desc"] + '</td><td>' + item["type"] + '</td><td><input class="input focused" id="' + cmdselected + '_' + item["name"] + '" type="' + input_type + '"></td></tr>';
            }

        });
        html += '</thead>';
        html += '</table>';
        html += '</div>';

        html += '<div class="modal-footer">';
        html += '<select id="cmd-force">';
        html += '<option value="normal" selected="selected">Normal</option>';
        html += '<option value="force">Force</option>';
        html += '</select>';

        // html += '<a href="#" class="btn btn-primary" id="command-send">Send</a>';

        var instant = $('<div></div>').html(html).dialog({
            width: 640,
            height: 480,
            title: node_selected + " Setup " + cmdselected,
            open: function () { },
            buttons: [{
                text: "SEND",
                click: function (e) {
                    var cuselection;
                    var cmdselected = $("#cu_full_commands option:selected").val();
                    var arguments = retriveCurrentCmdArguments(tmpObj, cmdselected);
                    var force = $("#cmd-force option:selected").val();

                    arguments.forEach(function (item, index) {
                        var value = $("#" + cmdselected + "_" + item["name"]).val();
                        if ((value == null || value == "") && (item["optional"] == false)) {
                            alert("argument '" + item['name'] + "' is required in command:'" + cmdselected + "'");
                            return;
                        }
                        item['value'] = value;
                    });
                    var parm = buildCmdParams(arguments);
                    if (tmpObj.node_multi_selected.length > 0) {
                        cuselection = tmpObj.node_multi_selected;
                    } else {
                        cuselection = tmpObj.node_selected;
                    }
                    jchaos.sendCUFullCmd(cuselection, cmdselected, parm, ((force == "normal") ? 0 : 1), 0, function () {
                        instantMessage("Command", "Command:\"" + cmdselected + "\"  params:" + JSON.stringify(parm) + " sent", 2000, true);

                    }, function (d) {
                        instantMessage(cuselection, "ERROR OCCURRED:" + d, 3000, 350, 400, false)

                    });
                    $(this).dialog('destroy');

                }

            }, {
                text: "Close",
                click: function (e) {
                    $(this).dialog('destroy');

                }
            }]
        });

        //return html;
    }

    function generateAlarms(cuid) {
        var html = '<div class="modal hide fade" id="mdl-fatal-error">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">X</button>';
        html += '<h3>Error of <span id="name-FE-device"></span></h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<p><b>Health Status:</b><span id="status_message"></span></p>';
        html += '<p><b>Message:</b><span id="error_message"></span></p>';
        html += '<p><b>Domain:</b><span id="error_domain"></span></p>';
        html += '</div>';
        html += '</div>';
        html += '<div class="modal-footer">';
        html += '</div>';
        html += '</div>';

        html += '<div class="modal hide fade" id="mdl-device-alarm-cu">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal">X</button>';
        html += '<h3>TABLE ALARM of <span id="name-device-alarm"></span></h3>';
        html += '</div>';
        html += '<div class="modal-body">';
        html += '<div class="row">';
        html += '<div class="box col-md-12 red">';
        html += '<div class="box-content">';
        html += '<table class="table table-striped" id="table_device_alarm">';
        html += '<thead class="box-header red">';
        html += '<tr>';
        html += '<th>Description</th>';
        html += '<th>Value</th>';
        html += '</tr>';
        html += '</thead>';
        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="modal-footer">';
        html += '</div>';
        html += '</div>';


        return html;
    }

    function generateModalActions() {
        var html = "";
        for (var cnt = 0; cnt < 10; cnt++) {
            html += '<div id="dialog-' + cnt + '" class="cugraph hide" grafname="' + cnt + '" style="z-index: 1000;">';
            html += "</div>";

            /*
            html += '<div id="graph-' + cnt + '" style="height: 380px; width: 580px;z-index: 1000;">';
            html += '</div>';
      
            html +='<div id="reportrange-'+cnt+'" class="col-md-12" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">';
            html +='<i class="fa fa-calendar"></i>&nbsp';
            html +='<span></span> <i class="fa fa-caret-down"></i>';
            html +='</div>';
            html += '</div>';
            */
        }

        //  html += generateDataSet();
        // html += generateDescription();
        // html += generateSnapshotTable();
        html += generateAlarms();
        //   html += generateLog();
        html += generateGraphTable();
        //   html += generateGraphList();
        //  html += generateQueryTable();


        return html;
    }

    function generateMenuBox() {
        var html = '<div class="box black">';
        html += '<div class="box-header">';
        html += '<h2><i class="halflings-icon white list"></i><span class="break"></span>Menu</h2>';
        html += '<div class="box-icon">';
        html += '<a href="#" class="btn-minimize"><i class="halflings-icon white chevron-up"></i></a>';
        html += '</div>';
        html += '</div>';
        html += '<div class="box-content">';
        html += '<ul class="dashboard-list metro">';

        html += '<li class="black">';
        html += '<a href="./configuration.php" role="button" class="show_agent" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-key red"></i><span class="opt-menu hidden-md">Configuration</span>';
        html += '</a>';
        html += '</li>';

        html += '<li class="black">';
        html += '<a href="./index.php" role="button" class="show_agent" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-search green"></i><span class="opt-menu hidden-md">CU</span>';
        html += '</a>';
        html += '</li>';
        html += '<li class="black">';
        html += '<a href="./process.php" role="button" class="show_agent" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-search red"></i><span class="opt-menu hidden-md">Process</span>';
        html += '</a>';
        html += '</li>';
        /*
            html += '<li class="black">';
            html += '<a href="#">';
            html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Configuration</span>';
            html += '</a>'
    
            html += '<ul class="dashboard-list metro">';
            html += '<li class="black">';
            html += '<a href="./chaos_node.php" role="button" class="show_unitserver" data-toggle="modal">';
            html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Node</span>';
            html += '</a>';
            html += '</li>';
            html += '</ul>';
        */

        html += '<li class="black">';
        html += '<a href="./chaos_node.php" role="button" class="show_unitserver" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Management</span>';
        html += '</a>';
        html += '</li>';

        html += '<li class="black">';
        html += '<a href="./chaos_jshell.php" role="button" class="show_alog" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-file red"></i><span class="opt-menu hidden-md">ChaosShell</span>';
        html += '</a>';
        html += '</li>';

        html += '<li class="black">';
        html += '<a href="./CUgenerator/index.html" role="button" class="show_alog" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-file green"></i><span class="opt-menu hidden-md">CUGenerator</span>';
        html += '</a>';
        html += '</li>';

        html += '</ul>';
        html += '</div>';
        html += '</div>';


        return html;
    }



    function generateActionBox() {
        var html = '<div class="box black col-md-2">';
        html += '<div class="box-header">';
        html += '<h2><i class="halflings-icon white list"></i><span class="break"></span>Actions</h2>';
        html += '<div class="box-icon">';
        html += '<a href="#" class="btn-minimize"><i class="halflings-icon white chevron-up"></i></a>';
        html += '</div>';
        html += '</div>';
        html += '<div class="box-content">';
        html += '<ul class="dashboard-list metro">';
        /*    html += '<li class="green">';
           html += '<a href="#mdl-save" role="button" data-toggle="modal">';
           html += '<i class="glyphicon glyphicon-save green"></i><span class="opt-menu hidden-md">Save</span>';
           html += '</a>';
           html += '</li>';
           html += '<li class="blue">';
           html += '<a href="#" role="button" onclick="reLoad()">';
           html += '<i class="glyphicon glyphicon-repeat blue"></i><span class="opt-menu hidden-md">Reload</span>';
           html += '</a>';
           html += '</li>';
           html += '<li class="yellow">';
           html += '<a href="#">';
           html += '<i class="glyphicon glyphicon-print yellow"></i><span class="opt-menu hidden-md">Print</span>';
           html += '</a>';
           html += '</li>';
           
           */
        html += '<li class="red">';
        html += '<a href="#mdl-snap" role="button" class="show_snapshot" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-file red"></i><span class="opt-menu hidden-md">Snapshot</span>';
        html += '</a>';
        html += '</li>';

        /*
            html += '<li class="green">';
            html += '<a href="#mdl-dataset" role="button" class="show_dataset" data-toggle="modal">';
            html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Dataset</span>';
            html += '</a>';
            html += '</li>';
    
            html += '<li class="green">';
            html += '<a href="#mdl-description" role="button" class="show_description" data-toggle="modal">';
            html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Description</span>';
            html += '</a>';
            html += '</li>';
        */
        html += '<li class="green">';
        html += '<a href="#mdl-log" role="button" class="show_log" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Logging</span>';
        html += '</a>';
        html += '</li>';

        html += '<li class="red">';
        html += '<a href="#mdl-graph-list" role="button" class="show_graph" data-toggle="modal">';
        html += '<i class="glyphicon glyphicon-print green"></i><span class="opt-menu hidden-md">Graphs</span>';
        html += '</a>';
        html += '</li>';

        html += '</ul>';
        html += '</div>';
        html += '</div>';
        return html;
    }
    jqccs.json2html = function (json, options, pather) {
        return json2html(json, options, pather);
    }
    jqccs.jsonSetup = function (dom, clickHandler, editHandler) {

        $(dom).off('click');
        $(dom).off('keypress');

        $(dom).on("click", "a.json-toggle", function () {
            var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
            target.toggle();
            if (target.is(':visible')) {
                target.siblings('.json-placeholder').remove();
            } else {
                var count = target.children('li').length;
                var placeholder = count + (count > 1 ? ' items' : ' item');
                target.after('<a href class="json-placeholder">' + placeholder + '</a>');
            }
            return false;
        });

        $(dom).on("click", "span.json-key", function (e) {
            var id = $(e.currentTarget).attr("portname");
            var enc = jchaos.encodeName(id);
            $("#attr-" + enc).toggle();
            if (typeof clickHandler === "function") {
                clickHandler(e);
            }
            return false;
        });

        //$("input.json-keyinput").keypress(function (e) {
        $(dom).on("keypress", "input.json-keyinput", function (e) {
            if (typeof editHandler === "function") {
                if (editHandler(e)) {
                    $("#" + this.id).toggle();

                }

            } else {
                $("#" + this.id).toggle();

            }

            return this;
        });
        /* Simulate click on toggle button when placeholder is clicked */
        //$("a.json-placeholder").click(function () {
        $(dom).on("click", "a.json-placeholder", function () {
            $(dom).siblings('a.json-toggle').click();
            return false;
        });
        /* Trigger click to collapse all nodes */

        /*if (options.collapsed == true) {
          $(this).find('a.json-toggle').click();
        }*/

    }
    /**
     * Transform a json object into html representation
     * @return string
     */
    function json2html(json, options, pather) {
        var html = '';
        if (typeof options === "undefined") {
            options = {
                collapsed: true,
                withQuotes: true,
                format: 10
            }
        }
        if (typeof pather === "undefined") {
            pather = "";
        }
        //console.log("pather:"+pather);
        if (typeof json === 'string') {
            /* Escape tags */
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (isUrl(json))
                html += '<a href="' + json + '" class="json-string">' + json + '</a>';
            else
                html += '<span class="json-string">"' + json + '"</span>';
        } else if (typeof json === 'number') {
            if (options.hasOwnProperty("format")) {
                if (options.format != 10) {
                    //convert to unsigned 
                    json = json >>> 0;
                }
                var fmtstring = json.toString(options.format & 0xFF);

                html += '<span class="json-literal" cuport="' + json + '">' + fmtstring + '</span>';
            } else {
                html += '<span class="json-literal" cuport="' + json + '">' + json + '</span>';
            }
        } else if (typeof json === 'boolean') {
            html += '<span class="json-literal" cuport="' + json + '">' + json + '</span> ';
        } else if (json === null) {
            html += '<span class="json-literal">null</span>';
        } else if (json instanceof Array) {
            if (json.length > 0) {
                html += '[<ol class="json-array">';
                for (var i = 0; i < json.length; ++i) {
                    html += '<li>';
                    /* Add toggle button if item is collapsable */
                    if (jchaos.isCollapsable(json[i])) {
                        html += '<a  class="json-toggle"></a>';
                    }
                    html += json2html(json[i], options, pather + "/" + key);
                    /* Add comma if item is not last */
                    if (i < json.length - 1) {
                        html += ',';
                    }
                    html += '</li>';
                }
                html += '</ol>]';
            } else {
                html += '[]';
            }
        } else if (typeof json === 'object') {
            var key_count = Object.keys(json).length;
            if (key_count > 0) {
                html += '{<ul class="json-dict">';
                for (var key in json) {
                    var id = pather + "/" + key;
                    var enc = jchaos.encodeName(id);
                    if (json.hasOwnProperty(key)) {
                        html += '<li>';
                        var keyclass = "";
                        var portarray = 0;
                        if (jchaos.isCollapsable(json[key])) {
                            if (json[key] instanceof Array) {
                                keyclass = "json-key";
                                portarray = json[key].length;
                            } else {
                                keyclass = "json-string";
                            }
                        } else {
                            keyclass = "json-key";
                        }

                        var keyRepr = options.withQuotes ?
                            '<span class="' + keyclass + '" portname="' + id + '" portarray="' + portarray + '">"' + key + '"</span>' : key;

                        /*  var keyRepr = options.withQuotes ?
                          '<span class="' + keyclass + '" id=' + enc+ ' portname="' + id + '" portarray="' + portarray + '">"' + key + '"</span>' : key;
                        */
                        /* Add toggle button if item is collapsable */
                        if (jchaos.isCollapsable(json[key])) {
                            html += '<a  class="json-toggle">' + keyRepr + '</a>';
                        } else {
                            html += keyRepr;

                        }
                        html += ': ' + json2html(json[key], options, pather + "/" + key);
                        if ((!jchaos.isCollapsable(json[key])) /*&& (pather == "input")*/) {
                            //  var id=pather +"/"+key ;
                            // var enc=jchaos.encodeName(id);
                            html += '<input class="json-keyinput" name="' + id + '" id="attr-' + enc + '"/>';

                        }
                        /* Add comma if item is not last */
                        if (--key_count > 0)
                            html += ',';
                        html += '</li>';
                    }
                }
                html += '</ul>}';
            } else {
                html += '{}';
            }
        }
        return html;
    }

    function setSched(name, value) {
        jchaos.setSched(name, value);
    }
    /**
     * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
     * @return boolean
     */


    /**
     * Check if a string represents a valid url
     * @return boolean
     */
    function isUrl(string) {
        var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(string);
    }


    jqccs.generateGenericControl = function (tmpObj) {
        return generateGenericControl(tmpObj);
    }

    function generateGenericControl(tmpObj) {
        var template = tmpObj.type;
        var html = "";
        // first row
        html += '<div class="row green">';

        html += '<h1 class="col-sm-12">Generic Control</h1>';
        html += '</div>';

        // second raw
        html += '<div class="row box-content">';


        html += "<div class='col-sm'>";
        html += "<div class='row' >";

        html += "<div class='col-sm'>";
        html += '<p class="row lead">Scheduling(us)</p>';

        html += "<div class='row'>";
        html += "<p class='col-sm' id='actual_scheduling'></p>";
        html += "<input type='text' class='setSchedule col-sm'>";

        html += "</div></div>";

        html += '<div class="col-sm offset-md-1">';
        html += '<p class="row lead">Live</p>';
        html += '<div class="row"><label for="live-enable">enable</label><input class="input-xlarge" id="live-true" title="Enable Live" name="live-enable" type="radio" value="true"></div>';
        html += '<div class="row"><label for="live-enable">disable</label><input class="input-xlarge" id="live-false" title="Disable Live" name="live-enable" type="radio" value="false"></div>';
        html += '</div>'

        html += '<div class="col-sm">'
        html += '<p class="row lead">Log</p>';

        html += '<div class="row"><label for="log-enable">enable</label><input class="input-xlarge" id="log-true" title="Enable Logging on Grafana " name="log-enable" type="radio" value="true"></div>';
        html += '<div class="row"><label for="log-enable">disable</label><input class="input-xlarge" id="log-false" title="Disable Logging on Grafana" name="log-enable" type="radio" value="false"></div>';
        html += '</div>'

        html += '<div class="col-sm">'
        html += '<p class="row lead">History</p>';

        html += '<div class="row"><label for="histo-enable">enable</label><input class="input-xlarge" id="histo-true" title="Enable History" name="histo-enable" type="radio" value="true"></div>';
        html += '<div class="row"><label for="histo-enable">disable</label><input class="input-xlarge" id="histo-false" title="Disable History" name="histo-enable" type="radio" value="false"></div>';
        html += '</div>'

        html += '<div class="col-sm">'
        html += '<div class="row">';
        html += '<p class="lead row">Restore</p>';
        html += '<input id="restore-type" type="text" title="Restore Type/tagname">';
        html += '</div>'

        html += '<div class="row"><label for="restore-enable">on init</label><input class="input-xlarge" id="restore-true" title="Enable Restore on init" name="restore-enable" type="radio" value="true"></div>';
        html += '<div class="row"><label for="restore-enable">disable</label><input class="input-xlarge" id="restore-false" title="Disable Restore on init" name="restore-enable" type="radio" value="false"></div>';
        html += '</div>'

        html += '</div>'
        html += '</div>';

        //first col

        // html += "<div class='col-md-3'>";
        // html += "</div>";
        //second col/row
        html += "<div class='col-sm box offset-md-1'>";

        html += "<p class='row lead justify-content-center'>Commands</p>";
        html += "<div class='row' >";
        html += '<select id="cu_full_commands" class="col-sm" data-toggle="modal"></select>';
        html += "<a class='quick-button-small col-sm btn-cmd' id='cu_full_commands_send'  title='Send selected command'><i class='material-icons verde'>send</i></a>";
        html += "</div>";
        html += "<div class='row' >";
        html += "<a class='quick-button-small col-sm btn-cmd' id='cu_clear_current_cmd' title='Clear current command'><i class='material-icons verde'>clear</i></a>";
        html += "<a class='quick-button-small col-sm btn-cmd' id='cu_clear_queue' title='Clear ALL command queue'><i class='material-icons verde'>layers_clear</i></a>";
        html += "</div>";
        html += '<div class="row">';
        html += "<a class='quick-button-small col-sm btn-cmd cucmdbase' id='cmd-stop-start'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
        html += "<a class='quick-button-small col-sm btn-cmd cucmdbase' id='cmd-init-deinit'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

        html += "<a class='quick-button-small col-sm btn-cmd cucmdbase' id='cmd-recover-error'><i class='material-icons verde'>build</i><p class='name-cmd'>Recover Error</p></a>";
        html += "<a class='quick-button-small col-sm btn-cmd cucmdbase' id='cmd-load-unload'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";
        html += "<a class='quick-button-small col-sm btn-cmd cucmdbase' id='cmd-bypass-on-off'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>";
        html += "</div>";

        html += "</div>";





        html += "</div>";

        return html;
    }
    var updateLogInterval;

    function logNode(name) {
        $('<div></div>').appendTo('body')
            .html('<div><p id="culog"></p></div>')
            .dialog({
                modal: true,
                title: name,
                zIndex: 10000,
                autoOpen: true,
                width: 320,
                height: 240,
                resizable: true,
                draggable: true,
                buttons: [{
                    id: "confirm-no",
                    text: "Close",
                    click: function (e) {
                        $(this).dialog("close");
                    }
                }],
                close: function (event, ui) {
                    clearInterval(updateLogInterval);
                    $(this).remove();
                    jchaos.setOptions({ "timeout": 5000 });

                },
                open: function (event, ui) {
                    updateLogInterval = setInterval(function () {
                        jchaos.node(name, "getlog", "agent", function (data) {
                            $("#culog").append(JSON.stringify(data));
                        });
                    }, 1000);
                }
            });

    }

    function createCustomDialog(opt, html, butyes, yeshandle, cancelText, nohandle, open_handle, close_handle) {

        var dlg_opt = {};
        var id = "customdlg-" + (new Date()).getTime();
        if (opt.hasOwnProperty('_name_')) {
            id = opt['_name_'];
            delete opt['_name_'];
        }
        dlg_opt['buttons'] = [];
        dlg_opt['close'] = function (event, ui) {
            if (typeof close_handle === "function") {
                close_handle(event, ui);
            } else {
                $(this).remove();
            }
        }
        dlg_opt['open'] = function (event, ui) {
            if (typeof open_handle === "function") {
                open_handle(event, ui);
            }
        }
        if (opt.hasOwnProperty('buttons') && (opt.buttons instanceof Array)) {
            opt.buttons.forEach(function (elem) {
                dlg_opt['buttons'].push(elem);
            });
            delete opt.buttons;
        }
        if (butyes != null && butyes != "") {
            dlg_opt['buttons'].push({
                id: "confirm-yes",
                text: butyes,
                click: function (e) {
                    if (typeof yeshandle === "function") {
                        yeshandle();
                    }
                    $(this).dialog("close");
                }
            });
        }
        if (cancelText != null && cancelText != "") {
            dlg_opt['buttons'].push({
                id: "confirm-no",
                text: cancelText,
                click: function (e) {
                    if (typeof nohandle === "function") {
                        nohandle();
                    }
                    $(this).dialog("close");
                }
            });
        }
        for (var i in opt) {
            dlg_opt[i] = opt[i];
        }
        if (typeof html === "undefined") {
            html = '<div id=' + id + '></div>';
        }
        $('<div></div>').appendTo('body')
            .html(html)
            .dialog(dlg_opt);

    }
    jqccs.getEntryWindow=function(hmsg, msg, def_text, butyes, yeshandle, cancelText){
        return getEntryWindow(hmsg, msg, def_text, butyes, yeshandle, cancelText);
    }
    function getEntryWindow(hmsg, msg, def_text, butyes, yeshandle, cancelText) {
        var html = '<div width="100%"><h6>' + msg + '</h6><input type="text" id="getEntryWindow_name" value="' + def_text + '" width="100%"></div>';
        var opt = {
            modal: true,
            title: hmsg,
            zIndex: 10000,
            autoOpen: true,
            width: 'auto',
            resizable: true
        }
        createCustomDialog(opt, html, butyes, function () {
            if (typeof yeshandle === "function") {
                yeshandle($("#getEntryWindow_name").val());
            }
        }, cancelText);

    }

    function getNEntryWindow(hmsg, def_msg_v, def_text_v, butyes, yeshandle, cancelText) {
        var ret = true;
        var htmp = "";
        if (def_msg_v instanceof Array) {
            var cnt = 0;
            def_msg_v.forEach(function (item) {
                htmp += '<div><h6>' + item + '</h6><input type="text" id="getEntryWindow_name_' + cnt + '" value=' + def_text_v[cnt] + ' class="text ui-widget-content ui-corner-all"></div>';
                cnt++;
            });
        } else {
            return;
        }
        var opt = {
            modal: true,
            title: hmsg,
            zIndex: 10000,
            autoOpen: true,
            width: 'auto',
            resizable: true
        }
        createCustomDialog(opt, htmp, butyes, function () {
            if (typeof yeshandle === "function") {
                var answ = [];
                var cnt = 0;
                def_text_v.forEach(function (item) {
                    answ.push($("#getEntryWindow_name_" + cnt).val());
                    cnt++;
                });
                yeshandle(answ);
            }
        }, cancelText);

    }
    jqccs.confirm = function (hmsg, msg, butyes, yeshandle, butno, nohandle) {
        return confirm(hmsg, msg, butyes, yeshandle, butno, nohandle);
    }
    function confirm(hmsg, msg, butyes, yeshandle, butno, nohandle) {
        var ret = true;
        var html = '<div><h6>' + msg + '</h6></div>';
        createCustomDialog({
            modal: true,
            title: hmsg,
            zIndex: 10000,
            autoOpen: true,
            width: 'auto',
            resizable: false
        }, html, butyes, yeshandle, butno, nohandle);

    }

    function type2Alias(t) {
        switch (t) {
            case "nt_agent":
                return "Agent";
            case "nt_control_unit":
                return "Control Unit";
            case "nt_unit_server":
                return "Unit Server";
            default:
                return "";

        }
    }

    function processRunSubMenu(tmpObj) {
        var items = {};
        var app_templates = {};
        items["root-script"] = { name: "Root" };
        items['sep1'] = "---------";

        tmpObj['app-templates'] = {};
        app_templates = jchaos.variable("app_templates", "get", null, null);
        for (var item in app_templates) {
            items["app-template-" + item] = { name: "" + item };
        }
        tmpObj['app-templates'] = app_templates;
        return items;
    }

    function processAppTemplateSubMenu(tmpObj) {
        var items = {};
        var app_templates = {};
        items["new-process-template"] = { name: "New Template.." };
        items['sep2'] = "---------";

        tmpObj['app-templates'] = {};
        app_templates = jchaos.variable("app_templates", "get", null, null);
        for (var item in app_templates) {
            items["app-template-delete-" + item] = { name: "Delete " + item };
        }
        tmpObj['app-templates'] = app_templates;
        return items;
    }

    function cuCreateSubMenu() {
        var items = {};
        var subitem = {};
        items["new-nt_control_unit-fromfile"] = { name: "CU from file..." };

        var cu_templates = jchaos.variable("cu_templates", "get", null, null);
        var cnt = 0;
        for (var item in cu_templates) {
            var sub2item = {};

            for (var types in cu_templates[item]) {
                sub2item["new-nt_control_unit-" + item + "-" + types] = { name: types };
            }
            cnt++;
            subitem['fold' + cnt] = { name: item, "items": sub2item };

        }
        items['fold1'] = { name: "templates", "items": subitem };

        items["new-nt_control_unit-custom"] = { name: "Custom CU" };
        items["new-nt_control_unit-mcimport"] = { name: "MemCache import CU" };

        return items;
    }

    function updateNodeMenu(tmpObj, node_name) {
        var items = {};
        var interface = tmpObj.type;
        var node_selected = tmpObj.node_selected;
        // var cindex = tmpObj.node_name_to_index[node_name];
        var node = tmpObj.node_name_to_desc[node_name];
        var node_type = null;
        if (interface == "us") {
            node_type = "nt_unit_server"
            items['new-nt_unit_server'] = { name: "New  Unit Server..." };

            if ((us_copied != null) && us_copied.hasOwnProperty("ndk_uid")) {
                items['paste-nt_unit_server'] = { name: "Paste " + us_copied.ndk_uid };
            }
        } else {
            if (interface == "cu") {
                node_type = "nt_control_unit";
            }
            items['new-nt_unit_server'] = { name: "New  Unit Server..." };

            if ((us_copied != null) && us_copied.hasOwnProperty("ndk_uid")) {
                items['paste-nt_unit_server'] = { name: "Paste " + us_copied.ndk_uid };
            }
        }

        if ((typeof node === "undefined") || (node == null)) {
            if ((node_type == null)) {
                return items;
            }
        } else {
            node_type = node.desc.ndk_type;

        }

        items['edit-' + node_type] = { name: "Edit ..." };
        items['desc-' + node_type] = { name: "Desc" };
        items['delete-histo-data'] = { name: "Delete HISTO data" };
        var associated = "";
        if ((typeof node === "object") && node.hasOwnProperty('desc') && node.desc.hasOwnProperty('ndk_parent')) {
            associated = node.desc;
        } else {
            associated = jchaos.node(node_selected, "parent", "us", null, null);

        }
        if (associated != null && associated.hasOwnProperty("ndk_uid") && associated.ndk_uid != "" && (node_type == "nt_unit_server" || node_type == "nt_root")) {
            items['sep5'] = "---------";

            items['start-node'] = { name: "Start " + jchaos.nodeTypeToHuman(node_type) + "..." };
            items['stop-node'] = { name: "Stop " + jchaos.nodeTypeToHuman(node_type) + " ..." };
            items['restart-node'] = { name: "Restart " + jchaos.nodeTypeToHuman(node_type) + " ..." };
            items['kill-node'] = { name: "Kill " + jchaos.nodeTypeToHuman(node_type) + " (via agent) ..." };

            items['console-node'] = { name: "Console " + jchaos.nodeTypeToHuman(node_type) + " ..." };



            items['sep6'] = "---------";
        }
        if (node_type == "nt_unit_server") {
            items['del-' + node_type] = { name: "Del " + node_selected };
            items['copy-' + node_type] = { name: "Copy " + node_selected };
            items['save-' + node_type] = { name: "Save To Disk " + node_selected };

            var cutypes = cuCreateSubMenu();
            items['fold1'] = { name: "New  Control Unit", "items": cutypes };

            if ((cu_copied != null) && cu_copied.hasOwnProperty("ndk_uid")) {
                items['paste-nt_control_unit'] = { name: "Paste/Move \"" + cu_copied.ndk_uid };
            }


        } else if (node_type == "nt_root") {
            items['del-' + node_type] = { name: "Del " + node_selected };
            items['copy-' + node_type] = { name: "Copy " + node_selected };
            items['save-' + node_type] = { name: "Save To Disk " + node_selected };

        } else if (node_type == "nt_control_unit") {
            items['maketemplate-' + node_type] = { name: "Make Template " };

            items['del-' + node_type] = { name: "Del " + node_selected };
            items['copy-' + node_type] = { name: "Copy " + node_selected };
            items['save-' + node_type] = { name: "Save To Disk " + node_selected };

            //var stat = jchaos.getChannel(node_selected, -1, null);
            var cmditem = updateCUMenu(tmpObj, node_selected);
            items['sep2'] = "---------";
            for (var k in cmditem) {
                items[k] = cmditem[k];
            }
            items['sep3'] = "---------";
        } else if (node_type == "nt_agent") {
            if (us_copied != null && us_copied.ndk_uid != "") {
                items['agent-act'] = "---------";
                items['associate-node'] = { name: "Associate " + us_copied.ndk_uid + "..." };


                items['agent-act'] = "---------";
            }

        } else {
            items['delete-node'] = { name: "Delete Node " + node_selected };

        }
        if (node_selected != null && node_selected != "") {

            items['shutdown-' + node_type] = { name: "Shutdown " + node_selected };
        }
        return items;
    }

    function updateCUMenu(tmpObj, name) {
        var items = {};
        var cindex = tmpObj.node_name_to_index[name];
        var cu = tmpObj.data[cindex];
        if (cu != null && cu.hasOwnProperty('health') && cu.health.hasOwnProperty("nh_status")) { //if el health
            var status = cu.health.nh_status;
            if ((tmpObj.off_line[cu.health.ndk_uid] == 0)) {

                if (status == 'Start') {
                    items['stop'] = { name: "Stop", icon: "stop" };
                    items['sep1'] = "---------";
                    items['snapshot-cu'] = { name: "Take Snapshot", icon: "snapshot" };
                    items['tag-cu'] = { name: "Tag for...", icon: "tag" };
                    items['calibrate'] = { name: "Calibrate", icon: "tag" };
                } else if (status == 'Stop') {
                    items['start'] = { name: "Start", icon: "start" };
                    items['deinit'] = { name: "Deinit", icon: "deinit" };
                    items['sep1'] = "---------";
                } else if (status == 'Init') {
                    items['start'] = { name: "Start", icon: "start" };
                    items['deinit'] = { name: "Deinit", icon: "deinit" };
                    items['sep1'] = "---------";
                } else if (status == 'Deinit') {
                    items['unload'] = { name: "Unload", icon: "unload" };
                    items['init'] = { name: "Init", icon: "init" };
                    items['sep1'] = "---------";
                } else if (status == 'Recoverable Error') {
                    items['recover'] = { name: "Recover", icon: "recover" };
                    items['unload'] = { name: "Unload", icon: "unload" };
                    items['deinit'] = { name: "Deinit", icon: "deinit" };
                    items['stop'] = { name: "Stop", icon: "stop" };

                    items['sep1'] = "---------";
                } else if (status == 'Fatal Error') {
                    items['load'] = { name: "Load", icon: "load" };
                    items['deinit'] = { name: "Deinit", icon: "deinit" };
                    items['init'] = { name: "Init", icon: "init" };
                    items['unload'] = { name: "Unload", icon: "unload" };
                    items['sep1'] = "---------";
                } else if (status == "Unload") {
                    items['load'] = { name: "Load", icon: "load" };
                    items['sep1'] = "---------";
                } else if (status == "Load") {
                    items['unload'] = { name: "Unload", icon: "unload" };
                    items['init'] = { name: "Init", icon: "init" };
                    items['sep1'] = "---------";
                } else {
                    items['load'] = { name: "Load", icon: "load" };
                    items['init'] = { name: "Init", icon: "init" };
                    items['unload'] = { name: "Unload", icon: "unload" };
                    items['deinit'] = { name: "Deinit", icon: "deinit" };
                    items['sep1'] = "---------";

                }

            } else {
                items['load'] = { name: "Load", icon: "load" };
                items['init'] = { name: "Init", icon: "init" };
                items['unload'] = { name: "Unload", icon: "unload" };
                items['deinit'] = { name: "Deinit", icon: "deinit" };
            }
        } else if (name != null && name != "") {
            items['load'] = { name: "Load", icon: "load" };
            items['init'] = { name: "Init", icon: "init" };
            items['unload'] = { name: "Unload", icon: "unload" };
            items['deinit'] = { name: "Deinit", icon: "deinit" };
        }
        items['history-cu'] = { name: "Retrive zip History for...", icon: "histo" };
        items['history-cu-root'] = { name: "Retrive Root Tree History for...", icon: "histo" };

        items['sep2'] = "---------";
        //node_name_to_desc[node_multi_selected[0]]
        var desc = tmpObj.node_name_to_desc[name];
        // camera
        if (tmpObj.hasOwnProperty('crop') && (typeof tmpObj['crop'][name] === "object")) {
            var crop_obj = tmpObj['crop'][name];
            if (typeof crop_obj === "object") {
                crop_obj['cu'] = name;
                items['set-roi'] = { name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
            }
        }

        //
        if (desc != null && desc.hasOwnProperty("instance_description") && desc.instance_description.hasOwnProperty("control_unit_implementation")) {
            var tt = getInterfaceFromClass(desc.instance_description.control_unit_implementation);

            if (tt != null) {
                items['open-ctrl'] = { name: "Open control:" + tt };
            }
        }
        if (tmpObj.node_multi_selected.length == 1) {

            items['show-dataset'] = { name: "Show/Set/Plot Dataset" };
            items['save-default'] = { name: "Save Setpoint as Default" };
            items['save-readout-default'] = { name: "Save ReadOut as Default" };

            items['show-desc'] = { name: "Show Description" };
            items['show-tags'] = { name: "Show Tags info" };
            items['driver-prop'] = { name: "Edit Driver properties" };
            items['cu-prop'] = { name: "Edit Node properties" };

            items['show-picture'] = { name: "Show as Picture.." };
        }
        items['sep3'] = "---------";

        if (cu != null && cu.hasOwnProperty('system') && cu.system.hasOwnProperty("dsndk_storage_type")) {
            if (cu.system.dsndk_storage_type & 0x2) {
                items['live-cu-disable'] = { name: "Disable Live", icon: "live" };
            } else {
                items['live-cu-enable'] = { name: "Enable Live", icon: "live" };
            }
            if (cu.system.dsndk_storage_type & 0x1) {
                items['histo-cu-disable'] = { name: "Disable History", icon: "live" };
            } else {
                items['histo-cu-enable'] = { name: "Enable History", icon: "live" };
            }
        }
        items['sep4'] = "---------";
        items['execute-jscript'] = { name: "Execute JS script.." };
        items['load-jscript'] = { name: "Load JS script.." };

        return items;
    }

    function updateGenericControl(tmpObj, cu) {
        if (cu == null) {
            return;
        }
        if (cu.hasOwnProperty('health') && cu.health.hasOwnProperty("ndk_uid")) { //if el health
            var name = cu.health.ndk_uid;
            var status = cu.health.nh_status;
            var encoden = jchaos.encodeName(name);
            $("#cmd-stop-start").hide();
            $("#cmd-init-deinit").hide();
            $("#cmd-load-unload").hide();
            $("#cmd-recover-error").hide();
            $("#cmd-bypass-on-off").hide();

            /*$("#cmd-stop-start").children().remove();
            $("#cmd-init-deinit").children().remove();
            $("#cmd-load-unload").children().remove();
            $("#cmd-recover-error").children().remove();
            $("#cmd-bypass-on-off").children().remove();
            */
            if ((status != "Unload") && (status != "Fatal Error")) {
                switch (tmpObj.off_line[encoden]) {
                    case 1:
                        status = "Dead";
                        break;
                    case 2:
                        status = "Updating";
                        break;

                }
            }
            $("#h3-generic-cmd").html("Generic Controls:\"" + name + "\" status:" + status);

            if (status == 'Start') {
                $("#cmd-stop-start").html("<i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p>");
                $("#cmd-stop-start").attr("cucmdid", "stop");
                $("#cmd-stop-start").show();
            } else if (status == 'Stop') {
                $("#cmd-stop-start").html("<i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p>");
                $("#cmd-stop-start").attr("cucmdid", "start");
                $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p>");
                $("#cmd-init-deinit").attr("cucmdid", "deinit");
                $("#cmd-stop-start").show();
                $("#cmd-init-deinit").show();

            } else if (status == 'Init') {
                $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p>");
                $("#cmd-init-deinit").attr("cucmdid", "deinit");
                $("#cmd-stop-start").html("<i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p>");
                $("#cmd-stop-start").attr("cucmdid", "start");
                $("#cmd-stop-start").show();
                $("#cmd-init-deinit").show();
            } else if (status == 'Deinit') {
                $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p>");
                $("#cmd-init-deinit").attr("cucmdid", "init");
                $("#cmd-load-unload").html("<i class='material-icons red'>power</i><p class='name-cmd'>Unload</p>");
                $("#cmd-load-unload").attr("cucmdid", "unload");
                $("#cmd-init-deinit").show();
                $("#cmd-load-unload").show();
            } else if (status == 'Recoverable Error') {
                $("#cmd-recover-error").html("<i class='material-icons red'>build</i><p class='name-cmd'>Recover Error</p>");
                $("#cmd-recover-error").attr("cucmdid", "recover");
                $("#cmd-load-unload").attr("cucmdid", "unload");
                $("#cmd-load-unload").show();
                $("#cmd-recover-error").show();
            } else if (status == "Unload") {
                $("#cmd-load-unload").html("<i class='material-icons green'>power</i><p class='name-cmd'>Load</p>");
                $("#cmd-load-unload").attr("cucmdid", "load");
                $("#cmd-load-unload").show();

            } else if (status == "Load") {
                $("#cmd-load-unload").html("<i class='material-icons red'>power</i><p class='name-cmd'>Unload</p>");
                $("#cmd-load-unload").attr("cucmdid", "unload");
                $("#cmd-load-unload").show();
                $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p>");
                $("#cmd-init-deinit").attr("cucmdid", "init");
                $("#cmd-init-deinit").show();

            } else {
                $("#cmd-load-unload").attr("cucmdid", "load");
                $("#cmd-load-unload").show();
            }
        }
        if (cu.hasOwnProperty('system') /*&& (tmpObj.off_line[encoden] == 0)*/) { //if el system
            $("#actual_scheduling").html(cu.system.cudk_thr_sch_delay);

            if (cu.system.cudk_bypass_state == false) {
                $("#cmd-bypass-on-off").html("<i class='material-icons verde'>cached</i><p class='name-cmd'>Bypass</p>");
                $("#cmd-bypass-on-off").attr("cucmdid", "bypasson");


            } else {
                $("#cmd-bypass-on-off").html("<i class='material-icons verde'>usb</i><p class='name-cmd'>No Bypass</p>");
                $("#cmd-bypass-on-off").attr("cucmdid", "bypassoff");

            }
            if (cu.system.hasOwnProperty("dsndk_storage_type")) {
                if (cu.system.dsndk_storage_type & 0x2) {
                    $("input[name=live-enable][value='true']").prop("checked", true);
                } else {
                    $("input[name=live-enable][value='false']").prop("checked", true);
                }
                if (cu.system.dsndk_storage_type & 0x10) {
                    $("input[name=log-enable][value='true']").prop("checked", true);
                } else {
                    $("input[name=log-enable][value='false']").prop("checked", true);
                }
                if (cu.system.dsndk_storage_type & 0x1) {
                    $("input[name=histo-enable][value='true']").prop("checked", true);
                } else {
                    $("input[name=histo-enable][value='false']").prop("checked", true);

                }

            }
        }
        if (tmpObj.node_selected != tmpObj['oldselected']) {
            tmpObj['oldselected'] = tmpObj.node_selected;
            $("#cu_full_commands").empty();

            if ((tmpObj.node_name_to_desc[name] == null)||(!tmpObj.node_name_to_desc[name].hasOwnProperty("cudk_ds_desc"))) {
                tmpObj.node_name_to_desc[name] =jchaos.node(tmpObj.node_selected, "desc","all");
            }
            if (tmpObj.node_selected != null && (tmpObj.node_name_to_desc[name] != null) && tmpObj.node_name_to_desc[name].hasOwnProperty("cudk_ds_desc") && tmpObj.node_name_to_desc[name].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
                var desc = tmpObj.node_name_to_desc[name].cudk_ds_desc.cudk_ds_command_description;
                $("#cu_full_commands").add("<option>--Select--</option>");

                desc.forEach(function (item) {
                    $("#cu_full_commands").append("<option value='" + item.bc_alias + "'>" + item.bc_alias + " (\"" + item.bc_description + "\")</option>");
                });
            }
        }
    }

    function populateSnapList(tmpObj, snaplist) {
        if (snaplist.length > 0) {
            var dataset;
            snap_selected = "";
            snaplist.forEach(function (dataset, index) {
                var date = jchaos.getDateTime(dataset.ts);
                $('#table_snap').append('<tr class="row_element" id="' + dataset.name + '"><td>' + date + '</td><td>' + dataset.name + '</td></tr>');
            });
            $("#table_snap tbody tr").click(function (e) {
                $(".row_element").removeClass("bg-warning");
                $("#table_snap_nodes").find("tr:gt(0)").remove();

                $(this).addClass("bg-warning");
                snap_selected = $(this).attr("id");
                var dataset = jchaos.snapshot(snap_selected, "load", null, "", null);
                dataset.forEach(function (elem) {
                    var name;
                    if (elem.hasOwnProperty("input")) {
                        name = elem.input.ndk_uid;
                    } else if (elem.hasOwnProperty("output")) {
                        name = elem.output.ndk_uid;
                    } else if (elem.hasOwnProperty("name")) {
                        name = elem.name;
                    }
                    if (typeof name === "string") {
                        cu_name_to_saved[name] = elem;
                        var node_name_to_desc = tmpObj.node_name_to_desc;
                        if (node_name_to_desc[name] == null) {
                            var desc = jchaos.getDesc(name, null);
                            tmpObj.node_name_to_desc[name] = desc[0];
                        }

                        var type = findImplementationName(node_name_to_desc[name].instance_description.control_unit_implementation);
                        $('#table_snap_nodes').append('<tr class="row_element" id="' + name + '"><td>' + name + '</td><td>' + type + '</td></tr>');
                    }
                });
                $("#snap-apply").show();
                $("#snap-show").show();
                $("#snap-delete").show();

                $("#snap_save_name").val(snap_selected);

            });
        }
    }

    function updateLog(cu) {
        if ((typeof cu === "undefined") || (cu == null)) {
            cu = "";
        }
        $("#table_logs").find("tr:gt(0)").remove();
        //var logtype= $( "input[name=log]:radio" );
        var logtype = $("#logtype option:selected").val();
        $("#log_search").val(cu);

        jchaos.log(cu, "search", logtype, 0, 10000000000000, function (data) {
            if (data.hasOwnProperty("result_list")) {
                data.result_list.forEach(function (item) {
                    if ((item.mdsndk_nl_ld == logtype) || (logtype == "all")) {
                        var dat = jchaos.getDateTime(item.mdsndk_nl_lts);
                        var nam = item.mdsndk_nl_sid;
                        var msg = item.mdsndk_nl_e_em;
                        var type = item.mdsndk_nl_ld;
                        var origin = item.mdsndk_nl_e_ed;
                        if (type == "warning") {
                            $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td class="wrap">' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'yellow');;
                        } else if (type == "error") {
                            $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'red');;
                        } else if (type == "command") {
                            msg = item.mdsndk_nl_c_s_desc;
                            origin = item.mdsndk_nl_lsubj;

                            $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'green');;
                        } else {
                            msg = item.mdsndk_nl_l_m;
                            origin = item.mdsndk_nl_lsubj;

                            $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>');

                        }
                    }
                });
            }

        });
    }

    function updateGraph(graph_filt) {
        high_graphs = jchaos.variable("highcharts", "get", null, null);
        $("#table_graph").find("tr:gt(0)").remove();
        if (typeof graph_filt !== "string") {
            graph_filt = "";
        }
        for (g in high_graphs) {
            if (g.includes(graph_filt)) {
                $('#table_graph').append('<tr class="row_element" id="' + g + '"><td>' + g + '</td><td>' + high_graphs[g].time + '</td><td>' + high_graphs[g].highchart_opt.chart.type + '</td></tr>');
            }
        }

        $("#table_graph tbody tr").click(function (e) {
            $(".row_element").removeClass("bg-warning");
            $("#table_trace").find("tr:gt(0)").remove();

            $(this).addClass("bg-warning");
            graph_selected = $(this).attr("id");
            var html = 'Graph Selected:<a href=/chaos_graph.php?' + graph_selected + '={\"width\":' + high_graphs[graph_selected].width + ',\"height\":' + high_graphs[graph_selected].height + '} target="_blank"><strong>' + graph_selected + '</strong></a>';
            //$(list_graphs).html("Graph Selected \"" + graph_selected + "\"");
            $(list_graphs).html(html);
            //$("#graph-link").html();
            if (high_graphs[graph_selected].trace instanceof Array) {
                trace_list = high_graphs[graph_selected].trace;
            } else {
                trace_list = [];
            }
            var xp, yp;
            for (var cnt = 0; cnt < trace_list.length; cnt++) {
                xp = encodeCUPath(trace_list[cnt].x);
                yp = encodeCUPath(trace_list[cnt].y);
                var tname = jchaos.encodeName(trace_list[cnt].name);
                var tcolor = "";
                if (trace_list[cnt].hasOwnProperty("color")) {
                    tcolor = (trace_list[cnt].color == null) ? "" : trace_list[cnt].color;
                }

                $('#table_trace').append('<tr class="row_element" id=trace_"' + tname + '" tracename="' + trace_list[cnt].name + '"><td>' + trace_list[cnt].name + '</td><td>' + xp + '</td><td>' + yp + '</td><td>' + tcolor + '</td></tr>');

            }
            /*$("#table_trace tbody tr").click(function (e) {
              $(".row_element").removeClass("bg-warning");
              $(this).addClass("bg-warning");
              trace_selected = $(this).attr("id");
            });*/
        });

    }

    function addNewKeys(jsondst, jsonsrc) {
        for (var key in jsonsrc) {
            if (!jsondst.hasOwnProperty(key)) {
                jsondst[key] = jsonsrc[key];
            } else if ((jsondst[key] instanceof Object)) {
                if ((jsonsrc[key] instanceof Object)) {
                    jsondst[key] = addNewKeys(jsondst[key], jsonsrc[key]);
                } else {
                    jsondst[key] = jsonsrc[key];

                }
            }
        }
        return jsondst;
    }

    function updateSnapshotTable(tmpObj, refresh) {
        var cu = tmpObj.node_selected;
        var node_multi_selected = tmpObj.node_multi_selected;
        var node_selected = tmpObj.node_selected;

        $("#table_snap").find("tr:gt(0)").remove();
        $("#table_snap_nodes").find("tr:gt(0)").remove();
        $("#table_snap_nodes").show();

        //  $("#snap-show").hide();
        $('#table_snap').hide();
        if (refresh) {
            $("#snap-delete").show();
            $("#snap-apply").show();
            $('#table_snap').show();
            if ((node_multi_selected != null) && (node_multi_selected.length == 1)) {
                // list of snapshot of selected cu
                var cu = node_multi_selected[0];
                $("#list_snapshot").html("List snapshot of " + cu);

                jchaos.search(cu, "snapshotsof", false, function (snaplist) {
                    populateSnapList(tmpObj, snaplist);

                });
            } else {
                // list all snapshots
                jchaos.search("", "snapshots", false, function (snaplist) {
                    populateSnapList(tmpObj, snaplist);
                });
            }
            return;
        }
        $("#snap-delete").hide();
        $("#snap-apply").hide();

        $("#snap-save").show();

        var tosnapshot = [];
        if (node_multi_selected.length > 0) {
            tosnapshot = node_multi_selected;
        } else {
            if (node_selected) {
                tosnapshot.push(node_selected);
            }
        }
        if (tosnapshot.length > 0) {
            $("#list_snapshot").html("Snapshotting the following group:");

            tosnapshot.forEach(function (elem) {
                var type;
                if (tmpObj.node_name_to_desc[elem] == null) {
                    var desc = jchaos.getDesc(elem, null);
                    tmpObj.node_name_to_desc[elem] = desc[0];

                }
                var node_name_to_desc = tmpObj.node_name_to_desc;
                if (node_name_to_desc[elem] == null) {
                    type = "NA";
                } else {
                    type = findImplementationName(node_name_to_desc[elem].instance_description.control_unit_implementation);
                }
                $('#table_snap_nodes').append('<tr class="row_element" id="' + name + '"><td>' + name + '</td><td>' + type + '</td></tr>');

            });
        }
    }

    /**
     * jQuery plugin method
     * @param json: a javascript object
     * @param options: an optional options hash
     */
    $.fn.generateMenuBox = function () {
        $(this).html(generateMenuBox());
    }

    $.fn.generateQueryTable = function () {
        $(this).html(generateQueryTable());
    }
    $.fn.generateEditJson = function () {
        $(this).html(generateEditJson());
    }
    $.fn.editActions = function () {
        actionJsonEditor();
    }


    $.fn.getFile = function (msghead, msg, handler) {
        return getFile(msghead, msg, handler);
    }
    $.fn.getValueFromCUList = function (culist, path) {
        return getValueFromCUList(culist, path);
    }
    jqccs.runQueryToGraph = function (gname, start, stop, options) {
        return runQueryToGraph(gname, start, stop, options);
    }
    jqccs.instantMessage = function (msghead, msg, tim, sizex, sizey, ok) {
        return instantMessage(msghead, msg, tim, sizex, sizey, ok);

    }
    /**
     * Create a graph dialog
     * @param  {string} gname name of the graph
     * @param  {} id
     * @param  {} options
     */
    jqccs.createGraphDialog = function (gname, id, options) {
        return createGraphDialog(gname, id, options);
    }
    jqccs.generateScraperTable = function (tmpObj) {
        return generateScraperTable(tmpObj);
    }


    function initSettings() {
        var sett = localStorage['chaos_dashboard_settings'];
        if (!sett || sett == "null") {
            $.getJSON("dashboard-settings-def.json", function (json) {
                console.log("Default Settings: " + JSON.stringify(json));
                localStorage['chaos_dashboard_settings'] = JSON.stringify(json);
                dashboard_settings = json;
            });
            dashboard_settings['current_page'] = 0;
        } else {
            dashboard_settings = JSON.parse(sett);
            $.getJSON("dashboard-settings-def.json", function (json) {
                dashboard_settings = addNewKeys(dashboard_settings, json);
                localStorage['chaos_dashboard_settings'] = JSON.stringify(dashboard_settings);
            });
        }
        dashboard_settings['current_page'] = 0;


    }

    jqccs.initSettings = function () {
        initSettings();
    }
    $.fn.chaosDashboard = function (opt) {
        main_dom = this;
        options = opt || {};
        // clear all intervals

        /*  var interval_id = setInterval("", 9999); // Get a reference to the last
      // interval +1
      for (var i = 1; i < interval_id; i++)
        clearInterval(i);
  */
        hostWidth = $(window).width();
        hostHeight = $(window).height();
        console.log("Window size:" + hostWidth + "x" + hostHeight);

        $(window).resize(function () {
            hostWidth = $(window).width();
            hostHeight = $(window).height();
            console.log("resized " + hostWidth + "x" + hostHeight);
        });
        /* jQuery chaining */
        return this.each(function () {
            var notupdate_dataset = 1;
            var templateObj = {
                template: options.template,
                type: options.template,
                filter: "",
                refresh_rate: options.Interval,
                skip_fetch: 0,
                digits: 3,
                skip_fetch_inc: 1,
                check_interval: 10000,
                last_check: 0,
                lastUpdate: 0,
                updateRefresh: 0,
                updateErrors: 0,
                node_list_interval: null,
                node_selected: null,
                health_time_stamp_old: {},
                node_name_to_desc: [],
                node_name_to_index: [],
                off_line: {},
                index: 0,
                data: null,
                upd_chan: -1,
                buildInterfaceFn: function () { },
                /* build the skeleton*/
                setupInterfaceFn: function () { },
                /*create and setup table*/
                generateTableFn: function () { },
                /* update table */
                generateCmdFn: function () { },
                updateFn: function () { },
                checkLiveFn: function () { },
                menuItemFn: function () { },
                /* menu on the table */
                menuActionsFn: function () { },
                /*actions on the table */
                htmlFn: { // functions to generate different htmls for different keys
                    'input': {},
                    'output': {},
                    'custom': {}
                }
            };
            initSettings();

            $("#help-about").on("click", function () {
                jchaos.basicPost("MDS", "cmd=buildInfo", function (ver) {
                    //alert("version:"+JSON.stringify(ver));
                    showJson("VERSION", ver);
                }, function () {
                    alert("Cannot retrive version");
                });
            });

            $("#help-clients").on("click", function () {
                jchaos.basicPost("clients", "", function (ver) {
                    //alert("version:"+JSON.stringify(ver));
                    ver.forEach(function (ele, i) {
                        var tt = ele.lastConnection / 1000;
                        ver[i]['updated'] = jchaos.getDateTime(Number(tt));
                    });

                    showJson("CLIENTS", ver);
                }, function () {
                    alert("Cannot retrive Client List");
                });
            });
            $("#config-settings").on("click", function () {
                var templ = {
                    $ref: "dashboard-settings.json",
                    format: "tabs"
                }
                var def = JSON.parse(localStorage['chaos_dashboard_settings']);
                jsonEditWindow("Config", templ, def, function (d) {
                    dashboard_settings = d;
                    localStorage['chaos_dashboard_settings'] = JSON.stringify(d);
                    var e = jQuery.Event('keypress');
                    e.which = 13;
                    e.keyCode = 13;
                    jchaos.setOptions({ "timeout": dashboard_settings.defaultRestTimeout });
                    templateObj.check_interval = dashboard_settings.checkLive;
                    templateObj.refresh_rate = dashboard_settings.generalRefresh;

                    $("#search-chaos").trigger(e);
                }, null);

            });
            /* Transform to HTML */
            // var html = chaosCtrl2html(cu, options, '');
            templateObj.check_interval = dashboard_settings.checkLive;
            templateObj.refresh_rate = dashboard_settings.generalRefresh;
            jchaos.setOptions({ "timeout": dashboard_settings.defaultRestTimeout });

            if (options.template == "cu") {
                templateObj.buildInterfaceFn = buildCUInterface; /* build the skeleton*/
                templateObj.setupInterfaceFn = setupCU; /*create and setup table*/
                templateObj.updateInterfaceFn = updateInterfaceCU;
                templateObj.generateTableFn = generateGenericTable; /* update table */
                templateObj.generateCmdFn = generateGenericControl;
                templateObj.updateFn = updateGenericCU;
                templateObj.checkLiveFn = checkLiveCU;

                /*** */
                /* Insert HTML in target DOM element */

            } else if (options.template == "node") {
                templateObj.buildInterfaceFn = buildNodeInterface;
                templateObj.setupInterfaceFn = setupNode;
                templateObj.updateInterfaceFn = updateNodeInterface;
                templateObj.generateTableFn = generateNodeTable; /* update table */
                templateObj.upd_chan = -2; // custom channel update

                templateObj.updateFn = updateNode;
                templateObj.checkLiveFn = checkLiveCU;

            } else if (options.template == "process") {
                templateObj.upd_chan = -2; // custom channel update

                templateObj.buildInterfaceFn = buildProcessInterface;
                templateObj.setupInterfaceFn = setupProcess;
                templateObj.generateTableFn = generateProcessTable; /* update table */

                templateObj.updateInterfaceFn = updateProcessInterface;
                templateObj.updateFn = updateProcess;


            }
            /*else if (options.template == "ctrl") {
                   var html = "";
                   html += '<div class="specific-table-ctrl"></div>';
                   html += '<div class="specific-control-ctrl"></div>';
                   $(this).html(html);
                   buildCUPage(options.cu, implementation_map[options.interface], options.template);

                 } else if (options.template == "algo") {
                   var html = "";
                   html += buildAlgoBody();
                   html += '<div class="specific-table-algo"></div>';
                   html += '<div class="specific-control-algo"></div>';

                   $(this).html(html);
                   mainAlgo(options.template);
                 }
                 */
            $(this).html(templateObj.buildInterfaceFn(templateObj));
            templateObj.setupInterfaceFn(templateObj)
            var htmlt, htmlc;
            if (typeof templateObj.generateTableFn === "function") {
                htmlt = templateObj.generateTableFn(templateObj);
                $("#specific-table-" + templateObj.template).html(htmlt);

            }
            if (typeof templateObj.generateCmdFn === "function") {
                htmlc = templateObj.generateCmdFn(templateObj);
                $("#specific-control-" + templateObj.template).html(htmlc);
            }
            $("#menu-dashboard").html(generateMenuBox());
            $("#query-page").val(dashboard_settings.defaultPage);
            $("#query-chunk").val(dashboard_settings.defaultChunk);

            //   initializeTimePicker();

            //jsonSetup($(this));
            $(".btn-minimize").click(function (t) {
                $(this).children().toggleClass('chevron-down');
                $(this).parent().parent().parent().find("ul.dashboard-list").toggle();
            });
            $(".savetofile").on("click", function (e) {
                var t = $(e.target);
                if (save_obj instanceof Object) {
                    if (save_obj.fext == "json") {
                        var blob = new Blob([JSON.stringify(save_obj.obj)], { type: "json;charset=utf-8" });
                        saveAs(blob, save_obj.fname + "." + save_obj.fext);
                    }
                }
            });
            $(".savetofilecsv").on("click", function (e) {
                var t = $(e.target);
                if (save_obj instanceof Object) {
                    if (save_obj.fext == "json") {
                        var str = convertToCSV(save_obj.obj);
                        var blob = new Blob([str], { type: "text;charset=utf-8" });
                        saveAs(blob, save_obj.fname + ".csv");
                    }
                }
            });
        });
    }


    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {


        module.exports = $(this);

    } else {
        window.jqccs = jqccs;
        console.log("jqccs loaded");

    }
})(jQuery);