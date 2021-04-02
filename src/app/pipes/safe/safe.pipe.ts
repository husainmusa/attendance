import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the SafePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */

  constructor(public sanitizer: DomSanitizer){}

  transform(value: string, ...args) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
