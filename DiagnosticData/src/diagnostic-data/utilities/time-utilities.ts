
import * as moment from 'moment';
import 'moment-timezone';


export class TimeUtilities {
    public static roundDownByMinute(date: moment.Moment, minutes: number) {
        // This will round down to closest minute, then round down to x minute.
        date.startOf('minute').minute(date.minute() - date.minute() % minutes);
    }
}

export class TimeZones {
    public static readonly UTC: string = 'Etc/UTC';
}