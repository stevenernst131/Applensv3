import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObserverService } from '../../../shared/services/observer.service';
import { StartupService } from '../../../shared/services/startup.service';
import { ObserverAseInfo } from '../../../shared/models/observer';

@Component({
  selector: 'hdi-landing',
  templateUrl: './hdi-landing.component.html',
  styleUrls: ['./hdi-landing.component.css']
})
export class HdiLandingComponent implements OnInit {

  clusterName: string;
  loading: boolean = true;

  constructor(private _route: ActivatedRoute, private _router: Router, private _observerService: ObserverService, private _startupService: StartupService) { }

  ngOnInit() {
    this.clusterName = this._route.snapshot.params['clusterName'];

    this.loading = false;

    let resourceArray: string[] = [
      'subscriptions', 'matchingAse.Subscription',
      'resourceGroups', 'matchingAse.ResourceGroupName',
      'hostingEnvironments', 'matchingAse.Name' ];

    this._router.navigate(resourceArray);

  }

}
