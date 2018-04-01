import { Component, OnInit } from '@angular/core';
import { GithubApiService } from '../../../shared/services/github-api.service';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { QueryResponse, CompilerResponse } from '../../../diagnostic-data/models/compiler-response';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { Package } from '../../../shared/models/package';

@Component({
  selector: 'onboarding-flow',
  templateUrl: './onboarding-flow.component.html',
  styleUrls: ['./onboarding-flow.component.css']
})
export class OnboardingFlowComponent implements OnInit {

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
  private publishingPackage: Package;

  constructor(private githubService: GithubApiService, private route: ActivatedRoute, private diagnosticApiService: DiagnosticApiService, private resourceService: ResourceService) {

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
    this.fileName = "new.csx";
  }

  ngOnInit() {
    this.resourceId = this.resourceService.getCurrentResourceId();

    this.githubService.getDetectorTemplate().subscribe(data => {
      this.code = data;
    });
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

    this.diagnosticApiService.getCompilerResponse(this.resourceId, this.resourceService.getDiagnosticRoleQueryString(), body)
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
      // TODO : add notification
    }, err => {
      this.runButtonDisabled = false;
      this.publishButtonText = "Publish";
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
}