<div class="navbar">
	<div class="navbar-inner w-100">
		<div class="container-fluid-full">
			<nav class="navbar navbar-expand-md navbar-dark bg-black">


				<div class="collapse navbar-collapse" id="navbarsExampleDefault">
					<ul class="navbar-nav mr-auto">
						<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01"
								data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Synoptic</a>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
							<a class="dropdown-item" href="javascript:handle_synoptic()" id="synoptic-management"><i
										class="halflings-icon cog"></i> Synoptics..</a>
								<a class="dropdown-item" id="load-file"><i class="halflings-icon home"></i>
								Load Synoptic from file</a>
								<a class="dropdown-item" id="app-setting"><i class="halflings-icon edit"></i>
									Setting</a>
								
							</div>
						
							
						</li>
					</ul>
				
				</div>
				
				<a class="navbar-brand col-sm-8" href="#">
					<div class="row">
						<h2 class="display2 col-sm align-items-left" id="app-name"></h2>
						<div class="col-sm">
							<?php echo file_get_contents("../version.html");?>
						</div>
						
					</div>
				</a>
				<div class="col-sm-1 align-items-right">

						<label class="checkbox-inline">
  <input type="checkbox" id="push_enable" data-toggle="toggle"> push
</label>
<div class="row align-items-start">
  <div class="col-sm-1"> 
    <div id="server-connection-status" class="indicator-nok rounded-circle"></div>
  </div>
  <div id="client-connection-id" class="col-sm-1">
  </div>
</div>

			</nav>

		</div>
	</div>
</div>

