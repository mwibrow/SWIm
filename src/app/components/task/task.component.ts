import { Component, OnInit } from '@angular/core';
import { AudioService, AudioPlayer, AudioRecorder } from '../../providers/audio.service';

const storage = require('electron-json-storage');
const fs = require('fs-extra');
const klaw = require('klaw');
const path = require('path');
const through2 = require('through2');

const wavFilter = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory() && path.extname(item.path) === '.wav') {
    this.push(item);
  }
  next()
})

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  private settings: any;
  private stimuli: Array<any>;
  private trial: number;
  private now: Date;

  private player: AudioPlayer;
  private recorder: AudioRecorder;
  constructor(private audio: AudioService) {

    this.audio.initialise();
    this.player = audio.player;
    this.player.initialise();
    this.recorder = audio.recorder;
    this.recorder.initialise();

    this.stimuli = new Array<any>();
    storage.get('settings',
      (error, data) => {
        let settings: any = data || {};
        this.settings = {
          stimuliPath: settings.stimuliPath,
          responsesPath: settings.responsesPath,
          blockSize: 10,
          repetitions: 0
        };

        this.loadStimuli();

     });

    this.trial = 0;
  }

  private loadStimuli() {
    console.log(`Loading wav files from ${this.settings.stimuliPath}`);
    klaw(this.settings.stimuliPath)
      .pipe(wavFilter)
      .on('data', item => this.stimuli.push(item.path))
      .on('end', () => this.afterLoadStimuli())
  }

  private afterLoadStimuli() {
    console.log(`Loaded ${this.stimuli.length} wav file(s).`);
    this.runTrial();
  }

  private runTrial() {
    this.loadStimulus().then(this.playStimulus).then(this.playTone).then(this.nextTrial);
  }

  private loadStimulus(self?) {
    let i: number;
    self = self || this;
    return new Promise((resolve, reject) => {
      i = self.trial % self.stimuli.length;
      self.player.loadWav(self.stimuli[i]).then(() => resolve(self))
    });
  }

  private playStimulus(self) {
    self = self || this;
    return new Promise((resolve, reject) => {
      return self.player.play().then(() => resolve(self));
    });
  }

  private playTone(self) {
    self = self || this;
    return new Promise((resolve, reject) => {
      self.player.playTone(440, 1).then(() => resolve(self));
    });
  }

  private recordEnd(self) {
    self = self || this;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(self), 500)
    })
  }

  private nextTrial(self) {
    self = self || this;
    self.trial ++;

  }

  ngOnInit() {
  }

}
