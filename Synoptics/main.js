//Options
var tableborderVisible=0;

class OpenCUButton extends HTMLButtonElement
{
	constructor() 
	{
		HTMLButtonElement();
		this.CUName="ciao";
	}
}

function myFunction( name)
{
	
	let dims="height=300,width=420";
	var gg= window.open("",name,dims);
	gg.document.title=name;
	
	
}




function MakeSinoptic()
{

//Reading from DB
jchaos.setOptions({"uri":"chaost-hawebui.lnf.infn.it"+":8081","socketio":"chaost-hawebui.lnf.infn.it"+":4000"});
var syn=jchaos.variable("WindowsSynoptics","get").synopticList[3];
//Setting useful variables
var Iheight=syn.description.imageHeight;
var Iwidth=syn.description.imageWidth;
var Wheight=Iheight+20;
var Wwidth=Iwidth+20;
var numRows= syn.description.numRows;
var numCols= syn.description.numCols;
var urlImg="data:image/png;base64,"+syn.description.FRAMEBUFFER.binary.base64  ;
var Controls= syn.description.Controls;

//CREATING THE NEW WINDOW

var strdim="height="+Wheight+",width="+Wwidth;
var SynWin= window.open("",syn.name,strdim);
SynWin.document.write("<head></head><body id = \"body\" style = \"text-align:center;\"><table id = \"syn\"></table></body>");
SynWin.document.title=syn.name;
//creating style element
var style = document.createElement('style');
style.type = 'text/css';
SynWin.document.getElementsByTagName('head')[0].appendChild(style);

//CREATING TABLE
var table=SynWin.document.getElementById('syn');


for (var rw=0; rw < numRows; rw++)
{
	
	let row =table.insertRow();
	for (let col=0; col < numCols; col++)
	{
		let cell = row.insertCell();
		cell.id = rw+"_"+col;
		//var td= SynWin.document.getElementById("11_12").appendChild(btn);
	}
}
table.style.width=Iwidth + "px";
table.style.height=Iheight+"px";
var pxCellH = Math.floor(Iheight / numRows);


//styling the table class;
var lll="border-spacing:0;table-layout: fixed; background-size:"+Iwidth + "px "+Iheight+"px; ";
var bs=".cssClass {"+ lll+" background-repeat: no-repeat; background-image: url("+urlImg+");}" ;
style.innerHTML = bs.replace(/\n/g, '');
 
table.className = 'cssClass';
table.border = tableborderVisible;



var tdstyle="td {align:center; line-height:"+pxCellH+"px; overflow: hidden; border-spacing: 0;margin: 0; padding: 0; }";
var  cssButtons=".btn { background-color: Peru; border-radius: 50%; border-width: 0px; margin:0px 0px; height:70%; width: 70%; }"; 
style.innerHTML+=cssButtons + tdstyle ;



for (var i=0; i < Controls.length;++i)
{
  var item = Controls[i];
  var auxiliaryCss="";
	if (item.description.Type == "OpenCUButton")
	{
		let ctrl = document.createElement('button');
		
		
		let strID = item.row+"_"+item.col;
		let secClass= "B"+strID;
		let cssDescr= ".B"+strID+" { background-color: " +item.description.Color+ ";}";
		ctrl.className = "btn "+secClass;
		ctrl.title=item.description.CUName;
		auxiliaryCss+=cssDescr;
		
		//ctrl.setAttribute("onclick",function(){myFunction(ctrl.title)});
		ctrl.addEventListener('click', function(){myFunction(ctrl.title)});
		//alert("appending child "+ctrl.title);
	    SynWin.document.getElementById(strID).appendChild(ctrl);
	}
	style.innerHTML+=auxiliaryCss;
}

}
