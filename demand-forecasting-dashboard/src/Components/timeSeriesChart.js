import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const TimeSeriesChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .attr('width', 800)
      .attr('height', 500)
      .append('g')
      .attr('transform', 'translate(50, 50)');

    const parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(d => {
      d.date = parseDate(d.date);
    });

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, 700]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales)])
      .range([350, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y-%m-%d'));
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', 'translate(0, 350)')
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append('g')
      .call(yAxis);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#8884d8')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.sales))
      )
      .append('title')  // Tooltip
      .text(d => `Sales: ${d.sales}`);
  }, [data]);

  if (!data || !Array.isArray(data)) {
    return <div>No data available</div>;
  }

  return <svg ref={chartRef}></svg>;
};

export default TimeSeriesChart;
