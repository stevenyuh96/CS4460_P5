
d3.csv('movies.csv', function (data) {
  // Variables
  var body = d3.select('body')
	var margin = { top: 50, right: 50, bottom: 50, left: 50 }
	var h = 1000 - margin.top - margin.bottom
	var w = 1000 - margin.left - margin.right

	// Scales
  var colorScale = d3.scale.category20()
  var xScale = d3.scale.linear()
    .domain([
    	d3.min([0,d3.min(data,function (d) { return d.imdb_score })]),
    	d3.max([0,d3.max(data,function (d) { return d.imdb_score })])
    	])
    .range([0,w])
  var yScale = d3.scale.linear()
    .domain([
    	d3.min([0,d3.min(data,function (d) { return d.num_voted_users })]),
    	d3.max([0,d3.max(data,function (d) { return d.num_voted_users })])
    	])
    .range([h,0])
	// SVG
	var svg = body.append('svg')
	    .attr('height',h + margin.top + margin.bottom)
	    .attr('width',w + margin.left + margin.right)
	  .append('g')
	    .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
	// X-axis
	var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .ticks(10)
	  .orient('bottom')
  // Y-axis
	var yAxis = d3.svg.axis()
	  .scale(yScale)
	  .ticks(5)
	  .orient('left')
  // Circles
  var circles = svg.selectAll('circle')
      .data(data)
      .enter()
    .append('circle')
      .attr('cx',function (d) { return xScale(d.imdb_score) })
      .attr('cy',function (d) { return yScale(d.num_voted_users) })
      .attr('r','10')
      .attr('stroke','black')
      .attr('stroke-width',1)
      .attr('fill',function (d,i) { return colorScale(i) })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',20)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',10)
          .attr('stroke-width',1)
      })

    // X-axis
svg.append('g')
    .attr('class','axis')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis)
  .append('text') // X-axis Label
    .attr('class','label')
    .attr('y',-10)
    .attr('x',w)
    .attr('dy','.71em')
    .style('text-anchor','end')
    .text('IMDB Score')
// Y-axis
svg.append('g')
    .attr('class', 'axis')
    .call(yAxis)
  .append('text') // y-axis Label
    .attr('class','label')
    .attr('transform','rotate(-90)')
    .attr('x',0)
    .attr('y',5)
    .attr('dy','.71em')
    .style('text-anchor','end')
    .text('Number of Voted Users')
})
    // .append('title') // Tooltip
    //   .text(function (d) { return d.variable +
    //                        '\nReturn: ' + formatPercent(d.aror) +
    //                        '\nStd. Dev.: ' + formatPercent(d.asd) })

window.onload = start;

