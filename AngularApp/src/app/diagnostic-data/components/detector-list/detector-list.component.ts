import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { DetectorListRendering, DiagnosticData, DetectorResponse, DetectorStatus } from '../../models/detector';
import { DiagnosticService } from '../../services/diagnostic.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'detector-list',
  templateUrl: './detector-list.component.html',
  styleUrls: ['./detector-list.component.css']
})
export class DetectorListComponent extends DataRenderBaseComponent {

  constructor(private _diagnosticService: DiagnosticService) {
    super();
  }

  renderingProperties: DetectorListRendering;

  detectorResponses: any[] = [];

  DetectorStatus = DetectorStatus;

  protected processData(data: DiagnosticData) {
    super.processData(data);
    this.renderingProperties = <DetectorListRendering>data.renderingProperties;
    this.getDetectorResponses();
  }

  private getDetectorResponses() {

    this.renderingProperties.detectorIds.forEach(detector => {
      this._diagnosticService.getDetector(detector).subscribe(res => this.detectorResponses.push(this.getDetectorViewModel(res)));
    });

    // let detectorTasks = this.renderingProperties.detectorIds.map(detectorId => {
    //   return this._diagnosticService.getDetector(detectorId).map(response => { 
    //     console.log(response);
    //     return response;
    //   });
    // });

    // Observable.forkJoin(detectorTasks).subscribe((responses: DetectorResponse[]) => {
    //   console.log(responses);
    //   this.detectorResponses = responses;
    // });
  }

  private getDetectorViewModel(res: DetectorResponse) {
    return {
      title: res.metadata.name,
      status: res.status ? res.status : DetectorStatus.Critical,
      expanded: false,
      response: res
    }
  }

}
