var svgNS = "http://www.w3.org/2000/svg";
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
PPTRender.prototype.drawTextAtRect= function drawTextAtRect(text,spPr,RATE){
    var color="fill:blue";
    var textArea=this.baseSvg.append('svg').attr('x',spPr.x/RATE).attr('y', spPr.y/RATE).attr('width',spPr.width/RATE).attr('height',spPr.height/RATE);//.attr('style',color);
    var textContent=textArea.append('text').attr('x','50%').attr('y','50%').attr('dy','.3em')
    .attr('text-anchor','middle').attr('fill','black')
    .attr('font-size',spPr.textsize/100+'px');

    if(spPr.textAnchor=='b'){
        textContent.attr('y', '100%').attr('dy', '-1em');;
    }else if(spPr.textAnchor=='t'){
        textContent.attr('y', '0').attr('dy', '1em');;
    }

    textContent.text(text);
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
    var _this=this;
    // var RATE=this.pptModel.sldszY/this.viewerHeight;
    var RATE=this.pptModel.sldszX/this.viewerWidth;
    // this.pptModel.sldMasterLst.forEach(function(item){
    //     _this.drawRect(item.spPrModel.x/RATE,item.spPrModel.y/RATE,item.spPrModel.width/RATE,item.spPrModel.height/RATE);
    // });
    var textContent=this.pptModel.sldContent;
    for (var i = textContent.length - 1; i >= 0; i--) {
           _this.drawTextAtRect(textContent[i],this.pptModel.sldLayoutLst[i].spPrModel,RATE);
    }

}