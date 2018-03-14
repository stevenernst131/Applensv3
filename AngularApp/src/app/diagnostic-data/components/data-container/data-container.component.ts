import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'data-container',
  templateUrl: './data-container.component.html',
  styleUrls: ['./data-container.component.css']
})
export class DataContainerComponent implements OnInit {

  constructor() { }

  @Input() height: string = '200px';

  ngOnInit() {
  }

}
