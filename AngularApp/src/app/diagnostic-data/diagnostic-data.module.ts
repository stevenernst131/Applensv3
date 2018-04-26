import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nvd3GraphComponent } from './components/nvd3-graph/nvd3-graph.component';
import { TimeSeriesGraphComponent } from './components/time-series-graph/time-series-graph.component';
import { SignalComponent } from './components/signal/signal.component';
import { NvD3Component, NvD3Module } from 'ng2-nvd3';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

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

import { INTERNAL_CONFIGURATION, DIAGNOSTIC_DATA_CONFIG } from './config/diagnostic-data-config';
import { LoaderViewComponent } from './components/loader-view/loader-view.component';
import { DynamicInsightComponent } from './components/dynamic-insight/dynamic-insight.component';

/**
 * THIS MODULE SHOULD NOT DEPEND ON ANY OTHER MODULES IN THIS PROJECT
 * 
 * In the future, this module could be used by both support center and applens
 */


@NgModule({
  imports: [
    CommonModule,
    NvD3Module,
    NgxDatatableModule
  ],
  providers: [
    { provide: DIAGNOSTIC_DATA_CONFIG, useValue: INTERNAL_CONFIGURATION }
  ],
  declarations: [Nvd3GraphComponent, TimeSeriesGraphComponent, SignalComponent, DataTableComponent, DynamicDataComponent, DataRenderBaseComponent,
    DataContainerComponent, TimeSeriesInstanceGraphComponent, DetectorViewComponent, DataSummaryComponent, EmailComponent, InsightsComponent,
    LoaderViewComponent, DynamicInsightComponent],
  exports: [TimeSeriesGraphComponent, SignalComponent, DataTableComponent, DynamicDataComponent, DetectorViewComponent, DataSummaryComponent,
    LoaderViewComponent],
})
export class DiagnosticDataModule { }
