function spPrModel(x,y,width,height,textsize,txtAnchor,defaultAlign,buchar){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.textsize=textsize;
    this.textAnchor=txtAnchor;
    this.defaultAlign=defaultAlign;
    this.buchar=buchar;
}
function imageSppr(x,y,width,height,embed){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.embed=embed;
    this.base64;
    this.name;
}
function textP(align,text,hasBuChar,textColor){
    this.align=align;
    this.text=text;
    this.hasBuChar=hasBuChar;
    this.textColor=textColor;
}
function textBody(pArray){
    this.para=pArray;
}
function sldLayoutModel(){
    this.spPrModels=new Array();
}
function sldContent(textbodys){
    this.textbodys=textbodys;
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
    this.sldLayoutLst=new Map();
    this.sldContents=new Array();
    this.sldContentsImg=new Array();
    this.sldContentLayoutMap=new Array();
    this.sldContentImgMap=new Map();
    this.sldContentDec=new Array();
    this.sldszX=0;
    this.sldszY=0;
    this.sizeRate=6350;
    this.imageResoures=new Map();


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
PPTModel.prototype.parseImage=function parseImage(entry){
        var parser=this.parser;
        var _this=this;
        entry.getData(new zip.Data64URIWriter(), function(uri) {
                       var imgtemp = new Image();
                       imgtemp.src = uri;
                       imgtemp.name= entry.filename;
                       var key=entry.filename.split('ppt/')[1];
                       _this.imageResoures.put(key,imgtemp);

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
PPTModel.prototype.addSpPr=function addSpPr(spPr,sldLayoutModel,textSize,txtAnchor,defaultAlign,buchar){
    for (var i = spPr.length - 1; i >= 0; i--) {
        if(spPr.item(i).getElementsByTagName("off").item(0)!=null){
            var x=spPr.item(i).getElementsByTagName("off").item(0).getAttribute('x');
            var y=spPr.item(i).getElementsByTagName("off").item(0).getAttribute('y');
            var width=spPr.item(i).getElementsByTagName("ext").item(0).getAttribute('cx');
            var height=spPr.item(i).getElementsByTagName("ext").item(0).getAttribute('cy');
            // sldLayoutArr.push(new sldLayoutModel(new spPrModel(x,y,width,height,textSize,txtAnchor)));
            sldLayoutModel.spPrModels.push(new spPrModel(x,y,width,height,textSize,txtAnchor,defaultAlign,buchar));
        }
    }
    //sort by ths distance from the top-left corner
    var sortRes= sldLayoutModel.spPrModels;
    for(var i=0;i<sortRes.length;i++){
        for(var j=i+1;j<sortRes.length;j++){
            var Iitem=sortRes[i];
            var Jitem=sortRes[j];
            if(Math.sqrt(Iitem.x*Iitem.x+Iitem.y*Iitem.y)>Math.sqrt(Jitem.x*Jitem.x+Jitem.y*Jitem.y)){
                sortRes[j]=Iitem;
                sortRes[i]=Jitem;
            }
        }
    }
}

PPTModel.prototype.addSp=function addSp(sp,sldLayoutArr,index){
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
    sldLayoutArr[index]=sldlayoutmodel;

}
PPTModel.prototype.addMasterSp=function addSp(doc,sldLayoutArr,index){
    var sp=doc.getElementsByTagName('sp');
    var _this=this;
    var sldlayoutmodel=new sldLayoutModel();

    for (var i = sp.length - 1; i >= 0; i--) {
          var defRPr=sp.item(i).getElementsByTagName('defRPr');
          var defaultAlign;
          var title=doc.getElementsByTagName('titleStyle').item(0);
          var body=doc.getElementsByTagName('bodyStyle').item(0);
          var buchar="";
          if(i==0){
            defRPr=title.getElementsByTagName('defRPr');
            defaultAlign=title.firstElementChild.getAttribute('algn');
            // buchar=title.getElementsByTagName('buChar').item(0).getAttribute('char');
          }
          if(i==1){
            defRPr=body.getElementsByTagName('defRPr');
            defaultAlign=body.firstElementChild.getAttribute('algn');
            buchar=body.getElementsByTagName('buChar').item(0).getAttribute('char');
          }
          
          var anchor=sp.item(i).getElementsByTagName('bodyPr');
          if(defRPr.length>0){
             var txtSz=defRPr.item(0).getAttribute('sz')||2000;
          }
          if(anchor.length>0){
             var txtAnchor=anchor.item(0).getAttribute('anchor')||'t';
          }
          var spPr=sp.item(i).getElementsByTagName('spPr');
          _this.addSpPr(spPr,sldlayoutmodel,txtSz,txtAnchor,defaultAlign,buchar);
    }
    sldLayoutArr[index]=sldlayoutmodel;

}

PPTModel.prototype.addSldContent=function addSldContent(textbody,index){
    var textbodys=new Array();
    for (var j = 0; j <textbody.length; j++) {
        var p=textbody.item(j).getElementsByTagName("p");
        var array=new Array();
        for (var i = 0; i < p.length; i++) {
            var hasBuChar=p.item(i).getElementsByTagName("buNone").length == 0;
            var alignEles=p.item(i).getElementsByTagName("pPr");
            var textColor="black";
            if (p.item(i).getElementsByTagName("srgbClr").length>0) {
                textColor="#"+p.item(i).getElementsByTagName("srgbClr").item(0).getAttribute("val");
            }
            if (alignEles.length!=0) {
                array.push(new textP(alignEles.item(0).getAttribute('algn'),p.item(i).textContent,hasBuChar,textColor));
            }else{
                array.push(new textP('none',p.item(i).textContent,hasBuChar,textColor));
            }
        }
        textbodys.push(array);       
    }
    this.sldContents[index]=new sldContent(textbodys);
}

PPTModel.prototype.addSldContentImg=function addSldContentImg(imageResoures,index){
    var imageResouress=new Array();
    for (var i = 0; i <imageResoures.length; i++) {
        var off=imageResoures.item(i).getElementsByTagName('off').item(0);
        var ext=imageResoures.item(i).getElementsByTagName('ext').item(1);
        var embed=imageResoures.item(i).getElementsByTagName('blip').item(0).getAttribute('r:embed');
        var x=off.getAttribute('x');
        var y=off.getAttribute('y');
        var width=ext.getAttribute('cx');
        var height=ext.getAttribute('cy');
        var imageSp = new imageSppr(x,y,width,height,embed);
        imageResouress.push(imageSp);
    }
    this.sldContentsImg[index]=new sldContent(imageResouress);
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
        var index=this.getIndex(entry.filename)-1;
        this.parseXml(entry,function(doc){
            _this.addMasterSp(doc,_this.sldMasterLst,index);

        });
    }
    else if(entry.filename.indexOf("ppt/slideMasters/_rels/")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/slideLayout")>=0){
        var index=this.getIndex(entry.filename)-1;
        var _this=this;
        this.parseXml(entry,function(doc){
            var sp=doc.getElementsByTagName('sp');
            _this.addSp(sp,_this.sldLayoutLst,index);

        });
    }
    else if(entry.filename.indexOf("ppt/slideLayouts/_rels")>=0){
         this.parseXml(entry);
    } 
    else if(entry.filename.indexOf("ppt/slides/_rels")>=0){
        var _this=this;
        var index=this.getIndex(entry.filename)-1;
        this.parseXml(entry,function(doc){
            var layoutText=doc.getElementsByTagName("Relationship").item(0).getAttribute("Target");
            _this.sldContentLayoutMap[index]=_this.getIndex(layoutText)-1;

            var relates=doc.getElementsByTagName("Relationship");
            for (var i = 1; i < relates.length; i++) {
                var id =relates.item(i).getAttribute('Id');
                var target=relates.item(i).getAttribute('Target').split('../')[1];
                _this.sldContentImgMap.put(id,target);
            };

            
        });
    }
    else if(entry.filename.indexOf("ppt/slides/slide")>=0){
        var _this=this;
        var index=this.getIndex(entry.filename)-1;
        this.parseXml(entry,function(doc){
            var text=doc.getElementsByTagName("txBody");
            var phType=doc.getElementsByTagName("ph");
            _this.addSldContent(text,index);


            var images=doc.getElementsByTagName("pic");
            _this.addSldContentImg(images,index);
            
        });
    }
    else if(entry.filename.indexOf("ppt/slides/_rels")>=0){
         this.parseXml(entry);
    }
    else if(entry.filename.indexOf("ppt/theme/theme.xml")>=0){
         this.parseXml(entry);
    } 
    else if(entry.filename.indexOf("jpg")>=0||entry.filename.indexOf("jpeg")>=0||entry.filename.indexOf("png")>=0){
         this.parseImage(entry);
    }else{
        console.log(entry.filename+"   pushData() 未匹配到任何关键字");
    }  

}