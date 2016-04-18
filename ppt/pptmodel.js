function spPrModel(x,y,width,height,textsize,txtAnchor){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.textsize=textsize;
    this.textAnchor=txtAnchor;
}
function sldLayoutModel(){
    // this.spPrModel=spPrModel;
    this.spPrModels=new Array();
}
function sldContentDecModel(topInt,leftInt,rigthtInt,bottomInt){
    this.topInt=topInt;
    this.leftInt=leftInt;
    this.rigthtInt=rigthtInt;
    this.bottomInt=bottomInt;
    this.algn='ctr';
}
function PPTModel(){
    this.presentation=new Map();
    this.presentationRel=new Map();
    this.sldmasteridlst=new Map();
    this.sldidlst=new Map();
    this.sldMasterLst=new Array();
    this.sldLayoutLst=new Array();
    this.sldContent=new Array();
    this.sldContentDec=new Array();
    this.sldszX=0;
    this.sldszY=0;
    this.sizeRate=6350;


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
PPTModel.prototype.setPPTsize=function setPPTsize(slidesz){
       this.sldszX=slidesz.getAttribute("cx");
       this.sldszY=slidesz.getAttribute("cy");
       this.sizeRate=sldszX/window.screen.width;
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
PPTModel.prototype.addSldmasteridlst=function addSldmasteridlst(sldmasterid){
    for (var i = sldmasterid.length - 1; i >= 0; i--) {
            var id=sldmasterid.item(i).getAttribute("id");
            var target=sldmasterid.item(i).getAttribute("r:id");
            this.sldmasteridlst.put(id,target);
            // console.log(id);
            // console.log(target);
    }
}
PPTModel.prototype.addSldlst=function addSldlst(sldlst){
    for (var i = sldlst.length - 1; i >= 0; i--) {
            var id=sldlst.item(i).getAttribute("id");
            var target=sldlst.item(i).getAttribute("r:id");
            this.sldidlst.put(id,target);
            // console.log(id);
            // console.log(target);
    }

}
PPTModel.prototype.addSpPr=function addSpPr(spPr,sldLayoutModel,textSize,txtAnchor){
    for (var i = spPr.length - 1; i >= 0; i--) {
        if(spPr.item(i).getElementsByTagName("off").item(0)!=null){
            var x=spPr.item(i).getElementsByTagName("off").item(0).getAttribute('x');
            var y=spPr.item(i).getElementsByTagName("off").item(0).getAttribute('y');
            var width=spPr.item(i).getElementsByTagName("ext").item(0).getAttribute('cx');
            var height=spPr.item(i).getElementsByTagName("ext").item(0).getAttribute('cy');
            // sldLayoutArr.push(new sldLayoutModel(new spPrModel(x,y,width,height,textSize,txtAnchor)));
            sldLayoutModel.spPrModels.push(new spPrModel(x,y,width,height,textSize,txtAnchor));
        }
    }
}

PPTModel.prototype.addSp=function addSp(sp,sldLayoutArr){
    var _this=this;
    var sldlayoutmodel=new sldLayoutModel();

    for (var i = sp.length - 1; i >= 0; i--) {
          var defRPr=sp.item(i).getElementsByTagName('defRPr');
          var anchor=sp.item(i).getElementsByTagName('bodyPr');
          if(defRPr.length>0){
             var txtSz=defRPr.item(0).getAttribute('sz')||2000;
          }
          if(anchor.length>0){
             var txtAnchor=anchor.item(0).getAttribute('anchor')||'t';
          }
          var spPr=sp.item(i).getElementsByTagName('spPr');
          _this.addSpPr(spPr,sldlayoutmodel,txtSz,txtAnchor);
    }
    sldLayoutArr.push(sldlayoutmodel);

}

PPTModel.prototype.addSldContent=function addSldContent(slides){
    var array=new Array();
    for (var i = slides.length - 1; i >= 0; i--) {
        array.push(slides.item(i).textContent);
    }
    this.sldContent.push(array);
}
PPTModel.prototype.getIndex=function getIndex(string){
    return string.match(/\d/g);
}
PPTModel.prototype.pushData=function pushData(entry){
    var _this=this;
    if(entry.filename.indexOf("ppt/presentation.xml")>=0){
         this.parseXml(entry,function(doc){
            var root=doc.childNodes[0];
            var sldmasteridlst=doc.documentElement.getElementsByTagName('sldMasterId');
            var sldidlst=root.getElementsByTagName("sldId");
            var slidesz=root.getElementsByTagName("sldSz").item(0);
            var notessz=root.getElementsByTagName("notessz");
            var defaulttextstyle=root.getElementsByTagName("defaulttextstyle");
            var extlst=root.getElementsByTagName("extlst");

            _this.addSldmasteridlst(sldmasteridlst);
            _this.addSldlst(sldidlst);
            _this.sldszX=slidesz.getAttribute('cx');
            _this.sldszY=slidesz.getAttribute('cy');

         });
    }
    else if(entry.filename.indexOf("ppt/_rels/presentation.xml.rels")>=0){
         var _pres=this.presentationRel;
         this.parseXml(entry,function(doc){
            var relations= doc.childNodes[0].childNodes;
            for (var i = relations.length - 1; i >= 0; i--) {
                if (relations[i]!=null){
                    var id=relations[i].getAttribute("Id");
                    var target=relations[i].getAttribute("Target");
                    _pres.put(id,target);
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
        var _this=this;
        this.parseXml(entry,function(doc){
            var sp=doc.getElementsByTagName('sp');
            _this.addSp(sp,_this.sldMasterLst);

        });
    }
    else if(entry.filename.indexOf("ppt/slideMasters/_rels/")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/slideLayout")>=0){
        if(this.getIndex(entry.filename)==1){
            var _this=this;
            this.parseXml(entry,function(doc){
                var sp=doc.getElementsByTagName('sp');
                _this.addSp(sp,_this.sldLayoutLst);

            });
        }
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/_rels")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slides/slide")>=0){
        var _this=this;
        this.parseXml(entry,function(doc){
            var text=doc.getElementsByTagName('p');
            _this.addSldContent(text);

        });
    }
    else if(entry.filename.indexOf("ppt/slides/_rels")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/theme/theme.xml")>=0){
         this.parseXml(entry);
    } else{
        console.log(entry.filename+"   pushData() 未匹配到任何关键字");
    }  

}