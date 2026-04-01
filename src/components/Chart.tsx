import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataPoint, ChartConfig } from '../types';

interface ChartProps {
  data: DataPoint[];
  config: ChartConfig;
}

export const Chart: React.FC<ChartProps> = ({ data, config }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const isMobile = window.innerWidth < 768;
    const margin = { 
      top: isMobile ? 40 : 60, 
      right: isMobile ? 20 : 40, 
      bottom: isMobile ? 80 : 100, 
      left: isMobile ? 40 : 60 
    };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x0 = d3.scaleBand<string>()
      .domain(Array.from(new Set(data.map(d => d.level1))))
      .rangeRound([0, width])
      .paddingInner(0.2)
      .paddingOuter(0.2);

    const x1 = d3.scaleBand<string>()
      .domain(Array.from(new Set(data.map(d => d.level2))))
      .rangeRound([0, x0.bandwidth()])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    const x2 = d3.scaleBand<string>()
      .domain(Array.from(new Set(data.map(d => d.level3))))
      .rangeRound([0, x1.bandwidth()])
      .paddingInner(0.05)
      .paddingOuter(0.05);

    const dataMax = d3.max(data, (d: DataPoint) => (typeof d.mean === 'number' ? d.mean : 0) + (typeof d.sd === 'number' ? d.sd : 0)) || 10;
    const yMax = config.yAxisMax && config.yAxisMax > 0 ? config.yAxisMax : dataMax * 1.1;
    
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0]);

    if (!config.yAxisMax) {
      y.nice();
    }

    let tickValues: number[] | undefined = undefined;
    if (config.yAxisStep && config.yAxisStep > 0) {
      tickValues = d3.range(0, yMax + config.yAxisStep / 2, config.yAxisStep);
    }

    // Grid Lines
    if (config.showGrid) {
      const gridAxis = d3.axisLeft(y).tickSize(-width).tickFormat(() => '');
      if (tickValues) gridAxis.tickValues(tickValues);

      g.append('g')
        .attr('class', 'grid')
        .call(gridAxis)
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-opacity', 0.7);
        
      g.selectAll('.grid .domain').remove();
    }

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickSize(0));
      
    xAxis.selectAll('text')
      .attr('dy', '2.5em')
      .style('font-weight', 'bold')
      .style('font-size', isMobile ? '10px' : '12px');

    if (isMobile) {
      xAxis.selectAll('text')
        .attr('transform', 'rotate(-15)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '1.5em');
    }

    // Subgroup labels
    const level1Groups = g.selectAll<SVGGElement, string>('.level1-group')
      .data(x0.domain())
      .enter()
      .append('g')
      .attr('class', 'level1-group')
      .attr('transform', d => `translate(${x0(d) || 0},0)`);

    level1Groups.each(function(l1) {
      const groupData = data.filter(d => d.level1 === l1);
      const l2Domain = Array.from(new Set(groupData.map(d => d.level2)));
      
      d3.select(this).selectAll('text.level2-axis')
        .data(l2Domain)
        .enter()
        .append('text')
        .attr('class', 'level2-axis')
        .attr('x', (d: string) => (x1(d) || 0) + x1.bandwidth() / 2)
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '8px' : '10px')
        .style('fill', '#666')
        .text((d: string) => d);
    });

    const yAxis = d3.axisLeft(y);
    if (tickValues) yAxis.tickValues(tickValues);

    const yAxisGroup = g.append('g')
      .call(yAxis);
      
    // Move tick marks to the right of the axis line
    yAxisGroup.selectAll('.tick line')
      .attr('x2', 6);

    // Bars
    const bars = g.selectAll<SVGGElement, DataPoint>('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d: DataPoint) => {
        const xPos = (x0(d.level1) || 0) + (x1(d.level2) || 0) + (x2(d.level3) || 0);
        return `translate(${xPos},0)`;
      });

    bars.append('rect')
      .attr('x', 0)
      .attr('y', (d: DataPoint) => y(typeof d.mean === 'number' ? d.mean : 0))
      .attr('width', x2.bandwidth())
      .attr('height', (d: DataPoint) => height - y(typeof d.mean === 'number' ? d.mean : 0))
      .attr('fill', (d: DataPoint) => d.color)
      .attr('stroke', (d: DataPoint) => d.outlineColor || 'none')
      .attr('stroke-width', (d: DataPoint) => d.outlineWidth || 0);

    // Error Bars
    if (config.showErrorBars) {
      bars.append('line')
        .attr('x1', x2.bandwidth() / 2)
        .attr('x2', x2.bandwidth() / 2)
        .attr('y1', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) - (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('y2', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) + (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5);

      bars.append('line')
        .attr('x1', x2.bandwidth() / 4)
        .attr('x2', x2.bandwidth() * 0.75)
        .attr('y1', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) + (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('y2', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) + (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5);

      bars.append('line')
        .attr('x1', x2.bandwidth() / 4)
        .attr('x2', x2.bandwidth() * 0.75)
        .attr('y1', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) - (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('y2', (d: DataPoint) => y((typeof d.mean === 'number' ? d.mean : 0) - (typeof d.sd === 'number' ? d.sd : 0)))
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5);
    }

    // Data Labels
    if (config.showDataLabels) {
      bars.append('text')
        .attr('x', x2.bandwidth() / 2)
        .attr('y', (d: DataPoint) => {
          const mean = typeof d.mean === 'number' ? d.mean : 0;
          const sd = typeof d.sd === 'number' ? d.sd : 0;
          return config.showErrorBars ? y(mean + sd) - 10 : y(mean) - 5;
        })
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', '500')
        .text((d: DataPoint) => typeof d.mean === 'number' ? d.mean.toFixed(2) : '');
    }

    // Titles
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', isMobile ? 20 : 30)
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '16px' : '20px')
      .style('font-weight', 'bold')
      .text(config.title);

    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', height + margin.top + (isMobile ? 50 : 70))
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '12px' : '14px')
      .text(config.xAxisTitle);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height + margin.top + margin.bottom) / 2)
      .attr('y', isMobile ? 12 : 20)
      .attr('text-anchor', 'middle')
      .style('font-size', isMobile ? '12px' : '14px')
      .text(config.yAxisTitle);

  }, [data, config]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 800 550"
        className="w-full h-full max-w-4xl"
      />
    </div>
  );
};
