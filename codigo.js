var col;

$().ready(function() {


	vistaCarreras = new VistaFinanciamiento({el:"#carreras"});




});


var VistaFinanciamiento = Backbone.View.extend({
	el:"body",

	events: {
		"click button.button2": "renderPorFinanciamiento",
		"click button.button3": "renderChart",
		"click input[type=radio]" : "changeVulnerabilidad"
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

	changeVulnerabilidad : function(e) {
		opcion = $(e.target).val();
		if (opcion=="alta") {
			var filteredData = _.filter(this.data2011, function(d) {return d.ive_media>50})


			this.nestedData = d3.nest()
				.key(function(d) {return "Chile";})
				.entries(filteredData);



		} else if (opcion=="baja") {
			var filteredData = _.filter(this.data2011, function(d) {return d.ive_media<=50})


			this.nestedData = d3.nest()
				.key(function(d) {return "Chile";})
				.entries(filteredData);

			
		} else if (opcion=="todos") {
			var filteredData = this.data2011;


			this.nestedData = d3.nest()
				.key(function(d) {return "Chile";})
				.entries(filteredData);

			
		}

		if (this.currentView=="Financiamiento") {
			this.renderPorFinanciamiento();
		} else {
			this.renderChart();
		}

	},


	renderPorFinanciamiento: function(e) {
		this.currentView = "Financiamiento";

		this.svg.selectAll(".axis")
			.transition()
			.remove();

		this.pack.value(function(d) { return d.financiamiento; });
		this.mynodes = this.pack.nodes(this.nestedData[0]);

		/*************/
		this.node = this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }), function(d) {return d.key ? d.key : d.rbd});

		
		this.node
			.exit()
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return 0; })
			.attr("cy", function(d) { return 0; })
			.attr("r", function(d) { return 0; })
			.remove();
		
		this.node
			.enter()
			.append("circle")
			.attr("class", this.nodeClass)
			.on("mouseenter", function(d) {
				var event = d3.event;
				if (d.rbd) {
					$("#rollover").html(d.nombre_establecimiento+" ("+d.rbd + ") -"+d.nombre_comuna);
					$("#rollover").append("<br>Financiamiento 2011: $" + format(d.financiamiento));
					$("#rollover").append("<br>PSU Leng: " + d.psu_lenguaje +" PSU Mat: "  + d.psu_matematica);

				} else {
					$("#rollover").html(d.key+ " - " +d.values.length);

				}
			
				$("#rollover").show().css({"top":event.y+10, "left":event.x-200});
			})			
			.on("mouseleave", function(d) {
				$("#rollover").hide();
			});



		this.node
			.transition()
			.duration(3000)
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; })
		  .attr("r", function(d) { return d.r});

		/*************/
		/*
		this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }))
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return  d.x  })
			.attr("cy", function(d) { return  d.y  })
			.attr("r", function(d) { return d.r; });
			*/
	},

	
	renderChart: function() {		
		$element = this.$el;
		this.currentView = "PSUvsFinanciamiento";

		this.svg.selectAll(".axis")
			.remove();

		this.$opcionesVulnerabilidad.show();

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
		x.domain(d3.extent(this.data2011, function(d) { return d.value})).nice();
		y.domain(d3.extent(this.data2011, function(d) { return d.psu_lenguaje; })).nice();


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

		this.mynodes = this.pack.nodes(this.nestedData[0]);

		this.node = this.svg.selectAll(".node")
			.data(this.mynodes.filter(function(d) { return (d.key!="Chile"); }), function(d) {return d.key ? d.key : d.rbd});

		
		this.node
			.exit()
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return 0; })
			.attr("cy", function(d) { return 0; })
			.attr("r", function(d) { return 0; })
			.remove();
		
		this.node
			.enter()
			.append("circle")
			.attr("class", this.nodeClass)
			.on("mouseenter", function(d) {
				var event = d3.event;
				if (d.rbd) {
					$("#rollover").html(d.nombre_establecimiento+" ("+d.rbd + ") -"+d.nombre_comuna);
					$("#rollover").append("<br>Financiamiento 2011: $" + format(d.financiamiento));
					$("#rollover").append("<br>PSU Leng: " + d.psu_lenguaje +" PSU Mat: "  + d.psu_matematica);

				} else {
					$("#rollover").html(d.key+ " - " +d.values.length);

				}
			
				$("#rollover").show().css({"top":event.y+10, "left":event.x-200});
			})
			.on("mouseleave", function(d) {
				$("#rollover").hide();
			});



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
		//$element.append("<button class='button1'>Financiamineto (cantidad de establecimientos)</button>");
		$element.append("<button class='button2'>Financiamiento (espiral)</button>");
		$element.append("<button class='button3'>Financiamiento v/s PSU</button>");
		this.$opcionesVulnerabilidad = this.createSelectorVulnerabilidad();
		

		// Data arrangement
		this.data2011 = _.filter(this.data, function(d) {return d.agno==2011});
		this.data2011 = _.sortBy(this.data2011, function(d) {return d.financiamiento})

		this.nestedData = d3.nest()
							.key(function(d) {return "Chile";})
							.entries(this.data2011);

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
			.attr("class", this.nodeClass)

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
		this.renderLegend();
		$element.append(this.$opcionesVulnerabilidad);
	},

	createSelectorVulnerabilidad : function () {
		radio1 = $("<input>").attr("type", "radio")
			.attr("name", "optVulnerabilidad")
			.attr("id", "optVulTodos")
			.attr("type", "radio")
			.attr("value", "todos")
			.attr("checked", "checked");
		label1 = $("<label>").attr("for", "optVulTodos").text("Todos");
		radio2 = $("<input>").attr("type", "radio")
			.attr("name", "optVulnerabilidad")
			.attr("id", "optVulAlta")
			.attr("type", "radio")
			.attr("value", "alta")
		label2 = $("<label>").attr("for", "optVulAlta").text("Vulnerabilidad Alta (>50%)");
		radio3 = $("<input>").attr("type", "radio")
			.attr("name", "optVulnerabilidad")
			.attr("id", "optVulABaja")
			.attr("type", "radio")
			.attr("value", "baja")
		label3 = $("<label>").attr("for", "optVulABaja").text("Vulnerabilidad Baja (<=50%)");

		return $("<div id='selectorVulnerabilidad'>").append(radio1).append(label1).append(radio2).append(label2).append(radio3).append(label3);
	},

	nodeClass : function(d) {
		if (d.values) {
				return "node"
			} else {
				return d.dependencia=="Municipal" ? "leaf node municipal" : "leaf node otro"; 
			}
	},

	renderLegend : function() {
		var legendData = [{color:"blue", category:"Municipal"}, {color:"red", category:"Part. Subvencioando"}]

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
	},

	renderAxis : function() {

	}



});



