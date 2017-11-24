import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

import { AudioComponent } from '../audio/audio.component';
import { ErrorComponent } from '../error/error.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService, Settings } from '../../providers/settings.service';
import { AudioService } from '../../providers/audio.service';

const remote = require('electron').remote;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title = `App works !`;
  settingsRejectionMessage: '';
  fade = 'fade-in';
  logoPath = 'assets/images/swim-logo.svg';
  audioAvailable: boolean;
  constructor(private router: Router,
    private audio: AudioService,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
      this.audioAvailable = true;
    }

  ngOnInit() {
    this.audioAvailable = true;
    this.checkAudio();
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  startTask() {
    this.settingsService.validateSettings()
      .then( () => {
        this.fade = 'fade-out';
        setTimeout(() => this.go('/task'), 2000);
      })
      .catch(message => {
        this.dialog.open(ErrorComponent,  {
          disableClose: true,
          data: {
            title: 'Opps!',
            content: message
          }
        })
      })
  }

  openAudio() {
    this.dialog.open(AudioComponent);
  }

  checkAudio() {
    this.audio.recorder.initialise()
      .then((stream) => {})
      .catch((err) => {
        this.audioAvailable = false;
      });
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
    <h2 mat-dialog-title>
      Quit?
    </h2>
    <div mat-dialog-content>
      Are you sure you want to quit
      <span class="logo"><span>S</span><span>W</span><span>I</span><span>m</span>
    </span>?
    </div>
    <div mat-dialog-actions>
      <div class="hfill"></div>
      <button mat-button mat-dialog-close class="button-secondary">Cancel</button>
      <button mat-button [mat-dialog-close]="true" class="button-primary">Ok</button>
    </div>`,
  styleUrls: ['./home.component.scss']
})
export class ExitAppComponent implements OnInit {

  ngOnInit() { }
}
