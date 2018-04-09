import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObserverSiteInfo } from '../../../shared/models/observer';
import { StartupService } from '../../../shared/services/startup.service';
import { ObserverService } from '../../../shared/services/observer.service';

@Component({
  selector: 'site-finder',
  templateUrl: './site-finder.component.html',
  styleUrls: ['./site-finder.component.css']
})
export class SiteFinderComponent implements OnInit {

  site: string;
  loading: boolean = true;

  matchingSites: ObserverSiteInfo[] = [];

  constructor(private _route: ActivatedRoute, private _router: Router, private _observerService: ObserverService, private _startupService: StartupService) { }

  ngOnInit() {
    this.site = this._route.snapshot.params['site'];

    this._observerService.getSite(this.site).subscribe(observerSiteResponse => {
      if (observerSiteResponse.details.length === 1) {
        let matchingSite = observerSiteResponse.details[0];
        this.navigateToSite(matchingSite);
      }
      else if (observerSiteResponse.details.length > 1) {
        this.matchingSites = observerSiteResponse.details;
      }

      this.loading = false;
    });
  }

  navigateToSite(matchingSite: ObserverSiteInfo) {
    let resourceArray: string[] = [
      'subscriptions', matchingSite.Subscription,
      'resourceGroups', matchingSite.ResourceGroupName,
      'sites', matchingSite.SiteName ];

    if (matchingSite.SlotName && matchingSite.SlotName.length > 0) {
      resourceArray.push('slots');
      resourceArray.push(matchingSite.SlotName);
    }

    resourceArray.push('home');

    this._router.navigate(resourceArray, { queryParamsHandling: 'preserve' });
  }

}
