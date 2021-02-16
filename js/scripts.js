"use strict"

// set up to read impactPerIssue from user input fields
var issueNames = ['Acid', 'Climate', 'Eutro', 'Water', 'Cow', 'Chicken', 'Fish', 'Pig'];
var issueIds = ['weight-acid', 'weight-climate', 'weight-eutro', 'weight-water', 'weight-cows', 'weight-chicken', 'weight-fish', 'weight-pigs'];
var impactPerIssue = {};
for (var i in issueIds) {
    impactPerIssue[issueNames[i]] = document.getElementById(issueIds[i]).value;
}

// function to read in data from csvs
var effectorPerFood = [];
var effectorPerIssue = [];
function getCsvData() {
    d3.csv("data/effectorPerFood.csv", function(data) {
        effectorPerFood.push(data);
    });
    d3.csv("data/effectorPerIssue.csv", function(data) {
        effectorPerIssue = data;
    });
    return new Promise(resolve => {
        setTimeout(() => {
          resolve(x);
        }, 1000);
    });
}

// set up results graph
var svg;
var x;
var y;
var width;
async function setupResultsGraph() {
    // wait while reading in data from csv files
    await getCsvData();
    // make axes
    var margin = {top: 30, right: 30, bottom: 70, left: 120};
    width = document.getElementById('results_graph').clientWidth - margin.left - margin.right
    var height = 600 - margin.top - margin.bottom;
    svg = d3.select("#results_graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    y = d3.scaleBand()
        .range([ 0, height ])
        .domain(effectorPerFood.map(function(d) { return d["Name"]; }))
        .padding(.1);
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px helvetica");
}

function updateResultsGraph() {
    // Read in new impactPerIssue
    impactPerIssue = {};
    for (i in issueIds) {
        var val = document.getElementById(issueIds[i]).value;
        if (val == '') {
            impactPerIssue[issueNames[i]] = 1;
        } else {
            impactPerIssue[issueNames[i]] = val;
        }
    }

    var impactPerEffector = {};
    for (i in issueNames) {
        impactPerEffector[issueNames[i]] = impactPerIssue[issueNames[i]]/effectorPerIssue[issueNames[i]];
    }

    // Convert food issues to impact
    var impactPerFoodData = effectorPerFood.map(function(d) {
        var out = {};
        out.Name = d.Name;
        for (i in issueNames) {
            out[issueNames[i]] = d[issueNames[i]]*impactPerEffector[issueNames[i]];
        }
        return out;
    });

    // Normalize impacts
    var maxImpact = Math.max.apply(Math, impactPerFoodData.map(function(d) {
        return d.Acid + d.Climate + d.Eutro + d.Water + d.Cow + d.Chicken + d.Fish + d.Pig;
    }));
    if (maxImpact > 0) {
        impactPerFoodData = impactPerFoodData.map(function(d) {
            var out = {};
            out.Name = d.Name;
            for (i in issueNames) {
                out[issueNames[i]] = d[issueNames[i]]/maxImpact;
            }
            return out;
        });
    }

    // separate horizontally into blocks based on issueNames
    var issueGroups = Object.keys(impactPerFoodData[1]);
    issueGroups.shift();

    var colors = {Acid: '#CCCC00', Climate: '#e41a1c', Eutro: '#008000', Water: '#377eb8', Cow: '#8a6942', Chicken: '#ec8e00', Fish: '#4d0080', Pig: '#a249a5'};

    // clear old blocks, little bit janky
    svg.selectAll("rect").attr("width", 0);

    // do the stack
    var stackedData = d3.stack()
    .keys(issueGroups)
    (impactPerFoodData)

    // display new blocks
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", function(d) { return colors[d.key]; })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", function(d) { return y(d.data.Name); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("height", y.bandwidth())
}

function matchInputs(first, second) {
    document.getElementById(second).value = document.getElementById(first).value;
}

setupResultsGraph();
setTimeout(function() {
    updateResultsGraph();
  }, 1000);