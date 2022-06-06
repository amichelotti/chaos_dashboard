<html>
<?php
require_once('experiment_control_head.php');

$curr_page = "Experiment Control";

?>

<body>

    <?php
    require_once('experiment_control_header.php');
    
    echo '<script src="../js/jquery.terminal/js/jquery.terminal.min.js"></script>';
    echo '<script src="../js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
    echo '<link href="../js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';

    ?>
    
    <link href="../css/font-awesome.min.css" rel="stylesheet">

    <link href="../js/list-selection/simsCheckbox.css" rel="stylesheet">
    <script src="../js/list-selection/simsCheckbox.js"></script>

    <div class="container-fluid px-4">
        <div class="row">
            <div class="col-md-12">
                <div class="row">
                    <div class="statbox purple col-sm-3">
                        <h3>ZONE</h3>
                        <select id="zones" size="auto">
                        </select>
                    </div>
    
                    <div id="group_select" class="invisible statbox purple col-sm-2">
                        <h3>Group</h3>
                        <select id="classes">
                        </select>
                    </div>
    
                    <div id="experiment_select" class="statbox purple invisible col-sm-2">
                        <h3>Experiment</h3>
                        <select id="experiments">
                        </select>
                    </div>
    
    
                </div>
                <div id="control_view" class="box-content invisible">
    
                    <div class="box row">
                        <div class="col-md-3">
                            <div class="row box">
                                <label for="desc_view"><strong>Description:</strong></label>
                                <div id="desc_view" class=""></div>
                            </div>
                            <div class="row box">
                                <label for="desc_view"><strong>Virtual folder:</strong></label>
                                <div id="hier_view" class=""></div>
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div class="row">
                                <div class="col">
                                <div class="wait_modal"></div>
    
                                <label for="session"><strong>Session:</strong></label>
                                <input name="session" id="session_name"
                                    placeholder="Session name (default to Date)"/> 
                                </div>
                                <div class="col">
                                    <div class="custom-control custom-switch">
                                        <input type="checkbox" class="custom-control-input" id="enable_manual">
                                        <label class="custom-control-label" for="enable_manual">Manual Tag</label>
                                    </div>

                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                <label for="progressive"><strong>Progressive:</strong></label>
                                <input name="progressive" id="progressive_id" value=0>
                                </div>
                                <div class="col">
                                    <div class="row script_selection">
                                        <label for="script"><strong>Choose Script:</strong></label>
                                        <select name="script" id="script_select"></select>
                                    </div>
                                    
                                </div>
                            </div>
                            <div class="row">
                            <div class="col">
                                <label for="tag"><strong>Tag:</strong></label>
                                <div name="tag" id="tag_id"></div>
</div>
                            </div>
                            <div class="row">
                            <div class="col">

                                <div class="form-group box">
                                    <label for="tagnote"><strong>Tag Notes</strong></label>
                                    <textarea class="form-control" id="tagnote" rows="3"></textarea>
                                </div>
</div>
                            </div>
                            <div class="row script_control invisible">
    
    <div class="col">
        <button id="edit-params" type="button" class="btn btn-success">Change Param..</button>
    </div>
    <div class="col">
        <button id="run-script" type="button" class="btn btn-success">RUN </button>
    </div>
    <div class="col">
        <button id="cancel-script" type="button" class="btn btn-danger">STOP</button>
    </div>
