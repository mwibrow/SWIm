import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router'
import { ErrorComponent } from '../error/error.component';

import { SettingsService, Settings, notSet } from '../../providers/settings.service';

const {dialog} = require('electron').remote;
const fs = require('fs-extra');
const klawSync = require('klaw-sync')
const path = require('path');

const filterWav = item => path.extname(item.path) === '.wav';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private settings: Settings;
  private stimuliPathValidationMessage: string ='';
  private responsesPathValidationMessage: string ='';

  constructor(
      private router: Router,
      private dialog: MdDialog,
      private dialogRef: MdDialogRef<SettingsComponent>,
      private settingsService: SettingsService) {

      this.settings = settingsService.settings;
  }

  ngOnInit() {
  }

  changeStimuliPath() {
    let path: any = dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: this.settings.stimuliPath
    });
    if (path && path.length === 1) {
      this.settings.stimuliPath = path[0];
      this.validateStimuliPath();

    }
  }

  changeResponsesPath() {
    let path: any = dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: this.settings.responsesPath
    });
    if (path && path.length === 1) {
      this.settings.responsesPath = path[0];
      this.validateResponsesPath();
    }
  }

  cancelSettings() {
    this.dialogRef.close();
  }


  saveSettings() {
    this.settingsService.saveSettings()
      .then(() => { this.dialogRef.close(); })
      .catch((error) => {
        console.error(error)
        this.dialog.open(ErrorComponent, {
          data: {
            title: 'Ooops!',
            content: 'Settings could not be saved.'
          }
        })
      });
  }

  validateSettings() {
    this.validateStimuliPath();
    this.validateResponsesPath();
    return this.responsesPathValidationMessage === '' && this.stimuliPathValidationMessage === '';
  }

  changeBlockSize(by: number) {
    if (by) {
      this.settings.blockSize += by;
    }
    if (this.settings.blockSize < 1) this.settings.blockSize = 1;
    if (this.settings.blockSize > 100) this.settings.blockSize = 100;
  }

  changeResponseLength(by: number) {
    if (by) {
      this.settings.responseLength += by;
    }
    if (this.settings.responseLength < 1) this.settings.responseLength = 1;
    if (this.settings.responseLength > 10) this.settings.responseLength = 10;
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

  validateStimuliPath() {
    if (!this.settings.stimuliPath || this.settings.stimuliPath == notSet) {
      this.stimuliPathValidationMessage = 'Stimuli folder not set';
      return;
    }
    if (!fs.pathExistsSync(this.settings.stimuliPath)) {
      this.stimuliPathValidationMessage = 'Stimuli folder does not exist';
      return;
    }
    let stimuli = klawSync(this.settings.stimuliPath, { filter: filterWav });
    if (stimuli.length === 0) {
      this.stimuliPathValidationMessage = 'No WAV files in stimuli folder';
      return;
    }
    this.stimuliPathValidationMessage = '';
  }

  validateResponsesPath() {
    if (!this.settings.responsesPath || this.settings.responsesPath === notSet) {
      this.responsesPathValidationMessage = 'Responses folder not set';
      return;
    }
    try {
      fs.accessSync(this.settings.responsesPath, fs.W_OK);
    } catch (err) {
      this.responsesPathValidationMessage = 'Cannot write to Responses folder';
      return;
    }
    this.responsesPathValidationMessage = '';
  }

}


const validateSettings = (settings: any)  => {

  return new Promise((resolve, reject) => {
    if (!settings.stimuliPath || settings.responsePath === notSet) {
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
