import { Component } from '@angular/core';
import { Rendering, DiagnosticData } from '../../models/detector';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'markdown-view',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.css']
})
export class MarkdownComponent extends DataRenderBaseComponent {

  renderingProperties: Rendering;

  markdown: string;

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <Rendering>data.renderingProperties;

    this.createViewModel()
  }

  private createViewModel() {
    let rows = this.diagnosticData.table.rows;
    if(rows.length > 0 && rows[0].length > 0) {
      this.markdown = rows[0][0];
    }
  }
}