/*
In about:config den Wert von
greasemonkey.fileIsGreaseable
auf true setzen.
*/
alert('aloo');
var now = new Date();
now.setTime(now.getTime() + 1000*60*60*24*7);
var today= (now.getDate() +'.'+ (now.getMonth() + 1) +'.'+ now.getFullYear());
var moverSize = 10;
var theForm;
var theFiller;
var ismoving = false;
var theElement;
var theTimer;
var theFillAndGoDisabled = 0;
var isMobile = false;
console.log('ddd');
Object.extend = function(destination,source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}

function deserialize(name, def) {
	var ret=eval(GM_getValue(name, (def || '({})')));
  return ret;
}

function serialize(name, val) {
  GM_setValue(name, uneval(val));
}



function initFillAndGo() {	
	if (theForm = findForm())
	{
		theFiller = 'f' + getFormName(theForm).charAt(0).toUpperCase() + getFormName(theForm).substr(1) + '()';
	}
	else
	{
		doTheStop();
		return;
	}
	
	var widthInput= "160px";
	var width= "80px";
	
	var div = document.createElement("div");
	theElement = div;

	with (div.style)
	{
		position = "fixed";
		right = "10px";
		top = "10px";
		padding = "10px";
		border = "4px solid #005AAC";
		backgroundColor = "silver";
		opacity = "0.87";
		zIndex = "5000";
		width = width;
		fontFamiliy = "Arial";
	}

	var selectOptions   = document.createElement("select");
	selectOptions.style.width = widthInput;
	selectOptions.style.backgroundColor = "white";
	selectOptions.style.marginLeft = "5px";

	var hasSelected=false;
	for (var i in theOptions) {
		var opt   = document.createElement("option");
		opt.value = i;
		opt.innerHTML = i;
		if(i == theParams.selectedOption){
			opt.selected=true;
			hasSelected=true;
		}
		selectOptions.appendChild(opt);
	}
	
	if(!hasSelected){
		theParams.selectedOption=theOptions[0];
	}
	
	selectOptions.addEventListener('change', function(event) { changeOptions(selectOptions); }, false );

	div.appendChild(selectOptions);

	var email   = document.createElement("input");
	email.type  = "text";
	email.value = theParams.email;
	email.style.width = widthInput;
	email.style.backgroundColor = "white";
	email.style.marginLeft = "5px";

	email.addEventListener('keyup', function(event) { changeEmail(email); }, false );
	div.appendChild(email);
	
	
	
	
	
	
	
	
	
	
	var fill   = document.createElement("input");
    fill.type  = "button";
    fill.value = "Fill";
    fill.style.width = width;
    fill.style.fontWeight = "bold";
    fill.style.backgroundColor = "white";
    fill.style.marginLeft = "5px";

    fill.addEventListener('click', function(event) { 
	(1); document.getElementById('fillAndGo').style.visibility='hidden'; theFillAndGoDisabled = 1; }, false );
    
        //mobi/desktop toggle
    var deviceToggle = fill.cloneNode(false);
    deviceToggle.value = "Device";
    deviceToggle.addEventListener('click', function(event) {
        
        var wrap = document.getElementById("c24s"),
            query = {},
            newHref,
            makeQueryObj = function(){
                var s1,
                    search = window.location.search;
                
                
                s1 = search.substring(1, search.length).split("&");
                
                s1.forEach(function(param){
                    var s2;
                    s2 = param.split("=");
                    query[s2[0]] = s2[1];
                    
                });

                return query;
            },
            
            makeQueryString = function(q){
                var name,
                    ret="?";
                
                for(name in q){
                    if(q[name]){
                        ret += name + "=" + q[name]+"&";
                    }
                }
                
                return ret.substring(0, ret.length -1);
                };
            
        query = makeQueryObj();
        if(wrap.className.indexOf("gSizer") > -1){ //mobi
            query.deviceoutput = "desktop";
        }else{ //desktop
            query.deviceoutput = "mobile";
        }
        
        window.location.search = makeQueryString(query);
        
    }, false );
    
    div.appendChild(deviceToggle);
    div.appendChild(fill);

	var justgo = fill.cloneNode(false);
	justgo.value = "Go";
	justgo.addEventListener('click', function(event) { fillAndGo(2); }, false );
	div.appendChild(justgo);

	var fillgo = fill.cloneNode(false);
	fillgo.value = "Fill & Go";
	fillgo.id = "fillAndGo";
	fillgo.addEventListener('click', function(event) { fillAndGo(3); }, false );

	div.appendChild(fillgo);
	
	document.body.appendChild(div);
	div2 = document.createElement("div");
	div2.style.width = moverSize + "px";
	div2.style.height = moverSize + "px";
	div2.style.position = "absolute";
	div2.style.left = "-3px";
	div2.style.top  = "-3px";
	div2.style.background = "yellow";
	
	div2.addEventListener('mousedown', function(event) { startmove(); }, false);
	div2.addEventListener('mouseup',   function(event) { stopmove();  }, false);	
	document.body.addEventListener('mousemove', function(event) { domove(event);    }, false);
	div.appendChild(div2);
	
	div.appendChild(createPageDescription());
	var div3 = document.createElement("div");
	div3.style.textAlign ='right';
	div.appendChild(div3);
	
	var selectVnName = document.createElement("select");
	for (var ijk in theVnNames)
	{
		var optionForVnName = document.createElement("option");
		optionForVnName.value = theVnNames[ijk];
		optionForVnName.innerHTML = theVnNames[ijk];
		if(theVnNames[ijk] == theParams.vnName)
		{
			optionForVnName.selected=true;
		}
		selectVnName.appendChild(optionForVnName);
	}
	selectVnName.addEventListener('change', function(event) { changeVnName(selectVnName); }, false );
	
	div3.appendChild(selectVnName);
	
	var selectForRun = document.createElement("select");
	selectForRun.style.fontFamily="monospace";
	selectForRun.style.fontSize="1.2em";
	selectForRun.style.whiteSpace="pre";
	for (var iii in theRunOptions)
	{
		var optionForRun = document.createElement("option");
		optionForRun.value = iii;
		optionForRun.innerHTML = theRunOptions[iii].replace(/ /g, "\u00a0");
		optionForRun.style.whiteSpace="pre";
		if(iii == theParams.runTo)
		{
			optionForRun.selected=true;
		}
		selectForRun.appendChild(optionForRun);
	}
	selectForRun.addEventListener('change', function(event) { changeRunOptions(selectForRun); }, false );
	div3.appendChild(selectForRun);
	var runButton = fill.cloneNode(false);
	runButton.value = "Run";
	runButton.addEventListener('click', function(event) { doTheRun(); }, false );
	div3.appendChild(runButton);
	
	var stopButton = fill.cloneNode(false);
	stopButton.value = "Stop";
	stopButton.addEventListener('click', function(event) { doTheStop(); }, false );

	div3.appendChild(stopButton);

	createStageInfo();
}

