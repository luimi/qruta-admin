import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { LeafletCtrl } from '../utils/leaflet-ctrl';
import Parse from 'parse';
import { Utils } from '../utils/utils';

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
  marker: any;
  circle: any;

  constructor(private fb: FormBuilder, private leafletCtrl: LeafletCtrl, private utils: Utils) {
    this.cityForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.leafletCtrl.initialize(this.mapContainer.nativeElement);
    this.leafletCtrl.addMapEventListener(this.leafletCtrl.events.click, (e: any) => {
      const location = e.latlng;
      if (this.marker) {
        this.marker.setLatLng(location);
        this.removeCircle();
      } else {
        this.marker = this.leafletCtrl.addMarker([location.lat, location.lng], true);
        this.marker.on(this.leafletCtrl.events.click, (e: any) => {
          if (!this.circle) {
            const location = this.marker.getLatLng();
            this.circle = this.leafletCtrl.addCircle([location.lat, location.lng], 'red', 9000);
          } else {
            this.removeCircle();
          }
        });
        this.marker.on(this.leafletCtrl.events.dragend, () => {
          this.removeCircle();
        });
      }
    });
  }

  private removeCircle() {
    if (this.circle) {
      this.leafletCtrl.map.removeLayer(this.circle);
      this.circle = undefined;
    }
  }

  async onSave() {
    if (!this.cityForm.valid || !this.marker) return
    const { name } = this.cityForm.value;
    const location = this.marker.getLatLng();

    const city = this.utils.genericObject("City")
    city.set("name", name)
    city.set("location", new Parse.GeoPoint(location.lat, location.lng))
    city.set("status", false)
    city.set("zoom", 12)
    city.setACL(await this.utils.getACL())


    try {
      await city.save()
      alert("Ciudad guardada")
      this.removeCircle();
      this.leafletCtrl.map.removeLayer(this.marker);
      this.circle = undefined;
      this.marker = undefined;
      this,this.cityForm.reset()
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  get name() {
    return this.cityForm.get('name');
  }
}
