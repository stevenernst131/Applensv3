import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GithubApiService } from '../../../shared/services/github-api.service';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { QueryResponse, CompilerResponse } from '../../../diagnostic-data/models/compiler-response';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { Package } from '../../../shared/models/package';
import { ApplensDiagnosticService } from '../services/applens-diagnostic.service';
import { AuthService } from '../../../shared/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import * as momentNs from 'moment';
import { TimeZones } from '../../../shared/models/datetime';
import { DetectorControlService } from '../../../diagnostic-data/services/detector-control.service';

const moment = momentNs;

export enum DevelopMode {
  Create,
  Edit,
  EditMonitoring,
  EditAnalytics
}

@Component({
  selector: 'onboarding-flow',
  templateUrl: './onboarding-flow.component.html',
  styleUrls: ['./onboarding-flow.component.css']
})
export class OnboardingFlowComponent implements OnInit, OnDestroy {

  @Input() mode: DevelopMode = DevelopMode.Create;
  @Input() detectorId: string = '';
  @Input() dataSource: string = '';
  @Input() timeRange: string = '';
  @Input() startTime: momentNs.Moment = moment.tz(TimeZones.UTC).subtract(1, 'days');
  @Input() endTime: momentNs.Moment =  moment.tz(TimeZones.UTC);

  fileName: string;
  editorOptions: any;
  code: string;
  resourceId: string;
  queryResponse: QueryResponse<DetectorResponse>;
  errorState: any;
  buildOutput: string[];
  runButtonDisabled: boolean;
  publishButtonDisabled: boolean;
  runButtonText: string;
  runButtonIcon: string;
  publishButtonText: string;

  modalPublishingButtonText: string;
  modalPublishingButtonDisabled: boolean;

  alertClass: string;
  alertMessage: string;
  showAlert: boolean;

  private publishingPackage: Package;
  private userName: string;

  constructor(private githubService: GithubApiService, private diagnosticApiService: ApplensDiagnosticService, private resourceService: ResourceService,
    private _detectorControlService: DetectorControlService, private authService: AuthService, public ngxSmartModalService: NgxSmartModalService) {

    this.editorOptions = {
      theme: 'vs',
      language: 'csharp',
      fontSize: 14,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false
      },
      folding: true
    };

    this.buildOutput = [];
    this.runButtonDisabled = false;
    this.publishButtonDisabled = true;
    this.runButtonText = "Run";
    this.runButtonIcon = "fa fa-play";
    this.publishButtonText = "Publish";
    this.modalPublishingButtonText = "Publish";
    this.modalPublishingButtonDisabled = false;
    this.showAlert = false;

