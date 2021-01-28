
var selectedCams = [];
var stateObj={};

function showHisto(msghead, cuname, refresh, channel) {
  var update;
  var data;
  var stop_update = false;
  var hostWidth = $(window).width();
  var hostHeight = $(window).height();
  var name = jchaos.encodeName(cuname) + (new Date()).getTime();
  if (typeof channel === "undefined") {
      channel = 0;
  }
  //html='<div><img id="pict-' + name + '" src=""><div id="info-' + name + '"></div></div>'+buildHisto(name);
  html=buildHisto(name);
  var instant = $(html).dialog({
      minWidth: hostWidth / 4,
      minHeight: hostHeight / 4,
      title: msghead,
      position: "center",
      resizable: true,
      dialogClass: 'no-close',
      buttons: [{
          text: "save",
          click: function (e) {
              var binary_string = atob(data.FRAMEBUFFER.$binary.base64);
              /* var len = binary_string.length;
               var bytes = new Uint8Array(len);
               for (var i = 0; i < len; i++) {
                 bytes[i] = binary_string.charCodeAt(i);
               }
               var blob = new Blob([bytes], { type: "image/png" });
              */
              saveAsBinary(binary_string, name + ".png");

          }
      },
      {
          text: "update",
          id: 'pict-update-' + name,
          click: function (e) {
              // var interval=$(this).attr("refresh_time");
              stop_update = !stop_update;

          }
      },
      {
          text: "close",
          click: function (e) {
              // var interval=$(this).attr("refresh_time");

              clearInterval(update);
              // $(instant).dialog("close");
              $(this).remove();
          }
      }


      ],
      close: function (event, ui) {
          //  var interval=$(this).attr("refresh_time");

          clearInterval(update);
          // $(instant).dialog("close");
          $(this).remove();
      },
      open: function () {
          console.log(msghead + " refresh:" + refresh);

          update = setInterval(function () {
              if (refresh == 0) {
                  clearInterval(update);
              }
              if (stop_update) {
                  $('#pict-update-' + name).text("Update");
              } else {
                  $('#pict-update-' + name).text("Not Update");
              }
              if (!stop_update) {
                  updateHisto("cameraImage-" + jchaos.encodeName(cuname),name);

                  /*jchaos.getChannel(cuname, channel, function (imdata) {
                      data = imdata[0];
                      if (data.hasOwnProperty("FRAMEBUFFER") && data.FRAMEBUFFER.hasOwnProperty("$binary") && data.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
                          var bin = data.FRAMEBUFFER.$binary.base64;
                          //  $("#pict-"+name).attr("src", "data:image/" + fmt + ";base64," + bin);
                          $("#pict-" + name).attr("src", "data:;base64," + bin);
                          var info_size = "";
                          if (data.hasOwnProperty("WIDTH")) {
                              info_size = data.WIDTH + "x" + data.HEIGHT + "(" + data.OFFSETX + "," + data.OFFSETY + ") ";
                          }
                          $("#info-" + name).html(info_size + "frame:" + data.dpck_seq_id);
                          updateHisto("pict-" + name,name);
                      } else {
                          alert("NO 'FRAMEBUFFER.$binary.base64' key EXISTS");
                          clearInterval(update);
                          $(this).remove();

                      }
                  }, function (err) {
                  });*/
              }
              //$(this).attr("refresh_time",update);
          }, refresh);
      }
  });
}


