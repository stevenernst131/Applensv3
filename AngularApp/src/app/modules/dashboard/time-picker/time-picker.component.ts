import { Component, OnInit } from '@angular/core';
import { QueryParamsService } from '../../../shared/services/query-params.service';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit {

  constructor(public queryParamsService: QueryParamsService, private _dateTimeAdapter: DateTimeAdapter<any>) {
    this._dateTimeAdapter.setLocale('en-GB');
  }

  startTime: Date;
  endTime: Date;

  ngOnInit() {
    this.startTime = this.queryParamsService.startTime;
    this.endTime = this.queryParamsService.endTime;
  }

}
