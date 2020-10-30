function getWidget() {
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
            stby:function(val){
              if(val==false){
                return '<i class="material-icons" style="color:green">trending_down</i>';
              } else {
                return '<i class="material-icons" style="color:red">pause_circle_outline</i>';
              }
            },
            local:function(val){
            if (val == true) {
              return '<i class="material-icons" style="color:red">vpn_key</i>';
            } else {
              return '';
            }


      }
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
        html += '<div class="box-content">';
        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Element</th>';
        html += '<th>Status</th>';
        html += '<th>Readout [A]</th>';
        html += '<th>Setting [A]</th>';
        html += '<th colspan="3">Saved</th>';
        html += '<th colspan="7">Flags</th>';
        html += '</tr>';
        html += '</thead>';
    
        $(cu).each(function (i) {
          var cuname = jchaos.encodeName(cu[i]);
          html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
          html += "<td class='td_element td_name'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td title='Readout current' class='td_element td_readout' id='" + cuname + "_output_current'>NA</td>";
          html += "<td class='td_element td_current' title='Setpoint current' id='" + cuname + "_input_current'>NA</td>";
          html += "<td class='td_element' title='Restore setpoint current'  id='" + cuname + "_input_saved_current'></td>";
          html += "<td class='td_element' title='Restore Stanby/Operational' id='" + cuname + "_input_saved_stby'></td>";
          html += "<td class='td_element' title='Restore setpoint polarity' id='" + cuname + "_input_saved_polarity'></td>";
          html += "<td class='td_element' id='" + cuname + "_output_stby'></td>";
          html += "<td class='td_element' id='" + cuname + "_output_polarity'></td>";
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
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSbuttON" cucmdid="mode" title="Powersupply Operational" cucmdvalue=1>';
        html += '<i class="material-icons" style="color:green">trending_down</i>';
        html += '<p class="name-cmd">On</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSbuttOFF" cucmdid="mode" title="Powersupply STBY" cucmdvalue=0>';
        html += '<i class="material-icons" style="color:red">pause_circle_outline</i>';
        html += '<p class="name-cmd">Standby</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="PSreset_alarm" title="Reset Powersupply Alarms" cucmdid="rset">';
        html += '<i class="material-icons" style="color:red">error</i>';
        html += '<p class="name-cmd">Reset</p>';
        html += '</a>';
        html += '<div class="col-md-3 box-cmd col-md-offset-1" id="input-value-mag">';
        html += '<input class="input" type="number" id="sett_sett_cur" name="setCurrent" title="current setpoint in Ampere" type="text" value="">';
        html += '</div>';
    
        html += '<a class="quick-button-small col-md-1 btn-value cucmd" cucmdid="sett" id="PSapply_current" >';
        html += '<p>Apply</p>';
        html += '</a>';
        html += '</div>';
        html += '<div class="row">';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" cucmdid="pola" title="Powersupply Polarity POS" cucmdvalue=1 >';
        html += '<i class="material-icons" style="color:red">add_circle</i>';
        html += '<p class="name-cmd">Pos</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" cucmdid="pola"  title="Powersupply Polarity OPEN" cucmdvalue=0 >';
        html += '<i class="material-icons">radio_button_unchecked</i>';
        html += '<p class="name-cmd">Open</p>';
        html += '</a>';
        html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" cucmdid="pola"  title="Powersupply Polarity NEGATIVE" cucmdvalue=-1 >';
        html += '<i class="material-icons" style="color:blue">remove_circle</i>';
        html += '<p class="name-cmd">Neg</p>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    
      return html;
  }
}
return chaos;
}