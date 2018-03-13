import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryParamsService } from '../../../shared/services/query-params.service';
import { DateTimeAdapter } from 'ng-pick-datetime';
import * as moment from 'moment';
import { TimeZones } from '../../../shared/models/datetime';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit {

  startTime: moment.Moment;
  endTime: moment.Moment;

  constructor(private _queryParamsService: QueryParamsService, private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.updateStartandEndTime();
  }

  updateTime() {
    // This is a hack because after the datetime picker is used, it returns a date that
    // is in the local time instead of UTC, so these two lines get the UTC moment
    let startUtc = moment.tz(this.startTime.format('YYYY-MM-DD HH:mm'), TimeZones.UTC);
    let endUtc = moment.tz(this.endTime.format('YYYY-MM-DD HH:mm'), TimeZones.UTC);

    this._queryParamsService.setStartAndEndTime(startUtc, endUtc);
    this.updateStartandEndTime();

    let timeParams = { 
      'startTime': this._queryParamsService.startTime.format('YYYY-MM-DDTHH:mm'),
      'endTime': this._queryParamsService.endTime.format('YYYY-MM-DDTHH:mm')
    }
    this._router.navigate([], { queryParams: timeParams, relativeTo: this._activatedRoute });

  }

  updateStartandEndTime() {
    this.startTime = this._queryParamsService.startTime;
    this.endTime = this._queryParamsService.endTime;
  }

}
