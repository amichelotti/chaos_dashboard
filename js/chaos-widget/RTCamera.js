
function getWidget() {
    var chaos = 
     {
       dsFn:{
        output:{
          
        }
      },
      tableClickFn:function (tmpObj,e) {
        if (tmpObj.node_multi_selected instanceof Array) {
          var cnt = 0;
          var tablename = "main_table-" + tmpObj.template;

          var html = '<table class="table table-bordered" id="' + tablename + '">';
          var camlist = tmpObj.node_multi_selected;
          if (camlist instanceof Array) {
            var html = "";
  
            camlist.forEach(function (key) {
              if (cnt < tmpObj.maxCameraCol) {
                var encoden = jchaos.encodeName(key);
                if ((cnt % tmpObj.cameraPerRow) == 0) {
                  if (cnt > 0) {
                    html += "</tr>"
                  }
                  html += '<tr class="row_element" id=camera-row"' + cnt + '">';
                }
                html += '<td class="td_element cameraMenu" id="camera-' + encoden + '" cuname="' + key + '" >'
                //   html += '<div><b>'+key+'</b>';
                html += '<div>';
                html += '<img id="cameraImage-' + encoden + '" cuname="' + key + '" src="" z-index=10000 />';
                html += '<div class="top-left">' + key + '</div>';
  
                html += '</div>';
  
                html += '</td>';
  
                cnt++;
              }
            });
  
            if (cnt > 0) {
              html += "</tr>";
  
            }
          }
          html += "</table>";
          $("#cameraTable").html(html);
          camlist.forEach(function (key) {
            var encoden = jchaos.encodeName(key);
  
            $("#cameraImage-" + encoden).on('click', function () {
              $("#cameraImage-" + encoden).cropper({
                aspectRatio: 16 / 9,
                crop: function (event) {
                  tmpObj['crop'] = {};
                  tmpObj['crop'][key] = event.detail;
  
              
                },
                ready() {
                  // Do something here
                  // ...
  
                  // And then
                  this.cropper.crop();
                }
              });
            })
          });
          $.contextMenu('destroy', '.cameraMenu');
  
          $.contextMenu({
            selector: '.cameraMenu',
            zIndex:10000,
            build: function ($trigger, e) {
              var name = $(e.currentTarget).attr("cuname");
              var cuitem = {};
              if (tmpObj.hasOwnProperty('crop')) {
                var crop_obj = tmpObj['crop'][name];
                if (typeof crop_obj === "object") {
                  crop_obj['cu'] = name;
                  cuitem['set-roi'] = { name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
                  cuitem['set-reference'] = { name: "Set Reference Centroid " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
  
                }
              
              }
              cuitem['exit-crop'] = { name: "Exit cropping", cu: name };
              cuitem['sep1'] = "---------";
              var ele=jchaos.getChannel(name,1,null);
              var el=ele[0];
              for(var k in el){
                  if(!(k.startsWith("dpck")||k.startsWith("ndk")||k.startsWith("cudk"))){
                    var val=el[k];
                    if(typeof el[k]==="object"){
                      val=JSON.stringify(el[k]);
                    }
                    cuitem['set-'+k] = { name: "Set "+k, type:"text",value:val,events:(function(k){
                      var events= {
                        keyup: function(e) {
                        // add some fancy key handling here?
                          if(e.keyCode==13){
                            jchaos.setAttribute(name,k,e.target.value,function(){
                              jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                            });
                          }   
                    } 
                  }
                return events;})(k)
              }
            }
          }  
            
              
  
              cuitem['sep2'] = "---------";
  
              cuitem['quit'] = {
                name: "Quit", icon: function () {
                  return 'context-menu-icon context-menu-icon-quit';
                }
  
              };
  
              return {
  
                callback: function (cmd, options) {
                  executeCameraMenuCmd(tmpObj, cmd, options);
                  return;
                },
                items: cuitem
              }
            }
  
          });
          $("#triggerType").off();
          $("#triggerType").on("change", function () {
            var node_selected = tmpObj.node_selected;
            var value = $("#triggerType option:selected").val();
            var attr = "TRIGGER_MODE";
            jchaos.setAttribute(node_selected, attr, value, function () {
              jqccs.instantMessage(node_selected + " Attribute ", "\"" + attr + "\"=\"" + value + "\" sent", 2000, null, null, true)
  
            }, function () {
              jqccs.instantMessage(node_selected + " Attribute Error", "\"" + attr + "\"=\"" + value + "\" sent", 3000, null, null, false)
  
            });
          });
  
        }
      },
     /* updateInterfaceFn:function (tmpObj) {
        var template = tmpObj.type
        var tablename = "camera_table-" + template;
    
    
    
        jqccs.updateInterfaceCU(tmpObj);
        $("#main_table-" + template + " tbody tr").off();
        $("#main_table-" + template + " tbody tr").click(function (e) {
          mainTableCommonHandling("main_table-" + template, tmpObj, e);
          if (tmpObj.node_multi_selected instanceof Array) {
            var cnt = 0;
    
            var html = '<table class="table table-bordered" id="' + tablename + '">';
            var camlist = tmpObj.node_multi_selected;
            if (camlist instanceof Array) {
              var html = "";
    
              camlist.forEach(function (key) {
                if (cnt < dashboard_settings.camera.maxCameraCol) {
                  var encoden = jchaos.encodeName(key);
                  if ((cnt % dashboard_settings.camera.cameraPerRow) == 0) {
                    if (cnt > 0) {
                      html += "</tr>"
                    }
                    html += '<tr class="row_element" id=camera-row"' + cnt + '">';
                  }
                  html += '<td class="td_element cameraMenu" id="camera-' + encoden + '" cuname="' + key + '" >'
                  //   html += '<div><b>'+key+'</b>';
                  html += '<div>';
                  html += '<img id="cameraImage-' + encoden + '" cuname="' + key + '" src="" z-index=10000 />';
                  html += '<div class="top-left">' + key + '</div>';
    
                  html += '</div>';
    
                  html += '</td>';
    
                  cnt++;
                }
              });
    
              if (cnt > 0) {
                html += "</tr>";
    
              }
            }
            html += "</table>";
            $("#cameraTable").html(html);
            camlist.forEach(function (key) {
              var encoden = jchaos.encodeName(key);
    
              $("#cameraImage-" + encoden).on('click', function () {
                $("#cameraImage-" + encoden).cropper({
                  aspectRatio: 16 / 9,
                  crop: function (event) {
                    tmpObj['crop'] = {};
                    tmpObj['crop'][key] = event.detail;
    
                
                  },
                  ready() {
                    // Do something here
                    // ...
    
                    // And then
                    this.cropper.crop();
                  }
                });
              })
            });
            $.contextMenu('destroy', '.cameraMenu');
    
            $.contextMenu({
              selector: '.cameraMenu',
              zIndex:10000,
              build: function ($trigger, e) {
                var name = $(e.currentTarget).attr("cuname");
                var cuitem = {};
                if (tmpObj.hasOwnProperty('crop')) {
                  var crop_obj = tmpObj['crop'][name];
                  if (typeof crop_obj === "object") {
                    crop_obj['cu'] = name;
                    cuitem['set-roi'] = { name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
                    cuitem['set-reference'] = { name: "Set Reference Centroid " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
    
                  }
                
                }
                cuitem['exit-crop'] = { name: "Exit cropping", cu: name };
                cuitem['sep1'] = "---------";
                var ele=jchaos.getChannel(name,1,null);
                var el=ele[0];
                for(var k in el){
                    if(!(k.startsWith("dpck")||k.startsWith("ndk")||k.startsWith("cudk"))){
                      var val=el[k];
                      if(typeof el[k]==="object"){
                        val=JSON.stringify(el[k]);
                      }
                      cuitem['set-'+k] = { name: "Set "+k, type:"text",value:val,events:(function(k){
                        var events= {
                          keyup: function(e) {
                          // add some fancy key handling here?
                            if(e.keyCode==13){
                              jchaos.setAttribute(name,k,e.target.value,function(){
                                jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                              });
                            }   
                      } 
                    }
                  return events;})(k)
                }
              }
            }  
              
                
    
                cuitem['sep2'] = "---------";
    
                cuitem['quit'] = {
                  name: "Quit", icon: function () {
                    return 'context-menu-icon context-menu-icon-quit';
                  }
    
                };
    
                return {
    
                  callback: function (cmd, options) {
                    executeCameraMenuCmd(tmpObj, cmd, options);
                    return;
                  },
                  items: cuitem
                }
              }
    
            });
            $("#triggerType").off();
            $("#triggerType").on("change", function () {
              var node_selected = tmpObj.node_selected;
              var value = $("#triggerType option:selected").val();
              var attr = "TRIGGER_MODE";
              jchaos.setAttribute(node_selected, attr, value, function () {
                jqccs.instantMessage(node_selected + " Attribute ", "\"" + attr + "\"=\"" + value + "\" sent", 2000, null, null, true)
    
              }, function () {
                jqccs.instantMessage(node_selected + " Attribute Error", "\"" + attr + "\"=\"" + value + "\" sent", 3000, null, null, false)
    
              });
            });
    
          }
        })
      },*/
      updateFn:function (tmpObj) {
        var cu = tmpObj.elems;
    
        if (tmpObj.node_multi_selected instanceof Array) {
    
          var cnt = 0;
          tmpObj.node_multi_selected.forEach(function (elem) {
            tmpObj.skip_fetch++;
            jchaos.getChannel(elem, -1, function (d) {
              if (tmpObj.skip_fetch > 0)
                tmpObj.skip_fetch--;
              var selected = d[0];
              //    var selected = tmpObj.data[tmpObj.index];
              if (selected != null && selected.hasOwnProperty("output")) {
                // $("#cameraName").html("<b>" + selected.output.ndk_uid + "</b>");
                if (selected.output.hasOwnProperty("FRAMEBUFFER")) {
                  var bin = selected.output.FRAMEBUFFER.$binary.base64;
                  var fmt = "png";
                  if (selected.hasOwnProperty("input")) {
                    if (selected.input.FMT != null) {
                      fmt = selected.input.FMT;
                    }
                   
                  }
                  //$('#triggerType').val(selected.output.TRIGGER_MODE)
    
                  // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
                  $("#cameraImage-" + jchaos.encodeName(elem)).attr("src", "data:image/" + fmt + ";base64," + bin);
                  
                  
                }
              }
              var cindex = tmpObj.node_name_to_index[elem];
    
              tmpObj.data[cindex] = d[0];
              if (++cnt == tmpObj.node_multi_selected.length) {
                
                jqccs.updateGenericTableDataset(tmpObj);
              }
    
    
            }, function (d) {
              if (tmpObj.skip_fetch > 0)
                tmpObj.skip_fetch--;
    
              tmpObj.updateErrors++;
              // $("#cameraName").html('<font color="red"><b>' + tmpObj.node_selected + '</b> (cannot fetch correctly)</font> skipping next:' + tmpObj.skip_fetch + ' updates');
            });
    
          });
        }
    
    
        jchaos.getChannel(tmpObj['elems'], 255, function (selected) {
          tmpObj.data = selected;
    
          jqccs.updateGenericTableDataset(tmpObj);
        },function(str){
          console.log(str);
        });
    
        
      },
      tableFn:function (tmpObj) {
        var cu = tmpObj.elems;
        var template = tmpObj.type;
    
        var html = '<div>';
    
    
        html += '<div id="cameraTable"></div>';
        html += '</div>';
    
        var cu = tmpObj.elems;
        var template = tmpObj.type;
        html+= '<div class="row-fluid" z-index=-1 id="table-space">';
        html += '<div class="box span12">';
        html += '<div class="box-content span12">';
        if (cu.length == 0) {
          html += '<p id="no-result-monitoring">No results match</p>';
    
        } else {
          html += '<p id="no-result-monitoring"></p>';
    
        }
    
        html += '<table class="table table-bordered" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th>Name CU</th>';
        html += '<th colspan="3">Status</th>';
        html += '<th colspan="2">Mode</th>';
        html += '<th colspan="2">Shutter</th>';
        html += '<th colspan="2">Gain</th>';
        html += '<th colspan="2">Brightness</th>';
        html += '<th colspan="2">Error</th>';
        html += '<th colspan="2">Rate Hz-KB/s</th>';
        html += '</tr>';
    
    
        html += '</thead> ';
        $(cu).each(function (i) {
          var cuname = jchaos.encodeName(cu[i]);
          html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
          html += "<td class='name_element'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td id='" + cuname + "_system_busy'></td>";
          html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
          
          html += "<td id='" + cuname + "_camera_mode'></td>";
          html += "<td id='" + cuname + "'><select class='select_camera_mode' id='" + cuname + "_select_camera_mode' name='"+cu[i]+"'><option value='0'>Continuous</option><option value='3'>Triggered</option><option value='2'>Pulse</option><option value='5'>No Acquire</option></select></td>";
          
          html += "<td class='span1' id='" + cuname + "_output_shutter'></td>";
          html += "<td class='span1' id='" + cuname + "'><input id='" + cuname + "_shutter' name='"+cu[i]+"'></input></td>";
          
          html += "<td id='" + cuname + "_output_gain'></td>";
          html += "<td id='" + cuname + "'><input maxlength='4' size='4' id='" + cuname + "_gain' name='"+cu[i]+"'></input></td>";
          
          html += "<td id='" + cuname + "_output_brightness'></td>";
          html += "<td id='" + cuname + "'><input id='" + cuname + "_brightness' name='"+cu[i]+"'></input></td>";
    
          html += "<td title='Device alarms' id='" + cuname + "_system_device_alarm'></td>";
          html += "<td title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td>";
          html += "<td id='" + cuname + "_health_prate'></td><td id='" + cuname + "_health_pband'></td></tr>";
    
    
        });
    
        html += '</table>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        return html;
      },
      cmdFn:function(tmpObj) {
        
        return "";
    }
  }
  return chaos;
  }
  function executeCameraMenuCmd(tmpObj, cmd, opt) {
    if(cmd == 'set-reference'){
      var crop_opt=opt.items[cmd].crop_opt;

      var width=crop_opt.width.toFixed();
      var height=crop_opt.height.toFixed();
      var x=crop_opt.x.toFixed();
      var y=crop_opt.y.toFixed();

      jchaos.setAttribute(crop_opt.cu, "REFOFFSETX", String(x), function () {
        jchaos.setAttribute(crop_opt.cu, "REFOFFSETY", String(y), function () {
          jchaos.setAttribute(crop_opt.cu, "REFSIZEX",String(width) , function () {
            jchaos.setAttribute(crop_opt.cu, "REFSIZEY",String(height), function () {
              jqccs.instantMessage("SET REFERENCE "+crop_opt.cu, "("+x+","+y+") "+width+"x"+height, 3000, true);

            });
          });
        });
      });
    } else if (cmd == 'set-roi') {
      var crop_opt=opt.items[cmd].crop_opt;

      console.log("CROP_OBJ:" + JSON.stringify(crop_opt));
      var x=crop_opt.x.toFixed();
      var y=crop_opt.y.toFixed();
      var width=crop_opt.width.toFixed();
      var height=crop_opt.height.toFixed();
      jchaos.setAttribute(crop_opt.cu, "OFFSETX", String(x), function () {
        jchaos.setAttribute(crop_opt.cu, "OFFSETY", String(y), function () {
          jchaos.setAttribute(crop_opt.cu, "WIDTH",String(width) , function () {
            jchaos.setAttribute(crop_opt.cu, "HEIGHT",String(height), function () {
              jqccs.instantMessage("ROI "+crop_opt.cu, "("+x+","+y+") "+width+"x"+height, 3000, true);

            });
          });
        });
      });
    } else if (cmd == 'exit-crop') {
      var encoden = jchaos.encodeName(opt.items[cmd].cu);
      $("#cameraImage-" + encoden).cropper('destroy');
    }
  }