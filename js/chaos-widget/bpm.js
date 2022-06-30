var selectedElems = [];
var selectedElemsold=[];
var stateObj = {};
var current_selection=""
var widget_options={}
var widget_state={}
var device_subscribed=[]
var pullInterval = {};

var pullIntervalHealth={}

function updateWidget(ds){

  var name =ds.ndk_uid;
  var cuname = jchaos.encodeName(name);

  if (ds.dpck_ds_type == 0) {
    var now=ds.dpck_ats;
    // output
    jqccs.updateSingleNode({output:ds},widget_state);
    if (stateObj.hasOwnProperty("graph_table_BPM")&&stateObj['graph_table_BPM'].hasOwnProperty(cuname)) {
      var chart = stateObj['graph_table_BPM'][cuname];
      if (chart.hasOwnProperty("series") && (chart.series instanceof Array)) {
        var shift = false;
        if (stateObj['graph_table_BPM'][cuname].options.npoints > stateObj['graph_table_BPM'][cuname].options.maxpoints) {
          shift = true;
        }
        stateObj['graph_table_BPM'][cuname].options.npoints++;
        if ((ds.MODE & 0x1) && (ds.hasOwnProperty("SUM_ACQ"))) {
          var arrv = [];
         
          arrv[0] = jqccs.convertBinaryToArrays(ds.VA_ACQ,"84");
          arrv[1] = jqccs.convertBinaryToArrays(ds.VB_ACQ,"84");
          arrv[2] = jqccs.convertBinaryToArrays(ds.VC_ACQ,"84");
          arrv[3] = jqccs.convertBinaryToArrays(ds.VD_ACQ,"84");
          arrv[4] = jqccs.convertBinaryToArrays(ds.SUM_ACQ,"84");
          for (var i = 0; i < 5; i++) {
            if (arrv[i] instanceof Array) {
              var setp = []
              arrv[i].forEach(function (elem, n) {
                setp.push([now + n, elem]);

              });
              chart.series[i].setData(setp, false, false, false);
            }
          }
        } else {
          chart.series[0].addPoint([now, ds.VA], false, shift);
          chart.series[1].addPoint([now, ds.VB], false, shift);
          chart.series[2].addPoint([now, ds.VC], false, shift);
          chart.series[3].addPoint([now, ds.VD], false, shift);
          chart.series[4].addPoint([now, ds.SUM], false, shift);
        }
        chart.redraw();

      }

    }
   // widget_state['data'][ds.ndk_uid]=ds;
  } else if (ds.dpck_ds_type == 1) {

    jqccs.updateSingleNode({input:ds},widget_state);

  } else if (ds.dpck_ds_type == 4) {

   jqccs.updateSingleNode({health:ds},widget_state);
   jqccs.updateGenericControl(null, {health:ds});

   
  if(ds.cuh_alarm_lvl){
   
    jqccs.decodeAlarms();
  
  }
  } else if (ds.dpck_ds_type == 7) {
    console.log(ds.ndk_uid+ " LOG PACK:"+JSON.stringify(ds));

  } else {
    var obj={};
    console.log(ds.ndk_uid+ " OTHER:"+JSON.stringify(ds));


    obj[jchaos.channelToString(ds.dpck_ds_type)]=ds;
    jqccs.updateSingleNode(obj);
    jqccs.updateGenericControl(null, obj);


  }  
  
}
function updatelist(checkboxElem) {
  var ename = checkboxElem.name;
  if (checkboxElem.checked) {
    selectedElems.push(ename);
  } else {
    selectedElems = selectedElems.filter((e) => { return (e != ename) })
  }
  console.log("list:" + JSON.stringify(selectedElems));
  stateObj.node_multi_selected = selectedElems;
  stateObj['elems']=selectedElems;
  let min=Math.min(selectedElems.length,3);


  if (selectedElems.length) {

    if (widget_options.push && (jchaos.socket != null) && (jchaos.socket.connected)) {
      if (selectedElemsold.length) {
        var tounsub=[]
        selectedElemsold.forEach(ele=>{

           let sel = selectedElems.filter((e) => { return (e != ele) })
           if (sel.length == 0) {
             // not present in new list
             tounsub.push(ele);
           }

        });
        if(tounsub.length){
          console.log("Unsubscribe " + JSON.stringify(tounsub));
          jchaos.iosubscribeCU(tounsub, false);
        }
      }
      jchaos.iosubscribeCU(selectedElems);
      selectedElemsold =selectedElems;
      jchaos.options['io_onconnect'] = (s) => {
        console.log("resubscribe ..")
        jchaos.iosubscribeCU(selectedElems, false);

        selectedElemsold =selectedElems;
      }

      jchaos.options['io_onmessage'] = updateWidget;

    } else {
      
      
     // pullInterval=outputCameraRefresh(opt.camera.cameraRefresh,opt);
    
    pullInterval['channel']=-1;
    pullInterval['devs']=selectedElems;

     jqccs.rescheduleTask(widget_options.generalRefresh,pullInterval,(vds,req,op)=>{
      vds.forEach(ele => {
        updateWidget(ele.output);
        updateWidget(ele.input);

      });
      
      if((widget_options.push && (jchaos.socket != null) && (jchaos.socket.connected))){
        clearInterval(op['interval']);

      }
    });
    
    }
  }



  var chart_options = {
      chart_per_row: min,
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
    jqccs.makeDynamicGraphTable(stateObj, "graph_table_BPM", chart_options, selectedElems);
    stateObj['old_elems'] = stateObj['elems'];

}
function getWidget(conf) {
  console.log("BPM widget");
  widget_options=conf;
  if((jchaos.socket != null) && (jchaos.socket.connected)){
    jchaos.unsubscribeall();
  }
    var chaos = 
     {
       dsFn:{
        input:{
          TRIGGER:function(t){
            if(t){
              return "Triggered";
            }
            return "Not Triggered"
            
          }
  
        }
      
      }, tableClickFn: function (tmpObj, e) {
        console.log("Table click");
      
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
        html += '<table class="table table-sm table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Sel</th>';
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
          html += '<td><div><input type="checkbox" onchange="updatelist(this)" name="' + cu[i] + '" id="s-' + cuname + '"></td>';

          html += "<td class='td_element td_name'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td id='" + cuname + "_system_busy'></td>";
          html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
          html += "<td title='Calculated X position' digits='3' id='" + cuname + "_output_X'></td>";
          html += "<td title='Calculated Y position' digits='3' id='" + cuname + "_output_Y'></td>";
          html += "<td title='VA' id='" + cuname + "_output_VA'></td>";
          html += "<td title='VB' id='" + cuname + "_output_VB'></td>";
          html += "<td title='VC' id='" + cuname + "_output_VC'></td>";
          html += "<td title='VD' id='" + cuname + "_output_VD'></td>";
          html += "<td title='SUM' id='" + cuname + "_output_SUM'></td>";
          html += "<td title='Samples' id='" + cuname + "_output_SAMPLES'></td>";
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
        html += '<div class="row">';
        //html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="bpm_acquire_sa" cucmdid="acquire" cucmdvalue={\"enable\":1,\"mode\":2,\"loops\":-1,\"samples\":1}>';
        //html += '<i class="material-icons verde">trending_down</i>';
       // html += '<p class="name-cmd">SlowAcquisition</p>';
       // html += '</a>';
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
        html += '<div class="row statbox">';
        html += '<textarea class="form-control" rows="5" id="BPM_STATUS"></textarea>';
    
        //html += '<p id="BPM_STATUS"/>';    
        html += '</div>';
    
        html += '</div>';
    
        html += '</div>';
        html += '</div>';
    
        html += '</div>';
    
        return html;
      }, 
      updateInterfaceFn: function (tmpObj) {
        console.log("UpdateInterfaceFn "+tmpObj.elems);
        if(widget_options.hasOwnProperty('push')&&widget_options.push&&jchaos.socket.connected){
         /* device_subscribed=tmpObj.elems;
          jchaos.iosubscribeCU(tmpObj.elems, true);
          jchaos.options['io_onconnect'] = (s) => {
            console.log("resubscribe ..")
            jchaos.iosubscribeCU(device_subscribed, true);
          }
          jchaos.options['io_onmessage'] = updateWidget;*/
        } else {
          jchaos.iosubscribeCU(tmpObj.elems, false);
    
        }
        jqccs.updateInterfaceCU(tmpObj);
        
    
      },
      updateFn: function (tmpObj) {
        widget_state=tmpObj;
        widget_state['state']={};
        if (pullIntervalHealth.hasOwnProperty('interval')) {
          clearInterval(pullIntervalHealth.interval);
        }
      
        pullIntervalHealth['channel']=255;
        pullIntervalHealth['devs']=tmpObj.elems;
        
        jqccs.rescheduleTask(5000,pullIntervalHealth,(vds,req,op)=>{
          vds.forEach(ele => {
            updateWidget(ele.health);
            jqccs.updateGenericControl(null, ele);
    
          });
          
          jqccs.stateOutput(op['currRefresh']);
          
        });
        if(!(widget_options.hasOwnProperty('push')&&widget_options.push&&jchaos.socket.connected)){
          if(device_subscribed.length){
            jchaos.iosubscribeCU(device_subscribed, false);
            device_subscribed=[];
          }
          pullInterval['channel']=-1;
          pullInterval['devs']=tmpObj.elems;
          if(pullInterval['interval']){
            clearInterval(pullInterval['interval']);
            delete pullInterval['interval']
          }
          if(!tmpObj.hasOwnProperty('interval')){
            console.log("RESCHEDULE TASK")
    
          
            jqccs.rescheduleTask(widget_options.generalRefresh,pullInterval,(dat,req,op)=>{
              tmpObj.data=dat;
              jqccs.updateGenericTableDataset(tmpObj);
              jqccs.stateOutput(op['currRefresh']);
            });
            tmpObj['interval']=pullInterval;
         } 
         } else {
          jchaos.getChannel(tmpObj.elems,-1,(ele)=>{
            ele.forEach(i=>{
              jqccs.updateSingleNode(i)
            });
          });
         }
      }
     
  }
  return chaos;
  }