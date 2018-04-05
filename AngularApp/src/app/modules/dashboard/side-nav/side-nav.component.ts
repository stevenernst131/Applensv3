import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, NavigationEnd } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, private _resourceService: ResourceService) { }

  sideNavItems: SideNavItem[] = [];

  currentRoutePath: string[]

  ngOnInit() {
    this.initializeDetectors();

    this.getCurrentRoutePath();

    this._router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      this.getCurrentRoutePath();
    });
  }

  private getCurrentRoutePath() {
    this.currentRoutePath = this._getLastNestedRoute(this._activatedRoute).snapshot.url.map(urlSegment => urlSegment.path);
  }

  private _getLastNestedRoute(activatedRoute: ActivatedRoute) {
      while (activatedRoute.firstChild) {
        activatedRoute = activatedRoute.firstChild;
      }
      return activatedRoute;
  }

  navigate(item: SideNavSubItem) {
    this.sideNavItems[0].subItems.forEach(item => item.selected = false);
    item.selected = true;

    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._activatedRoute
    };

    this._router.navigate(item.link.split('/'), navigationExtras);
  }

  openOnboardingFlow() {

    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._activatedRoute
    };

    this._router.navigate(['create'], navigationExtras);
  }

  initializeDetectors() {

    this._diagnosticApiService.getDetectors(this._resourceService.getCurrentResourceId()).subscribe(detectorList => {
      let detectors = new SideNavItem();
      detectors.name = 'Detectors';
      detectors.symbol = 'fa-signal';
      detectors.expanded = true;

      let childUrl = this._activatedRoute.firstChild ? this._activatedRoute.firstChild.snapshot.url : this._activatedRoute.snapshot.url;
      
      detectorList.forEach(element => {
        let detectorIsActive = childUrl && childUrl.length > 1 && childUrl[0].path === 'detectors' && childUrl[1].path === element.id;
        detectors.addSubItem(element.id, element.name, `detectors/${element.id}`, detectorIsActive);
      });

      this.sideNavItems.push(detectors);
    });
  }

  doesMatchCurrentRoute(expectedRoute: string) {
    return this.currentRoutePath && this.currentRoutePath.join('/') === expectedRoute;
  }

}

export class SideNavItem {
  name: string;
  symbol: string;
  expanded: boolean;
  subItems: SideNavSubItem[] = [];

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.subItems.forEach(item => item.show = !item.show);
  }

  addSubItem(name: string, displayName: string, link: string, isActive: boolean) {
    this.subItems.push(<SideNavSubItem>{
      name: name,
      displayName: displayName,
      link: link,
      show: this.expanded,
      selected: isActive
    });
  }
}

export interface SideNavSubItem {
  name: string;
  displayName: string;
  show: boolean;
  selected: boolean;
  link: string;
}
