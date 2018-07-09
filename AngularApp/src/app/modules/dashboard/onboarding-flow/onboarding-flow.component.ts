import { Component, OnInit, Input } from '@angular/core';
import { GithubApiService } from '../../../shared/services/github-api.service';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { QueryResponse, CompilerResponse } from '../../../diagnostic-data/models/compiler-response';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { Package } from '../../../shared/models/package';
import { QueryParamsService } from '../../../shared/services/query-params.service';
import { ApplensDiagnosticService } from '../services/applens-diagnostic.service';

export enum DevelopMode {
  Create,
  Edit
}

@Component({
  selector: 'onboarding-flow',
  templateUrl: './onboarding-flow.component.html',
  styleUrls: ['./onboarding-flow.component.css']
})
export class OnboardingFlowComponent implements OnInit {

  @Input() mode: DevelopMode = DevelopMode.Create;
  @Input() detectorId: string = '';
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

  alertClass: string;
  alertMessage: string;
  showAlert: boolean;

  showDataSources: boolean = false;

  private publishingPackage: Package;

  constructor(private githubService: GithubApiService, private diagnosticApiService: ApplensDiagnosticService, private resourceService: ResourceService,
    public queryParamsService: QueryParamsService) {

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
    this.showAlert = false;
  }

  ngOnInit() {
    this.resourceId = this.resourceService.getCurrentResourceId();

    if (this.mode == DevelopMode.Create) {
      // CREATE FLOW
      this.githubService.getDetectorTemplate(this.resourceService.templateFileName).subscribe(data => {
        this.code = data;
      });
      this.fileName = "new.csx";
    }
    else {
      // EDIT FLOW
      this.fileName = `${this.detectorId}.csx`;
      this.githubService.getDetectorFile(this.detectorId).subscribe(data => {
        this.code = data;
      });
    }
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

    this.diagnosticApiService.getCompilerResponse(body)
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
      }, ((error: any) => {
        this.runButtonDisabled = false;
        this.publishingPackage = null;
        this.runButtonText = "Run";
        this.runButtonIcon = "fa fa-play";
        this.buildOutput.push("Something went wrong during detector invocation.");
        this.buildOutput.push("========== Build: 0 succeeded, 1 failed ==========");
      }));
  }

  publish() {

    if (!this.publishingPackage || this.publishingPackage.codeString === '' || this.publishingPackage.id === '' || this.publishingPackage.dllBytes === '') {
      return;
    }

    this.publishButtonDisabled = true;
    this.runButtonDisabled = true;
    this.publishButtonText = "Publishing";

    this.githubService.publishPackage(this.publishingPackage).subscribe(data => {
      this.runButtonDisabled = false;
      this.publishButtonText = "Publish";
      this.showAlertBox('alert-success', 'Detector pulished successfully. It will be live in next 5-10 minutes.');
    }, err => {
      this.runButtonDisabled = false;
      this.publishButtonText = "Publish";
      this.showAlertBox('alert-dander', 'Publishing failed. Please try again after some time.');
    });
  }

  private preparePublishingPackage(queryResponse: QueryResponse<DetectorResponse>, code: string) {
    this.publishingPackage = {
      codeString: code,
      id: queryResponse.invocationOutput.metadata.id,
      dllBytes: queryResponse.compilationOutput.assemblyBytes,
      pdbBytes: queryResponse.compilationOutput.pdbBytes
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
