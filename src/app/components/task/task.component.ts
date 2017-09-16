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
import { FinishComponent } from '../finish/finish.component';
import { BreakComponent } from '../break/break.component';
import { SettingsService, Settings } from '../../providers/settings.service';

const filterWav = item => path.extname(item.path) === '.wav';

const colorCount: number = 16;

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

  private dialogRefs: any;

  private finish: boolean;
  private abort: boolean;

  private taskRunning: boolean;
  private trialRunning: boolean;

  private barColor: number;
  private backgroundColor: number;
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


    this.stimuli = new Array<any>();
    this.settings = settingsService.settings;

    this.trial = 0;
    this.taskRunning = false;
    this.trialRunning = false;
    this.dialogRefs = {};
    this.abort = false;

    this.barColor = this.backgroundColor = 1;

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
    let now = new Date();
    this.participantFolder = sprintf.sprintf('%04d%02d%02d-%02d%02d',
      now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes());
    let participantPath = path.normalize(path.join(this.settings.responsesPath, this.participantFolder));
    fs.mkdirpSync(participantPath,
      (err) => {
        console.error(`Could not create folder '${participantPath}'`)
      });
    this.finish = false;
    this.abort = false;
    this.taskRunning = true;
    this.runTrial();
  }

  private runTrial() {
    this.recorder.record();
    this.startTrial()
      .then(this.loadStimulus)
      .then(this.playStimulus)
      .then(this.playTone)
      .then(this.recordResponse)
      .then(this.saveResponse)
      .then(this.endTrial);
  }

  private startTrial(self?: TaskComponent) {
    self = self || this
    self.backgroundColor = self.barColor;
    self.barColor = (self.barColor % colorCount) + 1;
    self.barOrientation = self.barOrientation === 'vertical' ? 'horizontal' : 'vertical';
    self.barDirection = self.barOrientation === 'vertical' ? ['top', 'bottom'] : ['left', 'right'];
    self.trialRunning = true;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(self), 2000)
    });
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
      self.settings.responsesPath, self.participantFolder,
      `${sprintf.sprintf('%03d', self.trial + 1)}-${path.posix.basename(self.stimuli[i].path)}`
    ));
  }

  private endTrial(self?: TaskComponent) {
    self = self || this;
    self.trial ++;
    self.trial = 100000
    if (self.abort) {
      return;
    }
    if (self.trial >= self.stimuli.length) {
      self.endTask()
    } else {
      if (self.trial % self.settings.blockSize === 0) {
        self.break();
      } else {
        self.runTrial();
      }
    }
  }

  private endTask() {
    this.openDialog('finish', FinishComponent,  {
      disableClose: true
    },
    () => {
      this.router.navigateByUrl('');
    });
  }

  private break() {
    this.openDialog('break', BreakComponent,  {
      disableClose: true
    },
    () => {
      this.runTrial();
    });
  }

  handleKeyboardEvents(event: KeyboardEvent) {
      let key = event.which || event.keyCode;
      switch (event.type) {
        case 'keydown':
          this.keyboardBuffer.push(event.key);

          if (this.keyboardBuffer.join('|') === 'Control|Shift|Escape') {
              this.abort = true;
              this.closeDialog();
              this.router.navigateByUrl('');
          }
          break;
        case 'keyup':
            this.keyboardBuffer = [];
        default:
      }
    return false;
  }

  ngOnInit() {
    this.settingsService.loadSettings().then(() => {
      this.settings = this.settingsService.settings;
      this.loadStimuli().then(() => {
        setTimeout(() => {
          this.openDialog('start', ErrorComponent,  {
            disableClose: true,
            data: {
              title: 'Ready?',
              content: 'Click Ok to start.'
            }
          },
          () => {
            this.runTask();
          });
        }, 1000);
      })
    });
  }

  openDialog(id: string, target: any, options: any, afterClose: any) {
    if (this.abort || this.finish) return;
    if (this.dialogRefs.hasOwnProperty(id)) {
      this.dialogRefs[id].close();
    }
    this.dialogRefs[id] = this.dialog.open(target, options);
    this.dialogRefs[id].afterClosed().subscribe(() => {
      if (this.dialogRefs.hasOwnProperty(id)) {
        delete this.dialogRefs[id];
      }
      if (!this.abort) {
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
