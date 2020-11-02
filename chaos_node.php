<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "NODE";

?>

<body>

	<?php
require_once('header.php');
?>

	<div class="container-fluid-full fill">
		<div class="row fill">



			<!-- start: Content -->
			<div id="chaos_content" class="col-md-12">


				<div class="row">
					<div class="statbox purple col-md-3">
						<h3>Node Type</h3>
						<select id="View" size="auto">
							<option value="byzone" selected="selected">By Zone</option>
							<option value="bydevice">By Device Type</option>
							<option value="byserver">By Server</option>
						</select>
					</div>

					<div class="statbox purple col-md-3">

						<div class="row align-items-center">
							<div class="col-sm">
								<label for="search-alive">All</label><input class="input-xlarge" id="search-alive-false"
									title="Search Alive and not Alive nodes" name="search-alive" type="radio"
									value=false>
							</div>
							<div class="col-sm">
								<label for="search-alive">Alive</label><input class="input-xlarge"
									id="search-alive-true" title="Search just alive nodes" name="search-alive"
									type="radio" value=true checked>
							</div>
							<div class="col-sm">
								<label for="search-chaos">Search</label>
								<input class="input-xlarge focused" id="search-chaos" title="Free form Search"
									type="text" value="">
							</div>
						</div>


					</div>
				</div>
				<div class="box-content">

					<div class="box row">
						<div id="hier_view" class="col-md-3"></div>
						<div id="desc_view" class="col-md-3"></div>
						<div class="chaos_synoptic_container">
							<img id="zone_image" src="" />
							<svg id="svg_img" viewBox="0 0 640 480"></svg>
						</div>
					</div>
				</div>

			</div>



		</div>
	</div>
	<!-- <div id="hier_view"></div> -->


	<!-- <div class="clearfix"></div> -->

	<footer><?php require_once('footer.php');?></footer>






	<script>
		var cu_copied = null;
		var synoptic = {};
		jchaos.variable("synoptic", "get", (ok) => {
			synoptic = ok;
		});


		function cu2editor(ob, func) {
			var obj = Object.assign({}, ob);
			$.get('cu_write_mask.json', function (templ) {
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
							uslist.forEach((us) => {
								if (us != par) {
									list_us.push(us);
								}
							});
							templ['properties']['ndk_parent'].enum = list_us;
							var list_impl = [];

							var impl = "";
							if (obj.control_unit_implementation !== undefined) {
								impl = obj.control_unit_implementation;
							}
							if (impl != "") {
								list_impl.push(impl);
								if ((cudb[impl] !== undefined) && (cudb[impl].info !== undefined)) {
									templ['properties']['group'].enum = cudb[impl].group;
								}
							} else {
								var glist = [];
								for (var k in cudb) {
									if (cudb[k].info !== undefined) {
										if (cudb[k].info.group !== undefined) {
											glist = glist.concat(cudb[k].info.group);
										}
									}

								}
								templ['properties']['group'].enum = glist;

							}
							for (var k in cudb) {
								if (k != impl) {
									list_impl.push(k);
								}
							}
							if (ob.ndk_uid !== "undefined") {
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
							list_impl.push("CUSTOM");
							if ((obj.ndk_type !== undefined) && (obj.ndk_type == "nt_root")) {
								list_impl = jchaos.findScriptByType("", "CPP");
							}

							templ['properties']['control_unit_implementation'].enum = list_impl;
							var drv_impl = obj.cudk_driver_description;
							var list_drivers = [];

							if ((drv_impl !== undefined) && (drv_impl.length)) {
								drv_impl.forEach((d) => {
									list_drivers.push(d.cudk_driver_description_name);
								});
								// return just the drivers that are supported


							}
							if ((impl!="")&&(cudb[impl] !== undefined) && (cudb[impl].drivers !== undefined)) {
								var dlist = cudb[impl].drivers;
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
									var dlist = cudb[k].drivers;
									for (d in dlist) {
										list_drivers.push(d);
									}
								}
							}
							templ['properties']['cudk_driver_description']['items']['properties']['cudk_driver_description_name'].enum = list_drivers;

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
								if (obj.dsndk_storage_type & 0x1) {
									list_storage.push("History");
								}
								if (obj.dsndk_storage_type & 0x2) {
									list_storage.push("Live");
								}
								if (obj.dsndk_storage_type & 0x10) {
									list_storage.push("Log");
								}
							} else {
								list_storage.push("Live");
							}
							obj.dsndk_storage_type = list_storage;

							var list_prop = [];
							if (obj.cudk_prop !== undefined) {
								try {
									var par = JSON.parse(list_prop);
									for (var k in par) {
										list_prop.push({ k: par(k) });
									}
								} catch (e) {

								}

							}
							obj['cudk_prop'] = list_prop;
							if (obj.cudk_driver_description !== undefined) {
								obj.cudk_driver_description.forEach((ele, index) => {
									var list_prop = [];
									if (ele.cudk_driver_prop !== undefined) {
										try {
											var par = JSON.parse(ele.cudk_driver_prop);
											for (var k in par) {
												list_prop.push({ k: par(k) });
											}
										} catch (e) {

										}
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

		function copyToClipboard(txt) {
			var $temp = $("<input>");
			$("body").append($temp);
			$temp.val(txt).select();
			document.execCommand("copy");
			$temp.remove();
		}
		function addMenuItems(node, what) {
			var items = {};
			var tree = $('#hier_view').jstree(true);
			var ID = $(node).attr('id');
			if (node.hasOwnProperty("data")) {
				if (node.data.hasOwnProperty('zone') || (node.data.hasOwnProperty("ndk_type")&&(node.data.ndk_type=="nt_unit_server"))) {
					items['new-cu'] = {
						"separator_before": false,
						"separator_after": false,
						label: "New CU",
						action: function () {
							var cu = {};
							//cu["ndk_uid"] = node.data["zone"] + "/MYGROUP/NewName" + (new Date()).getTime();
							cu['id'] = "<MY ID>";
							if((node.data.ndk_type=="nt_unit_server")){
								cu['ndk_parent']=node.data.ndk_uid;
							}
							cu2editor(cu, (edit_templ, editobj, cudb) => {

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

								}, function (e) {
									var cu = e.getValue();
									if (cudb.hasOwnProperty(cu.control_unit_implementation)) {
										if (cudb[cu.control_unit_implementation].info !== undefined) {
											e.schema.properties.group.enum = cudb[cu.control_unit_implementation].info.group;
											//		e.refresh();
										}

										console.log("Editor change :" + cu.control_unit_implementation);

									}
								});
							});
						}
					};

					if ((cu_copied != null) && (typeof cu_copied === "object")) {
						items['paste'] = {
							"separator_before": false,
							"separator_after": false,
							label: "Paste",
							action: function () {

								var cu = Object.assign({},cu_copied);
								var decoded = jchaos.pathToZoneGroupId(cu.ndk_uid);
								var zone;
								if((node.data.ndk_type=="nt_unit_server")){
									cu['ndk_parent']=node.data.ndk_uid;
								}
								if(node.data.zone!== undefined){
									zone = node.data.zone;
								} else {
									zone=decoded['zone'];
								}

								if (decoded) {
									cu["ndk_uid"] = zone + "/" + decoded["group"] + "/" + decoded['id']+ (new Date()).getTime();

									cu2editor(cu, (edit_templ, editobj) => {

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
									});
								} else {
									alert("Not a valid uid:'" + cu.ndk_uid + "' must contain at least zone/group/id")
								}
							}
						};
					}
				}

				if (node.data.hasOwnProperty("ndk_type") && node.data.hasOwnProperty("ndk_uid")) {
					var selected_node = node.data.ndk_uid;
					var type = node.data.ndk_type;
					if ((type == "nt_control_unit") || (type == "nt_root")) {
						var uid
						items['edit'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Edit",
							action: function () {

								jchaos.node(selected_node, "get", "cu", function (data) {
									if (data != null) {
										//editorFn = cuSave;
										//jsonEdit(templ, data);
										cu2editor(data, (edit_templ, editobj) => {
											jqccs.jsonEditWindow("CU/EU Editor", edit_templ, editobj, jchaos.cuSave, null, function (ok) {
												jqccs.instantMessage("CU/EU saved " + selected_node, " OK", 2000, true);

											}, function (bad) {
												jqccs.instantMessage("Error saving CU/EU " + selected_node, JSON.stringify(bad), 2000, false);

											});
										});

									}
								});
								return;
							}
						};
						items['copy'] = {
							"separator_before": false,
							"separator_after": false,
							label: "Copy",
							action: function () {
								jchaos.node(selected_node, "get", "cu", function (data) {
									if (data != null) {
										cu_copied = data;
										jqccs.instantMessage("CU/EU copied " + selected_node, " OK", 2000, true);

										copyToClipboard(JSON.stringify(data));
									}
								});
							}
						};

						items['save'] = {
							"separator_before": false,
							"separator_after": false,
							label: "Save locally",
							action: function () {
								jchaos.node(selected_node, "get", "cu", function (data) {
									if (data != null) {
										if (data instanceof Object) {
											var tmp = { cu_desc: data };
											var blob = new Blob([JSON.stringify(tmp)], { type: "json;charset=utf-8" });
											saveAs(blob, selected_node + ".json");
										}
									}
								});
							}
						};
						if (what == "byzone") {
							items['updateSynPos'] = {
								"separator_before": true,
								"separator_after": false,
								label: "Update Synoptic position",
								action: function () {

								}
							};
						}


					} else if (type == "nt_agent") {
						items['edit'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Edit Agent",
							action: function () {
								var templ = {
									$ref: "agent.json",
									format: "tabs"
								}

								jchaos.node(selected_node, "info", "agent", function (data) {
									if (data != null) {
										// editorFn = agentSave;
										//jsonEdit(templ, data);
										var opt={'node_selected':selected_node};
										jqccs.jsonEditWindow("Agent Editor", templ, data, jchaos.agentSave, opt,
											() => {
												jqccs.instantMessage("Agent saved " + selected_node, " OK", 2000, true);

											}, (bad) => {
												jqccs.instantMessage("Agent  " + selected_node, "Save Error:" + JSON.stringify(bad), 4000, false);

											}
										);

									}
								});
							}
						};
						items['new-us'] = {
							"separator_before": true,
							"separator_after": false,
							label: "New US",
							action: function () {
								var templ = {
                    				$ref: "us.json",
                    				format: "tabs"
                				}
								jqccs.jsonEditWindow("US Editor", templ, null, jchaos.unitServerSave, null, function (ok) {
									jchaos.agentAssociateNode(selected_node,ok['ndk_uid'],"","UnitServer",okk=>{
										jqccs.instantMessage("Unit server save ", " OK", 2000, true);
										var newnode = {
											"id": jchaos.encodeName(ok.ndk_uid),
											"parent": ID,
											"icon": "/img/devices/nt_unit_server.png",
											"text": ok.ndk_uid,
											"data": ok
										};
										tree.create_node(node, newnode);

									},(badd)=>{
										jqccs.instantMessage("Unit Server Association Failed:", JSON.stringify(badd), 4000, false);

									}), function (bad) {
										jqccs.instantMessage("Unit creation server failed:", JSON.stringify(bad), 4000, false);
									}

								});
							}
						};

					} else if (type == "nt_unit_server") {
						items['edit'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Edit US",
							action: function () {
								var templ = {
									$ref: "us.json",
									format: "tabs"
								}

								jchaos.node(selected_node, "get", "us", function (data) {
									if (data.hasOwnProperty("us_desc")) {
										//    editorFn = unitServerSave;
										//    jsonEdit(templ, data.us_desc);
										jqccs.jsonEditWindow("US Editor", templ, data.us_desc, jchaos.unitServerSave, null, function (ok) {
											jqccs.instantMessage("Unit server save ", " OK", 2000, true);

										}, function (bad) {
											jqccs.instantMessage("Unit server failed", "Error:" + JSON.stringify(bad), 4000, false);

										});

									}
								});
							}
						}
					}
					items['delete'] = {
						"separator_before": true,
						"separator_after": false,
						label: "Delete Node",
						action: function (obj) {
							jqccs.confirm("Delete Node", "Your are deleting : " + selected_node, "Ok", function () {
								jchaos.node(selected_node, "deletenode", "all", function () {
									jqccs.instantMessage("Node deleted " + selected_node, " OK", 2000, true);
									tree.delete_node(node);

								}, function (err) {
									jqccs.instantMessage("cannot delete " + selected_node, JSON.stringify(err), 2000, false);

								});
							}, "Cancel");

						}
					};
					items['updateView'] = {
						"separator_before": true,
						"separator_after": false,
						label: "Update State",
						action: function () { updateDescView(node.data); }
					};
					if (node.data.ndk_parent !== undefined && (node.data.ndk_parent != "")) {
						items['start'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Start",
							action: function () {
								jchaos.node(node.data.ndk_uid, "start", "us", function () {

									jqccs.instantMessage(node.data.ndk_uid, "Starting on  " + node.data.ndk_parent, 2000, true);

									jchaos.node(node.data.ndk_parent, "desc", "agent", function (data) {
										console.log("->" + JSON.stringify(data));
										var server = "";
										if (data.ndk_host_name !== undefined) {
											server = data.ndk_host_name;
										} else if (data.ndk_rpc_addr !== undefined) {
											server = data.ndk_rpc_addr;
											server.replace(/:\d+/g, '');
										}
										var uid = "";
										data.andk_node_associated.forEach(ele => {
											if (ele.ndk_uid == node.data.ndk_uid) {
												uid = ele.association_uid;
											}
										});
										if (uid != "") {
											jqccs.getConsole(node.data.ndk_uid + " on " + server, uid, server + ":" + data.ndk_rest_port, 2, 1, 1000);
										} else {
											jqccs.instantMessage(node.data.ndk_uid, "Cannot open console, uid not found for " + node.data.ndk_uid, 4000, false);

										}
									});


								}, function (bad) {
									jqccs.instantMessage(node.data.ndk_uid, "Error Starting on " + node.data.ndk_parent + " error: " + JSON.stringify(bad), 4000, false);
								});

							}
						};
						items['stop'] = {
							"separator_before": false,
							"separator_after": false,
							label: "Stop",
							action: function () {
								jchaos.node(node.data.ndk_uid, "stop", "us", function () {
									jqccs.instantMessage(node.data.ndk_uid, "Stopping on  " + node.data.ndk_parent, 2000, true);
								}, function (bad) {
									jqccs.instantMessage(node.data.ndk_uid, "Error Stopping on " + node.data.ndk_parent + " error: " + JSON.stringify(bad), 4000, false);
								});
							}
						};
					}
					items['shutdown'] = {
						"separator_before": true,
						"separator_after": false,
						label: "Shutdown Node and all siblings",
						action: function () {
							var typ = jchaos.nodeTypeToHuman(type);

							jqccs.confirm("Do you want to IMMEDIATELY SHUTDOWN " + typ + " " + selected_node, "Pay attention all children and siblings will be killed as well", "Kill",
								function () {
									jchaos.node(selected_node, "shutdown", typ, function () {
										jqccs.instantMessage("SHUTDOWN NODE", "Killing " + selected_node + "", 1000, true);
									}, function () {
										jqccs.instantMessage("SHUTDOWN NODE ", "Killing " + selected_node + "", 4000, false);
									}, function () {
										// handle error ok
									})
								}, "Joke",
								function () { });
						}
					}


				}
			}
			return items;
		}
		function updateDescView(node_data) {
			if ((node_data != null)) {
				if (node_data.hasOwnProperty("ndk_uid")) {
					var ndk_uid = node_data.ndk_uid;
					if (node_data.hasOwnProperty("zone") && synoptic.hasOwnProperty(node_data.zone) && synoptic[node_data.zone].hasOwnProperty(ndk_uid)) {
						var x = 0, y = 0, r = 0;
						var obj = synoptic[node_data.zone].ndk_uid;
						if (obj.hasOwnProperty("x")) {
							x = obj['x'];
						}
						if (obj.hasOwnProperty("y")) {
							y = obj['y'];
						}
						if (obj.hasOwnProperty("r")) {
							r = obj['r'];
						}
						$("#svg_img").html('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" stroke="black" stroke-width="3" fill="green"/>');

					}
					jchaos.getChannel(ndk_uid, 255, function (bruninfo) {
						var healt = bruninfo[0].health;
						if (healt.dpck_ats !== undefined) {
							jchaos.command(ndk_uid, { "act_name": "getBuildInfo", "act_domain": "system", "direct": true }, function (bi) {
								//console.log(ndk_uid+" Build:"+JSON.stringify(bi));
								//node_data = Object.assign(bi, node_data);
								node_data = Object.assign({}, { build: bi }, { state: bruninfo[0] }, { info: node_data });


								$('#desc_view').html(jqccs.json2html(node_data));
								jqccs.jsonSetup($('#desc_view'), function (e) {
								});
								$('#desc_view').find('a.json-toggle').click();




							}, bad => {
								// no build info
								//node_data = Object.assign(bi, node_data);
								node_data = Object.assign({}, { state: bruninfo[0] }, { info: node_data });
								$('#desc_view').html(jqccs.json2html(node_data));
								jqccs.jsonSetup($('#desc_view'), function (e) {
								});
								$('#desc_view').find('a.json-toggle').click();

							})
						} else {
							node_data = Object.assign({}, { state: bruninfo[0] }, { info: node_data });
							$('#desc_view').html(jqccs.json2html(node_data));
							jqccs.jsonSetup($('#desc_view'), function (e) {
							});
							$('#desc_view').find('a.json-toggle').click();
						}
					});

				} else if (node_data.hasOwnProperty("zone")) {

					$('#desc_view').html(node_data.zone);
					var name = jchaos.encodeName(node_data.zone);
					$('#zone_image').attr('src', '/img/zone/' + name + ".png");

					/*	$.ajax({
							type: "GET",
							url: '/img/zone/' + name+".png",
							dataType: "image/jpg",
							success: function (data) {
								$('#zone_image').attr('src', data);
							}
						});*/
				}

			}
		}
		function addListeners() {

			$('#hier_view').on('move_node.jstree', function (e, data) {
				var i, j, r = [];
				var node_data = data.instance.get_node(data.selected[0]).data;
				console("Moving " + JSON.stringify(e));
				/*
				for (i = 0, j = data.selected.length; i < j; i++) {
					var node_data=data.instance.get_node(data.selected[i]).data;
					if(node_data.hasOwnProperty("ndk_uid")){
						var ndk_uid=node_data.ndk_uid;
						jchaos.command(ndk_uid,{"act_name":"getBuildInfo","act_domain":"system","direct":true}, function (bi) {
							console.log(ndk_uid+" Build:"+JSON.stringify(bi));
							node_data['build']=bi;
							r.push(node_data);

						});

					}
				}
				$('#desc_view').html(jqccs.json2html(r));*/
			});
			$('#hier_view').on('select_node.jstree', function (e, data) {
				var i, j, r = [];
				var node_data = data.instance.get_node(data.selected[0]).data;

				updateDescView(node_data);
				/*
				for (i = 0, j = data.selected.length; i < j; i++) {
					var node_data=data.instance.get_node(data.selected[i]).data;
					if(node_data.hasOwnProperty("ndk_uid")){
						var ndk_uid=node_data.ndk_uid;
						jchaos.command(ndk_uid,{"act_name":"getBuildInfo","act_domain":"system","direct":true}, function (bi) {
							console.log(ndk_uid+" Build:"+JSON.stringify(bi));
							node_data['build']=bi;
							r.push(node_data);

						});

					}
				}
				$('#desc_view').html(jqccs.json2html(r));*/
			});
			$("body").removeClass("loading");
		}
		//$('#hier_view').jstree({ 'plugins': ["contextmenu"] });
		/*	$('#hier_view').jstree({
				"core": {
					"animation": 0,
					"check_callback": true,
					"themes": { "stripes": true },
					'data': [
						{ "id": "ajson1", "parent": "#", "text": "Simple root node" },
						{ "id": "ajson2", "parent": "#", "text": "Root node 2" },
						{ "id": "ajson3", "parent": "ajson2", "text": "Child 1" },
						{ "id": "ajson4", "parent": "ajson2", "text": "Child 2" },
					]
				},
				"plugins": [
					"contextmenu", "dnd", "search"
				],
				"contextmenu":{
					"items":{
						"rename": {
							// The item label
							"label": "Rename",
							// The function to execute upon a click
							"action": function (obj) { this.rename(obj); },
							// All below are optional 
							"_disabled": true,		// clicking the item won't do a thing
							"_class": "class",	// class is applied to the item LI node
							"separator_before": false,	// Insert a separator before the item
							"separator_after": true,		// Insert a separator after the item
							// false or string - if does not contain `/` - used as classname
							"icon": false,
							"submenu": {
							}
						},
						"pippolo": {
							// The item label
							"label": "Pippolone",
							// The function to execute upon a click
							"action": function (obj) { this.rename(obj); },
							// All below are optional 
							"_disabled": true,		// clicking the item won't do a thing
							"_class": "class",	// class is applied to the item LI node
							"separator_before": false,	// Insert a separator before the item
							"separator_after": true,		// Insert a separator after the item
							// false or string - if does not contain `/` - used as classname
							"icon": false,
							"submenu": {
							}
						}
					
					}
				}
	
			});*/

		/*	$.jstree.defaults.core.plugins = ["contextmenu"];
			$.jstree.defaults.contextmenu.items = {
				// Some key
				"rename": {
					// The item label
					"label": "Rename",
					// The function to execute upon a click
					"action": function (obj) { this.rename(obj); },
					// All below are optional 
					"_disabled": true,		// clicking the item won't do a thing
					"_class": "class",	// class is applied to the item LI node
					"separator_before": false,	// Insert a separator before the item
					"separator_after": true,		// Insert a separator after the item
					// false or string - if does not contain `/` - used as classname
					"icon": false,
					"submenu": {
					}
				}
			}
	*/
		function updateJST(what, search, alive) {
			cu_copied = null;
			$("body").addClass("loading");
			$('#hier_view').jstree("destroy");

			if (what == "byzone") {
				createJSTreeByZone(search, (alive == "true"), (ds) => {
					$('#hier_view').jstree({
						"plugins": ["dnd", "contextmenu"],
						"contextmenu": {
							'items': (node) => {
								return addMenuItems(node, what);

							}, "select_node": true, "show_at_node": false
						},

						'core': {
							'data': ds, "multiple": true,
							"animation": 0,
							"check_callback": true,


						}
					});
					//$('#hier_view').jstree('load_node',ds);
					addListeners();

				});
			} else if (what == "byserver") {
				createJSTreeByServer(search, (alive == "true"), (ds) => {
					$('#hier_view').jstree({
						'core': {
							'data': ds, "multiple": true,
							"animation": 0
						}, 'plugins': ["contextmenu"],
						"contextmenu": {
							'items': (node) => {
								return addMenuItems(node, what);

							}, "select_node": true, "show_at_node": false
						},
					});
					//$('#hier_view').jstree('load_node',ds);

					addListeners();

				});

			} else if (what == "bydevice") {
				createJSTreeByDevice(search, (alive == "true"), (ds) => {
					$('#hier_view').jstree({
						'core': {
							'data': ds, "multiple": true,
							"animation": 0
						}, 'plugins': ["contextmenu"],
						"contextmenu": {
							'items': (node) => {
								return addMenuItems(node, what);

							}, "select_node": true, "show_at_node": false
						},
					});
					//$('#hier_view').jstree('load_node',ds);

					addListeners();
				});
			}

		}
		function insertIfnotExist(data, name, obj) {
			var exist = data.filter((elem) => { return (elem.id == name); });
			if ((exist instanceof Array) && exist.length == 0) {
				data.push(obj);
			}
		}
		function createJSTreeByServer(filter, alive, handler) {
			var jsree_data = [];
			var node_created = {};
			var roots = jchaos.search(filter, "root", alive);

			jchaos.search(filter,"us",alive,(uslist)=>{
				var nodes = uslist.concat(roots);
				jchaos.node(nodes, "get", "us", (descl) => {
					descl.forEach((desc)=>{
					var icon_name = "";
					var parent="#";
					if(desc.ndk_type !== undefined){
						icon_name = "/img/devices/" + desc.ndk_type + ".png";
					}
					if(desc.ndk_parent !== undefined){
						parent=jchaos.encodeName(desc.ndk_parent);
						if (!node_created.hasOwnProperty(parent)) {
							var ext_par = jchaos.node(desc.ndk_parent, "desc", "all");

							var iname = "/img/devices/" + ext_par.ndk_type + ".png";

							var node = {
								"id": parent,
								"parent": "#",
								"icon": iname,
								"text": desc.ndk_parent,
								"data": ext_par
							};
								jsree_data.push(node);
								node_created[parent] = true;

							}
					} 
					if(desc.ndk_uid !== undefined){
						var idname=jchaos.encodeName(desc.ndk_uid);
						if (!node_created.hasOwnProperty(idname)) {

							var node = {
										"id": idname,
										"parent": jchaos.encodeName(parent),
										"icon": icon_name,
										"text": desc.ndk_uid,
										"data": desc
									};
							
							jsree_data.push(node);
							node_created[idname] = true;
						}
				}
					if(desc.hasOwnProperty('us_desc') && (desc.us_desc['cu_desc'] instanceof Array)){
						var list=desc.us_desc.cu_desc;
						list.forEach(cu=>{
							var name=cu.ndk_uid;
							var regex = /(.*)\/(.*)\/(.*)$/;
							var match = regex.exec(name);
							var icon_name = "";
							if ((match != null) && (typeof match[2] !== "undefined")) {
								icon_name = "/img/devices/" + match[2] + ".png";
								cu["zone"]=match[1];
								cu["group"]=match[2];
							}
							var idname = jchaos.encodeName(name);
							
							var node = {
								"id": idname,
								"parent": jchaos.encodeName(cu.ndk_parent),
								"icon": icon_name,
								"text": name,
								"data": cu
							};
							if (!node_created.hasOwnProperty(idname)) {
								jsree_data.push(node);
								node_created[idname] = true;
							}
						});
					}
					
				});
				if (typeof handler === "function") {
						handler(jsree_data);
					}
				},()=>{
					if (typeof handler === "function") {
				handler(jsree_data);
					}
				});
			},()=>{
					if (typeof handler === "function") {
				handler(jsree_data);
					}
				});
			/*jchaos.search(filter, "cu", alive, (culist) => {
				var roots = jchaos.search(filter, "root", alive);
				if ((roots instanceof Array) && (roots.length > 0)) {
					culist = culist.concat(roots);
				}
				if ((culist.length==0)&&(typeof handler === "function")) {
					handler(jsree_data);
				}
				jchaos.node(culist, "desc", "all", (desc) => {
					culist.forEach((elem, index) => {
						var regex = /(.*)\/(.*)\/(.*)$/;
						var match = regex.exec(elem);
						var icon_name = "";

						if ((match != null) && (typeof match[2] !== "undefined")) {
							icon_name = "/img/devices/" + match[2] + ".png";
						}
						//	console.log(desc[index].ndk_uid + " =>"+desc[index].ndk_type);

						if (desc[index].ndk_type !== undefined && desc[index].ndk_type == "nt_root") {
							icon_name = "/img/devices/nt_root.png";

						}
						var next_parent = "#";
						var parent = "";
						if (desc[index].hasOwnProperty("ndk_parent")) {
							parent = desc[index].ndk_parent;
						} else if (desc[index].hasOwnProperty("instance_description") && desc[index].instance_description.hasOwnProperty("ndk_parent")) {
							parent = desc[index].instance_description.ndk_parent;

						}
						if (parent != "") {
							var idname = jchaos.encodeName(elem);

							var node = {
								"id": idname,
								"parent": jchaos.encodeName(parent),
								"icon": icon_name,
								"text": elem,
								"data": desc[index]
							};
							if (!node_created.hasOwnProperty(idname)) {
								jsree_data.push(node);
								node_created[idname] = true;
								//	console.log("Adding :" + JSON.stringify(node));

							}
							var parentid = jchaos.encodeName(parent);

							if (!node_created.hasOwnProperty(parentid)) {
								var icon_name_parent = "";

								var next_next_par = jchaos.node(parent, "desc", "all");
								if (next_next_par != null) {
									if (next_next_par.hasOwnProperty("ndk_type")) {
										icon_name_parent = "/img/devices/" + next_next_par.ndk_type + ".png";
									}
									if (next_next_par.hasOwnProperty("ndk_parent") && (next_next_par.ndk_parent != "")) {
										var idname = jchaos.encodeName(next_next_par.ndk_parent);

										var icon_par_parent = "";
										var node = {
											"id": idname,
											"parent": "#",
											"icon": icon_par_parent,
											"text": next_next_par.ndk_parent,
											"data": next_next_par
										};
										var par = jchaos.node(next_next_par.ndk_parent, "desc", "all");
										if ((par != null)) {
											node['data'] = par;
											if (par.hasOwnProperty("ndk_type")) {
												icon_par_parent = "/img/devices/" + par.ndk_type + ".png";
												node['icon'] = icon_par_parent;
											}
										}


										if (!node_created.hasOwnProperty(idname)) {
											jsree_data.push(node);
											node_created[idname] = true;
										}
										node = {
											"id": parentid,
											"parent": idname,
											"icon": icon_name_parent,
											"text": parent,
											"data": next_next_par
										};

										jsree_data.push(node);
										node_created[parentid] = true;


									} else {

										var node = {
											"id": parentid,
											"parent": "#",
											"icon": icon_name_parent,
											"text": parent,
											"data": next_next_par
										};
										jsree_data.push(node);
										node_created[parentid] = true;

									}
								}

							}

						}

					});
					if (typeof handler === "function") {
						handler(jsree_data);
					}
				},()=>{
					if (typeof handler === "function") {
				handler(jsree_data);
					}
			});

			},()=>{
				if (typeof handler === "function") {
				handler(jsree_data);
				}
			});
*/

		}
		function createJSTreeByZone(filter, alive, handler) {
			var jsree_data = [];
			var node_created = {};
			jchaos.search(filter, "cu", alive, (culist) => {
				var roots = jchaos.search(filter, "root", alive);
				if ((roots instanceof Array) && (roots.length > 0)) {
					culist = culist.concat(roots);
				}
				if ((culist.length==0)&&(typeof handler === "function")) {
					handler(jsree_data);
				}
				culist.forEach((elem) => {
					//	var desc = jchaos.getDesc(elem, null);
					var decoded = jchaos.pathToZoneGroupId(elem);
					if (decoded != null) {
						var zone = decoded.zone;
						var group = decoded.group;
						var filename = zone.split("/");
						var next_parent = "";
						if (filename.length > 0) {
							next_parent = filename[filename.length - 1];
						}
						var desc = "";
						desc = jchaos.node(elem, "desc", "all");
						var uname = jchaos.encodeName(elem);
						if (desc.seq !== undefined) {
							uname = uname + "_" + desc.seq;
						}
						var zone = "";
						var implementation = "";
						if (desc.instance_description !== undefined && desc.instance_description.control_unit_implementation !== undefined) {
							implementation = desc.instance_description.control_unit_implementation;
						}
						filename.forEach((p, index) => {
							var node = {};
							if (index == 0) {
								node = { "id": p, "icon": "", "parent": "#", "text": p };
								zone = p;
							} else {
								zone = zone + "/" + p;
								node = { "id": p, "icon": "", "parent": filename[index - 1], "text": p };
							}
							if (desc.hasOwnProperty("instance_description") && desc.instance_description.hasOwnProperty("ndk_parent") && (desc.ndk_parent == next_parent)) {
								var parent_desc = jchaos.node(next_parent, "desc", "all");
								node['data'] = parent_desc;
								if (parent_desc.hasOwnProperty("ndk_type")) {
									node['icon'] = "/img/devices/" + parent_desc.ndk_type + ".png";
								}
							} else {

								node['data'] = { "zone": zone }
							}
							if (!node_created.hasOwnProperty(p)) {
								jsree_data.push(node);
								node_created[p] = true;
							}


						});
						var node_name = decoded.id;
						desc['zone'] = decoded.zone;
						desc['group'] = decoded.group;


						//var desc = jchaos.getDesc(elem, null);
						var icon_name = "/img/devices/" + desc['group'] + ".png";

						var node = {
							"id": uname,
							"parent": next_parent,
							"icon": icon_name,
							"text": node_name,
							"data": desc
						};
						jsree_data.push(node);
					}

				});
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			});
		}
		function createJSTreeByDevice(filter, alive, handler) {
			var jsree_data = [];
			var node_created = {};
			jchaos.search(filter, "cu", alive, (culist) => {
				var roots = jchaos.search(filter, "root", alive);
				if ((roots instanceof Array) && (roots.length > 0)) {
					culist = culist.concat(roots);
				}
				if ((culist.length==0)&&(typeof handler === "function")) {
					handler(jsree_data);
				}
				jchaos.node(culist, "desc", "all", (desc) => {


					culist.forEach((elem, index) => {

						var regex = /(.*)\/(.*)\/(.*)$/;
						var match = regex.exec(elem);
						if (match != null) {
							var device = match[2];
							var icon_name;
							if ((desc[index].ndk_type !== undefined) && (desc[index].ndk_type == "nt_root")) {
								icon_name = "/img/devices/nt_root.png";

							} else {
								icon_name = "/img/devices/" + device + ".png";
							}
							var node = {
								"id": device,
								"parent": "#",
								"icon": icon_name,
								"text": device,
								"data": null
							};
							if (!node_created.hasOwnProperty(device)) {

								jsree_data.push(node);
								node_created[device] = true;
							}
							//var desc = jchaos.getDesc(elem, null);
							var node = {
								"id": jchaos.encodeName(elem),
								"parent": device,
								"icon": icon_name,
								"text": elem,
								"data": desc[index]
							};
							jsree_data.push(node);
						}

					});
					if (typeof handler === "function") {
						handler(jsree_data);
					}
				});
			});
		}

		$("#View").on('change', (e) => {

			var search = $("#search-chaos").val();
			var alive = $("input[type=radio][name=search-alive]:checked").val();
			updateJST($("#View").val(), search, alive);


		});
		$("#search-chaos").keypress(function (e) {
			if (e.keyCode == 13) {
				var search = $("#search-chaos").val();
				var alive = $("input[type=radio][name=search-alive]:checked").val()
				updateJST($("#View").val(), search, alive);

				//$('#hier_view').jstree('load_node',ds);
			}

		});

		$("input[type=radio][name=search-alive]").change(function (e) {
			var search = $("#search-chaos").val();
			var alive = $("input[type=radio][name=search-alive]:checked").val()
			updateJST($("#View").val(), search, alive);

		});
		$("input[type=radio][name=search-alive]").trigger("change");

	</script>


</body>

</html>