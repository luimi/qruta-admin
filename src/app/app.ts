import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Parse from 'parse';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('adminv4');

  ngOnInit(){
    Parse.initialize("7S389pHCOfe0ZRH7Dd3598YOpOr9AaJ63r9VdV49", "");
    Parse.serverURL = 'https://qruta-main.up.railway.app/parse';
    //TODO cambiar esto por ENV
    //Parse.initialize("a2CrSWBCOFOloJFKy0WERppId", "ZrLOMdnQ0GtPq1mw8V13");
    //Parse.serverURL = 'https://api.smartcm.co/bus';
  }
}
