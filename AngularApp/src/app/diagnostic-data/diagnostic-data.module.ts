import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nvd3GraphComponent } from './components/nvd3-graph/nvd3-graph.component';
import { TimeSeriesGraphComponent } from './components/time-series-graph/time-series-graph.component';
import { NvD3Component, NvD3Module } from 'ng2-nvd3';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MarkdownModule } from 'ngx-markdown';

import 'd3';
import 'nvd3';
import { DataTableComponent } from './components/data-table/data-table.component';
import { DynamicDataComponent } from './components/dynamic-data/dynamic-data.component';
import { DataRenderBaseComponent } from './components/data-render-base/data-render-base.component';
import { DataContainerComponent } from './components/data-container/data-container.component';
import { TimeSeriesInstanceGraphComponent } from './components/time-series-instance-graph/time-series-instance-graph.component';
import { DataSummaryComponent } from './components/data-summary/data-summary.component';
import { EmailComponent } from './components/email/email.component';
import { InsightsComponent } from './components/insights/insights.component';
import { DetectorViewComponent } from './components/detector-view/detector-view.component';

import { INTERNAL_CONFIGURATION, DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from './config/diagnostic-data-config';
import { LoaderViewComponent } from './components/loader-view/loader-view.component';
import { DynamicInsightComponent } from './components/dynamic-insight/dynamic-insight.component';
import { MarkdownComponent } from './components/markdown/markdown.component';
import { DetectorListComponent, DetectorOrderPipe } from './components/detector-list/detector-list.component';
import { DiagnosticService } from './services/diagnostic.service';
import { ClipboardService } from './services/clipboard.service';
import { KustoTelemetryService } from './services/telemetry/kusto-telemetry.service';
import { AppInsightsTelemetryService } from './services/telemetry/appinsights-telemetry.service';
import { TelemetryService } from './services/telemetry/telemetry.service';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { StarRatingFeedbackComponent } from './components/star-rating-feedback/star-rating-feedback.component';
import { FormsModule } from '@angular/forms';
import { StatusIconComponent } from './components/status-icon/status-icon.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';

/**
 * THIS MODULE SHOULD NOT DEPEND ON ANY OTHER MODULES IN THIS PROJECT
 * 
 * In the future, this module could be used by both support center and applens
 */


@NgModule({
  imports: [
    CommonModule,
    NvD3Module,
    NgxDatatableModule,
    MarkdownModule.forRoot(),
    FormsModule
  ],
  providers: [
    ClipboardService
  ],
  declarations: [Nvd3GraphComponent, TimeSeriesGraphComponent, DataTableComponent, DynamicDataComponent, DataRenderBaseComponent,
    DataContainerComponent, TimeSeriesInstanceGraphComponent, DetectorViewComponent, DataSummaryComponent, EmailComponent, InsightsComponent,
    LoaderViewComponent, DynamicInsightComponent, MarkdownComponent, DetectorListComponent, DetectorOrderPipe, StarRatingComponent, StarRatingFeedbackComponent, 
    DropdownComponent, StatusIconComponent],
  exports: [FormsModule, TimeSeriesGraphComponent, DataTableComponent, DynamicDataComponent, DetectorViewComponent, DataSummaryComponent,
    LoaderViewComponent, StatusIconComponent],
})
export class DiagnosticDataModule {
  static forRoot(config: DiagnosticDataConfig = INTERNAL_CONFIGURATION): ModuleWithProviders {
    return {
      ngModule: DiagnosticDataModule,
      providers: [
        DiagnosticService,
        { provide: DIAGNOSTIC_DATA_CONFIG, useValue: config },
        KustoTelemetryService,
        AppInsightsTelemetryService,
        TelemetryService
      ]
    }
  }
 }
