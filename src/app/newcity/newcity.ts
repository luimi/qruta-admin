import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-newcity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newcity.html',
  styleUrl: './newcity.css'
})
export class NewcityComponent implements AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  cityForm: FormGroup;
  map: L.Map | null = null;
  currentMarker: L.Marker | null = null;

  constructor(private fb: FormBuilder) {
    this.cityForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([40.7128, -74.0060], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarker(e.latlng);
    });
  }

  addMarker(latlng: L.LatLng): void {
    if (this.currentMarker) {
      this.map!.removeLayer(this.currentMarker);
    }

    this.currentMarker = L.marker([latlng.lat, latlng.lng]).addTo(this.map!);
  }

  onSave(): void {
    if (this.cityForm.valid) {
      const cityData = {
        ...this.cityForm.value,
        coordinates: this.currentMarker ? this.currentMarker.getLatLng() : null
      };
      console.log('Saving city:', cityData);
      alert('Ciudad guardada correctamente');
    }
  }

  get name() {
    return this.cityForm.get('name');
  }
}
