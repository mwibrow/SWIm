import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'


const {dialog} = require('electron').remote;
const storage = require('electron-json-storage');
const notSet: string = 'Not set!';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private settings: any;
  private edits: boolean;
  constructor(private router: Router) {
    this.settings = {};
    this.edits = false;
    storage.get('settings',
      (error, data) => {
        let settings: any = data || {}, setting: any;
        this.settings = {};
        this.settings = {
          stimuliPath: notSet,
          responsesPath: notSet,
          blockSize: 10,
          maskFrequency: 440,
          maskDuration: 1000
        };
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
     this.router.navigateByUrl('');
  }

  saveSettings() {
    let settings: any, setting: any;
    settings = {};
    for (setting in this.settings) {
      if (this.settings.hasOwnProperty(setting)) {
        settings[setting] = this.settings[setting];
      }
    }
    storage.set('settings', settings, (error) => {
       console.log(error);
        this.router.navigateByUrl('');
    });
  }

  changeNumberSetting(setting: string, by: number, min: number, max: number) {
    if (this.settings.hasOwnProperty(setting)) {
      this.settings[setting] += by;
      if (this.settings[setting] < min) this.settings[setting] = min;
      if (this.settings[setting] > max) this.settings[setting] = max;
    }
  }
  changeBlockSize(by: number) {
    if (by) {
      this.settings.changeBlockSize += by;
    }
    if (this.settings.changeBlockSize < 1) this.settings.changeBlockSize = 1;
    if (this.settings.changeBlockSize > 100) this.settings.maskBLockSize = 100;
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
