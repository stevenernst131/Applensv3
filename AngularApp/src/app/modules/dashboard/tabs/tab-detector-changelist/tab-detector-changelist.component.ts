import { Component, OnInit } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubApiService } from '../../../../shared/services/github-api.service';
import { Commit } from '../../../../diagnostic-data/models/changelist';
import { Dictionary } from '../../../../shared/models/extensions';
import {DetectorCommit} from '../../../../../app/shared/models/package';
 import { Observable } from 'rxjs';

@Component({
  selector: 'tab-detector-changelist',
  templateUrl: './tab-detector-changelist.component.html',
  styleUrls: ['./tab-detector-changelist.component.css']
})


export class TabDetectorChangelistComponent implements OnInit {
    selectedCommit: DetectorCommit;
code: string;
loadingDetector: boolean = true;
  private detectorId;
  commitsList: DetectorCommit[] = [];
  currentSha: string;
  previousSha: string;
  previousCode: string = "haha";
  currentCode: string;

  constructor(private _route: ActivatedRoute, private githubService: GithubApiService) { }

  setCodeDiffView(commit: DetectorCommit)
  {
      this.loadingDetector = true;
      this.selectedCommit = commit;
    // this.previousCode = this.githubService.getCommitContent(this.detectorId, previousSha);
     this.githubService.getCommitContent(this.detectorId, commit.previousSha).subscribe(code => {
         
        this.previousCode = code;
       // this.originalModel.code = code;

        this.originalModel = 
        {
            code: `${this.previousCode}`,
            language: 'csharp'
        };
        console.log(this.originalModel);
     //   console.log(this.previousCode);
     });

   //  this.currentCode = this.githubService.getCommitContent(this.detectorId, sha);

     this.githubService.getCommitContent(this.detectorId, commit.sha).subscribe(code => {
        this.loadingDetector = false;
        this.currentCode = code;
        // this.modifiedModel.code = code;

        this.modifiedModel = 
        {
            code: code,
            language: 'csharp'
          };

   //     console.log(this.modifiedModel);
     });
  }

  ngOnInit() {
      this.code1 = "haha";
    this.detectorId = this._route.parent.snapshot.params['detector'];
 //   console.log(`id: ${this.detectorId}`);
    let changelist = this.githubService.getDetectorChangelist(this.detectorId);

    changelist.subscribe(commits => {
    //   console.log(commits);
    //   console.log(typeof commits);
    
      if (commits)
      {

        
          Object.keys(commits).forEach(key => {
              let commit = commits[key];
           //  console.log(commit);
              this.currentSha = commit.sha;
              this.previousSha = commit.previousSha;

            //   let onClick = () => {
            //     this.setCodeDiffView(commit.sha, commit.previousSha);
            //   };

              this.commitsList.push(commit);
            });

            
            let defaultCommit = commits[Object.keys(commits)[Object.keys(commits).length-1]];

        
        
            // this.githubService.getCommitContent(this.detectorId, this.previousSha).subscribe(code => {
            //     this.previousCode = code;
            //  //   this.originalModel.code = code;
        
            //     this.originalModel = 
            //     {
            //         code: code,
            //         language: 'text/plain'
            //     };
            //     console.log(this.originalModel);
            //  });

            this.setCodeDiffView(defaultCommit);
      }
      // if (commits) {
      //   commits.forEach(element => {
      //     console.log(element);
      //     // let onClick = () => {
      //     //   this.currentSha = element.Key;
      //     //   this.previousSha = element.Value.Item4;
      //     // };
      //   });
      // };
    },
      error => {
        // TODO: handle detector route not found
        if (error && error.status === 404) {
        //   this.getDetectorsRouteNotFound = true;
        }
      }
    );
  }



  options = {
    theme: 'vs-dark',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false
    },
    folding: true
  };

  code1: string = "";
  originalModel: DiffEditorModel = {
    code: `${this.previousCode}`,
    language: 'text/plain'
  };

  modifiedModel: DiffEditorModel = {
    code: `${this.currentCode}`,
    language: 'text/plain',
    //  fontSize: 14,
  };

}