function buildHisto(id){
  var html='<div class="card"><p>Histogram</p>';
  html+='<div><label><input name="rType" id="typeValue" type="radio" checked/> Value</label>&nbsp<label>';
  html+='<input name="rType" type="radio" /> Color</label></div>';
  html+='<canvas id="canvasHistogram-'+id+'" width="256" height="150"></canvas></div>';
  return html;
}
  function processImage(inImg,id) {
  const width = inImg.width;
  const height = inImg.height;
  const src = new Uint32Array(inImg.data.buffer);
  const isValueHistogram = $("#typeValue").prop('checked');
  
  let histBrightness = (new Array(256)).fill(0);
  let histR = (new Array(256)).fill(0);
  let histG = (new Array(256)).fill(0);
  let histB = (new Array(256)).fill(0);
  for (let i = 0; i < src.length; i++) {
    let r = src[i] & 0xFF;
    let g = (src[i] >> 8) & 0xFF;
    let b = (src[i] >> 16) & 0xFF;
    histBrightness[r]++;
    histBrightness[g]++;
    histBrightness[b]++;
    histR[r]++;
    histG[g]++;
    histB[b]++;
  }
  
  let maxBrightness = 0;
  if (isValueHistogram) {
    for (let i = 1; i < 256; i++) {
      if (maxBrightness < histBrightness[i]) {
        maxBrightness = histBrightness[i]
      }
    }
  } else {
    for (let i = 0; i < 256; i++) {
      if (maxBrightness < histR[i]) {
        maxBrightness = histR[i]
      } else if (maxBrightness < histG[i]) {
        maxBrightness = histG[i]
      } else if (maxBrightness < histB[i]) {
        maxBrightness = histB[i]
      }
    }
  }
  
  const canvas = document.getElementById('canvasHistogram-'+id);
  const ctx = canvas.getContext('2d');
  let guideHeight = 8;
  let startY = (canvas.height - guideHeight);
  let dx = canvas.width / 256;
  let dy = startY / maxBrightness;
  ctx.lineWidth = dx;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < 256; i++) {
    let x = i * dx;
    if (isValueHistogram) {
      // Value
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histBrightness[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
    } else {
      // Red
      ctx.strokeStyle = "rgba(220,0,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histR[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
      // Green
      ctx.strokeStyle = "rgba(0,210,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histG[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
      // Blue
      ctx.strokeStyle = "rgba(0,0,255,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histB[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
    }
    // Guide
    ctx.strokeStyle = 'rgb(' + i + ', ' + i + ', ' + i + ')';
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, canvas.height);
    ctx.closePath();
    ctx.stroke(); 
  }
}

function getImageData(el) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = document.getElementById(el);
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.width, img.height);
}
/*
document.getElementById('input').addEventListener('change', function() {
  if (this.files && this.files[0]) {
    var img = document.getElementById('img');
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = update;
  }
});
*/


function updateHisto(e,id) {
  console.log("src:"+e + " dst:"+id);
  processImage(getImageData(e),id);
}


function processImage(inImg,id) {
  const width = inImg.width;
  const height = inImg.height;
  const src = new Uint32Array(inImg.data.buffer);
  const isValueHistogram = $("#typeValue").prop('checked');
  
  let histBrightness = (new Array(256)).fill(0);
  let histR = (new Array(256)).fill(0);
  let histG = (new Array(256)).fill(0);
  let histB = (new Array(256)).fill(0);
  for (let i = 0; i < src.length; i++) {
    let r = src[i] & 0xFF;
    let g = (src[i] >> 8) & 0xFF;
    let b = (src[i] >> 16) & 0xFF;
    histBrightness[r]++;
    histBrightness[g]++;
    histBrightness[b]++;
    histR[r]++;
    histG[g]++;
    histB[b]++;
  }
  
  let maxBrightness = 0;
  if (isValueHistogram) {
    for (let i = 1; i < 256; i++) {
      if (maxBrightness < histBrightness[i]) {
        maxBrightness = histBrightness[i]
      }
    }
  } else {
    for (let i = 0; i < 256; i++) {
      if (maxBrightness < histR[i]) {
        maxBrightness = histR[i]
      } else if (maxBrightness < histG[i]) {
        maxBrightness = histG[i]
      } else if (maxBrightness < histB[i]) {
        maxBrightness = histB[i]
      }
    }
  }
  
  const canvas = document.getElementById('canvasHistogram-'+id);
  const ctx = canvas.getContext('2d');
  let guideHeight = 8;
  let startY = (canvas.height - guideHeight);
  let dx = canvas.width / 256;
  let dy = startY / maxBrightness;
  ctx.lineWidth = dx;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < 256; i++) {
    let x = i * dx;
    if (isValueHistogram) {
      // Value
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histBrightness[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
    } else {
      // Red
      ctx.strokeStyle = "rgba(220,0,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histR[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
      // Green
      ctx.strokeStyle = "rgba(0,210,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histG[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
      // Blue
      ctx.strokeStyle = "rgba(0,0,255,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY - histB[i] * dy);
      ctx.closePath();
      ctx.stroke(); 
    }
    // Guide
    ctx.strokeStyle = 'rgb(' + i + ', ' + i + ', ' + i + ')';
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, canvas.height);
    ctx.closePath();
    ctx.stroke(); 
  }
}

