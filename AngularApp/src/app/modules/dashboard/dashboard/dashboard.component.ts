import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../shared/services/resource.service';
import * as moment from 'moment';
import { QueryParamsService } from '../../../shared/services/query-params.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  startTime: moment.Moment;
  endTime: moment.Moment;

  contentHeight: string;

  constructor(public resourceService: ResourceService, private _queryParamsService: QueryParamsService, 
    private _router: Router, private _activatedRoute: ActivatedRoute) {
      this.contentHeight = (window.innerHeight -50) + 'px';

      // Add time params to route if not already present
      if(!this._activatedRoute.queryParams['startTime'] || !this._activatedRoute.queryParams['endTime']) {
        let timeParams = { 
          'startTime': this._queryParamsService.startTime.format('YYYY-MM-DDTHH:mm'),
          'endTime': this._queryParamsService.endTime.format('YYYY-MM-DDTHH:mm')
        }
        this._router.navigate([], { queryParams: timeParams, relativeTo: this._activatedRoute });
      }
    }

  ngOnInit() {
    console.log(this._activatedRoute.snapshot.data);
    this.updateStartandEndTime();
  }

  updateTime() {
    this._queryParamsService.setStartAndEndTime(this.startTime, this.endTime);
    this.updateStartandEndTime();
  }

  updateStartandEndTime() {
    this.startTime = this._queryParamsService.startTime;
    this.endTime = this._queryParamsService.endTime;
  }

}
