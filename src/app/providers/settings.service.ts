import { Injectable } from '@angular/core';

const fs = require('fs-extra');
const storage = require('electron-json-storage');
const klawSync = require('klaw-sync')
const path = require('path');

export const notSet: string = 'Not set!';

export class Settings {

    stimuliPath: string = notSet;
    responsesPath: string = notSet;

    blockSize: number = 10;
    maskFrequency: number = 440;
    maskDuration: number = 1000;

    responseLength: number = 5;

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
            let settings: any = data || {}, setting: any;
            for (setting in settings) {
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


}
