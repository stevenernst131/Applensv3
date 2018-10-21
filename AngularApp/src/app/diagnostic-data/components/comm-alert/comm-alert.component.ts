import { Component, OnInit, Inject, Input } from '@angular/core';
import { CommsService } from '../../services/comms.service';
import { Communication, CommunicationStatus } from '../../models/communication';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import * as momentNs from 'moment';
import 'moment-timezone';
const moment = momentNs;

@Component({
  selector: 'comm-alert',
  templateUrl: './comm-alert.component.html',
  styleUrls: ['./comm-alert.component.css']
})
export class CommAlertComponent implements OnInit {

  private activeAlertTitle: string = 'An Azure service outage may be impacting this subscription.';
  private resolvedAlertTitle: string = 'An Azure service outage that was impacting this subscription was recently resolved.';
  private azureServiceCommList: Communication[];

  @Input() autoExpand: boolean = false;
  public commAlertTitle: string;
  public commAlertToShow: Communication = null;
  public isAlertExpanded: boolean = false;
  public commPublishedTime: string;
  public impactedServices: string;
  public impactedRegions: string;
  public isPublic: boolean;

  constructor(private commsService: CommsService, @Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig) {
    this.commAlertToShow = null;
    this.commAlertTitle = '';
    this.isPublic = config.isPublic;
    this.azureServiceCommList = [];
  }

  ngOnInit() {

    this.commsService.getServiceHealthCommunications().subscribe((commsList: Communication[]) => {
      this.azureServiceCommList = commsList;
      let commAlert = commsList.find((comm: Communication) => comm.isAlert === true);
      if (commAlert) {
        this.commAlertToShow = commAlert;
        this.isAlertExpanded = this.autoExpand && this.commAlertToShow.isExpanded;
        this.commPublishedTime = moment.tz(this.commAlertToShow.publishedTime, 'Etc/UTC').format('YYYY-MM-DD HH:mm A');
        if (commAlert.status === CommunicationStatus.Active) {
          this.commAlertTitle = this.activeAlertTitle;
        }
        else {
          this.commAlertTitle = this.resolvedAlertTitle;
        }

        this._getImpactedServices();
      }
    });
  }

  private _getImpactedServices() {

    var impactedServices: string[] = [];
    var impactedRegions: string[] = [];

    let allCommsForImpactingIncident = this.azureServiceCommList.filter(x => x.incidentId === this.commAlertToShow.incidentId);
    allCommsForImpactingIncident.forEach(item => {
      impactedServices = impactedServices.concat(item.impactedServices.map(y=>y.name));
      
      var regions = item.impactedServices.map(z=>z.regions);
      impactedRegions = impactedRegions.concat(...regions);

    });

    this.impactedServices = impactedServices.filter((value, index, arr)=> arr.indexOf(value) == index).toString();
    let uniqueRegions = impactedRegions.filter((value, index, arr)=> arr.indexOf(value) == index);
    if(uniqueRegions.length > 3){
      this.impactedRegions = uniqueRegions.slice(0, 3).toString().concat(`(+${uniqueRegions.length - 3} more)`);
    }
    else{
      this.impactedRegions = uniqueRegions.toString();
    }
  }
}
