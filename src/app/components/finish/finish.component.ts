import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss']
})
export class FinishComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<FinishComponent>) { }

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
