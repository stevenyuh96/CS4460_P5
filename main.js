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



  var selectVariableData = [ { "text" : "Budget",  "variable" : "budget"},
                     { "text" : "Duration" , "variable" : "duration"},
                     { "text" : "Gross" , "variable" : "gross"},
                     { "text" : "Number of IMDB Ratings Received" , "variable" : "num_voted_users"},
                     { "text" : "IMDB Score" , "variable" : "imdb_score"},
                   ]

  var selectGenreData = [ { "text" : "All" },
                     { "text" : "Action" },
                     { "text" : "Comedy" },
                     { "text" : "Drama" },
                     { "text" : "Romance" },
                     { "text" : "Horror" },
                     { "text" : "Sci-Fi" },
                     { "text" : "Documentary" },
                   ]

  var selectRatingData = [ { "text" : "All" },
                     { "text" : "G" },
                     { "text" : "PG" },
                     { "text" : "PG-13" },
                     { "text" : "R" },
                     { "text" : "Unrated" },
                   ]

  // Varibales for each filter below
  var budgetFilter1
  var durationFilter1
  var grossFilter1
  var imbdScoreFilter1
  var votesReceivedFilter1
  var budgetFilter2
  var durationFilter2
  var grossFilter2
  var imbdScoreFilter2
  var votesReceivedFilter2

  var genreFilter
  var contentRatingFilter


    // Sets up initial scatterplot
    // to show budget vs imdb score
    function setup() {

      var chart1 = d3.select('#chart1')

      // Add an input for the user to select
      // the x-axis variable
      var spanX = chart1.append('span')
        .text('Select X-Axis variable: ')

      var xInput = chart1.append('select')
        .attr('id','xSelect')
        .on('change',change_X_variable)
      .selectAll('option')
      .data(selectVariableData)
        .enter()
      .append('option')
        .attr('value', function (d) { return d.variable })
        .text(function (d) { return d.text ;})

      chart1.append('br')

      // Add an input for the user to select the
      // y-axis variable
      var spanY = chart1.append('span')
        .text('Select Y-Axis variable: ')

      var yInput = chart1.append('select')
        .attr('id','ySelect')
        .on('change',change_Y_variable)
      .selectAll('option')
        .data(selectVariableData)
        .enter()
      .append('option')
        .attr('value', function (d) {
          return d.variable
        })
        .text(function (d) {
          return d.text;
        })

      chart1.append('br')

      // Set X-axis domain and range
      xScale = d3.scaleLinear()
          .domain([d3.min(raw_data , d=> d.budget), d3.max(raw_data , d=> d.budget)])
          .range([50 , (width - 50)]);

      // Set Y-axis domain and range
      yScale = d3.scaleLinear()
          .domain([d3.min(raw_data , d=> d.imdb_score), d3.max(raw_data, d=> d.imdb_score)])
          .range([(height - 50) , 50]);

      // Add the SVG
      svg1 = chart1.append('svg')
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // initial setup of x axis
      xAxis = d3.axisBottom().scale(xScale);

      // initial setup of y axis
      yAxis = d3.axisLeft().scale(yScale);

      // Variables to hold the current x and y axis variables
      xVariable = "budget"
      yVariable = "imdb_score"

      // Create the x-axis
      svg1.append('g')
        .attr('class','axis')
        .attr('id','xAxis')
        .attr('transform', 'translate(0 ,' + (height - 50) + ')')
        .call(xAxis
          .tickFormat(function(d) { return d/1000000; }) )

      // add the x-axis label
      svg1.append('text')
        .attr('id', 'xAxisLabel')
        .attr('transform','translate(720 , 793)')
        .style("font-size", "16px")
        .text('Budget (millions of dollars)');

      // Create the y-axis
      svg1.append('g')
        .attr('class','axis')
        .attr('transform', 'translate(50 , 0)')
        .attr('id','yAxis')
        .call(yAxis)

      // add the y-axis label
      svg1.append("text")
        .attr('id','yAxisLabel')
        .attr("y", 25)
        .attr("x", 0)
        .style("font-size", "16px")
        .text("IMBD Score");

      // Chart 2 holds the filters
      var chart2 = d3.select('#chart2')

      chart2
        .append('p')
        .append('button')
            .style("border", "1px solid black")
        .text('Filter Data')
        .on('click', set_filters);

      chart2
        .append('button')
            .style("border", "1px solid black")
        .text('Remove Filters')
        .on('click', reset_filters);

      chart2.append('br')
      chart2.append('br')


      var spanFilters = chart2.append('span')
        .text('Enter/select filters for the data below')

      chart2.append('br')

      var spanFiltersInfo1 = chart2.append('span')
        .text('Click "Filter Data" to apply filters and "Remove Filters" to remove all filters')

      chart2.append('br')

      var spanFiltersInfo2 = chart2.append('span')
        .text('(Note: enter lower bounds in the first box and upper bounds in the second; fields can be left blank)')

      chart2.append('br')
      chart2.append('br')

      var budgetSpan = chart2.append('span')
        .text('Enter lower and/or upper bounds for the "Budget" variable (example: 125000, 40000000):   ')

      var budgetInput1 = chart2
        .append('input')
        .attr('id','budgetInput1')
        .attr('class','input');

      var budgetInput2 = chart2
        .append('input')
        .attr('id','budgetInput2')
        .attr('class','input');

      chart2.append('br')

      var grossSpan = chart2.append('span')
        .text('Enter lower and/or upper bound for the "Gross" variable (example: 10000000, 50000000):   ')

      var grossInput1 = chart2
        .append('input')
        .attr('id','grossInput1')
        .attr('class','input');

      var grossInput2 = chart2
        .append('input')
        .attr('id','grossInput2')
        .attr('class','input');

      chart2.append('br')

      var scoreSpan = chart2.append('span')
        .text('Enter lower and/or upper bounds for "IMDB Score" varibale (example: 3, 7.5):   ')

      var scoreInput1 = chart2
        .append('input')
        .attr('id','scoreInput1')
        .attr('class','input');

      var scoreInput2 = chart2
        .append('input')
        .attr('id','scoreInput2')
        .attr('class','input');

      chart2.append('br')

      var durationSpan = chart2.append('span')
        .text('Enter lower and/or upper bounds for "Duration" varibale in minutes (example: 80, 120):   ')

      var durationInput1 = chart2
        .append('input')
        .attr('id','durationInput1')
        .attr('class','input');

      var durationInput2 = chart2
        .append('input')
        .attr('id','durationInput2')
        .attr('class','input');

      chart2.append('br')

      var ratingsReceivedSpan = chart2.append('span')
        .text('Enter lower and/or upper bounds for "Number of IMDB Ratings Received" variable (example: 1000, 100000):   ')

      var ratingsReceivedInput1 = chart2
        .append('input')
        .attr('id','ratingsReceivedInput1')
        .attr('class','input');

      var ratingsReceivedInput2 = chart2
        .append('input')
        .attr('id','ratingsReceivedInput2')
        .attr('class','input');

      chart2.append('br')

      var genreSpan = chart2.append('span')
        .text('Select a genre to display only movies of that genre type   ')

      var genreSelect = chart2.append('select')
        .attr('id','genreSelect')
      .selectAll('option')
      .data(selectGenreData)
        .enter()
      .append('option')
        .attr('value', function (d) {
          return d.text
        })
        .text(function (d) {
          return d.text;
        })

      chart2.append('br')

      var ratingSpan = chart2.append('span')
        .text('Select a rating to display only movies with that rating   ')

      var ratingSelect = chart2.append('select')
        .attr('id','ratingSelect')
      .selectAll('option')
      .data(selectRatingData)
        .enter()
      .append('option')
        .attr('value', function (d) {
          return d.text
        })
        .text(function (d) {
          return d.text;
        })

      chart2.append('br')
      chart2.append('br')

    }

    // Filters the data based on the users
    // entered filters
    function filter_data() {
        filteredData = raw_data.filter(function (d) {
            return ((budgetFilter1 <= d.budget) && (d.budget <= budgetFilter2) && (durationFilter1 <= d.duration) && (d.duration <= durationFilter2)
                    && (grossFilter1 <= d.gross) && (d.gross <= grossFilter2) && (imbdScoreFilter1 <= d.imdb_score) && (d.imdb_score <= imbdScoreFilter2)
                    && (votesReceivedFilter1 <= d.num_voted_users) && (d.num_voted_users <= votesReceivedFilter2));
        })

        filteredData = filteredData.filter(function (d) {
            if (genreFilter === "All") {
              return true;
            } else {
              return d.genres.includes(genreFilter);
            }
        })

        filteredData = filteredData.filter(function (d) {
            if (contentRatingFilter === "Unrated") {
              return (d.content_rating === "Not Rated") || (d.content_rating === "Unrated");
            } else if (contentRatingFilter === "G") {
              return (d.content_rating === "G") || (d.content_rating === "TV-Y") || (d.content_rating === "TV-G");
            } else if (contentRatingFilter === "PG") {
              return (d.content_rating === "PG") || (d.content_rating === "TV-PG") || (d.content_rating === "TV-Y7");
            } else if (contentRatingFilter === "PG-13") {
              return (d.content_rating === "PG-13") || (d.content_rating === "TV-14");
            } else if (contentRatingFilter === "R") {
              return (d.content_rating === "R") || (d.content_rating === "TV-ma");
            } else {
              return true;
            }
        })
    }

    // changes the scale on the scatterplot to be appopriate for the current data
    function updateScalesFromData() {
        // change the x-axis scale
        xScale
          .domain([
            d3.min([0,d3.min(filteredData , function (d) { return d[xVariable] })]),
            d3.max([0,d3.max(filteredData , function (d) { return d[xVariable] })])
          ])
        // change the x axis scale
        xAxis.scale(xScale)
        if (xVariable === "budget" || xVariable === "gross") {
            d3.select('#xAxis')
              .transition()
              .duration(animation_duration)
              .call(xAxis
                .tickFormat(function(d) { return d/1000000 }) )
        } else {
            d3.select('#xAxis')
              .transition()
              .duration(animation_duration)
              .call(xAxis)
        }

        // change the y-axis scale
        yScale
          .domain([
            d3.min([0,d3.min(filteredData , function (d) { return d[yVariable] })]),
            d3.max([0,d3.max(filteredData , function (d) { return d[yVariable] })])
          ])
        // Change the scale on the y axis and redraw it.
        yAxis.scale(yScale)
        if (yVariable === "budget" || yVariable === "gross") {
            d3.select('#yAxis')
              .transition()
              .duration(animation_duration)
              .call(yAxis
                .tickFormat(function(d) { return d/1000000 }) )
        } else {
            d3.select('#yAxis')
              .transition()
              .duration(animation_duration)
              .call(yAxis)
        }
    }


    // Builds the scatterplot with the current filtered data
    function build_scatterplot() {
      filter_data()
      updateScalesFromData()

      var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .text("tooltip");

      var currentCircles = svg1.selectAll('.circle')
        .data(filteredData, d=> d.id);

      // Remove the exit selection
      currentCircles.exit()
        .transition()
        .duration(animation_duration)
        .delay(function (d,i) {
            return i
        })
        .remove();


      // Add circles in data that are currently not
      // on the screen
      var enter = currentCircles.enter()
        .append("g")
        .attr("class", "circle")

      // appends a circle to the g element
      enter
        .append("circle")
        .attr("id" , function(d) {
          return "dot-" + d.id;
       })
        .classed("dot", true)
        .attr("r", 7)
        .attr('cx', 0)
        .attr('cy', 0)
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
          .on('mouseover', function (d) {
           d3.select(this)
             .transition()
             .duration(500)
             .attr('r',20)
             .attr('stroke-width',3)
             tooltip.html("Movie Name: " + d.movie_title  + "<br>Director: "
             + d.director_name + "<br>Genre: " + d.genres + "<br>Year: " + d.title_year
             + "<br>Country: " + d.country + "<br>Rating: " + d.content_rating + "<br>Duration: "
             + d.duration + "mins" + "<br>Budget: " + d.budget + "USD" + "<br>Gross: " + d.gross + "USD" + "<br>Score: "
             + d.imdb_score)

            return tooltip.style("visibility", "visible");
         })
         .on('mouseout', function () {
           d3.select(this)
             .transition()
             .duration(500)
             .attr('r',10)
             .attr('stroke-width',1)
            return tooltip.style("visibility", "hidden");
         })
        // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
	        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	        // .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
          .on("click", function(d) {
            var clickedID = d.id

            var clicked = d3.selectAll(".clicked")

            clicked.each(function(d) {
                if (d.id != clickedID) {
                    d3.select("#dot-" + d.id)
                        .classed("clicked", false);
                }
            })

            d3.select("#dot-" +d.id)
                .classed("clicked", true);

        })

      d3.selectAll('circle')
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cx' , function (d) {
            return xScale(d[xVariable])
          })
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cy' , function (d) {
            return yScale(d[yVariable])
          });


      // Apply the positional update to all circles on the screen
      enter.merge(currentCircles)
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cx' , function (d) {
            return xScale(d[xVariable])
          })
          .transition()
          .duration(animation_duration)
          .delay(function (d,i) {
            return i
          })
          .attr('cy' , function (d) {
            return yScale(d[yVariable])
          });
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

        if (xVariable === "budget" || xVariable === "gross") {
            d3.select('#xAxis')
              .transition()
              .duration(animation_duration)
              .call(xAxis
                .tickFormat(function(d) { return d/1000000 }) )
        } else {
            d3.select('#xAxis')
              .transition()
              .duration(animation_duration)
              .call(xAxis)
        }

        d3.select('#xAxisLabel')
          .transition()
          .duration(animation_duration)
          .text(function(d) {
            if (xVariable === "budget") {
              return "Budget (millions of dollars)"
            } else if (xVariable === "duration") {
              return "Duration (minutes)"
            } else if (xVariable === "gross") {
              return "Gross (millions of dollars)"
            } else if (xVariable === "num_voted_users") {
              return "Number of IMBD Ratings Received"
            } else {
              return "IMDB Score"
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

        if (yVariable === "budget" || yVariable === "gross") {
            d3.select('#yAxis')
              .transition()
              .duration(animation_duration)
              .call(yAxis
                .tickFormat(function(d) { return d/1000000 }) )
        } else {
            d3.select('#yAxis')
              .transition()
              .duration(animation_duration)
              .call(yAxis)
        }

        d3.select('#yAxisLabel') // change the xAxisLabel
          .transition()
          .duration(animation_duration)
          .text(function(d) {
            if (yVariable === "budget") {
              return "Budget (millions of dollars)"
            } else if (yVariable === "duration") {
              return "Duration (minutes)"
            } else if (yVariable === "gross") {
              return "Gross (millions of dollars)"
            } else if (yVariable === "num_voted_users") {
              return "Number of IMBD Ratings Received"
            } else {
              return "IMDB Score"
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

    // Set the filters to the values given
    // in the select and text fields
    function set_filters() {
        budgetFilter1 = +d3.select('#budgetInput1').property('value')
        durationFilter1 = +d3.select('#durationInput1').property('value')
        grossFilter1 = +d3.select('#grossInput1').property('value')
        imbdScoreFilter1 = +d3.select('#scoreInput1').property('value')
        votesReceivedFilter1 = +d3.select('#ratingsReceivedInput1').property('value')

        if (d3.select('#budgetInput2').property('value').length == 0) {
          budgetFilter2 = d3.max(raw_data, function(d) { return d.budget })
        } else {
          budgetFilter2 = +d3.select('#budgetInput2').property('value')
        }
        if (d3.select('#durationInput2').property('value').length == 0) {
          durationFilter2 = d3.max(raw_data, function(d) { return d.duration })
        } else {
          durationFilter2 = +d3.select('#durationInput2').property('value')
        }
        if (d3.select('#grossInput2').property('value').length == 0) {
          grossFilter2 = d3.max(raw_data, function(d) { return d.gross })
        } else {
          grossFilter2 = +d3.select('#grossInput2').property('value')
        }
        if (d3.select('#scoreInput2').property('value').length == 0) {
          imbdScoreFilter2 = d3.max(raw_data, function(d) { return d.imdb_score })
        } else {
          imbdScoreFilter2 = +d3.select('#scoreInput2').property('value')
        }
        if (d3.select('#ratingsReceivedInput2').property('value').length == 0) {
          votesReceivedFilter2 = d3.max(raw_data, function(d) { return d.num_voted_users })
        } else {
          votesReceivedFilter2 = +d3.select('#ratingsReceivedInput2').property('value')
        }

        genreFilter = d3.select('#genreSelect').property('value')
        contentRatingFilter = d3.select('#ratingSelect').property('value')

        filteredData = []
        build_scatterplot();
    }

    // Reset the filters to the default values
    function reset_filters() {
        budgetFilter1 = 0
        durationFilter1 = 0
        grossFilter1 = 0
        imbdScoreFilter1 = 0
        votesReceivedFilter1 = 0

        budgetFilter2 = d3.max(raw_data, function(d) {
          return d.budget;
        })
        durationFilter2 = d3.max(raw_data, function(d) {
          return d.duration;
        })
        grossFilter2 = d3.max(raw_data, function(d) {
          return d.gross;
        })
        imbdScoreFilter2 = d3.max(raw_data, function(d) {
          return d.imdb_score;
        })
        votesReceivedFilter2 = d3.max(raw_data, function(d) {
          return d.num_voted_users;
        })

        genreFilter = "All"
        contentRatingFilter = "All"

        filteredData = [];
        build_scatterplot();
    }


    // Calls all functions needed
    // to create the inital scatterplot graph
    function initialize() {
        setup();
        reset_filters();
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
            d.title_year = +d.title_year;
            return d;
        });

        // save global reference to raw data
        raw_data = data;
        filteredData = data;

        initialize();
    });

}
