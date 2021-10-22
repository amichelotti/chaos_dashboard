<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "CUEU";

?>

<body>

	<?php
require_once('header.php');
?>


	<div id="chaos_content" class="container-fluid-full fill">
	
		<div id="main-dashboard" class="container-fluid"></div>
	</div>




	<footer><?php require_once('footer.php');?></footer>






	<script>
		$('#main-dashboard').chaosDashboard({
			collapsed: true,
			withQuotes: true,
			template: "cu",
			Interval: 2000,
			dashboard_settings:dashboard_settings

		});
	</script>


</body>

</html>