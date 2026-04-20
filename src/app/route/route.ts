import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import Parse from 'parse';
import { Utils } from '../utils/utils';
import { LeafletCtrl } from '../utils/leaflet-ctrl';

@Component({
  selector: 'app-route',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './route.html',
  styleUrl: './route.css'
})
export class RouteComponent implements AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;

  route: any;
  images: any[] = [];
  isAdmin: boolean = false;
  path: any = { markers: [] };
  activeTab = 'info';
  currentMarker: any;

  // Forms
  infoForm: FormGroup;
  scheduleForm: FormGroup;
  routeNameForm: FormGroup;

  map: L.Map | null = null;

  transportTypes = [
    { value: 'motorcycle', label: 'Motocicleta', icon: 'icons/transport/motorcycle.svg' },
    { value: 'car', label: 'Carro', icon: 'icons/transport/car.svg' },
    { value: 'cable', label: 'Cable', icon: 'icons/transport/cable.svg' },
    { value: 'bus', label: 'Bus', icon: 'icons/transport/bus.svg' },
    { value: 'train', label: 'Tren', icon: 'icons/transport/train.svg' },
    { value: 'ferry', label: 'Ferry', icon: 'icons/transport/ferry.svg' },
    { value: 'ship', label: 'Barco', icon: 'icons/transport/ship.svg' }
  ];

  paymentTypes = [
    { value: 'cash', label: 'Efectivo', icon: 'icons/payment/money.svg' },
    { value: 'card', label: 'Tarjeta', icon: 'icons/payment/card.svg' },
    { value: 'nfc', label: 'NFC', icon: 'icons/payment/nfc.svg' },
    { value: 'qr', label: 'QR', icon: 'icons/payment/qr.svg' },
    { value: 'ticket', label: 'Ticket', icon: 'icons/payment/ticket.svg' }
  ];

  selectedTransport: string = '';
  selectedPayments: string[] = [];
  companyAssets: any[] = [];

  constructor(private fb: FormBuilder, private router: ActivatedRoute, private location: Location, private cdr: ChangeDetectorRef, private utils: Utils, private leafletCtrl: LeafletCtrl) {
    this.infoForm = this.fb.group({
      detail: [''],
      information: ['']
    });

    this.routeNameForm = this.fb.group({
      newRouteName: ['', [Validators.required]]
    });

    this.scheduleForm = this.fb.group({
      weekdaysFirstHour: [],
      weekdaysLastHour: [],
      weekdaysValley: [],
      weekdaysPeak: [],
      saturdayFirstHour: [],
      saturdayLastHour: [],
      saturdayValley: [],
      saturdayPeak: [],
      sundayFirstHour: [],
      sundayLastHour: [],
      sundayValley: [],
      sundayPeak: []
    });
  }

  ngAfterViewInit(): void {
    this.router.params.subscribe(async (_) => {
      const routeId: string | null = this.router.snapshot.paramMap.get("id");
      if (!routeId) return
      this.route = await new Parse.Query('Route').get(routeId);
      this.images = await new Parse.Query('Image').equalTo('route', this.route).find();
      this.isAdmin = await this.utils.isAdmin();
      this.cdr.detectChanges();
      this.infoForm.setValue({
        detail: this.route.get('details') || "",
        information: this.route.get('info') || ""
      });
      if (this.route.get("schedule")) {
        const schedule = this.utils.getSchedule(this.route.get("schedule"), "local");
        this.scheduleForm.setValue(schedule)
      }
      this.selectedTransport = this.route.get('type') || '';
      this.selectedPayments = this.route.get('payment') || [];
      await this.loadCompanyAssets();
    });
  }

  async loadCompanyAssets() {
    const company = this.route.get('company');
    if (company) {
      this.companyAssets = await new Parse.Query('Asset').equalTo('company', company).find();
    }
  }

  async addImageFromAsset(assetUrl: string) {
    const existingImage = this.images.find(img => img.get('url') === assetUrl);
    if (existingImage) {
      alert('Esta imagen ya existe en la ruta');
      return;
    }

    const image = this.utils.genericObject('Image');
    image.set('url', assetUrl);
    image.set('route', this.route);
    const acl = await this.utils.getACL();
    image.setACL(acl);
    await image.save();
    this.images.push(image);
    alert('Imagen agregada');
    this.cdr.detectChanges();
  }

  selectTransport(type: string): void {
    this.selectedTransport = type;
    this.route.set('type', type);
    this.save();
  }

  togglePayment(payment: string): void {
    const index = this.selectedPayments.indexOf(payment);
    if (index > -1) {
      this.selectedPayments.splice(index, 1);
    } else {
      this.selectedPayments.push(payment);
    }
    this.route.set('payment', this.selectedPayments);
    this.save();
  }

  isPaymentSelected(payment: string): boolean {
    return this.selectedPayments.indexOf(payment) > -1;
  }
  goBack() {
    this.location.back();
  }
  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'recorrido' && !this.map) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  async save(type?: string) {
    try {
      await this.route.save();
      if (type) alert(`${type} guardada`);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  saveInfo(): void {
    const { detail, information } = this.infoForm.value;
    this.route.set("details", detail);
    this.route.set("info", information);
    this.save("Información general")
  }

  saveSchedule(): void {
    const schedule = this.utils.getSchedule(this.scheduleForm.value, "server");
    this.route.set("schedule", schedule);
    this.save("Información del horario")
  }

  updateRouteName(): void {
    if (this.routeNameForm.valid) {
      this.route.set("name", this.routeNameForm.value.newRouteName)
      this.save("Nombre de ruta")
    }
  }

  toggleGTFS(): void {
    this.route.set("osisp", !this.route.get("osisp"));
    this.save("Tipo de ruta")
  }

  toggleStatus(): void {
    this.route.set("status", !this.route.get("status"));
    this.save("Estado de la ruta")
  }

  clearMap(): void {
    this.leafletCtrl.map.removeLayer(this.path.line);
    this.path.markers.forEach((step: any) => {
      this.leafletCtrl.map.removeLayer(step.marker);
    });
    this.path.markers = [];
    this.path.line = undefined;
    this.updatePath();
  }

  saveRoute(): void {
    const path: any[] = [];
    this.path.markers.forEach((step: any) => {
      const l = step.marker.getLatLng();
      const location = [l.lat, l.lng];
      if (step.stop) {
        location.push(step.stop);
      }
      path.push(location);
    });
    this.route.set('path', path);
    this.save("Recorrido de la ruta")
  }

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      try {
        let b64 = await this.utils.convertFileToBase64(file);
        let upload = await Parse.Cloud.run("uploadImage", { image: b64 });
        if (upload.success) {
          const image = this.utils.genericObject("Image");
          image.set("url", upload.url);
          image.set("route", this.route);
          const acl = await this.utils.getACL();
          image.setACL(acl);
          await image.save();
          alert("Imagen subida");
          this.images.push(image);
          this.cdr.detectChanges();
        } else {
          alert(upload.message)
        }
      } catch (e: any) {
        alert("Error: " + e.message)
      }
    }
  }

  async deleteImage(image: any): Promise<void> {
    try {
      this.images = this.images.filter((img: any) => img.id !== image.id);
      await image.destroy();
      alert("Imagen eliminada");
      this.cdr.detectChanges();
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  private async initializeMap() {
    if (!this.mapContainer) return;
    if (this.path.markers.length > 0) {
      this.leafletCtrl.map.removeLayer(this.path.line);
      this.path.markers.forEach((step: any) => {
        this.leafletCtrl.map.removeLayer(step.marker);
      });
      this.path.markers = [];
      this.path.line = undefined;
    }
    const city = this.route.get('city')
    await city.fetch()
    const cityLocation = city.get('location');
    this.leafletCtrl.initialize(this.mapContainer.nativeElement, [cityLocation.latitude, cityLocation.longitude], 12);
    this.leafletCtrl.addMapEventListener(this.leafletCtrl.events.click, (e: any) => {
      const l = e.latlng;
      this.addMarker(l);
      this.updatePath();
    });
    const path = this.route.get('path');
    if (path) {
      path.forEach((step: any) => {
        this.addMarker({ lat: step[0], lng: step[1] }, step[2]);
      });
      this.updatePath();
    }
    if (this.path.markers.length > 0) {
      this.leafletCtrl.centerMap(this.path.markers);
    }

  }
  private addMarker(l: any, stop?: any, index?: number) {
    const marker = this.leafletCtrl.addMarker([l.lat, l.lng], true, undefined, 'icons/' + (stop ? 'route-stop.png' : 'route-step.png'), 25);
    marker.on(this.leafletCtrl.events.dragend, (e) => {
      this.updatePath();
    });
    marker.on(this.leafletCtrl.events.rclick, (e) => {
      const index = this.path.markers.map((o: any) => { return o.marker; }).indexOf(marker);
      this.leafletCtrl.map.removeLayer(this.path.markers[index].marker);
      this.path.markers.splice(index, 1);
      this.updatePath();
    });
    marker.on(this.leafletCtrl.events.click, (e) => {
      const index = this.path.markers.map((o: any) => { return o.marker; }).indexOf(marker);
      this.currentMarker = this.path.markers[index];
      this.cdr.detectChanges()
    })
    const step: any = { marker: marker };
    if (stop) {
      step.stop = stop;
    }
    if (index) {
      this.path.markers.splice(index, 0, step);
    } else {
      this.path.markers.push(step);
    }



  }
  private updatePath() {
    if (this.path.line) {
      this.leafletCtrl.map.removeLayer(this.path.line);
    }
    if (this.path.markers.length > 1) {
      const path: any[] = [];
      this.path.markers.forEach((marker: any, index: number) => {
        let angle = 0;
        const l = marker.marker.getLatLng();
        if (index < this.path.markers.length - 1) {
          angle = this.leafletCtrl.getAngle(l, this.path.markers[index + 1].marker.getLatLng());
        }
        marker.marker.setRotationAngle(angle);
        path.push([l.lat, l.lng]);
      });
      this.path.line = this.leafletCtrl.addPolyline(path, 'red');
      this.path.line.on(this.leafletCtrl.events.rclick, (e: any) => {
        const l2l = (location: any) => {
          return [location.lat, location.lng]
        }
        const evtloc = l2l(e.latlng);
        const nearest = { distance: 9, index: -1 };
        const markers = this.path.markers;
        const getMarker = (index: number) => {
          return markers[index].marker.getLatLng();
        }
        for (let i = 1; i < markers.length; i++) {
          let ab = this.computeDistanceBetween(l2l(getMarker(i - 1)), l2l(getMarker(i)));
          let accb = this.computeDistanceBetween(l2l(getMarker(i - 1)), evtloc) + this.computeDistanceBetween(l2l(getMarker(i)), evtloc);
          let newDistance = Math.abs(ab - accb);
          if (newDistance < nearest.distance) {
            nearest.distance = newDistance;
            nearest.index = i;
          }
        }
        this.addMarker(e.latlng, null, nearest.index);
      });
    }
  }
  addStop(event: any) {
    const text = event.target.value;
    if (text !== '') {
      this.currentMarker.stop = text;
      this.currentMarker.marker.setIcon(this.leafletCtrl.icon('icons/route-stop.png', 25));
    } else {
      this.currentMarker.marker.setIcon(this.leafletCtrl.icon('icons/route-step.png', 25));
      delete this.currentMarker.stop;
    }
  }
  computeDistanceBetween(from: any, to: any) {
    let radFromLat = this.toRadians(from[0])
    let radFromLng = this.toRadians(from[1]);
    let radToLat = this.toRadians(to[0])
    let radToLng = this.toRadians(to[1]);
    return 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((radFromLat - radToLat) / 2), 2)
      + Math.cos(radFromLat) * Math.cos(radToLat) *
      Math.pow(Math.sin((radFromLng - radToLng) / 2), 2)
    )) * 6378137;
  }
  toRadians = (angleDegrees: number) => {
    return angleDegrees * Math.PI / 180.0;
  }
  downloadKML(): void {
    const path = this.route.get('path');
    if (!path || path.length === 0) {
      alert('No hay recorrido para descargar');
      return;
    }
    const routeName = this.route.get('name') || 'ruta';
    let coordinates = '';
    path.forEach((step: any) => {
      coordinates += `${step[1]},${step[0]},0\n`;
    });
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>${routeName}</name>
  <Folder>
    <name>Recorrido</name>
    <Placemark>
      <name>${routeName}</name>
      <LineString>
        <coordinates>
${coordinates}
        </coordinates>
      </LineString>
    </Placemark>
  </Folder>
</Document>
</kml>`;
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routeName}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
