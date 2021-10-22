<!DOCTYPE html>

<html>
<?php
require_once('head.php');
$curr_page = "CONFIG";
?>

<body>

	<?php
require_once('header.php');
?>

	<div class="container-fluid px-4">


		<div class="row border">

			<div class="col-md-12">
				<div class="row bg-info">

					<h3>CHAOS Configuration</h3>
				</div>
				<div class="row border border-info">
					<div class="col-md-12">

						<label for="save-configuration" class="form-label">Save whole configuration </label>
						<a class="btn-outline-info icon-save col-md-2" id="save-configuration">Save To Disk</a>
					</div>
					<div class="col-md-12">
						<label for="upload-file" class="form-label">Import configuration </label>
						<input id="upload-file" type="file" class="form-control-md" />
					</div>

				</div>
			</div>
		</div>
		<div class="row border">
			<div class="col-md-12 box">
				<div class="row bg-info">
					<h3>Variables</h3>
				</div>
				<div class="row border border-info">
					<div class="col-md-12">
						<input class="input-xlarge focused" id="varname" type="text" title="variable name search"
							value="" />
						<a class="btn-outline-info" id="update-variable"><i class='material-icons verde'>search</i>
							<p>Search</p>
						</a>
					</div>
					<div class="col-md-12">

						<div id="chaos_variables"></div>
					</div>
				</div>
			</div>
		</div>




	</div> <!-- content -->

	<div id="jsoneditor"> </div>
	<footer>
		<?php require_once('footer.php');?>
	</footer>







	<script>
		function varupdate(varname) {
			var variables = {};

			jchaos.search(varname, "variable", false, function (vl) {
				vl.forEach(function (v) {
					jchaos.variable(v, "get", null, function (d) {
						variables[v] = d;
						var dom = "#chaos_variables";
						$(dom).html(jqccs.json2html(variables));

						jqccs.jsonSetup(dom, function (e) {

						}, function (e) {
							if (e.keyCode == 13) {

								var value = e.target.value;
								var attrname = e.target.name;

								console.log("setting " + attrname + " =" + value);

								return true;
							} else {
								return false;
							}

						});
						$(".json-toggle").trigger("click");

						/* Simulate click on toggle button when placeholder is clicked */
						//$("a.json-placeholder").click(function () {


					});
				});class="container-fluid"");
			if (n != -1) {
				str = str.substring(n + 1);
				n = str.indexOf("/");
				if (n != -1) {
					var key = str.substring(0, n - 1);
					variable[key] = pathToVariable(variable[key], key, value);
				} else {
					var key = str.substring(0);
					variable[key] = value;

				}
			} else {
				variable[str] = value;
				return variable;
			}

			while ((n = str.indexOf("/")) != -1) {
				if (oldn > 0) {
					var key = str.substring(oldn + 1, n - 1);
				}
			}
		}
		$("#menu-dashboard").generateMenuBox();
		$("#jsoneditor").generateEditJson();
		$(this).editActions();
		//$("#upload_selection").multiSelect("select_all");

		$("#save-configuration").on("click", function () {
			jchaos.saveFullConfig();
		});

		$("#update-variable").on("click", function () {
			varupdate($("#varname").val());
		});
		$('#upload-file').on('change', function () {
			var fname = this.files[0];

			jqccs.busyWindow(false);
			jqccs.confirm("Do You want OVERWRITE FULL CONFIGURATION?", "Current Confuration will be lost, using:" + fname.name, "Ok", function () {
				
				var reader = new FileReader();
				


				reader.onload = function (e) {
					var cmdselected = $("#upload_selection").val();
					
					try {
						var o = JSON.parse(e.target.result);
					} catch (e) {
						alert("ERROR parsing '" + fname.name + "' : " + e);
						jqccs.busyWindow(false);
						location.reload();

						return;
					}
					try{
						
						setTimeout(() => {
							jchaos.restoreFullConfig(o, cmdselected);
							jqccs.instantMessage("Restored " + fname.name, " OK", 3000, true);
							location.reload();
							jqccs.busyWindow(false);

						}, 100);
					    


					} catch(e){
						jqccs.instantMessage("Error " + fname.name, " error:"+e, 5000, false);
						jqccs.busyWindow(false);

					}

				};

				jqccs.busyWindow(true, 120000, () => {
						alert("Timeout check the REST port on Settings->Config->defaultRestPort");
				});
				reader.readAsText(fname);

				
			}, "Cancel");
		});
		varupdate("");
	</script>


</body>

</html>