import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../shared/services/resource.service';
import { ResourceServiceFactory } from '../../../shared/providers/resource.service.provider';
import { StartupService } from '../../../shared/services/startup.service';
import { SiteService } from '../../../shared/services/site.service';
import { ActivatedRoute } from '@angular/router/src/router_state';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(public resourceService: ResourceService, private _startupService: StartupService) { }

  ngOnInit() {

  }

}
