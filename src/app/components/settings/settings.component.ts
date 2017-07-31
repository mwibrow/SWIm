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
        let settings: any = data || {};
        this.settings = {
          stimuliPath: settings.stimuliPath || notSet,
          responsesPath: settings.responsesPath || notSet,
          blockSize: 10
        };
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
    let settings: any = {
      stimuliPath: this.settings.stimuliPath === notSet ? null : this.settings.stimuliPath,
      responsesPath: this.settings.responsesPath === notSet ? null : this.settings.responsesPath
    };
     storage.set('settings', settings, (error) => {
       console.log(error);
        this.router.navigateByUrl('');
     });
  }

  increaseBlockSize() {
    if (this.settings.blockSize < 100) {
      this.settings.blockSize ++;
    }
  }

  decreaseBlockSize() {
    if (this.settings.blockSize > 1) {
      this.settings.blockSize --;
    }
  }

  validateBlockSize() {
    if (this.settings.blockSize > 100) {
      this.settings.blockSize = 100;
    } else {
      if (this.settings.blockSize < 1) {
      this.settings.blockSize = 1;
    }
    }
  }
}
