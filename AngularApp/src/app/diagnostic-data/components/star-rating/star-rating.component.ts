import { Component, OnInit } from '@angular/core';
import { DataRenderBaseComponent } from '../data-render-base/data-render-base.component';
import { TelemetryService } from '../../services/telemetry/telemetry.service';

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

  rating:number = 0;
  comments:string;
  feedbackText:string;

  setStar(data:any, comments?:any) {
    this.rating = data;
    this.comments = comments;
    this.logEvent(comments);
  }

  feedbackMessageSubmitted() {
    this.logEvent(feedbackText);
  }
}
