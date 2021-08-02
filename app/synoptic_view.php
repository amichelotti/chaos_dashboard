<!DOCTYPE HTML>
<html>
<title>!CHAOS SYNOPTIC</title>

<?php

require_once('head.php');

$curr_page = "CUEU";

?>

<body>

	<?php
require_once('header_synoptic.php');
echo '<script src="'.$main_dir.'/../js/chaos-widget/synoptic.js"></script>';

?>

<div style="display:none;">
  <img id="CAMERA"
       src="../img/device/CAMERA.png">
<img id="MOTOR"
       src="../img/device/MOTOR.png">
</div>
	<div id="chaos_content" class="container-fluid-full fill">
	
		<div id="main-dashboard"></div>
	</div>




	<footer><?php require_once('footer.php');?></footer>






	<script>
        function runSynoptic(obj){
            const img = new Image();
                img.onload = function() {
                    obj["imageWidth"]=this.width;
                    obj["imageHeight"]=this.height;
                    $("#app-name").html("SYNOPTIC "+obj.name);

                    $("#main-dashboard").buildSynoptic(obj);
                }
        
                    img.src =obj.imgsrc;
        }
		var settings=jqccs.initSettings("synoptic_view-settings","synoptic_view-settings.json");
		
		$("#app-name").html("SYNOPTIC VIEW");
        $("#load-file").on("click",function () {
            jqccs.getFile("Upload", "upload Synoptic", function (obj) {
                runSynoptic(obj);

                        });
        });

		$("#app-setting").on("click", function () {
                var templ = {
                    $ref: "synoptic_view-settings.json",
                    format: "tabs"
                }
				var def={};
				if(localStorage.hasOwnProperty('synoptic_view-settings')){
					def=JSON.parse(localStorage['synoptic_view-settings']);
				}
                jqccs.jsonEditWindow("Config", templ, def, function (d) {
                    localStorage['synoptic_view-settings'] = JSON.stringify(d);
                    var e = jQuery.Event('keypress');
                    e.which = 13;
                    e.keyCode = 13;
                    if(d.hasOwnProperty("defaultRestTimeout")){
                        jchaos.setOptions({ "timeout": d.defaultRestTimeout });
                    } else {
                        jchaos.setOptions({ "timeout": 10000 });

                    }
					//jqccs.initSettings();

                }, null);

            });
	
	/*	var settings={'name':"FLAME","imgsrc":"../img/synoptics/Flame.png","imageWidth":640,"imageHeight":480};
        const img = new Image();
        img.onload = function() {
          //  alert(this.width + 'x' + this.height);
          testsyn.imageWidth=this.width;
          testsyn.imageHeight=this.height;

          $("#main-dashboard").buildSynoptic(testsyn);

        }
        img.src =testsyn.imgsrc;*/

	</script>


</body>

</html>