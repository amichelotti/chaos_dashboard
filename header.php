<div class="navbar">
	<div class="navbar-inner w-100">
		<div class="container-fluid-full">
			<nav class="navbar navbar-expand-md navbar-dark bg-black">


				<div class="collapse navbar-collapse" id="navbarsExampleDefault">
					<ul class="navbar-nav mr-auto">
						<li class="nav-item dropdown">
							<div class="nav-link dropdown-toggle" id="dropdown01" data-toggle="dropdown"
								aria-haspopup="true" aria-expanded="false">Chaos</div>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="./index.php"><i class="fa fa-gamepad"
										aria-hidden="true"></i> CU/EU</a>
								<a class="dropdown-item" href="./chaos_jshell.php"><i class="fa fa-terminal"
										aria-hidden="true"></i> Control Shell</a>
								<a class="dropdown-item" href="./process.php"><i class="fa fa-cogs"
										aria-hidden="true"></i> Process</a>
								<a class="dropdown-item" href="./chaos_node.php"><i class="fa fa-wrench"
										aria-hidden="true"></i> Node Management</a>
								<a class="dropdown-item" href="./configuration.php"><i class="fa fa-file-text"
										aria-hidden="true"></i> Chaos Configuration</a>

							</div>
						</li>
						<li class="nav-item dropdown">
							<div class="nav-link dropdown-toggle" id="dropdown01" data-toggle="dropdown"
								aria-haspopup="true" aria-expanded="false">App</div>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="./app/camera_view.php"><i class="fa fa-video-camera"
										aria-hidden="true"></i> Camera</a>
								<a class="dropdown-item" href="./app/synoptic_view.php"><i class="fa fa-map-marker"
										aria-hidden="true"></i> Synoptic</a>
								<a class="dropdown-item" href="./app/magnet_check.php"><i class="fa fa-magnet"></i>
									Hunter Dog</a>
									<a class="dropdown-item" href="./app/experiment_control.php"><i class="fa fa-flask"></i>
									Experiment Control</a>
							</div>
						</li>
						<li class="nav-item dropdown">
							<div class="nav-link dropdown-toggle" id="dropdown01" data-toggle="dropdown"
								aria-haspopup="true" aria-expanded="false">Tools</div>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="javascript:handle_script()" id="hscript-management"><i
										class="fa fa-cogs" aria-hidden="true"></i> Scripts</a>
								<a class="dropdown-item" href="javascript:handle_graph()" id="hgraph"><i
										class="fa fa-area-chart" aria-hidden="true"></i> Graph</a>
								<a class="dropdown-item" href="javascript:handle_snap()" id="hsnap-management"><i
										class="fa fa-tags" aria-hidden="true"></i> Snapshot</a>
								<a class="dropdown-item" href="javascript:handle_log()" id="hlog"><i class="fa fa-list"
										aria-hidden="true"></i> Log</a>
								<a class="dropdown-item" href="javascript:handle_chat()" id="hchat"><i
										class="fa fa-commenting-o" aria-hidden="true"></i> Message chat</a>

							</div>
						</li>
						<li class="nav-item dropdown">
							<div class="nav-link dropdown-toggle" id="dropdown01" data-toggle="dropdown"
								aria-haspopup="true" aria-expanded="false">Settings</div>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="login.html"><i class="fa fa-sign-in"
										aria-hidden="true"></i> Login</a>
								<a class="dropdown-item" id="config-settings"><i class="fa fa-pencil-square-o"
										aria-hidden="true"></i>Config..</a>
								<!-- <a class="dropdown-item" id="help-clients"><i class="halflings-icon off"></i>
									Client
									List..</a> -->
								<div class="dropdown-item" id="help-about"><i class="fa fa-info" aria-hidden="true"></i>
									About..</div>

							</div>
						</li>
					</ul>

				</div>

				<div class="navbar-brand col-sm-8">
					<div class="row">
						<h2 class="display2 col-sm align-items-left">!CHAOS
							Dashboard</h2>
						<div class="col-sm">
							<?php echo file_get_contents("version.html");?>
						</div>

					</div>
				</div>
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
<div class="btn-group btn-breadcrumb">
	<a href="./index.php" class="btn btn-default"><i class="glyphicon glyphicon-home"></i></a>
	<a href="./index.php" id="CUEU" class="btn btn-default">CU/EU</a>
	<a href="./chaos_jshell.php" id="SHELL" class="btn btn-default">Control Shell</a>
	<a href="./process.php" id="PROCESS" class="btn btn-default">Process</a>
	<a href="./chaos_node.php" id="NODE" class="btn btn-default">Node Management</a>
	<a href="./configuration.php" id="CONFIG" class="btn btn-default">Configuration</a>

