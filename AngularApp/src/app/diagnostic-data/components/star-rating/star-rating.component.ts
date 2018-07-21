import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css']
})
export class StarRatingComponent extends DataRenderBaseComponent {

  constructor(protected telemetryService: TelemetryService) { 
    super(telemetryService);
  }

  ngOnInit() {
  }

  @Input() isModal: boolean = false;
  @Output() submit: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  showThanksMessage: boolean = false;
  rating:number = 0;
  comments:string = "Start your rating.";
  feedbackText:string;


  hideWholeForm: boolean;

  setStar(data:any, comments?:any) {
    this.rating = data;
    this.comments = comments;
  }

  feedbackMessageSubmitted() {
    var eventProps = {
      Rating: String(this.rating),
      Feedback: this.feedbackText
    };

    this.telemetryService.logEvent(TelemetryEventNames.StarRatingSubmitted, eventProps);
    console.log("writing" + this.feedbackText);
    
    this.showThanksMessage = true;
    this.submit.emit(this.showThanksMessage);
  }
}
