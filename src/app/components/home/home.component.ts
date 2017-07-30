import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {SettingsComponent} from '../settings/settings.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title = `App works !`;

  constructor(private router: Router) { }
  ngOnInit() {
  }

  go(url: string) {
    this.router.navigateByUrl(url);

  }

}
