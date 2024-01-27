import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {layerGroup} from "leaflet";
import {MatIcon} from "@angular/material/icon";
import {filter} from "rxjs";
import {icon, Marker} from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  imports: [
    MatIcon
  ],
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map: L.Map | undefined;
  private lg_City = L.layerGroup();
  private lg_Region = L.layerGroup()
  private intervallId: number
  private lineFilterArray = ['1', '2', '3', '4', '5', 'S2',
    'S1', 'S11', 'S12',
    'S4', 'S41', 'S42',
    'S5', 'S51', 'S52',
    'S31', 'S32',
    'S7', 'S71',
    'S8', 'S81',
    'S6',
    'E', '17', '18']
  private cityFilter = ['1', '2', '3', '4', '5', 'S2', 'E', '17', '18', 'S1', 'S11', 'S12']
  private regionFilter = ['S4', 'S41', 'S42', 'S5', 'S51', 'S52', 'S31', 'S32', 'S7', 'S71', 'S8', 'S81', 'S6']
  private osm = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  private orm = L.tileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    {
      attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap',
    })

  constructor() {
    this.intervallId = 0;
  }

  private initMap() {
    this.map = L.map('map',{layers:[this.osm]})
    this.map.setView([49.0079, 8.4186], 13);
    const baseMaps = {'OpenStreetMap': this.osm, 'OpenRailwayMap': this.orm}
    const lineLayers = {'Stadt' : this.lg_City, 'Region':this.lg_Region}

    L.control.layers(baseMaps,lineLayers).addTo(this.map)
  }


  ngAfterViewInit(): void {
    this.initMap()
    this.addMarker()

  }

  public async addMarker() {
    this.refreshTramData()
    this.intervallId = setInterval(() => {
      this.refreshTramData()
    }, 6 * 1000)
  }

  public removeMarker() {
    this.lg_City?.clearLayers();
    this.lg_Region?.clearLayers();
    clearInterval(this.intervallId);
  }

  private async refreshTramData() {
    this.lg_City?.clearLayers();
    this.lg_Region?.clearLayers();
    const baseData = await (await fetch('https://projekte.kvv-efa.de/json?CoordSystem=WGS84')).json()
    let filtered = []
    for (const baseDatum of baseData) {
      if (this.lineFilterArray.indexOf(baseDatum['LineNumber']) >= 0) {
        filtered.push(baseDatum)
      }
    }
    // @ts-ignore
    for (const filteredElement of filtered) {
      let valX = Number(filteredElement['X']);
      let valY = Number(filteredElement['Y']);
      let latExp = L.latLng(valY, valX);
      if (this.cityFilter.indexOf(filteredElement['LineNumber']) >= 0) {
        this.lg_City?.addLayer(L.marker(latExp).bindPopup('Linie ' + filteredElement['LineNumber'] + ' nach ' + filteredElement['DirectionText']).openPopup())
      } else {
        this.lg_Region?.addLayer(L.marker(latExp).bindPopup('Linie ' + filteredElement['LineNumber'] + ' nach ' + filteredElement['DirectionText']).openPopup())
      }
    }
  }

}
