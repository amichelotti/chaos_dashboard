
var selectedCams = [];
var stateObj = {};
var cameraDriverDesc={};
var cameraLayoutSettings={};
var mouseX, mouseY;

function checkRedrawReference(camid,domid,x,y,sx,sy,r){
  jchaos.getChannel(camid,1,(ele)=>{
    let xx,yy,sxx,syy,rro;
    xx = (typeof x === 'undefined') ? ele[0].REFX : x;
    yy = (typeof y === 'undefined') ? ele[0].REFY : y;
    sxx = (typeof sx === 'undefined') ? ele[0].REFSX : sx;
    syy = (typeof sy === 'undefined') ? ele[0].REFSY : sy;
    rro = (typeof r === 'undefined') ? ele[0].REFRHO : r;

    redrawReference(domid,xx,yy,sxx,syy,rro);

  });
}
function redrawReference(domid,x,y,sx,sy,r){

  
    if(sx>0 && sy>0){
      //let name=jchaos.encodeName(id);

      const canvas = document.getElementById("cameraImageCanv-"+domid);
      canvas.width = $("#cameraImage-"+domid).width();
      canvas.height = $("#cameraImage-"+domid).height();
      let natwidth=$("#cameraImage-"+domid).prop('naturalWidth');
      let natheight=$("#cameraImage-"+domid).prop('naturalHeight');
     
      const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  //  console.log("canvas width:"+canvas.width + " height:"+canvas.height+" original img size:"+natwidth+"x"+natheight+" offsetTop:" +canvas.offsetTop + " offsetLeft:"+canvas.offsetLeft+" offsetW:"+canvas.offsetWidth + " offsetH:"+canvas.offsetHeight);
    let ratiox=canvas.width/natwidth;
    let ratioy=canvas.height/natheight;
    /*ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(1, 1, 50, 50);

       // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(300, 200, 50, 50);
      */
      x=x*ratiox,y=y*ratioy,sx=sx*ratiox,sy=sy*ratioy;
      ctx.beginPath();
      ctx.lineWidth = 3;
//      r=Math.PI/2+r;
      ctx.ellipse(x, y, sx, sy, r, 0, 2 * Math.PI);
      ctx.strokeStyle='red';
      ctx.stroke();
      ctx.beginPath();

      let a=sx,b=sy;
      let cx0=x-a*Math.cos(r);
      let cy0=y-a*Math.sin(r);
      let cx1=x+a*Math.cos(r);
      let cy1=y+a*Math.sin(r);
      let cmx0=x+b*Math.sin(r);
      let cmy0=y-b*Math.cos(r);
      let cmx1=x-b*Math.sin(r);
      let cmy1=y+b*Math.cos(r);
      ctx.lineWidth = 1;


      ctx.moveTo(cx0, cy0);
      ctx.lineTo(cx1, cy1);
      ctx.moveTo(cmx0, cmy0);
      ctx.lineTo(cmx1, cmy1);

     
      ctx.stroke();
    //  ctx.closePath();
   //   console.log("drawing x:"+x+"y:"+y+" sx:"+sx+" sy:"+sy+ " rho:"+r);
    }


  
}
function getCameraDesc(cul){
  jchaos.command(cul, { "act_name": "cu_prop_drv_get" },data=>{

  data.forEach((ele,cnt)=>{
      var pub={};
      for(k in ele ){
        var bname=jchaos.encodeName(cul[cnt]);

        if(ele[k].hasOwnProperty("pubname")){
          pub[ele[k].pubname]=ele[k];
          var html="NA:NA";
          if(ele[k].pubname=="SHUTTER"){
            if(ele[k].max != undefined){
              html=ele[k].max.toFixed(2) + ":"+ele[k].min.toFixed(2);
            }
            $("#"+bname+ "_SHUTTER_INFO").html(html);
          }
          if(ele[k].pubname=="GAIN"){
            if(ele[k].max != undefined){
              html=ele[k].max.toFixed(2) + ":"+ele[k].min.toFixed(2);
            }
            $("#"+bname+ "_GAIN_INFO").html(html);
          }
          
        }
        if(k=="SerialNumber"){
          if(ele[k].hasOwnProperty("VAL")){
            $("#"+bname+ "_INFO").html(ele[k].VAL);
            console.log("Serial:"+ele[k].VAL);
          } else if(ele[k].hasOwnProperty("VAL")){
            $("#"+bname+ "_INFO").html(ele[k].VAL);
            console.log("Serial:"+ele[k].VAL);

        } 
      cameraDriverDesc[cul[cnt]]=pub;
    
      }
    }
     // console.log(cul[cnt]+" ->"+JSON.stringify(pub));

    });
  });
}
function buildSelected(list, sel) {
  var selopt = '<option value="NOCAMERA" selected="selected">No camera</option>';

  list.forEach((ele, index) => {
  /*if(index==sel){
    selopt+= '<option value="'+ele+'" selected="selected">'+ele+'</option>';

  } else*/ {
      selopt += '<option value="' + ele + '">' + ele + '</option>';
    }
  });
  return selopt;
}
var mapcamera = {};
var mappedcamera = {};

