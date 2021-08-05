<div class="navbar">
	<div class="navbar-inner w-100">
		<div class="container-fluid-full">
			<nav class="navbar navbar-expand-md navbar-dark bg-black">


				<div class="collapse navbar-collapse" id="navbarsExampleDefault">
					<ul class="navbar-nav mr-auto">
						<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle"  id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Synoptic</a>
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
		items['new-script'] = {
					"separator_before": true,
					"separator_after": false,
					label: "New Synoptic",
					action: function () {
						var templ = {
            				$ref: "synoptic_new_model.json",
            				format: "tabs"
        					}
							
							
							
						var t={'group':"GENERIC",'imgsrc':"../img/synoptics/<MYSYNOPTIC.png>"};
						jqccs.jsonEditWindow("Synoptic Editor", templ, t, function (data, obj) {
							if(data.name.length == 0){
								alert("must provide an synoptic name:'name");
								return;
							}
							if(data.imgsrc.length == 0){
								alert("must provide an image source :'imgsrc");
								return;
							}
							data["numRows"]=-1;// auto
							data["numCols"]=-1;

							console.log("New Synoptic:"+JSON.stringify(data));
							runSynoptic(data);

						});
					}

				};
		if (node.hasOwnProperty("data")) {
					items['run-control'] = {
						"separator_before": false,
						"separator_after": false,
						label: "Run Synoptic",
						action: function () {
							runSynoptic(node.data);
						}
					};
				items['edit-script'] = {
					"separator_before": true,
					"separator_after": false,
					label: "Edit Synoptic",
					action: function () {
						var templ = {
            				$ref: "synoptic_model.json",
            				format: "tabs"
        					}
						jqccs.jsonEditWindow("Synoptic Editor", templ, node.data, function (data, obj) {
							if(node.data.name.length == 0){
								alert("must provide an synoptic name:'name");
								return;
							}
							if(node.data.imgsrc.length == 0){
								alert("must provide an image source :'imgsrc");
								return;
							}
							jchaos.variable("synoptics", "get", null, function (synoptic) {
                                    if (!(synoptic instanceof Object)) {
                                        synoptic = {};

                                    }
                                    synoptic[node.data.name]=data;

									jchaos.variable("synoptics", "set", synoptic, function (ok) {
										console.log("SAVE:"+JSON.stringify(data));

                                        jqccs.instantMessage("Saved " + syn.name, "OK", 3000, true);

                                    });
								});
							
						});
					}

				};
				items['download-script'] = {
					"separator_before": false,
					"separator_after": false,
					label: "Download",
					action: function () {
                                jqccs.getEntryWindow("Save to Disk", "Synoptic Name",  node.data.name, "Save", function (name) {
									node.data['name'] = name;
                                    var blob = new Blob([JSON.stringify( node.data)], { type: "json;charset=utf-8" });
                                    saveAs(blob, name + ".synoptic.json");
                                });
						
					}
				};
				items['delete-script'] = {
					"separator_before": false,
					"separator_after": false,
					label: "Delete script",
					action: function () {
						console.log("delete " + node.data.name);
						jqccs.confirm("Delete Script", "Your are deleting synoptic: " + node.data.name, "Ok", function () {
							jchaos.variable("synoptics", "get", null, function (synoptic) {
                                    if (!(synoptic instanceof Object)) {
                                        synoptic = {};

                                    }
                                    delete synoptic[node.data.name];
									jchaos.variable("synoptics", "set", synoptic, function (ok) {
                                        jqccs.instantMessage("Saved " + syn.name, "OK", 3000, true);

                                    });
								});
							
						}, "Cancel");
					}
				};
			}
		
		return items;
	}

	function refresh_synoptic(pid){
			var jsree_data = [];
			var scripts = {};
			var node_created = {};
			jchaos.variable("synoptics", "get", null, function (synoptic) {
				var node_group = {
									"id": jchaos.encodeName("GENERIC"),
									"parent": "#",
									"text": "GENERIC",
								};
								node_created[node_group["id"]] = true;
								jsree_data.push(node_group);

						
						
				for(var syn in synoptic){
					var parent="#";
					if(synoptic[syn].hasOwnProperty("group")){
						node_group = {
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
					node_group = {
									"id": jchaos.encodeName(syn),
									"parent": parent,
									"text": syn,
									"data":synoptic[syn],
									"icon":"../img/synoptics/iot16.png"
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