var col;

$().ready(function() {


	vistaCarreras = new VistaFinanciamiento({el:"#carreras"});




});


var VistaFinanciamiento = Backbone.View.extend({
	el:"body",

	events: {
		"click button.button1": "renderPorCantidad",
		"click button.button2": "renderPorFinanciamiento",
		"click button.button3": "renderChart"
	},

	
	initialize: function() {
		$this = this;

		this.margin = {top: 20, right: 20, bottom: 30, left: 40},
    	this.width = 960 - this.margin.left - this.margin.right,
    	this.height = 500 - this.margin.top - this.margin.bottom;


		this.$el.append("<progress id='progressbar'></progress>");

		d3.tsv("./financiamiento2.txt", function(d) {
			$("#progressbar").hide();
			$this.data = d;
			$this.render();
		})
	},

	renderPorCantidad: function(e) {
		this.svg.selectAll(".axis")
			.transition()
			.remove();

		this.pack.value(function(d) { return 10; })
		this.mynodes = this.pack.nodes(this.nestedData[0]);

		this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }))
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return  d.x  })
			.attr("cy", function(d) { return  d.y  })
			.attr("r", function(d) { return d.r; });
		

	},

	renderPorFinanciamiento: function(e) {
		this.svg.selectAll(".axis")
			.transition()
			.remove();

		this.pack.value(function(d) { return d.financiamiento; });
		this.mynodes = this.pack.nodes(this.nestedData[0]);

		this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }))
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return  d.x  })
			.attr("cy", function(d) { return  d.y  })
			.attr("r", function(d) { return d.r; });
	},

	
	renderChart: function() {		
		$element = this.$el;

		var formatNumber = d3.format("s"); // for formatting integers
    
		var x = d3.scale.linear()
    		.range([0, this.width]);
    		

		var y = d3.scale.linear()
    		.range([this.height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");


		//x.domain(d3.extent(this.data2012, function(d) { return d.financiamiento; })).nice();
		//y.domain(d3.extent(this.data2012, function(d) { return d.psu_lenguaje; })).nice();
		x.domain(d3.extent(this.data2012, function(d) { return d.value})).nice();
		y.domain(d3.extent(this.data2012, function(d) { return d.psu_lenguaje; })).nice();

		this.svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + this.height + ")")
		  .call(xAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("x", this.width)
		  .attr("y", -6)
		  .style("text-anchor", "end")
		  .text("Financiamiento");

		this.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("PSU Lenguaje")

		this.node
			.transition()
			.duration(3000)
		  .attr("cx", function(d) { return x(d.financiamiento); })
		  .attr("cy", function(d) { return y(d.psu_lenguaje); })
		  .attr("r", function(d) { return d.values ? 0 : d.r});




	},

	render: function() {
		$element = this.$el;

		// Interactio Buttons at the top
		$element.append("<button class='button1'>Financiamineto (cantidad de establecimientos)</button>");
		$element.append("<button class='button2'>Financiamiento (x monto)</button>");
		$element.append("<button class='button3'>Financiamiento v/s PSU</button>");

		// Data arrangement
		this.data2012 = _.filter(this.data, function(d) {return d.agno==2011});
		this.data2012 = _.sortBy(this.data2012, function(d) {return d.financiamiento})

		this.nestedData = d3.nest()
							.key(function(d) {return "Chile";})
							.key(function(d) {
								if (d.financiamiento < 400000000)
									return "Bajo $400MM/año";
								else if (d.financiamiento < 700000000)
									return "$400MM a $700MM/año";
								else 
									return "Sobre $700MM/año";
							})
							.entries(this.data2012);

		format = d3.format(",d");

		var diameter = this.height;

		this.svg = d3.select(this.el).append("svg")
		    .attr("width", this.width + this.margin.left + this.margin.right)
		    .attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


		this.pack = d3.layout.pack()
			//.sort(null)
			.size([diameter - 4, diameter - 4])
			.children(function(d) {return d.values})
			.value(function(d) { return d.financiamiento; });


		this.mynodes = this.pack.nodes(this.nestedData[0]);

		this.node = this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }), function(d) {return d.key ? d.key : d.rbd})
			.enter().append("circle")
			.attr("class", nodeClass)
			//.attr("cx", function(d) { return  d.x  })
			//.attr("cy", function(d) { return  d.y  })
			//.attr("r", function(d) { return d.r; });


		function nodeClass(d) {
			if (d.values) {
				return "node"
			} else {
				return d.dependencia=="Municipal" ? "leaf node municipal" : "leaf node otro"; 
			}

		}


		this.node.on("mouseenter", function(d) {
			var event = d3.event;
			if (d.rbd) {
				$("#rollover").html(d.nombre_establecimiento+" ("+d.rbd + ") -"+d.nombre_comuna);
				$("#rollover").append("<br>Financiamiento 2011: $" + format(d.financiamiento));
				$("#rollover").append("<br>PSU Leng: " + d.psu_lenguaje +" PSU Mat: "  + d.psu_matematica);

			} else {
				$("#rollover").html(d.key+ " - " +d.values.length);

			}
		
			$("#rollover").show().css({"top":event.y+10, "left":event.x-200});
		});

		this.node.on("mouseleave", function(d) {
			$("#rollover").hide();
		});




		this.renderPorFinanciamiento();

		var legendData = [{color:"red", category:"Municipal"}, {color:"blue", category:"Part. Subvencioando"}]

		var legend = this.svg.selectAll(".legend")
		  .data(legendData)
		.enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		  .attr("x", this.width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
		  .style("fill", function(d) {return d.color});

		legend.append("text")
		  .attr("x", this.width - 24)
		  .attr("y", 9)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) { return d.category; });


	}

});



