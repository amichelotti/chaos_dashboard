var tabContainer = document.getElementById('tableKey').getElementsByTagName('tbody')[0];
var ElemNewUS = document.getElementById('UsNewName');
var radioNewChecked = document.getElementById('radioNewUS');
var USList=document.getElementById('USList');
var buttonAddConfig= document.getElementById('AddConfiguration');

var lusnewname=document.getElementById('lusnewname');
var jsonCUScheme=null;
window.addEventListener("onload",InitPage());
buttonAddConfig.onclick=AddConfigurationToCU;

function isAnEU()
{
    return false;
}

function InitPage() {
    getJsonConfig();
    jchaos.setOptions({"uri":"chaost-hawebui.lnf.infn.it"+":8081","socketio":"chaost-hawebui.lnf.infn.it"+":4000"});
    var USreturnList=jchaos.search("","us",false);
    
    const myArr = USreturnList.toString().split(",");
    
    for (let i=0;i < myArr.length;i++)
    {
        var opt = document.createElement('option');
        opt.value = myArr[i];
        opt.innerHTML = myArr[i];
        USList.appendChild(opt);
    }

    

    
}
function AddConfigurationToCU()
{
    var currentCU = localStorage.getItem('controlUnit');
    if (currentCU == null)
    {
        alert("Cannot add configuration to Undefined Control Unit");
        return "";
    }
    let CUobject = JSON.parse(currentCU);
    let CU=CUcreate(CUobject);
    let configuration={};
    for (var PR in jsonCUScheme.properties)
    {
     
        if (PR == "ndk_uid")
        {
            configuration.ndk_uid=document.getElementById("InstName").value;
        //    alert(configuration[PR]);
            
        }
        else if (PR == "ndk_parent")
        {
            let IsnewUS=document.getElementById("radioNewUS").checked;
            let usName;
            if (IsnewUS == true)
            {
                usName=document.getElementById("UsNewName").value;
            }
            else
            {
                usName=document.getElementById("USList").value;
            }
            configuration.ndk_parent=usName;
            
        }
        else if (PR == "ndk_type")
        {
            if (isAnEU)
                configuration.ndk_type="nt_root";
            else
                configuration.ndk_type="nt_control_unit";
        }
        else if (PR=="control_unit_implementation")
        {
            var ClassName = "SC" + CU.Name + "ControlUnit";
            configuration.control_unit_implementation="::driver::"+CU.getNameSpace()+"::"+ClassName;
            

        }
        else if (PR == "cudk_desc")
        {
            configuration.cudk_desc=document.getElementById("InstDesc").value;
            
        }
        else if (PR =="attribute_value_descriptions")
        {
            configuration.attribute_value_descriptions=[];
        }
        else if (PR="cudk_driver_description")
        {
            let driverJson={};
            driverJson.cudk_driver_description_name=CU.DriverName;
            driverJson.cudk_driver_description_version=document.getElementById("DrvVer").value;
            driverJson.cudk_driver_desc=document.getElementById("DrvDesc").value;
            let initParJson={};
            initParJson.driver_param={};
            initParJson.device_param={};
            driverJson.cudk_driver_description_init_parameter=JSON.stringify(initParJson);
            driverJson.cudk_driver_prop=[];
            configuration.cudk_driver_description=[];
            configuration.cudk_driver_description.push(driverJson);
        }
        else
        {
            var tipo=jsonCUScheme.properties[PR].type;
            let inst=document.getElementById(PR);
            if (inst!= null)
            {
                if (tipo=="string")
                 configuration[PR] =inst.value;
                else if (tipo=="boolean")
                 configuration[PR] = inst.checked;
                else if (tipo=="integer")
                 configuration[PR]=parseInt(inst.value);
            }
            else
             alert("null for " + PR);
           
        }
        UpdateJsonCU("configuration",configuration);
        
       

    }
    //alert(JSON.stringify(configuration));
    
    
}


function getJsonConfig() {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../cu.json', true);
    xhr.responseType = 'text';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
           var obj=JSON.parse(xhr.response);
           setUpConfigVars(obj);
        } else {
            alert("other");
        }
    };
    xhr.send();
   
    
    
   
}
function resolveCheckBox()
{
if (radioNewChecked.checked== true)
    {
        
        lusnewname.innerHTML="UnitServer";
        ElemNewUS.hidden=false;
        USList.hidden=true;
        
    }
    else
    {
        ElemNewUS.hidden= true;
        USList.hidden=false;
        lusnewname.innerHTML="Select UnitServer";
       
        
    }
}
function setUpConfigVars(cudesc)
{
    jsonCUScheme=cudesc;
    for (var PR in cudesc.properties){
        if ((PR == "ndk_uid") ||
         (PR=="ndk_parent") || (PR =="ndk_type") || (PR =="cudk_desc") || (PR == "control_unit_implementation") )
         continue;

        var single=cudesc.properties[PR];
        var description=single.description;
        var tip = document.createElement("span");
        tip.className = "tooltiptext";
        tip.id = "tip";
        tip.innerHTML=description;
        
        if (single.type == 'boolean')
        {
            var defa=single.default;
            var newRow = tabContainer.insertRow();
            // Insert a cell at the end of the row
            var newCell = newRow.insertCell();
            // Append a text node to the cell
            var div=document.createElement("div");
            div.className="tooltip";
            
            var labelFor=document.createElement("label");
            labelFor.htmlFor = PR;
            labelFor.appendChild(document.createTextNode(PR));
            
            var checkbox = document.createElement('input');
            checkbox.type="checkbox";
            checkbox.id=PR;
            checkbox.name=PR;
            checkbox.value = PR;
            if  (defa != null)
               checkbox.checked=defa;
            div.appendChild(labelFor);
            div.appendChild(tip);
            div.appendChild(checkbox);
            newCell.appendChild(div);
            //newCell.appendChild(labelFor);
            //newCell.appendChild(checkbox);
        }
        if (single.type=="integer")
        {
            var defa=single.default;
            var newRow = tabContainer.insertRow();
            var newCell = newRow.insertCell();
            var div=document.createElement("div");
            div.className="tooltip";
            var labelFor=document.createElement("label");
            labelFor.htmlFor = PR;
            labelFor.appendChild(document.createTextNode(PR));
            var textInput=document.createElement("input");
            textInput.className="numberInput";
            textInput.type="number";
            textInput.id=PR;
            textInput.name=PR;
            if (defa != null)
            {
                textInput.value=defa;
            }
            div.appendChild(labelFor);
            div.appendChild(tip);
            div.appendChild(textInput);
            newCell.appendChild(div);
        }
        if (single.type=="string")
        {
            var newRow = tabContainer.insertRow();
            var newCell = newRow.insertCell();
            var div=document.createElement("div");
            div.className="tooltip";
            var labelFor=document.createElement("label");
            labelFor.htmlFor = PR;
            labelFor.appendChild(document.createTextNode(PR));
            var textInput=document.createElement("input");
            //textInput.className="numberInput";
            textInput.type="text";
            textInput.id=PR;
            textInput.name=PR;
            div.appendChild(labelFor);
            div.appendChild(tip);
            div.appendChild(textInput);
            newCell.appendChild(div);
        }
        
        
      }
}