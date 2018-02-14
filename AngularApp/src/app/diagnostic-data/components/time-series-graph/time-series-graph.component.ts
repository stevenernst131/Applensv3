import { Component, OnInit, Input } from '@angular/core';
import { SignalResponse, DataTableDataType, DiagnosticData } from '../../models/signal';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphSeries, GraphPoint } from '../nvd3-graph/nvd3-graph.component';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';
import { Timestamp } from 'rxjs';
import { count } from 'rxjs/operators';
import { time } from 'd3';

@Component({
  selector: 'time-series-graph',
  templateUrl: './time-series-graph.component.html',
  styleUrls: ['./time-series-graph.component.css']
})
export class TimeSeriesGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  allSeries: TimeSeries[] = [];
  allSeriesNames: string[] = [];

  selectedSeries: GraphSeries[];

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {
      this._processDiagnosticData2(data);
      console.log(this.allSeries);
      this.selectSeries();
    }
  }

  selectSeries() {
      this.selectedSeries = this.allSeries.map(series => series.series);
  }

  private _processDiagnosticData2(data: DiagnosticData) {
    let timestampColumn = data.table.columns.findIndex(column => column.dataType === DataTableDataType.DateTime);
    let counterNameColumnIndex = data.table.columns.findIndex(column => column.dataType === DataTableDataType.String);
    let numberValueColumns = data.table.columns.filter(column => DataTableDataType.NumberTypes.indexOf(column.dataType) >= 0);

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

    data.table.rows.forEach(row => {
      
      numberValueColumns.forEach(column => {
        let seriesName: string = column.columnName;
        if (counterNameColumnIndex > 0) {
          seriesName = this._getSeriesName(data.table.columns[counterNameColumnIndex].columnName, data.table.columns[counterNameColumnIndex].columnName);
        }

        let timestamp = new Date(row[timestampColumn]);
        timeSeriesDictionary[seriesName].series.values.push(<GraphPoint>{ x: timestamp, y: parseFloat(row[data.table.columns.indexOf(column)]) })
      })
    })

    Object.keys(timeSeriesDictionary).forEach(key => {
      this.allSeries.push(timeSeriesDictionary[key]);
    });
  }

  private _getSeriesName(column: string, countername: string) {
    return `${countername}-${column}`;
  }

  private _processDiagnosticData(data: DiagnosticData) {

    let timestampColumn = data.table.columns.findIndex(column => column.dataType === DataTableDataType.DateTime);
    let valueColumn = data.table.columns.findIndex(column => DataTableDataType.NumberTypes.indexOf(column.dataType) >= 0);
    let roleInstanceColumn = data.table.columns.findIndex(column => column.columnName.toLowerCase() === 'roleinstance');
    let counterNameColumn = data.table.columns.findIndex(column => column.columnName.toLowerCase() === 'countername');

    if (counterNameColumn < 0) {
      counterNameColumn = data.table.columns.findIndex(column => column.dataType === DataTableDataType.String);
    }

    let graphSeries: InstanceTimeSeries[] = [];

    data.table.rows.forEach(row => {
      let aggregateSeries = graphSeries.find(series => series.name === row[counterNameColumn]);
      if (!aggregateSeries) {
        aggregateSeries = <InstanceTimeSeries>{
          name: row[counterNameColumn],
          aggregated: true,
          series: <GraphSeries>{ key: row[counterNameColumn], values: [] }
        };

        graphSeries.push(aggregateSeries);
        this.allSeriesNames.push(row[counterNameColumn]);
      }

      let date = new Date(row[timestampColumn]);
      let aggregatePoint: GraphPoint = aggregateSeries.series.values.find(point => point.x.getTime() === date.getTime());
      if (!aggregatePoint) {
        aggregatePoint = <GraphPoint>{ x: date, y: 0 }
        aggregateSeries.series.values.push(aggregatePoint);
      }

      aggregatePoint.y += parseFloat(row[valueColumn]);

      if (roleInstanceColumn >= 0) {
        let instanceSeries = graphSeries.find(series => series.name === row[counterNameColumn] && series.instance === row[roleInstanceColumn]);
        if (!instanceSeries) {
          instanceSeries = <InstanceTimeSeries>{
            name: row[counterNameColumn],
            aggregated: false,
            instance: row[roleInstanceColumn],
            series: <GraphSeries>{ key: `${row[roleInstanceColumn]}:${row[counterNameColumn]}`, values: [] }
          };

          graphSeries.push(instanceSeries);
        }

        instanceSeries.series.values.push(<GraphPoint>{ x: date, y: parseFloat(row[valueColumn]) });
      }

      this.allSeries = graphSeries;
    });
  }

}

export interface TimeSeries {
  name: string;
  series: GraphSeries
}

export interface InstanceTimeSeries extends TimeSeries {
  aggregated: boolean;
  instance: string;
}

