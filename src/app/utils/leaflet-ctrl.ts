import { Injectable } from '@angular/core';
import L from 'leaflet';

declare module 'leaflet' {
  interface Marker {
    _applyRotation(): void;
    setRotationAngle(angle: number): L.Marker;
    setRotationOrigin(origin: any): L.Marker;
  }
  interface MarkerOptions {
    rotationAngle?: number;
    rotationOrigin?: string;
  }
}

@Injectable({
  providedIn: 'root',
})

export class LeafletCtrl {
  public map!: L.Map;
  public events = {
    click: 'click',
    dragend: 'dragend',
    dblclick: 'dblclick',
    rclick: 'contextmenu'
  };
  public isInitialized = false;
  constructor() {
    this.setMarkerRotation();
  }
  public initialize(mapName: any, location = [4.323485, -73.090613], zoom = 5) {
    if (this.map) {
      this.map.remove();
    }
    this.map = new L.Map(mapName).setView([location[0], location[1]], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);
    this.isInitialized = true;

  }
  public addMapEventListener(event: string, callback: any) {
    this.map.on(event, callback);
  }
  public addMarker(location: any, draggable?: boolean, title?: string, iconUrl?: string, size?: any) {
    let options: any = {};
    if (draggable) {
      options.draggable = true;
    }
    if (title) {
      options.title = title;
    }
    if (iconUrl) {
      const i = this.icon(iconUrl, size);
      options.icon = i;
    } else {
      const i = this.icon('icons/marker.png', 30);
      options.icon = i;
    }
    let m = L.marker(location, options).addTo(this.map);
    if (title) {
      m.bindPopup(title);
    }
    return m;
  }
  public icon(iconUrl: string, size?: number) {
    const i = L.icon({
      iconUrl: iconUrl,
      iconSize: size ? [size, size] : [23, 32],
      iconAnchor: size ? [size / 2, size / 2] : [11, 32]
    });
    return i;
  }
  public addCircle(location: any, color: string, radius: number) {
    const circle = L.circle(location, {
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: radius
    }).addTo(this.map);
    return circle;
  }
  public addPolyline(path: any, color: string) {
    let options: any = { color: color, weight: 8, opacity: 0.6 };

    let pl = L.polyline(path, options).addTo(this.map);
    return pl;
  }
  public addArrowsToPolyline(path: any, color: string) {
    const arrows = [];
    for (let p = 0; p + 1 < path.length; p++) {
      const diffLat = path[p + 1][0] - path[p][0];
      const diffLng = path[p + 1][1] - path[p][1];
      const center: L.LatLngExpression = [path[p][0] + diffLat / 2, path[p][1] + diffLng / 2];
      const angle = 360 - (Math.atan2(diffLat, diffLng) * 57.295779513082);
      const arrow = L.marker(center, {
        icon: L.divIcon({
          className: "arrowIcon",
          iconSize: new L.Point(30, 30),
          iconAnchor: new L.Point(15, 15),
          html: `<div style = 'font-size: 20px; -webkit-transform: rotate(${angle}deg); color:${color};font-weight: 600;'>&#10152;</div>`
        })
      }).addTo(this.map);
      arrows.push(arrow);
    }
    return arrows;
  }
  public getAngle(from: any, to: any) {
    return Math.atan2(to.lng - from.lng, to.lat - from.lat) * 180 / Math.PI;
  }
  public centerMap(objects: any) {
    let markers = objects.map((o: any) => {
      return o.marker;
    });
    let group = L.featureGroup(markers);
    this.map.fitBounds(group.getBounds());
  }
  setMarkerRotation() {
    // save these original methods before they are overwritten
    var proto_initIcon = (L.Marker.prototype as any)._initIcon;
    var proto_setPos = (L.Marker.prototype as any)._setPos;

    var oldIE = (L.DomUtil.TRANSFORM === 'msTransform');

    L.Marker.addInitHook(function (this: L.Marker) {
      var iconOptions = this.options.icon && this.options.icon.options;
      var iconAnchor: any = iconOptions && this.options.icon && this.options.icon.options.iconAnchor;
      var rotationOriginString = '';
      if (iconAnchor) {
        rotationOriginString = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
      }
      this.options.rotationOrigin = this.options.rotationOrigin || rotationOriginString || 'center bottom';
      this.options.rotationAngle = this.options.rotationAngle || 0;

      // Ensure marker keeps rotated during dragging
      this.on('drag', function (e) { e.target._applyRotation(); });
    });

    L.Marker.include({
      _initIcon: function (this: L.Marker) {
        proto_initIcon.call(this);
      },

      _setPos: function (this: L.Marker, pos: any) {
        proto_setPos.call(this, pos);
        this._applyRotation();
      },

      _applyRotation: function (this: L.Marker) {
        if (this.options.rotationAngle) {
          (this as any)._icon.style[L.DomUtil.TRANSFORM + 'Origin'] = this.options.rotationOrigin;

          if (oldIE) {
            // for IE 9, use the 2D rotation
            (this as any)._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
          } else {
            // for modern browsers, prefer the 3D accelerated version
            (this as any)._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
          }
        }
      },

      setRotationAngle: function (this: L.Marker, angle: number) {
        this.options.rotationAngle = angle;
        //this.update();
        return this;
      },

      setRotationOrigin: function (this: L.Marker, origin: any) {
        this.options.rotationOrigin = origin;
        //this.update();
        return this;
      }
    });
  }
}
