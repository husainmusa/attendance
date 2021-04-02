import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  
  DATE_FMT:string = "yy MM dd"
  monthNames = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayNames = ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  transform(value: string, ...args) {
    let date = new Date(value);
    let year = date.getFullYear().toString();
    let formatedDate = year.slice(2, 4) + ' ' + this.monthNames[date.getMonth()] +' '+  date.getDate() +', '+this.dayNames[date.getDay()]
    return formatedDate;
  }
}
