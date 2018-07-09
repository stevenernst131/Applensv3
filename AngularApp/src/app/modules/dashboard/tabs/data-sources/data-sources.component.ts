import { Component, OnInit, Input } from '@angular/core';
import { DataProviderMetadata } from '../../../../diagnostic-data/models/detector';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.css']
})
export class DataSourcesComponent  {

  constructor() { }
  
  @Input()
  dataProvidersMetadata: DataProviderMetadata[];

}

