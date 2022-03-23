
var selectedCams = [];
var stateObj = {};
var cameraDriverDesc = {};
var cameraLayoutSettings = {};
var mouseX = 0, mouseY = 0;
var currzoomm = 1.0;
var opt = {};
var pullInterval = null;
var pullIntervalsec = null;
var pullIntervalHealth = null;

const TRIGGER_CONT = 0;
const TRIGGER_PULSE = 1;

const TRIGGER_SOFT= 2;
const TRIGGER_NOACQUIRE = 5;
const TRIGGER_LOHI = 3;
const TRIGGER_HILO = 4;



var selection_canvas = null;//document.getElementById("canvas");
var selection_ctx = null;//canvas.getContext("2d");
//var selection_canvasOffset = null;//$("#canvas").offset();
var selection_startX;
var selection_startY;
var selection_isDown = false;
var selection_isGrab = false;
var selection_isResize = false;

var selection_resizableX = 0;
var selection_resizableY = 0;

var selection_grabbable = false;

var selection_ellipse = {};
function modeToString(val){
  switch (val) {
    case TRIGGER_CONT:
      return "Continuous";
    case TRIGGER_SOFT:
        return "Software";
    case TRIGGER_PULSE:
      return "Pulse";
    case TRIGGER_NOACQUIRE:
      return "No Acquire";
    case TRIGGER_LOHI:
      return "Trigger LOHI";
    case TRIGGER_HILO:
      return "Trigger HILO";
    default:
      return "--";
  }
}
function moveOval(id) {
  selection_ctx.clearRect(0, 0, selection_canvas.width, selection_canvas.height);

  selection_ctx.beginPath();
  selection_ctx.strokeStyle = 'orange';

  selection_ctx.ellipse(selection_ellipse[id]['x'], selection_ellipse[id]['y'], selection_ellipse[id]['w'], selection_ellipse[id]['h'], 0, 0, 2 * Math.PI);
  selection_ctx.stroke();

  selection_ctx.strokeRect(selection_ellipse[id]['x'], selection_ellipse[id]['y'], 2, 2);
  selection_ctx.strokeStyle = 'green';

  // fix 3/4 width
  let h=selection_ellipse[id]['w'] * 0.75;
  selection_ctx.strokeRect(selection_ellipse[id]['x'] - selection_ellipse[id]['w'], selection_ellipse[id]['y'] - h, selection_ellipse[id]['w'] * 2, h * 2);

}
function drawOval(id, x, y) {
  selection_ellipse[id]['x'] = ((selection_startX + x) / 2);
  selection_ellipse[id]['y'] = ((selection_startY + y) / 2);
  selection_ellipse[id]['w'] = Math.abs((selection_startX - x) / 2);
  selection_ellipse[id]['h'] = Math.abs((selection_startY - y) / 2);

  //  console.log("selection x:"+selection_startX+" y:"+(selection_startY + (y - selection_startY) / 2));
  /* selection_ctx.beginPath();

   selection_ctx.moveTo(selection_startX, selection_startY + (y - selection_startY) / 2);
   selection_ctx.bezierCurveTo(selection_startX, selection_startY, x, selection_startY, x, selection_startY + (y - selection_startY) / 2);
   selection_ctx.bezierCurveTo(x, y, selection_startX, y, selection_startX, selection_startY + (y - selection_startY) / 2);
   selection_ctx.closePath();
   selection_ctx.strokeStyle = 'orange';

   selection_ctx.stroke();*/
  moveOval(id);

}

function handleMouseDown(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.which != 1) {
    console.log("not left");
    return;
  }
  let vid = e.currentTarget.id.split('-');
  let id = vid[1];
  if(!mapcamera.hasOwnProperty(id)){
    $("#" + e.currentTarget.id).css("cursor", "default");
    selection_isGrab = false;
    selection_isResize = false;
    selection_resizableX = 0;
    selection_resizableY = 0;
    selection_grabbable = false;
    return;
  }
  if(cameraLayoutSettings&&cameraLayoutSettings.hasOwnProperty(id)&&cameraLayoutSettings[id].hasOwnProperty('rot')&&cameraLayoutSettings[id].rot){
    // no selection on image rotated
    $("#" + e.currentTarget.id).css("cursor", "no-drop");

    selection_isGrab = false;
    selection_isResize = false;
    selection_resizableX = 0;
    selection_resizableY = 0;
    selection_grabbable = false;
    return;
  }
  let offset = $("#" + e.currentTarget.id).offset();

  let selection_offsetX = offset.left;
  let selection_offsetY = offset.top;
  selection_startX = parseInt(e.pageX - selection_offsetX);
  selection_startY = parseInt(e.pageY - selection_offsetY);
  //let ww = $("#" + e.currentTarget.id).width();
  //let hh = $("#" + e.currentTarget.id).height();
 
  let ww = $("#cameraImage-" + id).prop('naturalWidth');
  let hh = $("#cameraImage-" + id).prop('naturalHeight');

  if (selection_grabbable) {
    selection_isGrab = true;
    $("#" + e.currentTarget.id).css("cursor", "grabbing");
    return;
  } else if ((selection_resizableX > 0) || (selection_resizableY > 0)) {
    selection_isResize = true;
    $("#" + e.currentTarget.id).css("cursor", "grabbing");
    return;
  }
  if (selection_isDown == false) {
    
    console.log("start:" + selection_startX + "," + selection_startY);
    selection_ellipse[id] = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      id: id,
      ctx_width: ww,
      ctx_height: hh,
      ctx: e.currentTarget.getContext("2d")
    }

  }
  selection_isDown = true;


  //console.log("position start:"+selection_startX+","+selection_startY);
}

function handleMouseUp(e) {
  selection_isGrab = false;
  selection_isResize = false;
  selection_resizableX = 0;
  selection_resizableY = 0;
  selection_grabbable = false;

  if (!selection_isDown) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  selection_isDown = false;

  //console.log("selection "+JSON.stringify(selection_ellipse[id]));
}

function handleMouseOut(e) {
  selection_grabbable = false;
  selection_isGrab = false;

  if (!selection_isDown) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  selection_isDown = false;
  selection_resizableX = 0;
  selection_resizableY = 0;


  selection_isResize = false;

}

function handleMouseMove(e) {
  let vid = e.currentTarget.id.split('-');
  let id = vid[1];

  if(!mapcamera.hasOwnProperty(id)){
    $("#" + e.currentTarget.id).css("cursor", "default");
    selection_isGrab = false;
    selection_isResize = false;
    selection_resizableX = 0;
    selection_resizableY = 0;
    selection_grabbable = false;
    return;
  }
  if(cameraLayoutSettings&&cameraLayoutSettings.hasOwnProperty(id)&&cameraLayoutSettings[id].hasOwnProperty('rot')&&cameraLayoutSettings[id].rot){
    // no selection on image rotated
    $("#" + e.currentTarget.id).css("cursor", "no-drop");

    selection_isGrab = false;
    selection_isResize = false;
    selection_resizableX = 0;
    selection_resizableY = 0;
    selection_grabbable = false;
    return;
  }
  let offset = $("#" + e.currentTarget.id).offset();

  let selection_offsetX = offset.left;
  let selection_offsetY = offset.top;

  let mouseX = parseInt(e.pageX - selection_offsetX);
  let mouseY = parseInt(e.pageY - selection_offsetY);

  if (!selection_isDown) {
    // check if

    if (selection_ellipse.hasOwnProperty(id)) {
      if (selection_isGrab) {
        selection_ellipse[id]['x'] = mouseX;
        selection_ellipse[id]['y'] = mouseY;
        moveOval(id);
        return;
      } else if (selection_isResize) {
        if (selection_resizableX > 0) {
          if (mouseX > selection_ellipse[id]['x']) {
            if ((selection_ellipse[id]['w'] + (mouseX - selection_resizableX) > 0)) {
              selection_ellipse[id]['w'] = selection_ellipse[id]['w'] + (mouseX - selection_resizableX);

              selection_resizableX = mouseX;
              moveOval(id);
            }

          } else {
            if ((selection_ellipse[id]['w'] - (mouseX - selection_resizableX) > 0)) {
              selection_ellipse[id]['w'] = selection_ellipse[id]['w'] - (mouseX - selection_resizableX);

              selection_resizableX = mouseX;
              moveOval(id);
            }
          }


        } else if (selection_resizableY > 0) {
          if (mouseY > selection_ellipse[id]['y']) {

            if ((selection_ellipse[id]['h'] + (mouseY - selection_resizableY)) > 0) {
              selection_ellipse[id]['h'] = selection_ellipse[id]['h'] + (mouseY - selection_resizableY);
              selection_resizableY = mouseY;
              moveOval(id);
            }
          } else {
            if ((selection_ellipse[id]['h'] - (mouseY - selection_resizableY)) > 0) {
              selection_ellipse[id]['h'] = selection_ellipse[id]['h'] - (mouseY - selection_resizableY);
              selection_resizableY = mouseY;
              moveOval(id);
            }
          }
        }
        return;
      } else {
        selection_resizableX = 0;
        selection_resizableY = 0;


        // check boundary first
        if (((mouseX >= (selection_ellipse[id]['x'] - selection_ellipse[id]['w'] - 5)) && (mouseX <= (selection_ellipse[id]['x'] + selection_ellipse[id]['w'] + 5))) &&
          (mouseY >= (selection_ellipse[id]['y'] - selection_ellipse[id]['h'] - 5)) && (mouseY <= (selection_ellipse[id]['y'] + selection_ellipse[id]['h'] + 5)
          )) {
          // check if in the center
          if ((mouseY >= selection_ellipse[id]['y'] - 5) && (mouseY <= selection_ellipse[id]['y'] + 5) &&
            (mouseX >= selection_ellipse[id]['x'] - 5) && (mouseX <= selection_ellipse[id]['x'] + 5)) {
            $("#" + e.currentTarget.id).css("cursor", "grab");
            console.log("grabmode");
            selection_grabbable = true;
            return;//
          }
        

        //check border vertical
        if (
          (((mouseX >= (selection_ellipse[id]['x'] + selection_ellipse[id]['w'] - 5)) && (mouseX <= (selection_ellipse[id]['x'] + selection_ellipse[id]['w'] + 5))) ||
            (mouseX >= (selection_ellipse[id]['x'] - selection_ellipse[id]['w'] - 5)) && (mouseX <= (selection_ellipse[id]['x'] - selection_ellipse[id]['w'] + 5)))) {
          $("#" + e.currentTarget.id).css("cursor", "ew-resize");
          selection_resizableX = mouseX;
          return;
          //check horizontal
        } else if (((mouseY >= (selection_ellipse[id]['y'] + selection_ellipse[id]['h'] - 5)) && (mouseY <= (selection_ellipse[id]['y'] + selection_ellipse[id]['h'] + 5))) ||
          (mouseY >= (selection_ellipse[id]['y'] - selection_ellipse[id]['h'] - 5)) && (mouseY <= (selection_ellipse[id]['y'] - selection_ellipse[id]['h'] + 5))) {
          $("#" + e.currentTarget.id).css("cursor", "ns-resize");
          selection_resizableY = mouseY;

          return;

        }
      }

      }
    }
    selection_grabbable = false;

    $("#" + e.currentTarget.id).css("cursor", "pointer");

    return;
  }
  $("#" + e.currentTarget.id).css("cursor", "move");

  e.preventDefault();
  e.stopPropagation();


  // console.log("position end:"+mouseX+","+mouseY);


  drawOval(id, mouseX, mouseY);
}


