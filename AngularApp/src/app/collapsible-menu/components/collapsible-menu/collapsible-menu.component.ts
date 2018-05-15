import { Component, OnInit, Input } from '@angular/core';
import { CollapsibleMenuItem } from '../collapsible-menu-item/collapsible-menu-item.component';

@Component({
  selector: 'collapsible-menu',
  templateUrl: './collapsible-menu.component.html',
  styleUrls: ['./collapsible-menu.component.css']
})
export class CollapsibleMenuComponent implements OnInit {

  @Input() theme: string = 'dark';

  constructor() { }

  ngOnInit() {
  }

}