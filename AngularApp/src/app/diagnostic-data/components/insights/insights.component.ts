import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { Rendering, RenderingType, DiagnosticData, InsightsRendering } from '../../models/detector';
import { Dictionary } from '../../utilities/extensions';

@Component({
  selector: 'insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css']
})
export class InsightsComponent extends DataRenderBaseComponent {

  DataRenderingType = RenderingType.Insights;

  renderingProperties: InsightsRendering;

  private insights: Insight[];

  private InsightStatus = InsightStatus;

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
}

class Insight {
  status: InsightStatus;
  title: string;
  data: Dictionary<string>;

  showDetails: boolean = false;

  constructor(status: string, title: string) {
    this.title = title;
    this.status = InsightStatus[status];
    this.data = {};
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  hasData(): boolean {
    return Object.keys(this.data).length > 0;
  }
}

enum InsightStatus {
  Critical,
  Warning,
  Info,
  Success
}