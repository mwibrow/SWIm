import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
const storage = require('electron-json-storage');
const path = require('path');

const filterWav = item => path.extname(item) === '.wav';

export const notSet = 'Not set!';

export class Settings {

    participantId: string = notSet;
    stimuliPath: string = notSet;
    responsesPath: string = notSet;

    blockSize = 10;
    maskFrequency = 440;
    maskDuration = 1000;
    maskVolume = 10;
    responseLength = 5;
    repetitions = 3;

    escapeCombo = 'Escape|Escape|Escape';

}

@Injectable()
export class SettingsService {

  settings: Settings;

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    return new Promise((resolve, reject) => {
      this.settings = new Settings();
      storage.get('settings',
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            const settings: any = data || {};
            for (const setting in settings) {
              if (settings.hasOwnProperty(setting)) {
                this.settings[setting] = settings[setting];
              }
            }
            resolve();
          }
      });
    });
  }

  saveSettings() {
    return new Promise((resolve, reject) => {
      storage.set('settings', this.settings, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }


  validateSettings() {

    console.log('Validating settings');
    console.log(this.settings)

      return new Promise((resolve, reject) => {
        if (!this.settings.stimuliPath || this.settings.responsesPath === notSet) {
          reject('Stimuli folder not set');
        }
        if (!fs.pathExistsSync(this.settings.stimuliPath)) {
          reject('Stimuli folder does not exist')
        }
        const stimuli: string[] = fs.readdirSync(this.settings.stimuliPath).filter(filterWav);
        if (stimuli.length === 0) {
          reject('No WAV files in stimuli folder');
        }
        if (!this.settings.responsesPath || this.settings.responsesPath === notSet) {
          reject('Responses folder not set');
        }
        try {
          fs.accessSync(this.settings.responsesPath, fs.constants.W_OK);
        } catch (err) {
          reject('Cannot write to Responses folder');
        }

        resolve();
      });
    }

}


interface Setting<T> {
  value: T;
  defaultValue: T;

  validate(): Promise<void>;
  validateRegex(): boolean;

  setValue(value: T);
  getValue(): T;

}

class FolderSetting implements Setting<string> {

  value: string;
  defaultValue: string;
  // tslint:disable-next-line
  permissions: any = fs.constants.W_OK | fs.constants.R_OK;

  validate(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        fs.accessSync(this.value, this.permissions);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  validateRegex() {
    return true;
  }

  setValue(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

class NumberSetting implements Setting<number> {

  value: number;
  defaultValue: number;
  min: number;
  max: number;

  // tslint:disable-next-line
  permissions: any = fs.constants.W_OK | fs.constants.R_OK;

  constructor(defaultValue: number, min: number, max: number) {
    this.value = this.defaultValue = defaultValue;
    this.min = min;
    this.max = max;
  }

  validate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.value >= this.min && this.value <= this.max) {
        resolve();
      }
      reject();
    });
  }

  validateRegex(): boolean {
    return this.value.toString().match(/\d+/).length > 0;
  }

  setValue(value: number) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
