import { Injectable } from '@angular/core';
import * as moment from 'moment';
import 'moment-timezone';
import { TimeZones } from '../models/datetime';

@Injectable()
export class QueryParamsService {

  public startTime: moment.Moment;
  public endTime: moment.Moment;
  public timeGrainInMinutes: number = 5;

  public adjustedTime: boolean = false;

  constructor() { }

  setStartAndEndTime(start: any, end: any) {
    let startTime: moment.Moment;
    let endTime: moment.Moment;
    if (start && end) {
      startTime = moment.tz(start, TimeZones.UTC);
      endTime = moment.tz(end, TimeZones.UTC);
    }
    else if (start) {
      startTime = moment.tz(start, TimeZones.UTC);
      endTime = startTime.clone().add(1, 'days');
    }
    else if (end) {
      endTime = moment.tz(end, TimeZones.UTC);
      startTime = endTime.clone().add(-1, 'days');
    }
    else {
      startTime = moment.tz(TimeZones.UTC).subtract(1, 'days');
      endTime = startTime.clone().add(1, 'days');
    }

    let oneDayAfterStart = startTime.clone().add(1,'days');
    if (oneDayAfterStart.isBefore(endTime)) {
      console.log('Time window greater than 24 hours... automatically reducing.');
      endTime = oneDayAfterStart;
    }

    this.startTime = startTime;
    this.endTime = endTime;
  }

}
