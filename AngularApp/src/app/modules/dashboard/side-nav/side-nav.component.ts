import { Component, OnInit, PipeTransform, Pipe } from '@angular/core';
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

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, public resourceService: ResourceService) { }

  sideNavItems: SideNavItem[] = [];

  detectors: SideNavSubItem[] = [];
  detectorsLoading: boolean = true;

  currentRoutePath: string[]

  searchValue: string;

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

  navigateTo(path: string) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._activatedRoute
    };

    this._router.navigate(path.split('/'), navigationExtras);
  }

  initializeDetectors() {

    let detectors = new SideNavItem();
    detectors.name = 'Detectors';
    detectors.symbol = 'fa-signal';
    detectors.expanded = true;

    this.sideNavItems.push(detectors);

    this._diagnosticApiService.getDetectors(this.resourceService.getVersion(), this.resourceService.getCurrentResourceId(true)).subscribe(detectorList => {

      let childUrl = this._activatedRoute.firstChild ? this._activatedRoute.firstChild.snapshot.url : this._activatedRoute.snapshot.url;
      
      detectorList.forEach(element => {
        let detectorIsActive = childUrl && childUrl.length > 1 && childUrl[0].path === 'detectors' && childUrl[1].path === element.id;
        detectors.addSubItem(element.id, element.name, `detectors/${element.id}`, detectorIsActive);

        this.detectors.push(<SideNavSubItem>{ 
          name: element.id,
          selected: detectorIsActive,
          displayName: element.name,
          link: `detectors/${element.id}`
        });
      });

      this.detectorsLoading = false;
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
  searchValue: string = '';

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

@Pipe({
  name:'detectorSearch',
  pure: false
})
export class SearchPipe implements PipeTransform {
  transform(items: SideNavSubItem[], searchString: string) {
    return searchString && items ? items.filter(item => item.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0): items;
  }
}