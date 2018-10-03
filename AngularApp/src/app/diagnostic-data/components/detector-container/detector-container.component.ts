import { Component, OnInit, Input } from '@angular/core';
import { DiagnosticService } from '../../services/diagnostic.service';
import { DetectorControlService } from '../../services/detector-control.service';
import { ActivatedRoute } from '@angular/router';
import { DetectorResponse } from '../../models/detector';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'detector-container',
  templateUrl: './detector-container.component.html',
  styleUrls: ['./detector-container.component.css']
})
export class DetectorContainerComponent implements OnInit {

  detectorResponse: DetectorResponse = null;
  error: any;

  private _detector: string;

  private _detectorSubscription: Subscription;
  private _updateSubscription: Subscription;
  private _detectorUpdateSubscription: Subscription;

  @Input() _detectorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  @Input() set detector(detector: string) {
    this._detectorSubject.next(detector);
  };

  constructor(private _route: ActivatedRoute, private _diagnosticService: DiagnosticService, public detectorControlService: DetectorControlService) { }

  ngOnInit() {
    this._updateSubscription = this.detectorControlService.update.subscribe(isValidUpdate => {
      if (isValidUpdate && this._detector) {
        this.refresh();
      }
    });

    this._detectorUpdateSubscription = this._detectorSubject.subscribe(detector => {
      if (detector) {
        this._detector = detector;
        this.refresh();
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribe(this._detectorUpdateSubscription);
    this._unsubscribe(this._updateSubscription);
  }

  refresh() {
    this.error = null;
    this.detectorResponse = null;
    this._unsubscribe(this._detectorSubscription);
    this.getDetectorResponse();
  }

  getDetectorResponse() {
    this._detectorSubscription = this._diagnosticService.getDetector(this._detector, this.detectorControlService.startTimeString, this.detectorControlService.endTimeString, this.detectorControlService.shouldRefresh,  this.detectorControlService.isInternalView)
      .subscribe((response: DetectorResponse) => {
        this.detectorResponse = response;
      }, (error: any) => {
        this.error = error;
      });
  }

  private _unsubscribe(sub: Subscription) {
    if(sub) {
      sub.unsubscribe();
    }
  }

}
