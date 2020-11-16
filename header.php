<div class="navbar">
	<div class="navbar-inner w-100">
		<div class="container-fluid-full">
			<nav class="navbar navbar-expand-md navbar-dark bg-black">


				<div class="collapse navbar-collapse" id="navbarsExampleDefault">
					<ul class="navbar-nav mr-auto">
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01"
								data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Chaos</a>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="./index.php"><i class="halflings-icon home"></i>
									CU/EU</a>
								<a class="dropdown-item" href="./chaos_jshell.php"><i class="halflings-icon edit"></i>
									Control Shell</a>
								<a class="dropdown-item" href="./process.php"><i class="halflings-icon cog"></i>
									Process
									View</a>
								<a class="dropdown-item" href="./chaos_node.php"><i class="halflings-icon wrench"></i>
									Node Management(Experimental)</a>
								<a class="dropdown-item" href="./chaos_node_table.php"><i
										class="halflings-icon pencil"></i> Node Management</a>
								<a class="dropdown-item" href="./configuration.php"><i
										class=" halflings-icon cloud"></i> Configuration</a>
							</div>
						</li>
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01"
								data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Tools</a>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="javascript:handle_script()" id="hscript-management"><i
										class="halflings-icon cog"></i> Scripts</a>
								<a class="dropdown-item" href="javascript:handle_graph()" id="hgraph"><i
										class="halflings-icon stats-bar"></i> Graph</a>
								<a class="dropdown-item" href="javascript:handle_snap()" id="hsnap-management"><i
										class="halflings-icon tag"></i> Snapshot</a>
								<a class="dropdown-item" href="javascript:handle_log()" id="hlog"><i
										class="halflings-icon list"></i>Log</a>

							</div>
						</li>
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01"
								data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Settings</a>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="login.html"><i class="halflings-icon off"></i>
									Login</a>
								<a class="dropdown-item" id="config-settings"><i class="halflings-icon off"></i>
									Config..</a>
								<a class="dropdown-item" id="help-clients"><i class="halflings-icon off"></i>
									Client
									List..</a>
								<a class="dropdown-item" id="help-about"><i class="halflings-icon off"></i>
									About..</a>

							</div>
						</li>
					</ul>
					<!-- <form class="form-inline my-2 my-lg-0">
						<input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
						<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
					</form> -->
				</div>
				<a class="navbar-brand col-sm" href="#">
					<div class="row">
						<h2 class="display2 col-sm">!CHAOS
							Dashboard</h2>
						<div class="col-sm">
							<?php echo file_get_contents("target.html");echo file_get_contents("version.html");?>
						</div>
					</div>
				</a>

			</nav>

			<!-- start: Header Menu -->


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
	$( <?php echo '"#'.$curr_page.'"' ?> ).addClass("btn-success");
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
					var zone_selected = $("#zones option:selected").val();

					if (typeof zone_selected === "string") {
						group = zone_selected;
					} else {
						group = "ALL";
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
					jqccs.jsonEditWindow("Loaded", templ, scriptTmp, jqccs.algoSave);
					/*$.get('algo.json', function (d) {
						var templ = JSON.parse(d);
						jchaos.search("", "zone", false, function (zon) {
							var zone = ["ALL",group].concat(zon);
							templ['properties']['script_group']['enum'] = zone;
							jqccs.jsonEditWindow("Loaded", templ, scriptTmp, jqccs.algoSave);
						}, (bad) => {
							jqccs.instantMessage("cannot identify zones", "error:" + JSON.stringify(bad), 5000, false);
		
						});
					}, 'text');
					*/

				})
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

									}, (bad) => {
										alert(" Cannot create node err:" + JSON.stringify(bad));
									});

								},(bad)=>{
									alert("Cannot retrieve best server err:"+JSON.stringify(bad));
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
							jqccs.jsonEditWindow("Loaded", templ, data, jqccs.algoSave);

							/*	$.get('algo.json', function (d) {
								var templ = JSON.parse(d);
								jchaos.search("", "zone", false, function (zon) {
									var zone = ["ALL"].concat(zon);
									templ['properties']['script_group']['enum'] = zone;
									jqccs.jsonEditWindow("Loaded", templ, data, jqccs.algoSave);
								});
							}, 'text');
							*/
						});
						/*cu2editor(cu, (edit_templ, editobj) => {

							jqccs.jsonEditWindow("CU Editor", edit_templ, editobj, jchaos.cuSave, null, function (json) {
								jqccs.instantMessage("CU saved " + selected_node, " OK", 2000, true);
								decoded = jchaos.pathToZoneGroupId(json.ndk_uid);
								var icon_name = "/img/devices/" + decoded["group"] + ".png";

								if (decoded) {
									json['group'] = decoded["group"];
									var newnode = {
										"id": jchaos.encodeName(json.ndk_uid),
										"parent": node.id,
										"icon": icon_name,
										"text": decoded["id"],
										"data": json
									};

									tree.create_node(node, newnode);

								}
							}, function (bad) {
								jqccs.instantMessage("Error saving CU/EU " + selected_node, JSON.stringify(bad), 2000, false);

							});
						});*/

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


	function handle_script() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Script browser", (pid) => {
			jchaos.search("", "script", false, function (l) {
				var jsree_data = [];
				var scripts = {};
				var node_created = {};

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
							p['date'] = (new Date(p.seq)).toUTCString();
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
		);

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

		if (node.hasOwnProperty("data")) {
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
						jqccs.jsonEditWindow("Snap Editor", {}, dataset, (snapdata)=>{
							console.log("snapshot:"+JSON.stringify(snapdata));
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

					confirm("Delete Snapshot", "Your are deleting snapshot: " + snap_selected, "Ok", function () {

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
					var parent="#";
					var encoden = jchaos.encodeName(name);
					if (p.ts !== undefined) {
						p.ts = (new Date(p.ts)).toLocaleString();
					}
					if(dirs.length>1){
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
						parent=jchaos.encodeName(parent);
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
					if(!node_created.hasOwnProperty(encoden)){
						node['data']['group'] = group;
						jsree_data.push(node);
						node_created[encoden]=true;
					}
				});



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
						node_data['setpoints']=dataset;
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

		if (node.hasOwnProperty("data")) {
		}
		return items;
	}

	function handle_log() {
		//$("body").addClass("loading");
		jqccs.createQueryDialog(query => {
			jqccs.createBrowserWindow("Log browser", (pid) => {
				var jsree_data = [];
				var node_created = {};

				jchaos.log("", "search", "all", query.start, query.end, function (data) {
					if (data.hasOwnProperty("result_list")) {
						data.result_list.forEach(function (item) {

							var dat = new Date(item.mdsndk_nl_lts).toLocaleString('it-IT', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });

							item.mdsndk_nl_lts = new Date(item.mdsndk_nl_lts).toLocaleString('it-IT');
							var name = item.mdsndk_nl_sid;
							var msg = item.mdsndk_nl_e_em;
							var type = item.mdsndk_nl_ld;
							if ((item.mdsndk_nl_l_ld !== undefined) && (item.mdsndk_nl_l_ld == "Error")) {
								type = "error";
							}
							var origin = item.mdsndk_nl_e_ed;
							var nodef = jchaos.encodeName(name) + "_" + item.mdsndk_nl_lts;
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
								node_created[type] = true;
							}
							var dirs = name.split("/");
							var group = "";
							dirs.forEach((ele, index) => {
								var node_group;
								if (index == 0) {
									group = type + "/" + ele;
									node_group = {
										"id": jchaos.encodeName(group),
										"parent": jchaos.encodeName(type),
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
							var node = {
								"id": nodef,
								"parent": jchaos.encodeName(group),
								"text": dat,
								"icon": icon,
								"data": item
							};
							node['data']['group'] = group;
							if (!node_created.hasOwnProperty(nodef)) {
								node_created[nodef] = true;
								jsree_data.push(node);
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

		if (node.hasOwnProperty("data")) {
		}
		return items;
	}

	function handle_graph() {
		$("body").addClass("loading");

		jqccs.createBrowserWindow("Log browser", (pid) => {
			var jsree_data = [];
			var node_created = {};
			jchaos.variable("highcharts", "get", (high_graphs) => {

				for (var g in high_graphs) {

					var dat = new Date(high_graphs[g].time).toLocaleString('it-IT', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });

					var name = g;
					var type = high_graphs[g].highchart_opt.chart.type;
					var nodef = jchaos.encodeName(name) + "_" + high_graphs[g].time;

					var dirs = name.split("/");
					var group = "";
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
						"text": dat,
						"icon": icon,
						"data": high_graphs[g]
					};
					node['data']['group'] = group;
					if (!node_created.hasOwnProperty(nodef)) {
						node_created[nodef] = true;
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
</script>