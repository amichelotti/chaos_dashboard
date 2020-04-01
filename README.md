#### Functions

<dl>
<dt><a href="#decodeCUPath">decodeCUPath(cupath)</a> ⇒ <code><a href="#varpath">varpath</a></code></dt>
<dd><p>Decode a CU dataset element path and return an object</p></dd>
<dt><a href="#toHHMMSS">toHHMMSS(sec_num)</a> ⇒ <code>string</code></dt>
<dd><p>translate seconds in days hours minutes seconds string</p></dd>
<dt><a href="#setOption">setOption(opt)</a></dt>
<dd><p>Set Library options options</p></dd>
<dt><a href="#basicRmt">basicRmt(server, func, param, handler, badhandler)</a></dt>
<dd><p>Helper function to post commands on the process remote management</p></dd>
<dt><a href="#rmtGetEnvironment">rmtGetEnvironment(server, varname, handler, badhandler)</a> ⇒</dt>
<dd><p>Retrive a given environemnt variable</p></dd>
<dt><a href="#rmtSetProp">rmtSetProp(server, prop, handler, badhandler)</a> ⇒</dt>
<dd><p>Set the specified propery</p></dd>
<dt><a href="#rmtCreateProcess">rmtCreateProcess(server, name, cmdline, ptype, workdir, handler, badhandler)</a> ⇒ <code>object</code></dt>
<dd><p>Launch a process the specified process on the given remote server<br>
return a process structure</p></dd>
<dt><a href="#rmtCreateProcess">rmtCreateProcess(server, uid, workdir, handler, badhandler)</a></dt>
<dd><p>Return a zip file contaning the working directory of the specified process<br>
can be used to retrieve outputs of remote runs</p></dd>
<dt><a href="#rmtUploadScript">rmtUploadScript(server, name, ptype, content, handler, badhandler)</a> ⇒ <code>object</code></dt>
<dd><p>Upload a script/executable on the remote server<br>
return the path</p></dd>
<dt><a href="#rmtListProcess">rmtListProcess(server, handler, badhandler)</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>Return a list of process on the given server</p></dd>
<dt><a href="#rmtKill">rmtKill(server, uid, handler, badhandler)</a></dt>
<dd><p>Kill the specified process</p></dd>
<dt><a href="#rmtPurge">rmtPurge(server, level, [handler], [badhandler])</a></dt>
<dd><p>Purge a list of process to a given level (0 soft (EXCEPTION), 1 medium (ENDED and EXCEPTION), 2 hard (ALL)</p></dd>
<dt><a href="#basicPost">basicPost(func, params, [handler], [badhandler], [server])</a></dt>
<dd><p>Helper function that is the base of all commands to the !CHAOS REST SERVER<br>
the server is specified in the option</p></dd>
<dt><a href="#registerCU">registerCU(cuid, obj, [handleFunc], [badhandler])</a></dt>
<dd><p>Registers a CU  dataset using REST</p></dd>
<dt><a href="#pushCU">pushCU(cuid, obj, [handleFunc], [badhandler])</a></dt>
<dd><p>Push a CU dataset using REST</p></dd>
<dt><a href="#mdsBase">mdsBase(cmd, opt, [handleFunc], [errFunc])</a></dt>
<dd><p>Helper function that wrap basic post used for query that regards generic MDS operations</p></dd>
<dt><a href="#tag">tag(tagname, node_list, tag_type, tag_value, [handleFunc], [nok])</a></dt>
<dd><p>Start tagging a list of nodes for an interval of given time, expressed in cycles or ms</p></dd>
<dt><a href="#checkRestore">checkRestore(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])</a></dt>
<dd><p>Check if a lists of CU have done a correct snapshot restore, the check is performed every timeout/10 ms for maximum timeout</p></dd>
<dt><a href="#checkBurstRunning">checkBurstRunning(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])</a></dt>
<dd><p>Helper function to check if a burst is running</p></dd>
<dt><a href="#checkEndBurst">checkEndBurst(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])</a></dt>
<dd><p>Check if a list of CU ended correct burst, the check is performed every timeout/10 ms for maximum timeout</p></dd>
<dt><a href="#snapshot">snapshot(_name, _what, _node_list, [value_], [handleFunc], [nok])</a></dt>
<dd><p>Performs snapshot operations</p>
<pre><code>
create (create a new snapshot of the given list of CUs)
load (retrive a create snapshot)
set (create a snapshot from a value)
delete (delete a snapshot)
restore (restore a snapshot)
burst (perform a burst tag operation see <b>tag</b>)
</code></pre></dd>
<dt><a href="#node">node(_name, _what, _type, [_parent], [value_], handleFunc, nok)</a></dt>
<dd><p>Perform and operation specified by '_what' onthe nodes of '_name' of type :'_type'</p></dd>
<dt><a href="#variable">variable(_name, _what, [value_], [handleFunc], [handleFunc])</a></dt>
<dd><p>Allows to manage variables that are persistent (on DB)</p></dd>
<dt><a href="#log">log(devs, _what, _type, _start, _end, [handleFunc], [handlerr])</a></dt>
<dd><p>Search logs for the given CUs</p></dd>
<dt><a href="#search">search(_name, _what, _alive, [handleFunc], [handlerr])</a> ⇒</dt>
<dd></dd>
<dt><a href="#findCUByImplementation">findCUByImplementation(impl, alive, [handleFunc])</a></dt>
<dd><p>Find an array of CU with the given implementation</p></dd>
<dt><a href="#getCUStatus">getCUStatus(status_to_search, [handleFunc])</a></dt>
<dd><p>Return an array of CU that match a given status</p></dd>
<dt><a href="#convertArray2CSV">convertArray2CSV(devs)</a> ⇒ <code>string</code></dt>
<dd><p>convert an array into a CommaSepareted elements</p></dd>
<dt><a href="#getChannel">getChannel(devs, channel_id, [handleFunc], [badfunc])</a> ⇒ <code>object</code></dt>
<dd><p>Retrive the specified dataset correspoding to a given CU</p></dd>
<dt><a href="#setProperty">setProperty(dev, prop, [handleFunc], [errFunc])</a></dt>
<dd><p>Set a CU property</p></dd>
<dt><a href="#loadUnload">loadUnload(dev, loadunload, [handleFunc], [nok])</a></dt>
<dd><p>Load or Unload a CU</p></dd>
<dt><a href="#sendCUCmd">sendCUCmd(devs, cmd, [param], [handleFunc], [handleFuncErr])</a></dt>
<dd><p>Sends a command to a CU</p></dd>
<dt><a href="#sendCUFullCmd">sendCUFullCmd(devs, cmd, [param], force, prio, [handleFunc], [handleFuncErr])</a></dt>
<dd><p>Sends a command to a CU, with explicit params</p></dd>
<dt><a href="#getHistory">getHistory(devs, channel, start, stop, [varname], [handleFunc], [tagsv], [funcerr])</a></dt>
<dd><p>Retrive history of a channel dataset of a  group of devices</p></dd>
<dt><a href="#fetchHistoryToZip">fetchHistoryToZip(zipname, cams, start, stop, [tagsv], updateCall, errCall)</a></dt>
<dd><p>Retrive history and write a local zip</p></dd>
<dt><a href="#checkPeriodiocally">checkPeriodiocally(str, retry, checkFreq, checkFunc, okhandle, nokhandle)</a></dt>
<dd><p>Helper function th check a periodically a condition<br>
the difference with check live is the check function don't receive a dataset in input</p></dd>
<dt><a href="#saveFullConfig">saveFullConfig()</a></dt>
<dd><p>saveFullConfig<br>
Save to local disk the state of fundamental configurations</p></dd>
<dt><a href="#restoreFullConfigFromFile">restoreFullConfigFromFile()</a></dt>
<dd><p>Restore a full configuration from file</p></dd>
<dt><a href="#restoreFullConfig">restoreFullConfig(config, configToRestore)</a></dt>
<dd><p>Restore a previously a configuration into the infrastructure</p></dd>
<dt><a href="#activeAgentList">activeAgentList(cb)</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>activeAgentList<br>
return a list of agents addresses in the callback</p></dd>
<dt><a href="#getAllProcessInfo">getAllProcessInfo(agl, cb)</a></dt>
<dd><p>Return a vector of process information in the callback</p></dd>
<dt><a href="#findBestServer">findBestServer(cb:)</a> ⇒ <code>string</code></dt>
<dd><p>findBestServer<br>
return a list of agents ordered by occupation in the callback<br>
NOTE: this function use a tcp port the is different from REST server one (it goes directly on the server)</p></dd>
<dt><a href="#runScript">runScript(name, [parm], [okhandle], [errorhandle])</a></dt>
<dd><p>runScript<br>
Run the specified script on the chaos infrastructure</p></dd>
<dt><a href="#encodeName">encodeName(str)</a> ⇒ <code>string</code></dt>
<dd><p>Encode a path name<br>
removes trailing</p></dd>
<dt><a href="#checkLive">checkLive(str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle)</a></dt>
<dd><p>This function used mainly in tests.<br>
It checks for a variable change on a 'devlist', for 'retry' times, checking every 'checkFreq'<br>
'checkFunc' takes in input the live and realize the check<br>
okhandle is called if success<br>
nokhandle if fails</p></dd>
</dl>

