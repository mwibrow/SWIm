import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { MdDialog, MdDialogRef } from '@angular/material';
import { ErrorComponent } from '../error/error.component';

const {dialog} = require('electron').remote;
const fs = require('fs-extra');
const storage = require('electron-json-storage');
const klawSync = require('klaw-sync')
const path = require('path');

const filterWav = item => path.extname(item.path) === '.wav';

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
  constructor(private router: Router, public dialog: MdDialog) {
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
    validateSettings(this.settings).then(() => {
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
    }).catch((message) => {
      this.dialog.open(ErrorComponent, {
        data: {
          title: 'Ooops!',
          content: message
        }
      });
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


const validateSettings = (settings: any)  => {

  return new Promise((resolve, reject) => {
    if (!settings.stimuliPath || settings.responsePath == notSet) {
      reject('Stimuli folder not set');
    }
    if (!fs.pathExistsSync(settings.stimuliPath)) {
      reject('Stimuli folder does not exist')
    }
    let stimuli = klawSync(settings.stimuliPath, { filter: filterWav });
    if (stimuli.length === 0) {
      reject('No WAV files in stimuli folder');
    }
    if (!settings.responsesPath || settings.responsePath === notSet) {
      reject('Responses folder not set');
    }
    try {
      fs.accessSync(settings.responsesPath, fs.W_OK);
    } catch (err) {
      reject('Cannot write to Responses folder');
    }
    resolve();
  });
}
