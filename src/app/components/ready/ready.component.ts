import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import * as md from '@angular/material';


@Component({
  selector: 'app-ready',
  templateUrl: './ready.component.html',
  styleUrls: ['./ready.component.scss']
})
export class ReadyComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ReadyComponent>) { }

  ngOnInit() {
  }

  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    this.handleKeyboardEvents(event);
  }

  handleKeyboardEvents(event: KeyboardEvent) {
    switch (event.type) {
      case 'keydown':
        if (event.keyCode === 32) {
          this.dialogRef.close();
        }
        break;
      default:
    }
  }

}
