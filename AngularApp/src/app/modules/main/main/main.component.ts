import { Component, OnInit } from '@angular/core';
import { ResourceTypeState, ResourceType } from '../../../shared/models/resources';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import * as moment from 'moment';
import { TimeZones } from '../../../shared/models/datetime';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  showResourceTypeOptions: boolean = false;
  selectedResourceType: ResourceTypeState;
  resourceName: string;
  resourceTypes: ResourceTypeState[] = [
    {
      resourceType: ResourceType.Site,
      routeName: 'sites',
      displayName: 'App',
      enabled: true
    },
    {
      resourceType: ResourceType.Function,
      routeName: 'function',
      displayName: 'Function',
      enabled: false
    },
    {
      resourceType: ResourceType.AppServiceEnvironment,
      routeName: 'hostingEnvironments',
      displayName: 'App Service Environment',
      enabled: true
    }
  ];

  startTime: moment.Moment;
  endTime: moment.Moment;

  contentHeight: string;

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute) {
    this.endTime = moment.tz(TimeZones.UTC);
    this.startTime = this.endTime.clone().add(-1, 'days');

    this.contentHeight = window.innerHeight + 'px';
  }

  ngOnInit() {
    this.selectedResourceType = this.resourceTypes[0];
  }

  selectResourceType(type: ResourceTypeState) {
    if (type.enabled) {
      this.selectedResourceType = type; 
      this.showResourceTypeOptions = false
    }
  }

  onSubmit(form: any) {
    let startUtc = moment.tz(form.startTime.format('YYYY-MM-DD HH:mm'), TimeZones.UTC);
    let endUtc = moment.tz(form.endTime.format('YYYY-MM-DD HH:mm'), TimeZones.UTC);

    let timeParams = { 
      startTime: startUtc.format('YYYY-MM-DDTHH:mm'),
      endTime: endUtc.format('YYYY-MM-DDTHH:mm')
    }

    let navigationExtras: NavigationExtras = {
      queryParams: timeParams
    }

    this._router.navigate([this.selectedResourceType.routeName, form.resourceName.trim()], navigationExtras);
  }

}
