import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {
  data: any;
  modelId: number;
  strData: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.data;
        this.modelId = Number.parseInt(this.router.getCurrentNavigation().extras.state.modelId, 10);
        this.strData = JSON.stringify(this.data, null, 4);
        console.log('Data read');
      }
    });
  }

  ngOnInit() {
  }

}
