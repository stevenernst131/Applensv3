import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { Rendering, RenderingType, DiagnosticData, InsightsRendering } from '../../models/detector';
import { Dictionary } from '../../utilities/extensions';
import { Insight, InsightStatus } from '../../models/insight';
import { DiagnosticService } from '../../services/diagnostic.service';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';

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

  constructor(protected telemetryService: TelemetryService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <InsightsRendering>data.renderingProperties;

    this.parseInsights();
  }

  private parseInsights() {
    let insights: Insight[] = [];
    let data = this.diagnosticData.table;

    let statusColumnIndex = 0;
    let insightColumnIndex = 1;
    let nameColumnIndex = 2;
    let valueColumnIndex = 3;
    let isExpandedIndex = 4;

    for (let i: number = 0; i < data.rows.length; i++) {
      let row = data.rows[i];
      let insight: Insight;
      let insightName = row[insightColumnIndex];
      if ((insight = insights.find(insight => insight.title === insightName)) == null) {
        let isExpanded: boolean = row.length > isExpandedIndex ? row[isExpandedIndex].toLowerCase() === 'true' : false
        insight = new Insight(row[statusColumnIndex], insightName, isExpanded);
        insights.push(insight);
      }

      let nameColumnValue = row[nameColumnIndex];
      if (nameColumnValue && nameColumnValue.length > 0) {
        insight.data[nameColumnValue] = row[valueColumnIndex];
      }
    }

    this.insights = insights;
  }

  isMarkdown(str: string) {
    return str.trim().startsWith('<markdown>') && str.endsWith('</markdown>');
  }

  getMarkdown(str: string) {
    return str.trim().replace('<markdown>', '').replace('</markdown>', '');
  }

  toggleInsightStatus(insight: any) {
    insight.showDetails = insight.hasData() && !insight.showDetails;
    this.logInsightClickEvent(insight.title, insight.showDetails);
  }

  logInsightClickEvent(insightName: string, showDetails: boolean) {
    let eventProps: { [name: string]: string } = {
      "Title": insightName,
      "IsExpanded": String(showDetails)
    };

    this.logEvent(TelemetryEventNames.InsightsTitleClicked, eventProps);
  }
}