function buildCameraArray(id, opt) {
  var tablename = id;
  var col = opt.camera['maxCameraCol'];
  var row = opt.camera['cameraPerRow'];
  var tmpObj = {
    maxCameraCol: col || 2,
    cameraPerRow: row || 2
  };
 // var html = '<table class="table" id="' + tablename + '">';
 var html="";
  var hostWidth = $(window).width();
  var hostHeight = $(window).height();
  var maxwidth = Math.trunc(hostWidth / tmpObj.maxCameraCol);
  var maxheight = Math.trunc(hostHeight / tmpObj.cameraPerRow);
  var pe = $("#push_enable").is(":checked");
  console.log("Camera Array:"+row+"x"+col+ " maxwidth:"+maxwidth);

  var list_cu = jchaos.search("", "ceu", true, { 'interface': "camera" });
  var cnt = 0;
  for (var r = 0; r < row; r++) {
    html += '<div class="row">';
    //html += '<tr class="d-flex" id=camera-"' + r + '">';

    for (var c = 0; c < col; c++, cnt++) {
      var encoden = r + "_" + c;
     // html += '<td id="camera-' + encoden + '">';
      html += '<div class="col">';

      html += '<div class="insideWrapper cameraMenuShort" cuindex="'+encoden+'" id="insideWrapper-'+encoden+'">';
      html += '<img class="chaos_image" id="cameraImage-' + encoden + '" src="/../img/logo_chaos_col_xMg_icon.ico" />';
      html += '<canvas class="coveringCanvas" id="cameraImageCanv-' + encoden + '"/></canvas>';
      html += '</div>';

      html += '<div id="info-' + encoden + '"></div>';


      html += '<select class="camselect chaos_image" id="select-' + encoden + '" vid="' + encoden + '">';
      html += buildSelected(list_cu, cnt);
      html += '</select>';

      //html += '</td>';
      html += '</div>'; //col

    }
   // html += "</tr>";
   html += "</div>";// row

  }
  //html += "</table>";

  return html;
}

var cameralist = [], cameralistold = [];

$.fn.buildCameraArray = function (opt) {
  this.html(buildCameraArray("table-" + this.attr('id'), opt));
  var old_tim = {}, counter = {}, tcum = {};

  $(".camselect").on("change", (ev) => {
    var vid = ev.currentTarget.id.split('-');
    console.log("change " + vid[1] + " :" + ev.currentTarget.value);
    $("#cameraImage-" + vid[1]).attr("src", "/../img/chaos_wait_big.gif");
    if (ev.currentTarget.value == "NOCAMERA") {
      delete mappedcamera[mapcamera[vid[1]]];
      delete mapcamera[vid[1]];
      $("#cameraImage-" + vid[1]).attr("src", "/../img/logo_chaos_col_xMg_icon.ico");

    } else {
      mapcamera[vid[1]] = ev.currentTarget.value;
      for(var k in mappedcamera){
        if(mappedcamera[k]==vid[1]){
          delete mappedcamera[k];
        }
      }
      mappedcamera[ev.currentTarget.value] = vid[1];
      activateMenuShort();
      $("#cameraImageCanv-" + vid[1]).on("mousemove", function (e) {
        var offset = $(this).offset();
        var currzoomm=1.0;
        var x = (e.pageX - offset.left)/currzoomm;
        var y = (e.pageY - offset.top)/currzoomm;
      //  console.log("POS "+ev.currentTarget.value+" "+x+","+y)
        mouseX=x;
        mouseY=y;
       
      });
      // console.log(JSON.stringify(mapcamera));
     // checkRedrawReference(ev.currentTarget.value,vid[1]);

    }
    cameralist = [];
    for (var k in mappedcamera) {
      var id = mappedcamera[k];

      cameralist.push(k);
      old_tim[id] = 0;
      counter[id] = 0;
      tcum[id] = 0;

    }
    if (cameralist.length) {

      if ((jchaos.socket != null) && (jchaos.socket.connected)) {
        if (cameralistold.length) {
          console.log("Unsubscribe "+JSON.stringify(cameralistold));
          jchaos.iosubscribeCU(cameralistold, false);
        }
        console.log("Subscribe "+JSON.stringify(cameralist));

        jchaos.iosubscribeCU(cameralist, true);
        cameralistold = cameralist;
        jchaos.options['io_onconnect'] = (s) => {
          console.log("resubscribe ..")

          jchaos.iosubscribeCU(cameralist, true);
        }
        
        jchaos.options['io_onmessage'] = (ds) => {
          if (ds.dpck_ds_type == 0) {
            // output
            let freq,start,lat;
            let id = mappedcamera[ds.ndk_uid];
            let debug=opt.camera.debug;
            let debug_html="";
            start = Date.now();
            if(counter[id]==0){
              checkRedrawReference(ds.ndk_uid,id);
              counter[id]=1;
            }
            if(debug){
            if (old_tim[id]) {
              if ((counter[id] % 1000) == 0) {
                tcum[id] = 0;
                counter[id] = 1;
              } else {
                counter[id]++;
              }
              tcum[id] += (start - old_tim[id]);

            }
            freq = 1000.0 * counter[id] / tcum[id];
          //  let freq = 1000.0 / (start-old_tim[id]);
            old_tim[id] = start;
            debug_html=" Hz:" + freq.toFixed(2) ;
          }
          lat = start - ds.dpck_ats;

            // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
            $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);
          
            if (ds.WIDTH !== undefined) {
              $("#info-" + id).html(ds.WIDTH + "x" + ds.HEIGHT + "(" + ds.OFFSETX + "," + ds.OFFSETY + ") frame:" + ds.dpck_seq_id+ " lat:" + lat + debug_html);
            } else {
              $("#info-" + id).html("frame:" + ds.dpck_seq_id + " lat:" + lat + debug_html);

            }
          } else if(ds.dpck_ds_type == 1){
          //  console.log("INPUT :"+JSON.stringify(ds));
            let id = mappedcamera[ds.ndk_uid];

            redrawReference(id,ds.REFX,ds.REFY,ds.REFSX,ds.REFSY,ds.REFRHO);
          }
        }

      }
    }
  });
}

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
  html = buildHisto(name);
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
          updateHisto("cameraImage-" + jchaos.encodeName(cuname), name);

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


