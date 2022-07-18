var current_selection=""
var widget_options={}
var widget_state={}
var device_subscribed=[]
var pullInterval = null;

function updateWidget(ds) {

  if (ds.dpck_ds_type == 0) {
    // output
    jqccs.updateSingleNode({output:ds},widget_state);

  } else if (ds.dpck_ds_type == 1) {

    jqccs.updateSingleNode({input:ds},widget_state);

  } else if (ds.dpck_ds_type == 4) {

   jqccs.updateSingleNode({health:ds},widget_state);
   jqccs.updateGenericControl(null, {health:ds});

 
   if(ds.cuh_alarm_lvl){
   
    jqccs.decodeAlarms();
  
  }
  } else if (ds.dpck_ds_type == 7) {
  //  console.log(ds.ndk_uid+ " LOG PACK:"+JSON.stringify(ds));

  } else {
    var obj={};
    

    obj[jchaos.channelToString(ds.dpck_ds_type)]=ds;
    jqccs.updateSingleNode(obj);
    jqccs.updateGenericControl(null, obj);


  }

}
function getWidget(options) {
  console.log("motor widget "+JSON.stringify(options));
  widget_options=options;
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
      tableMenuItem:{
       
        'poi':{
          "name": "POI",icon: "fa-edit",
          "items": {
              'add-poi': {
                  name: "Edit Poi", icon:"fa-add",
                  callback: function(itemKey, opt, e) {
                    jchaos.loadSetPoint(current_selection, "poiConfig", attr=>{
                      var poilist=[];

                      var poi={};
                      var poi_editor={
                        "type": "array",
                        "format": "table",
                        "title": "POI",
                        "description":"Alias to positions",
                        "uniqueItems": true,
                        "items": {
                          "type": "object",
                          "title": "POI",
                          "properties": {
                            "name": {
                                "type": "string"
                              },
                            "value": {
                              "type": "number"
                            }
                          }
                        }
                      }
                      
                      if(attr && attr.hasOwnProperty("cudk_default_value")){
                        try{
                          poi=JSON.parse(attr["cudk_default_value"]);
                          if(poi.hasOwnProperty("poi")){
                            for(var k in poi['poi']){
                              poilist.push({"name":k,"value":poi['poi'][k]});
                            }
                          }
                      } catch(e){

                      }
                    }
                      jqccs.jsonEditWindow("POI Editor", poi_editor, poilist, function(data, obj) {
                        var poi={
                          "poi":{}
                        }
                        for(var k in data){
                          poi['poi'][data[k].name]=data[k].value;

                        }
                        
                        var str=JSON.stringify(poi);
                        jchaos.saveSetPoint(current_selection, "poiConfig", str,()=>{
                          jchaos.setAttribute(current_selection, "poiConfig", str, function () {
                            jqccs.instantMessage(current_selection, "Modified POIs ", 4000, true);
                            triggerRefreshEdit();
                          },function (bad) {
                            jqccs.instantMessage(current_selection, "Error updating poi err:" + JSON.stringify(bad), 4000, false);

                          })


														}, function (bad) {
															jqccs.instantMessage(current_selection, "Error Removing poi from configuration "+n+" err:" + JSON.stringify(bad), 4000, false);

														});
                      });
                    })

                  }
                
              },
              'remove-poi': {
                name: "Remove Poi", icon:"fa-sub",
                callback: function(itemKey, opt, e) {
                  jchaos.loadSetPoint(current_selection, "poiConfig", attr=>{
                    var poilist=[];
                    var poi={};
                    if(attr && attr.hasOwnProperty("cudk_default_value")){
                      try{
                        poi=JSON.parse(attr["cudk_default_value"]);
                        if(poi.hasOwnProperty("poi")){
                          for(var k in poi['poi']){
                            poilist.push(k);
                          }
                        }
                      } catch(e){

                      }
                    
                      if(poilist.length){
                      jqccs.getEntryWindow("Remove", "name", poilist, "Remove", function (n) {
                        delete poi['poi'][n];
                        if(poilist.length==1){
                          // no more poi
                          attr["cudk_default_value"]="";

                        } else {
                          attr["cudk_default_value"]=JSON.stringify(poi);

                        }

                        jchaos.saveSetPoint(current_selection, "poiConfig", attr,()=>{
                          jchaos.setAttribute(current_selection, "poiConfig", attr["cudk_default_value"], function () {
                            jqccs.instantMessage(current_selection, "Removed POI " +n, 4000, true);
                            triggerRefreshEdit();
                          },function (bad) {
                            jqccs.instantMessage(current_selection, "Error updating poi "+n+" err:" + JSON.stringify(bad), 4000, false);

                          })


														}, function (bad) {
															jqccs.instantMessage(current_selection, "Error Removing poi from configuration "+n+" err:" + JSON.stringify(bad), 4000, false);

														});
									},"Cancel");
                }}
                });
              
            }
            }
            }
          }

      },
      tableClickFn: function (tmpObj, e) {
        //  rebuildCam(tmpObj);
        current_selection=tmpObj.node_selected;
        var cindex = tmpObj.node_name_to_index[tmpObj.node_selected];
        if(!tmpObj.hasOwnProperty("data")){
          tmpObj['data']={};
        } else {
          if(tmpObj.data instanceof Array)
            jqccs.updateGenericControl(tmpObj, tmpObj.data[cindex]);
  
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
          html += "<td digits=2 class='position_element' id='" + cuname + "_output_position'></td>";
          html += "<td digits=2 class='position_element' id='" + cuname + "_output_POI'></td>";
    
          html += "<td digits=2 class='position_element' id='" + cuname + "_input_position'></td>";
          html += "<td digits=2 class='position_element'><select id='" + cuname + "_select_input_poi' name='"+cu[i]+"'></select></td>";
    
          html += "<td id='" + cuname + "_input_hwminpos'></td>";
          html += "<td id='" + cuname + "_input_hwmaxpos'></td>";
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
    html += '<p class="lead">     Absolute</p><input class="input focused" id="'+tmpObj.template+'-mov_abs_offset_mm" type="number" value="1" >';
    html += '</div>';
    html += '<div class="col-md-2">';
    html += '<p class="lead">     POI</p><select class="input" id="'+tmpObj.template+'-mov_abs_poi"></select>';
    html += '</div>';
    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setPosition" cutemplate="'+tmpObj.template+'" cucmdid="mov_abs" cucmdattr={\"sched\":200000,\"prio\":100}>';
    html += '<p>Set Absolute</p>';
    html += '</a>';
    html += '<div class="col-md-2"></div>';

    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setPoweron" cutemplate="'+tmpObj.template+'"  cucmdid="poweron" cucmdvalue={\"on\":1}>';
    html += '<i class="material-icons green">trending_down</i>';
    html += '<p class="name-cmd">ON</p>';
    html += '</a>';
    html += '<a class="quick-button-small col-md-1 btn-value cucmd" id="scraper_setStop" cutemplate="'+tmpObj.template+'"  cucmdid="stopMotion" cucmdattr={\"submode\":1,\"prio\":100}>';
    html += '<i class="material-icons rosso">cancel</i>';
    html += '<p class="name-cmd">STOP</p>';
    html += '</a>';

    html += '</div>';
    html += '<div class="row justify-content-center">';
    html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="scraper_in" cucmdid="mov_rel" cutemplate="'+tmpObj.template+'"  cucmdvalueMult=-1 cucmdattr={\"sched\":200000,\"prio\":100}>';
    html += '<i class="icon-angle-left"></i>';
    html += '<p class="name-cmd"><</p>';
    html += '</a>';
    // in case of cucmdvalue = null, a item named 'cucmd'_<commandparam>
    html += '<div class="col-md-3" id="input-value-due">';
    html += '<p class="lead">     Relative</p><input class="input focused" id="'+tmpObj.template+'-mov_rel_offset_mm" value=1>';
    html += '</div>';
    html += '<div class="col-md-1"></div>';

    html += '<a class="quick-button-small col-md-1 btn-cmd cucmd" id="scraper_out" cutemplate="'+tmpObj.template+'" cucmdid="mov_rel" cucmdattr={\"sched\":200000,\"prio\":100}>';
    html += '<i class="icon-angle-right"></i>';
    html += '<p class="name-cmd">></p>';
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
      jchaos.getChannel(tmpObj.elems,1,function(inputs){
        
        inputs.forEach(function(custom){
          var name=jchaos.encodeName(custom.ndk_uid) + "_select_input_poi";
          if(!custom.hasOwnProperty("hwminpos")){
            var name=jchaos.encodeName(custom.ndk_uid) + "_input_hwminpos";

            $("#"+name).html("NA");
          }
          if(!custom.hasOwnProperty("hwmaxpos")){
            var name=jchaos.encodeName(custom.ndk_uid) + "_input_hwmaxpos";

            $("#"+name).html("NA");
          }
        if(custom.hasOwnProperty('poiConfig')){
          var poiconfig={}

          if(typeof custom.poiConfig==="string"){
            try{
              poiconfig=JSON.parse(custom.poiConfig);
            }catch(e){

            }
          } else if(typeof custom.poiConfig==="object"){
            poiconfig=custom.poiConfig;
          }
          var name=jchaos.encodeName(custom.ndk_uid) + "_select_input_poi";
          $("#"+name).addClass("invisible");

          if(poiconfig.hasOwnProperty("poi")&&(Object.keys(poiconfig.poi).length)){
            $("#"+name).removeClass("invisible");
            $("#"+name).find("option").remove();

            $("#"+name).append("<option value='' title='Select Poi'>Select Poi..</option>");

            for(var i in poiconfig.poi){
              $("#"+name).append("<option value='"+poiconfig.poi[i]+"' title='"+poiconfig.poi[i]+"'>"+i+"</option>");

            }
        }
          $("#"+name).on("change", function (s) {

            var cuname = $(this).attr('name');
            var poiv = $(this).find("option:selected").text();
            if(poiv==""){
              return;
            }
            var param={
              poi:poiv
            }

            jchaos.sendCUCmd(cuname,"mov_abs",param, function (d) {
              s.currentTarget.value="";
               jqccs.instantMessage(cuname, "Move to:"+poiv , 400, true)
            }, function (d) {
              jqccs.instantMessage(cuname, "ERROR OCCURRED:" + d, 2000, 350, 400, false);
              s.currentTarget.value="";

            });
          })
          
        
      }});
      });
    };
      
    
    
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