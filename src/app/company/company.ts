import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Parse from 'parse';
import { Utils } from '../utils/utils';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './company.html',
  styleUrl: './company.css'
})
export class CompanyComponent {
  company: any;
  isAdmin: boolean = false;
  companyName = 'Transportes A';
  routes: any[] = [];

  routeForm: FormGroup;

  constructor(private fb: FormBuilder, private router: ActivatedRoute, private utils: Utils, private location: Location, private cdr: ChangeDetectorRef) {
    this.routeForm = this.fb.group({
      routeName: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.router.params.subscribe(async (_) => {
      const companyId: string | null = this.router.snapshot.paramMap.get("id");
      if (!companyId) return
      this.company = await new Parse.Query('Company').include('city').get(companyId);
      await this.loadRoutes();
      this.isAdmin = await this.utils.isAdmin();
      this.cdr.detectChanges(); 
    });
  }
  async loadRoutes() {
    this.routes = await new Parse.Query('Route').equalTo('company', this.company).select('name','details','status').ascending('name').find();
  }
  async addRoute() {
    if (!this.routeForm.valid) return;

    const {routeName} = this.routeForm.value;

    const route = this.utils.genericObject('Route');
    route.set('name', routeName);
    route.set('company', this.company);
    route.set('city', this.company.get('city'));
    const acl = await this.utils.getACL();
    route.setACL(acl);

    try {
      await route.save();
      this.routes.push(route);
      alert("Ruta guardada");
      this.cdr.detectChanges(); 
      this.routeForm.reset();
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  async deleteRoute(route: any) {
    try {
      await route.destroy();
      alert("Ruta eliminada");
      this.routes = this.routes.filter((obj:any) => obj.id !== route.id)
      this.cdr.detectChanges(); 
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  goBack() {
    this.location.back();
  }
}
