import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Route {
  id: number;
  name: string;
}

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company.html',
  styleUrl: './company.css'
})
export class CompanyComponent {
  companyName = 'Transportes A';
  routes: Route[] = [
    { id: 1, name: 'Ruta Central' },
    { id: 2, name: 'Ruta Norte' }
  ];
  
  companyForm: FormGroup;
  routeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      newCompanyName: [this.companyName, [Validators.required]]
    });

    this.routeForm = this.fb.group({
      routeName: ['', [Validators.required]]
    });
  }

  updateCompanyName(): void {
    if (this.companyForm.valid) {
      this.companyName = this.companyForm.value.newCompanyName;
      alert('Nombre de empresa actualizado');
    }
  }

  addRoute(): void {
    if (this.routeForm.valid) {
      const newRoute: Route = {
        id: this.routes.length + 1,
        name: this.routeForm.value.routeName
      };
      this.routes.push(newRoute);
      this.routeForm.reset();
    }
  }

  deleteRoute(id: number): void {
    this.routes = this.routes.filter(route => route.id !== id);
  }
}
