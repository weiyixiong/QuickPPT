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
		return;
	};
	var res=new DocStruct(doc.tagName);
	for (var i = doc.childNodes.length - 1; i >= 0; i--) {
		res.children.push(parseXml2Objec(doc.childNodes[i]));
	};
	return res;
}

