import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, private _resourceService: ResourceService) { }

  sideNavItems: SideNavItem[] = [];

  ngOnInit() {
    this.initializeSignals();
  }

  navigate(item: SideNavSubItem) {
    this.sideNavItems[0].subItems.forEach(item => item.selected = false);
    item.selected = true;
    this._router.navigate(item.link.split('/'), { relativeTo: this._activatedRoute });
  }

  initializeSignals() {

    this._diagnosticApiService.getDetectors(this._resourceService.getCurrentResourceId()).subscribe(detectorList => {
      let signals = new SideNavItem();
      signals.name = 'Detectors';
      signals.symbol = 'fa-signal';
      signals.expanded = true;

      detectorList.forEach(element => {
        signals.addSubItem(element.id, element.name, `signals/${element.id}`);
      });

      console.log(signals);

      this.sideNavItems.push(signals);
    });
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

  addSubItem(name: string, displayName: string, link: string) {
    this.subItems.push(<SideNavSubItem> {
      name: name,
      displayName: displayName,
      link: link,
      show: this.expanded,
      selected: false
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
