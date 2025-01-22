import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTimeFormat'
})
export class DateTimeFormatPipe implements PipeTransform {

  transform(value: string | Date, ...args: string[]): unknown {
    let _date: Date | undefined = undefined;
    if (!(value instanceof Date))
      _date = new Date(value);
    else {
      _date = value;
    }
    return new Intl.DateTimeFormat('fa-IR', {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h24", //second: "2-digit",
      calendar: "persian",
      numberingSystem: "latn", // 'arab'
    }).format(_date);
  }

}
