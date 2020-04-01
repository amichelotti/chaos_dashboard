<a name="module_jchaos"></a>

#### jchaos
<p>!CHAOS REST Library</p>

**Version**: 1.0  
**Author**: Andrea Michelotti  

* [jchaos](#module_jchaos)
    * [~decodeCUPath(cupath)](#module_jchaos..decodeCUPath) ⇒ <code>varpath</code>
    * [~toHHMMSS(sec_num)](#module_jchaos..toHHMMSS) ⇒ <code>string</code>
    * [~setOption(opt)](#module_jchaos..setOption)
    * [~basicRmt(server, func, param, handler, badhandler)](#module_jchaos..basicRmt)
    * [~rmtGetEnvironment(server, varname, handler, badhandler)](#module_jchaos..rmtGetEnvironment) ⇒
    * [~rmtSetProp(server, prop, handler, badhandler)](#module_jchaos..rmtSetProp) ⇒
    * [~rmtCreateProcess(server, name, cmdline, ptype, workdir, handler, badhandler)](#module_jchaos..rmtCreateProcess) ⇒ <code>object</code>
    * [~rmtCreateProcess(server, uid, workdir, handler, badhandler)](#module_jchaos..rmtCreateProcess)
    * [~rmtUploadScript(server, name, ptype, content, handler, badhandler)](#module_jchaos..rmtUploadScript) ⇒ <code>object</code>
    * [~rmtListProcess(server, handler, badhandler)](#module_jchaos..rmtListProcess) ⇒ <code>Array.&lt;object&gt;</code>
    * [~rmtKill(server, uid, handler, badhandler)](#module_jchaos..rmtKill)
    * [~rmtPurge(server, level, [handler], [badhandler])](#module_jchaos..rmtPurge)
    * [~basicPost(func, params, [handler], [badhandler], [server])](#module_jchaos..basicPost)
    * [~registerCU(cuid, obj, [handleFunc], [badhandler])](#module_jchaos..registerCU)
    * [~pushCU(cuid, obj, [handleFunc], [badhandler])](#module_jchaos..pushCU)
    * [~mdsBase(cmd, opt, [handleFunc], [errFunc])](#module_jchaos..mdsBase)
    * [~tag(tagname, node_list, tag_type, tag_value, [handleFunc], [nok])](#module_jchaos..tag)
    * [~checkRestore(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])](#module_jchaos..checkRestore)
    * [~checkBurstRunning(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])](#module_jchaos..checkBurstRunning)
    * [~checkEndBurst(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])](#module_jchaos..checkEndBurst)
    * [~snapshot(_name, _what, _node_list, [value_], [handleFunc], [nok])](#module_jchaos..snapshot)
    * [~node(_name, _what, _type, [_parent], [value_], handleFunc, nok)](#module_jchaos..node)
    * [~variable(_name, _what, [value_], [handleFunc], [handleFunc])](#module_jchaos..variable)
    * [~log(devs, _what, _type, _start, _end, [handleFunc], [handlerr])](#module_jchaos..log)
    * [~search(_name, _what, _alive, [handleFunc], [handlerr])](#module_jchaos..search) ⇒
    * [~findCUByImplementation(impl, alive, [handleFunc])](#module_jchaos..findCUByImplementation)
    * [~getCUStatus(status_to_search, [handleFunc])](#module_jchaos..getCUStatus)
    * [~convertArray2CSV(devs)](#module_jchaos..convertArray2CSV) ⇒ <code>string</code>
    * [~getChannel(devs, channel_id, [handleFunc], [badfunc])](#module_jchaos..getChannel) ⇒ <code>object</code>
    * [~setProperty(dev, prop, [handleFunc], [errFunc])](#module_jchaos..setProperty)
    * [~loadUnload(dev, loadunload, [handleFunc], [nok])](#module_jchaos..loadUnload)
    * [~sendCUCmd(devs, cmd, [param], [handleFunc], [handleFuncErr])](#module_jchaos..sendCUCmd)
    * [~sendCUFullCmd(devs, cmd, [param], force, prio, [handleFunc], [handleFuncErr])](#module_jchaos..sendCUFullCmd)
    * [~getHistory(devs, channel, start, stop, [varname], [handleFunc], [tagsv], [funcerr])](#module_jchaos..getHistory)
    * [~fetchHistoryToZip(zipname, cams, start, stop, [tagsv], updateCall, errCall)](#module_jchaos..fetchHistoryToZip)
    * [~checkPeriodiocally(str, retry, checkFreq, checkFunc, okhandle, nokhandle)](#module_jchaos..checkPeriodiocally)
    * [~saveFullConfig()](#module_jchaos..saveFullConfig)
    * [~restoreFullConfigFromFile()](#module_jchaos..restoreFullConfigFromFile)
    * [~restoreFullConfig(config, configToRestore)](#module_jchaos..restoreFullConfig)
    * [~activeAgentList(cb)](#module_jchaos..activeAgentList) ⇒ <code>Array.&lt;object&gt;</code>
    * [~getAllProcessInfo(agl, cb)](#module_jchaos..getAllProcessInfo)
    * [~findBestServer(cb:)](#module_jchaos..findBestServer) ⇒ <code>string</code>
    * [~runScript(name, [parm], [okhandle], [errorhandle])](#module_jchaos..runScript)
    * [~encodeName(str)](#module_jchaos..encodeName) ⇒ <code>string</code>
    * [~checkLive(str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle)](#module_jchaos..checkLive)
    * [~okcb](#module_jchaos..okcb) : <code>function</code>
    * [~badcb](#module_jchaos..badcb) : <code>function</code>
    * [~cmdPar](#module_jchaos..cmdPar) : <code>Object</code>
    * [~varpath](#module_jchaos..varpath) : <code>Object</code>
    * [~channelid](#module_jchaos..channelid) : <code>integer</code>
    * [~ChaosOption](#module_jchaos..ChaosOption) : <code>object</code>

<a name="module_jchaos..decodeCUPath"></a>

##### jchaos~decodeCUPath(cupath) ⇒ <code>varpath</code>
<p>Decode a CU dataset element path and return an object</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type |
| --- | --- |
| cupath | <code>string</code> | 

<a name="module_jchaos..toHHMMSS"></a>

##### jchaos~toHHMMSS(sec_num) ⇒ <code>string</code>
<p>translate seconds in days hours minutes seconds string</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>string</code> - <p>return string xx days hh:mm:ss</p>  

| Param | Type |
| --- | --- |
| sec_num | <code>integer</code> | 

<a name="module_jchaos..setOption"></a>

##### jchaos~setOption(opt)
<p>Set Library options options</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type |
| --- | --- |
| opt | <code>object</code> | 

<a name="module_jchaos..basicRmt"></a>

##### jchaos~basicRmt(server, func, param, handler, badhandler)
<p>Helper function to post commands on the process remote management</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| func | <code>string</code> | <p>REST function</p> |
| param | <code>object</code> | <p>REST function parameters</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtGetEnvironment"></a>

##### jchaos~rmtGetEnvironment(server, varname, handler, badhandler) ⇒
<p>Retrive a given environemnt variable</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <p>the value on the specified handler.</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| varname | <code>string</code> | <p>environment variable name</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtSetProp"></a>

##### jchaos~rmtSetProp(server, prop, handler, badhandler) ⇒
<p>Set the specified propery</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <p>the value on the specified handler.</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| prop | <code>Object</code> | <p>property name</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtCreateProcess"></a>

##### jchaos~rmtCreateProcess(server, name, cmdline, ptype, workdir, handler, badhandler) ⇒ <code>object</code>
<p>Launch a process the specified process on the given remote server<br>
return a process structure</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>object</code> - <p>return a process object with many status and information</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| name | <code>string</code> | <p>program name</p> |
| cmdline | <code>string</code> | <p>command line</p> |
| ptype | <code>string</code> | <p>type (&quot;exec&quot;: binary, &quot;C++&quot;: C++ script&quot;)</p> |
| workdir | <code>string</code> | <p>remote local directory</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtCreateProcess"></a>

##### jchaos~rmtCreateProcess(server, uid, workdir, handler, badhandler)
<p>Return a zip file contaning the working directory of the specified process<br>
can be used to retrieve outputs of remote runs</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| uid | <code>string</code> | <p>the process uid returned by the rmtCreateProcess</p> |
| workdir | <code>string</code> | <p>working dir to retrieve and zip</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtUploadScript"></a>

##### jchaos~rmtUploadScript(server, name, ptype, content, handler, badhandler) ⇒ <code>object</code>
<p>Upload a script/executable on the remote server<br>
return the path</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>object</code> - <p>return the path of the remote process</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| name | <code>string</code> | <p>program name</p> |
| ptype | <code>string</code> | <p>type (&quot;exec&quot;: binary, &quot;C++&quot;: C++ script&quot;)</p> |
| content | <code>string</code> | <p>base64 encoded content to upload</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtListProcess"></a>

##### jchaos~rmtListProcess(server, handler, badhandler) ⇒ <code>Array.&lt;object&gt;</code>
<p>Return a list of process on the given server</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>Array.&lt;object&gt;</code> - <p>return a list of process descriptors</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtKill"></a>

##### jchaos~rmtKill(server, uid, handler, badhandler)
<p>Kill the specified process</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| uid | <code>string</code> | <p>the process uid returned by the rmtCreateProcess</p> |
| handler | <code>okcb</code> | <p>handler on success</p> |
| badhandler | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..rmtPurge"></a>

##### jchaos~rmtPurge(server, level, [handler], [badhandler])
<p>Purge a list of process to a given level (0 soft (EXCEPTION), 1 medium (ENDED and EXCEPTION), 2 hard (ALL)</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| level | <code>integer</code> | <p>purge level</p> |
| [handler] | <code>okcb</code> | <p>handler on success</p> |
| [badhandler] | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..basicPost"></a>

##### jchaos~basicPost(func, params, [handler], [badhandler], [server])
<p>Helper function that is the base of all commands to the !CHAOS REST SERVER<br>
the server is specified in the option</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>string</code> | <p>REST function to perform</p> |
| params | <code>string</code> | <p>parameters</p> |
| [handler] | <code>okcb</code> | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | <code>badcb</code> | <p>handler on failure</p> |
| [server] | <code>string</code> | <p>override the default server</p> |

<a name="module_jchaos..registerCU"></a>

##### jchaos~registerCU(cuid, obj, [handleFunc], [badhandler])
<p>Registers a CU  dataset using REST</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| cuid | <code>string</code> |  |
| obj | <code>object</code> | <p>the CU dataset to register/push</p> |
| [handleFunc] | <code>okcb</code> | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..pushCU"></a>

##### jchaos~pushCU(cuid, obj, [handleFunc], [badhandler])
<p>Push a CU dataset using REST</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| cuid | <code>string</code> |  |
| obj | <code>object</code> | <p>the CU dataset to register/push</p> |
| [handleFunc] | <code>okcb</code> | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..mdsBase"></a>

##### jchaos~mdsBase(cmd, opt, [handleFunc], [errFunc])
<p>Helper function that wrap basic post used for query that regards generic MDS operations</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | <p>command to send</p> |
| opt | <code>object</code> | <p>options</p> |
| [handleFunc] | <code>okcb</code> | <p>handler on success, if present the call will be asynchronous</p> |
| [errFunc] | <code>badcb</code> | <p>handler on failure</p> |

<a name="module_jchaos..tag"></a>

##### jchaos~tag(tagname, node_list, tag_type, tag_value, [handleFunc], [nok])
<p>Start tagging a list of nodes for an interval of given time, expressed in cycles or ms</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| tagname | <code>string</code> |  |
| node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |
| tag_type | <code>integer</code> | <p>(2= time in ms, 1=cycles)</p> |
| tag_value | <code>integer</code> | <p>numer of ms or cycles</p> |
| [handleFunc] | <code>okcb</code> | <p>handler on success, if present the call will be asynchronous</p> |
| [nok] | <code>badcb</code> | <p>handler on failure</p> |

**Example**  
```js
//tagging for 10s two CU (cameras), give the name burstbyseconds  
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.tag("burstbyseconds",camera_list,2,10000,function(d){jchaos.print("tagging started");});
```
<a name="module_jchaos..checkRestore"></a>

##### jchaos~checkRestore(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Check if a lists of CU have done a correct snapshot restore, the check is performed every timeout/10 ms for maximum timeout</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | <code>okcb</code> |  |
| [_nokhandler] | <code>badcb</code> |  |

<a name="module_jchaos..checkBurstRunning"></a>

##### jchaos~checkBurstRunning(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Helper function to check if a burst is running</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | <code>okcb</code> |  |
| [_nokhandler] | <code>badcb</code> |  |

**Example**  
```js
// check the burst is running
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.checkBurstRunning("burstbyseconds",camera_list,10000,function(){jchaos.print("OK");},function(){chaos.error("BAD");})
```
<a name="module_jchaos..checkEndBurst"></a>

##### jchaos~checkEndBurst(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Check if a list of CU ended correct burst, the check is performed every timeout/10 ms for maximum timeout</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | <code>okcb</code> |  |
| [_nokhandler] | <code>badcb</code> |  |

**Example**  
```js
// check the burst is running
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.checkEndBurst(camera_list,10000,function(){jchaos.print("OK");},function(){chaos.error("BAD");})
```
<a name="module_jchaos..snapshot"></a>

##### jchaos~snapshot(_name, _what, _node_list, [value_], [handleFunc], [nok])
<p>Performs snapshot operations</p>
<pre><code>
create (create a new snapshot of the given list of CUs)
load (retrive a create snapshot)
set (create a snapshot from a value)
delete (delete a snapshot)
restore (restore a snapshot)
burst (perform a burst tag operation see <b>tag</b>)
</code></pre>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**See**: tag  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> | <p>name of the snapshot</p> |
| _what | <code>&quot;create&quot;</code> \| <code>&quot;load&quot;</code> \| <code>&quot;set&quot;</code> \| <code>&quot;delete&quot;</code> \| <code>&quot;restore&quot;</code> \| <code>&quot;burst&quot;</code> | <p>operation to perform</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>nodes to snapshot</p> |
| [value_] | <code>object</code> | <p>parameter for set command</p> |
| [handleFunc] | <code>okcb</code> |  |
| [nok] | <code>badcb</code> |  |

**Example**  
```js
// create a set point programmatically of a set of powersupply
var ps=["BTF/QUADRUPOLE/QUATB001","BTF/QUADRUPOLE/QUATB002","BTF/QUADRUPOLE/QUATB003"];
var powersupply_setpoint = {
			"input": {
				"ndk_uid": "undefined",
				"current": 0.1,
				"stby": true,
				"polarity": 1
			},
			"output": {
				"ndk_uid": "undefined",
				"current": 0.1,
				"stby": true,
				"polarity": 1,
				"local": false
			}
		};
		var snapshot_set = [];
			var polarity = 1;
			var current = Number(0.0000001);

			ps.forEach(function (elem) {
				var snap = powersupply_setpoint;
				snap.input.stby = true;
				snap.input.current = current;
				snap.input.ndk_uid = elem;
				snap.input.polarity = polarity;
				snap.output.ndk_uid = elem;
				snap.output.polarity = polarity;
				snap.output.stby = true;
				snap.output.current = current;
				polarity = polarity > 0 ? -1 : 1;
				jchaos.snapshot("zero-stby", "set", "", snap, function (d) {
					jchaos.print("set setpoint OK:"+JSON.stringify(snap));
				});
			});
```
<a name="module_jchaos..node"></a>

##### jchaos~node(_name, _what, _type, [_parent], [value_], handleFunc, nok)
<p>Perform and operation specified by '_what' onthe nodes of '_name' of type :'_type'</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>the name of the nodes where to perform the operation</p> |
| _what | <code>&quot;init&quot;</code> \| <code>&quot;deinit&quot;</code> \| <code>&quot;start&quot;</code> \| <code>&quot;stop&quot;</code> \| <code>&quot;get&quot;</code> \| <code>&quot;set&quot;</code> \| <code>&quot;del&quot;</code> \| <code>&quot;killcmd&quot;</code> \| <code>&quot;shutdown&quot;</code> \| <code>&quot;kill&quot;</code> \| <code>&quot;restart&quot;</code> \| <code>&quot;desc&quot;</code> \| <code>&quot;getlog&quot;</code> \| <code>&quot;health&quot;</code> \| <code>&quot;info&quot;</code> | <p>operation type</p> |
| _type | <code>&quot;us&quot;</code> \| <code>&quot;cu&quot;</code> \| <code>&quot;agent&quot;</code> | <p>target type of the command</p> |
| [_parent] | <code>string</code> | <p>some commands needs a parent node to be specified</p> |
| [value_] | <code>object</code> | <p>some commands needs a parameter</p> |
| handleFunc | <code>okcb</code> |  |
| nok | <code>badcb</code> |  |

**Example**  
```js
// stop|start|init|deinit a cu 
jchaos.node("BTF/QUADRUPOLE/QUATB001","stop","cu");
jchaos.node("BTF/QUADRUPOLE/QUATB001","start","cu");
```
<a name="module_jchaos..variable"></a>

##### jchaos~variable(_name, _what, [value_], [handleFunc], [handleFunc])
<p>Allows to manage variables that are persistent (on DB)</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |
| _what | <code>&quot;set&quot;</code> \| <code>&quot;get&quot;</code> \| <code>&quot;del&quot;</code> \| <code>&quot;search&quot;</code> | <p>operation type</p> |
| [value_] | <code>object</code> | <p>in case of set the object</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [handleFunc] | <code>badcb</code> | <p>callback if failure</p> |

**Example**  
```js
// store an object
var point={x:10.34,y:14.0};
jchaos.variable("mypoint","set",point);
// perform list
jchaos.variable("mypoint","search",function(ls){jchaos.print(JSON.stringify(ls));}); 
// get and visualize variable stored
jchaos.variable("mypoint","get",function(ls){jchaos.print(JSON.stringify(ls));});
// delete variable
jchaos.variable("mypoint","del");
```
<a name="module_jchaos..log"></a>

##### jchaos~log(devs, _what, _type, _start, _end, [handleFunc], [handlerr])
<p>Search logs for the given CUs</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>to search</p> |
| _what | <code>&quot;search&quot;</code> | <p>operation to perform</p> |
| _type | <code>&quot;all&quot;</code> \| <code>&quot;Info&quot;</code> \| <code>&quot;error&quot;</code> \| <code>&quot;warning&quot;</code> \| <code>&quot;log&quot;</code> \| <code>&quot;command&quot;</code> | <p>specify log type</p> |
| _start | <code>integer</code> | <p>epoch in ms start of the search</p> |
| _end | <code>integer</code> | <p>epoch md end of the search (-1 is now)</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [handlerr] | <code>badcb</code> | <p>callback if error</p> |

**Example**  
```js
// retrieve all logs for a given CU till now
jchaos.log("BTF/QUADRUPOLE/QUATB001","search","all",0,-1,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="module_jchaos..search"></a>

##### jchaos~search(_name, _what, _alive, [handleFunc], [handlerr]) ⇒
**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <p>an array of strings or objects</p>  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> | <p>is the substring of what you want search</p> |
| _what | <code>&quot;cu&quot;</code> \| <code>&quot;us&quot;</code> \| <code>&quot;agent&quot;</code> \| <code>&quot;cds&quot;</code> \| <code>&quot;webui&quot;</code> \| <code>&quot;variable&quot;</code> \| <code>&quot;snapshotsof&quot;</code> \| <code>&quot;snapshots&quot;</code> \| <code>&quot;script&quot;</code> \| <code>&quot;zone&quot;</code> \| <code>&quot;class&quot;</code> | <p>operation type</p> |
| _alive | <code>boolean</code> | <p>search among alive (true) or all(false)</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [handlerr] | <code>badcb</code> | <p>callback if error</p> |

**Example**  
```js
// search all CU alive
jchaos.search("","cu",true,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="module_jchaos..findCUByImplementation"></a>

##### jchaos~findCUByImplementation(impl, alive, [handleFunc])
<p>Find an array of CU with the given implementation</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| impl | <code>string</code> | <p>C++ implementation name to find</p> |
| alive | <code>bool</code> | <p>search from alive or all</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |

**Example**  
```js
// find implementation that starts with SCA(ctuators)
jchaos.findCUByImplementation("SCA",true,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="module_jchaos..getCUStatus"></a>

##### jchaos~getCUStatus(status_to_search, [handleFunc])
<p>Return an array of CU that match a given status</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| status_to_search | <code>string</code> |  |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |

<a name="module_jchaos..convertArray2CSV"></a>

##### jchaos~convertArray2CSV(devs) ⇒ <code>string</code>
<p>convert an array into a CommaSepareted elements</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>Array.&lt;string&gt;</code> | <p>array</p> |

<a name="module_jchaos..getChannel"></a>

##### jchaos~getChannel(devs, channel_id, [handleFunc], [badfunc]) ⇒ <code>object</code>
<p>Retrive the specified dataset correspoding to a given CU</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>object</code> - <p>the specified dataset</p>  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <p>CU or array of CU</p> |
| channel_id | <code>channelid</code> | <p>(-1: all,0: output, 1: input, 2:custom,3:system, 4: health, 5 cu alarm, 6 dev alarms,128 status)</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [badfunc] | <code>badcb</code> | <p>bad callback</p> |

**Example**  
```js
//retrive all channels of a give CU
chaos.getChannel("BTF/QUADRUPOLE/QUATB001",-1,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="module_jchaos..setProperty"></a>

##### jchaos~setProperty(dev, prop, [handleFunc], [errFunc])
<p>Set a CU property</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| dev | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| prop | <code>string</code> | <p>property name</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [errFunc] | <code>badcb</code> | <p>bad callback</p> |

<a name="module_jchaos..loadUnload"></a>

##### jchaos~loadUnload(dev, loadunload, [handleFunc], [nok])
<p>Load or Unload a CU</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| dev | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| loadunload | <code>bool</code> | <p>(true = load, false=unload)</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [nok] | <code>badcb</code> | <p>bad callback</p> |

<a name="module_jchaos..sendCUCmd"></a>

##### jchaos~sendCUCmd(devs, cmd, [param], [handleFunc], [handleFuncErr])
<p>Sends a command to a CU</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| cmd | <code>cmdPar</code> | <p>command to send</p> |
| [param] | <code>object</code> | <p>optional and my be included into cmd</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [handleFuncErr] | <code>badcb</code> | <p>bad callback</p> |

<a name="module_jchaos..sendCUFullCmd"></a>

##### jchaos~sendCUFullCmd(devs, cmd, [param], force, prio, [handleFunc], [handleFuncErr])
<p>Sends a command to a CU, with explicit params</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| cmd | <code>string</code> | <p>command to send</p> |
| [param] | <code>string</code> \| <code>object</code> |  |
| force | <code>integer</code> |  |
| prio | <code>integer</code> |  |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [handleFuncErr] | <code>badcb</code> | <p>bad callback</p> |

<a name="module_jchaos..getHistory"></a>

##### jchaos~getHistory(devs, channel, start, stop, [varname], [handleFunc], [tagsv], [funcerr])
<p>Retrive history of a channel dataset of a  group of devices</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| channel | <code>integer</code> | <p>channel to retrieve</p> |
| start | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| stop | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| [varname] | <code>string</code> | <p>optional name of the variable to retrieve (instead of all)</p> |
| [handleFunc] | <code>okcb</code> | <p>callback if ok, enable async mode</p> |
| [tagsv] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>optional tags</p> |
| [funcerr] | <code>badcb</code> | <p>optional bad callback</p> |

<a name="module_jchaos..fetchHistoryToZip"></a>

##### jchaos~fetchHistoryToZip(zipname, cams, start, stop, [tagsv], updateCall, errCall)
<p>Retrive history and write a local zip</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| zipname | <code>string</code> |  |
| cams | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>array of CU</p> |
| start | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| stop | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| [tagsv] | <code>Array.&lt;string&gt;</code> | <p>tags</p> |
| updateCall | <code>okcb</code> |  |
| errCall | <code>badcb</code> |  |

<a name="module_jchaos..checkPeriodiocally"></a>

##### jchaos~checkPeriodiocally(str, retry, checkFreq, checkFunc, okhandle, nokhandle)
<p>Helper function th check a periodically a condition<br>
the difference with check live is the check function don't receive a dataset in input</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**See**

- checkLive
- checkBurstRunning


| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to display each time the check is performed</p> |
| retry | <code>integer</code> | <p>retry the check for a maximum of number of time</p> |
| checkFreq | <code>integer</code> | <p>check frequency in ms</p> |
| checkFunc | <code>okcb</code> | <p>check function, should return true if ok or false if fails</p> |
| okhandle | <code>okcb</code> | <p>callback to call if test succeed</p> |
| nokhandle | <code>badcb</code> | <p>callback to call if fails</p> |

<a name="module_jchaos..saveFullConfig"></a>

##### jchaos~saveFullConfig()
<p>saveFullConfig<br>
Save to local disk the state of fundamental configurations</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Example**  
```js
//save the infrastructure info.
saveFullConfig();
```
<a name="module_jchaos..restoreFullConfigFromFile"></a>

##### jchaos~restoreFullConfigFromFile()
<p>Restore a full configuration from file</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
<a name="module_jchaos..restoreFullConfig"></a>

##### jchaos~restoreFullConfig(config, configToRestore)
<p>Restore a previously a configuration into the infrastructure</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| configToRestore | <code>Array.&lt;string&gt;</code> | <p>array of things to restore &quot;us&quot;,&quot;agents&quot;,&quot;snapshots&quot;,&quot;graphs&quot;,&quot;custom_group&quot;,&quot;cu_templates&quot;</p> |

<a name="module_jchaos..activeAgentList"></a>

##### jchaos~activeAgentList(cb) ⇒ <code>Array.&lt;object&gt;</code>
<p>activeAgentList<br>
return a list of agents addresses in the callback</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>Array.&lt;object&gt;</code> - <p>return in the callback the list descriptor of the agents</p>  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>okcb</code> | <p>callback called with the agent object list</p> |

**Example**  
```js
jchaos.activeAgentList(function(cb){jchaos.print(JSON.stringify(cb));})
```
<a name="module_jchaos..getAllProcessInfo"></a>

##### jchaos~getAllProcessInfo(agl, cb)
<p>Return a vector of process information in the callback</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| agl | <code>Array.&lt;string&gt;</code> | <p>list of agents info</p> |
| cb | <code>okcb</code> | <p>callback called with the agent object list</p> |

<a name="module_jchaos..findBestServer"></a>

##### jchaos~findBestServer(cb:) ⇒ <code>string</code>
<p>findBestServer<br>
return a list of agents ordered by occupation in the callback<br>
NOTE: this function use a tcp port the is different from REST server one (it goes directly on the server)</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>string</code> - <p>return the best server</p>  

| Param | Type | Description |
| --- | --- | --- |
| cb: | <code>okcb</code> | <p>return a list of active agents</p> |

**Example**  
```js
// find the best server to run a script:
jchaos.findBestServer(function(cb){jchaos.print(JSON.stringify(cb));})
```
<a name="module_jchaos..runScript"></a>

##### jchaos~runScript(name, [parm], [okhandle], [errorhandle])
<p>runScript<br>
Run the specified script on the chaos infrastructure</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>the name of the script present in the DB</p> |
| [parm] | <code>object</code> | <p>optional parameters</p> |
| [okhandle] | <code>okcb</code> | <p>called when ok</p> |
| [errorhandle] | <code>badcb</code> | <p>called when failed</p> |

<a name="module_jchaos..encodeName"></a>

##### jchaos~encodeName(str) ⇒ <code>string</code>
<p>Encode a path name<br>
removes trailing</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  
**Returns**: <code>string</code> - <p>encoded string</p>  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to encode</p> |

<a name="module_jchaos..checkLive"></a>

##### jchaos~checkLive(str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle)
<p>This function used mainly in tests.<br>
It checks for a variable change on a 'devlist', for 'retry' times, checking every 'checkFreq'<br>
'checkFunc' takes in input the live and realize the check<br>
okhandle is called if success<br>
nokhandle if fails</p>

**Kind**: inner method of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to display when the check is peformed</p> |
| devlist | <code>Array.&lt;string&gt;</code> | <p>list of CU to check</p> |
| retry | <code>integer</code> | <p>retry the ckeck for the given number of times</p> |
| checkFreq | <code>integer</code> | <p>check frequency expressed in ms</p> |
| checkFunc | <code>okcb</code> | <p>call back to call that perform the check, it takes in input the dataset to check, should return true if the check succeed or false if not</p> |
| okhandle | <code>okcb</code> | <p>callback to call if the test complete successfully</p> |
| nokhandle | <code>badcb</code> | <p>callback to call if the test fails</p> |

**Example**  
```js
// check if the list of CUs are in start
 var cu_status=["BTF/QUADRUPOLE/QUATB001","BTF/QUADRUPOLE/QUATB002","BTF/QUADRUPOLE/QUATB003"];
 jchaos.checkLive('check Start',cu_status, 20, 1000, function (ds) {jchaos.print("testing..."); return (ds!=null)&&ds.hasOwnProperty("health")&&ds.health.hasOwnProperty("nh_status")&&(ds.health.nh_status == "Start"); }, function () { jchaos.print("CHECK OK"); }, function () { jchaos.error("CHECK FAILED"); });
```
<a name="module_jchaos..okcb"></a>

##### jchaos~okcb : <code>function</code>
<p>Callback in asynchronous operations called when the operation is ok</p>

**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | <p>depend on the operation (typically a dataset)</p> |

<a name="module_jchaos..badcb"></a>

##### jchaos~badcb : <code>function</code>
<p>Callback in asynchronous operations called when the operation is fails</p>

**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>object</code> | <p>description of the error</p> |

<a name="module_jchaos..cmdPar"></a>

##### jchaos~cmdPar : <code>Object</code>
<p>The command object for sendCU commands</p>

**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | <p>command name</p> |
| prio | <code>integer</code> | <p>Priority</p> |
| mode | <code>integer</code> | <p>mode</p> |

<a name="module_jchaos..varpath"></a>

##### jchaos~varpath : <code>Object</code>
<p>CU variable path</p>

**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cu | <code>string</code> | <p>CU PATH</p> |
| dir | <code>string</code> | <p>direction (input,output)</p> |
| var | <code>string</code> | <p>variable dataset name</p> |
| const | <code>string</code> | <p>constantco:String</p> |
| origin | <code>string</code> | <p>full path</p> |

<a name="module_jchaos..channelid"></a>

##### jchaos~channelid : <code>integer</code>
<p>Channel idintification mapping:<br>
-1 : all<br>
0: output<br>
1: input<br>
2: custom<br>
3: system<br>
4: health<br>
5: cu alarms<br>
6: device alarms<br>
128: status<br>
255: health+system+ alarams</p>

**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  
<a name="module_jchaos..ChaosOption"></a>

##### jchaos~ChaosOption : <code>object</code>
**Kind**: inner typedef of [<code>jchaos</code>](#module_jchaos)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| updateEachCall | <code>boolean</code> | <p>history update each call</p> |
| uri | <code>string</code> | <p>address:port of the REST server</p> |

