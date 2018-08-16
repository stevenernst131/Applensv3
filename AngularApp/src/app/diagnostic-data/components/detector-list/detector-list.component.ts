import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DetectorListRendering, DiagnosticData, DetectorResponse, HealthStatus, DetectorMetaData } from '../../models/detector';
import { DiagnosticService } from '../../services/diagnostic.service';
import { Observable } from 'rxjs/Observable';
import { StatusStyles } from '../../models/styles';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoadingStatus } from '../../models/loading';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';

@Component({
  selector: 'detector-list',
  templateUrl: './detector-list.component.html',
  styleUrls: ['./detector-list.component.css'],
  animations: [
    trigger('expand', [
      state('shown' , style({ height: '*' })),
      state('hidden', style({ height: '0px' })),
      transition('* => *', animate('.25s'))
    ])
  ]
})
export class DetectorListComponent extends DataRenderBaseComponent {

  LoadingStatus = LoadingStatus;

  renderingProperties: DetectorListRendering;

  detectorMetaData: DetectorMetaData[];
  detectorViewModels: any[];

  DetectorStatus = HealthStatus;

  errorDetectors: any[] = [];

  private childDetectorsList: any[] = [];
  private childDetectorsEventProperties = {};

  constructor(private _diagnosticService: DiagnosticService, protected telemetryService: TelemetryService) {
    super(telemetryService);
  }

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <DetectorListRendering>data.renderingProperties;
    this.getDetectorResponses();
  }

  private getDetectorResponses() {

    this._diagnosticService.getDetectors().subscribe(detectors => {
      this.detectorMetaData = detectors.filter(detector => this.renderingProperties.detectorIds.indexOf(detector.id) >=0);
      this.detectorViewModels = this.detectorMetaData.map(detector => this.getDetectorViewModel(detector));

      let indexCount = 0;
      this.detectorViewModels.forEach((metaData, index) => {
        metaData.request.subscribe((response: DetectorResponse) => {
          this.detectorViewModels[index] = this.updateDetectorViewModelSuccess(metaData, response);

          // Log all the children detectors
          var childDetector = {
            'ChildDetectorName': metaData.title,
            'ChildDetectorId': metaData.metadata.id,
            'ChildDetectorStatus': metaData.status
          }
          this.childDetectorsList.push(childDetector);

          indexCount++;
          if (indexCount >= this.detectorViewModels.length) {
            this.childDetectorsEventProperties['ChildDetectorsList'] = JSON.stringify(this.childDetectorsList);
            this.logEvent(TelemetryEventNames.ChildDetectorsSummary, this.childDetectorsEventProperties);
          }
        },
        (error) => {
          this.detectorViewModels[index].loadingStatus = LoadingStatus.Failed;
        });
      });      
    })
  }

  private retryRequest(metaData: any) {
    metaData.loadingStatus = LoadingStatus.Loading;
    metaData.request.subscribe((response: DetectorResponse) => {
      metaData = this.updateDetectorViewModelSuccess(metaData, response);
    },
    (error) => {
      metaData.loadingStatus = LoadingStatus.Failed;
    });
  }

  private getDetectorViewModel(detector: DetectorMetaData) {
    return {
      title: detector.name,
      metadata: detector,
      loadingStatus: LoadingStatus.Loading,
      status: null,
      statusColor: null,
      statusIcon: null,
      expanded: false,
      response: null,
      request: this._diagnosticService.getDetector(detector.id)
    }
  }

  private updateDetectorViewModelSuccess(viewModel: any, res: DetectorResponse) {
    let status = res.status.statusId;

    viewModel.loadingStatus = LoadingStatus.Success,
    viewModel.status = status;
    viewModel.statusColor = StatusStyles.getColorByStatus(status),
    viewModel.statusIcon = StatusStyles.getIconByStatus(status),
    viewModel.response = res;
    return viewModel;
  }

  toggleDetectorHeaderStatus(viewModel: any)
  {
    viewModel.expanded = viewModel.loadingStatus == LoadingStatus.Success && !viewModel.expanded;
    let clickDetectorEventProperties = {
      "ChildDetectorName": viewModel.title,
      "ChildDetectorId": viewModel.metadata.id,
      "IsExpanded": viewModel.expanded
    }

    // Log children detectors click
    this.logEvent(TelemetryEventNames.ChildDetectorClicked, clickDetectorEventProperties);
  }
}

@Pipe({
  name:'detectorOrder',
  pure: false
})
export class DetectorOrderPipe implements PipeTransform {
  transform(items: any[]) {
    return items.sort((a,b) => {     
      return a.status > b.status ? 1 : -1;
    });
  }
}
