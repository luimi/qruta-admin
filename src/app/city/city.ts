import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Company {
  id: number;
  name: string;
}

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city.html',
  styleUrl: './city.css'
})
export class CityComponent {
  cityName = 'Ciudad de Ejemplo';
  isMassive = false;
  isActive = true;
  companies: Company[] = [
    { id: 1, name: 'Transportes A' },
    { id: 2, name: 'Movilidad B' }
  ];
  
  companyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]]
    });
  }

  onMassiveChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.isMassive = select.value === 'yes';
  }

  onStatusChange(): void {
    this.isActive = !this.isActive;
  }

  addCompany(): void {
    if (this.companyForm.valid) {
      const newCompany: Company = {
        id: this.companies.length + 1,
        name: this.companyForm.value.companyName
      };
      this.companies.push(newCompany);
      this.companyForm.reset();
    }
  }

  deleteCompany(id: number): void {
    this.companies = this.companies.filter(company => company.id !== id);
  }
}
