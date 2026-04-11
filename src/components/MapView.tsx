import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';

export default function MapView({ events, onEventClick }: any) {
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  // Cast the type to 'any' to bypass strict GeoJSON validation on Vercel
  const geoJsonData: any = {
    type: 'FeatureCollection',
    features: events.map((e: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [Number(e.lng), Number(e.lat)] },
      properties: { ...e }
    }))
  };

  return (
    <div className="absolute inset-0 bg-black"> 
      <Map
        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        renderWorldCopies={false}
        interactiveLayerIds={['osint-dots']}
        onMouseMove={e => {
          const feature = e.features?.[0];
          if (feature) {
            setHoverInfo({ x: e.point.x, y: e.point.y, headline: feature.properties.headline });
          } else { setHoverInfo(null); }
        }}
        onMouseLeave={() => setHoverInfo(null)}
        onClick={e => {
          const feature = e.features?.[0];
          if (feature) onEventClick(feature.properties);
        }}
      >
        <Source id="osint-data" type="geojson" data={geoJsonData}>
          <Layer
            id="osint-pulse"
            type="circle"
            filter={['==', ['get', 'severity'], 'High']}
            paint={{
              'circle-radius': 18,
              'circle-color': '#ff0000',
              'circle-opacity': 0.15,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ff0000',
              'circle-blur': 1.5
            }}
          />
          <Layer
            id="osint-dots"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': [
                'match', ['get', 'severity'],
                'High', '#ff0000',
                'Medium', '#ff7f00',
                '#ffffff'
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#000'
            }}
          />
        </Source>

        {hoverInfo && (
          <div 
            className="absolute pointer-events-none bg-black/95 border border-red-900/50 p-2 text-[10px] text-white font-mono z-[100] shadow-xl"
            style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 12 }}
          >
            {hoverInfo.headline}
          </div>
        )}
      </Map>
    </div>
  );
}
