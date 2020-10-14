<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

?>

<body>

	<?php
require_once('header.php');
?>

	<div class="container-fluid-full fill">
		<div class="row-fluid fill">



			<!-- start: Content -->
			<div id="chaos_content" class="span12">

				<ul class="breadcrumb">
					<li>
						<i class="icon-home"></i>
						<a href="<?php echo $index; ?>"><?php echo $curr_page; ?></a>
						<i class="icon-angle-right"></i>
					</li>
				</ul>


				<div class="row-fluid">
					<div class="statbox purple span3">
						<h3>Node Type</h3>
						<select id="View" size="auto">
							<option value="byzone" selected="selected">By Zone</option>
							<option value="bydevice">By Device Type</option>
							<option value="byserver">By Server</option>
						</select>
					</div>

					<div class="statbox purple row-fluid span3">
						<div class="span6">
							<label for="search-alive">Search All</label><input class="input-xlarge"
								id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive"
								type="radio" value=false>
						</div>
						<div class="span6">
							<label for="search-alive">Search Alive</label><input class="input-xlarge"
								id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio"
								value=true checked>
						</div>

						<input class="input-xlarge focused span6" id="search-chaos" title="Free form Search" type="text"
							value="">
					</div>
				</div>
				<div class="box-content">

					<div class="row-fluid">
						<div class="box span12">
							<div id="hier_view" class="span6"></div>
							<div id="desc_view" class="span6"></div>
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
		function addListeners() {


			$('#hier_view').on('select_node.jstree', function (e, data) {
				var i, j, r = [];
				if (data.selected.length == 1) {
					var node_data = data.instance.get_node(data.selected[0]).data;
					if ((node_data != null) && node_data.hasOwnProperty("ndk_uid")) {
						var ndk_uid = node_data.ndk_uid;
						jchaos.command(ndk_uid, { "act_name": "getBuildInfo", "act_domain": "system", "direct": true }, function (bi) {
							//console.log(ndk_uid+" Build:"+JSON.stringify(bi));
							node_data = Object.assign(bi, node_data);
							$('#desc_view').html(jqccs.json2html(node_data));
							jqccs.jsonSetup($('#desc_view'), function (e) {
							});

						});

					}
				}
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
		$('#hier_view').jstree({
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
				"wholerow","contextmenu", "dnd", "search",
				"state", "types", "wholerow"
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
							/* Collection of objects (the same structure) */
						}
					}
				}
			}

		});
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
			var mitems = {
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
						/* Collection of objects (the same structure) */
					}
				}
				/* MORE ENTRIES ... */
			}
			$("body").addClass("loading");
			$('#hier_view').jstree("destroy");

			if (what == "byzone") {
				createJSTreeByZone(search, (alive == "true"), (ds) => {
					$('#hier_view').jstree({
						"plugins": ["dnd", "contextmenu"],
						"contextmenu": {
							'items': (node) => {
								// The default set of all items
								var items = {
									renameItem: {
										"separator_before": false,
										"separator_after": true,
										// The "rename" menu item
										label: "Rename",
										action: function () { }
									},
									deleteItem: { // The "delete" menu item
										"separator_before": false,
										"separator_after": true,
										label: "Delete",
										action: function () { }
									}
								};

								/*if ($(node).hasClass("folder")) {
									// Delete the "delete" menu item
									delete items.deleteItem;
								}*/

								return items;
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

						'contextmenu': {
							'items': mitems,
							"select_node": true

						}
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
						'contextmenu': {
							'items': mitems, "select_node": true

						}
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

			jchaos.search(filter, "cu", alive, (culist) => {
				var roots = jchaos.search(filter, "root", alive);
				if ((roots instanceof Array) && (roots.length > 0)) {
					culist = culist.concat(roots);
				}
				jchaos.getDesc(culist, (desc) => {
					culist.forEach((elem, index) => {
						var regex = /(.*)\/(.*)\/(.*)$/;
						var match = regex.exec(elem);
						var icon_name = "";
						if ((match != null) && (typeof match[2] !== "undefined")) {
							icon_name = "/img/devices/" + match[2] + ".png";
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

					});
					if (typeof handler === "function") {
						handler(jsree_data);
					}
				});

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
				culist.forEach((elem) => {
					//	var desc = jchaos.getDesc(elem, null);

					var regex = /(.*)\/(.*)\/(.*)$/;
					var match = regex.exec(elem);
					if (match != null) {
						var zone = match[1];
						var filename = zone.split("/");
						var next_parent = "";
						if (filename.length > 0) {
							next_parent = filename[filename.length - 1];
						}
						var desc = "";
						desc = jchaos.node(elem, "desc", "all");

						filename.forEach((p, index) => {
							var node = {};

							if (index == 0) {
								node = { "id": p, "icon": "", "parent": "#", "text": p };
							} else {
								node = { "id": p, "icon": "", "parent": filename[index - 1], "text": p };
							}
							if (desc.hasOwnProperty("instance_description") && desc.instance_description.hasOwnProperty("ndk_parent") && (desc.ndk_parent == next_parent)) {
								node['data'] = jchaos.node(next_parent, "desc", "all");
							}
							if (!node_created.hasOwnProperty(p)) {
								jsree_data.push(node);
								node_created[p] = true;
							}


						});
						var node_name = "";
						if (typeof match[3] === "string") {
							node_name = match[3];
						} else {
							node_name = match[2];

						}
						//var desc = jchaos.getDesc(elem, null);
						var icon_name = "/img/devices/" + match[2] + ".png";

						var node = {
							"id": jchaos.encodeName(elem),
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
				culist.forEach((elem) => {

					var regex = /(.*)\/(.*)\/(.*)$/;
					var match = regex.exec(elem);
					if (match != null) {
						var device = match[2];
						var icon_name = "/img/devices/" + device + ".png";

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
							"icon": "",
							"text": elem,
							"data": null
						};
						jsree_data.push(node);
					}

				});
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


	</script>


</body>

</html>