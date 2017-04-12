var margin = {top: 20, right: 40, bottom: 100, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// var someData = [
//   {
//     name:"scenario1",
//     amount:1
//   },{
//     name:"scenario2",
//     amount:.7
//   },{
//     name:"scenario3",
//     amount:.6
//   }
// ];

var color = d3.scale.ordinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.amount; });

var path = d3.svg.arc()
    .outerRadius(50)
    .innerRadius(0);

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x


var xValue = d => d.scenario,
    xScale = d3.scale.ordinal(xValue)

// setup y
var yValue = function(d) { return d["Total"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.location;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("class","bounding-box")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.tsv("dcap-data.tsv", function(error, data) {
  var scenarios = [""];

  function xPosition(name){
    var interval = width/(scenarios.length-1);
    return scenarios.indexOf(name)*interval
  }
  // change string (from CSV) into number format
  data.forEach(function(d) {
    var objs = [
      {
        name:"Early Lactation Cow",
        amount:d["Early Lactation Cow"]
      },
      {
        name:"Late Lactation Cow",
        amount:d["Late Lactation Cow"]
      },{
        name:"Mid Lactation Cow",
        amount:d["Mid Lactation Cow"]
      },{
        name:"Dry Cow",
        amount:d["Dry Cow"]
      },{
        name:"Older Heifer",
        amount:d["Older Heifer"]
      },{
        name:"Farm Level",
        amount:d["Farm Level"]
      }
    ]
    if(scenarios.indexOf(d.scenario)<0){
      scenarios.push(d.scenario)
    }
    d.pieData = objs;
    d.Total = +d.Total

  });

  // don't want dots overlapping axis, so add in buffer to data domain
  //xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  var x = d3.scale.ordinal()
      .domain(scenarios)
      .rangePoints([0, width]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
  yScale.domain([0.5, 1.2]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Scenario");


  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-2.1em")
      .style("text-anchor", "end")
      .text("Total kg CO2eq / kg FPCM");

  // rotate x axis labels
  svg.selectAll(".x .tick text")
      .attr("dy","3.5em")
      .attr("transform","translate(-50,0),rotate(-45)");



  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 7)
      .attr("cx", d => {
        return xPosition(d.scenario);
      })
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["scenario"] + "<br/> (" + xValue(d)
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})

  data.forEach(datum => {

   var arc = svg.selectAll(".arc" + datum.scenario.replace(/\s/g,''))
     .data(pie(datum.pieData))
     .enter().append("g")
       .attr("class", "arc"+datum.scenario.replace(/\s/g,''))
       .attr("cx", datum => {
         return xPosition(datum.scenario);
       })
       .attr("cy", yMap(datum));

   arc.append("path")
       .attr("d", path)
       .attr("fill", function(d) { return color(d.data.name); });

  });


});