function start() {

  // Global variables
  const margin = { top: 100, right: 100, bottom: 100, left: 100 }
  const height = 1000 - (margin.top + margin.bottom)
  const width = 1000 - (margin.left + margin.right)
  const animation_duration = 1250

  // Global reference to the svg, not yet created
  var svg

  // Global variables to hold the entire raw dataset from the csv
  var raw_data = []

  // Global variable to hold the filtered dataset
  var filteredData = []

  // Global references to the scales and axes
  var xScale, yScale, xAxis, yAxis

  // Global variables to hold the current variables
  // being displayed on the x and y axes
  var xVariable, yVariable



  var selectData = [ { "text" : "Budget",  "variable" : "budget"},
                     { "text" : "Duration" , "variable" : "duration"},
                     { "text" : "Gross" , "variable" : "gross"},
                     { "text" : "Number of IMDB Ratings Received" , "variable" : "num_voted_users"},
                     { "text" : "IMDB Score" , "variable" : "imdb_score"},
                   ]


    // Sets up initial scatterplot
    // to show budget vs imdb score
    function setup() {

      var body = d3.select('body')

      // Add an input for the user to select
      // the x-axis variable
      var spanX = body.append('span')
        .text('Select X-Axis variable: ')
      var xInput = body.append('select')
        .attr('id','xSelect')
        .on('change',change_X_variable)
      .selectAll('option')
      .data(selectData)
        .enter()
      .append('option')
        .attr('value', function (d) { return d.variable })
        .text(function (d) { return d.text ;})
      body.append('br')

      // Add an input for the user to select the
      // y-axis variable
      var span = body.append('span')
        .text('Select Y-Axis variable: ')
      var yInput = body.append('select')
        .attr('id','ySelect')
        .on('change',change_Y_variable)
      .selectAll('option')
        .data(selectData)
        .enter()
      .append('option')
        .attr('value', function (d) { return d.variable })
        .text(function (d) { return d.text ;})
      body.append('br')

      // Set X-axis domain and range
      xScale = d3.scaleLinear()
          .domain([d3.min(raw_data , d=> d.budget), d3.max(raw_data , d=> d.budget)])
          .range([50 , (width - 50)]);

      // Set Y-axis domain and range
      yScale = d3.scaleLinear()
          .domain([d3.min(raw_data , d=> d.imdb_score), d3.max(raw_data, d=> d.imdb_score)])
          .range([(height - 50) , 50]);

      // Add the SVG
      svg = body.append('svg')
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // initial setup of x axis
      xAxis = d3.axisBottom().scale(xScale);

      // initial setup of y axis
      yAxis = d3.axisLeft().scale(yScale);

      // Make the initial scatterplot
      // with budget on the x axis and
      // imdb score on the y axis.
      // Color is grayscale mapped to
      // content rating
      var circles = svg.selectAll('.circle')
        .data(raw_data)
        .enter()
        .append("circle")
          .attr('r','7')
          .attr('cx', function(d) {
            return xScale(d.budget);
          })
          .attr('cy', function(d) {
            return yScale(d.imdb_score);
          })
          .attr('fill', function(d) {
            if (d.content_rating === "G" || d.content_rating === "TV-Y" || d.content_rating === "TV-G") {
              return "#F0F0F0";
            } else if (d.content_rating === "PG" || d.content_rating === "TV-PG" || d.content_rating === "TV-Y7") {
              return "#D3D3D3"
            } else if (d.content_rating === "PG-13" || d.content_rating === "TV-14") {
              return "#484848"
            } else if (d.content_rating === "R" || d.content_rating === "TV-ma") {
              return "#080808"
            } else {
              return "#A0A0A0"
            }
          })
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .on('mouseover', function () {
            d3.select(this)
              .transition()
              .duration(500)
              .attr('r',20)
              .attr('stroke-width',3)
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(500)
              .attr('r',10)
              .attr('stroke-width',1)
          });

      // Create the x-axis
      svg.append('g')
        .attr('class','axis')
        .attr('id','xAxis')
        .attr('transform', 'translate(0 ,' + (height - 50) + ')')
        .call(xAxis)

      // add the x-axis label
      svg.append('text')
        .attr('id', 'xAxisLabel')
        .attr('transform','translate(735 , 793)')
        .style("font-size", "16px")
        .text('Budget');

      // Create the y-axis
      svg.append('g')
        .attr('class','axis')
        .attr('transform', 'translate(50 , 0)')
        .attr('id','yAxis')
        .call(yAxis)

      // add the y-axis label
      svg.append("text")
        .attr('id','yAxisLabel')
        .attr("y", 25)
        .attr("x", 0)
        .style("font-size", "16px")
        .text("IMBD Score");
    }


    // This function is called when the x variable of
    // the scatterplot is changed. Alters the axis and moves the
    // points accordingly
    function change_X_variable() {

        // this is the new x variable
        xVariable = d3.select('#xSelect').property('value')

        // change the x axis domain to be mapped
        // to the new variable
        xScale
          .domain([
            d3.min([0,d3.min(filteredData , function (d) { return d[xVariable] })]),
            d3.max([0,d3.max(filteredData , function (d) { return d[xVariable] })])
          ])

        // change the x axis and label
        xAxis.scale(xScale)
        d3.select('#xAxis')
          .transition()
          .duration(animation_duration)
          .call(xAxis)
        d3.select('#xAxisLabel')
          .transition()
          .duration(animation_duration)
          .text(function(d) {
            if (xVariable === "budget") {
              return "Budget"
            } else if (xVariable === "duration") {
              return "Duration"
            } else if (xVariable === "gross") {
              return "Gross"
            } else if (xVariable === "num_voted_users") {
              return "Number of IMBD Ratings Received"
            } else {
              return "IMBD Score"
            }
          })

        // Move the circles on the scatterplot
        d3.selectAll('circle')
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cx' , function (d) {
            return xScale(d[xVariable])
          })
    }

    function change_Y_variable() {

        // The new y variable
        yVariable = d3.select('#ySelect').property('value')

        // Change the domain of the y axis
        // to be mapped to the new variable
        yScale
          .domain([
            d3.min([0,d3.min(filteredData , function (d) { return d[yVariable] })]),
            d3.max([0,d3.max(filteredData , function (d) { return d[yVariable] })])
          ])

        // Change the scale on the y axis and redraw it.
        // Also change the label
        yAxis.scale(yScale)
        d3.select('#yAxis')
          .transition()
          .duration(animation_duration)
          .call(yAxis)
        d3.select('#yAxisLabel') // change the xAxisLabel
          .transition()
          .duration(animation_duration)
          .text(function(d) {
            if (yVariable === "budget") {
              return "Budget"
            } else if (yVariable === "duration") {
              return "Duration"
            } else if (yVariable === "gross") {
              return "Gross"
            } else if (yVariable === "num_voted_users") {
              return "Number of IMBD Ratings Received"
            } else {
              return "IMBD Score"
            }
          })

        // Move the circles in the y direction to be mapped to the
        // new variable
        d3.selectAll('circle')
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cy' , function (d) {
            return yScale(d[yVariable])
          })
    }


    // Calls all functions needed
    // to create the inital scatterplot graph
    function initialize() {
        setup();
    }


    d3.csv('movies.csv', function (error, rawdata) {
        // Set quantitative variables of the dataset to
        // be numbers
        var data = [...rawdata].map(function(d, i) {
            // Gives each "movie" data point a
            // unique id value
            d.id = i;
            d.duration = +d.duration;
            d.gross = +d.gross;
            d.imdb_score = +d.imdb_score;
            d.budget = +d.budget;
            d.num_voted_users = +d.num_voted_users;
            return d;
        });

        // save global reference to raw data
        raw_data = data;
        filteredData = data;

        initialize();
    });

}
