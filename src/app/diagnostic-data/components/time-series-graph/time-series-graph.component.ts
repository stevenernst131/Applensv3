import { Component, OnInit, Input } from '@angular/core';
import { SignalResponse, DataTableDataType, DiagnosticData } from '../../models/signal';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphSeries, GraphPoint } from '../nvd3-graph/nvd3-graph.component';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'time-series-graph',
  templateUrl: './time-series-graph.component.html',
  styleUrls: ['./time-series-graph.component.css']
})
export class TimeSeriesGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  allSeries: TimeSeries[];
  allSeriesNames: string[] = []; 
  
  selectedSeries: GraphSeries[];

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {
      this._processSignal(data);
      this.selectSeries();
    }
  }

  selectSeries() {
    if (this.allSeriesNames.length === 1) {
      this.selectedSeries = this.allSeries.filter(series => !series.aggregated).map(series => series.series);
    }
  }

  private _processSignal(data: DiagnosticData) {

    var timestampColumn = data.dataTable.columns.findIndex(column => column.dataType === DataTableDataType.DateTime);
    var valueColumn = data.dataTable.columns.findIndex(column => DataTableDataType.NumberTypes.indexOf(column.dataType) >= 0);
    var roleInstanceColumn = data.dataTable.columns.findIndex(column => column.columnName.toLowerCase() === 'roleinstance');
    var counterNameColumn = data.dataTable.columns.findIndex(column => column.columnName.toLowerCase() === 'countername');

    if (counterNameColumn < 0) {
      counterNameColumn = data.dataTable.columns.findIndex(column => column.dataType === DataTableDataType.String);
    }

    let graphSeries: TimeSeries[] = [];

    data.dataTable.rows.forEach(row => {
      let aggregateSeries = graphSeries.find(series => series.name === row[counterNameColumn]);
      if (!aggregateSeries) {
        aggregateSeries = <TimeSeries>{
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
          instanceSeries = <TimeSeries>{
            name: row[counterNameColumn],
            aggregated: false,
            instance: row[roleInstanceColumn],
            series: <GraphSeries>{ key: `${row[roleInstanceColumn]}:${row[counterNameColumn]}` , values: [] }
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
  aggregated: boolean;
  instance: string;
  series: GraphSeries
}

