import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import 'moment-timezone';

declare let d3: any;

@Component({
  selector: 'nvd3-graph',
  templateUrl: './nvd3-graph.component.html',
  styleUrls: ['./nvd3-graph.component.css']
})
export class Nvd3GraphComponent implements OnInit {

  options: any;

  @Input() chartData: GraphSeries[]

  constructor() {
    this._setOptions();
  }

  ngOnInit() {
  }

  private _setOptions() {
    this.options = {
      chart: {
        type: 'lineChart',
        height: 200,
        margin: {
          top: 20,
          right: 40,
          bottom: 50,
          left: 50
        },
        //color: colors,
        useInteractiveGuideline: true,
        transitionDuration: 350,
        showLegend: true,
        stacked: true,
        clipEdge: false,
        showControls: false,
        x: function (d: any) { return moment(d.x).valueOf(); },
        y: function (d: any) { return d.y; },
        xAxis: {
          showMaxMin: false,
          axisLabel: 'Time (UTC)',
          tickSize: 10,
          staggerLabels: false,
          //tickFormat: function (d: any) { return d3.time.format('%m/%d %H:%M')(new Date(d)); }
          tickFormat: function (d: any) { return moment(d).utc().format('MM/DD HH:mm'); }
        },
        yAxis: {
          showMaxMin: false,
          tickFormat: d3.format('.2f'),
          axisLabel: '',
          axisLabelDistance: -10
        }
      }
    }
  }

}

export interface GraphPoint {
  x: moment.Moment;
  y: number;
}

export interface GraphSeries {
  key: string;
  values: GraphPoint[];
}
