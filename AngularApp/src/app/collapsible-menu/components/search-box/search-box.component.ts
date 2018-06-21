import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent {

  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  set searchValue(val: string) {
    this.searchValueChange.emit(val);
  }
}
