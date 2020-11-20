function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    var svgWidth = window.innerWidth * 0.55;
    var svgHeight = window.innerHeight * 0.75;

    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]),
            d3.max(censusData, d => d[chosenXAxis])
            ])
            .range([0, chartWidth])
            .nice();

        return xLinearScale;

        }
    // function used for updating y-scale var upon click on axis label
    function yScale(censusData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]),
            d3.max(censusData, d => d[chosenYAxis])
            ])
            .range([chartHeight, 0])
            .nice();

        return yLinearScale;

        }

        // function used for updating xAxis var upon click on axis label
        function renderAxisX(newXScale, xAxis) {
            var bottomAxis = d3.axisBottom(newXScale);

            xAxis.transition()
                .duration(1000)
                .call(bottomAxis);

            return xAxis;
        }
        // function used for updating YAxis var upon click on axis label
        function renderAxisY(newYScale, yAxis) {
            var leftAxis = d3.axisLeft(newYScale);
    
            yAxis.transition()
                .duration(1000)
                .call(leftAxis);
    
            return yAxis;
            }

        // function used for updating circles group with a transition to
        // new circles
        function renderCircles(circlesGroup, newXScale, chosenXaxis) {

            circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]));

            return circlesGroup;
        }

         // function used for updating text group with a transition to
        // new texts
        function renderText(textGroup, newXScale, chosenXaxis, chosenYaxis) {
            if (!textGroup.empty()) {
                textGroup.remove();
            }
            
            textGroup = chartGroup.append('g')
                .selectAll("text")
                .data(censusData)
                .join("text")
                .text(d => d.abbr)
                .attr("dx", d => xLinearScale(d[chosenXAxis]))
                .attr("dy", d => yLinearScale(d[chosenYAxis]) + radius /4)
                .attr("class", "stateText");

            textGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]));

            return textGroup;
        }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        //x axis match
        if (chosenXAxis === "poverty") {
            var labelx = "In Poverty (%):";
        }
        else if (chosenXAxis === "income") {
            var labelx = "Household Income (Median $):";
        }
        else {
            var labelx = "Median Age:";
        }
        //y axis match
        if (chosenYAxis === "healthcare") {
            var labely = "Lacks Healthcare (%):";
        }
        else if (chosenYAxis === "obesity") {
            var labely = "Obesity (%):";
        }
        else {
            var labely = "Smokes (%)";
        }
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, 50])
            .html(function(d) {
            return (`${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return circlesGroup;                       
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(censusData) {

        // parse data
        censusData.forEach(function(data) {
            //y variables
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            //x variables
            data.poverty = +data.poverty;
            data.income = +data.income;
            data.age = +data.age;
            //circle label
            data.abbr = data.abbr;
        });

    // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
        var yLinearScale = yScale(censusData, chosenYAxis);


    // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

    // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            //.attr("transform", `translate(0, ${chartHeight})`)
            .call(leftAxis);

    // append initial circles
        var radius = 20;
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", radius)
            .attr("fill", "lightblue")
            .attr("opacity", ".75");


        var textGroup = chartGroup.append('g')
                .selectAll("text")
                .data(censusData)
                .join("text")
                .text(d => d.abbr)
                .attr("dx", d => xLinearScale(d[chosenXAxis]))
                .attr("dy", d => yLinearScale(d[chosenYAxis]) + radius /4)
                .attr("class", "stateText");


    // Create group for  3 x- axis labels
        var labelsGroupX = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var incomeLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 33)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median $)");

        var ageLabel = labelsGroupX.append("text")
            .attr("x", 0)
            .attr("y", 50)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

 
    // Create group for  3 Y- axis labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = labelsGroupY.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - margin.left + 60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var obesityLabel = labelsGroupY.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - margin.left + 40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

    var smokesLabel = labelsGroupY.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - margin.left + 20)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroupX.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxisX(xLinearScale, xAxis);

            // updates circles and texts with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            radius = 20;
            if (!textGroup.empty()) {
                textGroup.remove();
            }
            textGroup = chartGroup.append('g')
                .selectAll("text")
                .data(censusData)
                .join("text")
                .text(d => d.abbr)
                .attr("dx", d => xLinearScale(d[chosenXAxis]))
                .attr("dy", d => yLinearScale(d[chosenYAxis]) + radius / 4)
                .attr("class", "stateText");

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "income"){
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
        }
        });
    labelsGroupY.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderAxisY(yLinearScale, yAxis);

            // updates circles with new Y values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

            radius = 20;
            if (!textGroup.empty()) {
                textGroup.remove();
            }
            textGroup = chartGroup.append('g')
                .selectAll("text")
                .data(censusData)
                .join("text")
                .text(d => d.abbr)
                .attr("dx", d => xLinearScale(d[chosenXAxis]))
                .attr("dy", d => yLinearScale(d[chosenYAxis]) + radius / 4)
                .attr("class", "stateText");
                
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity"){
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            obesityLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
        }
        });
    }).catch(function(error) {
        console.log(error);
    });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);