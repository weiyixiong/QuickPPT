var svgNS = "http://www.w3.org/2000/svg";
function Rate(){
    this.widthRate;
    this.heightRate;
}
function PPTRender(pptModel){
    this.pptModel=pptModel;

    var progressInterId;

    this.viewerWidth =document.documentElement.clientWidth;
    this.viewerHeight =document.documentElement.clientHeight;


    this.baseSvg = d3.select("#tree-container").append("svg")
    .attr("width", this.viewerWidth)
    .attr("height", this.viewerHeight)
    .attr('name', 'root')
    .attr("class", "overlay");

    this.currentPage=0;


}
PPTRender.prototype.getChineseTextCount=function getChineseTextCount(string){
    return string.match(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/g);
}
PPTRender.prototype.drawRect= function drawRect(x,y,width,height,color){
    color=color||"fill:blue";
    this.baseSvg.append('rect').attr('x',x).attr('y', y).attr('width',width).attr('height',height).attr('style',color);
}
PPTRender.prototype.drawImageAtRect= function drawImageAtRect(images,rate,imageMap){
  for (var i = 0; i < images.length; i++) {
        var image=this.baseSvg.append('image')
                      .attr('x',images[i].x/rate.heightRate)
                    .attr('y', images[i].y/rate.widthRate)
                    .attr('width',images[i].width/rate.heightRate)
                    .attr('height',images[i].height/rate.widthRate)
                    .attr('xlink:href', this.pptModel.imageResoures.get(imageMap.get(images[i].embed)).src);
  };

}
PPTRender.prototype.drawTextAtRect= function drawTextAtRect(textbodys,spPr,rate){

    var color="fill:blue";
    var textArea=this.baseSvg.append('svg')
    .attr('x',spPr.x/rate.heightRate)
    .attr('y', spPr.y/rate.widthRate)
    .attr('width',spPr.width/rate.heightRate)
    .attr('height',spPr.height/rate.widthRate);//.attr('style',color);
    var _this=this;

    for (var i = 0; i < textbodys.length; i++) {
         var Content=textbodys[i];
         var textContent=textArea.append('text')
            .attr('x','50%')
            .attr('y',i*1.5+1+'em')
            .attr('dx','0')
            .attr('dy','.3em')
            .attr('text-anchor','middle')
            .attr('fill',Content.textColor)
            .attr('font-size',spPr.textsize/100+'px');

            if(spPr.textAnchor=='b'){
                textContent.attr('y', '100%').attr('dy', '-1em');;
            }else if(spPr.textAnchor=='t'){
                // textContent.attr('y', '0').attr('dy', '1em');;
            }
            if (Content.align=="none"||Content.align==null) {
                if(spPr.defaultAlign=="r"){
                    textContent.attr('x','100%');
                    textContent.attr('dx','-'+Content.text.length+'em')
                }
                else if(spPr.defaultAlign=="l"){
                    textContent.attr('x','0').attr('text-anchor','start');
                    // textContent.attr('dx',Content.text.length+'em')
                }
            }else{
                if(Content.align=="r"){
                    textContent.attr('x','100%');
                    textContent.attr('dx','-'+Content.text.length+'em')
                }
                else if(Content.align=="l"){
                     textContent.attr('x','0').attr('text-anchor','start');
                                         // textContent.attr('dx',Content.text.length+'em')
                }
            }
            if (spPr.buchar&&Content.hasBuChar) {
               textContent.text(spPr.buchar+Content.text);
            }else{
                   var lineTextNum=new Array();
                   var useWidth=0;
                   var lineTextNumItem=0;
                   var canUseWidth=spPr.width/rate.heightRate;
                   var line=0;
                   for (var j = 0; j < Content.text.length; j++) {
                       if(_this.getChineseTextCount(Content.text[j])!=null){
                          useWidth+=spPr.textsize/100;
                       }else{
                          useWidth+=spPr.textsize/200;
                       }
                       lineTextNumItem++;
                       if(useWidth>canUseWidth){
                          j--;
                          lineTextNum[line++]=lineTextNumItem-1;
                          lineTextNumItem=0;
                          useWidth=0;
                       }

                   };
                   lineTextNum[line]=lineTextNumItem;
                   var textEndIndex=0;
                   var textStartIndex=0;
                   for (var k = 0; k < lineTextNum.length; k++) {
                        textEndIndex+=lineTextNum[k];
                        var tSpan=textContent.append('tspan').attr("dy", k ? "1.2em" : 0)
                        .attr('x', textContent.attr('x'))
                        .attr('fill', textContent.attr('fill'));
                        tSpan.text(Content.text.substring(textStartIndex,textEndIndex));
                        textStartIndex=textEndIndex;
                   };
               }
               // else{
               //    textContent.text(Content.text);
               // }
               
            // }
         
    };
    
}
PPTRender.prototype.checkProgress=function checkProgress(){
   
}
PPTRender.prototype.render=function render(){
    var _this=this;
    this.progressInterId=setInterval(function(){
        if (_this.pptModel.sldMasterLst.length>0) {
            clearInterval(_this.progressInterId);
            _this.realRender();
        };
    }, 1000);
}
PPTRender.prototype.readerPage=function readerPage(page){
    var _this=this;
    var rate=new Rate();
    rate.widthRate=this.pptModel.sldszY/this.viewerHeight;
    rate.heightRate=this.pptModel.sldszX/this.viewerWidth;
    // this.pptModel.sldMasterLst.forEach(function(item){
        // _this.drawRect(item.spPrModel.x/RATE,item.spPrModel.y/RATE,item.spPrModel.width/RATE,item.spPrModel.height/RATE);
    // });
    var contentLayoutMap=this.pptModel.sldContentLayoutMap;
    var sldContent=this.pptModel.sldContents[page];
    var spprs=this.pptModel.sldLayoutLst[contentLayoutMap[page]];

    var images=this.pptModel.sldContentsImg[page];

    if(spprs.spPrModels.length==0){
        spprs=this.pptModel.sldMasterLst[0];
    }

     for (var j = 0; j <sldContent.textbodys.length; j++) {
        _this.drawTextAtRect(sldContent.textbodys[j],spprs.spPrModels[j],rate);
     }  

    for (var i = 0; i <images.textbodys.length; i++) {
        _this.drawImageAtRect(images.textbodys,rate,this.pptModel.sldContentImgMap);
     }  
 }

