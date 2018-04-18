import { Component, OnInit, Input } from '@angular/core';
import { DetectorResponse, DataTableDataType, DiagnosticData, Rendering, TimeSeriesPerInstanceRendering, DataTableResponseObject } from '../../models/detector';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { GraphSeries, GraphPoint } from '../nvd3-graph/nvd3-graph.component';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';
import { Timestamp } from 'rxjs';
import { count } from 'rxjs/operators';
import { time } from 'd3';
import { TimeSeries, InstanceTimeSeries } from '../../models/time-series';
import { TimeZones } from '../../utilities/time-utilities';
import * as momentNs from 'moment-timezone';
const moment = momentNs;

@Component({
  selector: 'time-series-instance-graph',
  templateUrl: './time-series-instance-graph.component.html',
  styleUrls: ['./time-series-instance-graph.component.css']
})
export class TimeSeriesInstanceGraphComponent extends DataRenderBaseComponent implements OnInit, DataRenderer {

  allSeries: TimeSeries[] = [];
  allSeriesNames: string[] = [];

  selectedSeries: GraphSeries[];

  renderingProperties: TimeSeriesPerInstanceRendering;
  dataTable: DataTableResponseObject;

  processData(data: DiagnosticData) {
    super.processData(data);

    if (data) {
      this.renderingProperties = <TimeSeriesPerInstanceRendering>data.renderingProperties;
      this.dataTable = data.table;
      this._processDiagnosticData(data);
      this.selectSeries();
    }
  }

  selectSeries() {
    this.selectedSeries = this.allSeries.map(series => series.series);
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

      let date = moment.tz(row[timestampColumn], TimeZones.UTC);
      let aggregatePoint: GraphPoint = aggregateSeries.series.values.find(point => point.x.isSame(date));
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

  private _getTimeStampColumn() {
    let timeStampColumn = this.renderingProperties.timestampColumnName ?
      this.dataTable.columns.findIndex(column => this.renderingProperties.timestampColumnName === column.columnName):
      this.dataTable.columns.findIndex(column => column.dataType === DataTableDataType.DateTime);

    return timeStampColumn;
  }

  private _getRoleInstanceColumn() {
    let timeStampColumn = this.renderingProperties.roleInstanceColumnName ?
      this.dataTable.columns.findIndex(column => this.renderingProperties.roleInstanceColumnName === column.columnName):
      this.dataTable.columns.findIndex(column => column.columnName === 'RoleInstance');

    this.renderingProperties.roleInstanceColumnName = this.dataTable.columns[timeStampColumn].columnName;

    return timeStampColumn;
  }

  private _getCounterNameColumn() {
    let timeStampColumn = this.renderingProperties.counterColumnName ?
      this.dataTable.columns.findIndex(column => this.renderingProperties.counterColumnName === column.columnName):
      this.dataTable.columns.findIndex(column => column.columnName !== this.renderingProperties.roleInstanceColumnName 
        && column.dataType == DataTableDataType.String);

    return timeStampColumn;
  }
}