</div>
<script>
	$("#push_enable").prop('disabled',true);

	function onConnectServer(){
		$("#server-connection-status").removeClass("indicator-nok");
		$("#server-connection-status").addClass("indicator-ok");
		$("#push_enable").prop('disabled',false);

	}
	function onDisconnectServer(){
		$("#server-connection-status").removeClass("indicator-ok");
		$("#server-connection-status").addClass("indicator-nok");
		$("#push_enable").prop('disabled',true);

	}
	$("#client-connection-id").html("<font size=\"1\">"+localStorage['chaos_browser_uuid_cookie'].substr(localStorage['chaos_browser_uuid_cookie'].length - 5) +"</font>");
	jchaos.options['io_onconnect'] = (s) => {
		onConnectServer();
    }
	jchaos.options['io_disconnect']=(sock)=> {
		onDisconnectServer();
	};
	jchaos.options['on_restTimeout']=(e)=> {
		var now = (new Date()).getTime();

		if(jchaos.hasOwnProperty('last_timeout')){
			if((now-jchaos.last_timeout)>2*jchaos.options.timeout){
				alert("Timeout on server:"+JSON.stringify(e));
			}

		}
		jchaos['last_timeout']=now;
		jqccs.busyWindow(false);

	};
	$( <?php echo '"#'.$curr_page.'"' ?> ).addClass("btn-success");
	function triggerRefreshEdit(){
		$("input[type=radio][name=search-alive]:checked").val(false);
		$("input[type=radio][name=search-alive]").trigger("change");

	}
	function addMenuSynoptic(pid, node) {
		var items = {};
		var tree = $('#hier-' + pid).jstree(true);
		var ID = $(node).attr('id');
		items['upload-script'] = {
			"separator_before": false,
			"separator_after": true,
			label: "Upload Synoptic",
			action: function () {

				jqccs.getFile("Synoptic Loading", "select the Synoptic to load", function (syn) {
					jchaos.variable("synoptics", "get", null, function (synoptic) {
                                    if (!(synoptic instanceof Object)) {
                                        synoptic = {};

                                    }
                                    synoptic[syn.name] = syn;
                                    jchaos.variable("synoptics", "set", synoptic, function (ok) {
                                        jqccs.instantMessage("Saved " + syn.name, "OK", 3000, true);

                                    });
                                }, (bad) => {
                                    jqccs.instantMessage("Cannot retrive " + syn.name, JSON.stringify(bad), 2000, false);

                                });
						
					
			});
		}
		};

		if (node.hasOwnProperty("data")) {
					items['run-control'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Run Synoptic",
						action: function () {
							var script = node.data;
							jchaos.loadScript(script.script_name, script.seq, function (data) {

								if (!data.hasOwnProperty('eudk_script_content')) {
									jqccs.instantMessage("Load Script", script.script_name + " has no content", 4000, false);
									return;
								}

								data['eudk_script_content'] = decodeURIComponent(escape(atob(data['eudk_script_content'])));
								jqccs.execConsole("Running " + script.script_name, () => {
									return data['eudk_script_content'];
								},
									() => { jqccs.instantMessage("Execution ", script.script_name + "OK", 4000, true); },
									() => { jqccs.instantMessage("Execution ", script.script_name + "FAILED", 4000, false); });
							});

						}
					};
				items['edit-script'] = {
					"separator_before": true,
					"separator_after": false,
					label: "Edit script",
					action: function () {
						var script = node.data;

						jchaos.loadScript(script.script_name, script.seq, function (data) {

							if (!data.hasOwnProperty('eudk_script_content')) {
								jqccs.instantMessage("Load Script", script.script_name + " has no content", 4000, false);
								return;
							}
							var templ = {
								$ref: "algo.json",
								format: "tabs"
							}
							if (!data.hasOwnProperty("script_group")) {
								data['script_group'] = node.data['group'];
							}
							data['eudk_script_content'] = decodeURIComponent(escape(atob(data['eudk_script_content'])));
							delete data['_id'];
							jqccs.jsonEditWindow("Loaded", templ, data, (obj)=>{
						jqccs.algoSave(obj,()=>{refresh_script(pid);});
						
				
			});

						
						});
						

					}
				};
				items['download-script'] = {
					"separator_before": false,
					"separator_after": false,
					label: "Download",
					action: function () {
						var script = node.data;
						console.log("download " + script.script_name);
						jchaos.loadScript(script.script_name, script.seq, function (data) {
							if (!data.hasOwnProperty('eudk_script_content')) {
								jqccs.instantMessage("Load Script", tmpObj.node_selected + " has no content", 4000, false);
								return;
							}

							var obj = atob(data['eudk_script_content']);
							var blob = new Blob([obj], { type: "json;charset=utf-8" });
							saveAs(blob, data['script_name']);
						});
					}
				};
				items['delete-script'] = {
					"separator_before": false,
					"separator_after": false,
					label: "Delete script",
					action: function () {
						var script = node.data;
						console.log("delete " + script.script_name);
						jqccs.confirm("Delete Script", "Your are deleting script: " + script.script_name, "Ok", function () {

							jchaos.rmScript(script, function (data) {
								jqccs.instantMessage("Remove Script", "removed:" + script.script_name, 2000, true);
								tree.delete_node(node);

							});
						}, "Cancel");
					}
				};
			}
		}
		return items;
	}

	function refresh_synoptic(pid){
			var jsree_data = [];
			var scripts = {};
			var node_created = {};
			jchaos.variable("synoptics", "get", null, function (synoptic) {
				
				for(var syn in synoptic){
					var parent="#";
					if(synoptic[syn].hasOwnProperty("group")){
						var node_group = {
									"id": jchaos.encodeName(synoptic[syn].group),
									"parent": "#",
									"text": synoptic[syn].group,
								};
						parent=jchaos.encodeName(synoptic[syn].group);
						if (!node_created.hasOwnProperty(node_group["id"])) {
								node_created[node_group["id"]] = true;
								jsree_data.push(node_group);

						}
					}
					var node_group = {
									"id": jchaos.encodeName(syn),
									"parent": parent,
									"text": syn,
									"data":synoptic[syn]
								};
					if (!node_created.hasOwnProperty(node_group["id"])) {
								node_created[node_group["id"]] = true;
								jsree_data.push(node_group);

						}
				}		
				
				//$("#desc-"+pid).html(jqccs.json2html(p));
				//jqccs.jsonSetup($("#desc-"+pid), function (e) {
				//});
				$("#hier-" + pid).jstree("destroy");

				$("#hier-" + pid).jstree({
					"plugins": ["dnd", "contextmenu"],
					"contextmenu": {
						'items': (node) => {
							return addMenuSynoptic(pid, node);

						}, "select_node": true, "show_at_node": false
					},

					'core': {
						'data': jsree_data, "multiple": true,
						"animation": 0,
						"check_callback": true,


					}
				});
				$("#hier-" + pid).on('select_node.jstree', function (e, data) {
					var i, j, r = [];
					var node_data = data.instance.get_node(data.selected[0]).data;
					$('#desc-' + pid).html(jqccs.json2html(node_data));
					jqccs.jsonSetup($('#desc-' + pid), function (e) {
					});
					$('#desc-' + pid).find('a.json-toggle').click();

				});
				$("body").removeClass("loading");

				//$('#hier_view').jstree('load_node',ds);
				//addListeners();    
			});
		}
	function handle_synoptic() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Script browser", refresh_synoptic);
	}




	

	

	
	jqccs.initSettings();
	$("#help-about").on("click", function () {
                jchaos.basicPost("MDS", "cmd=buildInfo", function (ver) {
                    //alert("version:"+JSON.stringify(ver));
                    jqccs.showJson("VERSION", ver);
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

                    jqccs.showJson("CLIENTS", ver);
                }, function () {
                    alert("Cannot retrive Client List");
                });
            });
	
</script>