function doTheRun()
{
	theParams.isRunning = (theParams.runTo != "none");
	serialize(theParamsName,theParams);
	if (theParams.isRunning)
	{
		
		fillAndGo(theFillAndGoDisabled ? 2 : 3);
	}
}

function doTheStop()
{
	window.clearTimeout(theTimer)
	theParams.isRunning = 0;
	serialize(theParamsName,theParams);
	if( theElement ) {
		theElement.style.backgroundColor = 'silver';
	}
}

function getVorname(name)
{
	vorname = theParams.vnName;
	if (! vorname)
	{
		vorname = "testei";
	}
	ix = vorname.lastIndexOf(' ');
	if (ix >= 0)
	{
		vorname = vorname.substring(0, ix);
	}
	return vorname;
}

function getFamilienname(name)
{
	famname = theParams.vnName;
	if (! famname)
	{
		famname = "testei";
	}
	ix = famname.lastIndexOf(' ');
	if (ix >= 0)
	{
		famname = famname.substring(ix + 1);
	}
	return famname;
}

function changeVnName(selectElement)
{
	theParams.vnName = selectElement.value;
	serialize(theParamsName,theParams);
	
	theData[vornameField]      = [0,"value",getVorname(theParams.vnName)];
  	theData[nameField] = [0,"value",getFamilienname(theParams.vnName)];
}

