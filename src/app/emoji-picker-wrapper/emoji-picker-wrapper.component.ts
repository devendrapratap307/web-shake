import { Component, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
import 'emoji-picker-element';

@Component({
  selector: 'app-emoji-picker-wrapper',
  templateUrl: './emoji-picker-wrapper.component.html',
  styleUrls: ['./emoji-picker-wrapper.component.css']
})
export class EmojiPickerWrapperComponent implements OnInit, AfterViewInit {
  picker: HTMLElement | null = null;
  @Output() emojiSelect = new EventEmitter<string>();
  isPickerVisible: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createPicker();
  }

  togglePicker() {
    this.isPickerVisible = !this.isPickerVisible;
    if (this.isPickerVisible) {
      this.createPicker();
    }
  }

  createPicker() {
    if (!this.picker) {
      this.picker = document.createElement('emoji-picker');
      document.getElementById('emoji-picker-container')?.appendChild(this.picker);
      this.picker.addEventListener('emoji-click', (event: any) => {
        this.onEmojiClick(event);
      });
    }
  }

  onEmojiClick(event: any): void {
    const selectedEmoji = event.detail.emoji;
    // console.log('Selected emoji:', selectedEmoji);
    // console.log(' emoji:', selectedEmoji?.unicode);
    this.emojiSelect.emit(selectedEmoji?.unicode);
    this.isPickerVisible = false;
  }
}
