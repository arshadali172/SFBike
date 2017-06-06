// // chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security

// compare to ease of getting between those places with public transit (time mainly)
// relationship between public transit and bike usage

    var margin = {top: 20, right: 20, bottom: 70, left: 40}
    var parseDate = d3.timeParse("%y-%m-%d");
    var parseTime= d3.timeParse("%H:%M");





 var width_demand = 500 - margin.left - margin.right,
height_demand = 400 - margin.top - margin.bottom;
var svg = d3.select("#demand").append("svg")
        .attr("width", width_demand + margin.left + margin.right)
        .attr("height", height_demand + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


function change(station_id) {

    svg.selectAll('.bar').remove();
    svg.selectAll('.x.axis').remove();
    svg.selectAll('.y.axis').remove();

    var addr = 'status_alldates_sf/status_alldates_sf_' + station_id + '.csv'
    console.log(addr)

    d3.csv(addr, function(error, csv_data) {

         var x = d3.scaleBand()
        .rangeRound([0, width_demand])
        .padding(0.2);

    var y = d3.scaleLinear().range([height_demand, 0]);    

     // csv_data = csv_data.filter(function(d) { 
     //    return +d.station_id  == station_id;});     
     var data = d3.nest()
      .key(function(d) { return d.Hour_Min;})
      .key(function(d) { return d.station_id;})
      .rollup(function(d) { 
       return d3.mean(d, function(g) {return +g.bikes_available; });
      }).entries(csv_data);

        data.forEach(function(d) {
            d.date = parseTime(d.key)
            d.Hour_Min = d.key
            d.value = +d.values[0].value;
        });


      x.domain(data.map(function(d,i) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

    var tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'white')
            .style('opacity', 0)

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat("%H:%M"))
               .tickValues(x.domain().filter(function(d, i) {
            return !(i % 16);
        }))

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height_demand + ")")
          .call(xAxis)

        .selectAll("text")
          .style("text-anchor", "middle")
          .attr("dx", "-.0em")
          .attr("dy", "1em")
          .attr("transform", "rotate(0)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Value ($)");

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect").attr("class", "bar")
            .style("fill", "steelblue")
            .attr("x", function(d) { return x(d.date); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height_demand - y(d.value); })
        .on('mouseover', function(d) {
            tooltip.transition()
                .style('opacity', .9)

            tooltip.html(math.round(+d.value) +' Bikes @ ' + d.Hour_Min + ' @ ' + station_id)
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top',  (d3.event.pageY - 30) + 'px');

            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .5)
                .style('fill', 'yellow')
        })
        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        
        // svg.transition()
        //     .duration(10000)
        //     .ease(d3.easeBounce);

     // .attr("y", function(d) { return y(d.value); })
            // .attr("height", function(d) { return height - y(d.value); })
            // .delay(function(d, i) {
            //     return i * 20;
            // })

});

}


d3.csv("BikeUsage_ByDate_Sf.csv", function(d) {
  d.Date = parseDate(d.Date);
  d.Count = +d.Count;
  return d;
}, function(error, data) {
  if (error) throw error;

  var height = 400 - margin.top - margin.bottom;
var width = 600 - margin.left - margin.right;

var myChart = d3.select('#time_series').append('svg')
        .style('background', '#E7E0CB')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
var g = myChart.append('g')
        .attr('transform', 'translate('+ margin.left +', '+ margin.top +')');


var x = d3.scaleTime()
    .rangeRound([0, width]);
var y = d3.scaleLinear()
    .rangeRound([height, 0]);
var line = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y(d.Count); });



  x.domain(d3.extent(data, function(d) { return d.Date; }));
  y.domain(d3.extent(data, function(d) { return d.Count; }));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b-%y")))
      .selectAll("text")    
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .attr('font-family', "sans-serif")
        .attr("font-size", '10px')
        .attr("fill", "#000")

  g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr('font-family', "sans-serif")
      .attr("font-size", '12px')
      .attr("fill", "#000")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Daily Trip Count");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
});

var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 2,
  draggableCursor: 'crosshair',
  center: new google.maps.LatLng(37.786978000000005,-122.39810800000001),
  zoom: 14,
  mapMaker: 'True',
  styles: [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
  ]
});

d3.csv("station_data_sf.csv", function(data) {
  var overlay = new google.maps.OverlayView();

  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
      .attr("class", "stations");
                            
    overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 10;
                  
      var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
                                
      var marker = layer.selectAll("svg")
        .data(d3.entries(data))
        .each(transform) 
        .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker");
     
      marker.append("svg:circle")
        .attr("r", 5)
        .attr("cx", padding)
        .attr("cy", padding)
        .on("mouseover", function(d) {
          change(+d.value.station_id)
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(d.value.name+'<br>'+d.value.dockcount+ ' Docks')
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });


      function transform(d) {
        if (d.value.lat) {
            pos = new google.maps.LatLng(d.value.lat, d.value.long);
            pos = projection.fromLatLngToDivPixel(pos);
            return d3.select(this)
              .style("left", (pos.x - padding) + "px")
              .style("top", (pos.y - padding) + "px")
              .attr('fill', 'black')     
        }
      }
    };
  };

  overlay.setMap(map);
});

