PPTRender.prototype.realRender=function realRender(){
    this.readerPage(this.currentPage);
    var _this=this;
    addButton();


    function addButton(){
            var prev=_this.baseSvg.append('g');
             prev.append('rect').attr('x', '20')
                                 .attr('y', '0')
                                 .attr('ry', '5')
                                 .attr('width', '52')
                                 .attr('height', '22').attr('fill', 'gray');;
             prev.append('text').attr('x', '25').attr('y', '16').text('prev');
             prev.on('click', prevClick);

             var next=_this.baseSvg.append('g');
             next.append('rect').attr('x', '72')
                                 .attr('y', '0')
                                 .attr('ry', '5')
                                 .attr('width', '52')
                                 .attr('height', '22').attr('fill', 'gray');;
             next.append('text').attr('x', '75').attr('y', '16').text('next');
             next.on('click', nextClick);
    }

     function prevClick(d) {
            document.querySelector('[name=root]').innerHTML="";
       _this.readerPage(--_this.currentPage);
       addButton();
     }
    function nextClick(d) {
            document.querySelector('[name=root]').innerHTML="";
       _this.readerPage(++_this.currentPage);
       addButton();
     }
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[i],rate);
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[textContent.length-i-1],rate);
         // for (var i = 0; i <textContent.length; i++) {
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[i],rate);
           // _this.drawTextAtRect(textContent[i],this.pptModel.sldMasterLst[ textContent.length -i].spPrModel,RATE);
    // }

}