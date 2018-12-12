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
  loadingChange: number = 0;
  noCommits: boolean = false;
  private detectorId;
  commitsList: DetectorCommit[] = [];
  currentSha: string;
  previousSha: string;
  previousCode: string;
  currentCode: string;

  constructor(private _route: ActivatedRoute, private githubService: GithubApiService) { }

  setCodeDiffView(commit: DetectorCommit)
  {
      this.loadingChange = 0;
      this.selectedCommit = commit;
    // this.previousCode = this.githubService.getCommitContent(this.detectorId, previousSha);
    if (commit.previousSha === "")
    {
        this.loadingChange++;
        this.originalModel = 
        {
            code: "",
            language: 'csharp'
        };
        console.log("previous Empty ");
    }
    else
    {
        this.githubService.getCommitContent(this.detectorId, commit.previousSha).subscribe(code => {
            this.loadingChange++;
            this.previousSha = commit.previousSha;
            this.previousCode = code;
           // this.originalModel.code = code;
    
            this.originalModel = 
            {
                code: code,
                language: 'csharp'
            };
            console.log("previous: " + this.previousSha);
         //   console.log(this.previousCode);
         });
    }


   //  this.currentCode = this.githubService.getCommitContent(this.detectorId, sha);

     this.githubService.getCommitContent(this.detectorId, commit.sha).subscribe(code => {

        this.loadingChange++;
        this.currentSha = commit.sha;
        this.currentCode = code;
        // this.modifiedModel.code = code;

        this.modifiedModel = 
        {
            code: code,
            language: 'csharp'
          };

          console.log("current: " + this.currentSha);
     });
  }

  ngOnInit() {
    this.detectorId = this._route.parent.snapshot.params['detector'];
 //   console.log(`id: ${this.detectorId}`);
    let changelist = this.githubService.getDetectorChangelist(this.detectorId);

    changelist.subscribe(commits => {
    //   console.log(commits);
    //   console.log(typeof commits);
    
      if (commits && commits.length > 0)
      {

        this.commitsList = commits;
        let defaultCommit = commits[commits.length-1];

        //   Object.keys(commits).forEach(key => {
        //       let commit = commits[key];
        //    //  console.log(commit);
        //       this.currentSha = commit.sha;
        //       this.previousSha = commit.previousSha;

        //     //   let onClick = () => {
        //     //     this.setCodeDiffView(commit.sha, commit.previousSha);
        //     //   };

        //       this.commitsList.push(commit);
        //     });

            
         //   let defaultCommit = commits[Object.keys(commits)[Object.keys(commits).length-1]];

        
        
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
      else{
          this.noCommits = true;
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
