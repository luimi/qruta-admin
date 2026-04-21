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

  ngOnInit() {
    Parse.initialize(import.meta.env['NG_APP_APP_ID'], import.meta.env['NG_APP_JS_KEY'] || "");
    Parse.serverURL = import.meta.env['NG_APP_SERVER_URL'];
  }
}
