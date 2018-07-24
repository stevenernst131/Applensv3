import { Component } from '@angular/core';
import { DynamicInsightRendering, DiagnosticData } from '../../models/detector';
import { DynamicInsight, InsightStatus } from '../../models/insight';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { MarkdownService } from 'ngx-markdown';
import { TelemetryService } from '../../services/telemetry/telemetry.service';

@Component({
  selector: 'dynamic-insight',
  templateUrl: './dynamic-insight.component.html',
  styleUrls: ['./dynamic-insight.component.css', '../insights/insights.component.css']
})
export class DynamicInsightComponent extends DataRenderBaseComponent {

  renderingProperties: DynamicInsightRendering;

  insight: DynamicInsight;

  InsightStatus = InsightStatus;

  constructor(private _markdownService: MarkdownService, protected telemetryService: TelemetryService){
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <DynamicInsightRendering>data.renderingProperties;

    this.parseInsight();
  }

  private parseInsight() {

    // Make sure that we don't render a box within the insight
    this.renderingProperties.innerRendering.title = "";

    this.insight = <DynamicInsight> {
      title: this.renderingProperties.title,
      description: this._markdownService.compile(this.renderingProperties.description),
      status: this.renderingProperties.status,
      expanded: this.renderingProperties.expanded ? this.renderingProperties.expanded : true,
      innerDiagnosticData: <DiagnosticData>{
        renderingProperties: this.renderingProperties.innerRendering,
        table: this.diagnosticData.table
      }
    }
  }
}
