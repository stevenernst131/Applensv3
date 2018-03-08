import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class QueryParamsService {

  public startTime: moment.Moment;
  public endTime: moment.Moment;
  public timeGrainInMinutes: number = 5;

  public adjustedTime: boolean = false;

  constructor() { }

  // TODO: use moment.js
  setStartAndEndTime(start: string, end: string) {
    this.startTime = start ? moment(start) : moment().subtract(1, 'days');

    let oneDayAfterStart = this.startTime.clone().add(1, 'days');

    this.endTime = (!end || oneDayAfterStart.isBefore(moment(end))) ? oneDayAfterStart : moment(end);

    console.log(this.startTime);
    console.log(this.endTime);
  }

}
