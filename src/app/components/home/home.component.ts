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

  constructor(private router: Router, public dialog: MdDialog) { }
  ngOnInit() {
  }

  go(url: string) {
   this.router.navigateByUrl(url);

  }

  openSettings() {
    this.dialog.open(SettingsComponent);
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
      Are you sure you want to quit
      <span class="logo"><span>S</span><span>W</span><span>Im</span><span>!</span>
    </span>?
    </div>
    <div md-dialog-actions>
      <div class="hfill"></div>
      <button md-button md-dialog-close class="button-secondary">Cancel</button>
      <button md-button [md-dialog-close]="true" class="button-primary">Ok</button>
    </div>`,
  styleUrls: ['./home.component.scss']
})
export class ExitAppComponent implements OnInit {

  ngOnInit() { }
}
