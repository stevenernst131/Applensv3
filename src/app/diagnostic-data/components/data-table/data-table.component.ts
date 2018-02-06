import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DiagnosticData } from '../../models/signal';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';

@Component({
  selector: 'data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent extends DataRenderBaseComponent {
  // All logic in base class

}
