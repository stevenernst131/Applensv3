import { Component, OnInit, Input } from '@angular/core';
import { DataProviderMetadata } from '../../models/detector';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.css']
})
export class DataSourcesComponent implements OnInit {

  constructor() { }

  @Input()
  dataProvidersMetadata: DataProviderMetadata[];

  hasKustoQueries: boolean = false;

  ngOnInit() {

    if (this.dataProvidersMetadata && this.dataProvidersMetadata.length > 0) {
      this.dataProvidersMetadata.forEach(element => {
        if (element.providerName == "Kusto" && element.propertyBag.length > 0) {
          this.hasKustoQueries = true;
        }
      });
    }

  }
}
