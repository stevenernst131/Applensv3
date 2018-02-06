import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
  }

  navigate(item: string) {
    this._router.navigate(['signals', item], { relativeTo: this._activatedRoute });
  }

}
