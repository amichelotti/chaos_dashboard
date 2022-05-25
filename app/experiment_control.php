<html>
<?php
require_once('experiment_control_head.php');

$curr_page = "Experiment Control";

?>

<body>

    <?php
    require_once('experiment_control_header.php');
    echo '<script src="../js/jquery.terminal/js/jquery.terminal.min.js"></script>';
    echo '<script src="../js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
    echo '<link href="../js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';

    ?>
    <link href="../css/font-awesome.min.css" rel="stylesheet">


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
                <div id="control_view" class="box-content invisible">

                    <div class="box row">
                        <div id="desc_view" class="col-md-3"></div>
                        <div class="col-md-3">
                            <div class="row">
                                 <div class="wait_modal"></div>

                                <label for="session"><strong>Session:</strong></label>
                                <input name="session" id="session_name" placeholder="Session name (default to Date)"></input>
                            </div>
                            <div class="row">
                                <label for="progressive"><strong>Progressive:</strong></label>
                                <input name="progressive" id="progressive_id" value=0></input>
                            </div>
                            <div class="row">
                                <label for="tag"><strong>Tag:</strong></label>
                                <div name="tag" id="tag_id"></div>
                            </div>
                            <div class="row">
                                <label for="script"><strong>Choose Script:</strong></label>
                                <select name="script" id="script_select"></select>

                            </div>
                            <div class="row script_control invisible">
                            
                                <div class="col">
                                    <button id="edit-params" type="button" class="btn btn-success">Change Param..</button>
                                </div>
                                <div class="col">
                                    <button id="run-script" type="button" class="btn btn-success">RUN </button>
                                </div>
                                <div class="col">
                                    <button id="cancel-script" type="button" class="btn btn-danger">STOP</button>
                                </div>
                            </div>
                        </div>
                        <div id="script_area" class="col-md-6">
                            <div id="script_view" class="row">


                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer>
            <?php require_once('footer.php'); ?>

            <audio src="../audio/twoknocks.mp3" width="0" height="0" id="bau"></audio>
        </footer>





        <script>
            var experiment_sel = {}
            var current_experiment = {}
            var current_script = {}
            var current_args = {}

            var progressive_id = 0;
            var tagname = "";
            if(dashboard_settings && dashboard_settings.hasOwnProperty('lastProgressive')){
                progressive_id=dashboard_settings['lastProgressive'];
                $("#progressive_id").val(progressive_id);
            }
            jqccs.busyWindow(false);

            function onfailure(code){
                jqccs.busyWindow(false);

                alert("Script "+ current_script.script_name+" failed error:"+code);

            }
            function onsuccess(code){
                jqccs.busyWindow(false);

                if(typeof progressive_id === "number"){
                    progressive_id++;
                    $("#progressive_id").val(progressive_id);
                    if(dashboard_settings.hasOwnProperty('lastProgressive')){
                        dashboard_settings['lastProgressive']=progressive_id;
                        localStorage['experiment_control_settings'] = JSON.stringify(dashboard_settings);

                    }

                }
                
                jqccs.instantMessage("OK ", current_script.script_name, 5000, true);

            }
            function updateTag() {
                var sn = $("#session_name").val();
                if (sn == "") {
                    let yourDate = new Date()
                    sn = yourDate.toISOString().split('T')[0]

                }
                tagname = current_experiment.zone + "/" + current_experiment.group + "/" + current_experiment.experiment + "/" + sn + "/" + progressive_id;
                $("#tag_id").html(tagname);
            }

            function resetSearch(zon, gro) {
                jchaos.variable("experiments", "get", (exp) => {
                    var zones = [];
                    var classes = [];
                    var experiments = [];
                    $("#group_select").addClass("invisible");
                    $("#experiment_select").addClass("invisible");
                    $("#control_view").addClass("invisible");

                    experiment_sel = {}
                    for (var k in exp) {
                        if (exp[k].hasOwnProperty("zone") && exp[k].hasOwnProperty("group")) {
                            if ((zon != null)) {
                                if (zon == exp[k].zone) {
                                    zones.push(exp[k].zone);
                                    if (gro == null) {
                                        classes.push(exp[k].group);
                                    } else if (gro == exp[k].group) {
                                        classes.push(exp[k].group);
                                        experiments.push(k);
                                        experiment_sel[k] = exp[k]
                                    }

                                }
                            } else {
                                zones.push(exp[k].zone);
                                //  classes.push(exp[k].group);
                                // experiments.push(k);

                            }

                        }
                    }
                    if (zones.length > 0) {
                        jqccs.element_sel('#zones', zones, 0, zon);
                    }
                    if (classes.length > 0) {
                        $("#group_select").removeClass("invisible");
                        jqccs.element_sel('#classes', classes, 0, gro);
                    }
                    if (experiments.length > 0) {
                        $("#experiment_select").removeClass("invisible");

                        jqccs.element_sel('#experiments', experiments, 0);
                    }
                });

            }
            resetSearch(null, null);

            $("#zones").change(function() {
                var selzone = $("#zones option:selected").val();

                if (selzone == "--Select--") {
                    selzone = null;
                }
                resetSearch(selzone, null, null);

            });
            $("#session_name").on("input", function() {
                updateTag();
            });
            $("#classes").change(function() {
                var selzone = $("#zones option:selected").val();
                var selclass = $("#classes option:selected").val();
                if (selclass == "--Select--") {
                    selclass = null;
                }
                resetSearch(selzone, selclass, null);

            });
            $("#progressive_id").change(function() {
                var id = $("#progressive_id").val();
                if (id == "") {
                    progressive_id = Math.trunc(new Date().getTime() / 1000);
                } else {
                    let n = parseInt(id);
                    if (n == "NaN") {
                        progressive_id = id;
                    } else {
                        progressive_id = n;
                    }
                }

                updateTag();

            });
            $("#edit-params").on("click",function(){
                jqccs.jsonEditWindow("Parameters", {}, current_args, (json)=>{
                    current_args=json;
                    return 0;
                }, null);
            });
            $("#run-script").on("click",function(){
                updateTag();
                jqccs.busyWindow(true);

                if(current_script.hasOwnProperty("script_name")){
                    jchaos.loadScript(current_script.script_name, current_script.seq, function(data) {
                                if (typeof data === "object" && data.hasOwnProperty('eudk_script_content')) {
                                    var obj = atob(data['eudk_script_content']);
                                    obj+="\nmain("+JSON.stringify(current_args)+",\""+tagname+"\");";
                                    $('#script_view').terminal().exec(obj,false);

                                } else {
                                    jqccs.instantMessage("Empty content ", current_script.script_name, 5000, false);

                                }
                            }, function(bad) {
                                jqccs.instantMessage("Error retriving ", current_script.script_name, 5000, false);

                            });

                        } else {
                            alert("No valid script loaded");
                        }
                });

            
            $("#script_select").change(function() {
                var script = $("#script_select option:selected").val();
                if (script != "--Select--") {
                    jchaos.search(script, "script", false, function(l) {
                        if (l.hasOwnProperty('found_script_list') && (l['found_script_list'] instanceof Array)&&(l.found_script_list.length>0)) {
                            $(".script_control").removeClass("invisible");
                            current_script=l['found_script_list'][0];
                            current_args={};
                            current_experiment.scripts.forEach(ele=>{
                                if(ele.name==script){
                                    current_args=ele.def_param;
                            
                                }
                            });
                        } else {
                            alert("Script "+script + " NOT found, please add through Scripts");
                            $(".script_control").addClass("invisible");
                            current_script={}

                        }

                    });

                } else {
                    $(".script_control").addClass("invisible");

                }
                updateTag();

            })
            $("#experiments").change(function() {
                var experiments = $("#experiments option:selected").val();
                if (experiments == "--Select--") {
                    experiments = null;
                    $("#control_view").addClass("invisible");

                } else {
                    $("#control_view").removeClass("invisible");
                    current_experiment = experiment_sel[experiments];

                    $('#desc_view').html(jqccs.json2html(current_experiment));
                    jqccs.jsonSetup($('#desc_view'), function(e) {});
                    $('#desc_view').find('a.json-toggle').click();
                    jqccs.element_sel('#script_select', current_experiment.scripts, 0);
                    updateTag()
                    var methods = Object.getOwnPropertyNames(jchaos).filter(function(property) {
                        return typeof jchaos[property] == 'function';
                    });
                    var methods_full = [];
                    methods.forEach(function(elem) {
                        methods_full.push("jchaos." + elem);
                    });
                    methods = Object.getOwnPropertyNames(jqccs).filter(function(property) {
                        return typeof jqccs[property] == 'function';
                    });
                    methods.forEach(function(elem) {
                        methods_full.push("jqccs." + elem);
                    });
                    $('#script_view').terminal(function(command) {
                        if (command !== '') {
                            try {
                                if (command == "help") {
                                    return;
                                }
                                var regxp = /^\s*console\.([a-z]{3,})\((.*)\)\s*;/;
                                var match = regxp.exec(command);

                                if (match != null) {

                                    var result = window.eval(match[2]);
                                    if (result !== undefined) {
                                        if (match[1] == "error") {
                                            this.error(new String(result));
                                            onfailure(result);

                                        } else {
                                            this.echo(new String(result));
                                            
                                        }
                                    }
                                }

                                var result = window.eval(command);

                                if (result !== undefined) {
                                    
                                    this.echo(new String(result));
                                    if(result==0){
                                        onsuccess();
                                    } else {
                                        onfailure(result);
                                    }
                                } else {
                                    onfailure("undefined");

                                }
                            } catch (e) {
                                this.error(new String(e));
                                onfailure(new String(e));

                            }
                        } else {
                            this.echo('');
                        }
                    }, {
                        greetings: 'JavaScript Chaos Interpreter',
                        name: 'JChaos',
                        height: 600,
                        prompt: 'chaos-js> ',
                        completion: methods_full
                     
                    },onsuccess,onfailure);
                    jchaos.setOptions({"console_log":$('#script_view').terminal().echo,"console_err":$('#script_view').terminal().error});

                }
            });
        </script>


</body>

</html>