</div>
                            <div class="row manual_control invisible">
                                <div class="col-sm-5 box">
                                    <div class="card list-group">
                                        <div id="elements_h" class="card-header">
                                            Elements
                                        </div>
                                        <ul id="elements" class="listview">
                                        </ul>
                                    </div>     
                                </div>
                                <div class="col-sm-2 align-self-center">
                                    <div class="row form-group">
                                        <label for="acquisitions"><strong>Tag cycles</strong></label>
                                        <input type="number" min="1" value="1" class="form-control" id="acquisitions">
                                    </div>
                                    <div class="row justify-content-cente">
                                        <div class="col">
                                            <button id="run-tag" type="button" class="btn btn-success" disabled>Tag</button>
                                        </div>
                                    </div>


                                    <div class="row justify-content-center">
                                        <button type="button" id="b-tag" class="btn btn-sm">
                                            <i class="fa fa-long-arrow-right fa-2x" aria-hidden="true"></i></span>
                                        </button>
    
                                    </div>
                                    <div class="row justify-content-center">
                                        <button type="button" id="b-untag" class="btn btn-sm">
                                            <i class="fa fa-long-arrow-left fa-2x" aria-hidden="true"></i></span>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-sm-5 box">
                                    <div class="card list-group">
                                        <div id="tagged_h" class="card-header">
                                            Being Tagged
                                        </div>
                                        <ul id="tagged" class="listview">
    
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            
                            
                        </div>
                        <div id="script_area" class="col-md-4">
                            <div id="script_view" class="row">
                            </div>
    
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer>
            <?php require_once('footer.php'); ?>
    
            <audio src="../audio/twoknocks.mp3" width="0" height="0" id="bau"></audio>
        </footer>




        <script>
            var experiment_sel = {}
            var current_experiment = {}
            var current_script = {}
            var current_script_name=""
            var selected_cu=[];
            var selected_tagged_cu=[];
            var current_tagged_cu=[];

            var current_args = {}
            var current_acquisitions=1;
            var progressive_id = 0;
            var tagname = "";
            var parent_tag="";
            if(dashboard_settings && dashboard_settings.hasOwnProperty('lastProgressive')){
                progressive_id=dashboard_settings['lastProgressive'];
                $("#progressive_id").val(progressive_id);
            }
            jqccs.busyWindow(false);

            function refresh_hier(search,start,end){
                var jsree_data = [];
                var node_created = {};

                jchaos.log(search, "search", "tag", start, end, function (data) {
					if (data.hasOwnProperty("result_list")) {
						data.result_list.forEach(function (item) {
							var name = item.mdsndk_nl_sid;
							var nodef = jchaos.encodeName(name) + "_" + item.mdsndk_nl_lts;

							var dat = jchaos.getDateTime(item.mdsndk_nl_lts);

							item.mdsndk_nl_lts = dat;
							var msg = item.mdsndk_nl_e_em;
							var type = item.mdsndk_nl_ld;
							if ((item.mdsndk_nl_l_ld !== undefined) && (item.mdsndk_nl_l_ld == "Error")) {
								type = "error";
							}
                            if(item.hasOwnProperty("info")){
                                try{
                                    var j =JSON.parse(item.info);
                                    item.info=j;
                                }catch(e){

                                }
                            }
							var origin = item.mdsndk_nl_e_ed;
							var node_group = {
								"id": jchaos.encodeName(type),
								"parent": "#",
								"text": type,
							};
							var icon = "";
							if (type == "error") {
								icon = "/img/log-error.png";
							} else {
								icon = "/img/log-file.png";

							}
							if (!node_created.hasOwnProperty(type)) {
								jsree_data.push(node_group);
								node_created[type] = node_group['parent'];
							}
							var dirs = name.split("/");
							var group = "";
							var compname = "";
							var parent = "";

							dirs.forEach((ele, index) => {
								var node_group;
								compname = ele;
								if (index == 0) {
									group = type + "/" + ele;
									parent = type;
								} else {
									parent = group;
									group = group + "/" + ele;

								}

								var egroup = jchaos.encodeName(group);
								node_group = {
									"id": egroup,
									"parent": jchaos.encodeName(parent),
									"text": ele
								};
                                node_group['data'] = { "parent": group }

								if (!node_created.hasOwnProperty(egroup)) {
									node_created[egroup] = node_group['parent'];
									jsree_data.push(node_group);
								}

							});
							var node = {
								"id": nodef,
								"parent": jchaos.encodeName(group),
								"text": dat,
								"icon": icon,
								"data": item
							};
							node['data']['parent'] = group;
							if (!node_created.hasOwnProperty(nodef)) {
								node_created[node['id']] = node['parent'];
								jsree_data.push(node);
								// push also in all
								var nn = JSON.parse(JSON.stringify(node));
								nn['id'] = "ALL_" + node['id'];
								nn['parent'] = "ALL";
								nn['text'] = compname + "_" + node['text'];
								nn[node['id']] = node['parent'];

								jsree_data.push(nn);
							}
						});
					}


					$("#hier_view").jstree("destroy");

					$("#hier_view").jstree({
						"plugins": ["dnd", "contextmenu"],
						"contextmenu": {
							'items': (node) => {
								return addMenuLogItems( node);

							}, "select_node": true, "show_at_node": false
						},

						'core': {
							'data': jsree_data, "multiple": true,
							"animation": 0,
							"check_callback": true,


						}
					});
					$("#hier_view").on('select_node.jstree', function (e, data) {
						var i, j, r = [];
						var node_data = data.instance.get_node(data.selected[0]).data;
						/*
                        $('#desc-' + pid).html(jqccs.json2html(node_data));
						jqccs.jsonSetup($('#desc-' + pid), function (e) {
						});
						$('#desc-' + pid).find('a.json-toggle').click();
                        */

					});
					$("body").removeClass("loading");
				});
            }
            function onfailure(code){
                jqccs.busyWindow(false);
                if(parent_tag!=""){
                    refresh_hier(parent_tag,0,new Date().getTime());
                }
                alert("Script "+ current_script.script_name+" failed error:"+code);

            }
            function onsuccess(code){
                jqccs.busyWindow(false);
                if(parent_tag!=""){
                    refresh_hier(parent_tag,0,new Date().getTime());
                }

                if(typeof progressive_id === "number"){
                    progressive_id++;
                    $("#progressive_id").val(progressive_id);
                    if(dashboard_settings.hasOwnProperty('lastProgressive')){
                        dashboard_settings['lastProgressive']=progressive_id;
                        localStorage['experiment_control_settings'] = JSON.stringify(dashboard_settings);

                    }

                }
                
                jqccs.instantMessage("OK ", current_script.script_name, 5000, true);

            }
            function updateTag() {
                var sn = $("#session_name").val();
                if (sn == "") {
                    let yourDate = new Date()
                    sn = yourDate.toISOString().split('T')[0]

                }
                tagname = current_experiment.zone + "/" + current_experiment.group + "/" + current_experiment.experiment + "/" + sn + "/" + progressive_id;
                $("#tag_id").html(tagname);
            }

            function resetSearch(zon, gro) {
                jchaos.variable("experiments", "get", (exp) => {
                    var zones = [];
                    var classes = [];
                    var experiments = [];
                    $("#group_select").addClass("invisible");
                    $("#experiment_select").addClass("invisible");
                    $("#control_view").addClass("invisible");

                    experiment_sel = {}
                    if(Object.keys(exp).length==0){
                        alert("not experiments found, please contact administrator");
                        return;
                    }
                    for (var k in exp) {
                        if (exp[k].hasOwnProperty("zone") && exp[k].hasOwnProperty("group")) {
                            if ((zon != null)) {
                                if (zon == exp[k].zone) {
                                    zones.push(exp[k].zone);
                                    if (gro == null) {
                                        classes.push(exp[k].group);
                                    } else if (gro == exp[k].group) {
                                        classes.push(exp[k].group);
                                        experiments.push(k);
                                        experiment_sel[k] = exp[k]
                                    }

                                }
                            } else {
                                zones.push(exp[k].zone);
                                //  classes.push(exp[k].group);
                                // experiments.push(k);

                            }

                        }
                    }
                    if (zones.length > 0) {
                        jqccs.element_sel('#zones', zones, 0, zon);
                    }
                    if (classes.length > 0) {
                        $("#group_select").removeClass("invisible");
                        jqccs.element_sel('#classes', classes, 0, gro);
                    }
                    if (experiments.length > 0) {
                        $("#experiment_select").removeClass("invisible");

                        jqccs.element_sel('#experiments', experiments, 0);
                    }
                },(bad)=>{
                    alert("cannot retrieve any experiment "+bad);
                });

            }
            resetSearch(null, null);

            $("#zones").change(function() {
                var selzone = $("#zones option:selected").val();

                if (selzone == "--Select--") {
                    selzone = null;
                }
                resetSearch(selzone, null, null);

            });
            $("#session_name").on("input", function() {
                updateTag();
            });
            $("#enable_manual").change(function(){
                if($(this).is(':checked')){
                    $(".manual_control").removeClass("invisible");
                    $("#control_view").removeClass("invisible");
                    $(".script_selection").addClass("invisible");


                } else {
                    $(".manual_control").addClass("invisible");
                    $(".script_selection").removeClass("invisible");

                }
            });
            $("#classes").change(function() {
                var selzone = $("#zones option:selected").val();
                var selclass = $("#classes option:selected").val();
                if (selclass == "--Select--") {
                    selclass = null;
                }
                resetSearch(selzone, selclass, null);

            });
            $("#progressive_id").change(function() {
                var id = $("#progressive_id").val();
                if (id == "") {
                    progressive_id = Math.trunc(new Date().getTime() / 1000);
                } else {
                    let n = parseInt(id);
                    if (n == "NaN") {
                        progressive_id = id;
                    } else {
                        progressive_id = n;
                    }
                }

                updateTag();

            });
            $("#acquisitions").change(function() {
                current_acquisitions=$("#acquisitions").val();
                if((current_acquisitions>0 )&&(current_tagged_cu.length)){
                    $("#run-tag").prop('disabled', false);
                } else {
                    $("#run-tag").prop('disabled', true);

                }
            });
            $("#run-tag").on("click",function(){
                var cmd="jchaos.tag(\""+tagname+"\","+ JSON.stringify(current_tagged_cu)+", 1,"+current_acquisitions+",\""+$("#tagnote").val()+"\")";
                console.log("executing "+cmd);
                $('#script_view').terminal().exec(cmd,false);

            });
            $("#b-tag").on("click",function(){
                selected_cu.forEach(ele=>{
                    jchaos.addVector(current_tagged_cu,ele);
                });
                selected_cu=[];
                jqccs.refreshCheckList("tagged",current_tagged_cu,(check)=>{
                        jchaos.addVector(selected_tagged_cu,check);
                    },(uncheck)=>{
                        selected_tagged_cu=jchaos.removeVector(selected_tagged_cu,uncheck);
                    })
                
                if((current_acquisitions>0 )&&(current_tagged_cu.length)){
                    $("#run-tag").prop('disabled', false);
                } else {
                    $("#run-tag").prop('disabled', true);

                } 
            });
            $("#b-untag").on("click",function(){
                selected_tagged_cu.forEach(ele=>{
                    current_tagged_cu=jchaos.removeVector(current_tagged_cu,ele);
                });
                jqccs.refreshCheckList("tagged",current_tagged_cu,(check)=>{
                        jchaos.addVector(selected_tagged_cu,check);
                    },(uncheck)=>{
                        selected_tagged_cu=jchaos.removeVector(selected_tagged_cu,uncheck);
                    })
                
                    if((current_acquisitions>0 )&&(current_tagged_cu.length)){
                        $("#run-tag").prop('disabled', false);
                    } else {
                        $("#run-tag").prop('disabled', true);
    
                    }
            });

            $("#edit-params").on("click",function(){
                jqccs.jsonEditWindow("Parameters", {}, current_args, (json)=>{
                    current_args=json;
                    for(var s in current_experiment.scripts){
                        if(current_experiment.scripts[s].name == current_script_name){
                            current_experiment.scripts[s].def_param=current_args;
                            $('#desc_view').html(jqccs.json2html(current_experiment));
                            jchaos.variable("experiments", "get", (exp) => {
                                exp[current_experiment.experiment]=current_experiment;
                                jchaos.variable("experiments","set",exp);
                            });

                        }
                    }
                    
                    return 0;
                }, null);
            });
            $("#run-script").on("click",function(){
                updateTag();
                jqccs.busyWindow(true);

                if(current_script.hasOwnProperty("script_name")){
                    jchaos.loadScript(current_script.script_name, current_script.seq, function(data) {
                                if (typeof data === "object" && data.hasOwnProperty('eudk_script_content')) {
                                    var obj = atob(data['eudk_script_content']);
                                    current_args['script']=current_script.script_name;
                                    current_args['note']=$("#tagnote").val();
                                    obj+="\nmain("+JSON.stringify(current_args)+",\""+tagname+"\");";
                                    $('#script_view').terminal().exec(obj,false);

                                } else {
                                    jqccs.instantMessage("Empty content ", current_script.script_name, 5000, false);

                                }
                            }, function(bad) {
                                jqccs.instantMessage("Error retriving ", current_script.script_name, 5000, false);

                            });

                        } else {
                            alert("No valid script loaded");
                        }
                });

            
            $("#script_select").change(function() {
                var script = $("#script_select option:selected").val();
                if (script != "--Select--") {
                    jchaos.search(script, "script", false, function(l) {
                        if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)&&(l.found_script_list.length>0)) {
                            $(".script_control").removeClass("invisible");
                            current_script=l['found_script_list'][0];
                            current_args={};
                            current_experiment.scripts.forEach(ele=>{
                                if(ele.name==script){
                                    current_args=ele.def_param;
                                    current_script_name=ele.name;
                            
                                }
                            });
                        } else {
                            alert("Script "+script + " NOT found, please add through Scripts");
                            $(".script_control").addClass("invisible");
                            current_script={}

                        }

                    });

                } else {
                    $(".script_control").addClass("invisible");

                }
                updateTag();

            })
            $("#experiments").change(function() {
                var experiments = $("#experiments option:selected").val();
                if (experiments == "--Select--") {
                    experiments = null;
                    $("#control_view").addClass("invisible");

                } else {
                    $("#control_view").removeClass("invisible");
                    current_experiment = experiment_sel[experiments];

                    $('#desc_view').html(jqccs.json2html(current_experiment));
                    if(current_experiment.hasOwnProperty("zone")){

                        jchaos.search(current_experiment.zone,"cu",true,(ele)=>{
                            jqccs.refreshCheckList("elements",ele,(checked)=>{
                                jchaos.addVector(selected_cu,checked);
                            },(unchecked)=>{
                                selected_cu=jchaos.removeVector(selected_cu,unchecked);
                            });
                        })
                    }
                    jqccs.jsonSetup($('#desc_view'), function(e) {});
                    $('#desc_view').find('a.json-toggle').click();
                    jqccs.element_sel('#script_select', current_experiment.scripts, 0);
                    updateTag()
                    parent_tag=current_experiment.zone+"/"+current_experiment.group+"/"+current_experiment.experiment;
                    refresh_hier(parent_tag,0,new Date().getTime());
                    var methods = Object.getOwnPropertyNames(jchaos).filter(function(property) {
                        return typeof jchaos[property] == 'function';
                    });
                    var methods_full = [];
                    methods.forEach(function(elem) {
                        methods_full.push("jchaos." + elem);
                    });
                    methods = Object.getOwnPropertyNames(jqccs).filter(function(property) {
                        return typeof jqccs[property] == 'function';
                    });
                    methods.forEach(function(elem) {
                        methods_full.push("jqccs." + elem);
                    });
                    $('#script_view').terminal(function(command) {
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
                                            onfailure(result);

                                        } else {
                                            this.echo(new String(result));
                                            
                                        }
                                    }
                                }

                                var result = window.eval(command);

                                if (result !== undefined) {
                                    
                                    this.echo(new String(result));
                                    if(typeof result === "object"){
                                        onsuccess(result);

                                    } else if(typeof result==="number"){
                                        if(result==0){
                                            onsuccess();
                                        } else {
                                            onfailure(result);
                                        }
                                    }
                                } else {
                                    onfailure("undefined");

                                }
                            } catch (e) {
                                this.error(new String(e));
                                onfailure(new String(e));

                            }
                        } else {
                            this.echo('');
                        }
                    }, {
                        greetings: 'JavaScript Chaos Interpreter',
                        name: 'JChaos',
                        height: 600,
                        prompt: 'chaos-js> ',
                        completion: methods_full
                     
                    },onsuccess,onfailure);
                    jchaos.setOptions({"console_log":$('#script_view').terminal().echo,"console_err":$('#script_view').terminal().error});

                }
            });

    function listDev(tree,node,arr,tags,st){

        if(node.data.hasOwnProperty('ndk_uid')){
            var start=st;
            if(node.data.hasOwnProperty("seq")){
                if(start>node.data.seq)
                    start = node.data.seq-1000;
            }
            jchaos.addVector(tags,node.data.parent.replace("tag/",""));

            var ia=[];
            if(typeof node.data.ndk_uid === "string"){
                ia = node.data.ndk_uid.split(",");
            } else if(node.data.ndk_uid instanceof Array){
                ia = node.data.ndk_uid;
            }
            for(var k in ia){
                jchaos.addVector(arr,ia[k]);
            }
            
            return start;
        } else if(node.hasOwnProperty("children")){
            
            for(var k in node.children){
                var node_data = tree.get_node(node.children[k]);

                st=listDev(tree,node_data,arr,tags,st);
            }

        }
        return st;

    }
    function addMenuLogItems(node) {
		var items = {};
		var tree = $('#hier_view').jstree(true);
		var ID = $(node).attr('id');
	
        items['refresh'] = {
                "separator_before": false,
                "separator_after": true,
                label: "Refresh",
				action: function () {
                    jqccs.busyWindow(false);
                        if(parent_tag!=""){
                            refresh_hier(parent_tag,0,new Date().getTime());
                        }
				    }
				
        };
		if (node.hasOwnProperty("data")) {
            items['info'] = {
                "separator_before": false,
                "separator_after": false,
                label: "Info",
				action: function () {
						var info=node.data;
                        jqccs.showJson(info.mdsndk_nl_lsubj,info);	
				    }
				};
            if(node.data.hasOwnProperty('parent')&&node.data.parent!=""){
                var parent_tag=node.data.parent.replace("tag/","");

                var tags=[]
                var start=0;
                var stop=new Date().getTime();
                if(node.data.hasOwnProperty("seq")){
                    start = (node.data.seq-1000);
                }

                var nlist=[];
                start=listDev(tree,node,nlist,tags,stop);
               /* if(node.data.hasOwnProperty("info")&&node.data.info.hasOwnProperty('ndk_uid')){
                    nlist=node.data.info.ndk_uid;

                } else if(node.children.length){
                    node.children.forEach(element => {
                        var node_data = tree.get_node(element).data;
                        if(node_data.hasOwnProperty("info")&&node_data.info.hasOwnProperty('ndk_uid')){
                            nlist=nlist.concat(node_data.info.ndk_uid);
                        }
                    });

                }*/
                if(nlist.length){
            items['download']={
                "separator_before": false,
                "separator_after": false,
                label: "Download",
                action: function(){
                    jchaos.setOptions({ "timeout": 60000 });
                    var opt={
                        'page':dashboard_settings.defaultPage,
                        'channels':[0,1]
                        
                    }
                   /* opt['updateCall'] = function(meta) {
                    $("#zipprogress").progressbar("option", { value: parseInt(meta.percent.toFixed(2)) });
                    console.log("percent:" + parseInt(meta.percent.toFixed(2)));

                };*/
                    jchaos.fetchHistoryToZip(parent_tag, nlist, start, stop, tags, opt, function(msg) {
                        $("#zipprogress").parent().remove();

                        jqccs.instantMessage("fetchHistoryToZip ", "failed:" + JSON.stringify(msg), 8000, false);
                    });

                }
            }
        }
        }
			
			}
		
		return items;
	}
        </script>


</body>

</html>