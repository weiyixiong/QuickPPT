function PPTModel(){
    this.presentation=new Map();


    this.parser = new DOMParser({
                            locator:{},
                            errorHandler:{
                                warning:function(w){
                                    console.warn(w);
                                },
                                error:function(error){
                                     console.log(entry.filename);
                                },
                                fatalError:function(fatalError){

                                }}
                        });


}
PPTModel.prototype.parseXml=function parseXml(entry,callback){
        var parser=this.parser;
        entry.getData(new zip.TextWriter(), function(text) {
                        doc = parser.parseFromString(text,'text/xml');
                        callback(doc);
                    }, function(current, total) {
                        // onprogress callback
                    });
}
PPTModel.prototype.pushData=function pushData(entry){
    if(entry.filename.indexOf("ppt/presentation.xml")>=0){
         this.parseXml(entry,function(doc){
            var root=doc.childNodes[0];
            var sldmasteridlst=doc.getElementsByTagName("p:sldmasteridlst");
            var sldidlst=doc.getElementsByTagName("p:sldidlst");
            var slidesz=doc.getElementsByTagName("p:sldsz");
            var notessz=doc.getElementsByTagName("p:notessz");
            var defaulttextstyle=doc.getElementsByTagName("p:defaulttextstyle");
            var extlst=doc.getElementsByTagName("p:extlst");
         });
    }
    else if(entry.filename.indexOf("ppt/_rels/presentation.xml.rels")>=0){
         this.parseXml(entry,function(doc){
            var relations= doc.childNodes[0].childNodes;
            var pres=this.presentation;
            for (var i = relations.length - 1; i >= 0; i--) {
                if (relations[i]!=null){
                    var id=relations[i].getAttribute("Id");
                    var target=relations[i].getAttribute("Target");
                    pres.put(id,target);
                    // console.log(relations[i].getAttribute("Id"));
                    // console.log(relations[i].getAttribute("Target"));
                }
            }
         });
    }
    else if(entry.filename.indexOf("ppt/diagrams")>=0){
        if (entry.filename.indexOf("colors")>=0) {};
        if (entry.filename.indexOf("data")>=0) {};
        if (entry.filename.indexOf("drawing")>=0) {};
        if (entry.filename.indexOf("layout")>=0) {};
        if (entry.filename.indexOf("quickStyle")>=0) {};
    }
    else if(entry.filename.indexOf("ppt/slideMasters/slideMaster")>=0){
        this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slideMasters/_rels/")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/slideLayout.xml")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/_rels")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slides/slide")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slides/_rels")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/theme/theme.xml")>=0){
         this.parseXml(entry);
    } else{
        console.log(entry.filename+"pushData() 未匹配到任何关键字");
    }  

}