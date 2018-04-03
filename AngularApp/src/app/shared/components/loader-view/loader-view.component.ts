import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'loader-view',
  templateUrl: './loader-view.component.html',
  styleUrls: ['./loader-view.component.css']
})
export class LoaderViewComponent implements OnInit {

  @Input()
  message?: string;

  constructor() { }

  ngOnInit() {
  }

}
