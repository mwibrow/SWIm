import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'


const {dialog} = require('electron').remote;
const storage = require('electron-json-storage');
const notSet: string = 'Not set!';

const settingsDefaults: any = {
  stimuliPath: notSet,
  responsesPath: notSet,
  blockSize: 10,
  maskFrequency: 440,
  maskDuration: 1000
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private settings: any;
  private edits: boolean;
  private enter: boolean;
  private exit: boolean;
  constructor(private router: Router) {
    this.settings = {};
    this.edits = false;
    this.enter = true;
    this.exit = false;
    storage.get('settings',
      (error, data) => {
        let settings: any = data || {}, setting: any;
        this.settings = {};
        for (setting in settingsDefaults) {
          if (settingsDefaults.hasOwnProperty(setting)) {
            this.settings[setting] = settingsDefaults[setting];
          }
        }
        for (setting in settings) {
          if (settings.hasOwnProperty(setting)) {
            this.settings[setting] = settings[setting];
          }
        }
     });

  }

  ngOnInit() {
  }

  changeStimuliPath() {
    let path: any = dialog.showOpenDialog({properties: ['openDirectory']});
    if (path && path.length === 1) {
      this.settings.stimuliPath = path[0];
      this.edits = true;
    }
  }

  changeResponsesPath() {
    let path: any = dialog.showOpenDialog({properties: ['openDirectory']});
    if (path && path.length === 1) {
      this.settings.responsesPath = path[0];
      this.edits = true;
    }
  }

  cancelSettings() {
    this.leaveComponent();
  }

  private leaveComponent() {
    setTimeout(() => {
     this.router.navigateByUrl('');
    }, 1000);
    this.enter = false;
    this.exit = true;
  }
  saveSettings() {
    let settings: any, setting: any;
    settings = {};
    for (setting in this.settings) {
      if (this.settings.hasOwnProperty(setting)) {
        if (this.settings[setting]) {
          settings[setting] = this.settings[setting];
        } else {
          settings[setting] = null;
        }
      }
    }
    storage.set('settings', settings, (error) => {
       console.log(error);
       this.leaveComponent();
    });
  }

  changeBlockSize(by: number) {
    if (by) {
      this.settings.blockSize += by;
    }
    if (this.settings.blockSize < 1) this.settings.blockSize = 1;
    if (this.settings.blockSize > 100) this.settings.blockSize = 100;
  }

  changeMaskFrequency(by: number) {
    if (by) {
      this.settings.maskFrequency += by;
    }
    if (this.settings.maskFrequency < 250) this.settings.maskFrequency = 250;
    if (this.settings.maskFrequency > 1000) this.settings.maskFrequency = 1000;
  }

  changeMaskDuration(by: number) {
    if (by) {
      this.settings.maskDuration += by;
    }
    if (this.settings.maskDuration < 10) this.settings.maskDuration = 10;
    if (this.settings.maskDuration > 2000) this.settings.maskDuration = 2000;
  }
}