#### Typedefs

<dl>
<dt><a href="#okcb">okcb</a> : <code>function</code></dt>
<dd><p>Callback in asynchronous operations called when the operation is ok</p></dd>
<dt><a href="#badcb">badcb</a> : <code>function</code></dt>
<dd><p>Callback in asynchronous operations called when the operation is fails</p></dd>
<dt><a href="#cmdPar">cmdPar</a> : <code>Object</code></dt>
<dd><p>The command object for sendCU commands</p></dd>
<dt><a href="#varpath">varpath</a> : <code>Object</code></dt>
<dd><p>CU variable path</p></dd>
<dt><a href="#channelid">channelid</a> : <code>integer</code></dt>
<dd><p>Channel idintification mapping:<br>
-1 : all<br>
0: output<br>
1: input<br>
2: custom<br>
3: system<br>
4: health<br>
5: cu alarms<br>
6: device alarms<br>
128: status<br>
255: health+system+ alarams</p></dd>
<dt><a href="#ChaosOption">ChaosOption</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="decodeCUPath"></a>

#### decodeCUPath(cupath) ⇒ [<code>varpath</code>](#varpath)
<p>Decode a CU dataset element path and return an object</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| cupath | <code>string</code> | 

<a name="toHHMMSS"></a>

#### toHHMMSS(sec_num) ⇒ <code>string</code>
<p>translate seconds in days hours minutes seconds string</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>return string xx days hh:mm:ss</p>  

