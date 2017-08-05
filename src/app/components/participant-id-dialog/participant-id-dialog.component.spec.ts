import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantIdDialogComponent } from './participant-id-dialog.component';

describe('ParticipantIdDialogComponent', () => {
  let component: ParticipantIdDialogComponent;
  let fixture: ComponentFixture<ParticipantIdDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantIdDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
