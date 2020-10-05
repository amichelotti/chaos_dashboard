<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 30/06/17
 */

?>

<div class="navbar">
    <div class="navbar-inner">
	<div class="container-fluid">
	   <!--  <a class="btn btn-navbar" data-toggle="collapse" data-target=".top-nav.nav-collapse,.sidebar-nav.nav-collapse">
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
	    </a>
	    --> 
								
		<!-- start: Header Menu -->
		<div class="nav-no-collapse header-nav span2" style="float:left">
		    <ul class="nav pull-right">
						
			<!-- start: User Dropdown -->
			    <li class="dropdown">
				<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				    <i class="halflings-icon white user"></i> Chaos
				    <span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
				    <li class="dropdown-menu-title">
 					<span>Chaos</span>
					</li>
					<li><a href="./index.php"><i class="halflings-icon home"></i>CU/EU View</a></li>
				    <li><a href="./chaos_jshell.php"><i class="halflings-icon modal-window"></i>Control Console</a></li>
				    <li><a href="./process.php"><i class="halflings-icon cog"></i> Process View</a></li>
					<li><a href="./chaos_node.php"><i class="halflings-icon pencil"></i>Node Management</a></li>
					<li><a href="./configuration.php""><i class="halflings-icon cloud"></i>Configuration</a></li>
				</ul>
			    </li>
			<!-- end: User Dropdown -->

			</ul>
		</div>
		<div class="nav-no-collapse header-nav span2" style="float:left">
		    <ul class="nav pull-right">
						
			<!-- start: User Dropdown -->
			    <li class="dropdown">
				<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				    <i class="halflings-icon white cog"></i> Control Scripts
				    <span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
				    <li class="dropdown-menu-title">
 					<span> Control Scripts</span>
					</li>
					<li><a id="script-upload"><i class="halflings-icon upload"></i>Upload</a></li>
				    <li><a id="script-run"><i class="halflings-icon refresh"></i>Run..</a></li>
				    <li><a id="script-edit"><i class="halflings-icon edit"></i>Edit..</a></li>
					<li><a id="sript-delete"><i class="halflings-icon remove"></i>Delete..</a></li>
				</ul>
			    </li>
			<!-- end: User Dropdown -->

			</ul>
			<div id="script-context-menu"></div>
		</div>
		<div class="nav-no-collapse header-nav span2" style="float:left">
		    <ul class="nav pull-right">
						
			<!-- start: User Dropdown -->
			    <li class="dropdown">
				<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				    <i class="halflings-icon white user"></i> Settings
				    <span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
				    <li class="dropdown-menu-title">
 					<span>Settings</span>
				    </li>
				    <li><a href="#"><i class="halflings-icon user"></i> Profile</a></li>
				    <li><a href="login.html"><i class="halflings-icon off"></i> Login</a></li>
					<li><a id="config-settings"><i class="halflings-icon off"></i> Config..</a></li>
					<li><a id="help-clients"><i class="halflings-icon off"></i> Client List..</a></li>
					<li><a id="help-about"><i class="halflings-icon off"></i> About..</a></li>

				</ul>
			    </li>
			<!-- end: User Dropdown -->

			</ul>
			</div>
			
		    <!-- end: Header Menu -->
            <div class="span10"  style="float:right"><a class="brand" href="<?php echo $index; ?>"><span>!CHAOS Dashboard</span><?php echo file_get_contents("target.html");echo file_get_contents("version.html");?></a></div>

	</div>
    </div>
</div>
<script>
$("#script-upload").on('click',function(){

	jqccs.getFile("Control Script Loading", "select the Script to load", function (script) {
                var regex = /.*[/\\](.*)$/;
                var scriptTmp = {};
				var name=script['name'];
                var match = regex.exec(name);
                if (match != null) {
                    name = match[1];
                }
                if (name.includes(".js")) {
                    language = "JS";
                } else {
                    jqccs.instantMessage("cannot load:"+name," You must load a .js extension:",5000);
                    return;
                }
                var zone_selected = $("#zones option:selected").val();
                if(typeof zone_selected ==="string"){
                    scriptTmp['group'] = zone_selected;
                } else {
                    scriptTmp['group'] = "SYSTEM";
                }
                scriptTmp['script_name'] = name;
                scriptTmp['target'] = "local";
                scriptTmp['eudk_script_content'] = script['data'];
                scriptTmp['eudk_script_language'] = language;
                scriptTmp['script_description'] = "Imported from " + script['name'];
				scriptTmp['default_argument'] = "";
				
				$.get('algo.json', function(d) {
					var templ=JSON.parse(d);
					jchaos.search("","zone",true,function(zon){
						var zone=["ALL"].concat(zon);
						templ['properties']['group']['items']['enum']=zone;
							jqccs.jsonEditWindow("Loaded", templ, scriptTmp, jqccs.algoSave);
					});
				}, 'text');

               /* var templ = {
                    $ref: "algo.json",
                    format: "tabs"
				}*/
				
	
})});
</script>