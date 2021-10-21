<!DOCTYPE HTML>
<html>
<title>!CHAOS BEAM</title>

<?php

require_once('head.php');

$curr_page = "CUEU";

?>

<body>

	<?php
require_once('header.php');
echo '<script src="'.$main_dir.'/../js/chaos-widget/camera.js"></script>';

?>


	<div id="chaos_content" class="container-fluid-full fill">
	
		<div id="main-dashboard" class="container-fluid"></div>
	</div>




	<footer><?php require_once('footer.php');?></footer>






	<script>
		//localStorage.removeItem("camera_view-settings");

		var settings=jqccs.initSettings("camera_view-settings","../dashboard-settings.json");
		
		$("#app-name").html("CAMERA VIEW");
		$("#app-setting").on("click", function () {
                var templ = {
                    $ref: "../dashboard-settings.json",
                    format: "tabs"
                }
				var def={};
				if(localStorage.hasOwnProperty('camera_view-settings')){
					def=JSON.parse(localStorage['camera_view-settings']);
				}
                jqccs.jsonEditWindow("Config", templ, def, function (d) {
                    localStorage['camera_view-settings'] = JSON.stringify(d);
                    var e = jQuery.Event('keypress');
                    e.which = 13;
                    e.keyCode = 13;
                    if(d.hasOwnProperty("defaultRestTimeout")){
                        jchaos.setOptions({ "timeout": d.defaultRestTimeout });
                    } else {
                        jchaos.setOptions({ "timeout": 10000 });

                    }
					//jqccs.initSettings();
					location.reload();

                }, null);

            });
		if(settings.hasOwnProperty("push")){
			$("#push_enable").prop('checked',settings.push);

		} else {
			settings['push']=false;
		}

		$("#main-dashboard").buildCameraArray(settings);
		$("#push_enable").change(function(e) {
            var pe = $("#push_enable").is(":checked");
            if (pe == false) {
                // unsubscribe all
                jchaos.ioclose();

            }
			settings['push']=pe;

			$("#main-dashboard").buildCameraArray(settings);

            //var tt =prompt('type value');
        });
	</script>


</body>

</html>