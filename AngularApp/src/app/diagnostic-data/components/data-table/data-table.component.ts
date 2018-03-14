import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DiagnosticData, DataTableRendering } from '../../models/detector';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { camelCase } from '@swimlane/ngx-datatable/release/utils';

@Component({
  selector: 'data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent extends DataRenderBaseComponent {

  @ViewChild('myTable') table: any;

  columns: any[];
  rows: any[];

  grouped: boolean = true;

  renderingProperties: DataTableRendering;

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <DataTableRendering>data.renderingProperties;
    this.createNgxDataTableObjects();
  }

  private createNgxDataTableObjects() {
    this.columns = this.diagnosticData.table.columns.map(column => 
      <any>{ 
        name: column.columnName,
        resizable: true,
        sortable: true,
        prop: column.columnName
      });
    this.rows = [];

    this.diagnosticData.table.rows.forEach(row => {
      let rowObject: any = {};

      for (let i: number = 0; i < this.diagnosticData.table.columns.length; i++) {
        rowObject[this.diagnosticData.table.columns[i].columnName] = row[i];
      }

      this.rows.push(rowObject);
    });
  }

  private getKeyName(column: string) {
    return column.replace(' ', '').toLowerCase();
  }

  toggleExpandGroup(group) {
    this.table.groupHeader.toggleExpandGroup(group);
  } 

}