function changeRunOptions(selectElement)
{
	theParams.runTo=selectElement.value;
	serialize(theParamsName,theParams);
}

function startmove(event)
{
	theElement.style.borderColor = "orange";
	ismoving = true;
}

function stopmove(event)
{
	theElement.style.borderColor = "#005AAC";
	ismoving = false;
}

function domove(event)
{
	if (ismoving)
	{
		theElement.style.borderColor = "yellow";
		theElement.style.left = "" + (event.clientX - moverSize/2) + "px";
		theElement.style.top = "" + (event.clientY - moverSize/2) + "px";
		theElement.style.right = "inherit";
	}
}

function createPageDescription(){
	var	div=document.createElement("span");
	with (div.style)
	{
		fontSize="13px";
		fontFamiliy = "Courier";
	}	
	
	var page="<span style='color:red;'>Unbekannt</span>";
	var b2b="<span style='color:red;'>Unbekannt</span>";
	var werbepartner="<span style='color:red;'>Unbekannt</span>";
	var list=document.getElementsByName("cpid");
	if(list.length>0){
			werbepartner=list[0].value;
	}
	
	var list=document.getElementsByName("submitPage");
	if(list.length>0){
			page=list[0].value;
			var p=page.lastIndexOf('/');
			if(p){
				page=page.substring(p+1);
			}
	}
	
	
	var list=document.getElementsByName("b2bid");
	if(list.length>0){
			b2b=list[0].value;
			if(theOptions[theParams.selectedOption] 
			&& theOptions[theParams.selectedOption].b2b 
			&& theOptions[theParams.selectedOption].b2b!=b2b){
				b2b="<span style='color:red;'>"+b2b+"</span>("+theOptions[theParams.selectedOption].b2b+")";
			}
	}
	
	var html="<br/>PAGE:"+page+"&nbsp;CP:"+werbepartner+"&nbsp;B2B:"+b2b;
	
	if (document.getElementById("c24debugfirstactionreferenz"))
	{
		html += " 1stAction: <b ondblclick='var selection = window.getSelection();var range = document.createRange();range.selectNodeContents(this);selection.removeAllRanges();selection.addRange(range);'>" + document.getElementById("c24debugfirstactionreferenz").innerHTML + "</b>";
	}

	div.innerHTML=html;
	
	
	return div;
}

function changeEmail(elem){
	theParams.email=elem.value;
	theData[emailField]=[0,"value",theParams.email];
	theData[emailRepeatField]=[0,"value",theParams.email]

	serialize(theParamsName,theParams);
}

function changeOptions(elem){
	theParams.selectedOption=elem.value;
	serialize(theParamsName,theParams);
}

function fillAndGo(go)
{
	if (go & 1)
	{
        var goOn = preFillForm(getFormName(theForm));
        if( !goOn ) 
        {
            return;
        }
        fillFieldList();
	}
	if (go & 2)
	{
		window.setTimeout(doGo, 250);
	}
} 

function doGo()
{
    theForm.submit();
} 

function findForm()
{
	if (!document.getElementById('c24')) 
	{
		isMobile = true;
	}
	theForm = document.getElementsByTagName('form');
	var theFormName = getFormName(theForm[0], '_');
    
	for (i = 0, imax = theForms.length; (i < imax); i++)
	{   
		if (theFormName == theForms[i]){
			return theForm[0];
		}
	}

	return false;
}

function getFormName(form) {
    return form.name.split('_')[0];
}

