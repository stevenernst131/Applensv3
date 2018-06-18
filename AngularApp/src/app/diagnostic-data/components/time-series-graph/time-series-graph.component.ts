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
const moment = momentNs;

@Component({
  selector: 'time-series-graph',
  templateUrl: './time-series-graph.component.html',
  styleUrls: ['./time-series-graph.component.css']
})
export class TimeSeriesGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  DataRenderingType = RenderingType.TimeSeries;

  constructor() {
    super();
  }

  allSeries: TimeSeries[] = [];
  allSeriesNames: string[] = [];

  selectedSeries: GraphSeries[];

  renderingProperties: TimeSeriesRendering;
  dataTable: DataTableResponseObject;
  defaultValue: number = 0;
  graphOptions: any;

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {

      let start = this.startTime;
      let end = this.endTime;
      let timeGrain = this.timeGrainInMinutes;

      TimeUtilities.roundDownByMinute(start, this.timeGrainInMinutes);
      TimeUtilities.roundDownByMinute(end, this.timeGrainInMinutes);
      end.minute(end.minute() - end.minute() % timeGrain).second(0);
      this.startTime = start;
      this.endTime = end;

      this.renderingProperties = <TimeSeriesRendering>data.renderingProperties;
      this.graphOptions = this.renderingProperties.graphOptions;
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

    data.table.rows.forEach(row => {

      numberValueColumns.forEach(column => {
        let columnIndex: number = data.table.columns.indexOf(column);

        let timestamp = moment.tz(row[timestampColumn], TimeZones.UTC);

        let point: TablePoint = <TablePoint>{
          timestamp: timestamp,
          value: parseFloat(row[columnIndex]),
          column: column.columnName,
          counterName: counterNameColumnIndex >= 0 ? row[counterNameColumnIndex] : null
        };

        tablePoints.push(point);
      });
    });

    Object.keys(timeSeriesDictionary).forEach(key => {

      let pointsForThisSeries =
        tablePoints
          .filter(point => this._getSeriesName(point.column, point.counterName) === key)
          .sort((b, a) => { return a.timestamp.diff(b.timestamp) });

      let pointToAdd = pointsForThisSeries.pop();

      for (var d = this.startTime.clone(); d.isBefore(this.endTime); d.add(this.timeGrainInMinutes, 'minutes')) {
        let value = this.defaultValue;

        if (pointToAdd && d.isSame(moment.tz(pointToAdd.timestamp, TimeZones.UTC))) {
          value = pointToAdd.value;

          pointToAdd = pointsForThisSeries.pop();
        }

        timeSeriesDictionary[key].series.values.push(<GraphPoint>{ x: d.clone(), y: value });
      }

      this.allSeries.push(timeSeriesDictionary[key]);
    });
  }

  private _getSeriesName(column: string, countername: string) {
    return countername ? `${countername}-${column}`: column;
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
