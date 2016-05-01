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
    .attr("class", "overlay");
  
}
PPTRender.prototype.drawRect= function drawRect(x,y,width,height,color){
    color=color||"fill:blue";
    this.baseSvg.append('rect').attr('x',x).attr('y', y).attr('width',width).attr('height',height).attr('style',color);
}
PPTRender.prototype.drawTextAtRect= function drawTextAtRect(textbodys,spPr,rate){
    var color="fill:blue";
    var textArea=this.baseSvg.append('svg')
    .attr('x',spPr.x/rate.heightRate)
    .attr('y', spPr.y/rate.widthRate)
    .attr('width',spPr.width/rate.heightRate)
    .attr('height',spPr.height/rate.widthRate);//.attr('style',color);

    for (var i = 0; i < textbodys.length; i++) {
         var Content=textbodys[i];
         var textContent=textArea.append('text')
            .attr('x','50%')
            .attr('y',i*1.5+1+'em')
            .attr('dx','2em')
            .attr('dy','.3em')
            .attr('text-anchor','middle')
            .attr('fill','black')
            .attr('font-size',spPr.textsize/100+'px');

            if(spPr.textAnchor=='b'){
                textContent.attr('y', '100%').attr('dy', '-1em');;
            }else if(spPr.textAnchor=='t'){
                // textContent.attr('y', '0').attr('dy', '1em');;
            }
            if (Content.align=="none") {
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

            if (spPr.buchar) {
                Content.text=spPr.buchar+Content.text;
            };
            textContent.text(Content.text);
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
PPTRender.prototype.realRender=function realRender(){
    var page=1;

    var _this=this;
    var rate=new Rate();
    rate.widthRate=this.pptModel.sldszY/this.viewerHeight;
    rate.heightRate=this.pptModel.sldszX/this.viewerWidth;
    // this.pptModel.sldMasterLst.forEach(function(item){
        // _this.drawRect(item.spPrModel.x/RATE,item.spPrModel.y/RATE,item.spPrModel.width/RATE,item.spPrModel.height/RATE);
    // });
    var sldContent=this.pptModel.sldContents[page];
    var spprs=this.pptModel.sldLayoutLst[page];
    if(spprs.spPrModels.length==0){
        spprs=this.pptModel.sldMasterLst[0];
    }

     for (var j = 0; j <sldContent.textbodys.length; j++) {

        _this.drawTextAtRect(sldContent.textbodys[j],spprs.spPrModels[j],rate);

     }
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[i],rate);
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[textContent.length-i-1],rate);
         // for (var i = 0; i <textContent.length; i++) {
           // _this.drawTextAtRect(textContent[i],spprs.spPrModels[i],rate);
           // _this.drawTextAtRect(textContent[i],this.pptModel.sldMasterLst[ textContent.length -i].spPrModel,RATE);
    // }

}