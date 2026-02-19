import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  cities: any[] = [];
  current: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef){
    this.current = Parse.User.current();
  }

  ngOnInit() {
    this.getCities();
  }

  async logout(){
    await Parse.User.logOut();
    this.router.navigate(['/login']);
  }

  async getCities(): Promise<void> {
    this.cities = await new Parse.Query('City').ascending('name').find()
    this.cdr.detectChanges(); 
  }
}
