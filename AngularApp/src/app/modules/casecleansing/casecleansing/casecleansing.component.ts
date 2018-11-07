import { Component, OnInit } from '@angular/core';
import { CaseCleansingApiService, CaseSimple } from '../../../shared/services/casecleansing-api.service'
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'casecleansing',
  templateUrl: './casecleansing.component.html',
  styleUrls: ['./casecleansing.component.css']
})
export class CasecleansingComponent implements OnInit {
  public cases : CaseSimple[];
  public content : object;
  public contentJSON : string;
  public selectedCase : CaseSimple;
  public showProgress : boolean = false;
  public activeIncident : object;
  public caseCleansingForm = new FormGroup({
    select: new FormControl(''),
    other: new FormControl('')
  });

  constructor(private caseCleansingService: CaseCleansingApiService, public ngxSmartModalService: NgxSmartModalService) { 
    this.getAllCases();
    this.activeIncident = {
      title: "...",
      recommendation: "...",
      rule: "..."
    };
  }

  private getAllCases = async function() {
    this.cases = await this.caseCleansingService.GetAllCases().toPromise();
  }

  private getDetails = async function(incidentID:string) {
    this.activeIncident = {
      title: "...",
      recommendation: "...",
      rule: "..."
    }
    this.contentJSON = undefined;
    this.content = undefined;
    this.showProgress = true;
    this.caseCleansingForm.reset();
    this.caseCleansingForm.updateValueAndValidity();

    this.ngxSmartModalService.getModal('infoModal').open();

    this.content = await this.caseCleansingService.GetCaseDetails(this.selectedCase.incidentId).toPromise();
    
    this.activeIncident.title = this.content.kustoData.Incidents_Title;
    this.activeIncident.recommendation = this.content.recommendations[0].recommendedClosedAgainst;
    this.activeIncident.rule = this.content.recommendations[0].ruleName;

    this.showProgress = false;
  }

  public toggleDebugInformation = async function() {
    if (!this.contentJSON) {
      this.contentJSON = JSON.stringify(this.content, null, 2);
    } else {
      this.contentJSON = undefined;
    }
  }

  public showHowTo = async function() {
    alert("Not yet implemented");
  }

  public onSelect = function(caseIn : CaseSimple) {
      this.selectedCase = caseIn;
      this.getDetails(this.selectedCase.incidentId);
  }

  public async onSubmit() {
    let closeReason :string = this.caseCleansingForm.value.select;
    if (closeReason === "other") {
      closeReason = "Other: " + this.caseCleansingForm.value.other;
    }
    this.showProgress = true;
    let result = await this.caseCleansingService.CloseCase(this.selectedCase.incidentId, closeReason).toPromise();
    this.showProgress = false;
    if (result) {
      this.ngxSmartModalService.getModal('infoModal').close();
      this.cases.splice(this.cases.indexOf(this.selectedCase), 1);
    } else {
      alert("there was an error updating this case");
    }
  }

  public onSelectChange = function(args) {
    let selectValue = args.target.value; 
    let otherControl = this.caseCleansingForm.get("other") as FormControl;
    if (selectValue === 'other') {
      otherControl.setValidators([Validators.required])
    } else {
      otherControl.clearValidators();
    }
    otherControl.updateValueAndValidity();
  }


  ngOnInit() {
  }

}
