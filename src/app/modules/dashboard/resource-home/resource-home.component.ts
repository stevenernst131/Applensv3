import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../shared/services/resource.service';

@Component({
  selector: 'resource-home',
  templateUrl: './resource-home.component.html',
  styleUrls: ['./resource-home.component.css']
})
export class ResourceHomeComponent implements OnInit {

  resource: any;
  keys: string[];

  constructor(private _resourceService: ResourceService) { }

  ngOnInit() {
    this._resourceService.getCurrentResource().subscribe(resource => {
      if (resource) {
        this.resource = resource;
        this.keys = Object.keys(this.resource);
      }
    });
  }

}