function checkRedrawReference(camid, domid, x, y, sx, sy, r, rt) {
  jchaos.getChannel(camid, 1, (ele) => {
    let xx, yy, sxx, syy, rro, rot;
    xx = (typeof x === 'undefined') ? ele[0].REFX : x;
    yy = (typeof y === 'undefined') ? ele[0].REFY : y;
    sxx = (typeof sx === 'undefined') ? ele[0].REFSX : sx;
    syy = (typeof sy === 'undefined') ? ele[0].REFSY : sy;
    rro = (typeof r === 'undefined') ? ele[0].REFRHO : r;
    rot = (typeof rt === 'undefined') ? ele[0].ROT : rt;

    redrawReference(domid, xx, yy, sxx, syy, rro, rot);

  });
}
function redrawReference(domid, x, y, sx, sy, r, rot,w,h) {
  const canvas = document.getElementById("cameraImageCanv-" + domid);
  const canvasSel = document.getElementById("selectionCanv-" + domid);
 

  if ((canvas == null)||($("#cameraImage-" + domid).length == 0)) {
    return;
  }
  const ctx = canvas.getContext('2d');
  let natwidth = w|| $("#cameraImage-" + domid).prop('naturalWidth');
  let natheight = h || $("#cameraImage-" + domid).prop('naturalHeight');
  if (natwidth > natheight) {
    $("#cameraImage-" + domid).removeClass("chaos_image_v");
    $("#cameraImage-" + domid).removeClass("chaos_image");

    $("#cameraImage-" + domid).addClass("chaos_image_h");
  } else {
    $("#cameraImage-" + domid).removeClass("chaos_image");

    $("#cameraImage-" + domid).removeClass("chaos_image_h");
    $("#cameraImage-" + domid).addClass("chaos_image_v");
  }

  $("#cameraImage-" + domid).on('load', function () {
  $("#cameraImage-" + domid).off('load');

  
  let currzoom = 1.0;
  if (cameraLayoutSettings.hasOwnProperty(domid) && cameraLayoutSettings[domid].hasOwnProperty("zoom")) {
    currzoom = cameraLayoutSettings[domid]["zoom"];
  }
 
  if(currzoom!=1.0){
    $("#zoom_enable-" + domid).html('<i class="fa fa-check-square-o" aria-hidden="true"></i>');
  } else {
    $("#zoom_enable-" + domid).html('<i class="fa fa-square-o" aria-hidden="true"></i>');

  }
  let width = $("#cameraImage-" + domid).width();
  let height = $("#cameraImage-" + domid).height();
  if (canvasSel != null) {
    canvasSel.width = width * currzoom;
    canvasSel.height = height * currzoom;
  }

  
  canvas.width = width * currzoom;
  canvas.height = height * currzoom;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (sx > 0 && sy > 0) {
    //let name=jchaos.encodeName(id);
    let ratiox = canvas.width / natwidth;
    let ratioy = canvas.height / natheight;

   /*
    if (rot % 360 != 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2); // set canvas context to center
      console.log("rot center:(" + canvas.width / 2 + "," + canvas.height / 2 + ") ratiox:" + ratiox + " ratioy:" + ratioy + " ellipse center:(" + x + "," + y + ") rot:" + rot);
      ctx.rotate((-rot) * Math.PI / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2); // set canvas context to center

    }
    */ 
   /*let r=rot%360
    if (r != 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2); // set canvas context to center

      if(r==-90){
        let tmpx=x* ratiox-canvas.width / 2,tmpy=y* ratioy-canvas.height / 2,tmpsx=sx* ratiox,tmpsy=sy* ratioy;
        x = -tmpy , y = tmpx , sx = tmpsy , sy = tmpsx ;
       } else if(r==90){
        let tmpx=x* ratiox,tmpy=y* ratioy,tmpsx=sx* ratiox,tmpsy=sy* ratioy;
        x = tmpy , y = -tmpx , sx = tmpsy , sy = tmpsx ;
       }
    
    } else*/ {
      x = x * ratiox, y = y * ratioy, sx = sx * ratiox, sy = sy * ratioy;
    }
    
    console.log("rot:"+r+" ellipse:("+x+","+y+") sx:"+sx+" sy:"+sy);

    ctx.beginPath();
    ctx.lineWidth = 1;
    //      r=Math.PI/2+r;
    ctx.ellipse(x, y, sx, sy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.beginPath();

    let a = sx, b = sy;
    let cx0 = x - a * Math.cos(r);
    let cy0 = y - a * Math.sin(r);
    let cx1 = x + a * Math.cos(r);
    let cy1 = y + a * Math.sin(r);
    let cmx0 = x + b * Math.sin(r);
    let cmy0 = y - b * Math.cos(r);
    let cmx1 = x - b * Math.sin(r);
    let cmy1 = y + b * Math.cos(r);
    ctx.lineWidth = 1;


    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx1, cy1);
    ctx.moveTo(cmx0, cmy0);
    ctx.lineTo(cmx1, cmy1);

    ctx.closePath();
    ctx.stroke();

    // 
    //   console.log("drawing x:"+x+"y:"+y+" sx:"+sx+" sy:"+sy+ " rho:"+r);
  }

  });

}
function getCameraProps(ele,domid) {
  var pub = {};

  for (k in ele) {

    if (ele[k].hasOwnProperty("pubname")) {
      pub[ele[k].pubname] = ele[k];
      var html = "NA:NA";
      if (ele[k].pubname == "SHUTTER") {
        if (ele[k].max != undefined) {
          $("#"+domid+"_SHUTTER_MAX").html(ele[k].max.toFixed(2));
        }
        if (ele[k].min != undefined) {
          $("#"+domid+"_SHUTTER_MIN").html(ele[k].min.toFixed(2));
        }
      }
      if (ele[k].pubname == "GAIN") {
        if (ele[k].max != undefined) {
          $("#"+domid+"_GAIN_MAX").html(ele[k].max.toFixed(2));
        }
        if (ele[k].min != undefined) {
          $("#"+domid+"_GAIN_MIN").html(ele[k].min.toFixed(2));
        }
      }

    }
    if (k == "SerialNumber") {
      if (ele[k].hasOwnProperty("VAL")) {
        console.log("Serial:" + ele[k].VAL);
      } else if (ele[k].hasOwnProperty("VAL")) {
        console.log("Serial:" + ele[k].VAL);

      }
     // cameraDriverDesc[cul[cnt]] = pub;

    }
  }
};

