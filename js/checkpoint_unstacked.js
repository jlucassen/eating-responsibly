"use strict"

// set up to read weights from input fields
var inputNames = ['Acidification', 'Climate', 'Eutrophication', 'Water Stress', 'Cattle', 'Chicken', 'Fish', 'Pigs'];
var inputIds = ['weight-acid', 'weight-climate', 'weight-eutro', 'weight-fwater', 'weight-cattle', 'weight-chicken', 'weight-fish', 'weight-pigs'];
var weights = [];
for (var i in inputIds) {
    weights.push({name: inputNames[i], value: document.getElementById(inputIds[i]).value});
}

// function to read in data from csvs
var foodImpactData = [];
var pointScalingData = [];
function getCsvData() {
    d3.csv("data/impactData.csv", function(data) {
        foodImpactData.push(data);
    });
    d3.csv("data/pointScalingData.csv", function(data) {
        pointScalingData.push(data);
    });
    return new Promise(resolve => {
        setTimeout(() => {
          resolve(x);
        }, 2000);
      });
}

// set up results graph
var svg;
var x;
var y;
async function setupResultsGraph() {
    // wait while reading in data from csv files
    await getCsvData();
    // make axes
    var margin = {top: 30, right: 30, bottom: 70, left: 100};
    var width = document.getElementById('results_graph').clientWidth - margin.left - margin.right
    var height = 600 - margin.top - margin.bottom;
    svg = d3.select("#results_graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    x = d3.scaleLinear()
        .domain([0, 130])
        .range([ 0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    y = d3.scaleBand()
        .range([ 0, height ])
        .domain(foodImpactData.map(function(d) { return d["Name"]; }))
        .padding(.1);
    svg.append("g")
        .call(d3.axisLeft(y));
}

function updateResultsGraph() {
    // Read in new weights
    var weights = [];
    for (i in inputIds) {
        weights.push({name: inputNames[i], value: document.getElementById(inputIds[i]).value});
    }

    // Make new bars
    var bars = svg.selectAll("rect")
        .data(foodImpactData);
    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", x(0) )
        .attr("y", function(food) { return y(food.Name); })
        .attr("width", function(food) { return x(food.Climate); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#69b3a2")
}

setupResultsGraph();