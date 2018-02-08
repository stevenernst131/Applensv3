import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute) { }

  sideNavItems: SideNavItem[] = [];

  ngOnInit() {
    this.initializeSignals();
  }

  navigate(item: string) {
    this._router.navigate(['signals', item], { relativeTo: this._activatedRoute });
  }

  initializeSignals(){
    let signals = new SideNavItem();
    signals.name = 'Signals';
    signals.symbol = 'fa-signal';
    signals.expanded = true;

    signals.addSubItem('cpu', 'CPU Percent', 'signals/cpu');
    signals.addSubItem('frontends', 'Front Ends', 'signals/frontends');

    this.sideNavItems.push(signals);
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
      show: this.expanded
    });
  }
}

export interface SideNavSubItem {
  name: string;
  displayName: string;
  show: boolean;
  link: string;
}
