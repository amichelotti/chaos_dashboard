/**
 * !CHAOS REST Library
 */

(function () {
	function createLibrary() {
		var jchaos = {};
		jchaos['latency']=0;
		jchaos['latency_avg']=0;
		jchaos['latency_tot']=0;
		jchaos['errors']=0;
		jchaos['timeouts']=0;
		jchaos['nops']=0;

		jchaos['numok']=0;

		jchaos.extendJson=function(key, n) {
			// Filtraggio delle proprietà
			if(Number(n) === n && n % 1 !== 0){
				var obj={$numberDouble:n.toString()};
				return obj;
			}
			
			return n;
		  }
		  jchaos.extendStringKey=function(obj, key) {
			if(obj.hasOwnProperty(key)){
				try{
					  var o=JSON.parse(obj[key]);
					  obj[key]=JSON.stringify(o,jchaos.extendJson);
			
					} catch(e){
			
					}
					return obj;	
			}
			// Filtraggio delle proprietà
			if(Number(n) === n && n % 1 !== 0){
				var obj={$numberDouble:n.toString()};
				return obj;
			}
			
			return n;
		  }
		jchaos.ops_on_going = 0;
		jchaos.ops_abort = false;
		jchaos.lastChannel = {};
		var uri_default = "localhost:8081";

		jchaos.options = {
			updateEachCall: false,
			uri: uri_default,
			async: true,
			limit_on_going: 10000,
			history_page_len: 1000,
			timeout: 5000,
			console_log: function (str) { console.log(str); },
			console_err: function (str) { console.error(str); }

		};

		/**
		 * return an object from a full path description
		 */
		jchaos.decodeCUPath=function (cupath) {
			var regex_vect = /(.*)\/(.*)\/(.*)\[([-\d]+)\]$/;
		
			var regex = /(.*)\/(.*)\/(.*)$/;
			var tmp = {
			  cu: null,
			  dir: null,
			  var: null,
			  const: null,
			  origin: cupath
			};
			if ($.isNumeric(cupath)) {
			  tmp = {
				cu: null,
				dir: null,
				var: null,
				const: Number(cupath),
				index: null, // in case of vectors
				origin: cupath
			  };
			  return tmp;
			}
			var match = regex_vect.exec(cupath);
			if (match != null) {
			  tmp = {
				cu: match[1],
				dir: match[2],
				var: match[3],
				const: null,
				index: match[4],
				origin: cupath
			  };
			  return tmp;
			}
			match = regex.exec(cupath);
			if (match != null) {
			  tmp = {
				cu: match[1],
				dir: match[2],
				var: match[3],
				const: null,
				index: null,
				origin: cupath
			  };
			}
			return tmp;
		  }


		  jchaos.isCollapsable=function (arg) {
			return arg instanceof Object && Object.keys(arg).length > 0;
		  }

		  jchaos.toHHMMSS=function (sec_num) {

			// var sec_num = parseInt(this, 10); // don't forget the second param	
			var days = Math.floor(sec_num / 86400);
			var hours = Math.floor((sec_num - (days * 86400)) / 3600);
			var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
			var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);
		
			if (days < 10) {
			  days = "0" + days;
			}
			if (hours < 10) {
			  hours = "0" + hours;
			}
			if (minutes < 10) {
			  minutes = "0" + minutes;
			}
			if (seconds < 10) {
			  seconds = "0" + seconds;
			}
		
			return days + ' days ' + hours + ':' + minutes + ':' + seconds;
		  }
		/***
		 * 
		 */
		jchaos.createMotor = function (name, endOphandler, switchHandler) {

			var obj = {
				name: name,
				lastpos: 0,
				limit1: false,
				limit2: false,
				home: false,

				// move absolute
				mov: function (pos) {

				},
				// move relative
				movr: function (pos) {

				},
				// do home
				gohome: function () {

				},
				pos: function () {

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
		jchaos.basicRmt = function (server, func, param, handler, badhandler) {
			if (handler instanceof Function) {
				jchaos.basicPost("api/v1/restconsole/" + func, JSON.stringify(param), function (r) {
					if (handler instanceof Function) {
						handler(r);
					} else {
						return r;
					}
				}, badhandler, server);
			} else {
				return jchaos.basicPost("api/v1/restconsole/" + func, JSON.stringify(param), null, null, server);

			}
		}
		/**
		 * Retrive a given environemnt variable
		 */
		jchaos.rmtGetEnvironment = function (server, varname, handler, badhandler) {
			var param = {};
			param['variable'] = varname;
			return jchaos.basicRmt(server, "getenv", param, handler, badhandler);
		}
		/**
		 * Set a Property
		 */
		jchaos.rmtSetProp = function (server, prop, handler, badhandler) {
			return jchaos.basicRmt(server, "setprop", prop, handler, badhandler);
		}
		/**
		 * Retrive a given environemnt variable
		 * return a process structure
		 */
		jchaos.rmtCreateProcess = function (server, name, cmdline, ptype, workdir, handler, badhandler) {
			var param = {};
			param['cmdline'] = cmdline;
			param['ptype'] = ptype;
			param['pname'] = name;
			if (workdir != null && workdir != "") {
				param['workdir'] = workdir;
			}
			console.log("create process:" + JSON.stringify(param));
			return jchaos.basicRmt(server, "create", param, handler, badhandler);
		}
		/**
			 * Retrive a process working directory 
			 * return a zip file
			 */
		jchaos.rmtDownload = function (server, uid, workdir, handler, badhandler) {
			var param = {};
			param['uid'] = uid;
			if (workdir != null && workdir != "") {
				param['workdir'] = workdir;
			}

			console.log("Download process outputs:" + JSON.stringify(param));
			return jchaos.basicRmt(server, "download", param, handler, badhandler);
		}
		/**
		 * Upload a new Script 
		 * return the path 
		 */
		jchaos.rmtUploadScript = function (server, name, ptype, content, handler, badhandler) {

			if ((name instanceof Object) && (ptype instanceof Function) && (content instanceof Function)) {
				return jchaos.basicRmt(server, "load", name, ptype, content);
			}
			var param = {};
			param['script_name'] = name;
			param['eudk_script_language'] = ptype;
			param['eudk_script_content'] = btoa(unescape(encodeURIComponent(content)));
			return jchaos.basicRmt(server, "load", param, handler, badhandler);

		}
		/***
		 * Return a list of process on the given server
		 */
		jchaos.rmtListProcess = function (server, handler, badhandler) {
			var param = {};
			return jchaos.basicRmt(server, "list", param, handler, badhandler);

		}
		/***
		 * Set the console of a specified process uid
		 */
		jchaos.rmtSetConsole = function (server, uid, str, handler, badhandler) {
			var param = {};
			param['uid'] = uid;
			param['data'] = btoa(unescape(encodeURIComponent(str + "\n")));
			return jchaos.basicRmt(server, "setconsole", param, handler, badhandler);
		}
		/***
		 * Get the console of a specified process uid
		 */
		jchaos.rmtGetConsole = function (server, uid, fromline, toline, handler, badhandler) {
			var param = {};
			param['uid'] = uid;
			param['fromline'] = fromline;
			param['toline'] = toline;

			return jchaos.basicRmt(server, "getconsole", param, handler, badhandler);
		}

		/***
		 * Get the console of a specified process uid
		 */
		jchaos.rmtKill = function (server, uid, handler, badhandler) {
			var param = {};
			param['uid'] = uid;

			return jchaos.basicRmt(server, "kill", param, handler, badhandler);
		}

		/***
		 * Purget list of process to a given level (0 soft (EXCEPTION), 1 medium (ENDED and EXCEPTION), 2 hard (ALL))
		 */
		jchaos.rmtPurge = function (server, level, handler, badhandler) {
			var param = {};
			param['level'] = level;

			return jchaos.basicRmt(server, "purge", param, handler, badhandler);
		}
		/******************************/
		/****** WIDGET */
		jchaos.progressBar = function (msg, id, lab) {
			var progressbar;
			var instant = $('<div></div>').html('<div id="' + id + '"><div class="progress-label">' + lab + '</div></div>').dialog({

				title: msg,
				position: "top",
				open: function () {
					progressbar = $("#" + id)
					var progressLabel = $(".progress-label");
					progressbar.progressbar({
						value: false,
						change: function () {
							var val = progressbar.progressbar("value");
							progressLabel.text(val + "%");
						},
						complete: function () {
							$(this).parent().dialog("close");
						}
					});
				}, close: function () {
					$(this).remove();
				}
			});
		}
		/***** */
		jchaos.basicPost = function (func, params, handleFunc, handleFuncErr, server) {
			var request;
			var now = (new Date()).getTime();

			if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
				XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
			}
			request = new XMLHttpRequest();

			var srv = jchaos.options.uri;
			XMLHttpRequest.responseType = "json";
			if (typeof server === "string") {
				srv = server;
			}
			var url = "http://" + srv + "/" + func;
			var could_make_async = (typeof handleFunc === "function");
			if (could_make_async == false) {
				request.open("POST", url, false);
				// request.timeout = jchaos.options.timeout; //not possiblee for sync

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
			jchaos['nops']++;

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
									var lat = (new Date()).getTime()-now;
									jchaos['latency']=lat;
									jchaos['latency_tot']+=lat;
									jchaos['numok']=jchaos['numok']+1;
									jchaos['latency_avg']=jchaos['latency_tot']/jchaos['numok'];
									handleFunc(json);
								} catch (err) {
									console.trace("trace:");
									var str = "handler function error:'" + err + "' url:'" + url + "' post data:'" + params + "' response:'" + request.responseText + "'";
									jchaos.perror(str);
									if (typeof handleFuncErr === "function") {
										handleFuncErr(json);
									}
								}
							}
							return json;

						} catch (err) {
							var str = "jchaos.basicPost Error parsing json '" + err + "' body returned:'" + request.responseText + "'" + "' post:'" + params + "'";;


							//console.error(str);
							jchaos.perror(str);
							//throw str;
							if ((typeof handleFuncErr === "function")) {
								handleFuncErr(request.responseText);
							} else {
								if (could_make_async) {
									handleFunc(request.responseText);
								} else {
									return request.responseText;
								}
							}

						}
					} else {
						var json;
						var str;
						jchaos['errors']++;
						try {
							json = JSON.parse(request.responseText);
							str = "Error '" + request.status + "' API '" + params + "'  returned:'" + request.responseText + "'";
						} catch (pr) {
							json = request.responseText;
							str = "jchaos.basicPost Error parsing json body returned:'" + request.responseText + "'" + "' post:'" + params + "'";;
						}
						var str = "POST " + url + " body:\"" + params + "\" went wrong, result:" + request.status + " state:" + request.readyState;
						jchaos.perror(str);
						if (handleFuncErr != null && (typeof handleFuncErr === "function")) {
							handleFuncErr(json);
						} else {
							if ((typeof json === "object")) {
								if (json.hasOwnProperty('error_status')) {
									alert(json.error_status);
								}
							} /*else {
								alert(str);
							}*/



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
				jchaos['timeouts']++;

				console.error("request TIMEOUT:" +e.currentTarget.timeout);
				//throw "error:" + request.statusText;
				if (handleFuncErr != null && (typeof handleFuncErr === "function")) {
					handleFuncErr("timeout "+e.currentTarget.timeout+" reached");
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
				jchaos.basicPost(str_url_cu, JSON.stringify(obj,jchaos.extendJson), null);
				return;

			}

			jchaos.basicPost(str_url_cu, JSON.stringify(obj,jchaos.extendJson), function (datav) { handleFunc(datav); });

		}
		jchaos.mdsBase = function (cmd, opt, handleFunc, errFunc) {
			var param = "cmd=" + cmd + "&parm=" + JSON.stringify(opt,jchaos.extendJson);
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
		jchaos.checkRestore = function (_tagname, _node_list, _timeout, _okhandler, _nokhandler) {
			var checkFreq = _timeout / 10;
			var retry = 10;
			if (_node_list == null) {
				_node_list = jchaos.search(_tagname, "insnapshot", true);
			}
			jchaos.checkPeriodiocally("checkRestore", retry, checkFreq, function () {
				var data = jchaos.getChannel(_node_list, 3, null);
				var oks = 0;
				data.forEach(function (ds) {
					if ((ds.busy == false) && (ds.cudk_set_tag == _tagname) && (ds.cudk_set_state == 3)) {
						jchaos.print(ds.ndk_uid + " OK reached");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " NOT YET busy:" + ds.busy + " restore state:" + ds.cudk_set_state);

					}
				});
				if (oks == _node_list.length) {
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
		jchaos.checkBurstRunning = function (_tagname, _node_list, _timeout, _okhandler, _nokhandler) {
			var checkFreq = _timeout / 10;
			var retry = 10;

			jchaos.checkPeriodiocally("checkBurstRunning", retry, checkFreq, function () {
				var data = jchaos.getChannel(_node_list, 3, null);
				var oks = 0;
				data.forEach(function (ds) {
					if ((ds.cudk_burst_state == true) && (ds.cudk_burst_tag == _tagname)) {
						jchaos.print(ds.ndk_uid + " OK tagging");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " NOT YET ACQUIRING, burst state:" + ds.cudk_burst_state + " burst tag:" + ds.cudk_burst_tag);

					}
				});
				if (oks == _node_list.length) {
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
		jchaos.checkEndBurst = function (_node_list, _timeout, _okhandler, _nokhandler) {
			var checkFreq = _timeout / 10;
			var retry = 10;

			jchaos.checkPeriodiocally("checkEndBurst", retry, checkFreq, function () {
				var data = jchaos.getChannel(_node_list, 3, null);
				var oks = 0;
				data.forEach(function (ds) {
					if ((ds.cudk_burst_state == false)) {
						jchaos.print(ds.ndk_uid + " OK End");
						oks++;
					} else {
						jchaos.print(ds.ndk_uid + " STILL ACQUIRING burst state:" + ds.cudk_burst_state + " burst tag:" + ds.cudk_burst_tag);

					}
				});
				if (oks == _node_list.length) {
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
			if(typeof _parent  === 'function'){
				handleFunc=_parent;
				if(typeof value_ === 'function'){
					nok=value_;
				}
				_parent="";
				value_=null;
			}
			opt['parent'] = _parent;


			if (value_ != null) {
				try {
					JSON.stringify(value_); // check if json
					opt['value'] = value_;
					console.log("param:" + JSON.stringify(opt,jchaos.extendJson));
				} catch (e) {
					console.error("not a valid json error :'" + e + "' value:" + value_);
					return;
				}
			}
			return jchaos.mdsBase("node", opt, handleFunc, nok);
		}

		jchaos.loadScript = function (_name, seqid, handleFunc, errFunc) {
			var opt = {};
			var value = {
				"seq": seqid,
				"script_name": _name
			};
			opt['name'] = "";
			opt['what'] = "load";
			opt['value'] = value;
			return jchaos.mdsBase("script", opt, handleFunc, errFunc);
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
		jchaos.searchScriptInstance = function (script_name, search_string, handleFunc, errfunc) {
			var opt = {};
			var script_desc = {};
			script_desc['script_name'] = script_name;
			script_desc['search_string'] = search_string;

			opt['name'] = "";
			opt['what'] = "searchInstance";
			opt['value'] = script_desc;
			return jchaos.mdsBase("script", opt, handleFunc, errfunc);
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
					opt['value'] = JSON.stringify(value_,jchaos.extendJson);

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
		jchaos.search = function (_name, _what, _alive, opts,handleFunc,handlerr) {

			var opt = {
				name: _name,
				what: _what,
				alive: _alive
			};
			if (_name instanceof Array) {
				delete opt['name'];
				opt['names']=_name;
			}
			if(typeof opts === "function"){
				handlerr=handleFunc;
				handleFunc=opts;
			} else if(typeof opts ==="object"){
				for(var i in opts){
					//pagelen number of objects
					//start
					opt[i]=opts[i];
				}
			}
			
			return jchaos.mdsBase("search", opt, handleFunc,handlerr);

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
		jchaos.storageLive = function (dev, enable, handleFunc, errFunc) {
			jchaos.getChannel(dev, 3, function (cus) {
				cus.forEach(function (elem, index) {
					if (elem.hasOwnProperty('dsndk_storage_type')) {
						var val = Number(elem.dsndk_storage_type);
						val = (val & 0x1) | (enable << 1);
						jchaos.setProperty(cus[index].ndk_uid, [{ "dsndk_storage_type": val }]);

					}
				})
				handleFunc();
			}, errFunc);
		}
		/***
		 * storageHisto
		 * \brief enable/disable history cu
		 * @param dev list of cu
		 * @param enable enable disable
		 * @param handleFunc call back to call if success
		 * @param errFunc callback to call if error 
		 */
		jchaos.storageHisto = function (dev, enable, handleFunc, errFunc) {
			jchaos.getChannel(dev, 3, function (cus) {
				cus.forEach(function (elem, index) {
					if (elem.hasOwnProperty('dsndk_storage_type')) {
						var val = Number(elem.dsndk_storage_type);
						val = (val & 0x2) | (enable & 1);
						jchaos.setProperty(cus[index].ndk_uid, [{ "dsndk_storage_type": val }]);

					}
				})
				handleFunc();
			}, errFunc);
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
			if ((cmd instanceof Object) && ((typeof param === "function") || (typeof param === "undefined"))) {
				// all coded into cmd, handlefunc
				var parm = "";
				var prio = 0;
				var mode = 0;
				var cm = "";
				handleFuncErr = handleFunc;
				handleFunc = param;
				if (cmd.hasOwnProperty('cmd')) {
					cm = cmd['cmd'];
				} else {
					throw ("'cmd' must be specified");
				}
				if (cmd.hasOwnProperty('param')) {
					parm = cmd['param'];
				}
				if (cmd.hasOwnProperty('prio')) {
					prio = cmd['param'];
				}
				if (cmd.hasOwnProperty('mode')) {
					mode = cmd['mode'];
				}

				jchaos.sendCUFullCmd(devs, cm, parm, mode, prio, handleFunc, handleFuncErr);

			} else {

				jchaos.sendCUFullCmd(devs, cmd, param, 0, 0, handleFunc, handleFuncErr);
			}
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
				params = JSON.stringify(param,jchaos.extendJson);
			} catch (e) {
				params = param;

			}
			var str_url_cu = "dev=" + dev_array + "&cmd=" + cmd + "&mode=" + force + "&prio=" + prio;
			if (params != "") {
				str_url_cu = str_url_cu + "&parm=" + params;
			}
			jchaos.print("sending command: " + str_url_cu);

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
		jchaos.getHistory = function (devs, channel, start, stop, varname, handleFunc, tagsv, funcerr) {
			var result = {
				X: [],
				Y: [],
				nitems: 0
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
				if (tagsv.length > 0) {
					opt['tags'] = tagsv;
				}
			} else if (typeof tagsv==="string"){
				opt['tags'] = [tagsv];

			} else if (tagsv instanceof Object) {
				for (var k in tagsv) {
					opt[k] = tagsv[k];
				}
			}

			opt['channel'] = channel;
			if (!opt.hasOwnProperty('page')) {
				opt['page'] = jchaos.options.history_page_len;
			}
			if (varname !== "undefined" && (typeof varname !== "string")) {
				opt['var'] = varname;
			}
			
			jchaos.getHistoryBase(devs, opt, 0, 0, result, handleFunc, funcerr);

		}

		jchaos.fetchHistoryToZip = function (zipname, cams, start, stop, tagsv, updateCall, errCall) {
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
					if ((ds.Y[0] instanceof Object)) {
						if ((ds.Y[0].hasOwnProperty("FRAMEBUFFER")) && (ds.Y[0].FRAMEBUFFER.hasOwnProperty("$binary")) && (ds.Y[0].hasOwnProperty("FMT"))) {
							ds.Y.forEach(function (img) {

								var name = ci + "/" + img.dpck_ats  + "_" + img.cudk_run_id + "_" + img.dpck_seq_id + "" + img.FMT;
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
						if (typeof errCall == "function") {
							errCall("Nothing found from " + start + " to:" + stop);
						}
					}
				}, tagsv);
			});


		}

		jchaos.getHistoryBase = function (devs, opt, seq, runid, result, handleFunc, funcErr) {
			var cmd = "queryhst";
			var dev_array = jchaos.convertArray2CSV(devs);

			opt['seq'] = seq;
			opt['runid'] = runid;

			var str_url_cu = "dev=" + dev_array + "&cmd=" + cmd + "&parm=" + JSON.stringify(opt,jchaos.extendJson);
			var start_string=(new Date(opt.start)).toLocaleString();
			var stop_string=(new Date(opt.end)).toLocaleString();

			console.log("getHistory "+dev_array+ " (seqid:" + seq + " runid:" + runid + ") start:" + start_string + " end:" + stop_string + " page:" + opt.page);
			jchaos.basicPost("CU", str_url_cu, function (datav) {
				var ret = true;
				if (datav.data instanceof Array) {
					result['nitems'] += datav.data.length;

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
				result['devs'] = devs;
				result['query'] = opt;
				result['end'] = datav.end;
				result['runid'] = datav.runid;
				result['seqid'] = datav.seqid;
				if (jchaos.options.updateEachCall) {
					if (datav.hasOwnProperty("count")) {
						result["count"] = datav.count;
					}
					ret = handleFunc(result);
					result.X = [];
					result.Y = [];

				} else {
					if (datav.end == 1) {
						// update if 0 or something else
						if (datav.hasOwnProperty("count")) {
							result["count"] = datav.count;
						}
						handleFunc(result);

					}
				}
				if (ret && (datav.end == 0)) {
					if (datav.hasOwnProperty("count")) {
						opt["count"] = datav.count;
					}
					jchaos.getHistoryBase(devs, opt, datav.seqid + 1, datav.runid, result, handleFunc, funcErr);
				}
			}, funcErr);
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
			if (typeof name === "undefined") {
				saveAs(blob, "configuration.json");
			} else {
				saveAs(blob, name + ".json");

			}
		}
		jchaos.removeAllAssociation=function(cuid){
			var agl=jchaos.search("","agent",false,false);
			jchaos.node(agl, "del", "agent", cuid, null);

			/*for(var l in agl){
				var agent=agl[l];
				jchaos.node(agent, "del", "agent", cuid, null);
				
			}*/
			return;
		}
			
		/*jchaos.agentSave=function (json, obj) {
		if (json.hasOwnProperty("andk_node_associated") && (json.andk_node_associated instanceof Array)) {
			json.andk_node_associated.forEach(function (tostay) {
				jchaos.removeAllAssociation(tostay.ndk_uid);
			});
			var node_selected = obj.node_selected;

			  json.andk_node_associated.forEach(function (item) {
				jchaos.node(node_selected, "set", "agent", null, item, function (data) {
				  console.log("agent save: \"" + node_selected + "\" value:" + JSON.stringify(json));
				  if (item.node_log_at_launch) {
					jchaos.node(item.ndk_uid, "enablelog", "agent", null, null, function (data) {
					});
				  } else {
					jchaos.node(item.ndk_uid, "disablelog", "agent", null, null, function (data) {
		
					});
				  }
				  return 0;
				});
			  });
			} 
		  }*/

		  jchaos.agentSave=function (json, obj) {
			// remove all the associations
			if (obj != null) {
			  var node_selected = obj.node_selected;
			  var list_to_remove = [];
			  jchaos.node(node_selected, "info", "agent", function (data) {
				if (data.hasOwnProperty("andk_node_associated") && (data.andk_node_associated instanceof Array)) {
				  //rimuovi tutte le associazioni precedenti.
				  data.andk_node_associated.forEach(function (item) {
					if (item.hasOwnProperty("ndk_uid")) {
					  var found = false;
					  if (json.hasOwnProperty("andk_node_associated") && (json.andk_node_associated instanceof Array)) {
						json.andk_node_associated.forEach(function (tostay) {
						  if (tostay.ndk_uid == item.ndk_uid) {
							found = true;
						  }
						});
		
					  }
					  if (found == false) {
						list_to_remove.push(item.ndk_uid);
					  }
					}
				  });
				  list_to_remove.forEach(function (item) {
					console.log("Agent remove association " + item);
					jchaos.node(node_selected, "del", "agent", item, function (daa) { });
				  });
				}
			  });
			}
		
			if (json.hasOwnProperty("andk_node_associated") && (json.andk_node_associated instanceof Array)) {
			  json.andk_node_associated.forEach(function (item) {
				jchaos.node(node_selected, "set", "agent", null, item, function (data) {
				  console.log("agent save: \"" + node_selected + "\" value:" + JSON.stringify(json));
				  if (item.node_log_at_launch) {
					jchaos.node(item.ndk_uid, "enablelog", "agent", function (data) {
					});
				  } else {
					jchaos.node(item.ndk_uid, "disablelog", "agent", function (data) {
		
					});
				  }
				  return 0;
				});
			  });
			} 
		  }


		jchaos.unitServerSave = function (json, obj) {
			if ((json == null) || !json.hasOwnProperty("ndk_uid")) {
				alert("no ndk_uid key found");
				return 1;
			}
			if (json.ndk_uid == "") {
				alert("US name cannot be empty");
				return 2;
			}
			var node_selected = json.ndk_uid;
			if (node_selected == null || node_selected == "") {
				alert("not US selected!");
				return 3;
			}

			var data = jchaos.node(node_selected, "get", "us", "", null, null);


			if ((data instanceof Object) && data.hasOwnProperty("us_desc")) {
				if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
					data.us_desc.cu_desc.forEach(function (item) {
						var found = false;
						// remove just the cu not present in new configuration
						json.cu_desc.forEach(function (items) {
							if (items.ndk_uid == item.ndk_uid) {
								found = true;
							}
						});
						if ((found == false) && (item.ndk_uid != "")) {
							console.log("deleting cu:\"" + item.ndk_uid + "\"");
							jchaos.node(item.ndk_uid, "del", "cu", node_selected, null);

						}
					});

				}
			}

			json.cu_desc.forEach(function (item,index) {
				json.cu_desc[index].ndk_parent = node_selected;
				json.cu_desc[index]=jchaos.extendStringKey(item,'cudk_load_param');
				if(item.hasOwnProperty('cudk_driver_description')){
					item.cudk_driver_description.forEach(function(el,i){
						json.cu_desc[index].cudk_driver_description[i]=jchaos.extendStringKey(el,'cudk_driver_description_init_parameter');
	
					});
	
				  }
  
			});
			jchaos.node(node_selected, "set", "us", "", json, function (data) {
				console.log("unitServer save: \"" + node_selected + "\" value:" + JSON.stringify(json));
			});
			return 0;
		}

		jchaos.cuSave=function (json, obj) {

			if ((json != null) && json.hasOwnProperty("ndk_uid")) {
			  var name = json.ndk_uid;
			  if (!json.hasOwnProperty("ndk_parent")) {
				alert("CU parent not defined");
				return 1;
			  }
			  json=jchaos.extendStringKey(json,'cudk_load_param');
			  if(json.hasOwnProperty('cudk_driver_description')){
				json.cudk_driver_description.forEach(function(elem,index){
					json.cudk_driver_description[index]=jchaos.extendStringKey(elem,'cudk_driver_description_init_parameter');

				});

			  }
		
			  jchaos.node(json.ndk_uid, "set", "cu", json.ndk_parent, json, function (data) {
				console.log("cu save: \"" + node_selected + "\" value:" + JSON.stringify(json,jchaos.extendJson));
			  });
			} else {
			  alert("No ndk_uid field found");
			}
			return 0;
		  }
		jchaos.newCuSave = function (json, obj) {
			var node_selected=null;
			if((typeof obj ==="object") && (obj.hasOwnProperty('node_selected'))){
				node_selected=obj.node_selected;
			} 
			if ((node_selected == null || node_selected == "")) {
				if (json.ndk_parent == "") {
					alert("not US selected!");
					return 1;
				} else {
					console.log("using US specified into CU:" + json.ndk_parent);
					var us_list = jchaos.search(json.ndk_parent, "us", false, false);
					if (us_list.length == 0) {
						alert("US specified in CU does not exist (create before)");
						return -1;
					}
					node_selected = json.ndk_parent;
				}
			}
			if (!json.hasOwnProperty("control_unit_implementation") || json.control_unit_implementation == "") {
				alert("You must specify a valid implementation 'control_unit_implementation' "+JSON.stringify(json));
				return 1;
			}
			if (!json.hasOwnProperty("ndk_uid") || json.ndk_uid == "") {
				alert("You must specify a valid UID 'ndk_uid'");
				return 1;
			}
			if (json.hasOwnProperty("ndk_uid") && (json.ndk_uid != "")) {
				jchaos.node(node_selected, "get", "us", "", null, function (data) {
					console.log("adding \"" + json.ndk_uid + "\" to US:\"" + node_selected + "\"");
					json.ndk_parent = node_selected;
					if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
						data.us_desc.cu_desc.push(json);
					} else {
						data.us_desc["cu_desc"] = [json];
					}
					jchaos.node(node_selected, "set", "us", "", data.us_desc, function (data) {
						console.log("unitServer save: \"" + name + "\" value:" + JSON.stringify(json));
					});
				});
			} else {
				alert("missing required field ndk_uid");
				return 1;
			}
			return 0;
		}
		/**
		 * restoreFullConfig
		 * @brief Restore a previously saved configuration
		 * @param json: the json configuration
		 * @param configToRestore: choose the items to restore
		 */
		jchaos.restoreFullConfig = function (config, configToRestore) {
			var node_selected = "";
			console.log("congigs to restore:"+JSON.stringify(configToRestore));
			console.log("To restore:"+JSON.stringify(config));

			if (!(configToRestore instanceof Array)) {
				return;
			}
			configToRestore.forEach(function (sel) {

				if (sel == "us") {
					if (config.hasOwnProperty('us') && (config.us instanceof Array)) {
						config.us.forEach(function (data) {
							
							if ((data!=null)&& data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
								data.us_desc.cu_desc.forEach(function (item) {
									jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
								});
								node_selected = data.us_desc.ndk_uid;

								jchaos.unitServerSave(data.us_desc);
							}
						});
					} else if (config.hasOwnProperty("us_desc")) {
						if (config.us_desc.hasOwnProperty("cu_desc") && (config.us_desc.cu_desc instanceof Array)) {
							config.us_desc.cu_desc.forEach(function (item) {
								jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
							});
							node_selected = config.us_desc.ndk_uid;
							jchaos.unitServerSave(config.us_desc);

						}
					};
				} else if (config.hasOwnProperty("cu_desc")) {

					var parent = config.cu_desc.ndk_parent;
					if (config.hasOwnProperty("cu_desc")) {
						var tmp = config.cu_desc;
						//jsonEdit(templ, tmp);
						jchaos.newCuSave(tmp);
					}
				}
				if ((sel == "agents") && config.hasOwnProperty('agents') && (config.agents instanceof Array)) {
					config.agents.forEach(function (json) {

						jchaos.agentSave(json.name, json.info);
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
		jchaos.activeAgentList = function (cb) {
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
		jchaos.activeAgentList = function (cb) {
			jchaos.search("", "agent", true, function (ag) {
				var agent_list = [];
				var cnt_agent=0;
				ag.forEach(function (elem) {
				  jchaos.node(elem,"info","agent",function(aginfo){
					if(aginfo.hasOwnProperty('instance_name')){
					  if((aginfo.instance_name=="")){
						aginfo.instance_name=elem;
					  }
					} else {
					  aginfo['instance_name']=elem;
					}
					agent_list.push(aginfo);
					if(++cnt_agent==ag.length){
					  if (typeof cb === "function") {
						cb(agent_list);
					  }
					}
				  });
				
				});
			   
			  });
		
		}

		/**
		  * getAllProcessInfo
		  * @brief return a vector of process information in the callback
		  * @param agl list of agents info
		  * @param cb: return a list of active agen
		  * 	   
		  * */
		jchaos.getAllProcessInfo = function (agl,cb) {
			var agent_obj = {};
			var proc_list = [];
			var tmpObj = {};
			var cnt = 0;
			var proc = {};
			agl.forEach(function (ser) {
				var server="";
				if(ser.hasOwnProperty('ndk_host_name')&&(ser.ndk_host_name!=="")){
					server=ser.ndk_host_name;
				} else {
					var regx = /(.+)\:(.+)/;
					var match = regx.exec(ser.ndk_rpc_addr);
					if (match) {
						server = match[1];
					}
				}
				
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
								p['parent'] = ser.instance_name;

								proc[p.uid] = p;
								proc_list.push(p.uid);
							});
						}
						if (++cnt >= agl.length) {
							tmpObj['data'] = proc;
							tmpObj['elems'] = proc_list;
							tmpObj['agents'] = agent_obj;
							if (typeof cb === "function") {
								cb(tmpObj);
							}
						}
					}, function (bad) {
						console.log("Some error state of server:" + server + " occur:" + bad);
						if (++cnt >= agl.length) {
							tmpObj['data'] = proc;
							tmpObj['elems'] = proc_list;
							tmpObj['agents'] = agent_obj;
							if (typeof cb === "function") {
								cb(tmpObj);
							}
						}
					});
				});
			
		}
		/**
		 * findBestServer
		 * @brief return a list of agents ordered by occupation in the callback
		 * @param cb: return a list of active agents
		 */
		jchaos.findBestServer = function (cb) {
			jchaos.activeAgentList(function(iagents){
			jchaos.getAllProcessInfo(iagents,function (ag) {
				var server = "";
				var idle = 0;
				var agents=ag['agents'];
				for (var i in agents) {
					if (agents[i]['idle'] > idle) {
						server = i;
						idle = agents[i]['idle'];
					}
				}
				cb(server);

			});
		})
	};

		/**
	 * runScript
	 * @brief Run the specified script on the chaos infrastructure
	 * @param name: the name of the script present in the DB
	 * @param parm: optional parameters
	 * @param okhandle: called when ok
	 * @param errorhandle: called when failed
	 */
		jchaos.runScript = function (name, parm, okhandle, errorhandle) {
			jchaos.search(name, "script", false, function (l) {
				if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)) {
					if (l.found_script_list.length > 0) {
						var seq = l.found_script_list[0].seq;
						console.log("found script:" + JSON.stringify(l.found_script_list[0]));
						jchaos.loadScript(name, seq, function (jsonscript) {
							jchaos.findBestServer(function (server) {
								if(server==""){
									if(typeof errorhandle==="function"){
										errorhandle("No server available");

									} else {
										throw "No Server Available";
									}
								}
								console.log("best server:" + server);

								jchaos.rmtUploadScript(server + ":8071", jsonscript, function (r) {
									if (r.err != 0) {
										if (typeof errorhandle !== "undefined") errorhandle(server + ": Load Script", "cannot load:" + r.errmsg);

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
													if (typeof errorhandle !== "undefined") errorhandle("Cannot retrive environment", "cannot read CHAOS_PREFIX:" + r.errmsg);
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
														if (typeof okhandle !== "undefined") okhandle(r);
													}, function (bad) {
														console.log("Some error getting loading script:" + bad);
														if (typeof errorhandle !== "undefined") errorhandle("Failed to start " + bad);

													});


												}
											}, function (bad) {
												console.log("Some error getting environment:" + bad);
												if (typeof errorhandle !== "undefined") errorhandle("Failed to start " + bad);

											});
										}

									}
								}, function (bad) {
									console.log("Some error  loading script:" + bad);
									if (typeof errorhandle !== "undefined")
										errorhandle("Exception  loading:" + bad);

								});
							});
						});
					}

				};
			});
		}
		/**
		 * Encode a path name
		 */
		jchaos.encodeName=function(str) {
			var tt = str.replace(/[\/\:\.]/g, "_");
			var rr = tt.replace(/\+/g, "_p");
			var kk = rr.replace(/\-/g, "_m")
			return kk;
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
