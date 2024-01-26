import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {layerGroup} from "leaflet";
import {MatIcon} from "@angular/material/icon";
import {filter} from "rxjs";

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
  private lG: L.LayerGroup<any> | undefined;
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
  constructor() {
    this.intervallId = 0;
  }

  private initMap() {
    this.map = L.map('map')
    this.map.setView([49.0079, 8.4186], 13);
    // L.tileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    //   {
    //     attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap',
    //   }).addTo(this.map);
    L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }


  async ngAfterViewInit(): Promise<void> {
    this.initMap()
    // @ts-ignore
    this.lG = layerGroup().addTo(this.map);
    this.addMarker()

  }

  public async addMarker() {
    this.refreshTramData()
    this.intervallId = setInterval(() => {
      this.refreshTramData()
    }, 6 * 1000)
  }

  public removeMarker() {
    this.lG?.clearLayers();
    clearInterval(this.intervallId);
  }

  private async refreshTramData() {
    this.lG?.clearLayers();
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
      this.lG?.addLayer(L.marker(latExp).bindPopup('Linie ' + filteredElement['LineNumber'] + ' nach ' + filteredElement['DirectionText']).openPopup())
    }
  }

}
