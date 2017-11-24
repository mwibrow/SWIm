import { Component, OnInit, HostListener } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-ready',
  templateUrl: './ready.component.html',
  styleUrls: ['./ready.component.scss']
})
export class ReadyComponent implements OnInit {

  constructor(private dialogRef: MdDialogRef<ReadyComponent>) { }

  ngOnInit() {
  }

  @HostListener('document:event', ['$event'])
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
