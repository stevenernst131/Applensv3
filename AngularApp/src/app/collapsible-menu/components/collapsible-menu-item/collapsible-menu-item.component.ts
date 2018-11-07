import { Component, Input, Pipe, PipeTransform} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject } from '../../../../../node_modules/rxjs';

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
export class CollapsibleMenuItemComponent {

  private _searchValueSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private searchValueLocal: string;

  @Input() menuItem: CollapsibleMenuItem;
  @Input() level: number = 0;
  @Input() set searchValue(value) {
    this._searchValueSubject.next(value);
  };

  children: CollapsibleMenuItem[];

  hasChildren : boolean;
  matchesSearchTerm: boolean = true;

  ngOnInit() {

    this.children = this.menuItem.subItems;
    this.hasChildren = this.menuItem.subItems && this.menuItem.subItems.length > 0;

    this._searchValueSubject.subscribe(searchValue => {
      this.searchValueLocal = searchValue;
      this.matchesSearchTerm = !this.searchValueLocal || this.menuItem.label.toLowerCase().indexOf(this.searchValueLocal.toLowerCase()) >= 0;
    });
  }

  handleClick() {
    if (this.menuItem.subItems && this.menuItem.subItems.length > 0) {
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
    return (15 + this.level * 12) + 'px';
  }

}

export class CollapsibleMenuItem {
  label: string;
  onClick: Function;
  expanded: boolean = false;
  subItems: CollapsibleMenuItem[];
  isSelected: Function;
  icon: string;

  constructor(label: string, onClick: Function, isSelected: Function, icon: string = null, expanded: boolean = false, subItems: CollapsibleMenuItem[] = []) {
    this.label = label;
    this.onClick = onClick;
    this.expanded = expanded; 
    this.subItems = subItems;
    this.isSelected = isSelected;
    this.icon = icon;
  }
}

@Pipe({
  name:'search',
  pure: false
})
export class SearchPipe implements PipeTransform {
  transform(items: CollapsibleMenuItem[], searchString: string) {
    return searchString && items ? items.filter(item => item.label.toLowerCase().indexOf(searchString.toLowerCase()) >= 0): items;
  }
}


@Pipe({
  name:'searchmatch',
  pure: false
})
export class SearchMatchPipe implements PipeTransform {
  transform(label: string, searchString: string) {
    if(searchString) {
      let matchIndex = label.toLowerCase().indexOf(searchString.toLowerCase());
      if(matchIndex >= 0) {
        return `${label.substr(0, matchIndex)}<b>${label.substr(matchIndex, searchString.length)}</b>${label.substr(matchIndex + searchString.length)}`
      }
    }

    return label;
  }
}