import { Component, OnInit, Input } from '@angular/core';
import { DetectorResponse, DataTableDataType, DiagnosticData, TimeSeriesRendering, DataTableResponseObject, RenderingType } from '../../models/detector';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphSeries, GraphPoint } from '../nvd3-graph/nvd3-graph.component';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';
import { Timestamp } from 'rxjs';
import { count } from 'rxjs/operators';
import { time } from 'd3';
import { TimeSeries, TablePoint } from '../../models/time-series';
import * as momentNs from 'moment-timezone';
import { TimeUtilities, TimeZones } from '../../utilities/time-utilities';
import { TelemetryService } from '../../services/telemetry/telemetry.service';

const moment = momentNs;

@Component({
  selector: 'time-series-graph',
  templateUrl: './time-series-graph.component.html',
  styleUrls: ['./time-series-graph.component.css']
})
export class TimeSeriesGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  DataRenderingType = RenderingType.TimeSeries;

  constructor(protected telemetryService: TelemetryService) {
    super(telemetryService);
  }

  allSeries: TimeSeries[] = [];
  allSeriesNames: string[] = [];

  selectedSeries: GraphSeries[];

  renderingProperties: TimeSeriesRendering;
  dataTable: DataTableResponseObject;
  defaultValue: number = 0;
  graphOptions: any;
  customizeXAxis: boolean;

  timeGrain: momentNs.Duration;

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {
      this.renderingProperties = <TimeSeriesRendering>data.renderingProperties;
      this.graphOptions = this.renderingProperties.graphOptions;
      this.customizeXAxis = this.graphOptions && this.graphOptions.customizeX &&  this.graphOptions.customizeX === "true";
      this.timeGrain = this._getInitialTimegrain();
      this.dataTable = data.table;
      this._processDiagnosticData(data);
      this.selectSeries();
    }
  }

  selectSeries() {
    this.selectedSeries = this.allSeries.map(series => series.series);
  }

  private _processDiagnosticData(data: DiagnosticData) {
    let timestampColumn = this._getTimeStampColumnIndex();
    let counterNameColumnIndex = this._getCounterNameColumnIndex();
    let numberValueColumns = this._getCounterValueColumns();

    let uniqueCounterNames: string[] = [];
    if (counterNameColumnIndex >= 0) {
      // This gets unique values in counter name row
      uniqueCounterNames = data.table.rows.map(row => row[counterNameColumnIndex]).filter((item, index, array) => array.indexOf(item) === index);
    }

    let timeSeriesDictionary = {};

    numberValueColumns.forEach(column => {
      if (uniqueCounterNames.length > 0) {
        uniqueCounterNames.forEach(counterName => {
          let seriesName = this._getSeriesName(column.columnName, counterName);
          timeSeriesDictionary[seriesName] = <TimeSeries>{ name: seriesName, series: <GraphSeries>{ key: seriesName, values: [] } };
        });
      }
      else {
        let seriesName = column.columnName;
        timeSeriesDictionary[seriesName] = <TimeSeries>{ name: seriesName, series: <GraphSeries>{ key: seriesName, values: [] } };
      }
    });

    let tablePoints: TablePoint[] = [];

    let lastTimeStamp: momentNs.Moment = this.startTime;

    data.table.rows.forEach(row => {
      numberValueColumns.forEach(column => {
        let columnIndex: number = data.table.columns.indexOf(column);

        let timestamp = moment.tz(row[timestampColumn], TimeZones.UTC);

        if (!this.customizeXAxis && timestamp.isAfter(lastTimeStamp)) {
          let currentGcf = this._getGreatestCommonFactor(timestamp)
          if(currentGcf.asMilliseconds() < this.timeGrain.asMilliseconds()) {
            this.timeGrain = currentGcf;
          }
        }

        lastTimeStamp = timestamp;

        if (row[columnIndex]) {
          let point: TablePoint = <TablePoint>{
            timestamp: timestamp,
            value: parseFloat(row[columnIndex]),
            column: column.columnName,
            counterName: counterNameColumnIndex >= 0 ? row[counterNameColumnIndex] : null
          };
  
          tablePoints.push(point);
        }
      });
    });

    // If there is only 1 or 0 points, fallback on no data defaults
    if (data.table.rows.length <= 1) {
      this.timeGrain = this._getNoDataTimegrain();
    }

    if (!this.customizeXAxis) {
      this._prepareStartAndEndTime();
    }

    Object.keys(timeSeriesDictionary).forEach(key => {

      let pointsForThisSeries =
        tablePoints
          .filter(point => this._getSeriesName(point.column, point.counterName) === key)
          .sort((b, a) => { return !this.customizeXAxis ? a.timestamp.diff(b.timestamp) : b.timestamp.diff(a.timestamp) }); 

      if (!this.customizeXAxis) {
        let pointToAdd = pointsForThisSeries.pop();
       
        while (pointToAdd && pointToAdd.timestamp.isBefore(this.startTime)) {
          pointToAdd = pointsForThisSeries.pop();
        }

        for (var d = this.startTime.clone(); d.isBefore(this.endTime); d.add(this.timeGrain)) {
          let value = this.defaultValue;
          if (pointToAdd && d.isSame(moment.tz(pointToAdd.timestamp, TimeZones.UTC))) {
            value = pointToAdd.value;
  
            pointToAdd = pointsForThisSeries.pop();
          }
          timeSeriesDictionary[key].series.values.push(<GraphPoint>{ x: d.clone(), y: value });
        }
      }
      else {
        pointsForThisSeries.forEach(pointToAdd => {
          if (pointToAdd.timestamp.isBefore(this.startTime)) {
            this.startTime = pointToAdd.timestamp;
          }
          timeSeriesDictionary[key].series.values.push(<GraphPoint>{ x: moment.tz(pointToAdd.timestamp, TimeZones.UTC), y: pointToAdd.value });
        });
      }

      this.allSeries.push(timeSeriesDictionary[key]);
    });
  }

  private _getGreatestCommonFactor(timestamp: momentNs.Moment): momentNs.Duration {
    let minuteGcf = this._gcd(timestamp.minutes(), 60);
    if (minuteGcf !== 60) return moment.duration(minuteGcf, 'minutes'); 

    let hourGcf = this._gcd(timestamp.hours(), 24);
    if (hourGcf !== 24) return moment.duration(hourGcf, 'hours');

    let daysInMonth = timestamp.daysInMonth();
    let daysGcf = hourGcf === 24 ? this._gcd(timestamp.days(), daysInMonth): 0;
    if (daysGcf !== daysInMonth) return moment.duration(daysGcf, 'days');

    return moment.duration(1, 'month');

  }

  private _gcd(a: number, b: number) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
  }

  // Initial Time Grain: The max allowed for each range
  private _getInitialTimegrain(): momentNs.Duration {
    let rangeInMonths = Math.abs(this.startTime.diff(this.endTime, 'months'));
    let rangeInHours = Math.abs(this.startTime.diff(this.endTime, 'hours'));

    // Greater than 1 month: 1 month
    if (rangeInMonths > 1 || this.customizeXAxis && rangeInMonths === 1) {
      return momentNs.duration(1, 'months');
    }
    // 7 days -> 1 month: 1 day
    if (rangeInHours >= 168) {
      return momentNs.duration(7, 'days');
    }
    
    // 1 days -> 7 days
    if (rangeInHours > 24) {
      return momentNs.duration(1, 'days');
    }

    // else 1 hr
    return momentNs.duration(1, 'hours');
  }

  // No data time grain: The default in the case of one or no data points
  private _getNoDataTimegrain() {
    let rangeInMonths = Math.abs(this.startTime.diff(this.endTime, 'months'));
    let rangeInHours = Math.abs(this.startTime.diff(this.endTime, 'hours'));

    // Greater than 1 month: 1 month
    if (rangeInMonths > 1) {
      return momentNs.duration(1, 'months');
    }
    // 7 days -> 1 month: 1 day
    if (rangeInHours >= 168) {
      return momentNs.duration(1, 'days');
    }
    
    // 1 days -> 7 days
    if (rangeInHours > 24) {
      return momentNs.duration(1, 'hours');
    }

    // else 1 hr
    return momentNs.duration(5, 'minutes');
  }

  private _prepareStartAndEndTime() {
    console.log(this.startTime);
    let start = this.startTime;
    let end = this.endTime;

    TimeUtilities.roundDown(start, this.timeGrain);
    TimeUtilities.roundDown(end, this.timeGrain);
    end.minute(end.minute() - end.minute() % this.timeGrain.minutes()).second(0);
    this.startTime = start;
    this.endTime = end;

    console.log(this.startTime);
    console.log(this.endTime);
  }

  private _getSeriesName(column: string, countername: string) {
    return countername ? `${countername}-${column}` : column;
  }

  private _getTimeStampColumnIndex(): number {
    let columnIndex = this.renderingProperties.timestampColumnName ?
      this.dataTable.columns.findIndex(column => this.renderingProperties.timestampColumnName === column.columnName) :
      this.dataTable.columns.findIndex(column => column.dataType === DataTableDataType.DateTime);

    return columnIndex;
  }

  private _getCounterNameColumnIndex(): number {
    let columnIndex = this.renderingProperties.counterColumnName ?
      this.dataTable.columns.findIndex(column => this.renderingProperties.counterColumnName === column.columnName) :
      this.dataTable.columns.findIndex(column => column.dataType == DataTableDataType.String);

    return columnIndex;
  }

  private _getCounterValueColumns() {
    let columns = this.renderingProperties.seriesColumns ?
      this.dataTable.columns.filter(column => this.renderingProperties.seriesColumns.indexOf(column.columnName) > 0) :
      this.dataTable.columns.filter(column => DataTableDataType.NumberTypes.indexOf(column.dataType) >= 0);

    return columns;
  }

}
