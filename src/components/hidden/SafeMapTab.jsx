import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CITIES, MOCK_SHELTERS } from '../../data/mockShelters';
import { osrmService } from '../../services/osrm';
import { useApp } from '../../context/AppContext';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Compass, 
  Footprints, 
  Car, 
  Crosshair, 
  AlertCircle 
} from 'lucide-react';

// Custom Marker Icons using SVG DivIcons
const createCustomMarker = (type, label) => {
  let bgColor = '#7e001d';
  let iconSvg = '🛡️';

  if (type === 'shelter') {
    bgColor = '#ad2e42';
    iconSvg = '🏠';
  } else if (type === 'cras') {
    bgColor = '#5f2c37';
    iconSvg = '🤝';
  }

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer;">
        <div style="background:${bgColor}; color:white; font-size:10px; font-weight:700; padding:2px 8px; border-radius:9999px; box-shadow:0 2px 6px rgba(0,0,0,0.25); white-space:nowrap; margin-bottom:2px; font-family:'Plus Jakarta Sans',sans-serif;">
          ${label}
        </div>
        <div style="width:30px; height:30px; background:${bgColor}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.3); border:2px solid white;">
          ${iconSvg}
        </div>
        <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid ${bgColor};"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-pin',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
      <div style="width:24px; height:24px; border-radius:50%; background:rgba(126,0,29,0.2); display:flex; align-items:center; justify-content:center; animation:pulse 2s infinite;">
        <div style="width:14px; height:14px; border-radius:50%; background:#7e001d; border:2.5px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to smoothly pan the Leaflet map when center changes
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Distance helper (Haversine formula in km)
const calculateDistanceKm = (coord1, coord2) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
};

