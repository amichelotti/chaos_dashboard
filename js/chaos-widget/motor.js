function getWidget() {
  console.log("motor widget");
    var chaos = 
     {
       dsFn:{
        output:{
          LastHomingTime:function(val,w){
            if(val){
               var ago = new Date(val).toString();
               // w.attr('title',"Performed "+ago);
                return '<i title="Performed '+ago+'" class="material-icons verde">home</i>';
            }
            return '';
          },
          KindOfHomingDone:function(val,w){
            if(val==1){
               // w.attr('title',"Performed "+ago);
                return '<i title="1- Homing Hardware" class="material-icons verde">sim_card</i>';
            } else if(val==2){
              return '<i title="2- Homing Software" class="material-icons verde">calculate</i>';

            }
            return '';
          },
            home:function(val){
                if(val){
                    return '<i class="material-icons verde">home</i>';
                }
                return '';
              },
              powerOn:function(val){
                if (val) {
                  return '<i title="on" class="material-icons verde">trending_down</i>';
        
                } else {
                  return '<i title="off" class="material-icons rosso">pause_circle_outline</i>';
        
                }
              },
                PositiveLimitSwitchActive:function(val) {
                  if(val==true){
                    return '<i class="material-icons rosso">keyboard_arrow_right</i>';
                  } else {
                    return '';
                  }
              },
      
              NegativeLimitSwitchActive:function(val){
              if (val == true) {
                return '<i class="material-icons rosso">keyboard_arrow_left</i>';
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
        html += '<div class="box-content table-responsive">';
        html += '<table class="table table-sm table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Element</th>';
        html += '<th colspan="2">Status</th>';
        html += '<th colspan="2">Position</th>';
        html += '<th colspan="2">Setting</th>';
        html += '<th colspan="1">Min</th>';
        html += '<th colspan="1">Max</th>';
        html += '<th colspan="3">Flags(On,Plim,Nlim)</th>';
        html += '<th colspan="2">Home</th>';
        html += '<th colspan="2">Alarms dev/cu</th>';
        html += '</tr>';
        html += '</thead>';
    
    
        $(cu).each(function (i) {
          var cuname = jchaos.encodeName(cu[i]);
          html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
          html += "<td class='td_element td_name'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td id='" + cuname + "_system_busy'></td>";
         // html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
          html += "<td digits=2 class='position_element' id='" + cuname + "_output_position'></td>";
          html += "<td digits=2 class='position_element' id='" + cuname + "_output_POI'></td>";
    
          html += "<td digits=2 class='position_element' id='" + cuname + "_input_position'></td>";
          html += "<td digits=2 class='position_element'><select id='" + cuname + "_select_input_poi' name='"+cu[i]+"'></select></td>";
    
          html += "<td id='" + cuname + "_custom_min_position'></td>";
          html += "<td id='" + cuname + "_custom_max_position'></td>";
          html += "<td id='" + cuname + "_output_powerOn'></td>";
          html += "<td id='" + cuname + "_output_PositiveLimitSwitchActive'></td>";
          html += "<td id='" + cuname + "_output_NegativeLimitSwitchActive'></td>";
          html += "<td id='" + cuname + "_output_LastHomingTime'></td>";
          html += "<td id='" + cuname + "_output_KindOfHomingDone'></td>";

          html += "<td title='Device alarms' id='" + cuname + "_system_device_alarm'></td>";
          html += "<td title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td></tr>";
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
    html += '<div class="row justify-content-center">';
    html += '<a href="#mdl-homing" role="button" class="quick-button-small col-md-1 btn-cmd cucmd" cutemplate="'+tmpObj.template+'" cucmdid="homing" cucmdvalue=1>';
    html += '<i class="material-icons">home</i>';
    html += '<p class="name-cmd">Homing</p>';
    html += '</a>';
    html += '<div class="col-md-2">';
    html += '<p class="lead">     Absolute</p><input class="input focused" id="'+tmpObj.template+'-mov_abs_offset_mm" type="number" value="1">';
    html += '</div>';
    html += '<div class="col-md-2">';
    html += '<p class="lead">     POI</p><select class="input" id="'+tmpObj.template+'-mov_abs_poi"></select>';
    html += '</div>';
    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setPosition" cutemplate="'+tmpObj.template+'" cucmdid="mov_abs">';
    html += '<p>Set Absolute</p>';
    html += '</a>';
    html += '<div class="col-md-2"></div>';

    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setPoweron" cutemplate="'+tmpObj.template+'"  cucmdid="poweron" cucmdvalue={\"on\":1}>';
    html += '<i class="material-icons green">trending_down</i>';
    html += '<p class="name-cmd">ON</p>';
    html += '</a>';
    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setStop" cutemplate="'+tmpObj.template+'"  cucmdid="stopMotion">';
    html += '<i class="material-icons rosso">cancel</i>';
    html += '<p class="name-cmd">STOP</p>';
    html += '</a>';

    html += '</div>';
    html += '<div class="row justify-content-center">';
    html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="scraper_in" cucmdid="mov_rel" cutemplate="'+tmpObj.template+'"  cucmdvalueMult=-1>';
    html += '<i class="icon-angle-left"></i>';
    html += '<p class="name-cmd">In</p>';
    html += '</a>';
    // in case of cucmdvalue = null, a item named 'cucmd'_<commandparam>
    html += '<div class="col-md-3" id="input-value-due">';
    html += '<p class="lead">     Relative</p><input class="input focused" id="'+tmpObj.template+'-mov_rel_offset_mm" value=1>';
    html += '</div>';
    html += '<div class="col-md-1"></div>';

    html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="scraper_out" cutemplate="'+tmpObj.template+'" cucmdid="mov_rel">';
    html += '<i class="icon-angle-right"></i>';
    html += '<p class="name-cmd">Out</p>';
    html += '</a>';
    html += '<div class="col-md-2"></div>';

    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setPoweroff" cutemplate="'+tmpObj.template+'" cucmdid="poweron" cucmdvalue={\"on\":0}>';
    html += '<i class="material-icons red">pause</i>';
    html += '<p class="name-cmd">OFF</p>';
    html += '</a>';
    html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="scraper_reset" cutemplate="'+tmpObj.template+'" cucmdid="rset" cucmdvalue=1>';
    html += '<i class="material-icons rosso">error</i>';
    html += '<p class="name-cmd">Reset</p>';
    html += '</a>';


    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    if(tmpObj.hasOwnProperty('elems')){
      jchaos.getChannel(tmpObj.elems,2,function(customs){
        customs.forEach(function(custom){
          var name=jchaos.encodeName(custom.ndk_uid) + "_select_input_poi";
          $("#"+name).hide();
        if(custom.hasOwnProperty('cudk_load_param')&& custom.cudk_load_param.hasOwnProperty('poi')){
          var name=jchaos.encodeName(custom.ndk_uid) + "_select_input_poi";
          $("#"+name).show();
          $("#"+name).empty();
          for(var i in custom.cudk_load_param.poi){
            $("#"+name).append("<option value='"+custom.cudk_load_param.poi[i]+"'>"+i+"</option>");

          }
          $("#"+name).on("change", function (s) {

            var cuname = $(this).attr('name');
            var poiv = $(this).find("option:selected").text();
            var param={
              poi:poiv
            }

            jchaos.sendCUCmd(cuname,"mov_abs",param, function (d) {
              
              jqccs.instantMessage(cuname, "Move to:"+poiv , 1000, true)
            }, function (d) {
              jqccs.instantMessage(cuname, "ERROR OCCURRED:" + d, 2000, 350, 400, false);
      
            });
          })
          
        
      }});
      });
    };
      
    
    
    return html;
    }
  }
  return chaos;
  }