function DocStruct(name){
	this.name=name;
	this.children=new Array();
}
function parseXml2Json(doc){

    var jsonObject= parseXml2Object(doc);
    var json=JSON.stringify(jsonObject);
    return json;
}
function parseXml2Object(doc){
	if (doc.childNodes==null) {
		return new DocStruct(doc.nodeValue);
	};
	var res=new DocStruct(doc.tagName);
	for (var i = doc.childNodes.length - 1; i >= 0; i--) {
		if (doc.childNodes[i]!=null){
		  res.children.push(parseXml2Object(doc.childNodes[i]));	
		}
	};
	return res;
}

