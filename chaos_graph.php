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
					<div id="graph"></div>
				</div>
		</div><!--/fluid-row--> -->
	</div>
	
	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
function getUrlVars() {
//	var search = location.search.substring(1);
//	return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":') + '}', function(key, value) { return key===""?value:decodeURIComponent(value) })

    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

	var params=getUrlVars();
	var jsonparm={};
	var ngraph=0;
	for(var i in params){
		
		console.log(i +" ->" +decodeURIComponent(params[i]));
		try{
			var obj=JSON.parse(decodeURIComponent(params[i]));
			jsonparm[i]=obj;
			ngraph++;
		} catch(m){
			alert("Error parsing JSON:"+params[i]+ " err:"+m);
		}
	}
	
	var hostWidth = $(window).width();
	var hostHeight = $(window).height();
	var av_graphs = jchaos.variable("highcharts", "get", null, null);
	jqccs.initSettings();

	console.log("current window "+hostWidth+"x"+hostHeight);
	console.log("graph params"+JSON.stringify(jsonparm));

	for(var elem in jsonparm){
    	var opt = av_graphs[elem];
    	if (!(opt instanceof Object)) {
      		alert("\"" + elem + "\" not a valid graph ");
      
    	}
		var gwidth=hostWidth/ngraph;
		var gheight=hostHeight/ngraph;
		var dopt={};
		if(jsonparm[elem].hasOwnProperty("width")){
			gwidth=jsonparm[elem].width;
			delete jsonparm[elem]['width'];
		}
		if(jsonparm[elem].hasOwnProperty("height")){
			gheight=jsonparm[elem].height;
			delete jsonparm[elem]['height'];
		}
		dopt={title:elem,width:gwidth,height:gheight};
		console.log("graph "+gwidth+"x"+gheight);
		for(var jj in jsonparm[elem]){
			dopt[jj]=jsonparm[elem][jj];

		}

		jqccs.createGraphDialog(elem,"graph",dopt);
	}

</script>
	

</body>
</html>
