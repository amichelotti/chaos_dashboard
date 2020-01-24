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

	<div class="container-fluid-full">
		<div class="row-fluid">
				
			<!-- start: Main Menu -->
			<div id="sidebar-left" class="span2">
				<div class="nav-collapse sidebar-nav">
					<ul class="nav nav-tabs nav-stacked main-menu">						
						<?php require_once('menu.php'); ?>

					</ul>
				</div>
				
			</div>
			<!-- end: Main Menu -->
			
			
			<!-- start: Content -->
			<div id="content" class="span10">
			
				<ul class="breadcrumb">
					<li>
						<i class="icon-home"></i>
						<a href="<?php echo $index; ?>"><?php echo $curr_page; ?></a> 
						<i class="icon-angle-right"></i>
					</li>
				</ul>
			
    	<div class="row-fluid">

			<div class="box span12">
    			<div class="box-content">
    				<h3 class="box-header">Configuration</h3>
					<div class="span11 box">
    					<label class="label span6">Save whole configuration </label>
						<button type="button" id="save-configuration" class="icon-save span4">Save To Disk</button>
					</div>
					<div class="span11 box">
						<input type="file" id="upload-file" class="span3" />
						<select id="upload_selection" class="span2" multiple="multiple">
							<option value="us">UnitServers</option>
							<option value="agents">Agents</option>
							<option value="snapshots">Snapshots</option>
							<option value="graphs">Graphs</option>
							<option value="cu_templates">CU Templates</option>
							<option value="custom_group">Groups</option>
						</select>
					</div>

					<div class="span11 box">
						<h3 class="box-header">Variables</h3>
						<div id="chaos_variables"></div>
					</div>
				</div>
			</div>
		</div>


				
								
	
		</div><!--/fluid-row--> -->
	</div>
	
	<div id="jsoneditor"> </div>
	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
	function pathToVariable(variable,path,value){
		var n=str.indexOf("/");
		if(n!=-1){
			str=str.substring(n+1);
			n=str.indexOf("/");
			if(n!=-1){
				var key=str.substring(0,n-1);
				pathToVariable(variable[key],key,value);
			}
		}
		
		while((n=str.indexOf("/"))!=-1){
			if(oldn>0){
				var key=str.substring(oldn+1,n-1);
			}
		}
	}
	  $("#menu-dashboard").generateMenuBox();
	  $("#jsoneditor").generateEditJson();
	  $(this).editActions();
	 //$("#upload_selection").multiSelect("select_all");

	  $("#save-configuration").on("click",function(){
		  jchaos.saveFullConfig();
	  });
	  $('#upload-file').on('change', function() {
		var reader = new FileReader();
		reader.onload = function(e) {
		var cmdselected = $("#upload_selection").val();
		jchaos.restoreFullConfig(JSON.parse(e.target.result),cmdselected);
		

	};
	reader.readAsText(this.files[0]);
	});
	var variables={};
	jchaos.search("", "variable", false, function (vl) {
		vl.forEach(function(v){
			jchaos.variable(v, "get", null, function(d){
				variables[v]=d;
				var dom="#chaos_variables";
				$(dom).html(jqccs.json2html(variables));

				jqccs.jsonSetup(dom,function(e){

    			},function(e){
      			if (e.keyCode == 13) {
       
        			var value = e.target.value;
        			var attrname= e.target.name;
       
					console.log("setting "+attrname+" ="+value);

        			return true;
      				} else {
        				return false;
					  }
					
    				});
				/* Simulate click on toggle button when placeholder is clicked */
				//$("a.json-placeholder").click(function () {
				
				
			});
		});
	})

</script>
	

</body>
</html>
