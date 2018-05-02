import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { Rendering, RenderingType, DiagnosticData, InsightsRendering } from '../../models/detector';
import { Dictionary } from '../../utilities/extensions';
import { Insight, InsightStatus } from '../../models/insight';
import { DiagnosticService } from '../../services/diagnostic.service';

@Component({
  selector: 'insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css']
})
export class InsightsComponent extends DataRenderBaseComponent {

  DataRenderingType = RenderingType.Insights;

  renderingProperties: InsightsRendering;

  private insights: Insight[];

  InsightStatus = InsightStatus;

  constructor(private diagnosticService: DiagnosticService) {
    super();
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <InsightsRendering>data.renderingProperties;

    this.parseInsights();

    this.diagnosticService.getDetector('sample');
  }

  private parseInsights() {
    let insights: Insight[] = [];
    let data = this.diagnosticData.table;

    let statusColumnIndex = 0;
    let insightColumnIndex = 1;
    let nameColumnIndex = 2;
    let valueColumnIndex = 3;

    for (let i: number = 0; i < data.rows.length; i++) {
      let row = data.rows[i];
      let insight: Insight;
      let insightName = row[insightColumnIndex];
      if ((insight = insights.find(insight => insight.title === insightName)) == null) {
        insight = new Insight(row[statusColumnIndex], insightName);
        insights.push(insight);
      }

      let nameColumnValue = row[nameColumnIndex];
      if(nameColumnValue && nameColumnValue.length > 0) {
        insight.data[nameColumnValue] = row[valueColumnIndex];
      }
    }

    this.insights = insights;
  }

  isMarkdown(str: string) {
    return str.trim().startsWith('<markdown>') && str.endsWith('</markdown>');
  }

  getMarkdown(str: string) {
    return str.trim().replace('<markdown>','').replace('</markdown>','');
  }
}

