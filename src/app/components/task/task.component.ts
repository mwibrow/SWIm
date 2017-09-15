import { Component, OnInit } from '@angular/core';
import { AudioService, AudioPlayer, AudioRecorder } from '../../providers/audio.service';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';

const sprintf = require ('sprintf-js');

const storage = require('electron-json-storage');
const fs = require('fs-extra');
const klawSync = require('klaw-sync')
const path = require('path');

import { ErrorComponent } from '../error/error.component';
import { BreakComponent } from '../break/break.component';
import { SettingsService, Settings } from '../../providers/settings.service';

const filterWav = item => path.extname(item.path) === '.wav';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  host: {
    '(document:keydown)': 'handleKeyboardEvents($event)',
    '(document:keyup)': 'handleKeyboardEvents($event)'
  }
})
export class TaskComponent implements OnInit {

  private settings: Settings;
  private stimuli: Array<any>;
  private trial: number;
  private participantFolder: string;
  private now: Date;

  private player: AudioPlayer;
  private recorder: AudioRecorder;

  private keyboardBuffer: Array<string>;

  private dialogRef: MdDialogRef<ErrorComponent>;
  private breakDialogRef: MdDialogRef<BreakComponent>;
  private startDialogRef: MdDialogRef<BreakComponent>;

  private dialogRefs: any;

  private background: string;
  private finish: boolean;

  private taskRunning: boolean;
  private exit: boolean;
  private barColor: number = 1;
  private barOrientation: string = 'vertical';
  private barDirection: Array<string> = ['top', 'bottom']
  constructor(
      private router: Router,
      private audio: AudioService,
      public dialog: MdDialog,
      public settingsService: SettingsService) {

    this.audio.initialise();
    this.player = audio.player;
    this.player.initialise();
    this.recorder = audio.recorder;
    this.recorder.initialise();

    this.keyboardBuffer = [];

    this.background = 'color-1';
    this.stimuli = new Array<any>();
    this.settings = settingsService.settings;

    this.trial = 0;
    this.taskRunning = false;
    this.dialogRefs = {};
    this.exit = false;

  }


  private loadStimuli() {
    return new Promise((resolve, reject) => {
      console.log(`Loading wav files from ${this.settings.stimuliPath}`);
      this.stimuli = klawSync(this.settings.stimuliPath, { filter: filterWav });
      if (this.stimuli.length === 0) {
        this.openDialog('error', ErrorComponent, {
          data: {
            title: 'Ooops!',
            content: 'There were no audio files in the stimuli folder'
          }
        },
        () => {
            this.router.navigateByUrl('');
          });
      }
      resolve();
    });
  }

  private runTask() {
    this.finish = false;
    this.taskRunning = true;
    this.runTrial();
  }

  private runTrial() {
    this.recorder.record();
    this.loadStimulus()
      .then(this.playStimulus)
      .then(this.playTone)
      .then(this.recordResponse)
      .then(this.saveResponse)
      .then(this.endTrial);
  }

  private loadStimulus(self?: TaskComponent)  {
    let i: number;
    self = self || this;
    return new Promise((resolve, reject) => {
      i = self.trial % self.stimuli.length;
      self.player.loadWav(self.stimuli[i].path).then(() => resolve(self))
    });
  }

  private playStimulus(self?: TaskComponent)  {
    self = self || this;
    return new Promise((resolve, reject) => {
      return self.player.play().then(() => resolve(self));
    });
  }

  private playTone(self?: TaskComponent)  {
    self = self || this;
    return new Promise((resolve, reject) => {
      self.player.playTone(440, 1).then(() => resolve(self));
    });
  }

  private recordResponse(self?: TaskComponent)  {
    self = self || this;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(self), self.settings.responseLength * 1000);
    })
  }

  private saveResponse(self?: TaskComponent) {
    self = self || this;
    return new Promise((resolve, reject) => {
      self.recorder.stop().then(() => {
        let wavPath: string = self.getResponseFile();
        console.log(`Saving wav to ${wavPath}`);
        self.recorder.saveWav(wavPath).then(() => resolve(self));
      });
    });
  }

  private getResponseFile(self?: TaskComponent) {
    let i: number;
    self = self || this;
    i = self.trial % self.stimuli.length;
    return path.normalize(path.join(
      self.settings.responsesPath,
      `${sprintf.sprintf('%03d', self.trial + 1)}-${path.posix.basename(self.stimuli[i].path)}`
    ));
  }

  private endTrial(self?: TaskComponent) {
    self = self || this;
    self.trial ++;
    self.background = `color-${(self.trial % 5 ) + 1}`;
    if (self.trial % self.settings.blockSize === 0) {
      self.break();
    } else {
      if (!self.finish) {
        self.runTrial();
      }
    }
  }

  private break() {
    this.openDialog('break', BreakComponent, {}, () => {
      this.router.navigateByUrl('');
    });
  }

  handleKeyboardEvents(event: KeyboardEvent) {
      let key = event.which || event.keyCode;
      switch (event.type) {
        case 'keydown':
          this.keyboardBuffer.push(event.key);

          if (this.keyboardBuffer.join('|') === 'Control|Shift|Escape') {
              this.finish = true;
              this.exit = true;
              this.closeDialog();
              this.router.navigateByUrl('');
          }
          break;
        case 'keyup':
            this.keyboardBuffer = [];
        default:
      }
  }

  ngOnInit() {
    // this.settingsService.loadSettings().then(() => {
    //   this.settings = this.settingsService.settings;
    //   this.loadStimuli().then(() => {
    //     setTimeout(() => {
    //       this.openDialog('start', ErrorComponent,  {
    //         disableClose: true,
    //         data: {
    //           title: 'Ready?',
    //           content: 'Click Ok to start.'
    //         }
    //       },
    //       () => {
    //         this.runTask();
    //       });
    //     }, 1000);
    //   })
    // });
  }

  openDialog(id: string, target: any, options: any, afterClose: any) {
    if (this.dialogRefs.hasOwnProperty(id)) {
      this.dialogRefs[id].close();
    }
    this.dialogRefs[id] = this.dialog.open(target, options);
    this.dialogRefs[id].afterClosed().subscribe(() => {
      if (this.dialogRefs.hasOwnProperty(id)) {
        delete this.dialogRefs[id];
      }
      if (!this.exit) {
        afterClose();
      }
    });
  }

  closeDialog(id?: string) {
    if (id) {
      if (this.dialogRefs.hasOwnProperty(id)) {
        this.dialogRefs[id].close();
        delete this.dialogRefs[id];
      }
    } else {
      for (let id in this.dialogRefs) {
          if (this.dialogRefs.hasOwnProperty(id)) {
          this.dialogRefs[id].close();
          delete this.dialogRefs[id];
        }
      }
    }
  }

}
