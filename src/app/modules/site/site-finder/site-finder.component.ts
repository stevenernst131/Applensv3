import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../../shared/services/site.service';
import { ObserverSiteInfo } from '../../../shared/models/observer';

@Component({
  selector: 'site-finder',
  templateUrl: './site-finder.component.html',
  styleUrls: ['./site-finder.component.css']
})
export class SiteFinderComponent implements OnInit {

  site: string;
  loading: boolean = true;

  matchingSites: ObserverSiteInfo[] = [];

  constructor(private _route: ActivatedRoute, private _router: Router, private _siteService: SiteService) { }

  ngOnInit() {
    this.site = this._route.snapshot.params['site'];

    this._siteService.getSite(this.site).subscribe(observerSiteResponse => {
      if (observerSiteResponse.details.length === 1) {
        let matchingSite = observerSiteResponse.details[0];
        this._router.navigate([`subscriptions/${matchingSite.Subscription}/resourceGroups/${matchingSite.ResourceGroupName}/sites/${matchingSite.SiteName}`]);
      }
      else if (observerSiteResponse.details.length > 1) {
        this.matchingSites = observerSiteResponse.details;
      }

      this.loading = false;
    });

    
  }

}
