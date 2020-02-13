import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Map, AuthenticationType, EventManager, source, layer } from 'azure-maps-control';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private map;
  @ViewChild('map', { static: true })
  public mapContainer: ElementRef;

  public subscriptionKey = '';

  private datasource;

  //GeoJSON feed of significant earthquakes from the past 30 days. Sourced from the USGS.
  earthquakeFeed = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    this.map = new Map(this.mapContainer.nativeElement, {
      center: [-180, 0],
      view: 'Auto',
      autoResize: true,
      showLogo: false,

      // Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
      authOptions: {
        authType: AuthenticationType.subscriptionKey,
        subscriptionKey: this.subscriptionKey
      }
    });

    // Wait until the map resources are ready.
    this.map.events.add('ready', () => {

      // Create a data source and add it to the map.
      this.datasource = new source.DataSource();
      // this.datasource = new atlas.source.DataSource();
      this.map.sources.add(this.datasource);

      // Load the earthquake data.
      this.datasource.importDataFromUrl(this.earthquakeFeed);

      this.map.layers.add([
        // Create a layer that defines how to render the shapes in the data source and add it to the map.
        // new atlas.layer.BubbleLayer(this.datasource, 'earthquake-circles', {
        new layer.BubbleLayer(this.datasource, 'earthquake-circles', {
          // Bubbles are made semi-transparent.
          opacity: 0.75,

          // Color of each bubble based on the value of "mag" property using a color gradient of green, yellow, orange, and red.
          color: [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0, 'green',
            5, 'yellow',
            6, 'orange',
            7, 'red'
          ],

          /*
           * Radius for each data point scaled based on the value of "mag" property.
           * When "mag" = 0, radius will be 2 pixels.
           * When "mag" = 8, radius will be 40 pixels.
           * All other "mag" values will be a linear interpolation between these values.
           */
          radius: [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0, 2,
            8, 20
          ]
        }),

        // Create a symbol layer using the same data source to render the magnitude as text above each bubble and add it to the map.
        new layer.SymbolLayer(this.datasource, 'earthquake-labels', {
          iconOptions: {
            // Hide the icon image.
            image: 'none'
          },
          textOptions: {
            // An expression is used to concerte the "mag" property value into a string and appends the letter "m" to the end of it.
            textField: ['concat', ['to-string', ['get', 'mag']], 'm'],
            textSize: 12
          }
        })
      ]);
    });

  }

}
