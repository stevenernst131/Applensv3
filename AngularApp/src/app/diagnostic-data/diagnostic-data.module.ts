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
import { DetectorViewComponent } from './components/detector-view/detector-view.component';
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
  declarations: [Nvd3GraphComponent, TimeSeriesGraphComponent, SignalComponent, DataTableComponent, DynamicDataComponent, DataRenderBaseComponent, DataContainerComponent, TimeSeriesInstanceGraphComponent, DetectorViewComponent],
  exports: [TimeSeriesGraphComponent, SignalComponent, DataTableComponent, DynamicDataComponent, DetectorViewComponent], 
})
export class DiagnosticDataModule { }
