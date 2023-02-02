var current_selection=""
var widget_options={}
var widget_state={}
var device_subscribed=[]
var pullInterval = null;
var cu_descs={}
function updateWidget(ds) {

  if (ds.dpck_ds_type == 0) {
    // output
    jqccs.updateSingleNode({output:ds},widget_state);
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
function getWidget(options) {
  console.log("powersupply widget");
  widget_options=options;


  var chaos = 
   {
     dsFn:{
      output:{
          polarity:function(pol){
              switch (pol) {
                case 1:
                  return '<i class="material-icons" style="color:red">add_circle</i>';
                case -1:
                  return '<i class="material-icons" style="color:blue">remove_circle</i>';
                case 0:
                  return '<i class="material-icons">radio_button_unchecked</i>';
                  break;
      
              }
              return "NA";
            },
            stby:function(val,ele,ds){
              if(ds.hasOwnProperty("off")&&ds.off){
                return '<i title="OFF" class="material-icons" style="color:red">trending_down</i>';

              } else {
                if(val==false){
                  return '<i title="Operational" class="material-icons" style="color:green">trending_up</i>';
                } else {
                  return '<i title="Standby" class="material-icons" style="color:red">pause_circle_outline</i>';
                }
            }
            },
            local:function(val){
            if (val == true) {
              return '<i title="Locale" class="material-icons" style="color:red">vpn_key</i>';
            } else {
              return '';
            }


      }
    }
    },
    tableClickFn: function (tmpObj, e) {
      //  rebuildCam(tmpObj);
      var cindex = tmpObj.node_name_to_index[tmpObj.node_selected];
      if(widget_state.hasOwnProperty(tmpObj.node_selected)){
        if(widget_state[tmpObj.node_selected].hasOwnProperty('polarity')){
          $(".pola").removeClass("disabled");
        } else {
          $(".pola").addClass("disabled");

        }
      } else {
        jchaos.getChannel(tmpObj.node_selected,0,(dat)=>{
          widget_state[tmpObj.node_selected]=dat[0];
          if(widget_state[tmpObj.node_selected].hasOwnProperty('polarity')){
            $(".pola").removeClass("disabled");
          } else {
            $(".pola").addClass("disabled");
  
          }
        });
      }
    
      

    },
    tableFn:function(tmpObj) {
        var cu=[];
        if(tmpObj['elems'] instanceof Array){
             cu = tmpObj.elems;
        }
        var template = tmpObj.type;
        var html = '<div class="row">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content table-responsive">';
        html += '<table class="table table-sm table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Element</th>';
        html += '<th>Status</th>';
        html += '<th>Readout [A]</th>';
        html += '<th>Setting [A]</th>';
        html += '<th colspan="3">Saved</th>';
        html += '<th>State</th>';
        html += '<th>Polarity</th>';
        html += '<th>Bypass</th>';
        html += '<th colspan="4">Flags</th>';


        html += '</tr>';
        html += '</thead>';
    
        $(cu).each(function (i) {
          var cuname = jchaos.encodeName(cu[i]);
          html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
          html += "<td class='td_element td_name'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td digits=4 title='Readout current' class='td_element td_readout' id='" + cuname + "_output_current'>NA</td>";
          html += "<td digits=4 class='td_element td_current' title='Setpoint current' id='" + cuname + "_input_current'>NA</td>";
          html += "<td digits=4 class='td_element' title='Restore setpoint current'  id='" + cuname + "_input_saved_current'></td>";
          html += "<td class='td_element' title='Restore Stanby/Operational' id='" + cuname + "_input_saved_stby'></td>";
          html += "<td class='td_element' title='Restore setpoint polarity' id='" + cuname + "_input_saved_polarity'></td>";
          html += "<td class='td_element' id='" + cuname + "_output_stby'></td>";
          html += "<td class='td_element' id='" + cuname + "_output_polarity'><i class=\"material-icons\">close</i></td>";
          html += "<td class='td_element' title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
          html += "<td class='td_element' title='Local controlled' id='" + cuname + "_output_local'></td>";
          html += "<td class='td_element' id='" + cuname + "_system_busy'></td>";
          html += "<td class='td_element' title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td>";
          html += "<td class='td_element' title='Device alarms' id='" + cuname + "_system_device_alarm'></td></tr>";
        });
        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        return html;
    },
    cmdFn:function(tmpObj) {
      
        var html = '<div class="row">';
        html += '<div class="box col-md-12 box-cmd">';
        html += '<div class="box-header green">';
        html += '<h3 id="h3-cmd">Commands</h3>';
        html += '</div>';
        html += '<div class="box-content">';
        html += '<div class="row">';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSbuttON" cutemplate="'+tmpObj.template+'" cucmdid="mode" title="Powersupply Operational" cucmdvalue=1>';
        html += '<i class="material-icons" style="color:green">trending_down</i>';
        html += '<p class="name-cmd">On</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSbuttOFF" cutemplate="'+tmpObj.template+'" cucmdid="mode" title="Powersupply STBY" cucmdvalue=0>';
        html += '<i class="material-icons" style="color:red">pause_circle_outline</i>';
        html += '<p class="name-cmd">Standby</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSreset_alarm" title="Reset Powersupply Alarms" cutemplate="'+tmpObj.template+'" cucmdid="rset">';
        html += '<i class="material-icons" style="color:red">error</i>';
        html += '<p class="name-cmd">Reset</p>';
        html += '</a>';
        html += '<div class="col-md-3 box-cmd col-md-offset-1" id="input-value-mag">';
        html += '<input class="input" type="number" id="'+tmpObj.template+'-sett_sett_cur" name="setCurrent" title="current setpoint in Ampere" type="text" value="">';
        html += '</div>';
    
        html += '<a class="quick-button-small col-md-1 btn-value cucmd" cutemplate="'+tmpObj.template+'" cucmdid="sett" id="PSapply_current" >';
        html += '<p>Apply</p>';
        html += '</a>';
        html += '</div>';
        html += '<div class="row">';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd pola" cucmdid="pola" title="Powersupply Polarity POS" cucmdvalue=1 >';
        html += '<i class="material-icons" style="color:red">add_circle</i>';
        html += '<p class="name-cmd">Pos</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd pola" cucmdid="pola"  title="Powersupply Polarity OPEN" cucmdvalue=0 >';
        html += '<i class="material-icons">radio_button_unchecked</i>';
        html += '<p class="name-cmd">Open</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd pola" cucmdid="pola"  title="Powersupply Polarity NEGATIVE" cucmdvalue=-1 >';
        html += '<i class="material-icons" style="color:blue">remove_circle</i>';
        html += '<p class="name-cmd">Neg</p>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    
      return html;
  },
  updateInterfaceFn: function (tmpObj) {
    console.log("UpdateInterfaceFn "+tmpObj.elems);
    if(widget_options.hasOwnProperty('push')&&widget_options.push&&jchaos.socket.connected){
      device_subscribed=tmpObj.elems;
      jchaos.iosubscribeCU(tmpObj.elems, true);
      jchaos.options['io_onconnect'] = (s) => {
        console.log("resubscribe ..")
        jchaos.iosubscribeCU(device_subscribed, true);
      }
      jchaos.options['io_onmessage'] = updateWidget;
    } else {
      jchaos.iosubscribeCU(tmpObj.elems, false);

    }
    jqccs.updateInterfaceCU(tmpObj);
    

  },
  updateFn: function (tmpObj) {
    widget_state=tmpObj;
    widget_state['state']={};
    
    if(!(widget_options.hasOwnProperty('push')&&widget_options.push&&jchaos.socket.connected)){
      if(device_subscribed.length){
        jchaos.iosubscribeCU(device_subscribed, false);
        device_subscribed=[];
      }
      var opt={
        channel:-1,
        devs:tmpObj.elems
      }
      if(!tmpObj.hasOwnProperty('interval')){
        console.log("RESCHEDULE TASK")

      
        pullInterval=jqccs.rescheduleTask(widget_options.generalRefresh,opt,(dat,req,op)=>{
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