function fillFieldList(list){
	var currentData={};
	Object.extend(currentData,theData);
	if (isMobile)
	{
		Object.extend(currentData,theDataMobile);
	}
	var optionList= theOptions[theParams.selectedOption] ? theOptions[theParams.selectedOption].sets : [];
	
	if(optionList) {
		for (i = 0, imax = optionList.length; (i < imax); i++){
			var ex=theOptionsData[optionList[i]];
			if(ex){
				Object.extend(currentData,ex);
			}
		}
	}
	// über alle Felder von currentData
    // wenn getFormName(theForm) = erstem Teil des namens von currentData[i], dann form.name wegschneiden und verwenden
    var allKeys = Object.keys(currentData);

	for (i = 0; i < allKeys.length; i++){
        var theKey = allKeys[i];
		var theField=currentData[theKey];
        var firstDot = theKey.indexOf(".")
        var formName = theKey.substring(0,firstDot);
        if( getFormName(theForm) === formName) {
            var elementName = theKey.substring(firstDot+1);
            var elem=document.getElementsByName(elementName);
            if(elem){
                if(theField[0]<0){
                    for(j=0;j<elem.length;j++){
                        elem[j][theField[1]]=theField[2];
                    }
                }
                else if ((theField[1]==="click") && (elem[theField[0]])) {
                        elem[theField[0]].click();
                }
                else if ((theField[1]==="autocomplete") && (elem[theField[0]])) {
                        elem[theField[0]].click();
                        elem[theField[0]].value=theField[2];
                        simulateKeyPress(elem[theField[0]]);
                }
                else if ((theField[1]==="selectedIndex") && isMobile && (theField[2]==0)) {
                	elem[theField[0]][theField[1]] = 1; //mobile has label as option 0
                }
                else if(theField[0]<elem.length){
                        elem[theField[0]][theField[1]]=theField[2];
                }
            }
        }
	}
}

function simulateKeyPress(elem) {
  var evt = document.createEvent("KeyboardEvent");
  var evt2 = document.createEvent("KeyboardEvent");
  evt.initKeyEvent ("keyup", true, true, window,
                    0, 0, 0, 0,
                    0, " ".charCodeAt(0));
	evt2.initKeyEvent ("click", true, true, window,
                    0, 0, 0, 0,
                    0, " ".charCodeAt(0));
  elem.dispatchEvent(evt);
  elem.parentNode.dispatchEvent(evt2);
}
function createStageInfo() {
    var stageInfoStripes = document.createElement("div");
    stageInfoStripes.setAttribute('style','position:absolute;bottom:32px;right:10px;width:10px;height:95%;');
    stageInfoStripes.setAttribute('class', 'c24_gm_stageinfoMarker');
    document.body.appendChild(stageInfoStripes);
    var stageInfoStripes2 = document.createElement("div");
    stageInfoStripes2.setAttribute('style','position:absolute;bottom:10px;left:10px;width:10px;height:97%;');
    stageInfoStripes2.setAttribute('class', 'c24_gm_stageinfoMarker');
    document.body.appendChild(stageInfoStripes2);

	var container = document.createElement("div");
	container.setAttribute('style','position:absolute;bottom:10px;right:10px;width:100px;height:20px;border:2px solid grey;font-weight:bold;font-size:large;text-align:center;');
    container.setAttribute('class', 'c24_gm_stageinfoMarker');
	if(window.location.hostname == 'localhost' ||
window.location.hostname == 'kfz.c24-local.test' || 

window.location.hostname == 'www.c24-local.test') {
		container.innerHTML="LOCAL";
	}
	else if(window.location.hostname == 'check24.int.test.local'||
window.location.hostname == 'kfz.c24-int.test' ||
window.location.hostname == 'www.c24-int.test' ) {
		container.innerHTML="INT";
	}
	else if(window.location.hostname == 'check24.mirror.test.local' ||
window.location.hostname == 'kfz.c24-mirror.test'||
window.location.hostname == 'www.c24-mirror.test') {
		container.innerHTML="MIRROR";
	}
	else if(window.location.hostname == 'www.check24.de' || 
    window.location.hostname == 'kfz.check24.de') {
		container.innerHTML="PROD";
	}
	else if(window.location.hostname == 'testap.einsurance.de') {
		container.innerHTML="TESTAP";
	}
	else {
		container.innerHTML="???";
	}
	document.body.appendChild(container);
}

function goOnRunning()
{
	if (theParams.isRunning)
	{
		theElement.style.backgroundColor = 'red';
		if (theForm)
		{
			var stopPage = theRunOptions[theParams.runTo];
			var stopPageName = stopPage.substring(stopPage.lastIndexOf(":") + 1);
			if (getFormName(theForm) == stopPageName)
			{
				doTheStop();
			}
			else if (getFormName(theForm) != waitingPageName)
			{
				theTimer = window.setTimeout( function() { fillAndGo(3) }, 1000);
			}
		}
	}
}