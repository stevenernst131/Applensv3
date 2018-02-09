import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObserverService } from '../../../shared/services/observer.service';
import { StartupService } from '../../../shared/services/startup.service';
import { ObserverAseInfo } from '../../../shared/models/observer';

@Component({
  selector: 'ase-finder',
  templateUrl: './ase-finder.component.html',
  styleUrls: ['./ase-finder.component.css']
})
export class AseFinderComponent implements OnInit {

  hostingEnvironment: string;
  loading: boolean = true;

  matchingAse: ObserverAseInfo;

  constructor(private _route: ActivatedRoute, private _router: Router, private _observerService: ObserverService, private _startupService: StartupService) { }

  ngOnInit() {
    this.hostingEnvironment = this._route.snapshot.params['hostingEnvironment'];

    this._observerService.getAse(this.hostingEnvironment).subscribe(observerAseResponse => {
      if (observerAseResponse && observerAseResponse.details) {
        this.matchingAse = observerAseResponse.details;
        this.navigateToAse(this.matchingAse);
      }

      this.loading = false;
    });
  }

  navigateToAse(matchingAse: ObserverAseInfo) {
    let resourceArray: string[] = [
      'subscriptions', matchingAse.Subscription,
      'resourceGroups', matchingAse.ResourceGroupName,
      'hostingEnvironments', matchingAse.Name ];

    this._router.navigate(resourceArray);
  }

}
