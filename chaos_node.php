<html>
<?php
		require_once('head.php');

		$curr_page = "NODE";

?>

<body>

	<?php
			require_once('header.php');
?>

	<div class="container-fluid px-5">
		<div class="row">



			<div id="chaos_content" class="col-md-12">


				<div class="row">
					<div class="statbox purple col-sm-3">
						<h3>Node View</h3>
						<select id="View" size="auto">
							<option value="byzone">By Zone</option>
							<option value="bydevice">By Type</option>
							<option value="byserver" selected="selected">By Server</option>
						</select>
					</div>

					<div class="statbox purple col-sm-2">
						<h3>Interface</h3>
						<select id="classe">
							<option value="All">All</option>
							<option value="powersupply">powersupply</option>
							<option value="motor">motor</option>
							<option value="camera">camera</option>
							<option value="BPM">BPM</option>
						</select>
					</div>

					<div class="statbox purple col-sm-7">

						<div class="row">

							<div class="col-sm">
								<h3>Live</h3>
								<label for="search-alive">All </label><input class="input-xlarge"
									id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive"
									type="radio" value=false checked>
								<label for="search-alive">Alive</label><input class="input-xlarge"
									id="search-alive-true" title="Search just alive nodes" name="search-alive"
									type="radio" value=true>
							</div>

							<div class="col-sm">
								<h3>Regex Search</h3>
								<input class="input-xlarge focused" id="search-chaos" title="Free form Regex Search"
									type="text" value="">
							</div>

							<div class="col-sm">
								<h3>Status</h3>
								<select id="errorState">
									<option value="All">All</option>
									<option value="Ok">OK</option>
									<option value="Error">Error</option>
									<option value="Warning">Warning</option>
									<option value="NotStart">No Running</option>
								</select>
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

	<footer>
		<?php require_once('footer.php');?>
	</footer>






	<script>

		var cu_copied = null;
		var synoptic = {};
		var node_list = [];
		var node_state = {};
		var node_old_state = {};
		var cu_catalog_by_interface = {};
		jchaos.variable("synoptic", "get", (ok) => {
			synoptic = ok;
		}, (bad) => {
			console.error("error:" + JSON.stringify(bad));

		});
		jchaos.variable("cu_catalog", "get", (ok) => {
			cu_catalog_by_interface = ok
		}, (bad) => {
			console.error("error:" + JSON.stringify(bad));

		});
		setInterval(function () {
			var now = (new Date()).getTime();
			for (var i = 0; i < node_list.length; i += 100) {
				var node_chunk = node_list.slice(i, i + 100);

				jchaos.node(node_chunk, "health", "", function (run_info) {

					run_info.forEach((elem, index) => {
						var isalive = false;

						if ((elem.health.ndk_uid !== undefined)) {
							var healt = elem.health;
							var uid = healt.ndk_uid;
							elem['lives'] = false;
							var alarm = Number(healt.cuh_alarm_lvl);

							node_state[uid] = elem;
							var iname = jchaos.encodeName(uid);
							if (healt.hasOwnProperty("cuh_alarm_msk") && (healt.cuh_alarm_msk > 0)) {
								$("#" + iname + "_maskalarm").html('<img src="img/icon/silent.png">');
							} else {
								$("#" + iname + "_maskalarm").html('');
							}
							if (alarm > 0) {
								if (alarm == 1) {
									//	$("#" + name_id + "_devalarm").attr('title', "Warning:"+JSON.stringify(jchaos.filterAlarmObject(elem.cu_alarms,false)));
									$("#" + iname + "_devalarm").html('<img src="img/icon/warning.png">');

									//$("#" + name_id + "_devalarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" role="button"  ><i class="material-icons" style="color:yellow">error</i></a>');
								} else {
									//	$("#" + name_id + "_devalarm").attr('title',"Error:"+JSON.stringify(jchaos.filterAlarmObject(elem._alarms,false)));
									$("#" + iname + "_devalarm").html('<img src="img/icon/error.png">');

									//$("#" + name_id + "_devalarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" role="button" ><i class="material-icons" style="color:red">error</i></a>');
								}

							} else {
								$("#" + iname + "_devalarm").html('');
							}
							if ((healt.dpck_ats !== undefined)) {
								var ts = healt.dpck_ats;
								if (healt.hasOwnProperty("dpck_mds_ats")) {
									ts = healt.dpck_mds_ats;
								}
								if ((Math.abs(ts - now) < 10000)) {
									isalive = true;
								} else if (node_old_state[uid] !== undefined && node_state[uid] !== undefined) {
									if ((node_state[uid].dpck_ats !== undefined) && (node_old_state[uid].dpck_ats !== undefined)) {
										if (node_state[uid].dpck_ats > node_old_state[uid].dpck_ats) {
											isalive = true;
										}

									}


								}
								node_old_state[uid] = node_state[uid];


								if (isalive) {
									setTextClasses(iname, "text-success");
									elem['lives'] = true;

									node_state[uid]['lives'] = true;
								} else {
									setTextClasses(iname, "text-muted");
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
									//	if (elem['lives']) {
											setTextClasses(iname, "text-danger");

									//	}

									} else if (elem['lives']) {
										if (healt.nh_status != 'Start') {
											setTextClasses(iname, "text-warning");

										}
									}
									$("#" + iname).attr('title', title);

								}
							} else {
								//console.error("no timestamp key on "+uid+" :"<<JSON.stringify(elem.health));
								setTextClasses(iname, "text-dark");
								$("#" + iname).attr('title', uid + ": DEAD no timestamp info");


							}

						} else {
							var uid = node_chunk[index];
							var iname = jchaos.encodeName(uid);
							if (iname == "") {
								console.error("NO NAME at index:" + index + " UID:" + uid);
							} else {
								setTextClasses(iname, "text-dark");
								$("#" + iname).attr('title', uid + ": DEAD no health info");
							}


						}
					});

				}, (bad) => {
					node_chunk.forEach((d) => {
						var iname = jchaos.encodeName(d);
						setTextClasses(iname, "text-muted");


					});
				});
			}

		}, 5000);


	

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
			var menu_str = "";
			if (node.hasOwnProperty("data")) {
				if (node.data.hasOwnProperty("ndk_type") && (node.data.ndk_type == "nt_agent")) {
					menu_str = "associated";
				}
				items['new-us'] = {
					"separator_before": true,
					"separator_after": false,
					label: "New " + menu_str + " US ",
					action: function () {
						var templ = {
							$ref: "us.json",
							format: "tabs"
						}
						jqccs.jsonEditWindow("US Editor", templ, null, jchaos.unitServerSave, null, function (ok) {
							if ((node.data.ndk_type == "nt_agent")) {

								jchaos.agentAssociateNode(selected_node, ok['ndk_uid'], "", "UnitServer", okk => {
									jqccs.instantMessage("Unit server created and associated ", " OK", 2000, true);
									triggerRefreshEdit();


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
							triggerRefreshEdit();

						}, function (bad) {
							jqccs.instantMessage("Unit creation server failed:", JSON.stringify(bad), 4000, false);
						}

						);
					}
				};
				if ((cu_copied != null) && (typeof cu_copied === "object")) {
					if ((cu_copied.ndk_type == "nt_unit_server")) {
						items['associate-us'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Associate US " + cu_copied.ndk_uid,
							action: function () {
								jchaos.agentAssociateNode(selected_node, cu_copied.ndk_uid, "", "UnitServer", okk => {
									jqccs.instantMessage("Unit server created and associated ", " OK", 2000, true);

									var newnode = {
										"id": jchaos.encodeName(cu_copied.ndk_uid),
										"parent": ID,
										"icon": "/img/devices/nt_unit_server.png",
										"text": cu_copied.ndk_uid,
										"data": cu_copied
									};
									tree.create_node(node, newnode);
									triggerRefreshEdit();
								}, (badd) => {
									jqccs.instantMessage("Unit Server Association Failed:", JSON.stringify(badd), 4000, false);

								});

							}
						}
					} else if (cu_copied.ndk_type == "nt_root") {
					}


				}
				if (node.data.hasOwnProperty('zone') || (node.data.ndk_type == "nt_unit_server")) {
					if (node.data.hasOwnProperty("ndk_type") && (node.data.ndk_type == "nt_unit_server")) {
						menu_str = "Add ";
					}
					var cu = {};
					cu['id'] = "<MY ID>";
					if ((node.data.ndk_type == "nt_unit_server")) {
						cu['ndk_parent'] = node.data.ndk_uid;
					}
					var submenu = {
					};
					submenu['new-cu-custom'] = {
						"separator_before": false,
						"separator_after": false,
						label: menu_str + "New Custom",
						action: function () {
							//cu["ndk_uid"] = node.data["zone"] + "/MYGROUP/NewName" + (new Date()).getTime();
							var objcu = Object.assign({}, cu);
							objcu['ndk_parent']=node.data.ndk_uid;
							objcu['control_unit_implementation'] = "---";// custom
							addEditCU(objcu, tree);
						}
					}


					for (var c in cu_catalog_by_interface) {
						var subMenu = {}
						var subDriver = {}

						for (var typ in cu_catalog_by_interface[c]) {
							var aname = typ;
							if (cu_catalog_by_interface[c][typ].info.hasOwnProperty("alias")) {
								aname = cu_catalog_by_interface[c][typ].info.alias;
							}
							var objcu = Object.assign({}, cu);
							objcu['control_unit_implementation'] = cu_catalog_by_interface[c][typ].info.impl;
							objcu['cudk_desc'] = cu_catalog_by_interface[c][typ].info.desc;
							for (var d in cu_catalog_by_interface[c][typ].drivers) {
								var objcud = Object.assign({}, objcu);

								objcud['cudk_driver_description'] = [cu_catalog_by_interface[c][typ].drivers[d]];

								subDriver['new-' + c + "-" + typ + "-" + d] = {
									"separator_before": false,
									"separator_after": false,
									"cu": objcud,
									label: menu_str + d,
									action: function (obj) {
										addEditCU(obj.item.cu, tree);

									}
								}
							}
							subMenu['new-' + c + "-" + typ] = {
								"separator_before": false,
								"separator_after": false,
								label: menu_str + aname,
								"cu": objcu,
								submenu: subDriver,
								action: function (obj) {
									addEditCU(obj.item.cu, tree);
								}

							}

						}
						submenu['new-' + c] = {
							"separator_before": false,
							"separator_after": false,
							label: menu_str + c,
							"cu": objcu,
							action: function (obj) {
								addEditCU(obj.item.cu, tree);

							},
							submenu: subMenu

						}
					}
					items['new-cu'] = {
						"separator_before": false,
						"separator_after": false,
						label: menu_str + "New CU",
						"submenu": submenu


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
										addEditCU(cu, tree);
										
									} else {
										alert("Not a valid uid:'" + cu.ndk_uid + "' must contain at least zone/group/id")
									}
								}
							};
						}
					}
					if (node.data.ndk_type === undefined) {
						items['delete-nodes'] = {
							"separator_before": true,
							"separator_after": false,
							label: "Delete children of " + node.data.cid,
							action: function (obj) {
								jchaos.search(node.data.cid, "ceu", false, (ll) => {
									jqccs.confirm("Delete All children EU/EU Nodes", "Your are deleting " + ll.length + " children of : " + node.data.cid, "Ok", function () {
										let cnt = ll.length;
										ll.forEach(selected_node => {
											jchaos.node(selected_node, "deletenode", "all", function () {
												console.log("deleted " + selected_node);
												cnt--;

												if (cnt == 0) {
													tree.delete_node(node);
													//	triggerRefreshEdit();
												}
											}, function (err) {
												cnt--;
												jqccs.instantMessage("cannot delete " + selected_node, JSON.stringify(err), 2000, false);

											});
										});

									}, "Cancel");
								})
							}
						};
					}
				}

				if (node.data.hasOwnProperty("ndk_type") && node.data.hasOwnProperty("ndk_uid")) {
					var selected_node = node.data.ndk_uid;
					var type = node.data.ndk_type;
					items['copy'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Copy " + jchaos.nodeTypeToHuman(type),
						action: function () {
							if (type == "nt_unit_server") {
								jqccs.instantMessage("Copied US " + selected_node, " you can paste it into an AGENT", 4000, true);
								copyToClipboard(JSON.stringify(node.data));
								cu_copied = node.data;

								return;
							}
							jchaos.node(selected_node, "get", "cu", function (data) {
								if (data != null) {
									cu_copied = data;
									if (type == "nt_root") {
										jqccs.instantMessage("Copied EU " + selected_node, " you can paste it into an AGENT", 4000, true);

									} else if (type == "nt_control_unit") {
										jqccs.instantMessage("Copied CU " + selected_node, " you can paste it into an US", 4000, true);
									} else {
										return;
									}

									copyToClipboard(JSON.stringify(data));
								}
							});
						}
					};

					if ((type == "nt_control_unit") && node.data.hasOwnProperty('instance_description') && (node.data.instance_description.hasOwnProperty('control_unit_implementation'))) {
						items['control'] = {
							"separator_before": true,
							"separator_after": true,
							label: "Control..",
							action: function () {

								jqccs.openControl("Control " + selected_node, selected_node);
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
										//!! TODO: check why?
										if (!data.hasOwnProperty("ndk_type")) {
											data['ndk_type'] = type;
										}
										cu2editor(data, (edit_templ, editobj) => {
											jqccs.jsonEditWindow("CU/EU Editor", edit_templ, editobj, jchaos.cuSave, null, function (ok) {
												
												jqccs.instantMessage("CU/EU saved " + selected_node, " OK", 2000, true);
												triggerRefreshEdit();


											}, function (bad) {
												jqccs.instantMessage("Error saving CU/EU " + selected_node, JSON.stringify(bad), 2000, false);

											});

										});

									}
								});
								return;
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
							/*items['updateSynPos'] = {
								"separator_before": true,
								"separator_after": false,
								label: "Update Synoptic position",
								action: function () {

								}
							};*/
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
												triggerRefreshEdit();

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
												triggerRefreshEdit();


											}, (bad) => {
												alert(" Cannot create node err:" + JSON.stringify(bad));
												triggerRefreshEdit();

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
										if (data.hasOwnProperty("ndk_desc")) {
											data.us_desc["ndk_desc"] = data["ndk_desc"];
										}
										jqccs.jsonEditWindow("US Editor", templ, data.us_desc, jchaos.unitServerSave, null, function (ok) {
											jqccs.instantMessage("Unit server save ", " OK", 2000, true);
											triggerRefreshEdit();


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
							if (type == "nt_unit_server") {
								jchaos.search(selected_node, "server", true, (nodes) => {
									if (nodes[0] == selected_node) {
										jqccs.instantMessage("Cannot remove a node that is alive:" + selected_node, "Kill before", 2000, false);

									} else {
										jchaos.node(selected_node, "get", "us", function (desc) {
											if (desc.hasOwnProperty('us_desc') && (desc.us_desc['cu_desc'] instanceof Array)) {
												var list = desc.us_desc.cu_desc;
												let cnt = list.length;
												jqccs.confirm("Delete US " + selected_node, "Your are deleting : " + list.length + " CUs", "Ok", function () {
													list.forEach(ele => {
														jchaos.node(ele.ndk_uid, "deletenode", "all", function () {
															console.log("deleting CU " + ele.ndk_uid);
															cnt--;
															if (cnt == 0) {
																jchaos.node(selected_node, "deletenode", "all", function () {
																	console.log("deleting US " + selected_node);
																	tree.delete_node(node);
																	triggerRefreshEdit();

																});

															}
														});
													});
												}, "Cancel");

											} else {
												jchaos.node(selected_node, "deletenode", "all", function () {
																	console.log("deleting US " + selected_node);
																	tree.delete_node(node);
																	triggerRefreshEdit();

																});
											}
										});
									}
								});
							} else {
								jchaos.search(selected_node, "ceu", true, (nodes) => {
									if (nodes[0] == selected_node) {
										jqccs.instantMessage("Cannot remove a node that is alive:" + selected_node, "Kill before", 2000, false);

									} else {

										jqccs.confirm("Delete Node", "Your are deleting : " + selected_node, "Ok", function () {
											jchaos.node(selected_node, "deletenode", "all", function () {
												jqccs.instantMessage("Node deleted " + selected_node, " OK", 2000, true);
												if (node.data.hasOwnProperty('ndk_parent') && node.data.ndk_parent != "") {
													jchaos.node(node.data.ndk_parent, "desc", "all", (pd) => {
														if (pd.ndk_type == "nt_agent") {
															jchaos.node(node.data.ndk_parent, "del", "agent", selected_node, function (daa) {
																jqccs.instantMessage("Removed association " + selected_node, " OK", 2000, true);

															});
														}
													}, (bad) => { });
												}
												tree.delete_node(node);
												triggerRefreshEdit();


											}, function (err) {
												jqccs.instantMessage("cannot delete " + selected_node, JSON.stringify(err), 2000, false);

											});
										}, "Cancel");
									}
								});
							}

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
									jchaos.node(node.data.ndk_uid, "stop", "us", function () {

										jchaos.node(node.data.ndk_uid, "start", "us", function () {

											jqccs.instantMessage(node.data.ndk_uid, "Starting on  " + node.data.ndk_parent, 2000, true);

											jchaos.node(node.data.ndk_parent, "desc", "agent", function (data) {
												console.log("->" + JSON.stringify(data));
												var server = "";
												if (data.ndk_ip_addr !== undefined) {
													server = data.ndk_ip_addr;
												} else if (data.ndk_host_name !== undefined) {
													server = data.ndk_host_name;
												} else if (data.ndk_rpc_addr !== undefined) {
													server = data.ndk_rpc_addr;
													server.replace(/:\d+/g, '');
												}
												var uid = "";
												var enconsole = false;
												data.andk_node_associated.forEach(ele => {
													if (ele.ndk_uid == node.data.ndk_uid) {
														uid = ele.association_uid;
														enconsole = ele.node_log_on_console;
													}
												});
												if (enconsole) {
													if (uid != "") {
														jqccs.getConsole(node.data.ndk_uid + " on " + server, uid, server + ":" + data.ndk_rest_port, 2, 1, 1000);
													} else {
														jqccs.instantMessage(node.data.ndk_uid, "Cannot open console, uid not found for " + node.data.ndk_uid, 4000, false);

													}
												}
											});


										}, function (bad) {
											jqccs.instantMessage(node.data.ndk_uid, "Error Starting on " + node.data.ndk_parent + " error: " + JSON.stringify(bad), 4000, false);
										});
								},function () {
									jchaos.node(node.data.ndk_uid, "start", "us", function () {

jqccs.instantMessage(node.data.ndk_uid, "Starting on  " + node.data.ndk_parent, 2000, true);

jchaos.node(node.data.ndk_parent, "desc", "agent", function (data) {
	console.log("->" + JSON.stringify(data));
	var server = "";
	if (data.ndk_ip_addr !== undefined) {
		server = data.ndk_ip_addr;
	} else if (data.ndk_host_name !== undefined) {
		server = data.ndk_host_name;
	} else if (data.ndk_rpc_addr !== undefined) {
		server = data.ndk_rpc_addr;
		server.replace(/:\d+/g, '');
	}
	var uid = "";
	var enconsole = false;
	data.andk_node_associated.forEach(ele => {
		if (ele.ndk_uid == node.data.ndk_uid) {
			uid = ele.association_uid;
			enconsole = ele.node_log_on_console;
		}
	});
	if (enconsole) {
		if (uid != "") {
			jqccs.getConsole(node.data.ndk_uid + " on " + server, uid, server + ":" + data.ndk_rest_port, 2, 1, 1000);
		} else {
			jqccs.instantMessage(node.data.ndk_uid, "Cannot open console, uid not found for " + node.data.ndk_uid, 4000, false);

		}
	}
});


}, function (bad) {
jqccs.instantMessage(node.data.ndk_uid, "Error Starting on " + node.data.ndk_parent + " error: " + JSON.stringify(bad), 4000, false);
});
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
							var snode = selected_node;
							if ((node.data.ndk_type == "nt_control_unit")) {
								snode = node.data.ndk_parent;
								typ = "US";
							}
							jqccs.confirm("Do you want to IMMEDIATELY SHUTDOWN " + typ + " " + snode, "Pay attention all children of " + snode + " and siblings will be killed as well", "Kill",
								function () {

									jchaos.node(snode, "shutdown", typ, function () {
										jqccs.instantMessage("SHUTDOWN NODE", "Killed " + snode + "", 1000, true);
									}, function () {
										jqccs.instantMessage("SHUTDOWN NODE ", "Killing " + snode + "", 2000, true);
									}, function () {
										// handle error ok
									})

								}, "Joke",
								function () { });
						}
					}
					if (node.data.ndk_type !== undefined && ((node.data.ndk_type == "nt_root") || (node.data.ndk_type == "nt_control_unit"))) {
						var currsel = node.data.ndk_uid;

						
						var sub_show= {
								'show-dataset':{
									label: "Show/Set/Plot Dataset",
									action: function () {
										jqccs.showDataset(currsel, currsel, dashboard_settings['generalRefresh']);
									}
								},
								'show-desc': {
									label: "Show Description",
									action: function () {
										jchaos.node(currsel, "desc", "all", function (data) {

											jqccs.showJson("Description " + currsel, data);
										});
									}
								},
								'show-tags': {
									label: "Show Tags info",
									action: function () {
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
												jqccs.showJson("Tags of " + currsel, names);
											} else {
												alert("No tag associated to " + currsel);
											}

										});

									}
								},
								'show-picture': {
									label: "Show as Picture..",
									action: function () {
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

												jqccs.showPicture(currsel + " output", currsel, refresh);

											} else {
												alert(currsel + " cannot be viewed as a Picture, missing 'FRAMEBUFFER'");
											}
											if (cu && cu.hasOwnProperty("custom") &&
												cu.custom.hasOwnProperty("FRAMEBUFFER") &&
												cu.custom.FRAMEBUFFER.hasOwnProperty("$binary") &&
												cu.custom.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
												// $("#mdl-dataset").modal("hide");

												jqccs.showPicture(currsel + " custom", currsel, 0, 2);

											}
										}, function (err) {
											console.log(err);
										});

									}
								}
							};

						
						items['show'] = {
							label: "Show..",
							submenu:sub_show
						}
						
						var sub_prop= {
								'driver-prop': {
									label: "Driver properties",
									action: function () {
										jchaos.command(currsel, { "act_name": "cu_prop_drv_get" }, function (data) {

											var origin_json = JSON.parse(JSON.stringify(data)); // not reference
											jqccs.editJSON("Driver Properties " + currsel, data, (json, fupdate) => {

												var changed = jchaos.jsonDiff(json, origin_json);
												console.log("CHANGED:" + JSON.stringify(changed));
												var msg = {
													"act_msg": changed,
													"act_name": "cu_prop_drv_set"
												};
												console.log("sending changed:" + JSON.stringify(changed));
												jchaos.command(currsel, msg, function (data) {
													jqccs.instantMessage("Setting driver prop:" + currsel, "OK", 5000, true);
													jchaos.command(currsel, { "act_name": "cu_prop_drv_get" }, function (dd) {
														//read back
														fupdate(dd[0]);
													});

												}, (bad) => {
													jqccs.instantMessage("Error Setting driver prop:" + currsel, "Error: " + JSON.stringify(bad), 5000, false);

												});

											});

										}, function (data) {
											jqccs.instantMessage("Getting driver prop:" + currsel, "Error:" + JSON.stringify(data), 5000, false);
											//   $('.context-menu-list').trigger('contextmenu:hide')

										});
									}
								},
								'cu-prop': {
									label: "CU/EU properties",
									action: function () {
										jchaos.command(currsel, { "act_name": "ndk_get_prop" }, function (data) {
											var origin_json = JSON.parse(JSON.stringify(data)); // not reference
											jqccs.editJSON("CU/EU Prop " + currsel, data, (json) => {

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
												jchaos.command(currsel, msg, function (data) {
													jqccs.instantMessage("Setting driver prop:" + currsel, "OK", 5000, true);

												}, (bad) => {
													jqccs.instantMessage("Error Setting driver prop:" + currsel, "Error: " + JSON.stringify(bad), 5000, false);

												});

											});
										}, function (data) {
											jqccs.instantMessage("Getting Node prop:" + currsel, "Error:" + JSON.stringify(data), 5000, false);
											//   $('.context-menu-list').trigger('contextmenu:hide')

										});
									}
								}
							};
							items['properties'] = {
							label: "Properties",
							submenu:sub_prop
						}
						

						var sub_alarm={
							'show-alarms':{
							label: "Show/Set Alarms",
							action: function () {
								jchaos.getChannel(node.data.ndk_uid, 255, function (run_info) {
									var obj = Object.assign({}, run_info[0].cu_alarms, run_info[0].device_alarms);
									tmp = {

										handler: function (e) {
											if (e.keyCode == 13) {

												var val = parseInt(e.target.value);
												var attrname = e.target.name;
												var desc = jchaos.decodeCUPath(attrname);
												console.log("value:" + e.target.value + " name:" + desc.var);
												var alrm = {
													name: desc.var,
													value: val
												}
												jchaos.command(node.data.ndk_uid, { "act_name": "cu_set_alarm", "act_msg": alrm }, function (data) {
													jqccs.instantMessage(node.data.ndk_uid, "Set Alarm: " + desc.var + "=" + val + " on " + node.data.ndk_uid, 4000, true);

												}, function (bad) {
													jqccs.instantMessage(node.data.ndk_uid, "Error Setting Alarm " + JSON.stringify(bad), 4000, true);

												});


											}
										}
									}
									jqccs.showJson("Alarms " + node.data.ndk_uid, jchaos.filterAlarmObject(obj), tmp);

								});


							}
						},
						'clralarm': {
						label: "Clear Alarm",
						action: function () {
							var typ = jchaos.nodeTypeToHuman(type);
							if(type =="nt_control_unit" || type == "nt_root"){
								jchaos.command(node.data.ndk_uid, { "act_name": "nodeclralrm", "act_msg": {"all":true} }, function (data) {
									jqccs.instantMessage(node.data.ndk_uid, "Clear Alarms on " + node.data.ndk_uid, 4000, true);

								}, function (bad) {
									jqccs.instantMessage(node.data.ndk_uid, "Error Clearing Alarm " + JSON.stringify(bad), 4000, false);

								});
						} else {
							jchaos.node(selected_node, "nodeclralrm", typ, function () {
								jqccs.instantMessage("Clear Alarms ", "Cleared " + selected_node + "", 2000, true);
							}, function (err) {
								jqccs.instantMessage("Error Clearing Alarms ", "Clearing " + selected_node + " " + JSON.stringify(err), 5000, false);
							});
						}


						}
					},
						'mask-cu-alarms' : {
							label: "Mask Alarms",
							action: function () {
								var objects = tree.get_selected(true)

								jchaos.getChannel(node.data.ndk_uid, 255, function (run_info) {
									var list_alarm=[];
									for(var k in run_info[0].cu_alarms){
										if((!jchaos.isReservedKey(k))&&(!k.includes("_MASK"))){
											list_alarm.push(k);
										}
									}
									for(var k in run_info[0].device_alarms){

										if((!jchaos.isReservedKey(k))&&(!k.includes("_MASK"))){
											list_alarm.push(k);
										}
									}
									jqccs.getEntryWindow("Mask Alarm", "name", list_alarm, "MASK", function (n) {
										var alrm = {
													name: n,
													mask: 0
												}
												jchaos.command(node.data.ndk_uid, { "act_name": "cu_set_alarm", "act_msg": alrm }, function (data) {
															jqccs.instantMessage(node.data.ndk_uid, "Set Mask " + " on "+n, 4000, true);

														}, function (bad) {
															jqccs.instantMessage(node.data.ndk_uid, "Error Setting Mask on "+n+" err:" + JSON.stringify(bad), 4000, false);

														});
									});
									

								});


							}
						},
						'unmask-cu-alarms' : {
							label: "Unmask Alarms",
							action: function () {
								var objects = tree.get_selected(true)

								jchaos.getChannel(node.data.ndk_uid, 255, function (run_info) {
									var list_alarm=[];
									for(var k in run_info[0].cu_alarms){
										if((!jchaos.isReservedKey(k))&&(k.includes("_MASK"))){
											list_alarm.push(k.replace("_MASK",""));
										}
									}
									for(var k in run_info[0].device_alarms){

										if((!jchaos.isReservedKey(k))&&(k.includes("_MASK"))){
											list_alarm.push(k.replace("_MASK",""));
										}
									}
									jqccs.getEntryWindow("UNMASK Alarm", "name", list_alarm, "UNMASK", function (n) {
										var alrm = {
													name: n,
													mask: 0xFF
												}
												jchaos.command(node.data.ndk_uid, { "act_name": "cu_set_alarm", "act_msg": alrm }, function (data) {
															jqccs.instantMessage(node.data.ndk_uid, "UnMask "+n, 4000, true);

														}, function (bad) {
															jqccs.instantMessage(node.data.ndk_uid, "Error UnMasking "+n+" err:" + JSON.stringify(bad), 4000, false);

														});
									});
									

								});


							}
						}
					}
						items['alarms']={
							label:"Alarms...",
							submenu:sub_alarm
						}
						var subm_state = {};

						if (node_state.hasOwnProperty(node.data.ndk_uid) && node_state[node.data.ndk_uid].hasOwnProperty("health")) {
							var stat = node_state[node.data.ndk_uid].health.nh_status;
							var now = (new Date()).getTime();

							if(now-node_state[node.data.ndk_uid].health.dpck_ats>10000){
								stat="offline";
							}
							subm_state['restart']={
										"separator_before": false,
										"separator_after": true,
										label: "Restart",
										icon: "fa fa-refresh",
										action: function () {
											let name=node.data.ndk_uid;
											jchaos.restart(name, function(data) {
													jqccs.instantMessage("Restarting :" + name, "OK", 1000, true);
												}, function(data) {
												jqccs.instantMessage("ERROR Restarting:" + name, "Error :" + JSON.stringify(data), 5000, false);

												});
											
										}
									};
							if (stat == "Start") {
								subm_state['stop'] = {
									"separator_before": false,
									"separator_after": false,
									label: "Stop",
									icon: "fa fa-stop",
									action: function () {
										jchaos.node(node.data.ndk_uid, "stop", "cu", function () {
											jqccs.instantMessage(node.data.ndk_uid, "Stopping  ", 2000, true);
										}, function (bad) {
											jqccs.instantMessage(node.data.ndk_uid, "Error Stopping  error: " + JSON.stringify(bad), 4000, false);
										});
									}
								}
							} else if (stat == "Stop") {
								subm_state['start'] = {
									"separator_before": false,
									"separator_after": false,
									label: "Start",
									icon: "fa fa-play",

									action: function () {
										jchaos.node(node.data.ndk_uid, "start", "cu", function () {
											jqccs.instantMessage(node.data.ndk_uid, "Starting  ", 2000, true);
										}, function (bad) {
											jqccs.instantMessage(node.data.ndk_uid, "Error Starting  error: " + JSON.stringify(bad), 4000, false);
										});
									}
								}
								subm_state['deinit'] = {
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
								}

							} else if (stat == "Deinit") {
								subm_state['unload'] = {
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
								}
								subm_state['init'] = {
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
								}
							} else if (stat == "Unload") {
								subm_state['load'] = {
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
								}
							} else if (stat == "Load") {
								subm_state['init'] = {
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
								}
								subm_state['unload'] = {
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
								}

							} else {
								subm_state['start']= {
										"separator_before": false,
										"separator_after": false,
										label: "Start",
										action: function () {
											jchaos.node(node.data.ndk_uid, "start", "cu", function () {
												jqccs.instantMessage(node.data.ndk_uid, "Starting  ", 2000, true);
											}, function (bad) {
												jqccs.instantMessage(node.data.ndk_uid, "Error Starting  error: " + JSON.stringify(bad), 4000, false);
											});
										}
								}
								subm_state['stop']= {
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

									subm_state['init']= {
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
									},
									subm_state['deinit']= {
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
									subm_state['load']= {
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
									subm_state['unload']= {
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
									}
								

							}
							
							items['set-state'] = {
								"label": "Set State..",
								"submenu": subm_state
							};

						}


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
						$("#svg_img").html('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" stroke="black" stroke-width="3" fill="green" />');

					}
					jchaos.getChannel(ndk_uid, 255, function (bruninfo) {
						var healt = bruninfo[0].health;
						if ((healt.dpck_ats !== undefined) && ((Math.abs(healt.dpck_ats - (new Date()).getTime())) < 10000)) {
							//$("#"+node.id).addClass("bg-success");
							//console.log(ndk_uid+" Build:"+JSON.stringify(bi));
							//node_data = Object.assign(bi, node_data);

							var nd = Object.assign({}, { state: bruninfo[0] }, { info: node_data });
							var elem = bruninfo[0];
							if ((elem.system !== undefined) && (elem.system.ndk_uid !== undefined)) {
								var dev_alarm = Number(elem.system.cudk_dalrm_lvl);
								var cu_alarm = Number(elem.system.cudk_calrm_lvl);
								var name_id = jchaos.encodeName(elem.system.ndk_uid);
								var name_device_db = elem.system.ndk_uid;
								var alarms = {};
								if (dev_alarm > 0) {
									alarms['DEVICE'] = jchaos.filterAlarmObject(elem.device_alarms, false);
								}
								if (cu_alarm > 0) {
									alarms['CU'] = jchaos.filterAlarmObject(elem.cu_alarms, false);

								}
								if (cu_alarm > 0 || dev_alarm > 0) {
									$("#" + name_id + "_devalarm").attr('title', "ALARMS:" + JSON.stringify(alarms));
									nd = Object.assign(nd, { ALARMS: alarms });

								}

							}

							$('#desc_view').html(jqccs.json2html(nd));
							jqccs.jsonSetup($('#desc_view'), function (e) {
							});
							$('#desc_view').find('a.json-toggle').click();





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
										console.log(ndk_uid + " Build:" + JSON.stringify(bi));
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
			jqccs.busyWindow(true, 10000, () => { alert("Timeout check the REST port on Settings->Config->defaultRestPort"); });
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
			var idname = jchaos.encodeName(edesc.ndk_uid);

			if (node_created.hasOwnProperty(idname)) {
				return;
			}

			if (edesc.ndk_type == "nt_unit_server") {
				dus = jchaos.node(edesc.ndk_uid, "get", "us");

				addUSOrRoot_int(jsree_data, node_created, dus, without_parent);


			} else {
				addUSOrRoot_int(jsree_data, node_created, edesc, without_parent);
			}
		}
		function addUSOrRoot_int(jsree_data, node_created, desc, without_parent) {
			var parent = "#";
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
						if (cu.hasOwnProperty("ndk_uid")) {
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
							if (!cu.hasOwnProperty('ndk_type')) {
								cu['ndk_type'] = "nt_control_unit";
							}
							var node = {
								"id": idname,
								"parent": jchaos.encodeName(cu.ndk_parent),
								"icon": icon_name,
								"text": "<span>" + name + "</span>" + '<span class="decodeAlarm" id="' + jchaos.encodeName(name) + '_devalarm"></span>' + '<span id="' + jchaos.encodeName(name) + '_maskalarm"></span>',

								"data": cu
							};
							if (!node_created.hasOwnProperty(idname)) {
								jsree_data.push(node);
								node_created[idname] = true;
							}
						}
					});
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
							node['text'] = "<span>" + edesc.ndk_uid + "</span>" + '<span class="decodeAlarm" id="' + jchaos.encodeName(edesc.ndk_uid) + '_devalarm"></span>' + '<span id="' + jchaos.encodeName(edesc.ndk_uid) + '_maskalarm"></span>';

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

											jchaos.node(ass.ndk_uid, "desc", "all", (nn) => {
												if (nn != null && nn.hasOwnProperty('ndk_uid')) {
													addUSOrRoot(jsree_data, node_created, nn, false);

												} else {
													console.error("Node empty?:" + ass.ndk_uid + " in agent :" + edesc.ndk_uid);

													alert("Agent " + edesc.ndk_uid + " is associated to a non valid node:" + ass.ndk_uid + " please remove it from associations")
												}
											});
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

			var state = $("#errorState option:selected").val();
			var interface = $("#classe option:selected").val();

			sopt = {};
			if (state != "All") {
				sopt['state'] = state;
			}
			if (interface != "All") {
				sopt['interface'] = interface;

			}
			jchaos.search(filter, "ceu", alive, sopt, (culist) => {

				if ((culist.length == 0) && (typeof handler === "function")) {
					handler(jsree_data);
				}
				if (culist.length > 0) {
					jchaos.node(culist, "desc", "all", (e) => {
						e.forEach(elem => {

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
										node = { "id": p, "icon": "", "parent": "#", "text": p, "data": { 'zone': p, 'cid': p } };
										zone = p;
									} else {
										par = zone;
										zone = zone + "/" + p;
										node = { "id": jchaos.encodeName(zone), "icon": "", "parent": jchaos.encodeName(par), "text": p, "data": { 'zone': par, 'cid': zone } };

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
										node['cid'] = elem.ndk_uid;
										node['text'] = "<span>" + p + "</span>" + '<span class="decodeAlarm" id="' + jchaos.encodeName(elem.ndk_uid) + '_devalarm"></span>' + '<span id="' + jchaos.encodeName(elem.ndk_uid) + '_maskalarm"></span>';

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

					}, (bad) => {
						console.error("retrieving descriptions:" + JSON.stringify(bad));

						if (typeof handler === "function") {
							handler(jsree_data);
						}

					})
				} else {
					if (typeof handler === "function") {
						handler(jsree_data);
					}
				}


			});
		}
		function createJSTreeByDevice(filter, alive, handler) {
			var jsree_data = [];
			var node_created = {};
			var state = $("#errorState option:selected").val();
			var interface = $("#classe option:selected").val();

			sopt = {};
			if (state != "All") {
				sopt['state'] = state;
			}
			if (interface != "All") {
				sopt['interface'] = interface;

			}
			jchaos.search(filter, "ceu", alive, sopt, (culist) => {
				/*var roots = jchaos.search(filter, "root", alive);
				if ((roots instanceof Array) && (roots.length > 0)) {
										culist = culist.concat(roots);
				}*/
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
								"text": "<span>" + elem + "</span>" + '<span class="decodeAlarm" id="' + jchaos.encodeName(elem) + '_devalarm"></span>' + '<span id="' + jchaos.encodeName(elem) + '_maskalarm"></span>',

								"data": desc[index]
							};
							node.data['group'] = device;
							node.data['zone'] = match[1];
							node.data['cid'] = elem;

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
		$("#errorState").on('change', (e) => {

			var search = $("#search-chaos").val();
			var alive = $("input[type=radio][name=search-alive]:checked").val();
			updateJST($("#View").val(), search, alive);

		});
		$("#classe").on('change', (e) => {

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
			$("#" + iname).removeClass("text-warning");

		}
		function setTextClasses(iname, classname) {
			if (!$("#" + iname).hasClass(classname)) {
				removeTextClasses(iname);
				$("#" + iname).addClass(classname);

			}

		}

		function addEditCU(cu, tree) {
			cu2editor(cu, (edit_templ, editobj, cudb) => {

				jqccs.jsonEditWindow("CU Editor", edit_templ, editobj, jchaos.cuSave, null, function (json) {
					jqccs.instantMessage("CU saved " + json.ndk_uid, " OK", 2000, true);
					var decoded = jchaos.pathToZoneGroupId(json.ndk_uid);
					var icon_name = "/img/devices/" + decoded["group"] + ".png";

					if (decoded) {
						json['group'] = decoded["group"];
						var parent="";
						if(node && node.hasOwnProperty('id')){
							parent=node.id;
						}
						var newnode = {
							"id": jchaos.encodeName(json.ndk_uid),
							"parent": node.id,
							"icon": icon_name,
							"text": decoded["id"],
							"data": json
						};

						tree.create_node(node, newnode);
						triggerRefreshEdit();


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
	</script>


</body>

</html>