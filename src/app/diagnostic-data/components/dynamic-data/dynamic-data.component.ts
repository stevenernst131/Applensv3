import { Component, OnInit, AfterViewInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, ComponentRef, Input } from '@angular/core';
import { TimeSeriesGraphComponent } from '../time-series-graph/time-series-graph.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { SignalGraphType, DiagnosticData } from '../../models/signal';
import { DataRenderBaseComponent, DataRenderer } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'dynamic-data',
  templateUrl: './dynamic-data.component.html',
  styleUrls: ['./dynamic-data.component.css'],
  entryComponents: [TimeSeriesGraphComponent, DataTableComponent]
})
export class DynamicDataComponent implements AfterViewInit {

  @Input() diagnosticData: DiagnosticData;

  @ViewChild('dynamicDataContainer', { read: ViewContainerRef }) dynamicDataContainer: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngAfterViewInit(): void {
    let component = this._findInputComponent(this.diagnosticData.renderingProperties.signalGraphType);
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    let viewContainerRef = this.dynamicDataContainer;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<DataRenderBaseComponent>componentRef.instance).diagnosticDataInput = this.diagnosticData;
  }

  private _findInputComponent(type: SignalGraphType): any {
    switch (type) {
      case SignalGraphType.TimeSeries:
        return TimeSeriesGraphComponent;
      case SignalGraphType.Table:
        return DataTableComponent;
      default:
        return null;
    }
  }

}
