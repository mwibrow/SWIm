import { Component, OnInit, HostListener } from '@angular/core';
import { AudioService, AudioPlayer, AudioRecorder } from '../../providers/audio.service';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import * as fs from 'fs-extra';

const sprintf = require ('sprintf-js');

const storage = require('electron-json-storage');
const path = require('path');
const _ = require('lodash');

import { ErrorComponent } from '../error/error.component';
import { FinishComponent } from '../finish/finish.component';
import { ReadyComponent } from '../ready/ready.component';
import { BreakComponent } from '../break/break.component';
import { SettingsService, Settings } from '../../providers/settings.service';
import { Visualiser } from '../../visualiser';

const filterWav = item => path.extname(item) === '.wav';

const COLOR_COUNT = 16;
const DIRECTIONS: Array<string> =  ['top', 'bottom', 'left', 'right'];
const STYLE_OUT = 'out';
const STYLE_IN = 'in';


class Tile {
  constructor(
    public color: number,
    public stack: string,
    public direction: string,
    public style: string,
    public visualiserStyle: any = {},
    public active: boolean = false) {};
}



@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  private settings: Settings;
  private stimuli: Array<string>;
  private audioStimuli: any;
  private trial: number;
  private participantFolder: string;
  private now: Date;

  private player: AudioPlayer;
  private recorder: AudioRecorder;
  private visualiser: Visualiser;

  private keyboardBuffer: Array<string>;

  private dialogRefs: any;

  private finish: boolean;
  private abort: boolean;

  private taskRunning: boolean;
  private trialRunning: boolean;

  private tiles: Array<Tile>;
  private incomingTileIndex: number;
  private savedTileColor: number;

  private escapeCombo: string;
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

    this.visualiser = new Visualiser(this.audio.getContext());
    this.recorder.clearNodes();
    this.recorder.addNode(this.visualiser.analyser);
    this.recorder.monitor = false;

    this.keyboardBuffer = [];


    this.stimuli = new Array<string>();
    this.audioStimuli = {};
    this.settings = settingsService.settings;

    this.trial = 0;
    this.taskRunning = false;
    this.trialRunning = false;
    this.dialogRefs = {};
    this.abort = false;

    this.tiles = new Array<Tile>();
    this.tiles.push(new Tile(0, 'back', 'top', 'out'));
    this.tiles.push(new Tile(0, 'front', 'left', 'in'));
    this.incomingTileIndex = 0;
    this.savedTileColor = null;

    this.escapeCombo = 'Escape|Escape|Escape';
  }

  private loadStimuli() {
    return new Promise((resolve, reject) => {
      console.log(`Loading wav files from ${this.settings.stimuliPath}`);
      const stimuli: string[] = fs.readdirSync(this.settings.stimuliPath)
        .filter(filterWav)
        .map(wav => path.join(this.settings.stimuliPath, wav));
      if (stimuli.length === 0) {
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
      console.log(`Loaded ${stimuli.length} audio paths.`);
      this.audioStimuli = stimuli.reduce((obj, stimulus) => Object.assign(obj, {[this.getBase(stimulus)]: stimulus}), {});
      this.stimuli = _.flatten(_.times(this.settings.repetitions, () => Object.keys(this.audioStimuli)));
      console.log(`Total audio stimuli (including repetitions): ${this.stimuli.length}`)
      resolve();
    });
  }

  private getBase(filePath): string {
    const isWindows: boolean = path.sep === '//';
    const pathApi = isWindows ? path.win32 : path;
    return pathApi.basename(filePath, path.extname(filePath))
  }

  private runTask() {
    const now = new Date();
    this.participantFolder = sprintf.sprintf('%04d%02d%02d-%02d%02d%02d',
      now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    const participantPath = path.normalize(path.join(this.settings.responsesPath, this.participantFolder));
    fs.mkdirp(participantPath)
    .then(() => {
      this.stimuli = _.shuffle(this.stimuli);
      this.finish = false;
      this.abort = false;
      this.taskRunning = true;
      this.runTrial();
    })
    .catch((err) => {
        console.error(`Could not create folder '${participantPath}'`)
    });
  }

  private runTrial() {
    this.startTrial()
      .then(() => this.loadStimulus())
      .then(() => this.startRecording())
      .then(() => this.playStimulus())
      .then(() => this.playTone())
      .then(() => this.recordResponse())
      .then(() => this.saveResponse())
      .then(() => this.endTrial());
  }

  private startTrial() {

    this.updateTiles(true);
    this.trialRunning = true;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(self), 2000)
    });
  }

  private loadStimulus()  {
    let i: number;
    return new Promise((resolve, reject) => {
      i = this.trial % this.stimuli.length;
      this.player.loadWav(this.audioStimuli[this.stimuli[i]]).then(() => {
        resolve();
      });
    });
  }

  private startRecording() {
    return new Promise((resolve, reject) => {
      this.recorder.record();
      this.visualiser.onvisualise = (data) => {
        const value = (Math.floor((data[0] / 255) * 15) + 1) * 16;
        this.tiles[this.incomingTileIndex].visualiserStyle = {
          width: `${value}px`,
          height: `${value}px`
        }
      }
      this.visualiser.start();
      resolve();
    });
  }

  private playStimulus()  {
    return new Promise((resolve, reject) => {
      return this.player.play().then(() => resolve(self));
    });
  }

  private playTone()  {
    return new Promise((resolve, reject) => {
      this.player.playTone(440, 1).then(() => resolve(self));
    });
  }

  private recordResponse()  {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(self), this.settings.responseLength * 1000);
    })
  }

  private saveResponse() {
    return new Promise((resolve, reject) => {
      this.recorder.stop().then(() => {
        const wavPath: string = this.getResponseFile();
        console.log(`Saving wav to ${wavPath}`);
        this.recorder.saveWav(wavPath).then(() => resolve(self));
      });
    });
  }

  private getResponseFile() {
    let i: number;
    i = this.trial % this.stimuli.length;
    return path.normalize(path.join(
      this.settings.responsesPath, this.participantFolder,
      `${sprintf.sprintf('%03d', this.trial + 1)}-${this.stimuli[i]}.wav`
    ));
  }

  private endTrial() {
    this.trial ++;
    if (this.abort) {
      return;
    }
    if (this.trial >= this.stimuli.length) {
      this.updateTiles();
      setTimeout(() => this.endTask(), 2000);
    } else {
      if (this.trial % this.settings.blockSize === 0) {
        this.updateTiles();
        setTimeout(() => this.break(), 1500);
      } else {
        this.runTrial();
      }
    }
  }

  private updateTiles(active: boolean = false) {
    const outgoingTileIndex: number = this.incomingTileIndex;
    this.incomingTileIndex = 1 - this.incomingTileIndex;

    const inTile = this.tiles[this.incomingTileIndex];
    const outTile = this.tiles[1 - this.incomingTileIndex];

    const directions = _.sampleSize(DIRECTIONS, 2);

    inTile.color = _.sample(_.range(1, COLOR_COUNT).filter(color => color !== outTile.color));
    inTile.style = STYLE_IN;
    inTile.direction = directions[0];
    inTile.active = active;

    outTile.style = STYLE_OUT;
    outTile.direction = directions[1];

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

  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    this.handleKeyboardEvents(event);
  }

  @HostListener('document:keyup', ['$event'])
  keyup(event: KeyboardEvent) {
    this.handleKeyboardEvents(event);
  }

  handleKeyboardEvents(event: KeyboardEvent) {
    const key = event.which || event.keyCode;
    switch (event.type) {
      case 'keydown':
        this.keyboardBuffer.push(event.key);
        setTimeout(() => this.keyboardBuffer = [], 1000);
        console.log(this.keyboardBuffer.join('|').toLowerCase(), this.settings.escapeCombo.toLowerCase())
        if (this.keyboardBuffer.join('|').toLowerCase() === this.settings.escapeCombo.toLowerCase()) {
            this.abort = true;
            this.closeDialog();
            this.router.navigateByUrl('');
        }
        break;
      default:
    }
    return false;
  }

  ngOnInit() {
    this.settingsService.loadSettings().then(() => {
      this.settings = this.settingsService.settings;
      this.loadStimuli().then(() => {
        setTimeout(() => {
          this.updateTiles();
          this.openDialog('start', ReadyComponent,  {
            disableClose: true,
          },
          () => {
            this.runTask();
          });
        }, 1000);
      })
    });
  }

  openDialog(id: string, target: any, options: any, afterClose: any) {
    if (this.abort || this.finish) {
      return;
    }
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
      for (const property in this.dialogRefs) {
          if (this.dialogRefs.hasOwnProperty(property)) {
          this.dialogRefs[property].close();
          delete this.dialogRefs[property];
        }
      }
    }
  }

}
