import { Component, OnInit } from '@angular/core';
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


  handleKeyboardEvents(event: KeyboardEvent) {
      switch (event.type) {
        case 'keydown':
            this.dialogRef.close();
        default:
      }
  }
}
