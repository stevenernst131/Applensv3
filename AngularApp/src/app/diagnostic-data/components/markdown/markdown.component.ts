import { Component, Inject } from '@angular/core';
import { Rendering, DiagnosticData } from '../../models/detector';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { MarkdownService } from 'ngx-markdown';
import { ClipboardService } from '../../services/clipboard.service';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';

@Component({
  selector: 'markdown-view',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.css']
})
export class MarkdownComponent extends DataRenderBaseComponent {

  renderingProperties: Rendering;

  markdown: string;
  isPublic: boolean;

  constructor(private _markdownService: MarkdownService, private _clipboard: ClipboardService, @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig) {
    super();
    this.isPublic = config && config.isPublic;
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <Rendering>data.renderingProperties;

    this.createViewModel();
  }

  private createViewModel() {
    let rows = this.diagnosticData.table.rows;
    if(rows.length > 0 && rows[0].length > 0) {
      this.markdown = rows[0][0];
    }
  }

  copyMarkdown() {
    let mardownHtml = this._markdownService.compile(this.markdown);
    this._clipboard.copyAsHtml(mardownHtml);    
  }
}