import { Component } from '@angular/core';

@Component({
  selector: 'app-close-button',
  template: `<button class="no-border-radius btn btn-danger btn-sm float-right">&times;</button>`,
  styles: [
    `button {
      font-size: 1.1rem;
      padding-top: 0.11rem;
      padding-bottom: 0.11rem;
    }`
  ]
})
export class CloseButtonComponent {}
