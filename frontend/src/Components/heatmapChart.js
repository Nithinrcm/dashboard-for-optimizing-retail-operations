import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .attr('width', 800)
      .attr('height', 500)
      .append('g')
      .attr('transform', 'translate(50, 50)');

    // Flatten data and parse dates
    const flattenedData = Array.isArray(data[0]) ? data[0] : data;
    const parseDate = d3.timeParse('%Y-%m-%d');
    flattenedData.forEach(d => {
      d.date = parseDate(d.date);
      d.month = d3.timeFormat('%B')(d.date);
      d.week = d3.timeFormat('%U')(d.date);
    });

    // Set up scales and color
    const xScale = d3.scaleBand()
      .domain([...new Set(flattenedData.map(d => d.month))])
      .range([0, 700])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain([...new Set(flattenedData.map(d => d.week))])
      .range([350, 0])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(flattenedData, d => d.sales)]);

    // Draw tiles
    svg.selectAll('.tile')
      .data(flattenedData)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('x', d => xScale(d.month))
      .attr('y', d => yScale(d.week))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.sales))
      .append('title')  // Tooltip
      .text(d => `Sales: ${d.sales}`);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', 'translate(0, 350)')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);
  }, [data]);

  if (!data || !Array.isArray(data)) {
    return <div>No data available</div>;
  }

  return <svg ref={chartRef}></svg>;
};

export default Heatmap;
