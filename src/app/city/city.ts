import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Parse from 'parse';
import { Utils } from '../utils/utils';

interface FareItem {
  name: string;
  value: string;
}

interface PaymentItem {
  name: string;
  icon: string;
}

interface CoverageItem {
  name: string;
}

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
  systemType: string = "";
  promotionalImage: string = "";
  moreInfoLink: string = "";
  isAdmin: boolean = false;
  companies: any[] = [];

  activeTab: string = 'informacion';
  fares: FareItem[] = [];
  payments: PaymentItem[] = [];
  coverages: CoverageItem[] = [];

  newFareName: string = '';
  newFareValue: string = '';
  newFareManual: boolean = false;
  newFareDayType: string = 'information.fares.days.all';

  newPaymentName: string = '';
  newCoverageName: string = '';

  fareOptions = [
    { value: 'information.fares.days.all', label: 'Todos los dias' },
    { value: 'information.fares.days.m2f', label: 'Lunes a viernes' },
    { value: 'information.fares.days.m2s', label: 'Lunes a Sabado' },
    { value: 'information.fares.days.s&h', label: 'Domingos y festivos' },
    { value: 'information.fares.days.monday', label: 'Lunes' },
    { value: 'information.fares.days.tuesday', label: 'Martes' },
    { value: 'information.fares.days.wednesday', label: 'Miercoles' },
    { value: 'information.fares.days.thursday', label: 'Jueves' },
    { value: 'information.fares.days.friday', label: 'Viernes' },
    { value: 'information.fares.days.saturday', label: 'Sabado' },
    { value: 'information.fares.days.sunday', label: 'Domingo' }
  ];
  fareOptionsObj = Object.fromEntries(this.fareOptions.map(item => [item.value, item]));
  
  paymentOptions = [
    { value: 'cash', label: 'Efectivo', icon: 'cash-outline' },
    { value: 'card', label: 'Tarjeta', icon: 'card-outline' },
    { value: 'smartPhone', label: 'Smartphone', icon: 'phone-portrait-outline' },
    { value: 'QR', label: 'QR', icon: 'qr-code-outline' },
    { value: 'RFC', label: 'RFC', icon: 'radio-outline' }
  ];
  paymentOptionsObj = Object.fromEntries(this.paymentOptions.map(item => [item.value, item]));
  
  companyForm: FormGroup;

  constructor(private fb: FormBuilder, private router: ActivatedRoute, private utils: Utils, private cdr: ChangeDetectorRef) {
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
      this.systemType = this.city.get('model') || '';
      this.promotionalImage = this.city.get('image') || '';
      this.moreInfoLink = this.city.get('infoLink') || '';
      await this.getCompanies();
      this.isAdmin = await this.utils.isAdmin();
      this.loadTabsData();
      this.cdr.detectChanges(); 
    });
  }

  loadTabsData() {
    this.fares = this.city.get('fares') || [];
    this.payments = this.city.get('payments') || [];
    this.coverages = this.city.get('coverage') || [];
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  async addFare() {
    const name = this.newFareManual ? this.newFareName : this.newFareDayType;
    const value = this.newFareValue;
    if (!name || !value) return;
    
    const newFare: FareItem = { name, value };
    this.fares = [...this.fares, newFare];
    await this.saveFares();
  }

  async removeFare(index: number) {
    this.fares = this.fares.filter((_, i) => i !== index);
    await this.saveFares();
  }

  async saveFares() {
    this.city.set('fares', this.fares);
    try {
      await this.city.save();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  toggleFareManual() {
    if (this.newFareManual) {
      this.newFareDayType = 'information.fares.days.all';
    } else {
      this.newFareName = '';
    }
    this.cdr.detectChanges(); 
  }

  async addPayment() {
    const selectedOption = this.paymentOptions.find(o => o.value === this.newPaymentName);
    if (!this.newPaymentName || !selectedOption) return;

    const newPayment: PaymentItem = {
      name: this.newPaymentName,
      icon: selectedOption.icon
    };
    this.payments = [...this.payments, newPayment];
    await this.savePayments();
  }

  async removePayment(index: number) {
    this.payments = this.payments.filter((_, i) => i !== index);
    await this.savePayments();
  }

  async savePayments() {
    this.city.set('payments', this.payments);
    try {
      await this.city.save();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async addCoverage() {
    if (!this.newCoverageName) return;

    const newCoverage: CoverageItem = { name: this.newCoverageName };
    this.coverages = [...this.coverages, newCoverage];
    await this.saveCoverages();
  }

  async removeCoverage(index: number) {
    this.coverages = this.coverages.filter((_, i) => i !== index);
    await this.saveCoverages();
  }

  async saveCoverages() {
    this.city.set('coverage', this.coverages);
    try {
      await this.city.save();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  getPaymentIcon(name: string): string {
    const option = this.paymentOptions.find(o => o.value === name);
    return option?.icon || 'help-outline';
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
      this.cdr.detectChanges(); 
      await this.getCompanies()
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

  async saveConfig() {
    this.city.set('model', this.systemType);
    this.city.set('image', this.promotionalImage);
    this.city.set('infoLink', this.moreInfoLink);
    try {
      await this.city.save();
      alert("Configuración guardada");
    } catch (e: any) {
      alert("Error: " + e.message)
    }
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
