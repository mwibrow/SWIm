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
  private stimulusIndex: number;
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
          responsesPath: settings.responsesPath
        };

        this.loadStimuli();

     });

    this.stimulusIndex = 0;
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
    this.trial();
  }

  private trial() {
    this.player.on('ended', () => {
      this.player.playTone(440, 1);
    }).on('load', () => {
      this.player.play();
    });

    this.player.loadWav(this.stimuli[0]);
  }

  ngOnInit() {
  }

}
