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

  private settings: any;
  private stimuli: Array<any>;
  private trial: number;
  private participantFolder: string;
  private now: Date;

  private player: AudioPlayer;
  private recorder: AudioRecorder;

  private keyboardBuffer: Array<string>;
  private dialogRef: MdDialogRef<ErrorComponent>;

  constructor(private router: Router, private audio: AudioService,
    public dialog: MdDialog) {

    this.audio.initialise();
    this.player = audio.player;
    this.player.initialise();
    this.recorder = audio.recorder;
    this.recorder.initialise();

    this.keyboardBuffer = [];

    this.stimuli = new Array<any>();
    storage.get('settings',
      (error, data) => {
        let settings: any = data || {};
        this.settings = {
          stimuliPath: settings.stimuliPath,
          responsesPath: settings.responsesPath,
          blockSize: 10,
          repetitions: 0,
          recordTime: 3.0
        };

        this.loadStimuli();

     });

    this.trial = 0;
  }

  private loadStimuli() {
    console.log(`Loading wav files from ${this.settings.stimuliPath}`);
    this.stimuli = klawSync(this.settings.stimuliPath, { filter: filterWav });
    if (this.stimuli.length === 0) {
      this.dialogRef = this.dialog.open(ErrorComponent, {
        data: {
          title: 'Ooops!',
          content: 'There were no audio files in the stimuli folder'
        }
      });
      this.dialogRef.afterClosed().subscribe(() => {
        this.router.navigateByUrl('');
      });
    }
  }

  private runTask() {
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
      self.player.loadWav(self.stimuli[i]).then(() => resolve(self))
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
      setTimeout(() => resolve(self), self.settings.recordTime * 1000);
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
      `${sprintf('%03d', self.trial + 1)}-${path.posix.basename(self.stimuli[i])}`
    ));
  }

  private endTrial(self?: TaskComponent) {
    self = self || this;
    self.trial ++;
    if (self.trial % self.settings.blockSize === 0) {
      self.break();
    } else {
      self.runTrial();
    }
  }

  private break() {

  }

  handleKeyboardEvents(event: KeyboardEvent) {
      let key = event.which || event.keyCode;
      switch (event.type) {
        case 'keydown':
            if (event.key === 'Escape') {
              this.router.navigateByUrl('');
            }
            break;
        case 'keyup':
            this.keyboardBuffer = [];
        default:
      }
  }

  ngOnInit() {

  }

}