    this.userName = this.authService.userInfo.userName.replace('@microsoft.com', '');
  }

  ngOnInit() {
    this.resourceId = this.resourceService.getCurrentResourceId();
    if (this.mode === DevelopMode.Create) {
      // CREATE FLOW
      this.githubService.getDetectorTemplate(this.resourceService.templateFileName).subscribe(data => {
        this.code = data;
      });
      this.fileName = "new.csx";
      this.startTime = this._detectorControlService.startTime;
      this.endTime = this._detectorControlService.endTime;
    }
    else if (this.mode === DevelopMode.Edit) {
      // EDIT FLOW
      this.fileName = `${this.detectorId}.csx`;
      this.githubService.getDetectorFile(this.detectorId).subscribe(data => {
        this.code = data;
        this.retrieveProgress();
      });
      this.startTime = this._detectorControlService.startTime;
      this.endTime = this._detectorControlService.endTime;
    }
    else if (this.mode === DevelopMode.EditMonitoring) {
      // SYSTEM MONITORING FLOW
      this.fileName = '__monitoring.csx';
      this.githubService.getDetectorFile("__monitoring").subscribe(data => {
        this.code = data;
        this.retrieveProgress();
      });
    }
    else if (this.mode === DevelopMode.EditAnalytics) {
      // SYSTEM ANALYTICS FLOW
      this.fileName = '__analytics.csx';
      this.githubService.getDetectorFile("__analytics").subscribe(data => {
        this.code = data;
        this.retrieveProgress();
      });
    }
  }
  
  ngOnDestroy() {
    // TODO: Figure out saving capabilities
    //this.saveProgress();
  }

  saveProgress() {
    localStorage.setItem(`${this.detectorId}_code`, this.code);
  }

  retrieveProgress() {
    let savedCode: string = localStorage.getItem(`${this.detectorId}_code`)
    if (savedCode) {
      this.code = savedCode;
    }
  }

  deleteProgress() {
    localStorage.removeItem(`${this.detectorId}_code`);
  }

  runCompilation() {

    this.buildOutput = [];
    this.buildOutput.push("------ Build started ------");
    let currentCode = this.code;

    var body = {
      script: this.code
    };

    this.runButtonDisabled = true;
    this.publishButtonDisabled = true;
    this.runButtonText = "Running";
    this.runButtonIcon = "fa fa-circle-o-notch fa-spin";

    let isSystemInvoker: boolean = this.mode === DevelopMode.EditMonitoring || this.mode === DevelopMode.EditAnalytics;

    this.diagnosticApiService.getCompilerResponse(body, isSystemInvoker, this.detectorId, this._detectorControlService.startTimeString, 
        this._detectorControlService.endTimeString, this.dataSource, this.timeRange)
      .subscribe((response: QueryResponse<DetectorResponse>) => {

        this.queryResponse = response;
        this.runButtonDisabled = false;
        this.runButtonText = "Run";
        this.runButtonIcon = "fa fa-play";
        this.queryResponse.compilationOutput.compilationOutput.forEach(element => {
          this.buildOutput.push(element);
        });

        if (this.queryResponse.compilationOutput.compilationSucceeded === true) {
          this.publishButtonDisabled = false;
          this.preparePublishingPackage(this.queryResponse, currentCode);
          this.buildOutput.push("========== Build: 1 succeeded, 0 failed ==========");
        }
        else {
          this.publishButtonDisabled = true;
          this.publishingPackage = null;
          this.buildOutput.push("========== Build: 0 succeeded, 1 failed ==========");
        }

        if (this.queryResponse.runtimeSucceeded != null && this.queryResponse.runtimeSucceeded === false) {
          this.publishButtonDisabled = true;
        }

      }, ((error: any) => {
        this.runButtonDisabled = false;
        this.publishingPackage = null;
        this.runButtonText = "Run";
        this.runButtonIcon = "fa fa-play";
        this.buildOutput.push("Something went wrong during detector invocation.");
        this.buildOutput.push("========== Build: 0 succeeded, 1 failed ==========");
      }));
  }

  confirmPublish() {
    if (!this.publishButtonDisabled) {
      this.ngxSmartModalService.getModal('publishModal').open();
    }
  }

  publish() {

    if (!this.publishingPackage || this.publishingPackage.codeString === '' || this.publishingPackage.id === '' || this.publishingPackage.dllBytes === '') {
      return;
    }

    this.publishButtonDisabled = true;
    this.runButtonDisabled = true;
    this.modalPublishingButtonDisabled = true;
    this.modalPublishingButtonText = "Publishing";

    this.diagnosticApiService.publishDetector(this.publishingPackage).subscribe(data => {
      this.deleteProgress();
      this.runButtonDisabled = false;
      this.publishButtonText = "Publish";
      this.modalPublishingButtonDisabled = false;
      this.modalPublishingButtonText = "Publish";
      this.ngxSmartModalService.getModal('publishModal').close();
      this.showAlertBox('alert-success', 'Detector published successfully. Changes will be live shortly.');
    }, err => {
      this.runButtonDisabled = false;
      this.publishButtonText = "Publish";
      this.modalPublishingButtonDisabled = false;
      this.modalPublishingButtonText = "Publish";
      this.ngxSmartModalService.getModal('publishModal').close();
      this.showAlertBox('alert-dander', 'Publishing failed. Please try again after some time.');
    });
  }

  private preparePublishingPackage(queryResponse: QueryResponse<DetectorResponse>, code: string) {

    this.publishingPackage = {
      codeString: code,
      id: queryResponse.invocationOutput.metadata.id,
      dllBytes: queryResponse.compilationOutput.assemblyBytes,
      pdbBytes: queryResponse.compilationOutput.pdbBytes,
      committedByAlias: this.userName
    };
  }

  private showAlertBox(alertClass: string, message: string) {
    this.alertClass = alertClass;
    this.alertMessage = message;
    this.showAlert = true;
  }

  private hideAlertBox() {
    this.showAlert = false;
    this.alertClass = '';
    this.alertMessage = '';
  }
}
