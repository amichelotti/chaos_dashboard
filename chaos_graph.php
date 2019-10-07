<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

			
//link script

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
					<div id="graph"></div>
				</div>
		</div><!--/fluid-row--> -->
	</div>
	
	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

	var params=getUrlVars();
	if(!params.hasOwnProperty("name")){
		alert ("graph \"name\" parameter must be given as GET parameter");

	} 
	var gname=params['name'];
	var av_graphs = jchaos.variable("highcharts", "get", null, null);
    var opt = av_graphs[gname];
    if (!(opt instanceof Object)) {
      alert("\"" + gname + "\" not a valid graph ");
      
    }
	for(var i in params){
		console.log("parameter "+i+ " ="+params[i]);
	}
	var hostWidth = $(window).width();
	var hostHeight = $(window).height();
	
	$(this).createGraphDialog("graph",gname,{title:gname,width:hostWidth/2,height:hostHeight});
</script>
	

</body>
</html>
