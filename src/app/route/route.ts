import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';

interface Schedule {
  firstHour: string;
  lastHour: string;
  valleyFrequency: string;
  peakFrequency: string;
}

interface Image {
  id: number;
  name: string;
  url: string;
}

@Component({
  selector: 'app-route',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './route.html',
  styleUrl: './route.css'
})
export class RouteComponent implements AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  
  routeName = 'Ruta Central';
  activeTab = 'info';
  isGTFS = false;
  isActive = true;
  
  // Forms
  infoForm: FormGroup;
  scheduleForm: FormGroup;
  routeNameForm: FormGroup;
  
  // Schedules
  weekdaysSchedule: Schedule = {
    firstHour: '06:00',
    lastHour: '22:00',
    valleyFrequency: '30',
    peakFrequency: '15'
  };
  
  saturdaySchedule: Schedule = {
    firstHour: '07:00',
    lastHour: '21:00',
    valleyFrequency: '40',
    peakFrequency: '20'
  };
  
  sundaySchedule: Schedule = {
    firstHour: '08:00',
    lastHour: '20:00',
    valleyFrequency: '45',
    peakFrequency: '25'
  };
  
  images: Image[] = [
    { id: 1, name: 'parada1.jpg', url: 'https://via.placeholder.com/100x100' },
    { id: 2, name: 'parada2.jpg', url: 'https://via.placeholder.com/100x100' }
  ];
  
  map: L.Map | null = null;

  constructor(private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      detail: ['', [Validators.required]],
      information: ['', [Validators.required]]
    });

    this.routeNameForm = this.fb.group({
      newRouteName: [this.routeName, [Validators.required]]
    });

    this.scheduleForm = this.fb.group({
      weekdaysFirstHour: [this.weekdaysSchedule.firstHour],
      weekdaysLastHour: [this.weekdaysSchedule.lastHour],
      weekdaysValley: [this.weekdaysSchedule.valleyFrequency],
      weekdaysPeak: [this.weekdaysSchedule.peakFrequency],
      saturdayFirstHour: [this.saturdaySchedule.firstHour],
      saturdayLastHour: [this.saturdaySchedule.lastHour],
      saturdayValley: [this.saturdaySchedule.valleyFrequency],
      saturdayPeak: [this.saturdaySchedule.peakFrequency],
      sundayFirstHour: [this.sundaySchedule.firstHour],
      sundayLastHour: [this.sundaySchedule.lastHour],
      sundayValley: [this.sundaySchedule.valleyFrequency],
      sundayPeak: [this.sundaySchedule.peakFrequency]
    });
  }

  ngAfterViewInit(): void {
    if (this.activeTab === 'recorrido') {
      this.initializeMap();
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'recorrido' && !this.map) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  initializeMap(): void {
    if (!this.mapContainer) return;
    
    this.map = L.map(this.mapContainer.nativeElement).setView([40.7128, -74.0060], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  saveInfo(): void {
    console.log('Saving info:', this.infoForm.value);
    alert('Información guardada');
  }

  saveSchedule(): void {
    console.log('Saving schedule:', this.scheduleForm.value);
    alert('Horarios guardados');
  }

  updateRouteName(): void {
    if (this.routeNameForm.valid) {
      this.routeName = this.routeNameForm.value.newRouteName;
      alert('Nombre de ruta actualizado');
    }
  }

  toggleGTFS(): void {
    this.isGTFS = !this.isGTFS;
  }

  toggleStatus(): void {
    this.isActive = !this.isActive;
  }

  clearMap(): void {
    if (this.map) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          this.map!.removeLayer(layer);
        }
      });
    }
  }

  saveRoute(): void {
    console.log('Saving route data');
    alert('Recorrido guardado');
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const newImage: Image = {
        id: this.images.length + 1,
        name: file.name,
        url: URL.createObjectURL(file)
      };
      this.images.push(newImage);
    }
  }

  deleteImage(id: number): void {
    this.images = this.images.filter(image => image.id !== id);
  }
}
