import { Component, OnInit } from '@angular/core';
import { CaseCleansingApiService, CaseSimple } from '../../../shared/services/casecleansing-api.service'
import { async } from 'q';

@Component({
  selector: 'casecleansing',
  templateUrl: './casecleansing.component.html',
  styleUrls: ['./casecleansing.component.css']
})
export class CasecleansingComponent implements OnInit {
  public cases : CaseSimple[];
  public content : any;
  public selectedCase : CaseSimple;

  constructor(private caseCleansingService: CaseCleansingApiService) { 
    this.getAllCases();
  }

  private getAllCases = async function() {
    this.cases = await this.caseCleansingService.GetAllCases().toPromise();
  }

  private getDetails = async function(incidentID:string) {
    if (incidentID) {
      this.content = await this.caseCleansingService.GetCaseDetails(incidentID).toPromise();
      this.content = JSON.stringify(this.content, null, 2);
    } else {
      this.content = undefined;
    }
  }

  public onSelect = function(caseIn : CaseSimple) {
    if (caseIn !== this.selectedCase) {
      this.selectedCase = caseIn;
      this.getDetails(this.selectedCase.incidentId);
    } else {
      this.selectedCase = undefined;
      this.getDetails(undefined);
    }
  }

  ngOnInit() {
  }

}