| Param | Type |
| --- | --- |
| sec_num | <code>integer</code> | 

<a name="setOption"></a>

#### setOption(opt)
<p>Set Library options options</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| opt | <code>object</code> | 

<a name="basicRmt"></a>

#### basicRmt(server, func, param, handler, badhandler)
<p>Helper function to post commands on the process remote management</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| func | <code>string</code> | <p>REST function</p> |
| param | <code>object</code> | <p>REST function parameters</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtGetEnvironment"></a>

#### rmtGetEnvironment(server, varname, handler, badhandler) ⇒
<p>Retrive a given environemnt variable</p>

**Kind**: global function  
**Returns**: <p>the value on the specified handler.</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| varname | <code>string</code> | <p>environment variable name</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtSetProp"></a>

#### rmtSetProp(server, prop, handler, badhandler) ⇒
<p>Set the specified propery</p>

**Kind**: global function  
**Returns**: <p>the value on the specified handler.</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| prop | <code>Object</code> | <p>property name</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtCreateProcess"></a>

#### rmtCreateProcess(server, name, cmdline, ptype, workdir, handler, badhandler) ⇒ <code>object</code>
<p>Launch a process the specified process on the given remote server<br>
return a process structure</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>return a process object with many status and information</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| name | <code>string</code> | <p>program name</p> |
| cmdline | <code>string</code> | <p>command line</p> |
| ptype | <code>string</code> | <p>type (&quot;exec&quot;: binary, &quot;C++&quot;: C++ script&quot;)</p> |
| workdir | <code>string</code> | <p>remote local directory</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtCreateProcess"></a>

#### rmtCreateProcess(server, uid, workdir, handler, badhandler)
<p>Return a zip file contaning the working directory of the specified process<br>
can be used to retrieve outputs of remote runs</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| uid | <code>string</code> | <p>the process uid returned by the rmtCreateProcess</p> |
| workdir | <code>string</code> | <p>working dir to retrieve and zip</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtUploadScript"></a>

