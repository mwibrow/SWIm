import { Component, OnInit, HostListener } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-break',
  templateUrl: './break.component.html',
  styleUrls: ['./break.component.scss']
})
export class BreakComponent implements OnInit {

  constructor(private dialogRef: MdDialogRef<BreakComponent>) { }

  ngOnInit() {
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
