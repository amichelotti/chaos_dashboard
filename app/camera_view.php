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
		function buildCameraMenu(){
          var html='<li class="nav-item dropdown"> \
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> \
          Config.. \
        </a> \
        <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink"> \
          <li><a class="dropdown-item" href="javascript:$(this).save_config()"><i class="fa fa-save" aria-hidden="true"></i> Save</a></li>';
		  var config=jchaos.variable("camera_view","get");
		  if(Object.keys(config).length){
          html+='<li class="dropdown-submenu"> \
            <a class="dropdown-item dropdown-toggle" href="#"><i class="fa fa-load" aria-hidden="true"></i> Load</a> \
            <ul class="dropdown-menu">';

			for(var k in config){
				html+='<li><a class="dropdown-item" href="load_config(\"'+k+'\")">'+k+'</a></li>'
			}
			html+='</ul></li>';
		}
            html+='</ul></li>';
			return html;
		}
		var settings=jqccs.initSettings("camera_view-settings","../dashboard-settings.json");
		$.contextMenu({
    selector: '.cappmenu',
	trigger:'left',
    zIndex: 10000,
    build: function ($trigger, e) {
      var domid = $(e.currentTarget).attr("cuindex");
      var name = mapcamera[domid];
      var cuitem = {};
	  var config=jchaos.variable("camera_view","get");
	  if(Object.keys(config).length){
		var configs={};
		for(var k in config){
			configs[k]={
				name: k,
				callback:function(){
					load_config(config[k]);
				}
			}
		}
		cuitem['load']={
		name: "Load Config",
		icon:"fa-sign-in",
       	 items: configs
	  }
	  }
	  cuitem['save-config'] = {
        name: "Save",
		icon:"fa-save",
        callback: function () {
			$(this).save_config();
				
        }
	}
      cuitem['quit'] = {
        name: "Quit",
        callback: function () {
		          
				
        },
        icon: function () {
          return 'context-menu-icon context-menu-icon-quit';
        }

      };


      return { items: cuitem };

    }

  });

		$("#app-name").html("CAMERA VIEW");
		$("#app-setting").on("click", function () {
				jqccs.handle_config('camera_view-settings',"../dashboard-settings.json");
               /* var templ = {
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
				*/
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
		function load_config(c){
			settings['cameraPerRow']=c.col;
    		settings['maxCameraRow']=c.row;
			settings['map']=c.w2cam;
			$("#main-dashboard").buildCameraArray(settings);


		}
	</script>


</body>

</html>