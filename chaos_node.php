<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.terminal.min.js"></script>';
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
echo '<link href="' .$main_dir. '/js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';;

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
			
				<div id="main-dashboard" class="fill"></div>
			</div>
				
								
	
		</div>
	</div>
	

	<!-- <div class="clearfix"></div> -->
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
$('#main-dashboard').chaosDashboard({
                collapsed: true,
				withQuotes: true,
				template:"node",
				Interval: 2000,
				timeout:3000

            });
</script>
	

</body>
</html>