export default function SafeMapTab() {
  const { showToast } = useApp();
  
  const [selectedCityId, setSelectedCityId] = useState('sp');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'deam' | 'shelter' | 'cras'
  const [transportMode, setTransportMode] = useState('walking');

  const currentCity = useMemo(() => CITIES.find(c => c.id === selectedCityId) || CITIES[0], [selectedCityId]);

  // Initial userCoords (centered near city center)
  const [userCoords, setUserCoords] = useState([
    currentCity.center[0] - 0.007,
    currentCity.center[1] + 0.005
  ]);
  const [gpsActive, setGpsActive] = useState(false);

  // AUTOMATIC GEOLOCATION ON TAB OPEN (per requirement)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);
          setGpsActive(true);
          showToast('Localização atual obtida. Locais mais próximos ordenados.');

          // Match closest city if near any
          let closestCity = CITIES[0];
          let minDist = 999999;
          CITIES.forEach(c => {
            const d = calculateDistanceKm([lat, lng], c.center);
            if (d < minDist) {
              minDist = d;
              closestCity = c;
            }
          });
          if (minDist < 120) {
            setSelectedCityId(closestCity.id);
          }
        },
        (err) => {
          console.warn('Permissão de localização não concedida ou timeout:', err);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [showToast]);

  // Sort shelters by proximity to current userCoords
  const sortedShelters = useMemo(() => {
    return MOCK_SHELTERS
      .map(s => ({
        ...s,
        distanceFromUser: calculateDistanceKm(userCoords, s.coords)
      }))
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser);
  }, [userCoords]);

  const [selectedShelter, setSelectedShelter] = useState(sortedShelters[0]);

  // Route state
  const [routeInfo, setRouteInfo] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Update selected shelter on list update if needed
  useEffect(() => {
    if (sortedShelters.length > 0 && (!selectedShelter || !sortedShelters.find(s => s.id === selectedShelter.id))) {
      setSelectedShelter(sortedShelters[0]);
    }
  }, [sortedShelters, selectedShelter]);

  // Calculate route using OSRM
  useEffect(() => {
    if (!selectedShelter || !userCoords) return;

    let isMounted = true;
    setIsRouting(true);

    osrmService.getRoute(userCoords, selectedShelter.coords, transportMode)
      .then(res => {
        if (isMounted && res.success) {
          setRouteInfo(res);
        }
      })
      .catch(err => {
        console.warn('Falha no traçado da rota:', err);
      })
      .finally(() => {
        if (isMounted) setIsRouting(false);
      });

    return () => { isMounted = false; };
  }, [userCoords, selectedShelter, transportMode]);

  // Re-request GPS on click
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada pelo navegador.');
      return;
    }
    showToast('Atualizando sua localização GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords([lat, lng]);
        setGpsActive(true);
        showToast('Localização centralizada com sucesso.');
      },
      () => {
        showToast('Não foi possível obter sua localização exata.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const filteredShelters = useMemo(() => {
    if (filterType === 'all') return sortedShelters;
    return sortedShelters.filter(s => s.type === filterType);
  }, [sortedShelters, filterType]);

  return (
    <div className="flex flex-col w-full pb-6 space-y-3">
      {/* GPS Status & Recenter bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#5a4040]">
          <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`}></span>
          <span className="font-semibold truncate">
            {gpsActive ? 'GPS Ativo • Ordenado pelo mais próximo' : 'Localização aproximada'}
          </span>
        </div>

        <button
          onClick={handleRequestGPS}
          className="h-9 px-3 rounded-xl bg-[#ffe8ec] hover:bg-[#ffd9e0] text-[#7e001d] font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
          title="Centralizar no meu GPS"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Meu GPS</span>
        </button>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'Todos os Pontos' },
          { id: 'deam', label: 'Delegacias (DEAM)' },
          { id: 'shelter', label: 'Casas-Abrigo' },
          { id: 'cras', label: 'CRAS / CRAM' },
        ].map(cat => {
          const active = filterType === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                active
                  ? 'bg-[#7e001d] text-white shadow-2xs'
                  : 'bg-white text-[#5a4040] border border-[#ffe8ec] hover:bg-[#fff0f2]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Route Status Summary Pill */}
      {routeInfo && (
        <div className="bg-[#fff0f2] border border-[#ffe8ec] rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ad2e42] animate-ping shrink-0"></span>
            <span className="font-semibold text-[#2e131b] truncate">
              Até <strong>{selectedShelter?.name.split('-')[0]}</strong>:
            </span>
          </div>

          <div className="flex items-center gap-2 font-bold text-[#7e001d] shrink-0">
            <span className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              {routeInfo.durationMin} min
            </span>
            <span className="text-[#8e7070]">•</span>
            <span>{routeInfo.distanceKm} km</span>
          </div>
        </div>
      )}

      {/* Map Container (OpenStreetMap via Leaflet) */}
      <div className="relative w-full h-[360px] rounded-3xl overflow-hidden shadow-xs border border-[#ffe8ec] bg-[#fff8f7]">
        <MapContainer
          center={userCoords}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <MapRecenter center={selectedShelter?.coords || userCoords} zoom={14} />

          {/* OpenStreetMap TileLayer (Zero tracking, free, open-source) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* User Location Marker */}
          {userCoords && (
            <Marker position={userCoords} icon={userLocationIcon}>
              <Popup>
                <div className="text-xs font-bold text-[#7e001d] p-1">
                  Sua Posição Atual (GPS)
                </div>
              </Popup>
            </Marker>
          )}

          {/* Shelter & DEAM Markers */}
          {filteredShelters.map(shelter => {
            return (
              <Marker
                key={shelter.id}
                position={shelter.coords}
                icon={createCustomMarker(shelter.type, shelter.name.split(' ')[0])}
                eventHandlers={{
                  click: () => {
                    setSelectedShelter(shelter);
                  }
                }}
              >
                <Popup>
                  <div className="text-xs p-1 max-w-[200px]">
                    <div className="font-bold text-[#7e001d]">{shelter.name}</div>
                    <div className="text-[11px] text-[#5a4040] mt-1">{shelter.address}</div>
                    <div className="mt-2 text-[10px] font-bold text-[#ad2e42]">{shelter.hours}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* OSRM Route Line drawn on top */}
          {routeInfo?.polyline && (
            <>
              <Polyline
                positions={routeInfo.polyline}
                color="#ffd9e0"
                weight={8}
                opacity={0.8}
              />
              <Polyline
                positions={routeInfo.polyline}
                color="#ad2e42"
                weight={4}
                dashArray="6, 8"
                opacity={0.95}
              />
            </>
          )}
        </MapContainer>

        {/* Floating map legend footer */}
        <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs flex items-center justify-around text-[10px] font-bold text-[#5a4040]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#7e001d]"></span> DEAM 24h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ad2e42]"></span> Casa-Abrigo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#5f2c37]"></span> CRAS / Apoio
          </span>
        </div>
      </div>

      {/* Selected Venue Details Card */}
      {selectedShelter && (
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#ffe8ec] text-[#7e001d] text-[10px] font-bold uppercase tracking-wide">
                  {selectedShelter.hours}
                </span>
                <span className="text-xs font-semibold text-[#ad2e42]">
                  {selectedShelter.distanceFromUser} km de você
                </span>
              </div>
              <h2 className="text-sm font-bold text-[#2e131b] mt-1 leading-snug">
                {selectedShelter.name}
              </h2>
              <p className="text-xs text-[#5a4040] mt-0.5">
                {selectedShelter.address}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] flex items-center justify-center text-[#7e001d] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Safe Route Tip */}
          <div className="bg-[#fff0f2] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#5a4040]">
            <Compass className="w-4 h-4 text-[#ad2e42] shrink-0 mt-0.5" />
            <p>
              <strong>Trajeto monitorado recomendado:</strong> {selectedShelter.safeRouteTip}
            </p>
          </div>

          {/* Shelter bed status */}
          <div className="flex items-center justify-between text-xs bg-[#ffe8ec]/60 px-3 py-2 rounded-xl">
            <span className="text-[#5a4040] font-medium">Status de Acolhimento:</span>
            <span className="font-bold text-[#7e001d]">{selectedShelter.shelterStatus}</span>
          </div>

          {/* Travel Mode Toggle & Action */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setTransportMode(transportMode === 'walking' ? 'driving' : 'walking')}
              className="px-3.5 py-3 rounded-2xl bg-[#fff0f2] text-[#5a4040] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform shrink-0"
              title="Alternar entre trajeto a pé e de carro"
            >
              {transportMode === 'walking' ? (
                <>
                  <Footprints className="w-4 h-4 text-[#7e001d]" />
                  <span>A pé</span>
                </>
              ) : (
                <>
                  <Car className="w-4 h-4 text-[#7e001d]" />
                  <span>Carro</span>
                </>
              )}
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShelter.coords[0]},${selectedShelter.coords[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl bg-[#ad2e42] hover:bg-[#7e001d] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-xs text-center"
            >
              <Navigation className="w-4 h-4" />
              <span>Navegar no Mapa Externo</span>
            </a>
          </div>
        </div>
      )}

      {/* Emergency Dialers Bar */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href="tel:180"
          className="h-12 bg-[#7e001d] text-white rounded-2xl px-3 flex items-center justify-center gap-2 shadow-xs active:scale-98 font-bold text-xs"
        >
          <Phone className="w-4 h-4" />
          <span>Ligue 180 (Mulher)</span>
        </a>

        <a
          href="tel:190"
          className="h-12 bg-red-700 text-white rounded-2xl px-3 flex items-center justify-center gap-2 shadow-xs active:scale-98 font-bold text-xs"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Ligue 190 (Polícia)</span>
        </a>
      </div>
    </div>
  );
}
