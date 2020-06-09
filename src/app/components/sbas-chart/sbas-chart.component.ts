import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { combineLatest } from 'rxjs';
import { map, tap, filter, } from 'rxjs/operators';

import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import { AppState } from '@store';
import * as scenesStore from '@store/scenes';
import * as queueStore from '@store/queue';

import { SubSink } from 'subsink';
import { ChartService, ScenesService } from '@services';
import { criticalBaselineFor, CMRProduct } from '@models';

export enum ChartDatasets {
  MASTER = 0,
  SELECTED = 1,
  DOWNLOADS = 2,
  WITHIN_BASELINE = 3,
  PRODUCTS = 4,
  MIN_CRITICAL = 5,
  MAX_CRITICAL = 6
}

@Component({
  selector: 'app-sbas-chart',
  templateUrl: './sbas-chart.component.html',
  styleUrls: ['./sbas-chart.component.scss']
})
export class SBASChartComponent implements OnInit, OnDestroy {


  private hoveredPair = [null, null];
  private hoveredLine;
  private selectedPair = [null, null];
  private scenes: CMRProduct[];
  private x;
  private xAxis;
  private y;
  private yAxis;
  private chart;
  private scatter;
  private line;
  private pairs;

  private selected: CMRProduct;
  private criticalBaseline: number;
  private hoveredProductId;
  private isFirstLoad = true;
  private subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private chartService: ChartService,
    private scenesService: ScenesService,
  ) { }

  ngOnInit(): void {
    const scenes$ = this.scenesService.scenes$();
    const pairs$ = this.scenesService.pairs$();

    this.subs.add(
        combineLatest(scenes$, pairs$).subscribe(([scenes, pairs]) => {
          this.scenes = scenes;
          this.pairs = pairs;

          if (this.chart) {
            d3.selectAll('#sbasChart > svg').remove();
          }

          this.makeSbasChart();
        })
    );
  }

  private makeSbasChart() {
    const margin = {top: 9, right: 30, bottom: 30, left: 60},
        width = 800 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    this.chart = d3.select('#sbasChart')
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform',
              `translate(${margin.left},${margin.top})`);

      const xExtent = d3.extent(
        this.scenes.map(s => s.metadata.temporal)
      );

      // Add X axis
      this.x = d3.scaleLinear()
        .domain(xExtent)
        .range([ 0, width  * 3 ]);

      this.xAxis = this.chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(this.x));

    const yExtent = d3.extent(
      this.scenes.map(s => s.metadata.perpendicular)
    );

    // Add Y axis
    this.y = d3.scaleLinear()
      .domain(yExtent)
      .range([ height, 0]);
    this.yAxis = this.chart.append('g')
      .call(d3.axisLeft(this.y));

    // Create the scatter variable: where both the circles and the brush take place
    this.scatter = this.chart.append('g')
      .attr('clip-path', 'url(#clip)');

    const zoom = d3.zoom()
        .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
        .extent([[0, 0], [width, height]])
        .on('zoom', _ => this.updateChart());

    this.scatter.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('cursor', 'pointer')
        .style('fill', 'transparent')
        .style('pointer-events', 'all')
        .call(zoom);

    // Add circles
    this.scatter.append('g')
      .selectAll('circle')
      .data(this.scenes)
      .enter()
      .append('circle')
        .attr('cx', (d: CMRProduct) => this.x(d.metadata.temporal) )
        .attr('cy', (d: CMRProduct) => this.y(d.metadata.perpendicular) )
        .attr('r', 8)
        .style('fill', '#61a3a9')
        .style('opacity', 0.5);

    this.line = d3.line()
        .x((product: any) => this.x(product.metadata.temporal))
        .y((product: any) => this.y(product.metadata.perpendicular));

    const lines = this.scatter.append('g')
        .attr('fill', 'none')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
      .selectAll('path');

    const self = this;
    lines
      .data(this.pairs)
      .join('path')
        .style('mix-blend-mode', 'multiply')
        .attr('class', 'base-line')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 3)
        .attr('cursor', 'pointer')
        .attr('d', pair => this.line(pair))
        .on('mouseover', function(d) {
          self.setHovered(d, d3.select(this));
        })
        .on('mouseleave', function(d) {
          self.clearHovered();
        })
        .on('click', p => this.setSelected(p));

    // Add a clipPath: everything out of this area won't be drawn.
    const clip = this.chart.append('defs').append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', width )
      .attr('height', height )
      .attr('x', 0)
      .attr('y', 0);
  }

  private updateChart() {
    // recover the new scale
    const newX = d3.event.transform.rescaleX(this.x);
    const newY = d3.event.transform.rescaleY(this.y);

    // update axes with these new boundaries
    this.xAxis.call(d3.axisBottom(newX));
    this.yAxis.call(d3.axisLeft(newY));

    // update circle position
    this.scatter
      .selectAll('circle')
        .attr('cx', (d: CMRProduct) => newX(d.metadata.temporal) )
        .attr('cy', (d: CMRProduct) => newY(d.metadata.perpendicular) );

    this.line = d3.line()
        .x((product: any) => newX(product.metadata.temporal))
        .y((product: any) => newY(product.metadata.perpendicular));

    this.scatter.selectAll('.base-line')
      .attr('d', pair => this.line(pair));

    if (this.selectedPair[0] !== null && this.selectedPair[1] !== null) {
      this.setSelected(this.selectedPair);
    }
  }

  private setHovered(pair, newHovered) {
    this.hoveredPair = pair;

    if (this.hoveredLine) {
      this.hoveredLine
        .style('mix-blend-mode', 'multiply')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 3);
    }

    newHovered
      .style('mix-blend-mode', 'normal')
      .attr('stroke', 'orange')
      .attr('stroke-width', 5);

    this.hoveredLine = newHovered;
  }

  private clearHovered() {
    this.hoveredPair = null;

    this.hoveredLine
      .style('mix-blend-mode', 'multiply')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3);
  }

  public setSelected = (pair) => {
    this.selectedPair = pair;

    this.scatter.select('.selected-line').remove();

    this.scatter.append('path')
      .attr('class', 'selected-line')
      .attr('stroke', 'red')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer')
      .attr('d', _ => this.line(pair));

  }

  private pairIds(pair) {
    return pair.map(product => product.id);
  }

  private areEqIds(p1, p2): boolean {
    return (
      p1[0] !== null && p2 !== null &&
      p1[0].id === p2[0].id &&
      p1[1].id === p2[1].id
    );
  }

  // A function that updates the chart when the user zoom and thus new boundaries are available
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
