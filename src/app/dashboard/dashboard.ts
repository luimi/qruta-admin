import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import Parse from 'parse';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  cities: any[] = [];
  current: any;

  constructor(private router: Router){}

  ngOnInit() {
    this.getCities();
    this.current = Parse.User.current();
  }

  async logout(){
    await Parse.User.logOut();
    this.router.navigate(['/login']);
  }

  async getCities(){
    this.cities = await new Parse.Query('City').ascending('name').find();
  }
}
