import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';

import { ErrorComponent } from '../error/error.component';
import { SettingsComponent } from '../settings/settings.component';

const remote = require('electron').remote;

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

  exitApplication() {
    this.dialog.open(ExitAppComponent).afterClosed().subscribe((result) => {
      if (result) {
        remote.getCurrentWindow().close();
      }
    });
  }

}


@Component({
  selector: 'app-exit-dialog',
  template: `
    <h2 md-dialog-title>
      Quit?
    </h2>
    <div md-dialog-content>
      Are you sure you want to Quit SWIm?
    </div>
    <div md-dialog-actions>
      <div class="hfill"></div>
      <button md-button md-dialog-close class="cancel">Cancel</button>
      <button md-button [md-dialog-close]="true" class="ok">Yes</button>
    </div>`,
  styleUrls: ['./home.component.scss']
})
export class ExitAppComponent implements OnInit {

  ngOnInit() { }
}
