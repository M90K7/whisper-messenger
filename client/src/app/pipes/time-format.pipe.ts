import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: string | Date, ...args: string[]): unknown {
    let _date: Date | undefined = undefined;
    if (!(value instanceof Date))
      _date = new Date(value);
    else {
      _date = value;
    }
    return new Intl.DateTimeFormat('fa-IR', {
      hour: "2-digit", minute: "2-digit", hourCycle: "h24", //second: "2-digit",
      calendar: "persian",
      numberingSystem: "latn", // 'arab'
    }).format(_date);
  }

}
