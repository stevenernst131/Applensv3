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
  error: string;

  matchingSites: ObserverSiteInfo[] = [];

  contentHeight: string;

  constructor(private _route: ActivatedRoute, private _router: Router, private _observerService: ObserverService, private _startupService: StartupService) {
    this.contentHeight = window.innerHeight + 'px';
  }

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
    }, (error: Response) => {
      this.error = error.status == 404 ? `App ${this.site} was not found` : `There was an error trying to find app ${this.site}`;
      this.loading = false;
    });
  }

  navigateToSite(matchingSite: ObserverSiteInfo) {
    let resourceArray: string[] = [
      'subscriptions', matchingSite.Subscription,
      'resourceGroups', matchingSite.ResourceGroupName,
      'providers', 'Microsoft.Web',
      'sites', matchingSite.SiteName];

    resourceArray.push('home');

    this._router.navigate(resourceArray, { queryParamsHandling: 'preserve' });
  }

}
