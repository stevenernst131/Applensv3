import { Component } from '@angular/core';
import { DiagnosticData, DataTableRendering, Rendering, RenderingType } from '../../models/detector';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'data-summary',
  templateUrl: './data-summary.component.html',
  styleUrls: ['./data-summary.component.css']
})
export class DataSummaryComponent extends DataRenderBaseComponent {

  DataRenderingType = RenderingType.DataSummary;

  renderingProperties: Rendering;

  summaryViewModels: DataSummaryViewModel[];

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <Rendering>data.renderingProperties;

    this.createViewModel()
  }

  private createViewModel() {
    if (this.diagnosticData.table.rows.length > 0) {
      let viewModels: DataSummaryViewModel[] = [];
      let firstRow = this.diagnosticData.table.rows[0];
      let columns = this.diagnosticData.table.columns;
      for (let i: number = 0; i < columns.length; i++) {
        viewModels.push(<DataSummaryViewModel>{ name: columns[i].columnName, value: firstRow[i] });
      }

      this.summaryViewModels = viewModels;
    }
  }
}

class DataSummaryViewModel {
  value: string;
  name: string;
}