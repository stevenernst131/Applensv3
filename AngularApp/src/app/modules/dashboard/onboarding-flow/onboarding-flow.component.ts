import { Component, OnInit } from '@angular/core';
import { GithubApiService } from '../../../shared/services/github-api.service';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { QueryResponse, CompilerResponse } from '../../../diagnostic-data/models/compiler-response';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';

@Component({
  selector: 'onboarding-flow',
  templateUrl: './onboarding-flow.component.html',
  styleUrls: ['./onboarding-flow.component.css']
})
export class OnboardingFlowComponent implements OnInit {

  editorOptions: any;
  code: string;
  queryResponse: QueryResponse<DetectorResponse>;

  constructor(private githubService: GithubApiService) {

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
  }

  ngOnInit() {
    this.githubService.getDetectorTemplate().subscribe(data => {
      this.code = data;
    });
  }

  runCompilation() {
    
  }
}