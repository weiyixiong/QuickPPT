function PPTRender(pptModel){
    this.pptModel=pptModel;
}
PPTRender.prototype.render=function render(){

    var viewerWidth = $(document).width();
    var viewerHeight = window.screen.height


    var baseSvg = d3.select("#tree-container").append("svg")
    .attr("width", viewerWidth)
    .attr("height", viewerHeight)
    .attr("class", "overlay");

    baseSvg.append('rect').attr('x',838200/6350).attr('y', 365125/6350).attr('width',10515600/6350).attr('height',1325563/6350).attr('style', 'fill:blue');
    //x="20" y="20" width="250" height="250"
 	baseSvg.append('rect').attr('x',838200/6350).attr('y', 365125/6350).attr('width',10515600/6350).attr('height',1325563/6350).attr('style', 'fill:blue');
    //x="20" y="20" width="250" height="250"



     
}