function buildHisto(id) {
  var html = '<div class="card"><p>Histogram</p>';
  html += '<div><label><input name="rType" id="typeValue" type="radio" checked/> Value</label>&nbsp<label>';
  html += '<input name="rType" type="radio" /> Color</label></div>';
  html += '<canvas id="canvasHistogram-' + id + '" width="256" height="150"></canvas></div>';
  return html;
}
function processImage(inImg, id) {
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

  const canvas = document.getElementById('canvasHistogram-' + id);
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


function updateHisto(e, id) {
  console.log("src:" + e + " dst:" + id);
  processImage(getImageData(e), id);
}


function processImage(inImg, id) {
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

  const canvas = document.getElementById('canvasHistogram-' + id);
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
function cropEnable(cu,tmpObj,func){
  var encoden = jchaos.encodeName(cu);

  $("#cameraImage-" + encoden).cropper({
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'none',
    initialAspectRatio: 1,
    zoomable: true,
    crop: function (event) {
      tmpObj['crop'] = {};
      tmpObj['crop'][cu] = event.detail;
      if(typeof func ==="function"){
        func(tmpObj);
      }

    },
    ready() {
      // Do something here
      // ...

      // And then
      this.cropper.crop();
    }
  });
}
function activateMenuShort(){
  $.contextMenu('destroy', '.cameraMenuShort');
  $.contextMenu({
    selector: '.cameraMenuShort',
    zIndex: 10000,
    build: function ($trigger, e) {
      var domid=$(e.currentTarget).attr("cuindex");
      var name = mapcamera[domid];
      var cuitem = {};
      console.log(domid+" Menu for :"+name);
      var currzoomm=1.0;
      if(cameraLayoutSettings.hasOwnProperty(domid)&&cameraLayoutSettings[domid].hasOwnProperty("zoom")){
        currzoomm=cameraLayoutSettings[domid]["zoom"];
      }
        var ele = jchaos.getChannel(name, 1, null);
        var el = ele[0];
        redrawReference(domid,ele[0].REFX,ele[0].REFY,ele[0].REFSX,ele[0].REFSY,ele[0].REFRHO);
        cuitem['zoom-in'] = {
          name: "Zoom In ", cu: name,
          callback: function (itemKey, opt, e) {
            zoomInOut(domid,2);
          }
        };
        cuitem['zoom-out'] = {
          name: "Zoom Out ", cu: name,
          callback: function (itemKey, opt, e) {
            zoomInOut(domid,0.5);
          }
        };
        cuitem['zoom-reset'] = {
          name: "Zoom Reset", cu: name,
          callback: function (itemKey, opt, e) {
           // var name = opt.items[itemKey].cu;
            zoomInOut(domid,0);
          }
        };
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
                        if(name=="REFX"){
                          redrawReference(domid,e.target.value);
                        }
                        if(name=="REFY"){
                          redrawReference(domid,undefined,e.target.value);
                        }
                        if(name=="REFSX"){
                          redrawReference(domid,undefined,undefined,e.target.value);
                        }
                        if(name=="REFSY"){
                          redrawReference(domid,undefined,undefined,undefined,e.target.value);
                        }
                        if(name=="REFRHO"){
                          console.log("Setting RHO:"+e.target.value);
                          redrawReference(domid,undefined,undefined,undefined,undefined,e.target.value);
                        }
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
          items: cuitem
        }
      }

    });
}
function zoomInOut(name,incr){
  var currzoom=1.0;
  if(cameraLayoutSettings.hasOwnProperty(name)){
      if(cameraLayoutSettings[name].hasOwnProperty("zoom")){
        currzoom=cameraLayoutSettings[name]["zoom"];
      } else {
        cameraLayoutSettings[name]["zoom"]=currzoom;
      }
  } else{
    cameraLayoutSettings[name]={"zoom":currzoom};

  }
  var x=mouseX/currzoom;
  var y=mouseY/currzoom;     
  if(incr==0){
    currzoom=1.0;
  } else {
    
    currzoom*=incr;
    jqccs.instantMessage("Zoom:" + currzoom, "", 2000, true);

  }
  cameraLayoutSettings[name]["zoom"]=currzoom;
  var encoden = jchaos.encodeName(name);
  
//  $("#insideWrapper-"+encoden).css("transform","scale("+currzoom+")");
  if((incr!=0)){
    
    var or=x + "px " +y+"px";
    var prop={
      "transform-origin":or,
      "transform": "scale("+currzoom+")"
    };
    $("#cameraImage-"+encoden).css(prop);
    $("#cameraImageCanv-"+encoden).css(prop);

    //$("#cameraImage-"+encoden).css("transform-origin","10px 4px");
    //$("#cameraImageCanv-"+encoden).css("transform-origin","10px 4px");

    console.log(name+" Zooming "+currzoom +" "+JSON.stringify(prop));

  } else {
    console.log(name+" Zooming "+currzoom);

    $("#cameraImage-"+encoden).css("transform","scale("+currzoom+")");
    $("#cameraImageCanv-"+encoden).css("transform","scale("+currzoom+")");
  }

}
function activateMenu(tmpObj){
  $.contextMenu('destroy', '.cameraMenu');
  $.contextMenu({
    selector: '.cameraMenu',
    zIndex: 10000,
    build: function ($trigger, e) {
      var name = $(e.currentTarget).attr("cuname");
      var cuitem = {};
      var desc = jchaos.node(name, "desc", "all");
      var currzoomm=1.0;
      if(cameraLayoutSettings.hasOwnProperty(name)&&cameraLayoutSettings[name].hasOwnProperty("zoom")){
        currzoomm=cameraLayoutSettings[name]["zoom"];
      }

      cuitem['select-area'] = {
        name: "Select Area..",
        callback: function (cmd, opt, e) {

          cropEnable(name,tmpObj);
          
      }
      };
      cuitem['zoom-in'] = {
        name: "Zoom In ", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items[itemKey].cu;
          var offset = $(this).offset();
         // var x = (e.pageX - offset.left);
          //var y = (e.pageY - offset.top);
         // var x = (e.pageX )/currzoomm;
         // var y = (e.pageY)/currzoomm;
         var x=mouseX/currzoomm;
         var y=mouseY/currzoomm;
          console.log("Zoom in Pos:"+x+"-"+e.clientX+","+y+"-"+e.clientY+" offleft:"+offset.left+" offtop:"+offset.top);
          zoomInOut(name,2);
        }
      };
      cuitem['zoom-out'] = {
        name: "Zoom Out ", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items[itemKey].cu;
          var encoden = jchaos.encodeName(name);
          var offset = $(this).offset();
         // var x = (e.pageX - offset.left);
         // var y = (e.pageY - offset.top);
         //var x = (e.pageX )/currzoomm;
         //var y = (e.pageY )/currzoomm;   
      
      //    console.log("Zoom out Pos:"+x+","+y +" offleft:"+offset.left+" offtop:"+offset.top);

          zoomInOut(name,0.5);
        }
      };
      cuitem['zoom-reset'] = {
        name: "Zoom Reset", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items[itemKey].cu;
          zoomInOut(name,0);
        }
      };
        cuitem['auto-reference'] = {
        name: "Set Auto Reference",
        callback: function (cmd, opt, e) {
          jqccs.getEntryWindow("Threashold", "Threashold", 10, "Perform Reference", function (th) {
            jchaos.command(name, { "act_name": "calibrateNodeUnit","act_msg":{"autoreference":true,"threshold":parseInt(th)} }, function (data) {
              jqccs.instantMessage("Performing autoreference:" + name, "Sent", 2000, true);
  
          }, function (data) {
              jqccs.instantMessage("ERROR Performing autoreference:" + name, "Error:" + JSON.stringify(data), 5000, false);
  
          });


        }, "Cancel");
          
      }
      };
      cuitem['reset-roi'] = {
        name: "Reset ROI", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items[itemKey].cu;
          var encoden = jchaos.encodeName(name);
          resetRoi(name,() => {
            $("#cameraImage-" + encoden).cropper('destroy');
          });

        }
      };
      cuitem['histo-image'] = {
        name: "Histogram", cu: name,
        callback: function (itemKey, opt, e) {
          showHisto("Histogram " + opt.items[itemKey].cu, opt.items[itemKey].cu, 1000, 0);

        }
      };
      if (tmpObj.hasOwnProperty('crop')) {
        var crop_obj = tmpObj['crop'][name];
        if (typeof crop_obj === "object") {
          crop_obj['cu'] = name;
          if (desc.ndk_type != "nt_root") {

            cuitem['set-roi'] = {
              name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj,
              callback: function (cmd, opt, e) {

                var crop_opt = opt.items[cmd].crop_opt;
                var encoden = jchaos.encodeName(crop_opt.cu);

                console.log("CROP_OBJ:" + JSON.stringify(crop_opt));
                var x = crop_opt.x.toFixed();
                var y = crop_opt.y.toFixed();
                var width = crop_opt.width.toFixed();
                var height = crop_opt.height.toFixed();
                setRoi(crop_opt.cu, width, height, x, y, () => { $("#cameraImage-" + encoden).cropper('destroy'); });

              }
            };

          }
        cuitem['set-reference'] = {
          name: "Set Reference Centroid " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj,
          callback: function (cmd, opt, e) {
            var crop_opt = opt.items[cmd].crop_opt;

            var width = crop_opt.width / 2;
            var height = crop_opt.height / 2;
            var x = crop_opt.x + width;
            var y = crop_opt.y + height;
            setReference(crop_opt.cu, x, y, width, height);

            var encoden = jchaos.encodeName(name);
            $("#cameraImage-" + encoden).cropper('destroy');
          }
          
        };


        

        cuitem['exit-crop'] = {
          name: "Exit cropping", cu: name,
          callback: function (itemKey, opt, e) {
            var encoden = jchaos.encodeName(opt.items[itemKey].cu);
            $("#cameraImage-" + encoden).cropper('destroy');
          }

        };
        

        
      }
    }
      cuitem['sep1'] = "---------";
        var ele = jchaos.getChannel(name, 1, null);
        var el = ele[0];
        redrawReference(jchaos.encodeName(name),ele[0].REFX,ele[0].REFY,ele[0].REFSX,ele[0].REFSY,ele[0].REFRHO);

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
                    let domid=jchaos.encodeName(name);
                    if (e.keyCode == 13) {
                      jchaos.setAttribute(name, k, e.target.value, function () {
                        jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                        if(name=="REFX"){
                          redrawReference(domid,e.target.value);
                        }
                        if(name=="REFY"){
                          redrawReference(domid,undefined,e.target.value);
                        }
                        if(name=="REFSX"){
                          redrawReference(domid,undefined,undefined,e.target.value);
                        }
                        if(name=="REFSY"){
                          redrawReference(domid,undefined,undefined,undefined,e.target.value);
                        }
                        if(name=="REFRHO"){
                          console.log("Setting RHO:"+e.target.value);
                          redrawReference(domid,undefined,undefined,undefined,undefined,e.target.value);
                        }
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
    /*  cuitem['set-roi'] = {
        name: "Set Roi " + name ,
        callback: function (cmd, opt, e) {
          cropEnable(name,tmpObj,(crop_opt)=>{
            var encoden = jchaos.encodeName(name);

          console.log("CROP_OBJ:" + JSON.stringify(crop_opt));
          var x = crop_opt.x.toFixed();
          var y = crop_opt.y.toFixed();
          var width = crop_opt.width.toFixed();
          var height = crop_opt.height.toFixed();
          setRoi(name, width, height, x, y, () => { $("#cameraImage-" + encoden).cropper('destroy'); 
        });

        });
      }
      };*/
     
        return {
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
function rebuildCam(tmpObj) {

  var cnt = 0;
  var tablename = "main_table-" + tmpObj.template;

  //var html = '<table class="table table-striped" id="' + tablename + '">';
  var html="";//'<div class="container">';
  if (selectedCams instanceof Array) {
    var hostWidth = $(window).width();
    var hostHeight = $(window).height();
    var maxwidth = Math.trunc(hostWidth / tmpObj.maxCameraCol);
    var maxheight = Math.trunc(hostHeight / tmpObj.cameraPerRow);
    var pe = $("#push_enable").is(":checked");

    if (pe && (jchaos.socket != null) && (jchaos.socket.connected)) {
      jchaos.iosubscribeCU(tmpObj.elems, false);
      jchaos.iosubscribeCU(selectedCams, true);

    }
    console.log("Rebuild Camera Array camera per row:"+tmpObj.cameraPerRow);

    selectedCams.forEach(function (key) {
        var encoden = jchaos.encodeName(key);
        if ((cnt % tmpObj.cameraPerRow) == 0) {
          html +='<div class="row">';
        //  html += '<tr class="row_element" height="' + maxheight + 'px" id=camera-row"' + cnt + '">';
        }
       // html += '<td class="cameraMenu" style="width:' + maxwidth + 'px" id="camera-' + encoden + '" cuname="' + key + '" >'
        //   html += '<div><b>'+key+'</b>';
        html +='<div class="col">';
        html += '<div class="insideWrapper cameraMenu" cuname="' + key + '" id="insideWrapper-'+encoden+'">';

        if (selectedCams.length > 1) {
          html += '<img class="chaos_image" id="cameraImage-' + encoden + '" cuname="' + key + '" src="/img/chaos_wait_big.gif" />';
        } else {
          html += '<img class="chaos_image_max" id="cameraImage-' + encoden + '" cuname="' + key + '" src="/img/chaos_wait_big.gif" />';
        }
        html += '<canvas class="coveringCanvas" id="cameraImageCanv-' + encoden + '"/></canvas>';
        html += '</div>';

        html += '<div>' + key + '</div>';
        html += '<div id="info-' + encoden + '"></div>';
        html += '</div>'; // close col
        
        cnt++;
        if ((selectedCams.lengt==1)||((cnt % tmpObj.cameraPerRow) == 0)) {
          html +='</div>'; // close row
        //  html += '<tr class="row_element" height="' + maxheight + 'px" id=camera-row"' + cnt + '">';
        }
      
    });

    
    //  html += "</tr>";
   // html += "</div>"; //container
    
  }
  //html += "</table>";
  $("#cameraTable").html(html);
  var checkExist={};
  selectedCams.forEach(function (key) {
    var encoden = jchaos.encodeName(key);
    
     checkExist[key] = setInterval(function() {

      if ($("#cameraImageCanv-" + encoden).length && $("#cameraImage-" + encoden).length) {
        activateMenu(tmpObj);
        $("#cameraImageCanv-" + encoden).on('dblclick', function (e) {
          var offset = $(this).offset();
          var currzoomm=1.0;
            if(cameraLayoutSettings.hasOwnProperty(key)&&cameraLayoutSettings[key].hasOwnProperty("zoom")){
              currzoomm=cameraLayoutSettings[key]["zoom"];
            }
            var x = (e.pageX - offset.left)/currzoomm;
            var y = (e.pageY - offset.top)/currzoomm;
              
           // var x = event.pageX - this.offsetLeft;
           // var y = event.pageY - this.offsetTop;
           let natw=$("#cameraImage-"+encoden).prop('naturalWidth');
          let nath=$("#cameraImage-"+encoden).prop('naturalHeight');
            x=x*(natw/this.width);
            y=y*(nath/this.height);
           //var natw=$(this).naturalWidth;
           //var nath=$(this).naturalHeight;
          // var offx=this.naturalWidth;
          // var offy=this.naturalHeight;
           console.log("Natural dim:"+natw+","+nath+ " Rendered "+this.width+","+this.height);
           jqccs.confirm("Reference Change", "Do you want change to :" + x.toFixed(1)+"x"+y.toFixed(1) + " Zoom:"+currzoomm, "Ok", function () {
            
            jchaos.setAttribute(key,"REFX",x.toString(),(ok)=>{
              jchaos.setAttribute(key,"REFY",y.toString(),ok=>{
                console.log(key+" X Coordinate: " + x + " Y Coordinate: " + y);
                jchaos.getChannel(key,1,(ele)=>{
                  redrawReference(encoden,x,y,ele[0].REFSX,ele[0].REFSY,ele[0].REFRHO);
            
                });
              });
            });
          },"Cancel");
    
        });
        $("#cameraImageCanv-" + encoden).on('mousemove', function (e) {
          var offset = $(this).offset();
          var currzoomm=1.0;
         // console.log("POS:"+e.pageX+","+e.pageY);
          var x = (e.pageX - offset.left)/currzoomm;
          var y = (e.pageY - offset.top)/currzoomm;
          //let natw=$("#cameraImage-"+encoden).prop('naturalWidth');
          //let nath=$("#cameraImage-"+encoden).prop('naturalHeight');
          mouseX=x;
          mouseY=y;
          //console.log("POS:"+x+","+y+" Natural dim:"+natw+","+nath+ " Rendered "+this.width+","+this.height);
     
           // var x = event.pageX - this.offsetLeft;
           // var y = event.pageY - this.offsetTop;
           // x=x*(natw/this.width);
           // y=y*(nath/this.height);
           //var natw=$(this).naturalWidth;
           //var nath=$(this).naturalHeight;
          // var offx=this.naturalWidth;
          // var offy=this.naturalHeight;
           
        });
        checkRedrawReference(encoden);
        
         clearInterval(checkExist[key]);
      }
   }, 300); // check every 300ms
    

  });

}
function updatelist(checkboxElem) {
  var ename = checkboxElem.name;
  if (checkboxElem.checked) {
    selectedCams.push(ename);
  } else {
    selectedCams = selectedCams.filter((e) => { return (e != ename) })
  }
  console.log("camlist:" + JSON.stringify(selectedCams));
  stateObj.node_multi_selected = selectedCams;
  rebuildCam(stateObj);
}
function resetRoi(cu,func){
  var input = jchaos.getChannel(cu, 1)[0];
  if ((!input.hasOwnProperty("REFABS")) || (input["REFABS"] == false)) {
    var refx = -1, refy = -1;
    if (input.hasOwnProperty("REFSX") && (input["REFSX"] > 0)) {
      refx = input["REFX"] + input["OFFSETX"];

    }
    if (input.hasOwnProperty("REFSY") && (input["REFSY"] > 0)) {
      refy = input["REFY"] +input["OFFSETY"];
    }
  }
  jchaos.setAttribute(cu, "OFFSETX", "0", function () {
    if (refx >= 0) {
      jchaos.setAttribute(cu, "REFX", String(refx), function () {
        console.log("setting moving refx:" + refx);
       // redrawReference(cu,refx);

      });
    }
    setTimeout(() => {
      jchaos.setAttribute(cu, "OFFSETY", "0", function () {
        if (refy >= 0) {
          jchaos.setAttribute(cu, "REFY", String(refy), function () {
            console.log("setting moving refy:" + refy);
         //   redrawReference(cu,undefined,refy);

          });
        }
        setTimeout(() => {
          console.log("setting WIDTH:" + String(100000));

          jchaos.setAttribute(cu, "WIDTH", String(100000), function () {
            setTimeout(() => {
              console.log("setting HEIGHT:" + String(100000));

              jchaos.setAttribute(cu, "HEIGHT", String(100000), function () {
                        
                        jqccs.instantMessage("Reset ROI", 3000, true);
                        func();

                      });
                    }, 20);
                  });
                }, 20);
              });
            }, 20);
          });
        


}
function setRoi(cu, width, height, x, y, func) {


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
  var input = jchaos.getChannel(cu, 1)[0];

  var refx = -1, refy = -1, offx=parseInt(x), offy=parseInt(y);
  if ((!input.hasOwnProperty("REFABS")) || (input["REFABS"] == false)) {
    //the offsets must be done in absolute
    if (input.hasOwnProperty("OFFSETX")) {
      offx += input["OFFSETX"];
    }
    if (input.hasOwnProperty("OFFSETY")) {
      offy += input["OFFSETY"];
    }
    if (input.hasOwnProperty("REFSX") && (input["REFSX"] > 0)) {
      refx = input["REFX"] - x;
    }
    if (input.hasOwnProperty("REFSY") && (input["REFSY"] > 0)) {
      refy = input["REFY"] - y;
    }
  }

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
          console.log("setting WIDTH:" + String(width));

          jchaos.setAttribute(cu, "WIDTH", String(width), function () {
            setTimeout(() => {
              console.log("setting HEIGHT:" + String(height));

              jchaos.setAttribute(cu, "HEIGHT", String(height), function () {
                setTimeout(() => {
                  console.log("setting OFFSETX:" + offx);
                  if (refx >= 0) {
                    jchaos.setAttribute(cu, "REFX", String(refx), function () {
                      console.log("setting moving refx:" + refx);

                    });

                  }
                  jchaos.setAttribute(cu, "OFFSETX", String(offx), function () {
                    setTimeout(() => {
                      console.log("setting OFFSETY:" + offy);

                      jchaos.setAttribute(cu, "OFFSETY", String(offy), function () {
                        if (refy >= 0) {
                          jchaos.setAttribute(cu, "REFY", String(refy), function () {
                            console.log("setting moving refy:" + refy);

                          });

                        }
                        jqccs.instantMessage("ROI " + cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);
                        func();

                      });
                    }, 20);
                  });
                }, 20);
              });
            }, 20);
          });
        }, 20);
      });
    }, 20);
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
      console.log("Table click");

    },
    updateInterfaceFn: function (tmpObj) {
      console.log("UpdateInterfaceFn ");
      getCameraDesc(tmpObj.elems);

      stateObj = tmpObj;
      jqccs.updateInterfaceCU(tmpObj);
     /* jchaos.getChannel(tmpObj['elems'], -1, function (selected) {
        tmpObj.data = selected;

        jqccs.updateGenericTableDataset(tmpObj);
      }, function (str) {
        console.log(str);
      });
*/
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
      var pe = $("#push_enable").is(":checked");

      if ((pe == false) || (jchaos.socket == null) || (jchaos.socket.connected == false)) {

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
                  let lat = Date.now() - selected.output.dpck_ats;

                  // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
                  $("#cameraImage-" + id).attr("src", "data:image/" + fmt + ";base64," + bin);
                  if (selected.output.WIDTH !== undefined) {
                    $("#info-" + id).html(selected.output.WIDTH + "x" + selected.output.HEIGHT + "(" + selected.output.OFFSETX + "," + selected.output.OFFSETY + ") frame:" + selected.output.dpck_seq_id + " lat:" + lat);
                  } else {
                    $("#info-" + id).html("frame:" + selected.output.dpck_seq_id + " lat:" + lat);

                  }


                }
              }
              var cindex = tmpObj.node_name_to_index[elem];

              tmpObj.data[cindex] = d[0];
              if (++cnt == tmpObj.node_multi_selected.length) {

                jqccs.updateGenericTableDataset(tmpObj);
              }
              redrawReference(id,selected.input.REFX,selected.input.REFY,selected.input.REFSX,selected.input.REFSY,selected.input.REFRHO);

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
      console.log("TableFn ");

      var old_tim = {}, counter = {}, tcum = {};

      var cu = tmpObj.elems;
      var template = tmpObj.type;

      var html = '<div class="row">';


      html += '<div class="container-fluid" id="cameraTable"></div>';
      html += '</div>';

      var cu = tmpObj.elems;
      var template = tmpObj.type;
      html += '<div class="row" id="table-space">';
      html += '<div class="box col-md-12">';
      html += '<div class="box-content table-responsive col-md-12">';
      if (cu.length == 0) {
        html += '<p id="no-result-monitoring">No results match</p>';

      } else {
        html += '<p id="no-result-monitoring"></p>';

      }

      html += '<table class="table table-sm table-striped" id="main_table-' + template + '">';
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

        old_tim[cuname] = 0;
        counter[cuname] = 0;
        tcum[cuname] = 0;
      

        html += "<tr class='row_element cuMenu' " + template + "-name='" + cu[i] + "' id='" + cuname + "'>";
        html += '<th scope="row"><div class="custom-control custom-checkbox"><input type="checkbox" onchange="updatelist(this)" class="custom-control-input" name="' + cu[i] + '" id="s-' + cuname + '">';
        html += '<label class="custom-control-label" for="s-' + cuname + '">' + cu[i] + '</label></div><div id="' + cuname + '_INFO"></div></th>';

        //   html += "<td class='name_element'>" + cu[i] + "</td>";
        html += "<td id='" + cuname + "_health_status'></td>";
        html += "<td id='" + cuname + "_system_busy'></td>";
        html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";

        html += "<td id='" + cuname + "_output_TRIGGER_MODE'></td>";
        html += "<td id='" + cuname + "'><select class='select_camera_mode col-md-6' id='" + cuname + "_select_camera_mode' name='" + cu[i] + "'><option value='0'>Continuous</option><option value='3'>TriggeredLOHI</option><option value='4'>TriggeredHILO</option><option value='2'>Pulse</option><option value='5'>No Acquire</option></select></td>";

        html += "<td id='" + cuname + "_output_SHUTTER'></td>";
          
        
        html += "<td id='" + cuname + "'><input class='col-md-6 cucmdattr' id='" + cuname + "_SHUTTER' name='" + cu[i] + "/input/SHUTTER'></input><div><span id='" + cuname + "_SHUTTER_INFO'></span></div></td>";
        

        html += "<td id='" + cuname + "_output_GAIN'></td>";
       
        html += "<td id='" + cuname + "'><input class='col-md-6 cucmdattr' id='" + cuname + "_GAIN' name='" + cu[i] + "/input/GAIN'></input><div><span id='" + cuname + "_GAIN_INFO'></span></div></td>";

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
      var pe = $("#push_enable").is(":checked");
      if (pe && (jchaos.socket != null) && (jchaos.socket.connected)) {
        jchaos.options['io_onconnect'] = (s) => {
          console.log("resubscribe ..")

          jchaos.iosubscribeCU(cu, true);
          jchaos.iosubscribeCU(selectedCams, true);
          onConnectServer();
        }
        jchaos.options['io_onmessage'] = (ds) => {


          let id = jchaos.encodeName(ds.ndk_uid);
          if (ds.dpck_ds_type == 0) {
            let start = Date.now();

            // output
            if (old_tim[id]) {
              if ((counter[id] % 100) == 0) {
                counter[id] = 1;
                tcum[id] =0;
              } else {
                counter[id]++;
              }
              tcum[id] += (start - old_tim[id]);

            }
            


            // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
            $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);
           // let freq = 1000.0 * counter[id] / tcum[id];
            let freq = 1000.0 / (start-old_tim[id]);
            let lat = start - ds.dpck_ats;
            if (ds.WIDTH !== undefined) {
              $("#info-" + id).html(ds.WIDTH + "x" + ds.HEIGHT + "(" + ds.OFFSETX + "," + ds.OFFSETY + ") frame:" + ds.dpck_seq_id + " Hz:" + freq.toFixed(2) + " lat:" + lat);
            } else {
              $("#info-" + id).html("frame:" + ds.dpck_seq_id + " Hz:" + freq.toFixed(2) + " lat:" + lat);

            }
            old_tim[id] = start;

            delete ds.FRAMEBUFFER;
            tmpObj['data'] = [jchaos.chaosDatasetToFullDS(ds)];
            jqccs.updateGenericTableDataset(tmpObj);

          } else {
            tmpObj['data'] = [jchaos.chaosDatasetToFullDS(ds)];
            //console.log("Not output:"+JSON.stringify(tmpObj['data']));
            jqccs.checkLiveCU(tmpObj);
            jqccs.updateGenericTableDataset(tmpObj);

          }
        }
        jchaos.iosubscribeCU(cu, true);



      }

      return html;
    },
    cmdFn: function (tmpObj) {
      console.log("CmdFn ");

      return jqccs.generateGenericControl(tmpObj);

    }
  }
  return chaos;
}
function setReference(cu, x, y, width, height) {
  /*var currzoomm=1.0;
  if(cameraLayoutSettings.hasOwnProperty(key)&&cameraLayoutSettings[key].hasOwnProperty("zoom")){
    currzoomm=cameraLayoutSettings[key]["zoom"];
  }
  x=x/currzoomm;
  y=y/currzoomm;
  width=width/currzoomm;
  height=height/currzoomm;*/
  jchaos.setAttribute(cu, "REFX", String(x.toFixed()), function () {
    jchaos.setAttribute(cu, "REFY", String(y.toFixed()), function () {
      jchaos.setAttribute(cu, "REFSX", String(width.toFixed()), function () {
        jchaos.setAttribute(cu, "REFSY", String(height.toFixed()), function () {
          jqccs.instantMessage("SET REFERENCE " + cu, "(" + x + "," + y + ") " + width + "x" + height, 3000, true);
          redrawReference(jchaos.encodeName(cu),x,y,width,height,0);
        });
      });
    });
  });
}
function executeCameraMenuCmd(tmpObj, cmd, opt) {
  if (cmd == 'set-roi') {

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
  } else if (cmd == "histo-image") {
    showHisto("Histogram " + opt.items[cmd].cu, opt.items[cmd].cu, 1000, 0);
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