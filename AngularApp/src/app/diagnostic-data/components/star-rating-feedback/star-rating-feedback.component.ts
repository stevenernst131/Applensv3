import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'star-rating-feedback',
  templateUrl: './star-rating-feedback.component.html',
  styleUrls: ['./star-rating-feedback.component.css']
})
export class StarRatingFeedbackComponent implements OnInit {

  starList: boolean[] = [false, false, false, false, false];
  rating:number;
  isSubmitted: boolean = false;
  isRated: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  submitFeedback($event) {
    this.isSubmitted = $event;
  }

  setLinkVisited() {
    this.isRated = true;
  }

  setStar(data:any) {
    this.rating = data+1;
    for (var i = 0; i <=4; i++) {
      if (i <= data) {
        this.starList[i] = false;
      }
      else {
        this.starList[i] = true;
      }
    }
  }
}
