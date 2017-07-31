import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { Router } from '@angular/router';

import { ErrorComponent } from '../error/error.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title = `App works !`;

  constructor(private router: Router, public dialog: MdDialog) { }
  ngOnInit() {
  }

  go(url: string) {
    this.router.navigateByUrl(url);
    //this.dialog.open(ErrorComponent, {data: {content: 'You Suck!'}});
  }

}
