import { Component, OnInit } from '@angular/core';
import * as momentNs from 'moment';
import { DetectorControlService } from '../../services/detector-control.service';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';

const moment = momentNs;

@Component({
  selector: 'detector-control',
  templateUrl: './detector-control.component.html',
  styleUrls: ['./detector-control.component.css']
})
export class DetectorControlComponent implements OnInit {

  constructor(public _router: Router, private _activatedRoute: ActivatedRoute, public detectorControlService: DetectorControlService) { }

  startTime: string;
  endTime: string;

  ngOnInit() {
    this.detectorControlService.update.subscribe(validUpdate => {
      if (validUpdate) {
        this.startTime = this.detectorControlService.startTimeString;
        this.endTime = this.detectorControlService.endTimeString;
      }

      let timeParams = { 
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      }
      this._router.navigate([], { queryParams: timeParams, relativeTo: this._activatedRoute });

    });
  }

  setManualDate() {
    this.detectorControlService.setCustomStartEnd(this.startTime, this.endTime)
  }
}



