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
