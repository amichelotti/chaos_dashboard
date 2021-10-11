<html>
<?php
		require_once('head.php');

		$curr_page = "MAGNET CHECK";

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

                    <div class="statbox purple col-sm-6">
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

                        </div>
                    </div>
                </div>
                <div class="row box">
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
                        <div class="card list-group" style="width: 18rem;">
                            <div id="outofpol_h" class="card-header">
                                Out Of Polarity
                            </div>
                            <ul id="outofpol" class="listview">

                            </ul>
                        </div>
                    </div>
                    <div class="col-sm">
                        <div class="card" style="width: 18rem;">
                            <div id="outofstat_h" class="card-header">
                                Out Of Status
                            </div>
                            <ul id="outofstat" class="listview">

                            </ul>
                        </div>
                    </div>
                    <div class="col-sm">
                        <div class="card list-group" style="width: 18rem;">
                            <div id="fault_h" class="card-header">
                                PS Fault
                            </div>
                            <ul id="fault" class="listview">

                            </ul>
                        </div>
                    </div>
                    <div class="col-sm">
                        <div class="card list-group" style="width: 18rem;">
                            <div id="bad_h" class="card-header">
                                Bad Status
                            </div>
                            <ul id="bad" class="listview">

                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <footer>
        <?php require_once('footer.php');?>
    </footer>






    <script>
        var outofset = ["--"];
        var outofpol = ["--"];
        var outofstat = ["--"];
        var fault = ["--"];
        var bad = ["--"];


        var l_outofset = {};
        var l_outofpol = {};
        var l_outofstat = {};
        var l_fault = {};
        var l_bad = {};

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
            jchaos.search(search, "cu", true, { "interface": "powersupply" }, function (list_cu) {

                jchaos.getChannel(list_cu, 255, function (run_info) {
                    var n_outofset = [];
                    var n_outofpol = [];
                    var n_outofstat = [];
                    var n_fault = [];
                    var n_bad = [];

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
                            if (ele.health.cuh_alarm_lvl) {
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
                                        l_bad[name]['desc'] = desc;
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
                                descs[name] = desc;

                            }
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
                            if (outofpol.find((val) => { return (val == k) })) {
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
                            if (outofset.find((val) => { return (val == k) })) {
                                updateset = true;
                            }
                        }
                    }
                    for (const k in l_fault) {
                        if (l_fault[k].hasOwnProperty("desc")) {

                            n_fault.push(k);
                            if (fault.find((val) => { return (val == k) })) {
                                updatefault = true;
                            }
                        }
                    }
                    for (const k in l_bad) {
                        if (l_bad[k].hasOwnProperty("desc")) {

                            n_nad.push(k);
                            if (baf.find((val) => { return (val == k) })) {
                                updatebad = true;
                            }
                        }
                    }
                    if (updateset || (outofset.length != n_outofset.length)) {
                        outofset = n_outofset;
                        refreshList("outofset", outofset);

                    }

                    if (updatestat || (outofstat.length != n_outofstat.length)) {
                        outofstat = n_outofstat;
                        refreshList("outofstat", outofstat);
                    }

                    if (updatepol || (outofpol.length != n_outofpol.length)) {
                        outofpol = n_outofpol;
                        refreshList("outofpol", outofpol);

                    }
                    if (updatefault || (fault.length != n_fault.length)) {
                        fault = n_fault;
                        refreshList("fault", fault);
                    }
                    if (updatebad || (bad.length != n_bad.length)) {
                        bad = n_bad;
                        refreshList("bad", bad);
                    }
                    $("#outofpol_h").html("<b>Out Of Polarity</b> " + outofpol.length);
                    $("#outofset_h").html("<b>Out Of Set</b> " + outofset.length);
                    $("#outofstat_h").html("<b>Out Of Status</b> " + outofstat.length);
                    $("#fault_h").html("<b>Fault</b> " + fault.length);
                    $("#bad_h").html("<b>Bad Status</b> " + bad.length);


                    if (bad.length == 0) {
                        $("#bad_h").addClass("bg-success");
                    } else if (bad.length == 1) {
                        $("#bad_h").addClass("bg-warning");
                    } else {
                        $("#bad_h").addClass("bg-danger");

                    }
                    if (outofpol.length == 0) {
                        $("#outofpol_h").addClass("bg-success");
                    } else if (outofpol.length == 1) {
                        $("#outofpol_h").addClass("bg-warning");
                    } else {
                        $("#outofpol_h").addClass("bg-danger");

                    }
                    if (outofstat.length == 0) {
                        $("#outofstat_h").addClass("bg-success");
                    } else if (outofstat.length == 1) {
                        $("#outofstat_h").addClass("bg-warning");
                    } else {
                        $("#outofstat_h").addClass("bg-danger");
                    }
                    if (outofset.length == 0) {
                        $("#outofset_h").addClass("bg-success");
                    } else if (outofset.length == 1) {
                        $("#outofset_h").addClass("bg-warning");
                    } else {
                        $("#outofset_h").addClass("bg-danger");
                    }
                    if (fault.length == 0) {
                        $("#fault_h").addClass("bg-success");
                    } else if (fault.length == 1) {
                        $("#fault_h").addClass("bg-warning");
                    } else {
                        $("#fault_h").addClass("bg-danger");
                    }


                });

            });

        }
        function refreshList(dom, l) {
            $("#" + dom).empty();

            l.forEach(item => {
                var n = jchaos.encodeName(item);
                var t = (JSON.stringify(descs[item])).replaceAll("\"", "");
                // var l = "<li class=\"list-group-item list-group-item-action\" title=\""+t+"\" id=\""+n+"\">"+item+"</li>";
                var l = "<li title=\"" + t + "\" id=\"" + n + "\">" + item + "</li>";
                $("#" + dom).append(l);
            });
            $("#" + dom).simsCheckbox({

                btnStyle: 'checkbox',
                height: 'auto',
                element: "li",
                titleIcon: "square-o",
                uncheckedClass: "btn-default",
                checkedClass: "btn-warning",
                selectAllBtn: false,
                selectAllText: 'Select/Unselect All'
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
        $("#classes").change(function () {

            selclass = $("#classes option:selected").val();
            resetSearch();

        });
        setInterval(() => {
            refreshAll();
        }, 2000);
    </script>


</body>

</html>