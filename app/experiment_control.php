<html>
<?php
		require_once('head.php');

		$curr_page = "Experiment Control";

?>

<body>

    <?php
			require_once('header.php');
?>
    <link href="../css/font-awesome.min.css" rel="stylesheet">

    <link href="../js/list-selection/simsCheckbox.css" rel="stylesheet">
    <script src="../js/list-selection/simsCheckbox.js"></script>

    <div class="container-fluid px-4">
        <div class="row">
            <div class="col-md-12">
                <div class="row">
                    <div class="statbox purple col-sm-3">
                        <h3>ZONE</h3>
                        <select id="zones" size="auto">
                        </select>
                    </div>

                    <div id="group_select" class="invisible statbox purple col-sm-2">
                        <h3>Group</h3>
                        <select id="classes">
                        </select>
                    </div>

                    <div id="experiment_select" class="statbox purple invisible col-sm-2">
                        <h3>Experiment</h3>
                        <select id="experiments">
                        </select>
                    </div>

                    
                </div>
                <div class="box-content">

<div class="box row">
    <div id="hier_view" class="col-md-3"></div>
    <div class="wait_modal"></div>
    <div id="desc_view" class="col-md-3"></div>
    <div class="chaos_synoptic_container">
        <img id="zone_image" src="" />
        <svg id="svg_img" viewBox="0 0 640 480"></svg>
    </div>

</div>
</div>
            </div>
        </div>
    </div>
    <footer>
        <?php require_once('footer.php');?>
        
        <audio src="../audio/twoknocks.mp3" width="0" height="0" id="bau"></audio>
    </footer>






    <script>

        function resetSearch(zon,gro){
            jchaos.variable("experiments","get",(exp)=>{
                var zones=[];
                var classes=[];
                var experiments=[];
                $("#group_select").addClass("invisible");
                $("#experiment_select").addClass("invisible");

                for(var k in exp){
                    if(exp[k].hasOwnProperty("zone") && exp[k].hasOwnProperty("group")){
                        if((zon!=null)){
                            if(zon==exp[k].zone){
                                zones.push(exp[k].zone);
                                if(gro==null){
                                    classes.push(exp[k].group);
                                } else if(gro==exp[k].group){
                                    classes.push(exp[k].group);
                                    experiments.push(k);
                                }
                                
                            }
                        } else {
                            zones.push(exp[k].zone);
                          //  classes.push(exp[k].group);
                           // experiments.push(k);

                        }

                    }
                }
                
                jqccs.element_sel('#zones', zones, 0,zon);
                if(classes.length>0){
                    $("#group_select").removeClass("invisible");
                    jqccs.element_sel('#classes', classes, 0,gro);
                }
                if(experiments.length>0){
                    $("#experiment_select").removeClass("invisible");

                    jqccs.element_sel('#experiments', experiments, 0);   
                }
            });
            
        }
        resetSearch(null,null);
        
        $("#zones").change(function () {

            var selzone = $("#zones option:selected").val();
            if(selzone=="--Select--"){
                selzone=null;
            }
            resetSearch(selzone,null,null);

        });
        $("#classes").change(function () {
            var selzone = $("#zones option:selected").val();
            var selclass = $("#classes option:selected").val();
            if(selclass=="--Select--"){
                selclass=null;
            }
            resetSearch(selzone,selclass,null);

});


    </script>


</body>

</html>