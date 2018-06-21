import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CollapsibleMenuItemComponent } from '../collapsible-menu-item/collapsible-menu-item.component';

@Component({
  selector: 'section-divider',
  templateUrl: './section-divider.component.html',
  styleUrls: ['./section-divider.component.css'],
  animations: [
    trigger('expand', [
      state('shown' , style({ height: '*' })),
      state('hidden', style({ height: '0px' })),
      transition('* => *', animate('.1s'))
    ])
  ]
})
export class SectionDividerComponent implements OnInit {

  @Input() label: string;
  @Input() initiallyExpanded: boolean = true;
  @Input() collapsible: boolean = true;

  expanded: boolean;

  constructor() { }

  ngOnInit() {
    this.expanded = this.initiallyExpanded;
  }

  toUpperCase(label: string) {
    return label.toUpperCase();
  }

}
