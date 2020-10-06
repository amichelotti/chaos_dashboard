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
			<div id="chaos_content" class="span12">
			
				<ul class="breadcrumb">
					<li>
						<i class="icon-home"></i>
						<a href="<?php echo $index; ?>"><?php echo $curr_page; ?></a> 
						<i class="icon-angle-right"></i>
						
					</li>
				</ul>
			
				<div id="main-dashboard"></div>
			</div>
		</div><!--/fluid-row-->
	</div>
	

	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
$('#main-dashboard').chaosDashboard({
                collapsed: true,
				withQuotes: true,
				template:"cu",
                Interval: 2000

            });
</script>
	

</body>
</html>
