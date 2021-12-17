<html>
<?php
		require_once('head.php');

		$curr_page = "Hunter Dog";

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

                    <div class="statbox purple col-sm-2">
                        <h3>Family</h3>
                        <select id="classes">
                        </select>
                    </div>

                    <div class="statbox purple col-sm-7">
                        <div class="row">
                            <div class="col-sm">
                                <h3>Live</h3>
                                <label for="search-alive">All </label><input class="input-xlarge"
                                    id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive"
                                    type="radio" value=false>
                                <label for="search-alive">Alive</label><input class="input-xlarge"
                                    id="search-alive-true" title="Search just alive nodes" name="search-alive"
                                    type="radio" value=true checked>
                            </div>

                            <div class="col-sm">
                                <h3>Regex Search</h3>
                                <input class="input-xlarge focused" id="search-chaos" title="Free form Regex Search"
                                    type="text" value="">
                            </div>
                            <label class="checkbox-inline">
						        <input type="checkbox" id="audio_enable" data-toggle="toggle"> audio enable
					        </label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-9">
                        <div class="box row">
                            <div class="col-sm">
                                <div class="card list-group ">
                                    <div id="outofset_h" class="card-header">
                                        Out Of Set
                                    </div>
                                    <ul id="outofset" class="listview">

                                    </ul>
                                </div>
                            </div>
                            <div class="col-sm">
                                <div class="card list-group">
                                    <div id="outofpol_h" class="card-header">
                                        Out Of Polarity
                                    </div>
                                    <ul id="outofpol" class="listview">

                                    </ul>
                                </div>
                            </div>
                            <div class="col-sm">
                                <div class="card">
                                    <div id="outofstat_h" class="card-header">
                                        Out Of Status
                                    </div>
                                    <ul id="outofstat" class="listview">

                                    </ul>
                                </div>
                            </div>
                            <div class="col-sm">
                                <div class="card list-group">
                                    <div id="fault_h" class="card-header">
                                        PS Fault
                                    </div>
                                    <ul id="fault" class="listview">

                                    </ul>
                                </div>
                            </div>
                            <div class="col-sm">
                                <div class="card list-group">
                                    <div id="bad_h" class="card-header">
                                        Bad Status
                                    </div>
                                    <ul id="bad" class="listview">

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-1 align-self-center">
                    <div class="row justify-content-center">
                            <div class="row" id="magnum">TOT 0</div>

                        </div>
                        <div class="row justify-content-center">
                            <button type="button" id="b_mask" class="btn btn-default btn-lg">
                                <i class="fa fa-long-arrow-right fa-4x" aria-hidden="true"></i></span>
                            </button>

                        </div>
                        <div class="row justify-content-center">
                            <button type="button" id="b_unmask" class="btn btn-default btn-lg">
                                <i class="fa fa-long-arrow-left fa-4x" aria-hidden="true"></i></span>
                            </button>                        
                        </div>
                    </div>
                    <div class="col-sm-2 box">
                        <div class="card list-group">
                            <div id="masked_h" class="card-header">
                                Masked
                            </div>
                            <ul id="masked" class="listview">

                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <footer>
        <?php require_once('footer.php');?>
        
        <audio src="../audio/threeknocks.mp3" width="0" height="0" id="bau"></audio>
    </footer>






    <script>
        var outofset = [];
        var outofpol = [];
        var outofstat = [];
        var fault = [];
        var bad = [];
        var dontupdatemask=false;
        var masklist={};
        var unmasklist={};

        var l_outofset = {};
        var l_outofpol = {};
        var l_outofstat = {};
        var l_fault = {};
        var l_bad = {};
        var old_mask_list=[];
        var descs = {};
        var selzone = "";
        var selclass = "";
        var selsearch = "";
        function resetSearch() {
            outofset = [];
            outofpol = [];
            outofstat = [];
            fault = [];
            bad = [];
            l_outofset = {};
            l_outofpol = {};
            l_outofstat = {};
            l_fault = {};
            l_bad = {};
            refreshAll();
        }
        $("#audio_enable").click(()=>{
                bau();

        })
        function bau() {
            var audio = document.getElementById("bau");
            var v=$("#audio_enable").is(":checked");
            if(v){
                audio.play();
            }
            
        }
        function refreshAll() {
            var search = "";
            if (selzone != "ALL") {
                search = selzone;
            }
            if (selclass != "ALL" && selclass != "") {
                search = search + "/" + selclass;
            }
            if (selsearch != "") {
                search = search + "/" + selsearch;
            }
            $("#magnum").removeClass("bg-success");
			var alive = ($("input[type=radio][name=search-alive]:checked").val()=="true");
            l_outofpol = {};
            l_outofset = {};
            l_outofstat = {};
            l_fault = {};
            l_bad = {};
            jchaos.search(search, "cu", alive, { "interface": "powersupply" }, function (list_cu) {

                jchaos.getChannel(list_cu, 255, function (run_info) {
                    var n_outofset = [];
                    var n_outofpol = [];
                    var n_outofstat = [];
                    var n_fault = [];
                    var n_bad = [];
                    var n_masked=[];
                    $("#magnum").html("TOT "+run_info.length);
                    $("#magnum").addClass("bg-success");

                    run_info.forEach(ele => {
                        var desc = {};

                        if (ele.hasOwnProperty("health")) {
                            var name = ele.health.ndk_uid;
                            l_outofpol[name] = {};
                            l_outofset[name] = {};
                            l_outofstat[name] = {};
                            l_fault[name] = {};
                            l_bad[name] = {};

                            descs[name] = {};
                            if(ele.health.cuh_alarm_msk){
                                if((ele.hasOwnProperty("cu_alarms")&&(ele.cu_alarms.hasOwnProperty("polarity_out_of_set_MASK")||
                                   ele.cu_alarms.hasOwnProperty("current_out_of_set_MASK")|| ele.cu_alarms.hasOwnProperty("stby_out_of_set_MASK")))||(
                                    (ele.hasOwnProperty("device_alarms")&&(ele.device_alarms.hasOwnProperty("faulty_state_MASK")||ele.device_alarms.hasOwnProperty("bad_state_MASK"))))
                                   ){
                                     for(var k in ele.cu_alarms){
                                         if(ele.cu_alarms.hasOwnProperty(k+"_MASK")){
                                            desc[k]= "MASKED";
                                         }
                                     }
                                     for(var k in ele.device_alarms){
                                         if(ele.device_alarms.hasOwnProperty(k+"_MASK")){
                                            desc[k]= "MASKED";
                                         }
                                     }
                                       n_masked.push(name);
                                }
                            }
                            if(ele.health.nh_status!="Start"){
                                desc['chaos_status']=ele.health.nh_status + " NOT MASKABLE";
                                l_bad[name]['desc'] = desc;

                            }
                            if (ele.health.cuh_alarm_lvl&&ele.hasOwnProperty("cu_alarms")&&ele.hasOwnProperty("device_alarms")) {
                                if (!ele.device_alarms.interlock && !ele.device_alarms.faulty_state && !ele.device_alarms.bad_state && !ele.device_alarms.unknown_state) {
                                    if (ele.cu_alarms.hasOwnProperty("polarity_out_of_set") && ele.cu_alarms.polarity_out_of_set) {
                                        desc['polarity_out_of_set'] = ele.cu_alarms.polarity_out_of_set;
                                        l_outofpol[name]['desc'] = desc;

                                    }
                                    if (ele.cu_alarms.hasOwnProperty("current_out_of_set") && ele.cu_alarms.current_out_of_set) {
                                        desc['current_out_of_set'] = ele.cu_alarms.current_out_of_set;

                                        l_outofset[name]['desc'] = desc;
                                    }
                                    if (ele.cu_alarms.hasOwnProperty("stby_out_of_set") && ele.cu_alarms.stby_out_of_set) {
                                        desc['stby_out_of_set'] = ele.cu_alarms.stby_out_of_set;

                                        l_outofstat[name]['desc'] = desc;
                                    }
                                } else {
                                    if (ele.device_alarms.hasOwnProperty("interlock") && ele.device_alarms.interlock) {
                                        desc['interlock'] = ele.device_alarms.interlock;
                                        l_fault[name]['desc'] = desc;
                                    }
                                    if (ele.device_alarms.hasOwnProperty("faulty_state") && ele.device_alarms.faulty_state) {
                                        desc["faulty_state"] = ele.device_alarms.faulty_state;
                                        l_fault[name]['desc'] = desc;
                                    }
                                    if (ele.device_alarms.hasOwnProperty("bad_state") && ele.device_alarms.bad_state) {
                                        desc["bad_state"] = ele.device_alarms.bad_state;

                                        l_bad[name]['desc'] = desc;
                                    }
                                    if (ele.device_alarms.hasOwnProperty("unknown_state") && ele.device_alarms.unknown_state) {
                                        desc["unknown_state"] = ele.device_alarms.unknown_state;

                                        l_bad[name]['desc'] = desc;
                                    }
                                }
                            }
                            descs[name] = desc;

                        }
                    });
                    var updateset = false;
                    var updatestat = false;
                    var updatepol = false;
                    var updatefault = false;
                    var updatebad = false;

                    for (const k in l_outofpol) {
                        if (l_outofpol[k].hasOwnProperty("desc")) {

                            n_outofpol.push(k);
                            if (!(outofpol.find((val) => { return (val == k) }))) {
                                updatepol = true;
                            }
                        }
                    }
                    for (const k in l_outofstat) {
                        if (l_outofstat[k].hasOwnProperty("desc")) {
                            n_outofstat.push(k);
                            if (!(outofstat.find((val) => { return (val == k) }))) {
                                updatestat = true;
                            }
                        }
                    }
                    for (const k in l_outofset) {
                        if (l_outofset[k].hasOwnProperty("desc")) {

                            n_outofset.push(k);
                            if (!(outofset.find((val) => { return (val == k) }))) {
                                updateset = true;
                            }
                        }
                    }
                    for (const k in l_fault) {
                        if (l_fault[k].hasOwnProperty("desc")) {

                            n_fault.push(k);
                            if (!(fault.find((val) => { return (val == k) }))) {
                                updatefault = true;
                            }
                        }
                    }
                    for (const k in l_bad) {
                        if (l_bad[k].hasOwnProperty("desc")) {

                            n_bad.push(k);
                            if (!(bad.find((val) => { return (val == k) }))) {
                                updatebad = true;
                            }
                        }
                    }
                    if (updateset || (outofset.length != n_outofset.length)||(outofset.length==0)) {
                        if(n_outofset.length>outofset.length){
                            bau();
                        }
                        outofset = n_outofset;
                        refreshList("outofset", "Out Of Set",outofset);
                        
                    }

                    if (updatestat || (outofstat.length != n_outofstat.length)||(outofstat.length==0)) {
                        if(n_outofstat.length>outofstat.length){
                            bau();
                        }
                        outofstat = n_outofstat;
                        refreshList("outofstat","Out Of Status", outofstat);
                        
                    }

                    if (updatepol || (outofpol.length != n_outofpol.length)||(outofpol.length==0)) {
                        if(n_outofpol.length>outofpol.length){
                            bau();
                        }
                        outofpol = n_outofpol;
                        refreshList("outofpol", "Out Of Polarity",outofpol);

                    }
                    if (updatefault || (fault.length != n_fault.length)||(fault.length==0)) {
                        if(n_fault.length>fault.length){
                            bau();
                        }
                        fault = n_fault;
                        refreshList("fault", "Fault", fault,list_cu.length);
                    }
                    if (updatebad || (bad.length != n_bad.length)||(bad.length==0)) {
                        if(n_bad.length>bad.length){
                            bau();
                        }
                        bad = n_bad;
                        refreshList("bad","Bad Status", bad);
                    }
                    

                    if(!dontupdatemask && (JSON.stringify(n_masked)!=JSON.stringify(old_mask_list))){
                        refreshList("masked", "Masked", n_masked);
                    }
                    old_mask_list=n_masked;
                });

            });

        }
        function maskUnMask(dev,maskunmask,mob){
            var mvalue= ((maskunmask)?0:0xFF);
            for(var k in mob){
                var alrm = {
                    name: k,
                    mask: mvalue
                }
                jchaos.command(dev, { "act_name": "cu_set_alarm", "act_msg": alrm }, function (data) {
                    jqccs.instantMessage(dev, "Set Mask on " + dev  + "/"+k+" = " + mvalue, 2000, true);

                }, function (bad) {
                    jqccs.instantMessage(dev,  "ERROR: Setting Mask on " + dev  + "/"+k+ " =" + mvalue +", error:"+ JSON.stringify(bad), 4000, false);

                });
        }
            
        }
        function refreshList(dom, t,l) {
            $("#" + dom).empty();

            l.forEach(item => {
                var n = jchaos.encodeName(item);
                var t = (JSON.stringify(descs[item])).replaceAll("\"", "");
                // var l = "<li class=\"list-group-item list-group-item-action\" title=\""+t+"\" id=\""+n+"\">"+item+"</li>";
                var l = "<li class=\"listitem\" title=\"" + t + "\" id=\"" + n + "\" cu=\""+item+"\">" + item + "</li>";
                $("#" + dom).append(l);
            });
            $("#"+dom+"_h").html("<b>"+t+"</b> " + l.length);

            $("#"+dom+"_h").removeClass("bg-danger");
            $("#"+dom+"_h").removeClass("bg-warning");
            $("#"+dom+"_h").removeClass("bg-success");

            if (l.length > 1) {
                $("#"+dom+"_h").addClass("bg-danger");
            } else if (l.length == 1) {
                $("#"+dom+"_h").addClass("bg-warning");
            } else {
                $("#"+dom+"_h").addClass("bg-success");

            }

            $("#" + dom).simsCheckbox({

                btnStyle: 'checkbox',
                height: 'auto',
                element: "li",
                titleIcon: "square-o",
                uncheckedClass: "btn-default",
                checkedClass: "btn-warning",
                selectAllBtn: false,
                selectAllText: 'Select/Unselect All',
                ifChecked:function() {
                    var cuname=this.attr("cu");
                    console.log("CHECK "+cuname);
                    if(dom=="masked"){
                        unmasklist[cuname]=descs[cuname];
                        console.log("selected to be unmasked:"+JSON.stringify(unmasklist[cuname]));

                    } else {
                        masklist[cuname]=descs[cuname];
                        console.log("selected to be masked:"+JSON.stringify(masklist[cuname]));
                    }

                },
                ifUnChecked:function() {
                    var cuname=this.attr("cu");
                    console.log("UNCHECK "+cuname);
                    if(dom=="masked"){
                        delete unmasklist[cuname];
                    } else {
                        delete masklist[cuname];
                    }
                }

            });

        }
        jchaos.search("", "zone", true, (zon) => {
            dashboard_settings.current_page = 0;
            jqccs.element_sel('#zones', zon, 1);
        });
        jchaos.search("", "class", true, function (ll) {
            jqccs.element_sel('#classes', ll, 1);
        });
        $(".listview").simsCheckbox();

        refreshAll();
        $("#zones").change(function () {

            selzone = $("#zones option:selected").val();
            resetSearch();



        });
        $("#search-chaos").keypress(function (e) {
            if (e.keyCode == 13) {
                selsearch = $("#search-chaos").val();
                resetSearch();

            }

        });
        $("#b_mask").click(function () {
            console.log("masking: "+JSON.stringify(masklist));
            //var l=[];
            for(var k in masklist){
           //     l.push(k);
                maskUnMask(k,true,masklist[k]);
            }
            //refreshList("masked", "Masked", l);

        });
        $("#b_unmask").click(function () {
            console.log("unmasking: "+JSON.stringify(unmasklist));
            var l=[];
            for(var k in unmasklist){
                maskUnMask(k,false,unmasklist[k]);

                delete masklist[k];
            }
         /*   for(var k in masklist){
                l.push(k);
            }
           */ 
            
          //  refreshList("masked","Masked", l);

        });
        $("#classes").change(function () {

            selclass = $("#classes option:selected").val();
            resetSearch();

        });
        $("#masked").mouseover(function () {
            dontupdatemask=true;
        });
        $("#masked").mouseout(function () {
            dontupdatemask=false;
        });

        $.contextMenu({
            selector: '.listitem',
            build: function($trigger, e) {
                var node_selected = $(e.currentTarget).attr("cu");

                var cuitem={};
                cuitem['desc'] = {
                    name: "Description",
                    callback: function(key, opt) {
                            
                        jchaos.node(node_selected, "desc", "cu", function(data) {

                            jqccs.showJson("Description " + node_selected, data.instance_description);
                        });
                    }

                }
                cuitem['dataset'] = {
                    name: "Show Dataset",
                    callback: function(key, opt) {
                            
                        jqccs.showDataset(node_selected,node_selected,dashboard_settings.generalRefresh)
                    }

                }
                cuitem['quit'] = {
                    name: "Quit",
                    icon: function() {
                        return 'context-menu-icon context-menu-icon-quit';
                    }
                };

                return {

                    items: cuitem
                }
            }


        });
        $("#app-name").html("HUNTER DOG");

        $("#app-setting").on("click", function () {
            var templ = {
                $ref: "../dashboard-settings.json",
                format: "tabs"
            }
            var def={}

            var def = JSON.parse(localStorage['chaos_dashboard_settings']);
            jqccs.jsonEditWindow("Config", templ, def, function (d) {
                localStorage['chaos_dashboard_settings'] = JSON.stringify(d);
                console.log("Save settings:"+localStorage['chaos_dashboard_settings']);
                var e = jQuery.Event('keypress');
                e.which = 13;
                e.keyCode = 13;
                if(d.hasOwnProperty("defaultRestTimeout")){
                    jchaos.setOptions({ "timeout": d.defaultRestTimeout });
                } else {
                    jchaos.setOptions({ "timeout": 10000 });

                }
                location.reload();
                return 0;// close window
            //    $("#search-chaos").trigger(e);
            }, null);

        });
        setInterval(() => {
            refreshAll();
        }, 2000);
    </script>


</body>

</html>