function getImageData(el) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = document.getElementById(el);
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.width, img.height);
}
/*
document.getElementById('input').addEventListener('change', function() {
  if (this.files && this.files[0]) {
    var img = document.getElementById('img');
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = update;
  }
});

$('input[name="rType"]').on('click change', update);

function update(e) {
  processImage(getImageData('img'));
}


update();
*/
function rebuildCam(tmpObj){

    var cnt = 0;
    var tablename = "main_table-" + tmpObj.template;

    var html = '<table class="table table-striped" id="' + tablename + '">';
   
    if (selectedCams instanceof Array) {
      var hostWidth = $(window).width();
      var hostHeight = $(window).height();
      var maxwidth=Math.trunc(hostWidth/tmpObj.maxCameraCol);
      var maxheight=Math.trunc(hostHeight/tmpObj.cameraPerRow);
      
      selectedCams.forEach(function (key) {
        if (cnt < tmpObj.maxCameraCol) {
          var encoden = jchaos.encodeName(key);
          if ((cnt % tmpObj.cameraPerRow) == 0) {
            if (cnt > 0) {
              html += "</tr>"
            }
            html += '<tr class="row_element" height="'+maxheight+'px" id=camera-row"' + cnt + '">';
          }
          html += '<td class="cameraMenu" width="'+maxwidth+'px" id="camera-' + encoden + '" cuname="' + key + '" >'
          //   html += '<div><b>'+key+'</b>';
          html += '<div>';
          if (selectedCams.length > 1) {
            html += '<img class="chaos_image mw-100 mh-100" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';
       //   html += '<img class="chaos_image" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';
        } else {
            html += '<img class="chaos_image" id="cameraImage-' + encoden + '" cuname="' + key + '" src="" />';

          }
          //                html += '<div class="row">';

          html += '<div>' + key + '</div>';
          html += '<div id="info-' + encoden + '"></div>';

          //               html += '</div></div></div>';
          html += '</div></div>';

          cnt++;
        }
      });

      if (cnt > 0) {
        html += "</tr>";

      }
    }
    html += "</table>";
    $("#cameraTable").html(html);
    var old_tim={},counter={},tcum={};

    selectedCams.forEach(function (key) {
      var encoden = jchaos.encodeName(key);
      old_tim[encoden]=0;
      counter[encoden]=0;
      tcum[encoden]=0;

      $("#cameraImage-" + encoden).on('click', function () {
        $("#cameraImage-" + encoden).cropper({
          aspectRatio: 1,
          viewMode: 1,
          dragMode: 'none',
          initialAspectRatio: 1,
          zoomable: false,
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
    if((jchaos.socket!=null)&&(jchaos.socket.connected)){
      jchaos.options['io_onconnect']=(s)=>{
        console.log("resubscribe ..")

        jchaos.iosubscribeCU(selectedCams);
      }
      jchaos.options['io_onmessage']= (ds)=>{
                

        var id = jchaos.encodeName(ds.ndk_uid);
        var start =Date.now();
        if(ds.dpck_ds_type==0){
          // output
        if(old_tim[id]){
          if(counter[id]%100==0){
            tcum[id]=0;
            counter[id]=1;
          } else {
            counter[id]++;
          }  
          tcum[id]+=(start-old_tim[id]);

        }
        old_tim[id]=start;
              
              
              // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
              $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);
              const freq=1000.0*counter[id]/tcum[id];
              if (ds.WIDTH !== undefined) {
                $("#info-" + id).html(ds.WIDTH + "x" + ds.HEIGHT + "(" + ds.OFFSETX + "," + ds.OFFSETY + ") frame:" + ds.dpck_seq_id + " Hz:"+freq.toFixed(2));
              } else {
                $("#info-" + id).html("frame:" + ds.dpck_seq_id+ " Hz:"+freq.toFixed(2));

      }
  } else {
    tmpObj['data']=[jchaos.chaosDatasetToFullDS(ds)];
    //console.log("Not output:"+JSON.stringify(tmpObj['data']));
    jqccs.checkLiveCU(tmpObj);
    jqccs.updateGenericTableDataset(tmpObj);

  }
}
      jchaos.iosubscribeCU(selectedCams);


     
  }
    $.contextMenu('destroy', '.cameraMenu');

    $.contextMenu({
      selector: '.cameraMenu',
      zIndex: 10000,
      build: function ($trigger, e) {
        var name = $(e.currentTarget).attr("cuname");
        var cuitem = {};
        var desc=jchaos.node(name,"desc","all");

        if (tmpObj.hasOwnProperty('crop')) {
          var crop_obj = tmpObj['crop'][name];
          if (typeof crop_obj === "object") {
            crop_obj['cu'] = name;
            if(desc.ndk_type != "nt_root"){

              cuitem['set-roi'] = { name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };
            }

          }

        }
        if(desc.ndk_type == "nt_root"){
          cuitem['set-reference'] = { name: "Set Reference Centroid " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj };

        }
        cuitem['histo-image'] = { name: "Histogram", cu: name };

        cuitem['exit-crop'] = { name: "Exit cropping", cu: name };
        cuitem['reset-roi'] = { name: "Reset ROI", cu: name };

        cuitem['sep1'] = "---------";
        var ele = jchaos.getChannel(name, 1, null);
        var el = ele[0];
        for (var k in el) {
          if (!(k.startsWith("dpck") || k.startsWith("ndk") || k.startsWith("cudk"))) {
            var val = el[k];
            if (typeof el[k] === "object") {
              val = JSON.stringify(el[k]);
            }
            cuitem['set-' + k] = {
              name: "Set " + k, type: "text", value: val, events: (function (k) {
                var events = {
                  keyup: function (e) {
                    // add some fancy key handling here?
                    if (e.keyCode == 13) {
                      jchaos.setAttribute(name, k, e.target.value, function () {
                        jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                      });
                    }
                  }
                }
                return events;
              })(k)
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
    $("#triggerType").on("click", function () {
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
  function updatelist(checkboxElem) {
    var ename = checkboxElem.name;
    if (checkboxElem.checked) {
      selectedCams.push(ename);
    } else {
      selectedCams = selectedCams.filter((e) => { return (e != ename) })
    }
    console.log("camlist:"+JSON.stringify(selectedCams));
    stateObj.node_multi_selected =selectedCams;
    rebuildCam(stateObj);
  }
  function setRoi(cu, width, height, x, y, func) {
    width = width - (width & 0x1);
    height = height - (height & 0x1);
    x = x - (x & 0x1)
    y = y - (y & 0x1)


    var roi_obj = {
      "WIDTH": parseInt(width),
      "HEIGHT": parseInt(height),
      "OFFSETX": parseInt(x),
      "OFFSETY": parseInt(y)
    };
    var msg = {
      "act_msg": roi_obj,
      "act_name": "cu_prop_drv_set"
    };
    /*console.log("sending ROI:"+JSON.stringify(roi_obj));
    jchaos.command(cu,msg, function (data) {
        jqccs.instantMessage("Setting roi:"+cu, " "+JSON.stringify(roi_obj), 2000, true);
        func();
    
    
    },(bad)=>{
      jqccs.instantMessage("Error Setting ROI:"+cu, " "+JSON.stringify(roi_obj)+" sent err: "+JSON.stringify(bad), 5000, false);
    
    });*/
    jchaos.setAttribute(cu, "OFFSETX", "0", function () {
      setTimeout(() => {
        jchaos.setAttribute(cu, "OFFSETY", "0", function () {
          setTimeout(() => {
            jchaos.setAttribute(cu, "WIDTH", String(width), function () {
              jchaos.setAttribute(cu, "HEIGHT", String(height), function () {
                setTimeout(() => {
                  console.log("setting OFFSETX:" + x);

                  jchaos.setAttribute(cu, "OFFSETX", String(x), function () {
                    setTimeout(() => {
                      console.log("setting OFFSETY:" + y);

                      jchaos.setAttribute(cu, "OFFSETY", String(y), function () {
                        jqccs.instantMessage("ROI " + cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);
                        func();

                      });
                    }, 200);
                  });
                }, 200);
              });
            });
          }, 200);
        });
      }, 200);
    }
    );
  }
  function getWidget() {
    var chaos =
    {
      dsFn: {
        output: {
          TRIGGER_MODE: function (val) {
            switch (val) {
              case 0:
                return "Continuous";
              case 2:
                return "Pulse";
              case 5:
                return "No Acquire";
              case 3:
                return "Trigger LOHI";
              case 4:
                return "Trigger HILO";
              default:
                return "--";
            }

          }
        }
      },
      tableClickFn: function (tmpObj, e) {
      //  rebuildCam(tmpObj);
        
      },
      updateInterfaceFn: function (tmpObj) {
        stateObj=tmpObj;
        jqccs.updateInterfaceCU(tmpObj);
        jchaos.getChannel(tmpObj['elems'], -1, function (selected) {
          tmpObj.data = selected;

          jqccs.updateGenericTableDataset(tmpObj);
        }, function (str) {
          console.log(str);
        });

        $(".select_camera_mode").change(function (e) {
          var value = e.currentTarget.value;
          console.log("name=" + e.currentTarget.name + " value=" + value);
          jchaos.setAttribute(e.currentTarget.name, "TRIGGER_MODE", value, function () {
            jqccs.instantMessage("SET MODE " + e.currentTarget.name, value, 3000, true);

          })
        })
      },
      updateFn: function (tmpObj) {
        var cu = [];
        if (tmpObj['elems'] instanceof Array) {
          cu = tmpObj.elems;
        }
        if(jchaos.socket==null || jchaos.socket.connected==false){

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
                  var id = jchaos.encodeName(elem);
                  // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
                  $("#cameraImage-" + id).attr("src", "data:image/" + fmt + ";base64," + bin);
                  if (selected.output.WIDTH !== undefined) {
                    $("#info-" + id).html(selected.output.WIDTH + "x" + selected.output.HEIGHT + "(" + selected.output.OFFSETX + "," + selected.output.OFFSETY + ") frame:" + selected.output.dpck_seq_id);
                  } else {
                    $("#info-" + id).html("frame:" + selected.output.dpck_seq_id);

                  }


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
        }, function (str) {
          console.log(str);
        });
      }

        


      },
      tableFn: function (tmpObj) {
        var cu = tmpObj.elems;
        var template = tmpObj.type;

        var html = '<div>';


        html += '<div id="cameraTable"></div>';
        html += '</div>';

        var cu = tmpObj.elems;
        var template = tmpObj.type;
        html += '<div class="row" z-index=-1 id="table-space">';
        html += '<div class="box col-md-12">';
        html += '<div class="box-content col-md-12">';
        if (cu.length == 0) {
          html += '<p id="no-result-monitoring">No results match</p>';

        } else {
          html += '<p id="no-result-monitoring"></p>';

        }

        html += '<table class="table table-striped" id="main_table-' + template + '">';
        html += '<thead class="box-header">';
        html += '<tr>';
        html += '<th><div class="custom-control custom-checkbox"><input type="checkbox" onchange="updatelist(this)" class="custom-control-input" id="selectAll">';
        html += '<label class="custom-control-label" for="tableDefaultCheck1">Select All</label></div></th>';

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
          html += '<th scope="row"><div class="custom-control custom-checkbox"><input type="checkbox" onchange="updatelist(this)" class="custom-control-input" name="' + cu[i] + '" id="s-' + cuname + '">';
          html += '<label class="custom-control-label" for="s-' + cuname + '">' + cu[i] + '</label></div></th>';

          //   html += "<td class='name_element'>" + cu[i] + "</td>";
          html += "<td id='" + cuname + "_health_status'></td>";
          html += "<td id='" + cuname + "_system_busy'></td>";
          html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";

          html += "<td id='" + cuname + "_output_TRIGGER_MODE'></td>";
          html += "<td id='" + cuname + "'><select class='select_camera_mode col-md-6' id='" + cuname + "_select_camera_mode' name='" + cu[i] + "'><option value='0'>Continuous</option><option value='3'>TriggeredLOHI</option><option value='4'>TriggeredHILO</option><option value='2'>Pulse</option><option value='5'>No Acquire</option></select></td>";

          html += "<td id='" + cuname + "_output_SHUTTER'></td>";
          html += "<td id='" + cuname + "'><input class='col-md-6 cucmdattr' id='" + cuname + "_SHUTTER' name='" + cu[i] + "/input/SHUTTER'></input></td>";

          html += "<td id='" + cuname + "_output_GAIN'></td>";
          html += "<td id='" + cuname + "'><input class='col-md-6 cucmdattr' id='" + cuname + "_GAIN' name='" + cu[i] + "/input/GAIN'></input></td>";

          html += "<td id='" + cuname + "_output_BRIGHTNESS'></td>";
          html += "<td id='" + cuname + "'><input class='col-md-6 cucmdattr' id='" + cuname + "_BRIGHTNESS' name='" + cu[i] + "/input/BRIGHTNESS'></input></td>";

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
      cmdFn: function (tmpObj) {
        return jqccs.generateGenericControl(tmpObj);

      }
    }
    return chaos;
  }
  function executeCameraMenuCmd(tmpObj, cmd, opt) {
    if (cmd == 'set-reference') {
      var crop_opt = opt.items[cmd].crop_opt;

      var width = crop_opt.width / 2;
      var height = crop_opt.height / 2;
      var x = crop_opt.x + width;
      var y = crop_opt.y + height;

      jchaos.setAttribute(crop_opt.cu, "REFX", String(x.toFixed()), function () {
        jchaos.setAttribute(crop_opt.cu, "REFY", String(y.toFixed()), function () {
          jchaos.setAttribute(crop_opt.cu, "REFSX", String(width.toFixed()), function () {
            jchaos.setAttribute(crop_opt.cu, "REFSY", String(height.toFixed()), function () {
              jqccs.instantMessage("SET REFERENCE " + crop_opt.cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);

            });
          });
        });
      });
    } else if (cmd == 'set-roi') {
      var crop_opt = opt.items[cmd].crop_opt;
      var encoden = jchaos.encodeName(crop_opt.cu);

      console.log("CROP_OBJ:" + JSON.stringify(crop_opt));
      var x = crop_opt.x.toFixed();
      var y = crop_opt.y.toFixed();
      var width = crop_opt.width.toFixed();
      var height = crop_opt.height.toFixed();
      setRoi(crop_opt.cu, width, height, x, y, () => { $("#cameraImage-" + encoden).cropper('destroy'); });
      /*
      jchaos.setAttribute(crop_opt.cu, "WIDTH", String(width), function () {
        jchaos.setAttribute(crop_opt.cu, "HEIGHT", String(height), function () {
        setTimeout(() => {
            console.log("setting OFFSETX:"+x);

            jchaos.setAttribute(crop_opt.cu, "OFFSETX", String(x), function () {
                setTimeout(() => {
                    console.log("setting OFFSETY:"+y);

                    jchaos.setAttribute(crop_opt.cu, "OFFSETY", String(y), function () {
                      jqccs.instantMessage("ROI " + crop_opt.cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);
                      $("#cameraImage-" + encoden).cropper('destroy');

                    });},1000);
            });},1000);
        });
    });
      
      jchaos.setAttribute(crop_opt.cu, "WIDTH",String(width) , function () {
        jchaos.setAttribute(crop_opt.cu, "HEIGHT",String(height), function () {

      jchaos.setAttribute(crop_opt.cu, "OFFSETX", String(x), function () {
        jchaos.setAttribute(crop_opt.cu, "OFFSETY", String(y), function () {
              jqccs.instantMessage("ROI "+crop_opt.cu, "("+x+","+y+") "+width+"x"+height, 3000, true);

            });
          });
        });
      });*/
    } else if (cmd == 'exit-crop') {
      var encoden = jchaos.encodeName(opt.items[cmd].cu);
      $("#cameraImage-" + encoden).cropper('destroy');
    } else if (cmd == "reset-roi") {
      // big value means maximum.
      setRoi(opt.items[cmd].cu, 1000000, 1000000, 0, 0, () => { $("#cameraImage-" + encoden).cropper('destroy'); });

    } else if(cmd == "histo-image"){
      showHisto("Histogram "+opt.items[cmd].cu,opt.items[cmd].cu,1000,0);
    }
  }

  function configureSliderCommands(tmpObj, slname, slinput) {
    $("#" + slname).slider({
      range: "max",
      min: 0,
      max: 100,
      value: 1,
      slide: function (event, ui) {
        $("#" + slinput).val(ui.value);
        var id = this.id;
        var node_selected = tmpObj.node_selected;
        var attr = id.split("-")[1];
        jchaos.setAttribute(node_selected, attr, String(ui.value), function () {
          //   instantMessage("Attribute ", "\"" + attr + "\"=\"" + ui.value + "\" sent", 1000)

        });
      }
    });
    $("#" + slinput).val($("#" + slname).slider("value"));
  }