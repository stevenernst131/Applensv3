import { Component, OnInit, Input } from '@angular/core';
import { DetectorResponse, DataTableDataType, DiagnosticData, TimeSeriesRendering, DataTableResponseObject } from '../../models/detector';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphSeries, GraphPoint } from '../nvd3-graph/nvd3-graph.component';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';
import { Timestamp } from 'rxjs';
import { count } from 'rxjs/operators';
import { time } from 'd3';
import { TimeSeries } from '../../models/time-series';
import { QueryParamsService } from '../../../shared/services/query-params.service';

@Component({
  selector: 'time-series-graph',
  templateUrl: './time-series-graph.component.html',
  styleUrls: ['./time-series-graph.component.css']
})
export class TimeSeriesGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  constructor(private _queryParamsService: QueryParamsService) {
    super();
  }

  allSeries: TimeSeries[] = [];
  allSeriesNames: string[] = [];

  selectedSeries: GraphSeries[];

  renderingProperties: TimeSeriesRendering;
  dataTable: DataTableResponseObject;
  defaultValue: number = 0;

  startTime: Date;
  endTime: Date;
  timeGrain: number = 300000;

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {

      let start = new Date();
      start.setUTCDate(new Date().getUTCDate() - 1);
      let end = new Date();

      this.startTime = new Date(Math.round(start.getTime() / this.timeGrain) * this.timeGrain + this.timeGrain);
      this.endTime = new Date(Math.round(end.getTime() / this.timeGrain) * this.timeGrain);

      this.renderingProperties = <TimeSeriesRendering>data.renderingProperties
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
      data.table.rows.map(row => row[counterNameColumnIndex]).filter((item, index, array) => array.indexOf(item) === index);
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
        // let seriesName: string = column.columnName;
        // if (counterNameColumnIndex >= 0) {
        //   seriesName = this._getSeriesName(data.table.columns[counterNameColumnIndex].columnName, data.table.columns[counterNameColumnIndex].columnName);
        // }
        let timestamp = new Date(row[timestampColumn]);

        let point: TablePoint = <TablePoint>{
          timestamp: timestamp,
          value: parseFloat(row[columnIndex]),
          column: column.columnName,
          counterName: counterNameColumnIndex >= 0 ? data.table.columns[counterNameColumnIndex].columnName : null
        };

        tablePoints.push(point);

        //timeSeriesDictionary[seriesName].series.values.push(<GraphPoint>{ x: timestamp, y: parseFloat(row[data.table.columns.indexOf(column)]) })
      });
    });

    Object.keys(timeSeriesDictionary).forEach(key => {

      let pointsForThisSeries =
        tablePoints
          .filter(point => this._getSeriesName(point.column, point.counterName) === key)
          .sort((b, a) => { return a.timestamp.getTime() - b.timestamp.getTime() });

      let pointToAdd = pointsForThisSeries.pop();

      for (var d = new Date(this.startTime.getTime()); d < this.endTime; d.setTime(d.getTime() + this.timeGrain)) {
        let value = this.defaultValue;

        if (pointToAdd && d.getTime() === pointToAdd.timestamp.getTime()) {
          value = pointToAdd.value;

          pointToAdd = pointsForThisSeries.pop();
        }

        timeSeriesDictionary[key].series.values.push(<GraphPoint>{ x: new Date(d), y: value });
      }

      console.log(timeSeriesDictionary[key]);

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

interface TablePoint {
  timestamp: Date;
  value: number;
  column: string;
  counterName: string;
}
