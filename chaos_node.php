<!-- <!DOCTYPE HTML>
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
				<option value="bydevice">By Type</option>
				<option value="byserver">By Server</option>
			</select>
		</div>

		<div class="statbox purple col-md-3">

			<div class="row align-items-center">
				<div class="col-sm">
					<label for="search-alive">All</label><input class="input-xlarge" id="search-alive-false"
						title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>
				</div>
				<div class="col-sm">
					<label for="search-alive">Alive</label><input class="input-xlarge" id="search-alive-true"
						title="Search just alive nodes" name="search-alive" type="radio" value=true checked>
				</div>
				<div class="col-sm">
					<label for="search-chaos">Search</label>
					<input class="input-xlarge focused" id="search-chaos" title="Free form Search" type="text" value="">
				</div>
			</div>


		</div>
	</div>
	<div class="box-content">

		<div class="box row">
			<div id="hier_view" class="col-md-3"></div>
			<div class="wait_modal"></div>
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
	var node_list = [];
	var node_state = {};
	var node_old_state = {};

	jchaos.variable("synoptic", "get", (ok) => {
		synoptic = ok;
	}, (bad) => {
		console.error("error:" + JSON.stringify(bad));

	});
	setInterval(function () {
		var now = (new Date()).getTime();
		if (node_list.length > 0) {
			node_list.forEach((d) => {
				var iname = jchaos.encodeName(d);


			});
			jchaos.getChannel(node_list, 255, function (run_info) {

				run_info.forEach((elem, index) => {
					var isalive = false;

					if ((elem.health !== undefined) && (elem.health.ndk_uid !== undefined)) {
						var healt = elem.health;
						var uid = healt.ndk_uid;
						elem['lives'] = false;

						node_state[uid] = elem;
						var iname = jchaos.encodeName(uid);

						if ((healt.dpck_ats !== undefined)) {
							
							if ((Math.abs(healt.dpck_ats - now) < 10000)) {
								isalive = true;
							} else if (node_old_state[uid] !== undefined && node_state[uid] !== undefined) {
								if (node_state[uid].health.dpck_ats !== undefined && node_old_state[uid].health.dpck_ats !== undefined) {
									if (node_state[uid].health.dpck_ats > node_old_state[uid].health.dpck_ats) {
										isalive = true;
									}

								} 

								
							}
							node_old_state[uid] = node_state[uid];

							
							if (isalive) {
								if (!$("#" + iname).hasClass("text-success")) {
									removeTextClasses(iname);
									$("#" + iname).addClass("text-success");
								}
								elem['lives'] = true;

								node_state[uid]['lives'] = true;
							} else {
								if (!$("#" + iname).hasClass("text-muted")) {
									removeTextClasses(iname);

									$("#" + iname).addClass("text-muted");
								}

							}
							if (healt.hasOwnProperty("nh_status")) {
								var title = uid + ":" + new Date(healt.dpck_ats).toLocaleString() + " Status:'" + healt.nh_status + "' Uptime:'" + jchaos.toHHMMSS(healt.nh_upt);
								if (healt.nh_status == 'Fatal Error') {
									if (healt.hasOwnProperty("nh_lem") && healt.nh_lem != "") {
										title += ", Error message:" + healt.nh_lem;
									}
									if ((healt.nh_led !== undefined) && (healt.nh_led != "")) {
										title += ", in :" + healt.nh_led;

									}
									if ((elem['lives']) && (!$("#" + iname).hasClass("text-danger"))) {
										removeTextClasses(iname);

										$("#" + iname).addClass("text-danger");
									}

								} else if ((elem['lives']) && (healt.nh_status != 'Start')) {
									removeTextClasses(iname);

									$("#" + iname).addClass("text-warning");
								}
								$("#" + iname).attr('title', title);

							}
						} else {
							removeTextClasses(iname);

						}

					} else {
						var uid = node_list[index];
						var iname = jchaos.encodeName(uid);
						removeTextClasses(iname);
						$("#" + iname).addClass("text-dark");
						$("#" + iname).attr('title', uid + ": DEAD no info");


					}
				});

			});
		}
	}, 5000);


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
						if(list_us.length>0){
							templ['properties']['ndk_parent'].enum = list_us;
						} else {
							
							templ['properties']['ndk_parent']= {
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

						if (impl != "") {
							list_impl.push(impl);
							if ((cudb[impl] !== undefined) && (cudb[impl].info !== undefined)) {
								//templ['properties']['group'].enum = cudb[impl].group;
								glist=cudb[impl].group;
							}
						} else {
							for (var k in cudb) {
								if (cudb[k].info !== undefined) {
									if (cudb[k].info.group !== undefined) {
										glist = glist.concat(cudb[k].info.group);
									}
								}

							}
					//		templ['properties']['group'].enum = glist;

						}
						if(glist.length>0){
							templ['properties']['group']=glist;
						} else {
							templ['properties']['group']= {
								"type": "string",
								"format": "text",
								"required": true,
								"description": "CU Group"

							};
						}
						for (var k in cudb) {
							if (k != impl) {
								list_impl.push(k);
							}
						}
						if ((ob.ndk_uid !==undefined) && (typeof ob.ndk_uid == "string")) {
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
						if(list_impl.size>0){
							templ['properties']['control_unit_implementation'].enum = list_impl;
						} else {
							templ['properties']['control_unit_implementation']= {
								"type": "string",
								"format": "text",
								"required": true,
								"description": "CU C++ implementation"

							};
						}
						var drv_impl = obj.cudk_driver_description;
						var list_drivers = [];

						/*	if ((drv_impl !== undefined) && (drv_impl.length)) {
								drv_impl.forEach((d) => {
									list_drivers.push(d.cudk_driver_description_name);
								});
								// return just the drivers that are supported
	
	
							}*/
						if ((impl != "") && (cudb[impl] !== undefined) && (cudb[impl].drivers !== undefined)) {
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
						if (list_drivers.length > 0) {
							templ['properties']['cudk_driver_description']['items']['properties']['cudk_driver_description_name'].enum = list_drivers;
						} else {
							delete templ['properties']['cudk_driver_description']['items']['properties']['cudk_driver_description_name']['enum'];
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
		var menu_str="";
		if (node.hasOwnProperty("data")) {
			if(node.data.hasOwnProperty("ndk_type")&&(node.data.ndk_type == "nt_agent")){
					menu_str="associated";
			}
			items['new-us'] = {
						"separator_before": true,
						"separator_after": false,
						label: "New "+menu_str+" US ",
						action: function () {
							var templ = {
								$ref: "us.json",
								format: "tabs"
							}
							jqccs.jsonEditWindow("US Editor", templ, null, jchaos.unitServerSave, null, function (ok) {
								if((node.data.ndk_type == "nt_agent")){

								jchaos.agentAssociateNode(selected_node, ok['ndk_uid'], "", "UnitServer", okk => {
									jqccs.instantMessage("Unit server created and associated ", " OK", 2000, true);
									

								}, (badd) => {
									jqccs.instantMessage("Unit Server Association Failed:", JSON.stringify(badd), 4000, false);

								});
							}
							var newnode = {
										"id": jchaos.encodeName(ok.ndk_uid),
										"parent": ID,
										"icon": "/img/devices/nt_unit_server.png",
										"text": ok.ndk_uid,
										"data": ok
									};
									tree.create_node(node, newnode);
								}, function (bad) {
									jqccs.instantMessage("Unit creation server failed:", JSON.stringify(bad), 4000, false);
								}

							);
						}
					};
			if (node.data.hasOwnProperty('zone') || (node.data.ndk_type == "nt_unit_server")) {
				if(node.data.hasOwnProperty("ndk_type")&&(node.data.ndk_type == "nt_unit_server")){
					menu_str="Add ";
				}
				
				items['new-cu'] = {
					"separator_before": false,
					"separator_after": false,
					label: menu_str+"New CU",
					action: function () {
						var cu = {};
						//cu["ndk_uid"] = node.data["zone"] + "/MYGROUP/NewName" + (new Date()).getTime();
						cu['id'] = "<MY ID>";
						if ((node.data.ndk_type == "nt_unit_server")) {
							cu['ndk_parent'] = node.data.ndk_uid;
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
					if ((cu_copied.ndk_type == "nt_control_unit") && (node.data.ndk_type == "nt_unit_server")) {
						items['paste'] = {
							"separator_before": false,
							"separator_after": false,
							label: "Paste " + cu_copied.ndk_uid + " in " + node.data.ndk_uid,
							action: function () {

								var cu = Object.assign({}, cu_copied);
								var decoded = jchaos.pathToZoneGroupId(cu.ndk_uid);
								var zone;
								cu['ndk_parent'] = node.data.ndk_uid;

								if (node.data.zone !== undefined) {
									zone = node.data.zone;
								} else {
									zone = decoded['zone'];
								}

								if (decoded) {
									cu["ndk_uid"] = zone + "/" + decoded["group"] + "/" + decoded['id'] + (new Date()).getTime();

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
			}

			if (node.data.hasOwnProperty("ndk_type") && node.data.hasOwnProperty("ndk_uid")) {
				var selected_node = node.data.ndk_uid;
				var type = node.data.ndk_type;

				if((type == "nt_control_unit")&&node.data.hasOwnProperty('instance_description') && (node.data.instance_description.hasOwnProperty('control_unit_implementation'))){
					items['control'] = {
						"separator_before": true,
						"separator_after": true,
						label: "Control..",
						action: function () {
							var opt={
								node_selected:selected_node,
								elems:[selected_node],
								node_multi_selected:[selected_node],
								template:jchaos.encodeName(selected_node),
								check_interval: 5000

							};
							jqccs.openControl("Control "+selected_node,opt,node.data.instance_description.control_unit_implementation,1000);
							return;
						}
					};
				}
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
									if (type == "nt_root") {
										jqccs.instantMessage("Copied EU " + selected_node, " you can paste it into an AGENT", 4000, true);

									} else {
										jqccs.instantMessage("Copied CU " + selected_node, " you can paste it into an US", 4000, true);
									}

									copyToClipboard(JSON.stringify(data));
								}
							});
						}
					};

					items['save'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Download Config",
						action: function () {
							jchaos.node(selected_node, "get", "cu", function (data) {
								if (data != null) {
									if (data instanceof Object) {
										//var tmp = { cu_desc: data };
										var blob = new Blob([JSON.stringify(data)], { type: "json;charset=utf-8" });
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
									var opt = { 'node_selected': selected_node };
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
					
					if ((cu_copied != null) && (typeof cu_copied === "object")) {
						if (cu_copied.ndk_type == "nt_root") {
							items['paste-root'] = {
								"separator_before": false,
								"separator_after": false,
								label: "Paste EU " + cu_copied.ndk_uid + " in Agent " + selected_node,
								action: function () {
									$.get('eu_write_mask.json', function (templ) {

										var eu = JSON.parse(JSON.stringify(cu_copied));
										var decoded = jchaos.pathToZoneGroupId(cu_copied.ndk_uid);

										var ll = [];
										delete templ['properties']['group']['enum'];
										ll = jchaos.storage2List(eu.dsndk_storage_type);
										eu['zone'] = decoded.zone;
										eu['group'] = decoded.group;
										eu['id'] = decoded.id + "_TOCHANGE_" + (new Date()).getTime();

										if (ll.length > 0) {
											eu.dsndk_storage_type = ll
										} else {
											eu['dsndk_storage_type'] = ["Live"];
										}

										templ['properties']['ndk_parent'] = selected_node;

										jqccs.jsonEditWindow("EU Editor", templ, eu, jchaos.cuSave, null, (ok) => {
											jqccs.instantMessage("Created ", "OK", 2000, true);

										}, (bad) => {
											alert(" Cannot create node err:" + JSON.stringify(bad));
										});
									});

								}
							}
						}
					}

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
								if (node.data.hasOwnProperty('ndk_parent') && node.data.ndk_parent != "") {
									jchaos.node(node.data.ndk_parent, "desc", "all", (pd) => {
										if (pd.ndk_type == "nt_agent") {
											jchaos.node(node.data.ndk_parent, "del", "agent", selected_node, function (daa) {
												instantMessage("Removed association " + selected_node, " OK", 2000, true);

											});
										}
									}, (bad) => { });
								}
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
					action: function () { updateDescView(node); }
				};
				if (node.data.ndk_parent !== undefined && (node.data.ndk_parent != "") && ((node.data.ndk_type == "nt_unit_server" || (node.data.ndk_type == "nt_root")))) {
					if ((!node_state.hasOwnProperty(node.data.ndk_uid)) || (node_state[node.data.ndk_uid]['lives'] == false)) {
						items['start_node'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Start Node(Launch)",
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
					}
					items['stop_node'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Stop Node(Kill)",
						action: function () {
							jchaos.node(node.data.ndk_uid, "stop", "us", function () {
								jqccs.instantMessage(node.data.ndk_uid, "Stopping on  " + node.data.ndk_parent, 2000, true);
							}, function (bad) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Stopping on " + node.data.ndk_parent + " error: " + JSON.stringify(bad), 4000, false);
							});
						}
					};
					items['console'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Remote Console",
						action: function () {
							jqccs.getConsoleByUid("console", node.data.ndk_uid);

						}
					};

				}
				items['shutdown'] = {
					"separator_before": false,
					"separator_after": true,
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
				if (node.data.ndk_type !== undefined && ((node.data.ndk_type == "nt_root") || (node.data.ndk_type == "nt_control_unit"))) {

					items['start'] = {
						"separator_before": true,
						"separator_after": false,
						label: "Start",
						action: function () {
							jchaos.node(node.data.ndk_uid, "start", "cu", function () {
								jqccs.instantMessage(node.data.ndk_uid, "Starting  ", 2000, true);
							}, function (bad) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Starting  error: " + JSON.stringify(bad), 4000, false);
							});
						}
					};
					items['stop'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Stop",
						action: function () {
							jchaos.node(node.data.ndk_uid, "stop", "cu", function () {
								jqccs.instantMessage(node.data.ndk_uid, "Stopping  ", 2000, true);
							}, function (bad) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Stopping  error: " + JSON.stringify(bad), 4000, false);
							});
						}
					};
					items['init'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Init",
						action: function () {
							jchaos.node(node.data.ndk_uid, "init", "cu", function () {

								jqccs.instantMessage(node.data.ndk_uid, "Sending Init ok  " + node.data.ndk_parent, 2000, true);



							}, function (bad) {
								jqccs.instantMessage(node.data.ndk_uid, "Error sending Init ,error: " + JSON.stringify(bad), 4000, false);
							});

						}
					};
					items['deinit'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Deinit",
						action: function () {
							jchaos.node(node.data.ndk_uid, "deinit", "cu", function () {
								jqccs.instantMessage(node.data.ndk_uid, "Deinitializing  ", 2000, true);
							}, function (bad) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Deinitializing  error: " + JSON.stringify(bad), 4000, false);
							});
						}
					};
					items['load'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Load",
						action: function () {
							jchaos.loadUnload(node.data.ndk_uid, true, function (data) {
								jqccs.instantMessage(node.data.ndk_uid, "Loading  ", 2000, true);

							}, function (data) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Loading  error: " + JSON.stringify(bad), 4000, false);

							});

						}
					};
					items['unload'] = {
						"separator_before": false,
						"separator_after": true,
						label: "Unload",
						action: function () {
							jchaos.loadUnload(node.data.ndk_uid, false, function (data) {
								jqccs.instantMessage(node.data.ndk_uid, "Unload  ", 2000, true);

							}, function (data) {
								jqccs.instantMessage(node.data.ndk_uid, "Error Unload  error: " + JSON.stringify(bad), 4000, false);

							});

						}
					};

				}



			}

			if (node.data.hasOwnProperty('group')) {
				items['add-class'] = {
					"separator_before": true,
					"separator_after": false,
					label: "Add new Class/Driver",
					action: function () {
						var templ = {
							$ref: "classdb.json",
							format: "tabs"
						}
						var editobj = {};
						jchaos.variable("cu_catalog", "get", (cudb) => {

							if (node.data.hasOwnProperty('instance_description') && (node.data.instance_description.hasOwnProperty('control_unit_implementation'))) {
								var control_unit_implementation = node.data.instance_description.control_unit_implementation;
								editobj['name'] = control_unit_implementation;

								if (cudb.hasOwnProperty(control_unit_implementation)) {
									if (cudb[control_unit_implementation].info !== undefined) {
										editobj['info'] = cudb[control_unit_implementation].info;
									}
									if (cudb[control_unit_implementation].attrs !== undefined) {
										var alist = [];
										for (var k in cudb[control_unit_implementation].attrs) {
											alist.push(cudb[control_unit_implementation].attrs[k]);
										}
										editobj['attrs'] = alist;
									}
									if (cudb[control_unit_implementation].drivers !== undefined) {
										var drvlist = [];
										for (var k in cudb[control_unit_implementation].drivers) {
											drvlist.push(cudb[control_unit_implementation].drivers[k]);
										}
										editobj['drivers'] = drvlist;
									}

								}
							}
							jqccs.jsonEditWindow("ClassDB Editor", templ, editobj, obj => {
								if (obj.name !== undefined && obj.name != "") {
									var drivers = {};
									var attrs = {};
									obj['drivers'].forEach(elem => {
										drivers[elem.cudk_driver_description_name] = elem;
									});
									obj['attrs'].forEach(elem => {
										attrs[elem.cudk_ds_attr_name] = elem;
									});

									cudb[obj.name] = { 'info': obj['info'], 'attrs': attrs, 'drivers': drivers };
									jchaos.variable("cu_catalog", "set", cudb, (ok) => {
										jqccs.instantMessage("Updated class DB " + obj.name, " OK", 2000, true);

									});


								}
							});
						});
						return;
					}
				};
			}
		}
		return items;
	}
	function updateDescView(node) {
		if ((node != null)) {
			var node_data = node.data;
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
					if ((healt.dpck_ats !== undefined) && ((Math.abs(healt.dpck_ats - (new Date()).getTime())) < 10000)) {
						//$("#"+node.id).addClass("bg-success");
						jchaos.command(ndk_uid, { "act_name": "getBuildInfo", "act_domain": "system", "direct": true }, function (bi) {
							//console.log(ndk_uid+" Build:"+JSON.stringify(bi));
							//node_data = Object.assign(bi, node_data);
							var nd = Object.assign({}, { build: bi }, { state: bruninfo[0] }, { info: node_data });


							$('#desc_view').html(jqccs.json2html(nd));
							jqccs.jsonSetup($('#desc_view'), function (e) {
							});
							$('#desc_view').find('a.json-toggle').click();




						}, bad => {
							// no build info
							//node_data = Object.assign(bi, node_data);
							var nd = Object.assign({}, { state: bruninfo[0] }, { info: node_data });
							$('#desc_view').html(jqccs.json2html(nd));
							jqccs.jsonSetup($('#desc_view'), function (e) {
							});
							$('#desc_view').find('a.json-toggle').click();

						})
					} else {
						$("#" + node.id).removeClass("bg-success");

						//	var td=(Math.abs(healt.dpck_ats-(new Date()).getTime()));
						//	console.log("time diff:"+td);
						var nd = Object.assign({}, { state: bruninfo[0] }, { info: node_data });
						$('#desc_view').html(jqccs.json2html(nd));
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
			} else if (node_data.hasOwnProperty("group")) {
				$('#desc_view').html(node_data.group);

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
			var node_data = data.instance.get_node(data.selected[0]);

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
		//$("body").removeClass("loading");
		jqccs.busyWindow(false);

	}

	function updateJST(what, search, alive) {
		cu_copied = null;
		jqccs.busyWindow(true,120000);
		//$("body").addClass("loading");
		$('#hier_view').jstree("destroy");
		node_list = [];
		if (what == "byzone") {
			createJSTreeByZone(search, (alive == "true"), (ds) => {
				ds.forEach((elem) => {
					if (elem.hasOwnProperty('data') && elem.data.hasOwnProperty("ndk_uid")) {
						node_list.push(elem.data.ndk_uid);

					}
				});
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
				ds.forEach((elem) => {
					if (elem.hasOwnProperty('data') && elem.data.hasOwnProperty("ndk_uid")) {
						node_list.push(elem.data.ndk_uid);

					}
				});
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
				ds.forEach((elem) => {
					if (elem.hasOwnProperty('data') && elem.data.hasOwnProperty("ndk_uid")) {
						node_list.push(elem.data.ndk_uid);

					}
				});

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

	function addUSOrRoot(jsree_data, node_created, edesc, without_parent) {
		if (edesc.ndk_type == "nt_unit_server" || (edesc.ndk_type == "nt_root")) {
			var parent = "#";
			var desc;
			if (edesc.ndk_type == "nt_unit_server") {
				desc = jchaos.node(edesc.ndk_uid, "get", "us");
			} else {
				desc = edesc;

			}
			var icon_name = "";
			var parent = "#";
			icon_name = "/img/devices/" + desc.ndk_type + ".png";

			if ((desc.ndk_parent !== undefined) && (without_parent == false)) {
				parent = jchaos.encodeName(desc.ndk_parent);

			}

			if (desc.ndk_uid !== undefined) {
				var idname = jchaos.encodeName(desc.ndk_uid);
				if (!node_created.hasOwnProperty(idname)) {

					var node = {
						"id": idname,
						"parent": parent,
						"icon": icon_name,
						"text": desc.ndk_uid,
						"data": desc
					};

					jsree_data.push(node);
					node_created[idname] = true;
				}

				if (desc.hasOwnProperty('us_desc') && (desc.us_desc['cu_desc'] instanceof Array)) {
					var list = desc.us_desc.cu_desc;
					list.forEach(cu => {
						var name = cu.ndk_uid;
						var regex = /(.*)\/(.*)\/(.*)$/;
						var match = regex.exec(name);
						var icon_name = "";
						if ((match != null) && (typeof match[2] !== "undefined")) {
							icon_name = "/img/devices/" + match[2] + ".png";
							cu["zone"] = match[1];
							cu["group"] = match[2];
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
			}

		}
	}
	function createJSTreeByServer(filter, alive, handler) {
		var jsree_data = [];
		var node_created = {};

		jchaos.search(filter, "server", alive, (nodes) => {
			if (nodes.length == 0) {
				alert("No nodes found");
				if (typeof handler === "function") {
					handler(jsree_data);
				}
				return;
			}
			//patch for empty names...
			var filtered = nodes.filter(function (el) {
  				return el != "";
		});
			jchaos.node(filtered, "desc", "all", (d) => {
				// add before agents and us

				d.forEach(edesc => {
					if (edesc.ndk_type == "nt_data_service" || edesc.ndk_type == "nt_wan_proxy" || edesc.ndk_type == "nt_agent") {
						var icon = "/img/devices/" + edesc.ndk_type + ".png";
						var iname = jchaos.encodeName(edesc.ndk_uid);

						var node = {
							"id": iname,
							"parent": "#",
							"icon": icon,
							"text": edesc.ndk_uid,
							"data": edesc
						};
						if (!node_created.hasOwnProperty(iname)) {
							jsree_data.push(node);
							node_created[iname] = true;
						}
						if (edesc.ndk_type == "nt_agent") {
							if (edesc.hasOwnProperty("andk_node_associated")) {
								edesc.andk_node_associated.forEach((ass) => {
									var found = false;
									d.forEach((m, index) => {
										//console.log(edesc.ndk_uid+" looking among live for:"+ass.ndk_uid)
										if ((m !== undefined) && (m.ndk_uid == ass.ndk_uid)) {
											if (!node_created.hasOwnProperty(jchaos.encodeName(m.ndk_uid))) {

												addUSOrRoot(jsree_data, node_created, m, false);
											}
											found = true;
											//d.splice(index, 1);
										}
									});
									if (!found) {
										//	console.log(edesc.ndk_uid+" looking among NOT live for:"+ass.ndk_uid)

										var nn = jchaos.node(ass.ndk_uid, "desc", "all");
										if (nn != null && nn.hasOwnProperty('ndk_uid')) {
											addUSOrRoot(jsree_data, node_created, nn, false);

										} else {
											console.error("Node empty?:" + ass.ndk_uid + " in agent :" + edesc.ndk_uid);

											alert("Agent " + edesc.ndk_uid + " is associated to a non valid node:" + ass.ndk_uid + " please remove it from associations")
										}
									}

								});
							}
						}
					}
				});
				d.forEach(edesc => {
					addUSOrRoot(jsree_data, node_created, edesc, true);
				});
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			}, (bad) => {
				console.error("error:" + JSON.stringify(bad));
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			});


		}, (bad) => {
			console.error("error:" + JSON.stringify(bad));
			if (typeof handler === "function") {
				handler(jsree_data);
			}
		});


	}
	function createJSTreeByZone(filter, alive, handler) {
		var jsree_data = [];
		var node_created = {};
		jchaos.search(filter, "cu", alive, (culist) => {
			var roots = jchaos.search(filter, "root", alive);
			if ((roots instanceof Array) && (roots.length > 0)) {
				culist = culist.concat(roots);
			}
			if ((culist.length == 0) && (typeof handler === "function")) {
				handler(jsree_data);
			}
			jchaos.node(culist, "desc", "all", (descs) => {
				descs.forEach((elem) => {
					//	var desc = jchaos.getDesc(elem, null);
					var decoded = jchaos.pathToZoneGroupId(elem.ndk_uid);
					if (decoded != null) {
						var zone = decoded.zone;
						var group = decoded.group;
						var filename = (zone + "/" + decoded.id).split("/");
						var next_parent = "";
						if (filename.length > 0) {
							next_parent = filename[filename.length - 1];
						}
						var desc = "";
						var uname = jchaos.encodeName(elem.ndk_uid);

						/*var implementation = "";
						if (desc.instance_description !== undefined && desc.instance_description.control_unit_implementation !== undefined) {
							implementation = desc.instance_description.control_unit_implementation;
						}*/
						filename.forEach((p, index) => {
							var par = p;
							var node = {};
							if (index == 0) {
								node = { "id": p, "icon": "", "parent": "#", "text": p, "data": { 'zone': p } };
								zone = p;
							} else {
								par = zone;
								zone = zone + "/" + p;
								node = { "id": jchaos.encodeName(zone), "icon": "", "parent": jchaos.encodeName(par), "text": p, "data": { 'zone': par } };

							}
							if (index == (filename.length - 1)) {
								node['data'] = elem;
								node['data']['zone'] = par;
								node['data']['group'] = group;
								if (elem.hasOwnProperty("ndk_type") && (elem.ndk_type == "nt_root")) {
									node['icon'] = "/img/devices/nt_root.png";
								} else {
									node['icon'] = "/img/devices/" + decoded.group + ".png";
								}
								node['id'] = uname;

							}
							if (!node_created.hasOwnProperty(node['id'])) {
								node_created[node['id']] = true;
								jsree_data.push(node);

							}

						});



					}
				});
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			}, () => {
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			})
		}
			, () => {
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
			if ((culist.length == 0)) {
				alert("No nodes found");
				if (typeof handler === "function") {
					handler(jsree_data);
				}
				return;
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
							"data": { 'group': device }
						};

						if (!node_created.hasOwnProperty(device)) {

							jsree_data.push(node);
							node_created[device] = true;
						}
						//var desc = jchaos.getDesc(elem, null);
						var id = jchaos.encodeName(elem);
						var node = {
							"id": id,
							"parent": device,
							"icon": icon_name,
							"text": elem,
							"data": desc[index]
						};
						node.data['group'] = device;
						node.data['zone'] = match[1];
						if (!node_created.hasOwnProperty(id)) {

							jsree_data.push(node);
							node_created[id] = true;
						}
					}

				});
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			}, (bad) => {
				console.error("error:" + JSON.stringify(bad));
				if (typeof handler === "function") {
					handler(jsree_data);
				}
			});
		}, (bad) => {
			console.error("error:" + JSON.stringify(bad));

			if (typeof handler === "function") {
				handler(jsree_data);
			}
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

	function removeTextClasses(iname) {
		$("#" + iname).removeClass("text-success");
		$("#" + iname).removeClass("text-dark");
		$("#" + iname).removeClass("text-danger");
		$("#" + iname).removeClass("text-muted");
	}
</script>


</body>

</html> -->