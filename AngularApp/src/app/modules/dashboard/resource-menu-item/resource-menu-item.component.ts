import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../shared/services/resource.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'resource-menu-item',
  templateUrl: './resource-menu-item.component.html',
  styleUrls: ['./resource-menu-item.component.css']
})
export class ResourceMenuItemComponent implements OnInit {

  constructor(public resourceService: ResourceService, private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
  }

  navigate() {
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

}