function getCameraDesc(cul,domid) {
  jchaos.command(cul, { "act_name": "cu_prop_drv_get" }, data => {
    if (data instanceof Array){
      data.forEach((ele, cnt) => {
        getCameraProps(ele);
        // console.log(cul[cnt]+" ->"+JSON.stringify(pub));
  
      });
    } else {
      getCameraProps(data,domid);

    } 
    
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
  var col = opt.camera['cameraPerRow'] || 2;
  var row = opt.camera['maxCameraRow'] || 2;
  var tmpObj = {
    cameraPerRow: col ,
    maxCameraRow: row ,
    displayRatio: opt.camera['displayRatio'] || "4/3"
  };
  // var html = '<table class="table" id="' + tablename + '">';
  var html = "";
  var hostWidth = $(window).width();
  var hostHeight = $(window).height();
  var maxwidth = Math.round((hostWidth - (50 * tmpObj.cameraPerRow)) / tmpObj.cameraPerRow);
  console.log("Camera Array:" + row + "x" + col + " maxwidth:" + maxwidth, "  ratio:" + tmpObj.displayRatio);
  var search="";
  if(opt.hasOwnProperty("search")){
    search=opt['search'];
  }
  var list_cu = jchaos.search(search, "ceu", true, { 'interface': "camera" });
  var cnt = 0;
  for (var r = 0; r < row; r++) {
    html += '<div class="row">';
    //html += '<tr class="d-flex" id=camera-"' + r + '">';

    for (var c = 0; c < col; c++, cnt++) {
      var encoden = r + "_" + c;
      // html += '<td id="camera-' + encoden + '">';
      // html += '<div class="col d-flex flex-column justify-content-center" style="aspect-ratio: '+tmpObj.displayRatio+';">';
      html += '<div class="col-sm">';

      html += '<div style="aspect-ratio: ' + tmpObj.displayRatio + ';width:' + maxwidth + 'px;" class="insideWrapper cameraMenuShort" cuindex="' + encoden + '" id="insideWrapper-' + encoden + '">';
      html += '<img class="chaos_image border" id="cameraImage-' + encoden + '" src="/../img/no_cam_trasp.svg" />';
      html += '<canvas class="coveringCanvas" id="cameraImageCanv-' + encoden + '"/></canvas>';
      html += '<canvas class="coveringCanvas selectionCanv" id="selectionCanv-' + encoden + '"/></canvas>';

      html += '</div>';
      
      html += '<div class="row infocam">';
      html += '<div class="col-sm-6">';
      html += '<select class="camselect" id="select-' + encoden + '" vid="' + encoden + '">';
      html += buildSelected(list_cu, cnt);
      html += '</select>';
      html += '</div>';
    //  html += '<div class="col-sm"><label>Size:</label><span id="size-' + encoden + '" class="minmax">0</span></div>';
      html += '<div class="col-sm"><label>Freq:</label><span id="freq-' + encoden + '" class="minmax">0</span></div>';
      html += '<div class="col-sm"><label>Lat:</label><span id="lat-' + encoden + '" class="minmax">0</span></div>';
      html += '</div>'; //row

      html += '<div class="row infocam">';
      html += '<div class="col-sm-2"><label>State:</label><span id="state-' + encoden + '"><i class="fa fa-question" aria-hidden="true"></i></span></div>';
      html += '<div class="col-sm"><label>Seq:</label><span id="seq-' + encoden + '" class="minmax">0</span></div>';
      html += '<div class="col-sm"><label>M/s:</label><span id="mbs-' + encoden + '" class="minmax">0</span></div>';
      html += '<div class="col-sm"><label>Zoom:</label><span id="zoom_enable-' + encoden + '"><i class="fa fa-square-o" aria-hidden="true"></i></span></div>';
      html += '<div class="col-sm"><label>Rot:</label><span id="rot_enable-' + encoden + '"><i class="fa fa-square-o" aria-hidden="true"></i></span></div>';

      html += '</div>'; //row

      html += '<div class="row infocam">';
      html += '<div class="col-sm-2">Trigger Mode</div>';
      html += '<div class="col-sm-3 maxmin" id="' + encoden + 'TRIGGER_MODE"></div>';
      html += '<div class="col-sm-7" id="' + encoden + '"><select class="select_camera_mode form-control form-control-sm" id="' + encoden + '_select_camera_mode" name="' + encoden + '"><option value="0">Continuous</option><option value="3">TriggeredLOHI</option><option value="4">TriggeredHILO</option><option value="1">Pulse</option><option value="5">No Acquire</option><option value="2">Software</option></select></div>';
      html += '</div>';

      html += '<div class="row infocam">';
      html += '<div class="col-sm-2">Shutter</div>';      
      html += '<div class="col-sm-3 maxmin" id="' + encoden + 'SHUTTER"></div>';
      
      html += '<div class="input-group col-sm-7">';
      html += '<span class="maxmin infocam"  id="' + encoden + '_SHUTTER_MIN">0</span>';
      html += '<input class="cucmdattr form-control form-control-sm" id="' + encoden + '_SHUTTER" name="' + encoden + '/input/SHUTTER"></input>';
      html += '<span class="maxmin infocam"  id="' + encoden + '_SHUTTER_MAX">0</span>';
      html += '</div>';
      html += '</div>';

     
      html += '<div class="row infocam">';
      html += '<div class="col-sm-2">Gain</div>';      
      html += '<div class="col-sm-3 maxmin" id="' + encoden + 'GAIN"></div>';
      
      html += '<div class="input-group col-sm-7">';
      html += '<span class="maxmin infocam"  id="' + encoden + '_GAIN_MIN">0</span>';
      html += '<input class="cucmdattr form-control form-control-sm" id="' + encoden + '_GAIN" name="' + encoden + '/input/GAIN"></input>';
      html += '<span class="maxmin infocam"  id="' + encoden + '_GAIN_MAX">0</span>';
      html += '</div>';
      html += '</div>'; //row


      
    /*  html += '<div class="row">'; 
    
      html += '<div class="col-sm border" id="' + encoden + '_output_TRIGGER_MODE"></div>';
      html += '<div class="col-sm" id="' + encoden + '"><select class="select_camera_mode form-control form-control-sm" id="' + encoden + '_select_camera_mode" name="' + encoden + '"><option value="0">Continuous</option><option value="3">TriggeredLOHI</option><option value="4">TriggeredHILO</option><option value="2">Pulse</option><option value="5">No Acquire</option></select></div>';
      html += '</div>';

      html += '<div class="row">';      
      html += '<div class="col-sm border" id="' + encoden + '"_output_SHUTTER"></div>';
      html += '<div class="col-sm" id="' + encoden + '"><input class="cucmdattr form-control form-control-sm" id="' + encoden + '_SHUTTER" name="' + encoden + '/input/SHUTTER></input><span id="' + encoden + '_SHUTTER_INFO"></span></div>';
      html += '</div>'; //row
      html += '<div class="row">';      
      html += '<div class="col-sm border" id="' + encoden + '_output_GAIN"></div>';
      html += '<div class="col-sm" id="' + encoden + '"><input class="cucmdattr form-control form-control-sm" id="' + encoden + '_GAIN" name="' + encoden + '/input/GAIN"></input><span id="' + encoden + '_GAIN_INFO"></span></div>';
      html += '</div>'; //row
      */
      html += '</div>'; // column (camera)

    }
    // html += "</tr>";
    html += "</div>";// row

  }
  //html += "</table>";

  return html;
}

var cameralist = [], cameralistold = [];
var old_tim = {}, counter = {}, tcum = {};
var old_size={};
function updateCamera(ds) {
  if (ds.dpck_ds_type == 0) {
    // output
    let freq, start, lat,latd;
    let id = mappedcamera[ds.ndk_uid];
    let debug = opt.camera.debug;
    let debug_html = "";
    start = Date.now();
    /*  if (counter[id] == 0) {
        checkRedrawReference(ds.ndk_uid, id);
        counter[id]=1;
      }
  */
    if (debug) {
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
      debug_html = " Hz:" + freq.toFixed(2);
    }
    lat = start - Math.trunc(ds.dpck_hr_ats/1000);
    latd = start - ds.dpck_ats;

    if (ds.FRAMEBUFFER.hasOwnProperty("$binary")) {
      $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER.$binary.base64);
    } else {
      $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);
    }
    /*if (ds.WIDTH !== undefined) {
      $("#size-" + id).html(ds.WIDTH + "x" + ds.HEIGHT );
    }*/
    $("#lat-" + id).html(lat+" "+latd);
    $("#seq-" + id).html(ds.dpck_seq_id);
    $("#"+id+"SHUTTER").html(ds.SHUTTER);
    $("#"+id+"GAIN").html(ds.GAIN);
    $("#"+id+"TRIGGER_MODE").html(modeToString(ds.TRIGGER_MODE));
    if(old_size.hasOwnProperty(id)){
      if((old_size[id].WIDTH!=ds.WIDTH)||(old_size[id].HEIGHT!=ds.HEIGHT)){
        redrawReference(id, ds.REFX, ds.REFY, ds.REFSX, ds.REFSY, ds.REFRHO, -ds.ROT,ds.WIDTH,ds.HEIGHT);
      }
    } else {
      old_size[id]={WIDTH:0,HEIGH:0,MODE:0};
      
    }
    old_size[id]['WIDTH']=ds.WIDTH;
    old_size[id]['HEIGHT']=ds.HEIGHT;
    old_size[id]['TRIGGER_MODE']=ds.TRIGGER_MODE;


  } else if (ds.dpck_ds_type == 1) {
  //  console.log("INPUT :" + JSON.stringify(ds));
    let id = mappedcamera[ds.ndk_uid];
    
      if(ds.hasOwnProperty("ROT")&&(ds.ROT%360)){
        $("#rot_enable-" + id).html('<i class="fa fa-check-square-o" aria-hidden="true"></i>');
      } else {
        $("#rot_enable-" + id).html('<i class="fa fa-square-o" aria-hidden="true"></i>');
    
      }
      if(!old_size.hasOwnProperty(id)){
        old_size[id]={};
      }
      if((!old_size[id].hasOwnProperty('dpck_seq_id'))||(old_size[id].dpck_seq_id<ds.dpck_seq_id)){
          redrawReference(id, ds.REFX, ds.REFY, ds.REFSX, ds.REFSY, ds.REFRHO, -ds.ROT,ds.WIDTH,ds.HEIGHT);
      } 
      old_size[id]['dpck_seq_id']=ds.dpck_seq_id;
        
      
      jqccs.updateSingleNode({input:ds});

  } else if (ds.dpck_ds_type == 4) {
    //HEALTH
    let id = mappedcamera[ds.ndk_uid];
    $("#freq-" + id).html(ds.cuh_dso_prate.toFixed(1));
    var band =  Number(ds.cuh_dso_size) / (1024*1024);

    $("#mbs-" + id).html(band.toFixed(2));
    //jqccs.updateGenericTableDataset(tmpObj);

   let status=ds.nh_status;
   var mode="";
   if(!old_size.hasOwnProperty(id)){
     old_size[id]=ds;
   }
   jqccs.updateSingleNode({health:ds});
   jqccs.updateGenericControl(null, {health:ds});

  if(old_size.hasOwnProperty(id)&&old_size[id].hasOwnProperty("TRIGGER_MODE")){
    switch (old_size[id].TRIGGER_MODE) {
      case TRIGGER_CONT:
        mode= '<i class="fa fa-video-camera"  title="Continuous" aria-hidden="true"></i>';
        break;
      case TRIGGER_PULSE:
        mode = '<i class="fa fa-hand-rock-o" title="Trigger Manual (pulse)" aria-hidden="true"></i>';
        break;
      case TRIGGER_SOFT:
          mode = '<i class="fa fa-band" title="Trigger Software" aria-hidden="true"></i>';
        break;
      case TRIGGER_NOACQUIRE:
        mode = '<i class="fa fa-pause" title="No Acquire" aria-hidden="true"></i>';
        break;
      case TRIGGER_LOHI:
        mode = '<i class="fa fa-level-up" title="Trigger low high"  aria-hidden="true"></i>';
        break;
      case TRIGGER_HILO:
        mode = '<i class="fa fa-level-down" title="Trigger high low" aria-hidden="true"></i>';
        break;
      default:
        mode = '<i class="fa fa-question" title="Trigger Uknown" aria-hidden="true"></i>';
        break;
  }
}
  if(ds.cuh_alarm_lvl){
    if(ds.cuh_alarm_lvl==1){
      mode += '<i class="fa fa-exclamation fa-lg" title="Warning" style="color:orange"</i>';

    } else {
      mode += '<i class="fa fa-exclamation-triangle fa-lg" title="Error" style="color:red"</i>';

    }
  }

  if (status == 'Start') {
    if((old_size.hasOwnProperty(id)&&old_size[id].hasOwnProperty('dpck_ats'))&&(( ds.dpck_ats-  old_size[id]['dpck_ats'])>10000)){
      $("#state-" + id).html('<i class="fa fa-play" style="color:red" title="CU is Started" style="color:green"></i>'+mode);

    } else {
      $("#state-" + id).html('<i class="fa fa-play" style="color:green" title="CU is Started" style="color:green"></i>'+mode);
    }
  } else if (status == 'Stop') {
      $("#state-" + id).html('<i class="fa fa-stop" title="CU is Stopped" style="color:orange"></i>');
  } else if (status == 'Calibrating') {
      $("#state-" + id).html('<i class="material-icons" title="CU is Calibrating" style="color:green">assessment</i>');
  } else if (status == 'Init') {
    $("#state-" + id).html('<i class="material-icons" title="CU is initialized" style="color:yellow">trending_up</i>');

  } else if (status == 'Deinit') {
    $("#state-" + id).html('<i class="material-icons"  title="CU is de-initialized" style="color:red">trending_down</i>');

  } else if (status == 'Fatal Error' || status == 'Recoverable Error') {
    $("#state-" + id).html('<a id="Error-' + id + '" cuname="' + ds.ndk_uid + '" role="button" class="cu-alarm" ><i class="material-icons" style="color:red">cancel</i></a>');
    $("#state-" + id).attr('title', "Device status:'" + status + "' " + ds.nh_lem);

  } else if (status == "Unload") {
    $("#state-" + id).html('<i class="fa fa-power-off" style="color:red" aria-hidden="true"></i>');


  } else if (status == "Load") {
    $("#state-" + id).html('<i class="fa fa-power-off" style="color:green" aria-hidden="true"></i>');

  }
  old_size[id]['dpck_ats']=ds.dpck_ats;

  } else {
    var obj={};
    obj[jchaos.channelToString(ds.dpck_ds_type)]=ds;
    jqccs.updateSingleNode(obj);
    jqccs.updateGenericControl(null, obj);


  }

}
$.fn.save_config = function () {
  
  var obj={
    col: opt.camera['cameraPerRow'] || 2,
    row: opt.camera['maxCameraRow'] || 2,
    w2cam: mappedcamera
  }
  jqccs.getEntryWindow("Save current configuration", "Name", "noname", "Save", function (name) {
    jchaos.variable("camera_view","get",(d)=>{
      if(typeof d !== "undefined"){
        d[name]=obj;
        jchaos.variable("camera_view","set",d,(g)=>{
          console.log("Saving "+name+" "+JSON.stringify(d[name]));
          jqccs.instantMessage("Configuration " + name, "Saved", 2000, true);

        },(error)=>{
          jqccs.instantMessage("ERROR Saving Configuration:" + name, "Error:" + JSON.stringify(error), 5000, false);

        });
      }
    },(error)=>{
      jqccs.instantMessage("ERROR Retriving configuration", "Error:" + JSON.stringify(error), 5000, false);

    });
  }, "Cancel");
}
function mapAssociation(vid,cam){
  $("#cameraImage-" + vid).attr("src", "/../img/chaos_wait_big.gif");
  $("#cameraImage-" + vid).removeClass("chaos_image_v");
  $("#cameraImage-" + vid).removeClass("chaos_image_h");
  $("#cameraImage-" + vid).addClass("chaos_image");
  const canvas = document.getElementById("cameraImageCanv-" + vid);
  if(canvas==null){
    console.error("canvas null "+vid+ " cam:"+cam);
    return;
  }
  const ctx = canvas.getContext('2d');
  const canvasSel = document.getElementById("selectionCanv-" + vid);
  const ctxSel = canvasSel.getContext('2d');
  ctxSel.clearRect(0, 0, canvasSel.width, canvasSel.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(selection_ellipse.hasOwnProperty(vid)){
    delete selection_ellipse[vid];
  }
  if (cam == "NOCAMERA") {
    let id=vid;
    delete mappedcamera[mapcamera[id]];
    delete mapcamera[id];
    $("#state-" + id).html('<i class="fa fa-question" aria-hidden="true"></i>');
    $("#seq-" + id).html(0);
    $("#mbs-" + id).html(0);
    $("#lat-" + id).html(0);
    $("#freq-" + id).html(0);
    $("#size-" + id).html('');
    $("#"+id+"_SHUTTER_MAX").html(0);
    $("#"+id+"_SHUTTER_MIN").html(0);
    $("#"+id+"_GAIN_MAX").html(0);
    $("#"+id+"_GAIN_MIN").html(0);

    $("#zoom_enable-" + id).html('<i class="fa fa-square-o" aria-hidden="true"></i>');
    $("#rot_enable-" + id).html('<i class="fa fa-square-o" aria-hidden="true"></i>');

    $("#cameraImage-" + vid[1]).attr("src", "/../img/no_cam_trasp.svg");

  } else {
    mapcamera[vid] = cam;
    for (var k in mappedcamera) {
      if (mappedcamera[k] == vid) {
        delete mappedcamera[k];
      }
    }
    mappedcamera[cam] = vid;
    getCameraDesc(cam,vid);
    //  mappedcamera[ev.currentTarget.value]['refresh'] = true;
    $("#cameraImage-" + vid).on('load', function () {
      let s = $("#cameraImage-" + vid).attr('src');
      if (s.includes("..")) {
        return;
      }
      //alert($('img.product_image').attr('src'));
      console.log(cam + " = " + vid);
      $("#cameraImage-" + vid).off('load');
      let natwidth = $("#cameraImage-" + vid).prop('naturalWidth');
      let natheight = $("#cameraImage-" + vid).prop('naturalHeight');
      if (natwidth > natheight) {
        $("#cameraImage-" + vid).removeClass("chaos_image_v");
        $("#cameraImage-" + vid).removeClass("chaos_image");

        $("#cameraImage-" + vid).addClass("chaos_image_h");
      } else {
        $("#cameraImage-" + vid).removeClass("chaos_image");

        $("#cameraImage-" + vid).removeClass("chaos_image_h");
        $("#cameraImage-" + vid).addClass("chaos_image_v");
      }
      checkRedrawReference(cam, vid);

    });
    activateMenuShort();
    $("#cameraImageCanv-" + vid).on("mousemove", function (e) {
      var offset = $(this).offset();
      var x = (e.pageX - offset.left) / currzoomm;
      var y = (e.pageY - offset.top) / currzoomm;
      //  console.log("POS "+ev.currentTarget.value+" "+x+","+y)
      mouseX = x;
      mouseY = y;

    });
    // console.log(JSON.stringify(mapcamera));
    // checkRedrawReference(ev.currentTarget.value,vid[1]);

  }
}
function activateCameraFetch(){
  cameralist = [];
  for (var k in mappedcamera) {
    var id = mappedcamera[k];

    cameralist.push(k);
    old_tim[id] = 0;
    counter[id] = 0;
    tcum[id] = 0;

  }
  if (cameralist.length) {

    if (opt.push && (jchaos.socket != null) && (jchaos.socket.connected)) {
      if (cameralistold.length) {
        console.log("Unsubscribe " + JSON.stringify(cameralistold));
        jchaos.iosubscribeCU(cameralistold, false);
      }
      console.log("Subscribe " + JSON.stringify(cameralist));

      jchaos.iosubscribeCU(cameralist, true);
      cameralistold = cameralist;
      jchaos.options['io_onconnect'] = (s) => {
        console.log("resubscribe ..")

        jchaos.iosubscribeCU(cameralist, true);
      }

      jchaos.options['io_onmessage'] = updateCamera;

    } else {
      if (pullInterval != null) {
        clearInterval(pullInterval);
      }
      if (pullIntervalsec != null) {
        clearInterval(pullIntervalsec);
      }
      if (pullIntervalHealth != null) {
        clearInterval(pullIntervalHealth);
      }
      pullInterval = setInterval(() => {
        jchaos.getChannel(cameralist, 0, (vds) => {
          vds.forEach(ele => {
            updateCamera(ele);
          });

        });
        if((opt.push && (jchaos.socket != null) && (jchaos.socket.connected))){
          clearInterval(pullInterval);
        }
      }, opt.camera.cameraRefresh);

      pullIntervalsec = setInterval(() => {
        jchaos.getChannel(cameralist, 1, (vds) => {
          vds.forEach(ele => {
            updateCamera(ele);
          });

        });
        if((opt.push && (jchaos.socket != null) && (jchaos.socket.connected))){
          clearInterval(pullIntervalsec);
        }
      }, 1000);
      pullIntervalHealth = setInterval(() => {
        jchaos.getChannel(cameralist, 4, (vds) => {
          vds.forEach(ele => {
            updateCamera(ele);
          });

        });
        if((opt.push && (jchaos.socket != null) && (jchaos.socket.connected))){
          clearInterval(pullIntervalHealth);
        }
      }, 5000);
    }
  }
}
$.fn.buildCameraArray = function (op) {
  opt = op;
  this.html(buildCameraArray("table-" + this.attr('id'), opt));

  if(opt.hasOwnProperty("map")){
    console.log("map:"+JSON.stringify(opt['map']));
    mappedcamera={};
    mapcamera={};
    var cnt=0;
    for(var k in opt['map']){
      cnt++;
     
      mapAssociation(opt['map'][k],k);
      $('#select-'+opt['map'][k]+' option[value="'+k+'"]').attr("selected",true);
    

    }
    activateCameraFetch();
  }

  $(".camselect").on("change", (ev) => {
    var vid = ev.currentTarget.id.split('-');
    console.log("change " + vid[1] + " :" + ev.currentTarget.value);
    mapAssociation(vid[1],ev.currentTarget.value);
    
    
    activateCameraFetch();
  });
  $(".selectionCanv").mousedown(function (e) {

    if (selection_canvas != e.currentTarget) {
      selection_canvas = e.currentTarget;
      //  selection_canvasOffset=selection_canvas.offset();
      selection_ctx = selection_canvas.getContext("2d");
      console.log("changed canvas " + e.currentTarget.id);
      selection_isDown = false;
    }

    handleMouseDown(e);
  });
  $(".selectionCanv").mousemove(function (e) {
    handleMouseMove(e);
  });
  $(".selectionCanv").mouseup(function (e) {
    handleMouseUp(e);
  });
  $(".selectionCanv").mouseout(function (e) {
    handleMouseOut(e);
  });
  $(".cucmdattr").on("keypress", function(e) {
    if (e.keyCode == 13) {
        var value = e.target.value;
        var attrname = e.target.name;
        var desc = jchaos.decodeCUPath(attrname);
        let cu=mapcamera[desc.cu];
        jchaos.setAttribute(cu, desc.var, value, function() {
            jqccs.instantMessage(cu + " Attribute " + desc.dir, "\"" + desc.var+"\"=\"" + value + "\" sent", 1000, null, null, true)

        }, function() {
          jqccs.instantMessage(cu + " Attribute Error " + desc.dir, "\"" + desc.var+"\"=\"" + value + "\" sent", 1000, null, null, false)

        });

        return false;
    }
    //var tt =prompt('type value');
    return this;
});
$(".select_camera_mode").change(function (e) {
  var value = e.currentTarget.value;
  let cu=mapcamera[e.currentTarget.name];

  console.log("name=" +cu + " value=" + value);
  jchaos.setAttribute(cu, "TRIGGER_MODE", value, function () {
    jqccs.instantMessage("SET MODE " + cu, value, 3000, true);

  },(bad)=>{
    jqccs.instantMessage("Error SETTING MODE " + cu+" err:"+bad, value, 4000, false);

  })
})
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
function cropEnable(cu, tmpObj, func) {
  var encoden = jchaos.encodeName(cu);
  /*if(!cameraLayoutSettings[cu].hasOwnProperty("ccs")){
    cameraLayoutSettings[cu]["css"]={};

  }*/

  $("#cameraImage-" + encoden).cropper({
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'none',
    initialAspectRatio: 1,
    zoomable: true,
    rotatable: true,
    crop: function (event) {
      tmpObj['crop'] = {};
      tmpObj['crop'][cu] = event.detail;
      if (typeof func === "function") {
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
// menu camera app
function activateMenuShort() {
  $.contextMenu('destroy', '.cameraMenuShort');
  $.contextMenu({
    selector: '.cameraMenuShort',
    zIndex: 10000,
    build: function ($trigger, e) {
      var domid = $(e.currentTarget).attr("cuindex");
      var name = mapcamera[domid];
      var cuitem = {};
      console.log(domid + " Menu for :" + name);
      if (cameraLayoutSettings.hasOwnProperty(domid) && cameraLayoutSettings[domid].hasOwnProperty("zoom")) {
        currzoomm = cameraLayoutSettings[domid]["zoom"];
      }

      var ele = jchaos.getChannel(name, 1, null);
      var el = ele[0];
      var selection = selection_ellipse[domid];
      // redrawReference(domid, ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);
      cuitem['sep1'] = "---------";
      cuitem['state'] = {
        "name": "Set Mode..", icon: "fa-plug",
        "items": {
          'no-acquire': {
            name: "No Acquire", cu: name, icon: "fa-pause",
            callback: function (itemKey, opt, e) {
              jchaos.setAttribute(name, "TRIGGER_MODE", TRIGGER_NOACQUIRE.toString(), function () {
                jqccs.instantMessage("SET NO ACQUIRE", name, 3000, true);

              })
            }
          },
          'continuos': {
            name: "Continuous", cu: name, icon: "fa-play",
            callback: function (itemKey, opt, e) {
              jchaos.setAttribute(name, "TRIGGER_MODE", TRIGGER_CONT.toString(), function () {
                jqccs.instantMessage("SET CONTINUOUS ", name, 3000, true);

              })
            }
          },
          'lowhi': {
            name: "Trigger LoHi", cu: name, icon: "fa-sort-asc",
            callback: function (itemKey, opt, e) {
              jchaos.setAttribute(name, "TRIGGER_MODE", TRIGGER_LOHI.toString(), function () {
                jqccs.instantMessage("SET LOW->HI ", name, 3000, true);

              })
            }
          },
          'hilow': {
            name: "Trigger HiLow", cu: name, icon: "fa-sort-desc",
            callback: function (itemKey, opt, e) {
              jchaos.setAttribute(name, "TRIGGER_MODE", TRIGGER_HILO.toString(), function () {
                jqccs.instantMessage("SET HI->LO ", name, 3000, true);

              })
            }
          },
          'manual': {
            name: "Trigger Pulse (manual)", cu: name, icon: "fa-user",
            callback: function (itemKey, opt, e) {
              jchaos.setAttribute(name, "TRIGGER_MODE", TRIGGER_PULSE.toString(), function () {
                jqccs.instantMessage("SET Trigger Pulse ", name, 3000, true);

              })
            }
          }

        }
      };
      cuitem['operation'] = {
        "name": "Operations", icon: "fa-cog",
        "items": {
          'perform-calibration': {
            name: "Perform Calibration", cu: name, icon: "fa-bar-chart",
            callback: function (itemKey, opt, e) {
              jqccs.getEntryWindow("Calibration", "Samples", 10, "Calibrate", function (th) {

              jchaos.command(name, { "act_name": "calibrateNodeUnit","act_msg": {"samples":th}}, function(data) {
                jqccs.instantMessage("Calibration of:" + name, "using "+th+" images", 1000, true);
            }, function(data) {
                jqccs.instantMessage("ERROR Calibrating:" + name, "Error :" + JSON.stringify(data), 5000, false);

            });
            })
              
            }
          },
          'calibration-on': {
            name: "Calibration ON", cu: name, icon: "fa-camera-retro",
            callback: function (itemKey, opt, e) {
          var msg = {
            "act_msg": {"apply_calib":true,"performCalib":false},
            "act_name": "ndk_set_prop"
        };
        jchaos.command(name, msg, function(data) {
            jqccs.instantMessage("Enabling calibration", "OK", 5000, true);

        }, (bad) => {
            jqccs.instantMessage("Error Enabling calibration" , "Error: " + JSON.stringify(bad), 5000, false);

        });
      }},
          'calibration-off': {
            name: "Calibration OFF", cu: name, icon: "fa-camera",
            callback: function (itemKey, opt, e) {
          var msg = {
            "act_msg": {"apply_calib":false,"performCalib":false},
            "act_name": "ndk_set_prop"
        };
        jchaos.command(name, msg, function(data) {
            jqccs.instantMessage("Disabling calibration", "OK", 5000, true);

        }, (bad) => {
            jqccs.instantMessage("Error Disabling calibration" , "Error: " + JSON.stringify(bad), 5000, false);

        });
      }},
          'restart': {
            name: "Restart", cu: name, icon: "fa-refresh",
            callback: function (itemKey, opt, e) {
              jchaos.restart(name, function(data) {
                jqccs.instantMessage("Restarting :" + name, "OK", 1000, true);
            }, function(data) {
              jqccs.instantMessage("ERROR Restarting:" + name, "Error :" + JSON.stringify(data), 5000, false);

            });
              
            }
          }
          
          }
      };
      cuitem['transforms'] = {
        "name": "Trasforms..", icon: "fa-cog",
        "items": {
          'rotate_image':{
            "name":"Rotate Image", icon: "fa-picture-o",
            "items":{
                'rotateimagep90': {
            name: "Rotate Image 90", cu: name, icon: "fa-undo",
            callback: function (itemKey, opt, e) {
              //rotateCamera(name, 90);
              if((!cameraLayoutSettings.hasOwnProperty(domid))||!cameraLayoutSettings[domid].hasOwnProperty('rot')){
                cameraLayoutSettings[domid]={rot:-90};
              } else {
                cameraLayoutSettings[domid]['rot']=(cameraLayoutSettings[domid]['rot']-90)%360;;
              }

              zoomInOut(domid,1.0);
              
            }
          },
          'rotateimagem90': {
            name: "Rotate Image -90", cu: name, icon: "fa-repeat",
            callback: function (itemKey, opt, e) {
              //rotateCamera(name, 90);
              if((!cameraLayoutSettings.hasOwnProperty(domid))||!cameraLayoutSettings[domid].hasOwnProperty('rot')){
                cameraLayoutSettings[domid]={rot:90};
              } else {
                cameraLayoutSettings[domid]['rot']=(cameraLayoutSettings[domid]['rot']+90)%360;
              }

              zoomInOut(domid,1.0);
              
            }
          },'rotateimagereset': {
            name: "Rotate Image Reset", cu: name, icon: "fa-window-restore",
            callback: function (itemKey, opt, e) {
              //rotateCamera(name, 90);
              if((!cameraLayoutSettings.hasOwnProperty(domid))||!cameraLayoutSettings[domid].hasOwnProperty('rot')){
                cameraLayoutSettings[domid]={rot:0};
              } else {
                cameraLayoutSettings[domid]['rot']=0;
              }

              zoomInOut(domid,1.0);
              
            }
          }}},
          'rotate_camera':{
            "name":"Rotate Camera", icon: "fa-camera",
            "items":{
          'rotatep90': {
            name: "Rotate Camera +90", cu: name, icon: "fa-undo",
            callback: function (itemKey, opt, e) {
              var name = opt.items.transforms.items["rotate_camera"].items["rotatep90"].cu;
              rotateCamera(name, 90);
            }
          },
          'rotatem90': {
            name: "Rotate Camera -90", cu: name, icon: "fa-repeat",
            callback: function (itemKey, opt, e) {
              var name = opt.items.transforms.items["rotate_camera"].items["rotatem90"].cu;
              rotateCamera(name, -90);
            }
          },
          'rotateReset': {
            name: "Rotate Camera reset", cu: name, icon: "fa-window-restore",
            callback: function (itemKey, opt, e) {
              var name = opt.items.transforms.items["rotate_camera"].items['rotateReset'].cu;
              rotateCamera(name, 0);
            }
          }}},
          'zoom-reset': {
            name: "Zoom Reset", cu: name, icon: "fa-arrows",
            callback: function (itemKey, opt, e) {
              // var name = opt.items[itemKey].cu;
              zoomInOut(domid, 0);
              redrawReference(domid, ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);
            }
          }
        }
      };
      if (selection && selection.hasOwnProperty('w') && selection.hasOwnProperty('h') && selection.hasOwnProperty('ctx_width') && selection.h && selection.w) {

        cuitem['transforms']['items']['zoom-in'] = {
          name: "Zoom In ", cu: name, icon: "fa-search-plus",
          callback: function (itemKey, opt, e) {
           /* if(cameraLayoutSettings.hasOwnProperty(domid)&&cameraLayoutSettings[domid]['zoom']&&(cameraLayoutSettings[domid]['zoom']>1.0)){
              zoomInOut(domid, (cameraLayoutSettings[domid]['zoom']+1)/cameraLayoutSettings[domid]['zoom']);

            } else {
              zoomInOut(domid, selection.ctx_width / selection.w);
            }*/
            zoomInOut(domid, selection.ctx_width / selection.w);

            redrawReference(domid, ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);
          }
        };

      }
      if (cameraLayoutSettings.hasOwnProperty(domid) && cameraLayoutSettings[domid].hasOwnProperty("zoom") && (cameraLayoutSettings[domid].zoom != 1.0) && (cameraLayoutSettings[domid].hasOwnProperty("zoom_incr"))) {
        cuitem['transforms']['items']['zoom-out'] = {
          name: "Zoom Out ", cu: name, icon: "fa-search-minus",
          callback: function (itemKey, opt, e) {
            if(cameraLayoutSettings.hasOwnProperty(domid)&&cameraLayoutSettings[domid]['zoom_incr']&&(cameraLayoutSettings[domid]['zoom_incr']>0)){
              zoomInOut(domid, 1/cameraLayoutSettings[domid]['zoom_incr']);

            } else if(cameraLayoutSettings.hasOwnProperty(domid)&&cameraLayoutSettings[domid]['zoom']&&(cameraLayoutSettings[domid]['zoom']>1.0)){
              zoomInOut(domid, (cameraLayoutSettings[domid]['zoom']-1)/cameraLayoutSettings[domid]['zoom']);
            } else {
              zoomInOut(domid, selection.w/selection.ctx_width);

            }
            redrawReference(domid, ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);
          }
        }
      }
      cuitem['transforms']['items']['set-auto-reference'] = {
        name: "Set Auto Reference ", cu: name, icon: "fa-magic",
        callback: function (itemKey, opt, e) {

        jqccs.getEntryWindow("Threashold", "Threashold", 10, "Perform Reference", function (th) {
          jchaos.command(name, { "act_name": "calibrateNodeUnit", "act_msg": { "autoreference": true, "threshold": parseInt(th) } }, function (data) {
            jqccs.instantMessage("Performing autoreference:" + name, "Sent", 2000, true);

          }, function (data) {
            jqccs.instantMessage("ERROR Performing autoreference:" + name, "Error:" + JSON.stringify(data), 5000, false);

          });


        }, "Cancel");
      }}
      if (selection && selection.hasOwnProperty('w') && selection.hasOwnProperty('h') && selection.h && selection.w) {
        cuitem['transforms']['items']['set-reference'] = {
          name: "Set Reference ", cu: name, icon: "fa-dot-circle-o",
          callback: function (itemKey, opt, e) {
            let x = selection['x'];
            let y = selection['y'];
            let natwidth = $("#cameraImage-" + domid).prop('naturalWidth');
            let natheight = $("#cameraImage-" + domid).prop('naturalHeight');
            let width = $("#cameraImage-" + domid).width();
            let height = $("#cameraImage-" + domid).height();
            console.log("(" + natwidth + "," + natheight + ")=>(" + width + "," + height + ")");
            let ratiox = natwidth / width;
            let ratioy = natheight / height;
            let currzoom = 1.0;
            if (cameraLayoutSettings.hasOwnProperty(domid) && cameraLayoutSettings[domid].hasOwnProperty("zoom")) {
              currzoom = cameraLayoutSettings[domid]["zoom"];
            }
            ratiox = ratiox / currzoom;
            ratioy = ratioy / currzoom;

            setReference(name, x * ratiox, y * ratioy, selection['w'] * ratiox, selection['h'] * ratioy);
            delete selection_ellipse[domid];

          }
        }
        

          cuitem['transforms']['items']['set-roi'] = {
            name: "Set ROI ", cu: name, icon: "fa-scissors",
            callback: function (itemKey, opt, e) {
              let x = selection['x'] - selection['w'];
              let y = selection['y'] - selection['h'];
              let natwidth = $("#cameraImage-" + domid).prop('naturalWidth');
              let natheight = $("#cameraImage-" + domid).prop('naturalHeight');
              let width = $("#cameraImage-" + domid).width();
              let height = $("#cameraImage-" + domid).height();
              console.log(" ROI (" + natwidth + "," + natheight + ")=>(" + width + "," + height + ")");
              let ratiox = natwidth / width;
              let ratioy = natheight / height;
              let currzoom = 1.0;
              if (cameraLayoutSettings.hasOwnProperty(domid) && cameraLayoutSettings[domid].hasOwnProperty("zoom")) {
                currzoom = cameraLayoutSettings[domid]["zoom"];
              }
              ratiox = ratiox / currzoom;
              ratioy = ratioy / currzoom;
              setRoi(name, selection['w'] * 2 * ratiox, selection['w'] * 1.5 * ratioy, x * ratiox, y * ratioy, () => { });
              delete selection_ellipse[domid];
            }
          }

      }
      cuitem['transforms']['items']['reset-reference'] = {
        name: "Reset Reference ", cu: name, icon: "fa-times-circle-o",
        callback: function (itemKey, opt, e) {
          setReference(name, 0, 0, 0, 0);
          delete selection_ellipse[domid];
        }
      }
      cuitem['transforms']['items']['reset-roi'] = {
        name: "Reset ROI ", cu: name, icon: "fa-square-o",
        callback: function (itemKey, opt, e) {
          resetRoi(name, () => { });
          delete selection_ellipse[domid];
        }
      }
      cuitem['savenode'] = {
        "name": "Save/Restore", icon: "fa-save",
        "items": {
            'save-default': {
                name: "Save Setpoint as Default",icon:"fa-sign-in",
                callback: function(itemKey, opt, e) {
                    jchaos.saveSetPointAsDefault(name, 1, (ok) => {
                        jqccs.instantMessage("New default setpoint saved successfully, will be applied next Initialization", JSON.stringify(ok['attribute_value_descriptions']), 2000, true);
                    }, (bad) => {
                        jqccs.instantMessage("Error setting setpoint:", JSON.stringify(bad), 4000, false);

                    });
                }
            },
            'restore-default': {
              name: "Restore Default",icon:"fa-sign-out",
              callback: function(itemKey, opt, e) {
                jchaos.saveDefaultAsSetpoint(name, (ok) => {
                  jqccs.instantMessage("Default setpoint restored successfully", "", 2000, true);
              }, (bad) => {
                  jqccs.instantMessage("Error restoring setpoint:", JSON.stringify(bad), 4000, false);

              });
              }
          }
            /*,
            'save-readout-default': {
                name: "Save ReadOut as Default",icon:"fa-sign-out",
                callback: function(itemKey, opt, e) {
                    jchaos.saveSetPointAsDefault(name, 0, (ok) => {
                        instantMessage("New default setpoint saved successfully, will be applied next Initialization", JSON.stringify(ok['attribute_value_descriptions']), 2000, true);
                    }, (bad) => {
                        instantMessage("Error setting setpoint:", JSON.stringify(bad), 4000, false);

                    });
                }
            },
            'driver-prop-save': {
                name: "Save Driver properties as Default",icon:"fa-usb",
                callback: function(itemKey, opt, e) {
                    jchaos.command(name, { "act_name": "cu_prop_drv_get" }, function(data) {

                        jqccs.editJSON("Save Driver Prop " + name, data, (json, fupdate) => {

                            var props = [];
                            for (var key in json) {
                                props.push({ name: key, value: json[key].value });
                            }
                            jchaos.node(name, "get", "cu", function(data) {
                                if (data != null) {
                                    if (data.hasOwnProperty('cudk_driver_description')) {
                                        data['cudk_driver_description'][0]['cudk_driver_prop'] = props;
                                        jchaos.node(data.ndk_uid, "set", "cu", data.ndk_parent, data, (okk) => {
                                            instantMessage("Saved driver prop:" + tmpObj.node_multi_selected, "OK", 5000, true);

                                        }, (bad) => {
                                            instantMessage("Saved driver prop:" + tmpObj.node_multi_selected, "Error:" + JSON.stringify(bad), 5000, false);

                                        });

                                    }
                                }
                            })

                        });

                    }, function(data) {
                        instantMessage("Getting driver prop:" + tmpObj.node_multi_selected, "Command:\"" + cmd + "\" :" + JSON.stringify(data), 5000, false);
                        //   $('.context-menu-list').trigger('contextmenu:hide')

                    });
                }
            },
            'node-prop-save': {
                name: "Save CU/EU properties as Default",icon:"fa-wrench",
                callback: function(itemKey, opt, e) {
                    jchaos.command(name, { "act_name": "ndk_get_prop" }, function(data) {

                        jqccs.editJSON("Save CU/EU Properties " + name, data, (json, fupdate) => {

                            var props = [];
                            for (var key in json) {
                                props.push({ name: key, value: json[key].value });
                            }
                            jchaos.node(name, "get", "cu", function(data) {
                                if (data != null) {
                                    data['cudk_prop'] = props;
                                    jchaos.node(data.ndk_uid, "set", "cu", data.ndk_parent, data, (okk) => {
                                        instantMessage("Saved CU/EU properties:" + tmpObj.node_multi_selected, "OK", 5000, true);

                                    }, (bad) => {
                                        instantMessage("Saving CU/EU properties:" + tmpObj.node_multi_selected, "Error:" + JSON.stringify(bad), 5000, false);

                                    });


                                }
                            })

                        });

                    }, function(data) {
                        instantMessage("Getting driver prop:" + tmpObj.node_multi_selected, "Error :" + JSON.stringify(data), 5000, false);
                        //   $('.context-menu-list').trigger('contextmenu:hide')

                    });
                }
            }*/
        }

    };
    cuitem['show'] = {
      "name": "Show",icon:"fa-eye",
      "items": {
          'show-dataset': {
              name: "Show/Set/Plot Dataset",icon:"fa-list",
              callback: function(itemKey, opt, e) {
                  var dashboard_settings = jqccs.initSettings();

                  jqccs.showDataset(name, name, dashboard_settings['generalRefresh']);
              }
          },
          'show-desc': {
              name: "Show Description",icon:"fa-database",
              callback: function(itemKey, opt, e) {
                  jchaos.node(name, "desc", "all", function(data) {

                    jqccs.showJson("Description " + name, data);
                  });
              }
          },
          'show-tags': {
              name: "Show Tags info",icon:"fa-tags",
              callback: function(itemKey, opt, e) {
                  jchaos.variable("tags", "get", null, function(tags) {
                      var names = [];
                      for (var key in tags) {
                          var elems = tags[key].tag_elements;
                          elems.forEach(function(elem) {
                              if (elem == name) {
                                  names.push(tags[key]);
                              }
                          });
                      }
                      if (names.length) {
                          jqccs.showJson("Tags of " + name, names);
                      } else {
                          alert("No tag associated to " + name);
                      }

                  });

              }
          }
         
      }

  };
      /*cuitem['save']= {
        name: "Save Default", cu: name, icon: "fa-save",
        callback: function (itemKey, opt, e) {

          delete selection_ellipse[domid];
        }
      }*/
      cuitem['sep2'] = "---------";
      var scuitem = {};
      for (var k in el) {
        if ((!(k.startsWith("dpck") || k.startsWith("ndk") || k.startsWith("cudk")))&&(k.startsWith("REF")||k.startsWith("ROT")||k.startsWith("WIDTH")||k.startsWith("HEIGHT")||k.startsWith("OFFSET"))) {
          var val = el[k];
          if (typeof el[k] === "object") {
            val = JSON.stringify(el[k]);
          }
          scuitem['set-' + k] = {
            name: "Set " + k, type: "text", value: val, events: (function (k) {
              var events = {
                keyup: function (e) {
                  // add some fancy key handling here?
                  if (e.keyCode == 13) {
                    jchaos.setAttribute(name, k, e.target.value, function () {
                      jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                      if (name == "REFX") {
                        redrawReference(domid, e.target.value);
                      }
                      if (name == "REFY") {
                        redrawReference(domid, undefined, e.target.value);
                      }
                      if (name == "REFSX") {
                        redrawReference(domid, undefined, undefined, e.target.value);
                      }
                      if (name == "REFSY") {
                        redrawReference(domid, undefined, undefined, undefined, e.target.value);
                      }
                      if (name == "REFRHO") {
                        console.log("Setting RHO:" + e.target.value);
                        redrawReference(domid, undefined, undefined, undefined, undefined, e.target.value);
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
      cuitem['fold2'] = {
        "name": "Set..", icon: "fa-wrench",
        "items": scuitem
      };


      cuitem['sep3'] = "---------";

      cuitem['quit'] = {
        name: "Quit",
        callback: function () {
          redrawReference(domid, ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);

        },
        icon: function () {
          return 'context-menu-icon context-menu-icon-quit';
        }

      };


      return { items: cuitem };

    }

  });
}
function rotateCamera(name, rot) {

  if (!cameraLayoutSettings.hasOwnProperty(name)) {
    cameraLayoutSettings[name] = { "rot": 0 };

  }
  if (rot == 0) {
    jchaos.setAttribute(name, "ROT", String(0), function () {
      jqccs.instantMessage("Camera Rotate", "Reset Rotation", 2000, true);
      cameraLayoutSettings[name]["rot"] = 0;
    }, (bad) => {
      jqccs.instantMessage("Camera Rotate", "FAILED: Reset rotation: " + JSON.stringify(bad), 4000, false);

    });
  } else {
    jchaos.getChannel(name, 1, (ds) => {
      if (ds[0].hasOwnProperty("ROT")) {
        var r = ds[0].ROT + rot;
        jchaos.setAttribute(name, "ROT", String(r), function () {
          jqccs.instantMessage("Camera Rotate", "Rotation of " + r + " degree", 2000, true);
          cameraLayoutSettings[name]["rot"] = r;
        }, (bad) => {
          jqccs.instantMessage("Camera Rotate", "FAILED: Rotation of " + r + " degree: " + JSON.stringify(bad), 4000, false);

        });

      }
    })
  }

}
function zoomInOut(name, incr) {
  var currzoom = 1.0;
  if (cameraLayoutSettings.hasOwnProperty(name)) {
    if (cameraLayoutSettings[name].hasOwnProperty("zoom")) {
      currzoom = cameraLayoutSettings[name]["zoom"];
    } else {
      cameraLayoutSettings[name]["zoom"] = currzoom;
      cameraLayoutSettings[name]["orx"] = 0;
      cameraLayoutSettings[name]["ory"] = 0;

    }

  } else {
    cameraLayoutSettings[name] = { "zoom": currzoom, "orx": 0, "ory": 0 };

  }

  if (incr == 0) {
    currzoom = 1.0;
  } else {

    currzoom *= incr;

  }
  currzoom=Math.round(currzoom);
  if(currzoom==0){
    currzoom=1;
  }
  cameraLayoutSettings[name]["zoom"] = currzoom;
  if(incr>1){
    cameraLayoutSettings[name]["zoom_incr"] = incr;
  } else {
    cameraLayoutSettings[name]["zoom_incr"] = 0;

  }


  var encoden = jchaos.encodeName(name);
  var prop = {
    "transform-origin": ((currzoom == 1.0) ? "center" : "0% 0%"),
    "transform": "scale(1)"
  };
  //  $("#insideWrapper-"+encoden).css("transform","scale("+currzoom+")");

  if ((currzoom != 1.0)) {
    const mirinosize = 100;

    var scaleorx; 
    var scaleory; 
    if(incr>1){
      //zoom in
      scaleorx= selection_ellipse[name]['x'];
      scaleory = selection_ellipse[name]['y'];
     
    } else {
      scaleorx= cameraLayoutSettings[name]["orx"];
      scaleory = cameraLayoutSettings[name]["ory"];
    }

    cameraLayoutSettings[name]["orx"] = scaleorx*incr;
    cameraLayoutSettings[name]["ory"] =  scaleory*incr;

    // var or=x + "px " +y+"px";
    let left = $("#cameraImage-" + encoden).offset().left;
    let top = $("#cameraImage-" + encoden).offset().top;
    let w = $("#cameraImage-" + encoden).width();
    let h = $("#cameraImage-" + encoden).height();

    //let w=$("#cameraImage-" + encoden).prop('naturalWidth');
    // let h=$("#cameraImage-" + encoden).prop('naturalHeight');
    //var scaleor = cameraLayoutSettings[name]["orx"] + "px " + cameraLayoutSettings[name]["ory"] + "px";
    //var scaleor = (w/2-left) + "px " + (h/2-top) + "px";
   // var scaleor = "0% 0%";
    
    if (currzoom != 1.0) {
      prop["transform"] = "scale(" + currzoom + "," + currzoom + ")";

    }
    if(cameraLayoutSettings[name].hasOwnProperty('rot')&&(cameraLayoutSettings[name].rot)){
      prop["transform"] = prop["transform"] + " rotate(" + cameraLayoutSettings[name]['rot'] + "deg)";
      $("#cameraImageCanv-" + encoden).css("transform","rotate(" + cameraLayoutSettings[name]['rot'] + "deg");
      $("#selectionCanv-" + encoden).css("transform","rotate(" + cameraLayoutSettings[name]['rot'] + "deg");

    } else{
      $("#cameraImageCanv-" + encoden).css("transform","");
      $("#selectionCanv-" + encoden).css("transform","");

    }
    /* if (currrot != 0) {
       prop["transform"] = prop["transform"] + " rotate(" + currrot + "deg)";
     }
      if (currzoom != 1.0 && currrot != 0) {
       jqccs.instantMessage("WARNING Zoom+Rotate", "Are deprecated! may bring unexpected results, Zoom:" + currzoom + " Rotate:" + currrot + " CSS:" + JSON.stringify(prop), 4000, true);
 
     } else {
       jqccs.instantMessage("Transform", "Zoom:" + currzoom + " Rotate:" + currrot + " CSS:" + JSON.stringify(prop), 2000, true);
     }
 
     */

    $("#cameraImage-" + encoden).css(prop);
    //$("#cameraImageCanv-" + encoden).css(prop);
    let scrollx=(((scaleorx) * incr)- w / 2)//+left;
    let scrolly=(((scaleory) * incr)- h / 2)//+top;

    $("#insideWrapper-" + encoden).scrollLeft(scrollx );
    $("#insideWrapper-" + encoden).scrollTop(scrolly);
    w = $("#cameraImage-" + encoden).width();
    h = $("#cameraImage-" + encoden).height();
    const canvas = document.getElementById("cameraImageCanv-" + encoden);
    const canvasSel = document.getElementById("selectionCanv-" + encoden);
    canvas.width = w * currzoom;
    canvas.height = h * currzoom;
    canvasSel.width = w * currzoom;
    canvasSel.height = h * currzoom;
    /* $("#cameraImageCanv-" + encoden).width(w*currzoom);
     $("#cameraImageCanv-" + encoden).height(h*currzoom);
     $("#selectionCanv-" + encoden).width(w*currzoom);
     $("#selectionCanv-" + encoden).height(h*currzoom);
 */
    console.log(name + "origin:("+scaleorx+","+scaleory+")=>("+((scaleorx) * incr)+","+((scaleory) * incr)+") incr:"+incr+" offset:("+left+","+top+") Zoom:" + currzoom  + " width:" + w + " height:" + h + " calc scroll:("+scrollx+","+scrolly+") scroll:(" + $("#insideWrapper-" + encoden).scrollLeft() + ","+ $("#insideWrapper-" + encoden).scrollTop()+") CSS:" + JSON.stringify(prop));
    cameraLayoutSettings[name]["css"] = prop;

  } else {
    if(cameraLayoutSettings[name].hasOwnProperty('rot')&&cameraLayoutSettings[name].rot){
      prop["transform"] = prop["transform"] + " rotate(" + cameraLayoutSettings[name]['rot'] + "deg)";
      $("#cameraImageCanv-" + encoden).css("transform","rotate(" + cameraLayoutSettings[name]['rot'] + "deg");
      $("#selectionCanv-" + encoden).css("transform","rotate(" + cameraLayoutSettings[name]['rot'] + "deg");

    }else{
      $("#cameraImageCanv-" + encoden).css("transform","");
      $("#selectionCanv-" + encoden).css("transform","");


    }
  
    $("#cameraImage-" + encoden).css(prop);

  //  $("#cameraImage-" + encoden).css("transform", "scale(" + currzoom + ")");
    //$("#cameraImageCanv-" + encoden).css("transform", "scale(" + currzoom + ")");
    console.log(name + " Zoom:" + currzoom);
    $("#insideWrapper-" + encoden).scrollLeft(0);
    $("#insideWrapper-" + encoden).scrollTop(0);
  }
  currzoomm = currzoom;

}
// menu camera inside dashboard
function activateMenu(tmpObj) {
  $.contextMenu('destroy', '.cameraMenu');
  $.contextMenu({
    selector: '.cameraMenu',
    zIndex: 10000,
    build: function ($trigger, e) {
      var name = $(e.currentTarget).attr("cuname");
      var cuitem = {};
      var desc = jchaos.node(name, "desc", "all");
      if (cameraLayoutSettings.hasOwnProperty(name) && cameraLayoutSettings[name].hasOwnProperty("zoom")) {
        currzoomm = cameraLayoutSettings[name]["zoom"];
      }


      cuitem['sep1'] = "---------";
      var tcuitem = {};
      tcuitem['zoom-in'] = {
        name: "Zoom In ", cu: name, icon: "fa-search-plus",
        callback: function (itemKey, opt, e) {
          var name = opt.items['transforms'].items[itemKey].cu;
          var offset = $(this).offset();
          // var x = (e.pageX - offset.left);
          //var y = (e.pageY - offset.top);
          // var x = (e.pageX )/currzoomm;
          // var y = (e.pageY)/currzoomm;
          zoomInOut(name, 2);
        }
      };

      tcuitem['zoom-out'] = {
        name: "Zoom Out ", cu: name, icon: "fa-search-minus",
        callback: function (itemKey, opt, e) {
          var name = opt.items['transforms'].items[itemKey].cu;
          var encoden = jchaos.encodeName(name);
          var offset = $(this).offset();
          // var x = (e.pageX - offset.left);
          // var y = (e.pageY - offset.top);
          //var x = (e.pageX )/currzoomm;
          //var y = (e.pageY )/currzoomm;   

          //    console.log("Zoom out Pos:"+x+","+y +" offleft:"+offset.left+" offtop:"+offset.top);

          zoomInOut(name, 0.5);
        }
      };

      tcuitem['zoom-reset'] = {
        name: "Zoom Reset", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items['transforms'].items[itemKey].cu;
          zoomInOut(name, 0);
        }
      };
      tcuitem['rotatep90'] = {
        name: "Rotate +90", cu: name, icon: "fa-undo",
        callback: function (itemKey, opt, e) {
          // var name = opt.items[itemKey].cu;
          rotateCamera(name, 90);
        }
      };
      tcuitem['rotatem90'] = {
        name: "Rotate -90", cu: name, icon: "fa-repeat",
        callback: function (itemKey, opt, e) {
          // var name = opt.items[itemKey].cu;
          rotateCamera(name, -90);
        }
      };
      tcuitem['rotateReset'] = {
        name: "Rotate reset", cu: name,
        callback: function (itemKey, opt, e) {
          // var name = opt.items[itemKey].cu;
          rotateCamera(name, 0);
        }
      };
      cuitem['transforms'] = {
        "name": "Trasforms..",
        "items": tcuitem
      };
      cuitem['sep2'] = "---------";
      var rcuitem = {};

      rcuitem['select-area'] = {
        name: "Select Area..",
        callback: function (cmd, opt, e) {

          cropEnable(name, tmpObj);

        }
      };
      rcuitem['auto-reference'] = {
        name: "Set Auto Reference",
        callback: function (cmd, opt, e) {
          jqccs.getEntryWindow("Threashold", "Threashold", 10, "Perform Reference", function (th) {
            jchaos.command(name, { "act_name": "calibrateNodeUnit", "act_msg": { "autoreference": true, "threshold": parseInt(th) } }, function (data) {
              jqccs.instantMessage("Performing autoreference:" + name, "Sent", 2000, true);

            }, function (data) {
              jqccs.instantMessage("ERROR Performing autoreference:" + name, "Error:" + JSON.stringify(data), 5000, false);

            });


          }, "Cancel");

        }
      };
      rcuitem['reset-roi'] = {
        name: "Reset ROI", cu: name,
        callback: function (itemKey, opt, e) {
          var name = opt.items['refroi'].items[itemKey].cu;
          var encoden = jchaos.encodeName(name);
          resetRoi(name, () => {
            $("#cameraImage-" + encoden).cropper('destroy');
          });

        }
      };

      if (tmpObj.hasOwnProperty('crop')) {
        var crop_obj = tmpObj['crop'][name];
        if (typeof crop_obj === "object") {
          crop_obj['cu'] = name;
          if (desc.ndk_type != "nt_root") {

            rcuitem['set-roi'] = {
              name: "Set Roi " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj,
              callback: function (cmd, opt, e) {

                var crop_opt = opt.items['refroi']['items'][cmd].crop_opt;
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
          rcuitem['set-reference'] = {
            name: "Set Reference Centroid " + name + " (" + crop_obj.x.toFixed() + "," + crop_obj.y.toFixed() + ") size " + crop_obj.width.toFixed() + "x" + crop_obj.height.toFixed(), crop_opt: crop_obj,
            callback: function (cmd, opt, e) {
              var crop_opt = opt.items['refroi']['items'][cmd].crop_opt;

              var width = crop_opt.width / 2;
              var height = crop_opt.height / 2;
              var x = crop_opt.x + width;
              var y = crop_opt.y + height;
              setReference(crop_opt.cu, x, y, width, height);

              var encoden = jchaos.encodeName(name);
              $("#cameraImage-" + encoden).cropper('destroy');
            }

          };




          rcuitem['exit-crop'] = {
            name: "Exit cropping", cu: name,
            callback: function (itemKey, opt, e) {
              var encoden = jchaos.encodeName(opt.items['refroi'].items[itemKey].cu);
              $("#cameraImage-" + encoden).cropper('destroy');
            }

          };



        }
      }
      cuitem['refroi'] = {
        "name": "Reference/Roi..",
        "items": rcuitem
      };

      cuitem['sep3'] = "---------";
      var scuitem = {};
      var ele = jchaos.getChannel(name, 1, null);
      var el = ele[0];
      redrawReference(jchaos.encodeName(name), ele[0].REFX, ele[0].REFY, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO);

      for (var k in el) {
        if (!(k.startsWith("dpck") || k.startsWith("ndk") || k.startsWith("cudk"))) {
          var val = el[k];
          if (typeof el[k] === "object") {
            val = JSON.stringify(el[k]);
          }
          scuitem['set-' + k] = {
            name: "Set " + k, type: "text", value: val, events: (function (k) {
              var events = {
                keyup: function (e) {
                  // add some fancy key handling here?
                  let domid = jchaos.encodeName(name);
                  if (e.keyCode == 13) {
                    jchaos.setAttribute(name, k, e.target.value, function () {
                      jqccs.instantMessage("Setting ", "\"" + k + "\"=\"" + e.target.value + "\" sent", 3000);
                      if (name == "REFX") {
                        redrawReference(domid, e.target.value);
                      }
                      if (name == "REFY") {
                        redrawReference(domid, undefined, e.target.value);
                      }
                      if (name == "REFSX") {
                        redrawReference(domid, undefined, undefined, e.target.value);
                      }
                      if (name == "REFSY") {
                        redrawReference(domid, undefined, undefined, undefined, e.target.value);
                      }
                      if (name == "REFRHO") {
                        console.log("Setting RHO:" + e.target.value);
                        redrawReference(domid, undefined, undefined, undefined, undefined, e.target.value);
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


      cuitem['fold3'] = {
        "name": "Set..",
        "items": scuitem
      };

      cuitem['sep4'] = "---------";
      cuitem['histo-image'] = {
        name: "Histogram", cu: name,
        callback: function (itemKey, opt, e) {
          showHisto("Histogram " + opt.items[itemKey].cu, opt.items[itemKey].cu, 1000, 0);

        }
      };
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
function rebuildCam(tmpObj){
  var col = opt.camera['cameraPerRow'] || 2;
  var row = opt.camera['maxCameraRow'] || 2;
  var m={};
  var siz=0;
  if (selectedCams instanceof Array) {
  
  for(var r=0;r<row;r++){
    for(var c=0;c<col;c++){
      if(siz<selectedCams.length){
        var id=r+"_"+c;
        m[selectedCams[siz]]=id;
        siz++;
      }
    }
  }
  mappedcamera={};
  mapcamera={};
  opt['map']=m;
  $("#cameraTable").buildCameraArray(opt);
}

}
/*function rebuildCam(tmpObj) {

  var cnt = 0;
  var tablename = "main_table-" + tmpObj.template;

  //var html = '<table class="table table-striped" id="' + tablename + '">';
  var html = "";//'<div class="container">';
  if (selectedCams instanceof Array) {
    var hostWidth = $(window).width();
    var hostHeight = $(window).height();
    var maxwidth = Math.round(hostWidth / tmpObj.maxCameraCol);
    var maxheight = Math.round(hostHeight / tmpObj.cameraPerRow);

    if (opt.push && (jchaos.socket != null) && (jchaos.socket.connected)) {
      jchaos.iosubscribeCU(tmpObj.elems, false);
      jchaos.iosubscribeCU(selectedCams, true);

    }
    console.log("Rebuild Camera Array camera per row:" + tmpObj.cameraPerRow);

    selectedCams.forEach(function (key) {
      var encoden = jchaos.encodeName(key);
      if ((cnt % tmpObj.cameraPerRow) == 0) {
        html += '<div class="row">';
        //  html += '<tr class="row_element" height="' + maxheight + 'px" id=camera-row"' + cnt + '">';
      }
      // html += '<td class="cameraMenu" style="width:' + maxwidth + 'px" id="camera-' + encoden + '" cuname="' + key + '" >'
      //   html += '<div><b>'+key+'</b>';
      html += '<div class="col">';
      html += '<div class="insideWrapper cameraMenu" cuname="' + key + '" id="insideWrapper-' + encoden + '">';


      html += '<img class="chaos_image_max" id="cameraImage-' + encoden + '" cuname="' + key + '" src="/img/no_cam_trasp.svg" />';

      html += '<canvas class="coveringCanvas" id="cameraImageCanv-' + encoden + '"/></canvas>';
      html += '<div>' + key + '</div>';
      html += '<div id="info-' + encoden + '"></div>';
      html += '</div>';


      html += '</div>'; // close col

      cnt++;
      if ((selectedCams.lengt == 1) || ((cnt % tmpObj.cameraPerRow) == 0)) {
        html += '</div>'; // close row
        //  html += '<tr class="row_element" height="' + maxheight + 'px" id=camera-row"' + cnt + '">';
      }

    });


    //  html += "</tr>";
    // html += "</div>"; //container

  }
  //html += "</table>";
  $("#cameraTable").html(html);
  var checkExist = {};
  selectedCams.forEach(function (key) {
    var encoden = jchaos.encodeName(key);

    checkExist[key] = setInterval(function () {

      if ($("#cameraImageCanv-" + encoden).length && $("#cameraImage-" + encoden).length) {
        const canvas = document.getElementById("cameraImageCanv-" + encoden);
        canvas.width = $("#cameraImage-" + encoden).width();
        canvas.height = $("#cameraImage-" + encoden).height();
        console.log(key + " canvas " + canvas.width + "x" + canvas.height);
        activateMenu(tmpObj);
        $("#cameraImageCanv-" + encoden).on('dblclick', function (e) {
          var offset = $(this).offset();
          if (cameraLayoutSettings.hasOwnProperty(key) && cameraLayoutSettings[key].hasOwnProperty("zoom")) {
            currzoomm = cameraLayoutSettings[key]["zoom"];
          }
          var x = (e.pageX - offset.left) / currzoomm;
          var y = (e.pageY - offset.top) / currzoomm;

          // var x = event.pageX - this.offsetLeft;
          // var y = event.pageY - this.offsetTop;
          let natw = $("#cameraImage-" + encoden).prop('naturalWidth');
          let nath = $("#cameraImage-" + encoden).prop('naturalHeight');
          x = x * (natw / this.width);
          y = y * (nath / this.height);
          //var natw=$(this).naturalWidth;
          //var nath=$(this).naturalHeight;
          // var offx=this.naturalWidth;
          // var offy=this.naturalHeight;
          console.log("Natural dim:" + natw + "," + nath + " Rendered " + this.width + "," + this.height);
          jqccs.confirm("Reference Change", "Do you want change to :" + x.toFixed(1) + "x" + y.toFixed(1) + " Zoom:" + currzoomm, "Ok", function () {

            jchaos.setAttribute(key, "REFX", x.toString(), (ok) => {
              jchaos.setAttribute(key, "REFY", y.toString(), ok => {
                console.log(key + " X Coordinate: " + x + " Y Coordinate: " + y);
                jchaos.getChannel(key, 1, (ele) => {
                  redrawReference(encoden, x, y, ele[0].REFSX, ele[0].REFSY, ele[0].REFRHO, ele[0].ROT);

                });
              });
            });
          }, "Cancel");

        });

        $("#cameraImageCanv-" + encoden).on('mousemove', function (e) {

          var offset = $(this).offset();
          // console.log("POS:"+e.pageX+","+e.pageY);
          var x = (e.pageX - offset.left) / currzoomm;
          var y = (e.pageY - offset.top) / currzoomm;
          //let natw=$("#cameraImage-"+encoden).prop('naturalWidth');
          //let nath=$("#cameraImage-"+encoden).prop('naturalHeight');
          mouseX = x;
          mouseY = y;

          // console.log("X:"+x+" Y:"+y + "currzoom:"+currzoomm );
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

}*/
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
function resetRoi(cu, func) {
  var input = jchaos.getChannel(cu, 1)[0];
  if ((!input.hasOwnProperty("REFABS")) || (input["REFABS"] == false)) {
    var refx = -1, refy = -1;
    if (input.hasOwnProperty("REFSX") && (input["REFSX"] > 0)) {
      refx = input["REFX"] + input["OFFSETX"];

    }
    if (input.hasOwnProperty("REFSY") && (input["REFSY"] > 0)) {
      refy = input["REFY"] + input["OFFSETY"];
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

  var refx = -1, refy = -1, offx = parseInt(x), offy = parseInt(y);
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
function getWidget(options) {
  if (options) {
    opt = options;
  }
  var chaos =
  {
    dsFn: {
      output: {
        TRIGGER_MODE: function (val) {
          return modeToString(val);
          

        }
      }
    },
    tableClickFn: function (tmpObj, e) {
      //  rebuildCam(tmpObj);
      console.log("Table click");
    /*  jchaos.getChannel(tmpObj.node_selected, -1, function (cu) {
        var cindex = tmpObj.node_name_to_index[tmpObj.node_selected];
        if(!tmpObj.hasOwnProperty("data")){
          tmpObj['data']={};
        }
        tmpObj.data[cindex] = cu[0];
        jqccs.updateGenericTableDataset(tmpObj);

        jqccs.updateGenericControl(tmpObj, cu[0]);
      })
*/
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

      if ((opt.push == false) || (jchaos.socket == null) || (jchaos.socket.connected == false)) {

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
                  let now=Date.now() 
                  let latd = now- Math.trunc(selected.output.dpck_hr_ats/1000);
                  let latc = now- selected.output.dpck_ats;

                  // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);
                  $("#cameraImage-" + id).attr("src", "data:image/" + fmt + ";base64," + bin);
                  if (selected.output.WIDTH !== undefined) {
                    $("#info-" + id).html(selected.output.WIDTH + "x" + selected.output.HEIGHT + "(" + selected.output.OFFSETX + "," + selected.output.OFFSETY + ") frame:" + selected.output.dpck_seq_id + " lat:" + latd +" "+latc);
                  } else {
                    $("#info-" + id).html("frame:" + selected.output.dpck_seq_id + " lat:" + latd +" "+latc);

                  }


                }
              }
              var cindex = tmpObj.node_name_to_index[elem];

              tmpObj.data[cindex] = d[0];
              if (++cnt == tmpObj.node_multi_selected.length) {

                jqccs.updateGenericTableDataset(tmpObj);
              }
              redrawReference(id, selected.input.REFX, selected.input.REFY, selected.input.REFSX, selected.input.REFSY, selected.input.REFRHO, selected.input.ROT,selected.output.WIDTH,selected.output.HEIGHT);

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
      var html = '<div class="row" id="cameraTable"></div>';
      html+=jqccs.generateGenericTable(tmpObj,true);
      return html;
      var old_tim = {}, counter = {}, tcum = {};

      var cu = tmpObj.elems;
      var template = tmpObj.type;

      //var html = '<div class="row">';


      // html += '<div class="container-fluid" id="cameraTable"></div>';
      var html = '<div class="row" id="cameraTable"></div>';


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
      /*html += '<th><div class="custom-control custom-checkbox"><input type="checkbox" onchange="updatelist(this)" class="custom-control-input" id="selectAll">';
      html += '<label class="custom-control-label" for="tableDefaultCheck1">Select All</label></div></th>';
*/
      html += '<th>Name CU</th>';
      html += '<th colspan="3">Status</th>';
      html += '<th colspan="2">Mode</th>';
      html += '<th colspan="2">Shutter</th>';
      html += '<th colspan="2">Gain</th>';
      html += '<th colspan="2">Brightness</th>';
      html += '<th colspan="2">Error</th>';
      html += '<th colspan="1">Hz</th>';
      html += '<th colspan="1">KB/s</th>';
      html += '<th colspan="1">Lat(ms)</th>';

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
        html += "<td id='" + cuname + "'><select class='select_camera_mode form-control form-control-sm' id='" + cuname + "_select_camera_mode' name='" + cu[i] + "'><option value='0'>Continuous</option><option value='3'>TriggeredLOHI</option><option value='4'>TriggeredHILO</option><option value='1'>Pulse</option><option value='5'>No Acquire</option><option value='2'>Software</option></select></td>";

        html += "<td id='" + cuname + "_output_SHUTTER'></td>";


        html += "<td id='" + cuname + "'><input class='cucmdattr form-control form-control-sm' id='" + cuname + "_SHUTTER' name='" + cu[i] + "/input/SHUTTER'></input><div><span id='" + cuname + "_SHUTTER_INFO'></span></div></td>";


        html += "<td id='" + cuname + "_output_GAIN'></td>";

        html += "<td id='" + cuname + "'><input class='cucmdattr form-control form-control-sm' id='" + cuname + "_GAIN' name='" + cu[i] + "/input/GAIN'></input><div><span id='" + cuname + "_GAIN_INFO'></span></div></td>";

        html += "<td id='" + cuname + "_output_BRIGHTNESS'></td>";
        html += "<td id='" + cuname + "'><input class='cucmdattr form-control form-control-sm' id='" + cuname + "_BRIGHTNESS' name='" + cu[i] + "/input/BRIGHTNESS'></input></td>";

        html += "<td title='Device alarms' id='" + cuname + "_system_device_alarm'></td>";
        html += "<td title='Control Unit alarms' id='" + cuname + "_system_cu_alarm'></td>";
        html += "<td id='" + cuname + "_health_prate'></td>";
        html += "<td id='" + cuname + "_health_pband'></td>";
        html += "<td id='" + cuname + "_output_dpck_ts_diff'></td></tr>";


      });

      html += '</table>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      if (opt.push && (jchaos.socket != null) && (jchaos.socket.connected)) {
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
                tcum[id] = 0;
              } else {
                counter[id]++;
              }
              tcum[id] += (start - old_tim[id]);

            }



            // $("#cameraName").html('<font color="green"><b>' + selected.health.ndk_uid + '</b></font> ' + selected.output.dpck_seq_id);

            $("#cameraImage-" + id).attr("src", "data:image/png" + ";base64," + ds.FRAMEBUFFER);

            // let freq = 1000.0 * counter[id] / tcum[id];
            let freq = 1000.0 / (start - old_tim[id]);
            let latd = start- Math.trunc(ds.dpck_hr_ats/1000);
            let latc = start- ds.dpck_ats;            
            if (ds.WIDTH !== undefined) {
              $("#info-" + id).html(ds.WIDTH + "x" + ds.HEIGHT + "(" + ds.OFFSETX + "," + ds.OFFSETY + ") frame:" + ds.dpck_seq_id + " Hz:" + freq.toFixed(2) +  " lat:" + latd +" "+latc);
            } else {
              $("#info-" + id).html("frame:" + ds.dpck_seq_id + " Hz:" + freq.toFixed(2) + " lat:" + latd +" "+latc);

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
          redrawReference(jchaos.encodeName(cu), x, y, width, height, 0);
        });
      });
    });
  });
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