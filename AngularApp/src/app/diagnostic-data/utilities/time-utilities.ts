
import * as Moment from 'moment-timezone';


export class TimeUtilities {
    public static roundDownByMinute(date: Moment.Moment, minutes: number) {
        // This will round down to closest minute, then round down to x minute.
        date.startOf('minute').minute(date.minute() - date.minute() % minutes);
    }

    public static roundDown(date: Moment.Moment, duration: Moment.Duration) {
        duration.months() && date.startOf('month').month(date.month() - date.month() % duration.months());
        duration.days() && date.startOf('day').days(date.days() - date.days() % duration.days());
        duration.hours() && date.startOf('hour').hours(date.hours() - date.hours() % duration.hours());
        duration.minutes() && date.startOf('minute').minutes(date.minutes() - date.minutes() % duration.minutes());
    }
}

export class TimeZones {
    public static readonly UTC: string = 'Etc/UTC';
}