#### rmtUploadScript(server, name, ptype, content, handler, badhandler) ⇒ <code>object</code>
<p>Upload a script/executable on the remote server<br>
return the path</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>return the path of the remote process</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| name | <code>string</code> | <p>program name</p> |
| ptype | <code>string</code> | <p>type (&quot;exec&quot;: binary, &quot;C++&quot;: C++ script&quot;)</p> |
| content | <code>string</code> | <p>base64 encoded content to upload</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtListProcess"></a>

#### rmtListProcess(server, handler, badhandler) ⇒ <code>Array.&lt;object&gt;</code>
<p>Return a list of process on the given server</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - <p>return a list of process descriptors</p>  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtKill"></a>

#### rmtKill(server, uid, handler, badhandler)
<p>Kill the specified process</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| uid | <code>string</code> | <p>the process uid returned by the rmtCreateProcess</p> |
| handler | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| badhandler | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="rmtPurge"></a>

#### rmtPurge(server, level, [handler], [badhandler])
<p>Purge a list of process to a given level (0 soft (EXCEPTION), 1 medium (ENDED and EXCEPTION), 2 hard (ALL)</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | <p>rest process remote management server</p> |
| level | <code>integer</code> | <p>purge level</p> |
| [handler] | [<code>okcb</code>](#okcb) | <p>handler on success</p> |
| [badhandler] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="basicPost"></a>

#### basicPost(func, params, [handler], [badhandler], [server])
<p>Helper function that is the base of all commands to the !CHAOS REST SERVER<br>
the server is specified in the option</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>string</code> | <p>REST function to perform</p> |
| params | <code>string</code> | <p>parameters</p> |
| [handler] | [<code>okcb</code>](#okcb) | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |
| [server] | <code>string</code> | <p>override the default server</p> |

<a name="registerCU"></a>

#### registerCU(cuid, obj, [handleFunc], [badhandler])
<p>Registers a CU  dataset using REST</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cuid | <code>string</code> |  |
| obj | <code>object</code> | <p>the CU dataset to register/push</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="pushCU"></a>

#### pushCU(cuid, obj, [handleFunc], [badhandler])
<p>Push a CU dataset using REST</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cuid | <code>string</code> |  |
| obj | <code>object</code> | <p>the CU dataset to register/push</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>handler on success, if present the call will be asynchronous</p> |
| [badhandler] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="mdsBase"></a>

#### mdsBase(cmd, opt, [handleFunc], [errFunc])
<p>Helper function that wrap basic post used for query that regards generic MDS operations</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | <p>command to send</p> |
| opt | <code>object</code> | <p>options</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>handler on success, if present the call will be asynchronous</p> |
| [errFunc] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

<a name="tag"></a>

#### tag(tagname, node_list, tag_type, tag_value, [handleFunc], [nok])
<p>Start tagging a list of nodes for an interval of given time, expressed in cycles or ms</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| tagname | <code>string</code> |  |
| node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |
| tag_type | <code>integer</code> | <p>(2= time in ms, 1=cycles)</p> |
| tag_value | <code>integer</code> | <p>numer of ms or cycles</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>handler on success, if present the call will be asynchronous</p> |
| [nok] | [<code>badcb</code>](#badcb) | <p>handler on failure</p> |

**Example**  
```js
//tagging for 10s two CU (cameras), give the name burstbyseconds  
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.tag("burstbyseconds",camera_list,2,10000,function(d){jchaos.print("tagging started");});
```
<a name="checkRestore"></a>

#### checkRestore(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Check if a lists of CU have done a correct snapshot restore, the check is performed every timeout/10 ms for maximum timeout</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | [<code>okcb</code>](#okcb) |  |
| [_nokhandler] | [<code>badcb</code>](#badcb) |  |

<a name="checkBurstRunning"></a>

#### checkBurstRunning(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Helper function to check if a burst is running</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | [<code>okcb</code>](#okcb) |  |
| [_nokhandler] | [<code>badcb</code>](#badcb) |  |

**Example**  
```js
// check the burst is running
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.checkBurstRunning("burstbyseconds",camera_list,10000,function(){jchaos.print("OK");},function(){chaos.error("BAD");})
```
<a name="checkEndBurst"></a>

#### checkEndBurst(_tagname, _node_list, _timeout, [_okhandler], [_nokhandler])
<p>Check if a list of CU ended correct burst, the check is performed every timeout/10 ms for maximum timeout</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _tagname | <code>string</code> | <p>name of the tag</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>list of nodes</p> |
| _timeout | <code>integer</code> | <p>timeout</p> |
| [_okhandler] | [<code>okcb</code>](#okcb) |  |
| [_nokhandler] | [<code>badcb</code>](#badcb) |  |

**Example**  
```js
// check the burst is running
var camera_list=["TEST/FLAME/CMP/CAMERA/FLACMPFF","TEST/FLAME/CMP/CAMERA/FLMCMP01"];
jchaos.checkEndBurst(camera_list,10000,function(){jchaos.print("OK");},function(){chaos.error("BAD");})
```
<a name="snapshot"></a>

#### snapshot(_name, _what, _node_list, [value_], [handleFunc], [nok])
<p>Performs snapshot operations</p>
<pre><code>
create (create a new snapshot of the given list of CUs)
load (retrive a create snapshot)
set (create a snapshot from a value)
delete (delete a snapshot)
restore (restore a snapshot)
burst (perform a burst tag operation see <b>tag</b>)
</code></pre>

**Kind**: global function  
**See**: tag  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> | <p>name of the snapshot</p> |
| _what | <code>&quot;create&quot;</code> \| <code>&quot;load&quot;</code> \| <code>&quot;set&quot;</code> \| <code>&quot;delete&quot;</code> \| <code>&quot;restore&quot;</code> \| <code>&quot;burst&quot;</code> | <p>operation to perform</p> |
| _node_list | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>nodes to snapshot</p> |
| [value_] | <code>object</code> | <p>parameter for set command</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) |  |
| [nok] | [<code>badcb</code>](#badcb) |  |

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
<a name="node"></a>

#### node(_name, _what, _type, [_parent], [value_], handleFunc, nok)
<p>Perform and operation specified by '_what' onthe nodes of '_name' of type :'_type'</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>the name of the nodes where to perform the operation</p> |
| _what | <code>&quot;init&quot;</code> \| <code>&quot;deinit&quot;</code> \| <code>&quot;start&quot;</code> \| <code>&quot;stop&quot;</code> \| <code>&quot;get&quot;</code> \| <code>&quot;set&quot;</code> \| <code>&quot;del&quot;</code> \| <code>&quot;killcmd&quot;</code> \| <code>&quot;shutdown&quot;</code> \| <code>&quot;kill&quot;</code> \| <code>&quot;restart&quot;</code> \| <code>&quot;desc&quot;</code> \| <code>&quot;getlog&quot;</code> \| <code>&quot;health&quot;</code> \| <code>&quot;info&quot;</code> | <p>operation type</p> |
| _type | <code>&quot;us&quot;</code> \| <code>&quot;cu&quot;</code> \| <code>&quot;agent&quot;</code> | <p>target type of the command</p> |
| [_parent] | <code>string</code> | <p>some commands needs a parent node to be specified</p> |
| [value_] | <code>object</code> | <p>some commands needs a parameter</p> |
| handleFunc | [<code>okcb</code>](#okcb) |  |
| nok | [<code>badcb</code>](#badcb) |  |

**Example**  
```js
// stop|start|init|deinit a cu 
jchaos.node("BTF/QUADRUPOLE/QUATB001","stop","cu");
jchaos.node("BTF/QUADRUPOLE/QUATB001","start","cu");
```
<a name="variable"></a>

#### variable(_name, _what, [value_], [handleFunc], [handleFunc])
<p>Allows to manage variables that are persistent (on DB)</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  |
| _what | <code>&quot;set&quot;</code> \| <code>&quot;get&quot;</code> \| <code>&quot;del&quot;</code> \| <code>&quot;search&quot;</code> | <p>operation type</p> |
| [value_] | <code>object</code> | <p>in case of set the object</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [handleFunc] | [<code>badcb</code>](#badcb) | <p>callback if failure</p> |

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
<a name="log"></a>

#### log(devs, _what, _type, _start, _end, [handleFunc], [handlerr])
<p>Search logs for the given CUs</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>to search</p> |
| _what | <code>&quot;search&quot;</code> | <p>operation to perform</p> |
| _type | <code>&quot;all&quot;</code> \| <code>&quot;Info&quot;</code> \| <code>&quot;error&quot;</code> \| <code>&quot;warning&quot;</code> \| <code>&quot;log&quot;</code> \| <code>&quot;command&quot;</code> | <p>specify log type</p> |
| _start | <code>integer</code> | <p>epoch in ms start of the search</p> |
| _end | <code>integer</code> | <p>epoch md end of the search (-1 is now)</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [handlerr] | [<code>badcb</code>](#badcb) | <p>callback if error</p> |

**Example**  
```js
// retrieve all logs for a given CU till now
jchaos.log("BTF/QUADRUPOLE/QUATB001","search","all",0,-1,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="search"></a>

#### search(_name, _what, _alive, [handleFunc], [handlerr]) ⇒
**Kind**: global function  
**Returns**: <p>an array of strings or objects</p>  

| Param | Type | Description |
| --- | --- | --- |
| _name | <code>string</code> | <p>is the substring of what you want search</p> |
| _what | <code>&quot;cu&quot;</code> \| <code>&quot;us&quot;</code> \| <code>&quot;agent&quot;</code> \| <code>&quot;cds&quot;</code> \| <code>&quot;webui&quot;</code> \| <code>&quot;variable&quot;</code> \| <code>&quot;snapshotsof&quot;</code> \| <code>&quot;snapshots&quot;</code> \| <code>&quot;script&quot;</code> \| <code>&quot;zone&quot;</code> \| <code>&quot;class&quot;</code> | <p>operation type</p> |
| _alive | <code>boolean</code> | <p>search among alive (true) or all(false)</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [handlerr] | [<code>badcb</code>](#badcb) | <p>callback if error</p> |

**Example**  
```js
// search all CU alive
jchaos.search("","cu",true,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="findCUByImplementation"></a>

#### findCUByImplementation(impl, alive, [handleFunc])
<p>Find an array of CU with the given implementation</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| impl | <code>string</code> | <p>C++ implementation name to find</p> |
| alive | <code>bool</code> | <p>search from alive or all</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |

**Example**  
```js
// find implementation that starts with SCA(ctuators)
jchaos.findCUByImplementation("SCA",true,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="getCUStatus"></a>

#### getCUStatus(status_to_search, [handleFunc])
<p>Return an array of CU that match a given status</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| status_to_search | <code>string</code> |  |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |

<a name="convertArray2CSV"></a>

#### convertArray2CSV(devs) ⇒ <code>string</code>
<p>convert an array into a CommaSepareted elements</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>Array.&lt;string&gt;</code> | <p>array</p> |

<a name="getChannel"></a>

#### getChannel(devs, channel_id, [handleFunc], [badfunc]) ⇒ <code>object</code>
<p>Retrive the specified dataset correspoding to a given CU</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>the specified dataset</p>  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>String</code> \| <code>Array.&lt;String&gt;</code> | <p>CU or array of CU</p> |
| channel_id | [<code>channelid</code>](#channelid) | <p>(-1: all,0: output, 1: input, 2:custom,3:system, 4: health, 5 cu alarm, 6 dev alarms,128 status)</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [badfunc] | [<code>badcb</code>](#badcb) | <p>bad callback</p> |

**Example**  
```js
//retrive all channels of a give CU
chaos.getChannel("BTF/QUADRUPOLE/QUATB001",-1,function(ls){jchaos.print(JSON.stringify(ls));});
```
<a name="setProperty"></a>

#### setProperty(dev, prop, [handleFunc], [errFunc])
<p>Set a CU property</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| dev | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| prop | <code>string</code> | <p>property name</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [errFunc] | [<code>badcb</code>](#badcb) | <p>bad callback</p> |

<a name="loadUnload"></a>

#### loadUnload(dev, loadunload, [handleFunc], [nok])
<p>Load or Unload a CU</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| dev | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| loadunload | <code>bool</code> | <p>(true = load, false=unload)</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [nok] | [<code>badcb</code>](#badcb) | <p>bad callback</p> |

<a name="sendCUCmd"></a>

#### sendCUCmd(devs, cmd, [param], [handleFunc], [handleFuncErr])
<p>Sends a command to a CU</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| cmd | [<code>cmdPar</code>](#cmdPar) | <p>command to send</p> |
| [param] | <code>object</code> | <p>optional and my be included into cmd</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [handleFuncErr] | [<code>badcb</code>](#badcb) | <p>bad callback</p> |

<a name="sendCUFullCmd"></a>

#### sendCUFullCmd(devs, cmd, [param], force, prio, [handleFunc], [handleFuncErr])
<p>Sends a command to a CU, with explicit params</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| cmd | <code>string</code> | <p>command to send</p> |
| [param] | <code>string</code> \| <code>object</code> |  |
| force | <code>integer</code> |  |
| prio | <code>integer</code> |  |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [handleFuncErr] | [<code>badcb</code>](#badcb) | <p>bad callback</p> |

<a name="getHistory"></a>

#### getHistory(devs, channel, start, stop, [varname], [handleFunc], [tagsv], [funcerr])
<p>Retrive history of a channel dataset of a  group of devices</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| devs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>CU or array of CU</p> |
| channel | <code>integer</code> | <p>channel to retrieve</p> |
| start | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| stop | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| [varname] | <code>string</code> | <p>optional name of the variable to retrieve (instead of all)</p> |
| [handleFunc] | [<code>okcb</code>](#okcb) | <p>callback if ok, enable async mode</p> |
| [tagsv] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>optional tags</p> |
| [funcerr] | [<code>badcb</code>](#badcb) | <p>optional bad callback</p> |

<a name="fetchHistoryToZip"></a>

#### fetchHistoryToZip(zipname, cams, start, stop, [tagsv], updateCall, errCall)
<p>Retrive history and write a local zip</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| zipname | <code>string</code> |  |
| cams | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>array of CU</p> |
| start | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| stop | <code>integer</code> \| <code>string</code> | <p>epoch timestamp in ms (GMT) of start of search</p> |
| [tagsv] | <code>Array.&lt;string&gt;</code> | <p>tags</p> |
| updateCall | [<code>okcb</code>](#okcb) |  |
| errCall | [<code>badcb</code>](#badcb) |  |

<a name="checkPeriodiocally"></a>

#### checkPeriodiocally(str, retry, checkFreq, checkFunc, okhandle, nokhandle)
<p>Helper function th check a periodically a condition<br>
the difference with check live is the check function don't receive a dataset in input</p>

**Kind**: global function  
**See**

- checkLive
- checkBurstRunning


| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to display each time the check is performed</p> |
| retry | <code>integer</code> | <p>retry the check for a maximum of number of time</p> |
| checkFreq | <code>integer</code> | <p>check frequency in ms</p> |
| checkFunc | [<code>okcb</code>](#okcb) | <p>check function, should return true if ok or false if fails</p> |
| okhandle | [<code>okcb</code>](#okcb) | <p>callback to call if test succeed</p> |
| nokhandle | [<code>badcb</code>](#badcb) | <p>callback to call if fails</p> |

<a name="saveFullConfig"></a>

#### saveFullConfig()
<p>saveFullConfig<br>
Save to local disk the state of fundamental configurations</p>

**Kind**: global function  
**Example**  
```js
//save the infrastructure info.
saveFullConfig();
```
<a name="restoreFullConfigFromFile"></a>

#### restoreFullConfigFromFile()
<p>Restore a full configuration from file</p>

**Kind**: global function  
<a name="restoreFullConfig"></a>

#### restoreFullConfig(config, configToRestore)
<p>Restore a previously a configuration into the infrastructure</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| configToRestore | <code>Array.&lt;string&gt;</code> | <p>array of things to restore &quot;us&quot;,&quot;agents&quot;,&quot;snapshots&quot;,&quot;graphs&quot;,&quot;custom_group&quot;,&quot;cu_templates&quot;</p> |

<a name="activeAgentList"></a>

#### activeAgentList(cb) ⇒ <code>Array.&lt;object&gt;</code>
<p>activeAgentList<br>
return a list of agents addresses in the callback</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - <p>return in the callback the list descriptor of the agents</p>  

| Param | Type | Description |
| --- | --- | --- |
| cb | [<code>okcb</code>](#okcb) | <p>callback called with the agent object list</p> |

**Example**  
```js
jchaos.activeAgentList(function(cb){jchaos.print(JSON.stringify(cb));})
```
<a name="getAllProcessInfo"></a>

#### getAllProcessInfo(agl, cb)
<p>Return a vector of process information in the callback</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| agl | <code>Array.&lt;string&gt;</code> | <p>list of agents info</p> |
| cb | [<code>okcb</code>](#okcb) | <p>callback called with the agent object list</p> |

<a name="findBestServer"></a>

#### findBestServer(cb:) ⇒ <code>string</code>
<p>findBestServer<br>
return a list of agents ordered by occupation in the callback<br>
NOTE: this function use a tcp port the is different from REST server one (it goes directly on the server)</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>return the best server</p>  

| Param | Type | Description |
| --- | --- | --- |
| cb: | [<code>okcb</code>](#okcb) | <p>return a list of active agents</p> |

**Example**  
```js
// find the best server to run a script:
jchaos.findBestServer(function(cb){jchaos.print(JSON.stringify(cb));})
```
<a name="runScript"></a>

#### runScript(name, [parm], [okhandle], [errorhandle])
<p>runScript<br>
Run the specified script on the chaos infrastructure</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>the name of the script present in the DB</p> |
| [parm] | <code>object</code> | <p>optional parameters</p> |
| [okhandle] | [<code>okcb</code>](#okcb) | <p>called when ok</p> |
| [errorhandle] | [<code>badcb</code>](#badcb) | <p>called when failed</p> |

<a name="encodeName"></a>

#### encodeName(str) ⇒ <code>string</code>
<p>Encode a path name<br>
removes trailing</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>encoded string</p>  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to encode</p> |

<a name="checkLive"></a>

#### checkLive(str, devlist, retry, checkFreq, checkFunc, okhandle, nokhandle)
<p>This function used mainly in tests.<br>
It checks for a variable change on a 'devlist', for 'retry' times, checking every 'checkFreq'<br>
'checkFunc' takes in input the live and realize the check<br>
okhandle is called if success<br>
nokhandle if fails</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | <p>string to display when the check is peformed</p> |
| devlist | <code>Array.&lt;string&gt;</code> | <p>list of CU to check</p> |
| retry | <code>integer</code> | <p>retry the ckeck for the given number of times</p> |
| checkFreq | <code>integer</code> | <p>check frequency expressed in ms</p> |
| checkFunc | [<code>okcb</code>](#okcb) | <p>call back to call that perform the check, it takes in input the dataset to check, should return true if the check succeed or false if not</p> |
| okhandle | [<code>okcb</code>](#okcb) | <p>callback to call if the test complete successfully</p> |
| nokhandle | [<code>badcb</code>](#badcb) | <p>callback to call if the test fails</p> |

**Example**  
```js
// check if the list of CUs are in start
 var cu_status=["BTF/QUADRUPOLE/QUATB001","BTF/QUADRUPOLE/QUATB002","BTF/QUADRUPOLE/QUATB003"];
 jchaos.checkLive('check Start',cu_status, 20, 1000, function (ds) {jchaos.print("testing..."); return (ds!=null)&&ds.hasOwnProperty("health")&&ds.health.hasOwnProperty("nh_status")&&(ds.health.nh_status == "Start"); }, function () { jchaos.print("CHECK OK"); }, function () { jchaos.error("CHECK FAILED"); });
```
<a name="okcb"></a>

#### okcb : <code>function</code>
<p>Callback in asynchronous operations called when the operation is ok</p>

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | <p>depend on the operation (typically a dataset)</p> |

<a name="badcb"></a>

#### badcb : <code>function</code>
<p>Callback in asynchronous operations called when the operation is fails</p>

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>object</code> | <p>description of the error</p> |

<a name="cmdPar"></a>

#### cmdPar : <code>Object</code>
<p>The command object for sendCU commands</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | <p>command name</p> |
| prio | <code>integer</code> | <p>Priority</p> |
| mode | <code>integer</code> | <p>mode</p> |

<a name="varpath"></a>

#### varpath : <code>Object</code>
<p>CU variable path</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cu | <code>string</code> | <p>CU PATH</p> |
| dir | <code>string</code> | <p>direction (input,output)</p> |
| var | <code>string</code> | <p>variable dataset name</p> |
| const | <code>string</code> | <p>constantco:String</p> |
| origin | <code>string</code> | <p>full path</p> |

<a name="channelid"></a>

#### channelid : <code>integer</code>
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

**Kind**: global typedef  
<a name="ChaosOption"></a>

#### ChaosOption : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| updateEachCall | <code>boolean</code> | <p>history update each call</p> |
| uri | <code>string</code> | <p>address:port of the REST server</p> |

