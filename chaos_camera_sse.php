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

		<div id="cameraTable" class="container-fluid"></div>
	</div>




	<footer>
		<?php require_once('footer.php');?>
	</footer>






	<script>
		var oldid=0;
		var cams = ["FLAME/CLR/CAMERA/FLAOSCFF"];

		function rebuildCam(selectedCams, tmpObj) {

			var cnt = 0;
			var tablename = "main_table-camera";
			
			var html = '<table class="table table-striped" id="' + tablename + '">';
			if (tmpObj.maxCameraCol === undefined) {
				tmpObj['maxCameraCol'] = 3;
			}
			if (tmpObj.cameraPerRow === undefined) {
				tmpObj['cameraPerRow'] = 3;
			}
			if (selectedCams instanceof Array) {
				var hostWidth = $(window).width();
				var hostHeight = $(window).height();
				var maxwidth = Math.trunc(hostWidth / tmpObj.maxCameraCol);
				var maxheight = Math.trunc(hostHeight / tmpObj.cameraPerRow);

				selectedCams.forEach(function (key) {
					if (cnt < tmpObj.maxCameraCol) {
						var encoden = jchaos.encodeName(key);
						if ((cnt % tmpObj.cameraPerRow) == 0) {
							if (cnt > 0) {
								html += "</tr>"
							}
							html += '<tr class="row_element" height="' + maxheight + 'px" id=camera-row"' + cnt + '">';
						}
						html += '<td class="cameraMenu" width="' + maxwidth + 'px" id="camera-' + encoden + '" cuname="' + key + '" >'
						//   html += '<div><b>'+key+'</b>';
						html += '<div>';
						if (selectedCams.length > 1) {
							html += '<img class="chaos_image mw-100 mh-100" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';
							//   html += '<img class="chaos_image" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';
						} else {
							html += '<img class="chaos_image" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';

						}
						//                html += '<div class="row">';

						html += '<div>' + key + '</div>';
						html += '<div id="info-' + encoden + '"></div>';

						//               html += '</div></div></div>';
						html += '</div></div>';

						cnt++;
					}
				});

				if (cnt > 0) {
					html += "</tr>";

				}
			}
			html += "</table>";
			$("#cameraTable").html(html);
			var source = new EventSource("http://mikelinux:6917/FLAME.CLR.CAMERA.FLAOSCFF_o");
			var old_tim=0;
			source.addEventListener('message', function(e) {
				//  console.log("message:"+e.data);
					var ds=JSON.parse(e.data);
				  var id = jchaos.encodeName(ds.ndk_uid);
				  var start=Date.now();
				  //var bin = ds.FRAMEBUFFER.$binary.base64;

                  // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
                  $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);
                  if (ds.WIDTH !== undefined) {
                    $("#info-" + id).html(ds.WIDTH + "x" + ds.HEIGHT + "(" + ds.OFFSETX + "," + ds.OFFSETY + ") frame:" + ds.dpck_seq_id + " fupdate:"+1000.0/(start-old_tim));
                  } else {
                    $("#info-" + id).html("frame:" + ds.dpck_seq_id);

				  }
				  if((oldid+1)!=ds.dpck_seq_id){
					  console.log("missing packet:"+(oldid+1)+ " nmissing:"+(ds.dpck_seq_id-oldid-1) + " ms:"+start-old_tim);
				  }
				  oldid=ds.dpck_seq_id;
				  old_tim=start;
			}, false);

			source.addEventListener('open', function(e) {
				console.log("open:"+e.data);
			}, false);

			source.addEventListener('error', function(e) {
			if (e.readyState == EventSource.CLOSED) {
				console.log("error:"+e.data);
			}
			}, false);
			selectedCams.forEach(function (key) {
			});
		}
		rebuildCam(cams,{});
	</script>


</body>

</html>