import { Component, OnInit } from '@angular/core';
import { DetectorResponse, RenderingType } from '../../../diagnostic-data/models/detector';
import { Router, ActivatedRoute, Params, NavigationExtras } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';

@Component({
  selector: 'signal-container',
  templateUrl: './signal-container.component.html',
  styleUrls: ['./signal-container.component.css']
})
export class SignalContainerComponent implements OnInit {

  constructor(private _router: Router, private _route: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, private _resourceService: ResourceService) { }

  signalResponse: DetectorResponse;

  signal: string;

  resourceId: string;

  error: any;

  ngOnInit() {

    this.resourceId = this._resourceService.getCurrentResourceId();

    this._route.params.subscribe((params: Params) => {
      this.getDetectorResponse();
    });

    this._route.queryParams.subscribe((queryParams: Params) => {
      this.getDetectorResponse();
    })
  }

  refresh() {
    this.getDetectorResponse();
  }

  getDetectorResponse() {
    this.signalResponse = null;
    this.signal = this._route.snapshot.params['signal'];
    this._diagnosticApiService.getDetector(this.resourceId, this.signal, this._resourceService.getDiagnosticRoleQueryString())
    .map((response: DetectorResponse) => this.updateRenderingTypes(response)) //TODO: remove
    .subscribe((response: DetectorResponse) => {
      this.signalResponse = response;
    }, (error: any) => {
      this.error = error;
    });
  }

  onEditClicked(): void {
    
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._route
    };

    this._router.navigate(['edit'], navigationExtras);
  }

  //TODO: REMOVE
  updateRenderingTypes(response: DetectorResponse): DetectorResponse {
    let summary = response.dataset.find(data => data.renderingProperties.title === 'Summary of Backup jobs');
    if (summary) {
      summary.renderingProperties.renderingType = RenderingType.DataSummary;
    }

    let email = response.dataset.find(data => data.table.columns.find(x => x.columnName === 'Email') != null);
    if (email) {
      email.renderingProperties.renderingType = RenderingType.Email;
      email.renderingProperties.title = "Title";
    }

    let insight = response.dataset.find(data => data.table.columns.findIndex(x => x.columnName === 'Insights') >= 0);
    if (insight) {
      insight.table.columns = insight.table.columns.slice(0, 4);
      insight.renderingProperties.renderingType = RenderingType.Insights;
      insight.table.rows = [
        ['Critical', 'SQL Server backup failure', 'Error Count', '1'],
        ['Critical', 'SQL Server backup failure', 'Error Message', 'The process failed with an exit code -1'],
        ['Warning', 'Hostname Error', 'Error Message', 'Cannot resolve terecomiendo.blob.core.windows.net. No such host is known. Please delete backup schedule and recreate it to mitigate the issue.']
      ];
    }

    let last = response.dataset[response.dataset.length -1];
    if(last && !last.renderingProperties.title) {
      last.renderingProperties.title = "Failures";
      last.renderingProperties.description = "These are the failures for your application";
    }

    return response;
  }

}
