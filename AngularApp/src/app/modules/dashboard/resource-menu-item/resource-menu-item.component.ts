import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../shared/services/resource.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

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

    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._activatedRoute
    };

    this._router.navigate(['./'], navigationExtras);
  }

}
