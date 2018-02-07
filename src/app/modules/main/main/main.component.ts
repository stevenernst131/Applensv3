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
      displayName: 'Site',
      enabled : true 
    },
    {
      resourceType: ResourceType.Function,
      displayName: 'Function',
      enabled : false 
    },
    {
      resourceType: ResourceType.AppServiceEnvironment,
      displayName: 'App Service Environment',
      enabled : false 
    }
  ];

  constructor(private _router: Router) { }

  ngOnInit() {
    this.selectedResourceType = this.resourceTypes[0];
  }

  onSubmit(form: any) {
    //TODO: handle different types
    this._router.navigate(['sites', form.resourceName ]);
  }

}
