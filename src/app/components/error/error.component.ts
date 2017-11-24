import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  title: 'Ooops!';
  content: 'An error occured.';
  constructor(@Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<ErrorComponent>) {
      if (data) {
        this.title = data.title || this.title;
        this.content = data.content || this.content;
      }
  }

  ngOnInit() {
  }

  onOk() {
    this.dialogRef.close();
  }

}
