import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Parse from 'parse';
import { Utils } from '../utils/utils';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './city.html',
  styleUrl: './city.css'
})
export class CityComponent {
  city: any;
  massive: string = "";
  isAdmin: boolean = false;
  companies: any[] = [];


  companyForm: FormGroup;

  constructor(private fb: FormBuilder, private router: ActivatedRoute, private utils: Utils) {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]]
    });
    
  }

  ngOnInit() {
    this.router.params.subscribe(async (_) => {
      const cityId: string | null = this.router.snapshot.paramMap.get("id");
      if (!cityId) return
      this.city = await new Parse.Query('City').include('massive').get(cityId!);
      this.massive = this.city.get('massive') ? this.city.get('massive').id : undefined;
      this.getCompanies();
      this.isAdmin = await this.utils.isAdmin();
    });
  }

  async save() {
    if (!this.companyForm.valid) return;
    const { companyName } = this.companyForm.value;
    const company = this.utils.genericObject('Company');
    company.set('name', companyName);
    company.set('city', this.city);
    const acl = await this.utils.getACL();
    company.setACL(acl);
    try {
      await company.save();
      alert("Nueva empresa guardada");
      this.getCompanies()
      this.companyForm.reset();
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }
  async massiveChange() {
    let company;
    if (this.massive) {
      company = this.utils.genericObject('Company');
      company.id = this.massive;
    }
    this.city.set('massive', company);
    try {
      await this.city.save();
      alert("Empresa de bus masivo cambiado");
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  status() {
    this.city.set('status', !this.city.get('status'));
    this.city.save();
  }
  async getCompanies() {
    this.companies = await new Parse.Query('Company').equalTo('city', this.city).ascending('name').find();
  }

  async deleteCompany(company: any) {
    try {
      await company.destroy();
      this.getCompanies();
      alert("Empresa de bus eliminada");
    } catch(e: any) {
      alert("Error: " + e.message)
    }
  }
}
