import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'collapsible-menu',
  templateUrl: './collapsible-menu.component.html',
  styleUrls: ['./collapsible-menu.component.css']
})
export class CollapsibleMenuComponent implements OnInit {

  @Input() theme: string = 'dark';

  @Input() height: string = '100%';

  constructor() { }

  ngOnInit() {
  }

}