import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'star-rating-feedback',
  templateUrl: './star-rating-feedback.component.html',
  styleUrls: ['./star-rating-feedback.component.css']
})
export class StarRatingFeedbackComponent implements OnInit {

  starList: boolean[] = [true, true, true, true, true, true, true, true, true, true];
  rating:number;

  constructor() { }

  ngOnInit() {
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
