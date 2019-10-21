/**
 * !CHAOS REST Library
 */

(function () {
	function createLibrary() {
		var jchaos = {};

		jchaos.ops_on_going = 0;
		jchaos.ops_abort = false;
		jchaos.lastChannel = {};
		var uri_default="localhost:8081";
		
		jchaos.options = {
			updateEachCall: false,
			uri: uri_default,
			async: true,
			limit_on_going: 10000,
			history_page_len: 1000,
			timeout:5000,
			console_log: function (str) { console.log(str); },
			console_err: function (str) { console.error(str); }

		};

		/***
		 * 
		 */
		jchaos.createMotor=function(name,endOphandler,switchHandler){

			var obj={
				name:name,
				lastpos:0,
				limit1:false,
				limit2:false,
				home:false,

				// move absolute
				mov:function(pos){

				},
				// move relative
				movr:function(pos){

				},
				// do home
				gohome:function(){

				},
				pos:function(){

				}
			}
			return obj;
		}


		 /*****************************/
		jchaos.setOptions = function (opt) {
			
			for (var attrname in opt) { jchaos.options[attrname] = opt[attrname]; }
			var str = jchaos.options['uri'];
		//	var regex = /\:\d+/;
			//strip eventual port
			jchaos.options['uri'] = str;
			


		}
		jchaos.print = function (str) {
			jchaos.options['console_log'](str);
		}
		jchaos.perror = function (str) {
			jchaos.options['console_err'](str);
		}
		/******* REMOTE PROCESS MANAGEMENT ****/
		jchaos.basicRmt=function (server,func,param,handler,badhandler){
			if(handler instanceof Function){
			jchaos.basicPost("api/v1/restconsole/"+func, JSON.stringify(param), function (r) {
				if(handler instanceof Function){
					handler(r);
				} else {
					return r;
				} 
			},  badhandler,server);
		} else {
			return 	jchaos.basicPost("api/v1/restconsole/"+func, JSON.stringify(param), null,null,server);

		}
		}
		/**
		 * Retrive a given environemnt variable
		 */
		jchaos.rmtGetEnvironment=function (server,varname,handler,badhandler){
			var param ={};
			param['variable']=varname;
			return jchaos.basicRmt(server,"getenv",param,handler,badhandler);
		}
		/**
		 * Set a Property
		 */
		jchaos.rmtSetProp=function (server,prop,handler,badhandler){
			return jchaos.basicRmt(server,"setprop",prop,handler,badhandler);
		}
		/**
		 * Retrive a given environemnt variable
		 * return a process structure
		 */
		jchaos.rmtCreateProcess=function (server,name,cmdline,ptype,workdir,handler,badhandler){
			var param ={};
			param['cmdline']=cmdline;     
      param['ptype']=ptype;
			param['pname']=name;
			if(workdir != null && workdir!=""){
							param['workdir']=workdir;     
			}
			console.log("create process:"+JSON.stringify(param));
			return jchaos.basicRmt(server,"create",param,handler,badhandler);
		}
	/**
		 * Retrive a process working directory 
		 * return a zip file
		 */
		jchaos.rmtDownload=function (server,uid,workdir,handler,badhandler){
			var param ={};
			param['uid']=uid;
			if(workdir != null && workdir!=""){
				param['workdir']=workdir;     
			}
		
			console.log("Download process outputs:"+JSON.stringify(param));
			return jchaos.basicRmt(server,"download",param,handler,badhandler);
		}
		/**
		 * Upload a new Script 
		 * return the path 
		 */
		jchaos.rmtUploadScript=function (server,name,ptype,content,handler,badhandler){
			
			if((name instanceof Object) && (ptype instanceof Function) && (content instanceof Function)){
				return jchaos.basicRmt(server,"load",name,ptype,content);
			}
			var param ={};
			param['script_name']=name;     
            param['eudk_script_language']=ptype;
			param['eudk_script_content']=btoa(unescape(encodeURIComponent(content)));   
			return jchaos.basicRmt(server,"load",param,handler,badhandler);
             
		}
		/***
		 * Return a list of process on the given server
		 */
		jchaos.rmtListProcess=function (server,handler,badhandler){
			var param={};
			return jchaos.basicRmt(server,"list",param,handler,badhandler);
             
		}
		/***
		 * Set the console of a specified process uid
		 */
		jchaos.rmtSetConsole=function (server,uid,str,handler,badhandler){
			var param={};
			param['uid']=uid;
			param['data']=btoa(unescape(encodeURIComponent(str +"\n")));
			return jchaos.basicRmt(server,"setconsole",param,handler,badhandler);     
		}
		/***
		 * Get the console of a specified process uid
		 */
		jchaos.rmtGetConsole=function (server,uid,fromline,toline,handler,badhandler){
			var param={};
			param['uid']=uid;
			param['fromline']=fromline;
			param['toline']=toline;

			return jchaos.basicRmt(server,"getconsole",param,handler,badhandler);     
		}

		/***
		 * Get the console of a specified process uid
		 */
		jchaos.rmtKill=function (server,uid,handler,badhandler){
			var param={};
			param['uid']=uid;

			return jchaos.basicRmt(server,"kill",param,handler,badhandler);     
		}

		/***
		 * Purget list of process to a given level (0 soft (EXCEPTION), 1 medium (ENDED and EXCEPTION), 2 hard (ALL))
		 */
		jchaos.rmtPurge=function (server,level,handler,badhandler){
			var param={};
			param['level']=level;

			return jchaos.basicRmt(server,"purge",param,handler,badhandler);     
		}
		/******************************/
		/****** WIDGET */
		jchaos.progressBar=function (msg,id,lab){
			var progressbar;
			var instant = $('<div></div>').html('<div id="'+id+'"><div class="progress-label">'+lab+'</div></div>').dialog({
			  
			  title: msg,
			  position: "top",
			  open: function () {
				progressbar=$( "#"+id )
				var progressLabel = $( ".progress-label" );
				progressbar.progressbar({
				  value: false,
				change: function() {
				  var val=progressbar.progressbar( "value" );
				  progressLabel.text( val + "%" );
			  },
			  complete: function() {
				$(this).parent().dialog("close");
			  }
			});
		   },close:function(){
			 $(this).remove();
		   }});
		  }
		/***** */
		jchaos.basicPost = function (func, params, handleFunc, handleFuncErr,server) {
			var request;
			if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
				XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
			}
			request = new XMLHttpRequest();
			var srv=jchaos.options.uri;
			XMLHttpRequest.responseType="json";
			if (typeof server === "string" ){
				srv=server;
			}
			var url = "http://" + srv + "/" + func;
			var could_make_async = (typeof handleFunc === "function");
			if (could_make_async == false) {
				request.open("POST", url, false);

				request.send(params);
				if (request.status == 200) {
					try {
						var json = JSON.parse(request.responseText);
						return json;
					} catch (err) {
						var str = "jchaos.basicPost Error parsing json '" + err + "' body returned:'" + request.responseText + "' post:'" + params + "'";
						console.error(str);
						throw str;
						return null;
					}
				}
				console.error("bad status:" + request.status);
				return null;

			}
			request.open("POST", url, (jchaos.ops_on_going > jchaos.options.limit_on_going) ? false : (jchaos.options.async));
			request.timeout = jchaos.options.timeout;

			// console.log("on going:"+jchaos.ops_on_going);
			// request.setRequestHeader("Content-Type", 'application/json');
			jchaos.ops_on_going++;
			request.onreadystatechange = function (e) {

				//console.log("answer:"+request.status + " state:"+request.readyState);
				if (request.readyState == 4) {
					jchaos.ops_on_going--;
					if (request.status == 200) {
						try {
							var json = JSON.parse(request.responseText);
							if (could_make_async) {
								try {
									handleFunc(json);
								} catch (err) {
									console.trace("trace:");
									var str = "handler function error:'" + err + "' url:'" + url + "' post data:'" + params + "' response:'" + request.responseText + "'";
									console.log(str);
									if(typeof handleFuncErr === "function"){
										handleFuncErr(json);
									}
								}
							}
							return json;

						} catch (err) {
							var str = "jchaos.basicPost Error parsing json '" + err + "' body returned:'" + request.responseText + "'" + "' post:'" + params + "'";;
							//console.error(str);
							console.log(str);
							//throw str;
							if ((typeof handleFuncErr === "function")) {
								handleFuncErr(str);
							} else {
								if (could_make_async) {
									handleFunc(request.responseText);
								} else {
									return request.responseText;
								}
							}

						}
					} else {
						var str = "POST " + url + " body:\"" + params + "\" went wrong, result:" + request.status + " state:" + request.readyState;
						console.error(str);
						if (handleFuncErr != null && (typeof handleFuncErr === "function")) {
							handleFuncErr(request.responseText);
						}
					}
				}

			}
			request.onerror = function (e) {
				console.error("request error:" + request.statusText);
				//throw "error:" + request.statusText;
				if (handleFuncErr != null && (typeof handleFuncErr === "function")) {
					handleFuncErr(request.responseText);
				}
			};
			request.ontimeout = function (e) {
				console.error("request TIMEOUT:" + request.statusText);
				//throw "error:" + request.statusText;
				if (handleFuncErr != null && (typeof handleFuncErr === "function")) {
					handleFuncErr(request.responseText);
				}
			};
			//console.log("sending:"+params);
			request.send(params);

			//  request.close();

		}
		jchaos.addLongKey = function (obj, key, valuestr) {
			if (obj[key] == undefined) {
				var tt = {}
				tt['$numberLong'] = valuestr;
				obj[key] = tt;
			}
		}
		jchaos.getLongLong = function (obj, key) {
			return parseInt(obj[key].$numberLong);
		}
		jchaos.setLongLong = function (obj, key, val) {
			if (!obj.hasOwnProperty(key)) {
				jchaos.addLongKey(obj, key, val.toString());
				return;
			}

		}
		jchaos.normalizeDataset = function (obj) {
			jchaos.addLongKey(obj, 'dpck_hr_ats', "0");
			jchaos.addLongKey(obj, 'dpck_ats', "0");
			jchaos.addLongKey(obj, 'dpck_seq_id', "0");
		}

		jchaos.registerCU = function (cuid, obj, handleFunc) {
			var str_url_cu = "/api/v1/producer/jsonregister/" + cuid;
			var dd = Date.now();
			jchaos.normalizeDataset(obj);
			jchaos.basicPost(str_url_cu, JSON.stringify(obj), handleFunc);
		}

		jchaos.pushCU = function (cuid, obj, handleFunc) {
			var str_url_cu = "/api/v1/producer/jsoninsert/" + cuid;
			var dd = Date.now();
			jchaos.setLongLong(obj, 'dpck_seq_id', jchaos.getLongLong(obj, 'dpck_seq_id') + 1);
			-                       jchaos.setLongLong(obj, 'dpck_ats', dd);
			jchaos.setLongLong(obj, 'dpck_hr_ats', dd * 1000);

			if (typeof handleFunc !== "function") {
				jchaos.basicPost(str_url_cu, JSON.stringify(obj), null);
				return;

			}

			jchaos.basicPost(str_url_cu, JSON.stringify(obj), function (datav) { handleFunc(datav); });

		}
		jchaos.mdsBase = function (cmd, opt, handleFunc, errFunc) {
			var param = "cmd=" + cmd + "&parm=" + JSON.stringify(opt);
			var ret = jchaos.basicPost("MDS", param, handleFunc, errFunc);
			return ret;
		}
		/**
		 * Start tagging a list of nodes for an interval of given time, expressed in cycles or ms
		 * @param {*} _tagname tag name
		 * @param {*} _node_list a list of nodes
		 * @param {*} _tag_type 1 means cycles 2 means ms time
		 * @param {*} _tag_value tag value
		 */
		jchaos.tag = function (_tagname, _node_list, _tag_type, _tag_value, handleFunc, nok) {
			var value = {};
			value['dsndk_history_burst_tag'] = _tagname;
			value['dsndk_history_burst_type'] = _tag_type;
			value['dsndk_history_burst_value'] = _tag_value;

			if (_node_list instanceof Array) {
				value['ndk_uid'] = _node_list;
			} else {
				value['ndk_uid'] = [_node_list];
			}
			return jchaos.snapshot("", "burst", "", JSON.stringify(value), handleFunc, nok);
		}
		/**
		 * Check if a list of CU have done a correct restore, the check is performed every timeout/10 ms for maximum timeout
		 * @param {*} _tagname tag name
		 * @param {*} _node_list a list of nodes (if null retrive the CU that have the given tagname)
		 * @param {*} _timeout maximum time in ms 
		 * @param {*} _okhandler handler called when ok
		 * @param {*} _nokhandler handler called when nok
		 */
		jchaos.checkRestore=function(_tagname,_node_list,_timeout,_okhandler,_nokhandler){
			var checkFreq=_timeout/10;
			var retry=10;
			if(_node_list == null){
				_node_list=jchaos.search(_tagname,"insnapshot",true);
			}
			jchaos.checkPeriodiocally("checkRestore", retry, checkFreq, function(){
				var data=jchaos.getChannel(_node_list,3,null);
				var oks=0;
				data.forEach(function(ds){
					if((ds.busy == false)&&(ds.cudk_set_tag==_tagname)&&(ds.cudk_set_state==3)){
						jchaos.print(ds.ndk_uid + " OK reached");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " NOT YET busy:"+ds.busy+ " restore state:"+ds.cudk_set_state);

					}
				});
				if(oks==_node_list.length){
					return true;
				}
				return false;	
			}, _okhandler, _nokhandler);
		}
		/**
		 * Check if a list of CU is doing a correct burst, the check is performed every timeout/10 ms for maximum timeout
		 * @param {*} _tagname tag name
		 * @param {*} _node_list a list of nodes (if null retrive the CU that have the given tagname)
		 * @param {*} _timeout maximum time in ms 
		 * @param {*} _okhandler handler called when ok
		 * @param {*} _nokhandler handler called when nok
		 */
		jchaos.checkBurstRunning=function(_tagname,_node_list,_timeout,_okhandler,_nokhandler){
			var checkFreq=_timeout/10;
			var retry=10;
			
			jchaos.checkPeriodiocally("checkBurstRunning", retry, checkFreq, function(){
				var data=jchaos.getChannel(_node_list,3,null);
				var oks=0;
				data.forEach(function(ds){
					if((ds.cudk_burst_state == true)&&(ds.cudk_burst_tag==_tagname)){
						jchaos.print(ds.ndk_uid + " OK tagging");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " NOT YET ACQUIRING, burst state:"+ds.cudk_burst_state+ " burst tag:"+ds.cudk_burst_tag);

					}
				});
				if(oks==_node_list.length){
					return true;
				}
				return false;	
			}, _okhandler, _nokhandler);
		}
		/**
		 * Check if a list of CU ended correct burst, the check is performed every timeout/10 ms for maximum timeout
		 * @param {*} _tagname tag name
		 * @param {*} _node_list a list of nodes (if null retrive the CU that have the given tagname)
		 * @param {*} _timeout maximum time in ms 
		 * @param {*} _okhandler handler called when ok
		 * @param {*} _nokhandler handler called when nok
		 */
		jchaos.checkEndBurst=function(_node_list,_timeout,_okhandler,_nokhandler){
			var checkFreq=_timeout/10;
			var retry=10;
			
			jchaos.checkPeriodiocally("checkEndBurst", retry, checkFreq, function(){
				var data=jchaos.getChannel(_node_list,3,null);
				var oks=0;
				data.forEach(function(ds){
					if((ds.cudk_burst_state == false)){
						jchaos.print(ds.ndk_uid + " OK End");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " STILL ACQUIRING burst state:"+ds.cudk_burst_state+ " burst tag:"+ds.cudk_burst_tag);

					}
				});
				if(oks==_node_list.length){
					return true;
				}
				return false;	
			}, _okhandler, _nokhandler);
		}
		jchaos.snapshot = function (_name, _what, _node_list, value_, handleFunc, nok) {
			var opt = {};
			if (_name instanceof Array) {
				opt['names'] = _name;
			} else {
				opt['name'] = _name;
			}
			opt['what'] = _what;
			if (_node_list instanceof Array) {
				opt['node_list'] = _node_list;
			} else {
				if (_node_list != null) {
					opt['node_list'] = [_node_list];
				}

			}

			try {
				//JSON.parse(value_);
				opt['value'] = JSON.parse(value_);

			} catch (e) {

			}

			return jchaos.mdsBase("snapshot", opt, handleFunc, nok);
		}

		/*get a US description
		 * */
		jchaos.getUS = function (_name) {
			var ret = jchaos.node(_name, "get", "us", "", "", null);
			return ret;
		}
		/*get a US description
		 * */
		jchaos.setUS = function (_name, _json) {
			var ret = jchaos.node(_name, "set", "us", "", _json, null);
			return ret;
		}
		jchaos.node = function (_name, _what, _type, _parent, value_, handleFunc, nok) {
			var opt = {};
			if (_name instanceof Array) {
				if (_name.length == 0) {
					return [];
				}
				opt['names'] = _name;
			} else {
				opt['name'] = _name;
			}
			opt['what'] = _what;
			opt['type'] = _type;
			opt['parent'] = _parent;


			if (value_ != null) {
				try {
					JSON.stringify(value_); // check if json
					opt['value'] = value_;
					console.log("param:" + JSON.stringify(opt));
				} catch (e) {
					console.error("not a valid json error :'" + e + "' value:" + value_);
					return;
				}
			}
			return jchaos.mdsBase("node", opt, handleFunc, nok);
		}

		jchaos.loadScript = function (_name, seqid, handleFunc,errFunc) {
			var opt = {};
			var value = {
				"seq": seqid,
				"script_name": _name
			};
			opt['name'] = "";
			opt['what'] = "load";
			opt['value'] = value;
			return jchaos.mdsBase("script", opt, handleFunc,errFunc);
		}
		jchaos.manageInstanceScript = function (script_name, script_seq, instance_name, create, handleFunc) {
			var opt = {};
			var script_desc = {};
			script_desc['script_seq'] = Number(script_seq);
			script_desc['script_name'] = script_name;

			script_desc['instance_name'] = instance_name;
			script_desc['create'] = create;
			opt['name'] = "";
			opt['what'] = "newInstance";
			opt['value'] = script_desc;
			return jchaos.mdsBase("script", opt, handleFunc);
		}
		jchaos.saveScript = function (value, handleFunc) {
			var opt = {};

			opt['name'] = "";
			opt['what'] = "save";
			opt['value'] = value;
			return jchaos.mdsBase("script", opt, handleFunc);
		}
		jchaos.rmScript = function (value, handleFunc) {
			var opt = {};

			opt['name'] = "";
			opt['what'] = "del";
			opt['value'] = value;
			return jchaos.mdsBase("script", opt, handleFunc);
		}
		jchaos.searchScriptInstance = function (script_name, search_string, handleFunc,errfunc) {
			var opt = {};
			var script_desc = {};
			script_desc['script_name'] = script_name;
			script_desc['search_string'] = search_string;

			opt['name'] = "";
			opt['what'] = "searchInstance";
			opt['value'] = script_desc;
			return jchaos.mdsBase("script", opt, handleFunc,errfunc);
		}
		jchaos.updateScriptInstance = function (script_instance, script_base_description, handleFunc) {
			var opt = {};
			var script_desc = {};
			script_desc['script_instance'] = script_instance;
			script_desc['script_base_description'] = script_base_description;

			opt['name'] = "";
			opt['what'] = "bind";
			opt['value'] = script_desc;
			return jchaos.mdsBase("script", opt, handleFunc);
		}
		jchaos.variable = function (_name, _what, value_, handleFunc) {
			var opt = {};
			if (_name instanceof Array) {
				opt['names'] = _name;
			} else {
				opt['name'] = _name;
			}
			opt['what'] = _what;
			if (_what == "set") {
				try {
					if (!(value_ instanceof Object)) {
						JSON.parse(param);

					}
					JSON.parse(value_);
					opt['value'] = JSON.stringify(value_);

				} catch (e) {
					opt['value'] = value_;
				}
			}

			return jchaos.mdsBase("variable", opt, handleFunc);
		}

		jchaos.log = function (_name, _what, _type, _start, _end, handleFunc) {
			var opt = {};
			if (_name instanceof Array) {
				opt['names'] = _name;
			} else {
				opt['name'] = _name;
			}
			opt['what'] = _what;
			opt['type'] = _type;
			opt['start'] = _start;
			opt['end'] = _end;

			return jchaos.mdsBase("log", opt, handleFunc);
		}
		/**
		 * 
		 * @param {string} _name is the substring of what you want search
		 * @param {string} _what is one of "cu,us"
		 * @param {boolean} _alive search among alive (true) or all(false)
		 * @param {*} handleFunc handler
		 */
		jchaos.search = function (_name, _what, _alive, handleFunc) {

			var opt = {
				name: _name,
				what: _what,
				alive: _alive
			};
			var optv = {
				names: _name,
				what: _what,
				alive: _alive
			};
			if (_name instanceof Array) {
				return jchaos.mdsBase("search", optv, handleFunc);
			}
			return jchaos.mdsBase("search", opt, handleFunc);
		}
		/**
		 * Find an array of CU with the given implementation
		 * @param {string} impl C++ implementation name to find
		 * @param {bool} alive search from alive or all
		 * @param {function} handleFunc call back function
			 
		 }}
		 */
		jchaos.findCUByImplementation = function (impl, alive, handleFunc) {
			var implList = [];
			jchaos.search("", "cu", alive, function (lscu) {
				jchaos.getDesc(lscu, function (desclist) {
					desclist.forEach(function (elem) {
						if (String(elem.instance_description.control_unit_implementation).includes(impl)) {
							implList.push(elem.ndk_uid);
						}
					});
					handleFunc(implList);
				});
			});
		}
		/**
		 * Recover CU alive status
		 * @ param {String} status_to_search Status to find (Start, Stop, Init, Deinit, Fatal error, Recoverable error)
		 * @ param {List} 
		 */
		jchaos.getCUStatus = function (status_to_search, handleFunc) {
			var cu_stats = [];
			var cu_to_search = [];
			var cnt = 0;
			jchaos.search("", "cu", false, function (data) {
				cu_to_search = data;
				jchaos.getChannel(cu_to_search, 4, function (ds) {
					//	console.log("status:"+JSON.stringify(ds));
					ds.forEach(function (elem) {
						if (elem.hasOwnProperty("nh_status")) {
							if (elem.nh_status == status_to_search) {
								cu_stats.push(elem.ndk_uid)
							}
						}

					});
					handleFunc(cu_stats);

				});

			});

		}
		jchaos.convertArray2CSV = function (devs) {
			var dev_array = "";
			if (devs instanceof Array) {
				devs.forEach(function (elem, i, array) {
					if (i < (array.length - 1)) {
						dev_array += elem + ",";
					} else {
						dev_array += elem;
					}
				});
			} else {
				dev_array = devs;
			}


			return dev_array;
		}
