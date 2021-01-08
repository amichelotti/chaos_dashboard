function getWidget() {
    var chaos = 
     {
       dsFn:{
        output:{
         
  
        }
      
      },
      tableFn:function (tmpObj) {
        var cu=[];
        if(tmpObj['elems'] instanceof Array){
             cu = tmpObj.elems;
        }        
        var template = tmpObj.type;
    
        var html = '<table class="table table-striped" id="graph_table_BPM">';
        html += '</table>';
    
        html += '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content">';
        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Element</th>';
        html += '<th colspan="3">Status</th>';
        html += '<th>X</th>';
        html += '<th>Y</th>';
        html += '<th>VA</th>';
        html += '<th>VB</th>';
        html += '<th>VC</th>';
        html += '<th>VD</th>';
        html += '<th>SUM</th>';
        html += '<th colspan="2">Samples/Trigger</th>';
        html += '<th colspan="2">Alarms dev/cu</th>';
        html += '</tr>';
        html += '</thead>';
    
    
        $(cu).each(function (i) {
          var cuname = jchaos.encodeName(cu[i]);
          html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
          html += "<td class='td_element td_name'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td id='" + cuname + "_system_busy'></td>";
          html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
          html += "<td title='Calculated X position' id='" + cuname + "_output_X'></td>";
          html += "<td title='Calculated Y position' id='" + cuname + "_output_Y'></td>";
          html += "<td title='VA' id='" + cuname + "_output_VA'></td>";
          html += "<td title='VB' id='" + cuname + "_output_VB'></td>";
          html += "<td title='VC' id='" + cuname + "_output_VC'></td>";
          html += "<td title='VD' id='" + cuname + "_output_VD'></td>";
          html += "<td title='SUM' id='" + cuname + "_output_SUM'></td>";
          html += "<td title='Samples' id='" + cuname + "_input_SAMPLES'></td>";
          html += "<td title='Trigger' id='" + cuname + "_input_TRIGGER'></td>";
    
          html += "<td title='Device alarms' id='" + cuname + "_system_device_alarm'></td>";
          html += "<td title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td></tr>";
    
        });
    
        html += '</table>';
        html += '</div>';
        html += '</div>';
    
        html += '</div>';
    
        return html;
      },
      cmdFn:function (tmpObj) {
        var html = '<div class="row">';
        html += '<div class="box col-md-12 box-cmd">';
        html += '<div class="box-header green">';
        html += '<h3 id="h3-cmd">Commands</h3>';
        html += '</div>';
        html += '<div class="box-content">';
        html += '<div class="col-md-12 statbox">';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="bpm_acquire_sa" cucmdid="acquire" cucmdvalue={\"enable\":1,\"mode\":2,\"loops\":-1,\"samples\":1}>';
        html += '<i class="material-icons verde">trending_down</i>';
        html += '<p class="name-cmd">SlowAcquisition</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="bpm_acquire_da"  cucmdid="acquire" cucmdvalue={\"enable\":1,\"mode\":1,\"loops\":-1,\"samples\":1024}>';
        html += '<i class="material-icons verde">trending_up</i>';
        html += '<p class="name-cmd">DataOnDemand</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="bpm_acquire_tda"  cucmdid="acquire" cucmdvalue={\"enable\":1,\"mode\":257,\"loops\":-1,\"samples\":1024}>';
        html += '<i class="material-icons verde">timer</i>';
        html += '<p class="name-cmd">DataOnDemand (Triggered)</p>';
        html += '</a>';
        html += "<div class='col-md-3 statbox'>";
        html += "<h3>Samples</h3>";
        html += "<input type='number' id='acquire_samples'>";
        html += "</div>";
    
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="bpm_acquire_stop"  cucmdid="cu_clear_current_cmd" >';
        html += '<i class="material-icons rosso">pause_circle_outline</i>';
        html += '<p class="name-cmd">Stop Acquisition</p>';
        html += '</a>';
    
    
        html += '</div>';
        html += '<div class="col-md-12 statbox">';
        html += '<textarea class="form-control" rows="5" id="BPM_STATUS"></textarea>';
    
        //html += '<p id="BPM_STATUS"/>';    
        html += '</div>';
    
        html += '</div>';
    
        html += '</div>';
        html += '</div>';
    
        html += '</div>';
    
        return html;
      },
      updateFn:function(tmpObj) {
        var cu = tmpObj.data;
        if (JSON.stringify(tmpObj['elems']) !== JSON.stringify(tmpObj['old_elems'])) {
          var chart_options = {
            maxpoints: 10,
            npoints: 0,
            chart: {
    
            },
            title: {
              text: ''
            },
    
            xAxis: {
              type: "datetime",
              title: {
                text: 'Time'
              }
            },
            yAxis: {
              title: {
                text: 'V'
              }
    
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle'
            },
    
            plotOptions: {
              series: {
                label: {
                  connectorAllowed: false
                },
              }
            },
            series: [{
              name: 'VA',
              data: []
            }, {
              name: 'VB',
              data: []
            }, {
              name: 'VC',
              data: []
            }, {
              name: 'VD',
              data: []
            }, {
              name: 'SUM',
              data: []
            }]
          };
          jqccs.makeDynamicGraphTable(tmpObj, "graph_table_BPM", chart_options, tmpObj['elems']);
          tmpObj['old_elems'] = tmpObj['elems'];
        }
        var now = (new Date()).getTime();
        jqccs.updateGenericTableDataset(tmpObj);
    
        cu.forEach(function (elem) {
          if (elem.hasOwnProperty('health') && elem.health.hasOwnProperty("ndk_uid")) {   //if el health
    
            var cuname = jchaos.encodeName(elem.health.ndk_uid);
            if ((tmpObj.node_selected != null) && (elem.health.ndk_uid == tmpObj.node_selected)) {
              $("#BPM_STATUS").html(elem.output.STATUS);
            }
            $("#" + cuname + "_output_X").html(elem.output.X.toFixed(3));
            $("#" + cuname + "_output_Y").html(elem.output.Y.toFixed(3));
            $("#" + cuname + "_output_VA").html(elem.output.VA);
            $("#" + cuname + "_output_VB").html(elem.output.VB);
            $("#" + cuname + "_output_VC").html(elem.output.VC);
            $("#" + cuname + "_output_VD").html(elem.output.VD);
            $("#" + cuname + "_output_SUM").html(elem.output.SUM);
            $("#" + cuname + "_input_SAMPLES").html(elem.input.SAMPLES);
            if (elem.input.TRIGGER) {
              $("#" + cuname + "_input_TRIGGER").html("Triggered");
            } else {
              $("#" + cuname + "_input_TRIGGER").html("No Trigger");
            }
            if (tmpObj.hasOwnProperty("graph_table_BPM")) {
              var chart = tmpObj['graph_table_BPM'][cuname];
              if (chart.hasOwnProperty("series") && (chart.series instanceof Array)) {
                var shift = false;
                if (tmpObj['graph_table_BPM'][cuname].options.npoints > tmpObj['graph_table_BPM'][cuname].options.maxpoints) {
                  shift = true;
                }
                tmpObj['graph_table_BPM'][cuname].options.npoints++;
                if ((elem.output.MODE & 0x1) && (elem.output.hasOwnProperty("SUM_ACQ"))) {
                  var arrv = [];
                  arrv[0] = convertBinaryToArrays(elem.output.VA_ACQ);
                  arrv[1] = convertBinaryToArrays(elem.output.VB_ACQ);
                  arrv[2] = convertBinaryToArrays(elem.output.VC_ACQ);
                  arrv[3] = convertBinaryToArrays(elem.output.VD_ACQ);
                  arrv[4] = convertBinaryToArrays(elem.output.SUM_ACQ);
                  for (var i = 0; i < 5; i++) {
                    if (arrv[i] instanceof Array) {
                      var setp = []
                      arrv[i].forEach(function (elem, n) {
                        setp.push([now + n, elem]);
    
                      });
                      chart.series[i].setData(setp, true, true, true);
                    }
                  }
                } else {
                  chart.series[0].addPoint([now, elem.output.VA], false, shift);
                  chart.series[1].addPoint([now, elem.output.VB], false, shift);
                  chart.series[2].addPoint([now, elem.output.VC], false, shift);
                  chart.series[3].addPoint([now, elem.output.VD], false, shift);
                  chart.series[3].addPoint([now, elem.output.SUM], false, shift);
                }
                chart.redraw();
    
              }
    
            }
          }
        });
    
    
    
      }
  }
  return chaos;
  }