</div>
</div>
<script>
	if(dashboard_settings.hasOwnProperty('push')&&dashboard_settings.push){
		$("#push_enable").prop('checked',true);
	}
	$("#push_enable").prop('disabled', true);
	
	function onConnectServer(s) {
		$("#server-connection-status").removeClass("indicator-nok");
		$("#server-connection-status").addClass("indicator-ok");
		$("#push_enable").prop('disabled', false);
	}
	function onDisconnectServer() {
		$("#server-connection-status").removeClass("indicator-ok");
		$("#server-connection-status").addClass("indicator-nok");
		$("#push_enable").prop('disabled', true);
		$("#push_enable").prop('checked',false);

	}
	$("#client-connection-id").html("<font size=\"1\">" + localStorage['chaos_browser_uuid_cookie'].substr(localStorage['chaos_browser_uuid_cookie'].length - 5) + "</font>");
	jchaos.options['io_onconnect'] = (s) => {
		onConnectServer(s);
	}
	jchaos.options['io_disconnect'] = (sock) => {
		onDisconnectServer();
	};
	jchaos.iosubscribeCU("all", false);
	jchaos.options['on_restTimeout'] = (e) => {
		var now = (new Date()).getTime();
		jqccs.busyWindow(true);
		jchaos['last_timeout'] = now;

	};
	jchaos.options['on_restOk'] = (e) => {

		if (jchaos.hasOwnProperty('last_timeout')) {
			jqccs.busyWindow(false);
			delete jchaos['last_timeout'];
		}
	};
	$(<?php echo '"#'.$curr_page.'"' ?> ).addClass("btn-success");
	function triggerRefreshEdit() {
		$("input[type=radio][name=search-alive]:checked").val(false);
		$("input[type=radio][name=search-alive]").trigger("change");

	}
	function addMenuScriptItems(pid, node) {
		var items = {};
		var tree = $('#hier-' + pid).jstree(true);
		var ID = $(node).attr('id');
		items['upload-script'] = {
			"separator_before": false,
			"separator_after": true,
			label: "Upload script",
			action: function () {

				jqccs.getFile("Script Loading", "select the Script to load", function (script) {
					var regex = /.*[/\\](.*)$/;
					var scriptTmp = {};
					var name = script['name'];
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
					var group = "";
					if (node.hasOwnProperty("data") && node.data.hasOwnProperty("group")) {
						group = node.data.group;
					} else {
						var zone_selected = $("#zones option:selected").val();

						if ((typeof zone_selected === "string") && (!zone_selected.includes("--"))) {
							group = zone_selected;
						} else {
							group = "ALL";
						}
					}
					if (node['group'] !== undefined) {
						group = node['group'];
					}

					scriptTmp['script_name'] = name;
					scriptTmp['script_target'] = "local";
					scriptTmp['eudk_script_content'] = script['data'];
					scriptTmp['eudk_script_language'] = language;
					scriptTmp['script_description'] = "Imported from " + script['name'];
					scriptTmp['default_argument'] = "";
					scriptTmp['script_group'] = group;

					var templ = {
						$ref: "algo.json",
						format: "tabs"
					}
					jqccs.jsonEditWindow("Loaded", templ, scriptTmp, (obj) => {
						jqccs.algoSave(obj, () => { refresh_script(pid); });


					});

				});
			}
		};

		if (node.hasOwnProperty("data")) {
			if (node.data.hasOwnProperty('eudk_script_language')) {
				if (node.data['eudk_script_language'] == "JS") {

					items['run-control'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Run control script",
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
				} else if (node.data['eudk_script_language'] == "NODEJS") {
					items['run-jseu'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Run Javascript EU",
						action: function () {

						}
					};
				} else if (node.data['eudk_script_language'] == "CPP") {
					items['run-cppeu'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Create Root/C++ EU",
						action: function () {
							$.get('eu_write_mask.json', function (templ) {
								jchaos.findBestServer(function (server, best_agent, ordered_list) {
									if (ordered_list.length == 0) {
										alert("cannot find an available server to run");
										return;
									}
									var eu = node.data;
									var glist = [];
									if (eu['script_group'] !== undefined) {
										glist.push(jchaos.encodeName(eu['script_group']));
									}
									var regexp = /(\w+)\./;
									var match = regexp.exec(eu['script_name']);
									if ((match != null) && (match.length > 0)) {
										var str = match[1];
										glist.push(str.toUpperCase());
									}

									templ['properties']['ndk_parent'].enum = ordered_list;

									templ['properties']['group'].enum = glist;
									var obj = {};
									if (eu['script_description'] !== undefined) {
										obj['cudk_desc'] = eu['script_description'];
									}
									obj['ndk_type'] = "nt_root";
									obj['dsndk_storage_type'] = ["Live"];
									if (eu['default_argument'] !== undefined) {
										obj['cudk_load_param'] = eu['default_argument'];

									}
									obj['control_unit_implementation'] = eu['script_name'];
									jqccs.jsonEditWindow("EU Editor", templ, obj, jchaos.cuSave, null, (ok) => {
										jqccs.instantMessage("Created ", "OK", 2000, true);
										triggerRefreshEdit();
									}, (bad) => {
										alert(" Cannot create node err:" + JSON.stringify(bad));
									});

								}, (bad) => {
									alert("Cannot retrieve best server err:" + JSON.stringify(bad));
								});


							});
						}
					}
				}

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
							jqccs.jsonEditWindow("Loaded", templ, data, (obj) => {
								jqccs.algoSave(obj, () => { refresh_script(pid); });


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

	function refresh_script(pid) {
		var jsree_data = [];
		var scripts = {};
		var node_created = {};
		jchaos.search("", "script", false, function (l) {


			var scripts_flat = {}
			if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)) {
				var list_algo = l['found_script_list'];
				list_algo.forEach(function (p) {
					var group_name = "ALL";
					if ((p["script_group"] !== undefined) && (p["script_group"] != "")) {
						group_name = p["script_group"];
					}
					var encoden = jchaos.encodeName(p.script_name) + "_" + p.seq;
					delete p._id;
					if (p.seq > 0) {
						p['date'] = jchaos.getDateTime(p.seq);
					}
					var dirs = group_name.split("/");
					var group = "";
					dirs.forEach((ele, index) => {

						if (index == 0) {
							group = ele;
							var node_group = {
								"id": jchaos.encodeName(group),
								"parent": "#",
								"text": ele,
							};
						} else {
							var parent = group;
							group = group + "/" + ele;
							var node_group = {
								"id": jchaos.encodeName(group),
								"parent": jchaos.encodeName(parent),
								"text": ele
							};
						}
						node_group['data'] = { "group": group }

						if (!node_created.hasOwnProperty(group)) {
							node_created[group] = true;
							jsree_data.push(node_group);

						}

					});


					var node = {
						"id": encoden,
						"parent": jchaos.encodeName(group),
						"text": p.script_name,
						"data": p
					};
					node['data']['group'] = group;
					if (p['eudk_script_language'] == "JS" || p['eudk_script_language'] == "NODEJS") {
						node['icon'] = "/img/js.png";
					} else if (p['eudk_script_language'] == "CPP") {
						node['icon'] = "/img/cpp.png";

					}
					/*if (!node_created.hasOwnProperty(group_name)) {
						jsree_data.push(node_group);
						node_created[group_name] = true;
					}*/
					jsree_data.push(node);

				});
			} else {
				var node = {
					"id": "EMPTY",
					"parent": "#",
					"text": "EMPTY",
					"data": ""
				};
				if (!node_created.hasOwnProperty("EMPTY")) {
					node_created["EMPTY"] = true;
					jsree_data.push(node);

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
						return addMenuScriptItems(pid, node);

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
	function handle_script() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Script browser", refresh_script);
	}



	function addMenuSnapshotItems(pid, node) {
		var items = {};
		var tree = $('#hier-' + pid).jstree(true);
		var ID = $(node).attr('id');
		items['upload-setpoint'] = {
			"separator_before": false,
			"separator_after": true,
			label: "Upload setpoints",
			action: function () {

				jqccs.getFile("Snapshot upload", "select the snapshot", function (config) {
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

			}
		};

		if (node.hasOwnProperty("data") && (node.data != null)) {
			items['snap-apply'] = {
				"separator_before": false,
				"separator_after": true,
				label: "Restore Snapshot",
				action: function () {
					var snap_selected = node.data.name;
					jchaos.snapshot(snap_selected, "restore", "", function () {
						jqccs.instantMessage(snap_selected, " Perform restore ok ", 2000, true);

					}, function (err) {
						jqccs.instantMessage(snap_selected, " Error restoring: " + JSON.stringify(err), 4000, false);

					});

				}
			};
			items['snap-save'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Save locally",
				action: function () {
					var snap = node.data;
					jchaos.snapshot(snap.name, "load", null, "", (dataset) => {
						save_obj = {
							obj: dataset,
							fname: "snapshot_" + snap.name,
							fext: "json"
						};
						var blob = new Blob([JSON.stringify(save_obj.obj)], { type: "json;charset=utf-8" });
						saveAs(blob, save_obj.fname + "." + save_obj.fext);
					});
				}
			};
			items['snap-edit'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Edit..",
				action: function () {
					var snap = node.data;
					jchaos.snapshot(snap.name, "load", null, "", (dataset) => {
						jqccs.jsonEditWindow("Snap Editor", {}, dataset, (snapdata) => {
							console.log("snapshot:" + JSON.stringify(snapdata));
							/*vsets.forEach(function (elem) {
							jchaos.snapshot(name, "set", "", JSON.stringify(elem), function (d) {
								console.log("saving " + elem.name + " in " + name);
							});
						});*/
						}, null, (ok) => {
							jqccs.instantMessage("Created ", "OK", 2000, true);

						}, (bad) => {
							alert(" Cannot create node err:" + JSON.stringify(bad));
						});
					});
				}
			};
			items['snap-remove'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Remove",
				action: function () {
					var snap_selected = node.data.name;

					jqccs.confirm("Delete Snapshot", "Your are deleting snapshot: " + snap_selected, "Ok", function () {

						jchaos.snapshot(snap_selected, "delete", "", function () {
							jqccs.instantMessage(snap_selected + " deleted ", 1000, null, null, true);


						}, function (err) {
							jqccs.instantMessage(snap_selected + " error deleting " + JSON.stringify(err), 4000, null, null, false);

						});
					}, "Cancel");

				}
			};

		}
		return items;
	}

	function handle_snap() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Snapshot browser", (pid) => {
			jchaos.search("", "snapshots", false, function (l) {
				var jsree_data = [];
				var node_created = {};
				l.forEach(function (p) {
					var name = p.name;
					var dirs = name.split("/");
					var group = "";
					var parent = "#";
					var encoden = jchaos.encodeName(name);
					if (p.ts !== undefined) {
						p.ts = jchaos.getDateTime(p.ts);
					}
					if (dirs.length > 1) {
						dirs.forEach((ele, index) => {

							if (index == 0) {
								group = ele;
								var node_group = {
									"id": jchaos.encodeName(group),
									"parent": "#",
									"text": ele,
								};
							} else {
								parent = group;
								group = group + "/" + ele;
								var node_group = {
									"id": jchaos.encodeName(group),
									"parent": jchaos.encodeName(parent),
									"text": ele
								};
							}
							node_group['data'] = { "group": group }
							parent = jchaos.encodeName(parent);
							if (!node_created.hasOwnProperty(jchaos.encodeName(group))) {
								node_created[group] = true;
								jsree_data.push(node_group);

							}

						});

					}
					var node = {
						"id": encoden,
						"parent": parent,
						"text": name,
						"data": p
					};
					if (!node_created.hasOwnProperty(encoden)) {
						node['data']['group'] = group;
						jsree_data.push(node);
						node_created[encoden] = true;
					}
				});

				if (l.length == 0) {
					var node = {
						"id": "EMPTY",
						"parent": "#",
						"text": "EMPTY",
						"data": null
					};
					if (!node_created.hasOwnProperty("EMPTY")) {
						node_created["EMPTY"] = true;
						jsree_data.push(node);

					}
				}

				$("#hier-" + pid).jstree("destroy");

				$("#hier-" + pid).jstree({
					"plugins": ["dnd", "contextmenu"],
					"contextmenu": {
						'items': (node) => {
							return addMenuSnapshotItems(pid, node);

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
					jchaos.snapshot(node_data.name, "load", null, "", function (dataset) {
						node_data['setpoints'] = dataset;
						$('#desc-' + pid).html(jqccs.json2html(node_data));
						jqccs.jsonSetup($('#desc-' + pid), function (e) {
						});
						$('#desc-' + pid).find('a.json-toggle').click();
					});


				});
				$("body").removeClass("loading");
			});
		});
	}



	function addMenuLogItems(pid, node) {
		var items = {};
		var tree = $('#hier-' + pid).jstree(true);
		var ID = $(node).attr('id');

		if (node.data || node.id) {
			items['delete-log'] = {
			"separator_before": false,
			"separator_after": false,
			label: "Delete Log",
			action: function () {
				if(node.data && node.data.hasOwnProperty('mdsndk_nl_sid')){
					if(node.data.mdsndk_nl_lts){
						jqccs.confirm("Delete Logs", "Do you want delete logs of '" + node.data.mdsndk_nl_sid + "' before " + jchaos.getDateTime(node.data.mdsndk_nl_lts)+" ?","Ok", function () {
							jchaos.log(node.data.mdsndk_nl_sid, "delete", node.data.mdsndk_nl_l_ld, node.data.mdsndk_nl_lts,0, function (data) {
								jqccs.instantMessage("Deleted", node.data.mdsndk_nl_sid, 2000, true);


						})}, "Cancel");
					} else {
						jqccs.confirm("Delete Logs", "Do you want delete ALL '"+ node.data.mdsndk_nl_l_ld+ "' of '" + node.data.mdsndk_nl_sid+"' ?","Ok", function () {
							jchaos.log(node.data.mdsndk_nl_sid, "delete", node.data.mdsndk_nl_l_ld, 0,0, function (data) {
								jqccs.instantMessage("Deleted", node.data.mdsndk_nl_sid, 2000, true);
						})
						}, "Cancel");
					}


				} else if(node.hasOwnProperty('id')){
					jqccs.confirm("Delete Logs", "Do you want delete logs of type '" + node.id+"' ?", "Ok", function () {
						jchaos.log("", "delete", node.id, 0,0, function (data) {
								jqccs.instantMessage("Deleted", node.data.id, 2000, true);
						})
					}, "Cancel");


				}


			}
		}
		}
		return items;
	}
	function handle_chat() {
		jqccs.createDialogFromFile("chat_dialog.html", "chaosim", "Chaos IM", {
			modal: false, draggable: true,
			closeOnEscape: true,
			title: "Chaos Instant Messaging",
			minWidth: $(window).width() / 2,
			minHeight: $(window).height() / 2,
			buttons: [{
				id: "close",
				text: "Close",
				click: function (e) {
					$(this).dialog("close");
				}
			}],
			close: function () {
				console.log("delete chat service");
				//	delete chatService;
				$(this).dialog('destroy');
			},
			open: function () {
				/*chatService.initializeApp();

				// Send message
				$('#message-form').submit(function(e) {    
					e.preventDefault(); 

					$('.old-chats').remove();
					chatService.sendMessage();


					$('#message-form').trigger('reset');
				});*/
			}
		});

	}
	function handle_log(obj) {
		//$("body").addClass("loading");
		var search="";
		if(obj && obj.search){
			search=obj.search;
		}
		jqccs.createQueryDialog(query => {
			jqccs.createBrowserWindow("Log browser "+search, (pid) => {
				var jsree_data = [];
				var node_created = {};
				var node_all = {
					"id": "ALL",
					"parent": "#",
					"text": "ALL",
				};
				jsree_data.push(node_all);
				node_created['ALL'] = true;
				jchaos.log(search, "search", "all", query.start, query.stop, function (data) {
					if (data.hasOwnProperty("result_list")) {
						data.result_list.forEach(function (item) {
							var name = item.mdsndk_nl_sid;
							var nodef = jchaos.encodeName(name) + "_" + item.mdsndk_nl_lts;

							var dat = jchaos.getDateTime(item.mdsndk_nl_lts);

							item['date'] = dat;
							var msg = item.mdsndk_nl_e_em;
							var type = item.mdsndk_nl_ld;
							if ((item.mdsndk_nl_l_ld !== undefined) && (item.mdsndk_nl_l_ld == "Error")) {
								type = "error";
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
							var parent_name="";
							dirs.forEach((ele, index) => {
								var node_group;
								compname = ele;
								if (index == 0) {
									group = type + "/" + ele;
									parent = type;
									parent_name=ele;

								} else {
									parent = group;
									group = group + "/" + ele;
									parent_name=parent_name+ "/" + ele;

								}

								var egroup = jchaos.encodeName(group);
								node_group = {
									"id": egroup,
									"parent": jchaos.encodeName(parent),
									"text": ele
								};
								
								node_group['data'] = { "group": group }
								node_group['data']['mdsndk_nl_l_ld']=item.mdsndk_nl_ld;
								node_group['data']['mdsndk_nl_sid']=parent_name;

								
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
							node['data']['group'] = group;
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


					$("#hier-" + pid).jstree("destroy");

					$("#hier-" + pid).jstree({
						"plugins": ["dnd", "contextmenu"],
						"contextmenu": {
							'items': (node) => {
								return addMenuLogItems(pid, node);

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
				});
			});
		}, null, { 'page': false, 'tag': false });
	}


	function addMenuGraphItems(pid, node) {
		var items = {};
		var tree = $('#hier-' + pid).jstree(true);
		var ID = $(node).attr('id');
		items['create-graph'] = {
			"separator_before": false,
			"separator_after": true,
			label: "Create Graph",
			action: function () {
				jqccs.createEditGraph({}, (ok) => {
					$("#refresh-" + pid).trigger("click");
				});
			}
		}
		if (node.hasOwnProperty("data") && node.data.hasOwnProperty('name')) {
			items['run-graph'] = {
				"separator_before": false,
				"separator_after": true,
				label: "Run Graph",
				action: function () {
					var opt = node.data;
					var count = (new Date()).getTime();
					var options = {
						modal: false,
						draggable: true,
						closeOnEscape: false,
						title: opt.name,
						width: opt.width,
						hright: opt.height,
						height: opt.height,
						zIndex: 10000,
						resizable: true,
						dialogClass: 'no-close'
					};
					var gname = opt.name;
					var id = gname + "_" + count;
					jqccs.createGraphDialog(gname, null, options);

				}
			}
			items['edit-graph'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Edit Graph (WinP)",
				action: function () {
					var templ = {
						$ref: "graph.json",
						format: "tabs"
					}
					jqccs.jsonEditWindow("Graph ", templ, node.data, (gtsave) => {
						jchaos.variable("graphs", "get", function (gphs) {
							if (gtsave.hasOwnProperty("name")) {
								if (typeof gphs !== "object") {
									gphs = {}


								}
								gtsave['time'] = jchaos.getDateTime();
								gphs[gtsave.name] = gtsave;
								jchaos.variable("graphs", "set", gphs, function (gphs) {
									jqccs.instantMessage("Graph", "Graph " + gtsave.name + " uploaded", 2000, true);
									$("#refresh-" + pid).trigger("click");

								});

							}


						});
					});


				}

			}
			items['remove-graph'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Remove Graph",
				action: function () {
					jchaos.variable("graphs", "get", function (gphs) {
						delete gphs[node.data.name];
						jchaos.variable("graphs", "set", gphs, function (gphs) {
							jqccs.instantMessage("Graph", "Graph " + gtsave.name + " removed", 2000, true);

						});
						$("#refresh-" + pid).trigger("click");
					});

				}
			}


			items['upload-graph'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Upload Graph (WinP)",
				action: function () {
				}
			}
			items['download-graph'] = {
				"separator_before": false,
				"separator_after": false,
				label: "Download Graph (WinP)",
				action: function () {
				}
			}
		}
		return items;
	}

	function handle_graph() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Graph browser", (pid) => {
			var jsree_data = [];
			var node_created = {};
			jchaos.variable("graphs", "get", (high_graphs) => {
				var cnt = 0;
				for (var g in high_graphs) {
					var name = g;
					var type = high_graphs[g].type;
					var nodef = jchaos.encodeName(name) + "_" + high_graphs[g].time;

					var dirs = name.split("/");
					var group = "";
					cnt++;
					dirs.forEach((ele, index) => {
						var node_group;
						if (index == 0) {
							group = ele;
							node_group = {
								"id": jchaos.encodeName(group),
								"parent": "#",
								"text": ele,
							};
						} else {
							var parent = group;
							group = group + "/" + ele;
							node_group = {
								"id": jchaos.encodeName(group),
								"parent": jchaos.encodeName(parent),
								"text": ele
							};
						}
						node_group['data'] = { "group": group }

						if (!node_created.hasOwnProperty(group)) {
							node_created[group] = true;
							jsree_data.push(node_group);
						}

					});
					var idgroup = jchaos.encodeName(name) + "_" + type;
					var node_group = {
						"id": idgroup,
						"parent": jchaos.encodeName(group),
						"text": type,
					};
					var icon = "/img/sine-wave.png";
					/*if(type=="error"){
						icon="/img/log-error.png";
					} else {
						icon="/img/log-file.png";

					}*/
					if (!node_created.hasOwnProperty(idgroup)) {
						jsree_data.push(node_group);
						node_created[idgroup] = true;
					}

					var node = {
						"id": nodef,
						"parent": jchaos.encodeName(idgroup),
						"text": ((typeof high_graphs[g].time === "string") ? high_graphs[g].time : name),
						"icon": icon,
						"data": high_graphs[g]
					};
					node['data']['group'] = group;
					if (!node_created.hasOwnProperty(nodef)) {
						node_created[nodef] = true;
						jsree_data.push(node);
					}
				}
				if (cnt == 0) {
					var node = {
						"id": "EMPTY",
						"parent": "#",
						"text": "EMPTY",
						"data": ""
					};
					if (!node_created.hasOwnProperty("EMPTY")) {
						node_created["EMPTY"] = true;
						jsree_data.push(node);

					}
				}


				$("#hier-" + pid).jstree("destroy");

				$("#hier-" + pid).jstree({
					"plugins": ["dnd", "contextmenu"],
					"contextmenu": {
						'items': (node) => {
							return addMenuGraphItems(pid, node);

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
			});
		});
	}

	dashboard_settings['current_page'] = 0;

	jqccs['dashboard_settings'] = dashboard_settings;

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
	$("#config-settings").on("click", function () {
		var templ = {
			$ref: "dashboard-settings.json",
			format: "tabs"
		}
		var def = {}
		jqccs.initSettings();

		var def = JSON.parse(localStorage['chaos_dashboard_settings']);
		jqccs.jsonEditWindow("Config", templ, def, function (d) {
			localStorage['chaos_dashboard_settings'] = JSON.stringify(d);
			console.log("Save settings:" + localStorage['chaos_dashboard_settings']);
			var e = jQuery.Event('keypress');
			e.which = 13;
			e.keyCode = 13;
			if (d.hasOwnProperty("defaultRestTimeout")) {
				jchaos.setOptions({ "timeout": d.defaultRestTimeout });
			} else {
				jchaos.setOptions({ "timeout": 10000 });

			}
			location.reload();
			return 0;// close window
			//    $("#search-chaos").trigger(e);
		}, null);

	});
	function cu2editor(ob, func) {
			var obj = Object.assign({}, ob);
			var edm='cu_write_mask.json';
			if(obj.hasOwnProperty("ndk_type")&&(obj['ndk_type']=="nt_root")){
				edm='eu_write_mask.json';
			}
			$.get(edm, function (templ) {
				try {

					jchaos.search("", "us", false, function (uslist) {
						jchaos.variable("cu_catalog", "get", (cudb) => {
							var list_us = [];
							var par = "";
							if (obj.ndk_parent !== undefined) {
								par = obj.ndk_parent;

							}

							if (par != "") {
								list_us.push(par);
							}
							if(obj.ndk_type=="nt_root"){
								let alist=jchaos.search("", "agent", false);
								alist.forEach((us) => {
									if (us != par) {
										list_us.push(us);
									}
								});

							}
							if ((obj.ndk_type !== undefined) && (obj.ndk_type == "nt_control_unit")) {

								uslist.forEach((us) => {
									if (us != par) {
										list_us.push(us);
									}
								});
							}
							if (list_us.length > 0) {
								list_us.push(""); // allow to set parent null
								templ['properties']['ndk_parent'].enum = list_us;
							} else {

								templ['properties']['ndk_parent'] = {
									"type": "string",
									"format": "text",
									"required": true,
									"description": "US owner"

								};
							}

							var list_impl = [];

							var impl = "";
							if (obj.control_unit_implementation !== undefined) {
								impl = obj.control_unit_implementation;
							}
							var glist = [];
							var cu_template = null;
							if (impl != "") {
								for (var k in cudb) {
									for (var im in cudb[k]) {
										if (cudb[k][im].info.impl == impl) {
											cu_template = cudb[k][im];
										}
									}

								}

							}
							if (impl != "---") {
								if (impl != "") {
									//			list_impl.push(impl);
									if (cu_template != null) {
										glist = cu_template.info.group;
									}
								} else {
									for (var k in cudb) {
										for (var impl in cudb[k]) {
											if (cudb[k][impl].info !== undefined) {
												if (cudb[k][impl].info.group !== undefined) {
													glist = glist.concat(cudb[k][impl].info.group);
												}
											}
										}

									}
									for (var k in cudb) {
										for (var im in cudb[k]) {

											if (im != impl) {
												list_impl.push(cudb[k][im].info.impl);
											}
										}
									}

								}

							}
							if ((glist instanceof Array) && (glist.length > 0)) {
								templ['properties']['group'].enum = glist;
							} else {
								templ['properties']['group'] = {
									"type": "string",
									"format": "text",
									"required": true,
									"description": "CU Group"

								};
							}

							if ((ob.ndk_uid !== undefined) && (typeof ob.ndk_uid == "string")) {
								if (jchaos.pathToZoneGroupId(ob.ndk_uid) != null) {
									//valid path change 
									templ['properties']['ndk_uid'] = {
										"type": "string",
										"required": true,
										"format": "text"
									};
									delete templ['properties']['group'];
									delete templ['properties']['id'];
									delete templ['properties']['zone'];

								}
							}
							//list_impl.push("CUSTOM");
							if ((obj.ndk_type !== undefined) && (obj.ndk_type == "nt_root")) {
								list_impl = jchaos.findScriptByType("", "CPP");
							}
							if (list_impl.length > 0) {
								templ['properties']['control_unit_implementation'].enum = list_impl;
							} else {
								templ['properties']['control_unit_implementation'] = {
									"type": "string",
									"format": "text",
									"required": true,
									"description": "CU C++ implementation"

								};
							}
							var drv_impl = obj.cudk_driver_description;
							var list_drivers = [];

							if ((drv_impl !== undefined)) {
								if (drv_impl instanceof Array) {
									drv_impl.forEach((d) => {
										list_drivers.push(d.cudk_driver_description_name);
									});
								} else if (typeof drv_impl == "object") {
									list_drivers.push(drv_impl)
								}
								// return just the drivers that are supported


							} else if ((impl != "") && (cu_template != null)) {
								var dlist = cu_template.drivers;
								// drivers for the implementation
								for (d in dlist) {
									// push drivers available for implementation
									var exist = list_drivers.filter((elem) => { return (elem == d); });
									if ((exist instanceof Array) && exist.length == 0) {
										list_drivers.push(d);
									}

								}

							} else {
								for (var k in cudb) {
									for (var i in cudb[k]) {

										var dlist = cudb[k][i].drivers;

										for (d in dlist) {
											list_drivers.push(d);
										}
									}
								}
							}
							if(templ['properties']['cudk_driver_description']){
								if (list_drivers.length > 0){
									templ['properties']['cudk_driver_description']['items']['properties']['cudk_driver_description_name'].enum = list_drivers;
								} else {
										delete templ['properties']['cudk_driver_description']['items']['properties']['cudk_driver_description_name']['enum'];
								}
							}

							/*	if((cudb[impl] !== undefined) && (cudb[impl].drivers !== undefined )&& (drv !== undefined)){
									templ['properties']['cudk_driver_description']['properties'].cudk_driver_description_name=cudb[impl].drivers;
								} else {
									var all_driver=[]
									for(var k in cudb){
										var dlist=cudb[k].drivers;
										for(d in dlist){
											all_driver.push(d);
										}
									}
								}*/
							//	templ['properties']['control_unit_implementation'].cudk_driver_description
							var list_storage = [];

							if (obj.dsndk_storage_type !== undefined) {
								list_storage = jchaos.storage2List(obj.dsndk_storage_type);

							} else {
								list_storage.push("Live");
							}
							obj.dsndk_storage_type = list_storage;

							var list_prop = [];
							if (obj.cudk_prop !== undefined) {
								list_prop = obj.cudk_prop;
								/*try {
									var par = JSON.parse(list_prop);
									for (var k in par) {
										list_prop.push({ k: par(k) });
									}
								} catch (e) {
	
								}*/

							}
							obj['cudk_prop'] = list_prop;
							if (obj.cudk_driver_description !== undefined) {
								obj.cudk_driver_description.forEach((ele, index) => {
									var list_prop = [];
									if (ele.cudk_driver_prop !== undefined) {
										list_prop = ele.cudk_driver_prop;
									}

									obj.cudk_driver_description[index]['cudk_driver_prop'] = list_prop;
								});

							}
							func(templ, obj, cudb);
						});
					});
				} catch (e) {
					alert("Error parsing:" + JSON.stringify(e));
				}
			});

		}
</script>