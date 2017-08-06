import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HomeComponent, ExitAppComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

import { AudioService } from './providers/audio.service';

import { SettingsService } from './providers/settings.service';

import {
  MdButtonModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdToolbarModule,
  MdDialogModule
} from '@angular/material';
import { TaskComponent } from './components/task/task.component';
import { ErrorComponent } from './components/error/error.component';
import { BreakComponent } from './components/break/break.component';

import { BackgroundAnimationComponent } from './components/background-animation/background-animation.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExitAppComponent,
    SettingsComponent,
    TaskComponent,
    ErrorComponent,
    BreakComponent,
    BackgroundAnimationComponent
  ],
  entryComponents: [
    ErrorComponent,
    BreakComponent,
    ExitAppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    MdButtonModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdToolbarModule,
    MdDialogModule,
  ],
  providers: [
    ElectronService,
    AudioService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
