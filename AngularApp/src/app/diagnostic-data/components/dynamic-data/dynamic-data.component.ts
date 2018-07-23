import { Component, OnInit, AfterViewInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, ComponentRef, Input } from '@angular/core';
import { TimeSeriesGraphComponent } from '../time-series-graph/time-series-graph.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { RenderingType, DiagnosticData, Rendering } from '../../models/detector';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';
import { BehaviorSubject } from 'rxjs';
import { DataSummaryComponent } from '../data-summary/data-summary.component';
import { EmailComponent } from '../email/email.component';
import { InsightsComponent } from '../insights/insights.component';
import * as momentNs from 'moment-timezone';
import { TimeSeriesInstanceGraphComponent } from '../time-series-instance-graph/time-series-instance-graph.component';
import { DynamicInsightComponent } from '../dynamic-insight/dynamic-insight.component';
import { MarkdownComponent } from '../markdown/markdown.component';
import { DetectorListComponent } from '../detector-list/detector-list.component';
const moment = momentNs;

@Component({
  selector: 'dynamic-data',
  templateUrl: './dynamic-data.component.html',
  styleUrls: ['./dynamic-data.component.css'],
  entryComponents: [TimeSeriesGraphComponent, DataTableComponent, DataSummaryComponent, EmailComponent, InsightsComponent, TimeSeriesInstanceGraphComponent,
     DynamicInsightComponent, MarkdownComponent, DetectorListComponent]
})
export class DynamicDataComponent implements OnInit {

  private dataBehaviorSubject: BehaviorSubject<DiagnosticData> = new BehaviorSubject<DiagnosticData>(null);

  @Input() set diagnosticData(data: DiagnosticData) {
    this.dataBehaviorSubject.next(data);
  };

  @Input() startTime: momentNs.Moment;
  @Input() endTime: momentNs.Moment;
  @Input() detectorEventProperties: any;

  @ViewChild('dynamicDataContainer', { read: ViewContainerRef }) dynamicDataContainer: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.dataBehaviorSubject.subscribe((diagnosticData: DiagnosticData) => {
      let component = this._findInputComponent((<Rendering>diagnosticData.renderingProperties).type);
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

      let viewContainerRef = this.dynamicDataContainer;
      viewContainerRef.clear();

      let componentRef = viewContainerRef.createComponent(componentFactory);
      let instance = <DataRenderBaseComponent>(componentRef.instance);
      instance.diagnosticDataInput = diagnosticData;
      instance.startTime = this.startTime;
      instance.endTime = this.endTime;
      instance.detectorEventProperties = this.detectorEventProperties;
    });
  }

  ngAfterViewInit(): void {
  }

  private _findInputComponent(type: RenderingType): any {
    switch (type) {
      case RenderingType.TimeSeries:
        return TimeSeriesGraphComponent;
      case RenderingType.Table:
        return DataTableComponent;
      case RenderingType.DataSummary:
        return DataSummaryComponent;
      case RenderingType.Email:
        return EmailComponent;
      case RenderingType.Insights: 
        return InsightsComponent;
      case RenderingType.TimeSeriesPerInstance:
        return TimeSeriesInstanceGraphComponent;
      case RenderingType.DynamicInsight:
        return DynamicInsightComponent;
      case RenderingType.Markdown:
        return MarkdownComponent;
      case RenderingType.DetectorList:
        return DetectorListComponent;
      default:
        return null;
    }
  }

}
