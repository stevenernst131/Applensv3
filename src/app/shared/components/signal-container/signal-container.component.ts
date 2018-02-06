import { Component, OnInit } from '@angular/core';
import { DiagnosticApiService } from '../../services/diagnostic-api.service';
import { SignalResponse } from '../../../diagnostic-data/models/signal';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'signal-container',
  templateUrl: './signal-container.component.html',
  styleUrls: ['./signal-container.component.css']
})
export class SignalContainerComponent implements OnInit {

  constructor(private _route: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService) { }

  signalResponse:SignalResponse;

  signal: string;

  ngOnInit() {
    
    
    this._route.params.subscribe((params: Params) => {
      this.signal = this._route.snapshot.params['signal'];
      this._diagnosticApiService.invoke(this.signal).subscribe((response: SignalResponse) => {
        this.signalResponse = response;
        console.log(response);
      });
    })

    
  }

}
