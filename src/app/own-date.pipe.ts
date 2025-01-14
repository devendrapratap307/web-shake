import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ownDate'
})
export class OwnDatePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {
    const today = new Date();
    const date = new Date(value);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${formatDate(value, 'h:mm a', 'en-IN')}`;
    }

    // Check if it's yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${formatDate(value, 'h:mm a', 'en-IN')}`;
    }

    // For older dates, return the formatted date
    return formatDate(value, 'dd/MM/yyyy, h:mm a', 'en-IN');
  }

}
