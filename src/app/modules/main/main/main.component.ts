import { Component, OnInit } from '@angular/core';
import { ResourceTypeState, ResourceType } from '../../../shared/models/resources';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  showResourceTypeOptions: boolean = false;
  selectedResourceType: ResourceTypeState;
  resourceName: string;
  resourceTypes: ResourceTypeState[] = [
    {
      resourceType: ResourceType.Site,
      routeName: 'sites',
      displayName: 'Site',
      enabled : true 
    },
    {
      resourceType: ResourceType.Function,
      routeName: 'function',
      displayName: 'Function',
      enabled : false 
    },
    {
      resourceType: ResourceType.AppServiceEnvironment,
      routeName: 'hostingEnvironments',
      displayName: 'App Service Environment',
      enabled : true 
    }
  ];

  constructor(private _router: Router) { }

  ngOnInit() {
    this.selectedResourceType = this.resourceTypes[0];
  }

  onSubmit(form: any) {
    //TODO: handle different types
    this._router.navigate([this.selectedResourceType.routeName, form.resourceName ]);
  }

}
