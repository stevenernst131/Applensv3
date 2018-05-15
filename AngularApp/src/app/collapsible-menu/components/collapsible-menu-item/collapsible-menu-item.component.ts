import { Component, OnInit, ContentChildren, Input, AfterViewInit, QueryList, AfterContentInit, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { METHODS } from 'http';

@Component({
  selector: 'collapsible-menu-item',
  templateUrl: './collapsible-menu-item.component.html',
  styleUrls: ['./collapsible-menu-item.component.css'],
  animations: [
    trigger('expand', [
      state('shown' , style({ height: '*' })),
      state('hidden', style({ height: '0px' })),
      transition('* => *', animate('.1s'))
    ])
  ]
})
export class CollapsibleMenuItemComponent implements OnInit {

  @Input() menuItem: CollapsibleMenuItem;

  @Input() level: number = 0;

  hasChildren : boolean;

  constructor() { }

  ngOnInit() {
  }


  handleClick() {
    if (this.menuItem.subItems && this.menuItem.subItems.length > 1) {
      this.menuItem.expanded = !this.menuItem.expanded;
    }
    else {
      this.menuItem.onClick();
    }
  }

  isSelected() {
    if (this.menuItem.isSelected) {
      return this.menuItem.isSelected();
    }
    return false;
  }

  getPadding() {
    return (15 + this.level * 15) + 'px';
  }

}

export class CollapsibleMenuItem {
  label: string;
  onClick: Function;
  expanded: boolean = false;
  subItems: CollapsibleMenuItem[];
  isSelected: Function;

  constructor(label: string, onClick: Function, isSelected: Function, expanded: boolean = false, subItems: CollapsibleMenuItem[] = []) {
    this.label = label;
    this.onClick = onClick;
    this.expanded = expanded; 
    this.subItems = subItems;
    this.isSelected = isSelected;
  }
}
