import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { Router } from '@angular/router';

import { ErrorComponent } from '../error/error.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

})
export class HomeComponent implements OnInit {
  title = `App works !`;

  private enter: boolean;
  private exit: boolean;
  constructor(private router: Router, public dialog: MdDialog) {
    this.enter = true;
    this.exit = false;
  }
  ngOnInit() {
  }

  go(url: string) {
    setTimeout(() => {
      this.router.navigateByUrl(url);
    }, 1000)
    this.enter = false;
    this.exit = true;
    //this.dialog.open(ErrorComponent, {data: {content: 'You Suck!'}});
  }



}
