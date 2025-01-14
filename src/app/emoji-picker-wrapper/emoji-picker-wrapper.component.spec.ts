import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPickerWrapperComponent } from './emoji-picker-wrapper.component';

describe('EmojiPickerWrapperComponent', () => {
  let component: EmojiPickerWrapperComponent;
  let fixture: ComponentFixture<EmojiPickerWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmojiPickerWrapperComponent]
    });
    fixture = TestBed.createComponent(EmojiPickerWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
