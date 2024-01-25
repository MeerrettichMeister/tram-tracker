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
  constructor() {
  }
  private initMap() {
    this.map = L.map('map')
    this.map.setView([49.0079, 8.4186], 13);
    L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }



  async ngAfterViewInit(): Promise<void> {
    this.initMap()
    // @ts-ignore
    this.lG = layerGroup().addTo(this.map);
    await this.getTramData()

  }

  public async addMarker(){
    // @ts-ignore
    L.marker().addTo(this.lG);
  }

  private async getTramData() {
    const baseData = await (await fetch('https://projekte.kvv-efa.de/json?CoordSystem=WGS84')).json()
    let filtered= []
    for (const baseDatum of baseData) {
      if (baseDatum['MOTDescr'] === 'Straßenbahn'){
        filtered.push(baseDatum)
      }
    }
    console.log(filtered)
    // @ts-ignore
    for (const filteredElement of filtered) {
      // @ts-ignore
      L.marker([Number(filteredElement['X']),Number(filteredElement['Y'])]).addTo(this.lG)
    }
  }

}