/**
 * getChannel
 * \brief retrive the specified live channel
 * @param devs CU names
 * @params channel_id (0: output, 1: input, 2:custom,3:system, 4: health, 5 cu alarm, 6 dev alarms)
 */
		jchaos.getChannel = function (devs, channel_id, handleFunc, badfunc) {

			var dev_array = jchaos.convertArray2CSV(devs);

			if (dev_array == "") {
				var empty = [{}];

				if (typeof handleFunc !== "function") {
					return empty;
				}
				handleFunc(empty);
				return;
			}
			var str_url_cu = "dev=" + dev_array + "&cmd=channel&parm=" + channel_id;
			//	console.log("query:"+str_url_cu);
			if ((typeof handleFunc !== "function")) {
				return jchaos.basicPost("CU", str_url_cu, null);
			}
			jchaos.basicPost("CU", str_url_cu, function (datav) { jchaos.lastChannel = datav; handleFunc(datav); }, badfunc);
		}
		jchaos.getDesc = function (devs, handleFunc) {

			var dev_array = jchaos.convertArray2CSV(devs);

			if (dev_array == "") {
				if ((typeof handleFunc === "function")) {
					handleFunc([{}]);
				}
				return;
			}
			var str_url_cu = "dev=" + dev_array + "&cmd=desc";
			//	console.log("query:"+str_url_cu);
			if ((typeof handleFunc !== "function")) {
				return jchaos.basicPost("CU", str_url_cu, null);
			}
			jchaos.basicPost("CU", str_url_cu, function (datav) { jchaos.lastChannel = datav; handleFunc(datav); });
		}
		jchaos.setSched = function (cu, schedule_ms) {
			return jchaos.sendCUCmd(cu, "sched", Number(schedule_ms));
		}
		jchaos.setBypass = function (dev, value, handleFunc) {
			var opt = {
				"name": dev,
				"type": "cu",
				"what": "set",
				"value": { "properties": [{ "cudk_bypass_state": value }] }
			};
			return jchaos.mdsBase("node", opt, handleFunc);
		}
		/***
		 * storageLive
		 * \brief enable/disable live cu
		 * @param dev list of cu
		 * @param enable enable disable
		 * @param handleFunc call back to call if success
		 * @param errFunc callback to call if error 
		 */
		jchaos.storageLive = function(dev,enable, handleFunc, errFunc){
			jchaos.getChannel(dev,3,function(cus){
				cus.forEach(function(elem,index){
					if(elem.hasOwnProperty('dsndk_storage_type')){
						var val=Number(elem.dsndk_storage_type);
						val = (val&0x1)|(enable<<1);
						jchaos.setProperty(cus[index].ndk_uid,[{ "dsndk_storage_type": val}]);
							
					}
				})
				handleFunc();},errFunc);
		}
		/***
		 * storageHisto
		 * \brief enable/disable history cu
		 * @param dev list of cu
		 * @param enable enable disable
		 * @param handleFunc call back to call if success
		 * @param errFunc callback to call if error 
		 */
		jchaos.storageHisto = function(dev,enable, handleFunc, errFunc){
			jchaos.getChannel(dev,3,function(cus){
				cus.forEach(function(elem,index){
					if(elem.hasOwnProperty('dsndk_storage_type')){
						var val=Number(elem.dsndk_storage_type);
						val = (val&0x2)|(enable&1);
						jchaos.setProperty(cus[index].ndk_uid,[{ "dsndk_storage_type": val}]);
							
					}
				})
				handleFunc();},errFunc);
		}
		jchaos.setProperty = function (dev, prop, handleFunc, errFunc) {
			var opt = {
				"name": dev,
				"type": "cu",
				"what": "set",
				"value": { "properties": prop }
			};
			return jchaos.mdsBase("node", opt, handleFunc, errFunc);
		}
		jchaos.loadUnload = function (dev, value, handleFunc, nok) {

			var opt = {

				"type": "cu",
				"what": value ? "load" : "unload",
			};
			if (dev instanceof Array) {
				opt['names'] = dev;
			} else {
				opt['name'] = dev;
			}
			jchaos.mdsBase("node", opt, handleFunc, nok);
		}
		jchaos.forceState = function (devs, state, handleFunc) {
			jchaos.getChannel(devs, 4, function (data) {
				data.forEach(function (elem) {
					var custate = "";
					//console.log("force state:"+ JSON.stringify(elem));
					var cuname = "";


					if (elem.hasOwnProperty('nh_status')) {
						custate = elem.nh_status;
					} else {
						return;
					}
					cuname = elem.ndk_uid;
					//	console.log("["+cuname+"] force curr: " +custate+ " state:"+ state);

					if (custate != "" && (state != custate)) {
						//	console.log("CU \""+cuname+ " is in '"+custate+"' should go in '"+state+"'");	
						if (state == "Start") {
							switch (custate) {
								case "Stop":
								case "Init":
									jchaos.sendCUCmd(cuname, "start", "", handleFunc);
									break;
								case "Deinit":
									jchaos.sendCUCmd(cuname, "init", "", function (d) {
										jchaos.sendCUCmd(cuname, "start", "", handleFunc);
									});
									break;

							}
						} else if (state == "Stop") {
							switch (custate) {
								case "Start":
									jchaos.sendCUCmd(cuname, "stop", "", handleFunc);
									break;
								case "Deinit":
									jchaos.sendCUCmd(cuname, "init", "", function (handleFunc) {
										jchaos.sendCUCmd(cuname, "start", "", function (handleFunc) {
											jchaos.sendCUCmd(cuname, "stop", "", handleFunc);
										});

									});
									break;
								case "Init":
									jchaos.sendCUCmd(cuname, "start", "", function (handleFunc) {
										jchaos.sendCUCmd(cuname, "stop", "", handleFunc);
									});

									break;
							}
						} else if (state == "Deinit") {
							switch (custate) {
								case "Stop":
									jchaos.sendCUCmd(cuname, "deinit", "", handleFunc);
									break;
								case "Init":
									jchaos.sendCUCmd(cuname, "deinit", "", handleFunc);
									break;
								case "Start":
									jchaos.sendCUCmd(cuname, "stop", "", function (handleFunc) {
										jchaos.sendCUCmd(cuname, "deinit", "", handleFunc);
									});

									break;
							}
						} else if (state == "Init") {
							switch (custate) {
								case "Stop":
									jchaos.sendCUCmd(cuname, "deinit", "", function (handleFunc) {
										jchaos.sendCUCmd(cuname, "init", "", handleFunc);
									});
									break;
								case "Deinit":
									jchaos.sendCUCmd(cuname, "init", "", handleFunc);
									break;
								case "Start":
									jchaos.sendCUCmd(cuname, "stop", "", function (handleFunc) {
										jchaos.sendCUCmd(cuname, "deinit", "", function (handleFunc) {
											jchaos.sendCUCmd(cuname, "init", "", handleFunc);
										});
									});

									break;
							}
						}
					}
				});
			});
		}
		jchaos.setAttribute = function (devs, attr, value, ok, nok) {
			//var parm="{\""+attr+"\":\""+value+"\"}";
			var parm = {};
			parm[attr] = value;
			jchaos.sendCUCmd(devs, "attr", parm, ok, nok);
		}

		/*
		 * Send a command to a set of devices
		 * 
		 * */
		jchaos.sendCUCmd = function (devs, cmd, param, handleFunc, handleFuncErr) {
			jchaos.sendCUFullCmd(devs, cmd, param, 0, 0, handleFunc, handleFuncErr);
		}
		jchaos.sendCUFullCmd = function (devs, cmd, param, force, prio, handleFunc, handleFuncErr) {
			var dev_array = jchaos.convertArray2CSV(devs);
			var params = "";
			if (dev_array == "") {
				//	throw "must specify target(s) devices";
				console.error("no device specified, command skipped");
				return;
			}
			try {
				if (!(param instanceof Object)) {
					JSON.parse(param);

				}
				params = JSON.stringify(param);
			} catch (e) {
				params = param;

			}
			var str_url_cu = "dev=" + dev_array + "&cmd=" + cmd + "&mode=" + force + "&prio=" + prio;
			if (params != "") {
				str_url_cu = str_url_cu + "&parm=" + params;
			}
			if ((typeof handleFunc !== "function")) {
				return jchaos.basicPost("CU", str_url_cu, null);
			}
			jchaos.basicPost("CU", str_url_cu, handleFunc, handleFuncErr);
		}
		/**
		 * 
		 * @param {string} devs 
		 * @param {integer} channel 
		 * @param {epoch timestamp in ms} start 
		 * @param {epoch timestamp in ms} stop 
		 * @param {string variable name optional} varname 
		 * @param {handler} handleFunc
		 * @param {string[] tags optional} tagsv 

		 */
		jchaos.getHistory = function (devs, channel, start, stop, varname, handleFunc, tagsv,funcerr) {
			var result = {
				X: [],
				Y: [],
				nitems:0
			};
			var opt = {};
			//var regex=/^[0-9]+$/;
			if (!isNaN(start)) {
				opt['start'] = Number(start);
			} else {
				opt['start'] = start;

			}
			if (!isNaN(stop)) {
				opt['end'] = Number(stop);

			} else {
				opt['end'] = stop;
			}
			if (tagsv instanceof Array) {
				if(tagsv.length > 0){
					opt['tags'] = tagsv;
				}
			} else if(tagsv instanceof Object){
				for(var k in tagsv){
					opt[k]=tagsv[k];
				}
			}

			opt['channel'] = channel;
			if(!opt.hasOwnProperty('page')){
				opt['page'] = jchaos.options.history_page_len;
			}
			if (varname !== "undefined" && (typeof varname !== "string")) {
				opt['var'] = varname;
			}
			if (opt['tags'] !== "undefined") {
				if ((typeof opt['tags'] ==="string") && (opt['tags']!="")) {
					opt["tags"] = [tagsv];
				} else {
					delete opt["tags"];
				}
			}

			jchaos.getHistoryBase(devs, opt, 0, 0, result, handleFunc,funcerr);

		}

		jchaos.fetchHistoryToZip = function (zipname, cams, start, stop, tagsv, updateCall,errCall) {
			var vcams;
			if (cams instanceof Array) {
				vcams = cams;
			} else {
				vams = [cams];
			}
			// need JSzip
			var zipf = new JSZip();
			var cnt = vcams.length;
			var per = 0.1;
			updateCall(
				{
					percent: per
				});
			vcams.forEach(function (ci) {
				jchaos.getHistory(ci, 0, start, stop, "", function (ds) {
					if((ds.Y[0] instanceof Object)){
						if ( (ds.Y[0].hasOwnProperty("FRAMEBUFFER")) && (ds.Y[0].FRAMEBUFFER.hasOwnProperty("$binary")) && (ds.Y[0].hasOwnProperty("FMT"))) {
							ds.Y.forEach(function (img) {

								var name = ci + "/" + img.dpck_seq_id + "_" + img.dpck_ats + "" + img.FMT;
								zipf.file(name, img.FRAMEBUFFER.$binary.base64, { base64: true });
								jchaos.print("zipping image: " + name + " into:" + zipname);

							});
						} else {
							var name = ci + ".json";
							zipf.file(name, JSON.stringify(ds.Y));
							jchaos.print("zipping dataset: " + name + " into:" + zipname);
						}


						if (--cnt == 0) {
							zipf.generateAsync({ type: "blob" }, updateCall).then(function (content) {
								saveAs(content, zipname);
							});
						}
					} else {
						console.log("Nothing found");
						updateCall(
							{
								percent: 0
							});
							if(typeof errCall == "function"){
								errCall("Nothing found from "+start +" to:"+stop);
							}
					}
				}, tagsv);
			});


		}

		jchaos.getHistoryBase = function (devs, opt, seq, runid, result, handleFunc,funcErr) {
			var cmd = "queryhst";
			var dev_array = jchaos.convertArray2CSV(devs);

			opt['seq'] = seq;
			opt['runid'] = runid;

			var str_url_cu = "dev=" + dev_array + "&cmd=" + cmd + "&parm=" + JSON.stringify(opt);
			//console.log("getHistory (seqid:" + seq + " runid:" + runid + ") start:" + opt.start + " end:" + opt.end + " page:" + opt.page);
			jchaos.basicPost("CU", str_url_cu, function (datav) {
				var ret = true;
				if(datav.data instanceof Array){
					result['nitems']+=datav.data.length;

				if ((opt.var != null) && (opt.var != "")) {
					datav.data.forEach(function (ele) {
						result.X.push(Number(ele.ts));
						result.Y.push(ele.val);
					});
				} else {
					datav.data.forEach(function (ele) {
						result.X.push(Number(ele.dpck_ats));
						result.Y.push(ele);
					});

				}
			}
			result['devs']=devs;
			result['query']=opt;
			result['end']=datav.end;
			result['runid']=datav.runid;
			result['seqid']=datav.seqid;
				if (jchaos.options.updateEachCall) {
					if(datav.hasOwnProperty("count")){
						result["count"]=datav.count;
					}
					ret = handleFunc(result);
					result.X = [];
					result.Y = [];
					
				} else {
					if (datav.end == 1) {
						// update if 0 or something else
						if(datav.hasOwnProperty("count")){
							result["count"]=datav.count;
						}
						handleFunc(result);

					}
				}
				if (ret && (datav.end == 0)) {
					if(datav.hasOwnProperty("count")){
						opt["count"]=datav.count;
					}
					jchaos.getHistoryBase(devs, opt, datav.seqid+1, datav.runid, result, handleFunc,funcErr);
				}
			},funcErr);
		}



		jchaos.checkPeriodiocally = function (str, retry, checkFreq, checkFunc, okhandle, nokhandle) {
			setTimeout(function () {
				if (checkFunc()) {
					okhandle();
				} else if (--retry > 0) {
					console.log(str + " retry check... " + retry);

					jchaos.checkPeriodiocally(str, retry, checkFreq, checkFunc, okhandle, nokhandle);
				} else {
					console.log(str + " expired maximum number of retry...");

					nokhandle();
				}
			}, checkFreq);
		};

	/**
   * saveFullConfig
   * @brief Save to local disk the state of fundamental configurations
   */
  jchaos.saveFullConfig = function (name) {
	//find all US
	var obj = {};
	obj['agents'] = [];
	var agent_list = jchaos.search("", "agent", false, false);
	agent_list.forEach(function (item) {
	  var agent = {
		"name": item,
	  };
	  var info = jchaos.node(item, "info", "agent", "", null);
	  agent['info'] = info;
	  obj['agents'].push(agent);
	  ;
	});
	obj['us'] = [];
	var us_list = jchaos.search("", "us", false, false);
	us_list.forEach(function (item) {
	  var data = jchaos.node(item, "get", "us", "", null);
	  obj['us'].push(data);

	});
	// snapshots
	obj['snapshots'] = [];
	var snaplist = jchaos.search("", "snapshots", false);
	snaplist.forEach(function (item) {
	  var snap = {
		snap: item,
	  };
	  var dataset = jchaos.snapshot(item.name, "load", null, "");
	  snap['dataset'] = dataset;
	  obj['snapshots'].push(snap);
	});
	// graphs

	obj['graphs'] = jchaos.variable("highcharts", "get", null, null);
	obj['cu_templates'] = jchaos.variable("cu_templates", "get", null, null);
	var blob = new Blob([JSON.stringify(obj)], { type: "json;charset=utf-8" });
	if(typeof name === "undefined"){
		saveAs(blob, "configuration.json");
	} else {
		saveAs(blob, name + ".json");

	}
  }
  
  /**
   * restoreFullConfig
   * @brief Restore a previously saved configuration
   * @param json: the json configuration
   * @param configToRestore: choose the items to restore
   */
  jchaos.restoreFullConfig = function (config, configToRestore) {
		if (!(configToRestore instanceof Array)) {
		  return;
		}
		configToRestore.forEach(function (sel) {
	
		  if (sel == "us") {
			if (config.hasOwnProperty('us') && (config.us instanceof Array)) {
			  config.us.forEach(function (data) {
				confirm("US " + data.us_desc.ndk_uid, "Erase Or Join configuration", "Erase", function () {
				  if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
					data.us_desc.cu_desc.forEach(function (item) {
					  jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
					});
					node_selected = data.us_desc.ndk_uid;
	
					unitServerSave(data.us_desc);
	
				  }
				}, "Join", function () { unitServerSave(data.us_desc); });
	
			  });
			} else if (config.hasOwnProperty("us_desc")) {
			  var templ = {
				$ref: "us.json",
				format: "tabs"
			  }
			  confirm("Add US " + config.us_desc.ndk_uid, "Erase Or Join configuration", "Erase", function () {
				if (config.us_desc.hasOwnProperty("cu_desc") && (config.us_desc.cu_desc instanceof Array)) {
				  config.us_desc.cu_desc.forEach(function (item) {
					jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
				  });
				  node_selected = config.us_desc.ndk_uid;
				  // editorFn = unitServerSave;
				  //jsonEdit(templ, config.us_desc);
				  jsonEditWindow("US Editor", templ, config.us_desc, unitServerSave, tmpObj);
	
				}
			  }, "Join", function () {
				// editorFn = unitServerSave;
				//jsonEdit(templ, config.us_desc);
				jsonEditWindow("US Editor Join", templ, config.us_desc, unitServerSave, tmpObj);
	
			  });
			} else if (config.hasOwnProperty("cu_desc")) {
	
			  var parent = config.cu_desc.ndk_parent;
	
	
			  confirm("Add CU " + config.cu_desc.ndk_uid, "Add CU to " + parent + "?", "Add", function () {
				if (config.hasOwnProperty("cu_desc")) {
				  var templ = {
					$ref: "cu.json",
					format: "tabs"
				  }
				  //editorFn = newCuSave;
				  var tmp = config.cu_desc;
				  //jsonEdit(templ, tmp);
				  jsonEditWindow("New CU Editor", templ, tmp, newCuSave, tmpObj);
	
				}
			  }, "Cancel", function () {
			  });
			}
		  }
		  if ((sel == "agents") && config.hasOwnProperty('agents') && (config.agents instanceof Array)) {
			config.agents.forEach(function (json) {
			  agentSave(node_selected, json.info);
			});
		  }
		  if ((sel == "snapshots") && config.hasOwnProperty('snapshots') && (config.snapshots instanceof Array)) {
			config.snapshots.forEach(function (json) {
			  jchaos.snapshot(json.name, "set", "", json.dataset, function (d) {
				console.log("restoring snapshot '" + json.name + "' created:" + json.ts);
			  });
			});
		  }
		  if ((sel == "graphs") && config.hasOwnProperty('graphs') && (config.graphs instanceof Object)) {
			jchaos.variable("highcharts", "set", config.graphs, function (s) {
			  console.log("restoring graphs:" + JSON.stringify(config.graphs));
			  high_graphs = config.graph;
			});
	
		  }
		  if ((sel == "custom_group") && config.hasOwnProperty('custom_group') && (config.custom_group instanceof Array)) {
			jchaos.variable("custom_group", "set", config.custom_group, function (s) {
			  console.log("restoring custom groups:" + JSON.stringify(config.custom_group));
			  custom_group = config.custom_group;
			});
	
		  }
		  if ((sel == "cu_templates") && (config instanceof Object) && (!config.hasOwnProperty("cu_desc"))) {
	
			jchaos.variable("cu_templates", "set", config, function (s) {
			  console.log("restoring CU templates:" + JSON.stringify(config));
			  cu_templates = config;
			});
	
		  }
		});
	  }  
	  /**
	   * activeAgentList
	   * @brief return a list of agents addresses in the callback
	   * @param cb: return a list of active agents
	   */
	  jchaos.activeAgentList=function (cb) {
		jchaos.search("", "agent", true, function (ag) {
		  var agent_list = [];
		  ag.forEach(function (elem) {
			var regx = /ChaosAgent_(.+)\:(.+)/;
			var match = regx.exec(elem);
			if (match) {
			  var server = match[1];
			  agent_list.push(server)
	
			}
		  });
		  if (typeof cb === "function") {
			cb(agent_list);
		  }
		});
	  }

	  /**
	   * activeAgentList
	   * @brief return a list of agents addresses in the callback
	   * @param cb: return a list of active agents
	   */
	  jchaos.activeAgentList=function (cb) {
		jchaos.search("", "agent", true, function (ag) {
		  var agent_list = [];
		  ag.forEach(function (elem) {
			var regx = /ChaosAgent_(.+)\:(.+)/;
			var match = regx.exec(elem);
			if (match) {
			  var server = match[1];
			  agent_list.push(server)
	
			}
		  });
		  if (typeof cb === "function") {
			cb(agent_list);
		  }
		});
	  }

	 /**
	   * getAllProcessInfo
	   * @brief return a vector of process information in the callback
	   * @param cb: return a list of active agen
	   * 	   
	   * */
	  jchaos.getAllProcessInfo=function(cb){
		var agent_obj = {};
		var proc_list = [];
		var tmpObj={};
		var cnt = 0;

		jchaos.activeAgentList(function(ag) {
			var proc={};
			ag.forEach(function (server) {
				agent_obj[server] = {};
				jchaos.rmtListProcess(server + ":8071", function (r) {
					if (r.hasOwnProperty("info")) {
					  agent_obj[server]['idle'] = r.info.hasOwnProperty("idletime") ? parseFloat(r.info.idletime) : parseFloat(r.info.idle);
					  agent_obj[server]['user'] = r.info.hasOwnProperty("usertime") ? parseFloat(r.info.usertime) : parseFloat(r.info.user);
					  agent_obj[server]['sys'] = r.info.hasOwnProperty("systime") ? parseFloat(r.info.systime) : parseFloat(r.info.sys);
					  agent_obj[server]['io'] = r.info.hasOwnProperty("iowait") ? parseFloat(r.info.iowait) : parseFloat(r.info.io);
					  agent_obj[server]['pmem'] = parseFloat(r.info.pmem);
			
					  agent_obj[server]['ts'] = r.info.ts;
					}
			
					if (r.data.hasOwnProperty("processes") && (r.data.processes instanceof Array)) {
					  var processes = r.data.processes;
					  processes.forEach(function (p) {
						p['hostname'] = server;
						p['parent'] = server;
			
						proc[p.uid] = p;
						proc_list.push(p.uid);
					  });
					}
					if (++cnt >= ag.length) {
					  tmpObj['procinfo'] = proc;
					  tmpObj['proclist'] = proc_list;
					  tmpObj['agents'] = agent_obj;
					  if (typeof cb === "function") {
						cb(tmpObj);
					  }
					}
				  }, function (bad) {
					console.log("Some error state of server:" + server + " occur:" + bad);
					if (++cnt >= ag.length) {
					  tmpObj['procinfo'] = proc;
					  tmpObj['proclist'] = proc_list;
					  tmpObj['agents'] = agent_obj;
					  if (typeof handler === "function") {
						cb(tmpObj);
					  }
					}
				  });
				});
		})
	} 
	  /**
	   * findBestServer
	   * @brief return a list of agents ordered by occupation in the callback
	   * @param cb: return a list of active agents
	   */
	  jchaos.findBestServer=function(cb){
		jchaos.getAllProcessInfo(function(ag){
			var server="";
			var idle=0;
			var agents=ag['agents'];
			for(var i in agents){
				if(agents[i]['idle']>idle){
					server=i;
					idle=agents[i]['idle'];
				}
			}
			cb(server);

		});
	  }

	  /**
   * runScript
   * @brief Run the specified script on the chaos infrastructure
   * @param name: the name of the script present in the DB
   * @param parm: optional parameters
   * @param okhandle: called when ok
   * @param errorhandle: called when failed
   */
  jchaos.runScript = function (name, parm,okhandle,errorhandle) {
		jchaos.search(name, "script", false, function (l) {
		  if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)) {
			if (l.found_script_list.length > 0) {
			  var seq = l.found_script_list[0].seq;
			  console.log("found script:" + JSON.stringify(l.found_script_list[0]));
			  jchaos.loadScript(name, seq, function (jsonscript) {
				jchaos.findBestServer(function (server) {
				  console.log("best server:" + server);
	
				  jchaos.rmtUploadScript(server + ":8071", jsonscript, function (r) {
					if (r.err != 0) {
						if(typeof errorhandle !== "undefined") errorhandle(server + ": Load Script", "cannot load:" + r.errmsg);
					  
					} else {
					  if (r.data.hasOwnProperty('path')) {
						var path = r.data.path;
						var workingdir = r.data.workingdir;
						var launch_arg = "";
						var name = jsonscript['script_name'];
						var language = jsonscript['eudk_script_language'];
						var defargs = jsonscript['default_argument']
						var chaos_prefix = "";
						jchaos.rmtGetEnvironment(server + ":8071", "CHAOS_PREFIX", function (r) {
						  if (r.err != 0) {
							if(typeof errorhandle !== "undefined") errorhandle("Cannot retrive environment", "cannot read CHAOS_PREFIX:" + r.errmsg);
							return;
						  } else {
							chaos_prefix = r.data.value;
							if (language == "CPP") {
							  launch_arg = chaos_prefix + "/bin/chaosRoot --conf-file " + chaos_prefix + "/etc/chaos_root.cfg --rootopt \"-q " + path + parm + "\"";
							} else if (language == "bash") {
							  launch_arg = "bash " + path + parm;
							} else if (language == "nodejs") {
							  launch_arg = "node " + path + parm;
	
							} else if (language == "python") {
							  launch_arg = "python " + path + parm;
	
							} else {
							  launch_arg = language + " " + path + parm;
							}
							jchaos.rmtCreateProcess(server + ":8071", name, launch_arg, language, workingdir, function (r) {
							  console.log("Script running onto:" + server + " :" + JSON.stringify(r));
							  if(typeof okhandle !== "undefined") okhandle(r);
							}, function (bad) {
							  console.log("Some error getting loading script:" + bad);
							  if(typeof errorhandle !== "undefined") errorhandle("Failed to start " + bad);
	
							});
	
	
						  }
						}, function (bad) {
						  console.log("Some error getting environment:" + bad);
						  if(typeof errorhandle !== "undefined") errorhandle("Failed to start " + bad);
	
						});
					  }
	
					}
				  }, function (bad) {
					console.log("Some error  loading script:" + bad); 	  
					if(typeof errorhandle !== "undefined")
					errorhandle("Exception  loading:" + bad);
	
				  });
				});
			  });
			}
	
		  };
		});
	  }
	  
  
		/**
		 * This function check for a variable change on a 'devlist', for 'retry' times, checking every 'checkFreq'
		 * 'checkFunc' takes in input the live and realize the check 
		 * okhandle is called if success
		 * nokhandle if fails
		 * */

		jchaos.checkLive = function (str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle) {
			var tot_ok = 0;
			//console.log(" checking Live of " + devlist + " every:" + checkFreq + " ms");
			jchaos.getChannel(devlist, -1, function (ds) {
				var cnt = 0;
				ds.forEach(function (elem) {
					if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("ndk_uid")) {
						if (checkFunc(elem)) {
							tot_ok++;
							console.log("\x1B[1m" + str + "\x1B[1m\t\x1B[32m\x1B[1mOK\x1B[22m\x1B[39m \x1B[1m" + elem.health.ndk_uid + "\x1B[22m " + tot_ok + "/" + devlist.length);

						} else {
							if (retry > 1) {
								console.log("\x1B[1m" + str + "\x1B[1m\t-" + retry + "- \x1B[33m\x1B[1m" + elem.health.ndk_uid + "\x1B[22m\x1B[39m " + tot_ok + "/" + devlist.length);
							} else {
								console.log("\x1B[1m" + str + "\x1B[1m\t-" + retry + "- \x1B[31m\x1B[1m" + elem.health.ndk_uid + "\x1B[22m\x1B[39m " + tot_ok + "/" + devlist.length);
							}
						}
					} else {
						if (retry > 1) {
							console.log("\x1B[1m" + str + "\x1B[1m\t-" + retry + "- \x1B[33m\x1B[1m missing/malformed health " + devlist[cnt] + "\x1B[22m\x1B[39m " + tot_ok + "/" + devlist.length);
						} else {
							console.log("\x1B[1m" + str + "\x1B[1m\t-" + retry + "- \x1B[31m\x1B[1m missing/malformed health " + devlist[cnt] + "\x1B[22m\x1B[39m " + tot_ok + "/" + devlist.length);
						}
					}
					cnt++;
				});
			}, function () {
				console.log(str + " getChannel failed " + retry);

				if (tot_ok == devlist.length) {
					okhandle();
					return;
				}
			});

			setTimeout(function () {
				if (tot_ok == devlist.length) {
					okhandle();
					return;
				} else if (--retry > 0) {
					console.log(str + " retry check... " + retry);

					jchaos.checkLive(str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle);
				} else {
					console.log(str + " expired maximum number of retry...");

					nokhandle();
				}
			}, checkFreq);
		}
		return jchaos;
	}
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {


		module.exports = createLibrary();

	} else {
		window.jchaos = createLibrary();
	}
}).call(this);
