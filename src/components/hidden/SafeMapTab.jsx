import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  fetchSupportPlacesNearUser, 
  reverseGeocode, 
  searchCityCoords, 
  calculateDistanceKm 
} from '../../services/osmPlaces';
import { osrmService } from '../../services/osrm';
import { useApp } from '../../context/AppContext';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Footprints, 
  Car, 
  Crosshair, 
  AlertCircle, 
  Search, 
  Loader2, 
  ShieldAlert, 
  Info, 
  Clock, 
  Compass, 
  RefreshCw 
} from 'lucide-react';

// Custom Marker Icons for Leaflet (Zero external image dependencies)
const createMarkerIcon = (type, label) => {
  let bgColor = '#7e001d';
  let iconSvg = '🛡️';

  if (type === 'cras') {
    bgColor = '#5f2c37';
    iconSvg = '🤝';
  } else if (type === 'police') {
    bgColor = '#ad2e42';
    iconSvg = '🚔';
  }

  return L.divIcon({
    className: 'custom-osm-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer;">
        <div style="background:${bgColor}; color:white; font-size:10px; font-weight:700; padding:2px 7px; border-radius:9999px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; font-family:'Plus Jakarta Sans',sans-serif; max-width:140px; overflow:hidden; text-overflow:ellipsis;">
          ${label}
        </div>
        <div style="width:28px; height:28px; background:${bgColor}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:13px; box-shadow:0 3px 8px rgba(0,0,0,0.35); border:2px solid white;">
          ${iconSvg}
        </div>
        <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:5px solid ${bgColor};"></div>
      </div>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 40]
  });
};

const userLiveIcon = L.divIcon({
  className: 'live-user-pin',
  html: `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
      <div style="background:#7e001d; color:white; font-size:9px; font-weight:800; padding:1px 6px; border-radius:9999px; margin-bottom:2px; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap; font-family:'Plus Jakarta Sans',sans-serif;">
        Você está aqui
      </div>
      <div style="width:22px; height:22px; border-radius:50%; background:rgba(126,0,29,0.25); display:flex; align-items:center; justify-content:center; animation:pulse 2s infinite;">
        <div style="width:12px; height:12px; border-radius:50%; background:#7e001d; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to center map smoothly
function MapCenterController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function SafeMapTab() {
  const { showToast } = useApp();

  // Purely in-memory React state (Zero localStorage / Zero Firebase storage for privacy)
  const [userCoords, setUserCoords] = useState(null); // [lat, lon] - starts null!
  const [cityName, setCityName] = useState('');
  const [manualCityInput, setManualCityInput] = useState('');
  
  // Geolocation watch status: 'requesting' | 'active' | 'denied' | 'error' | 'manual'
  const [gpsStatus, setGpsStatus] = useState('requesting');
  const [gpsErrorMessage, setGpsErrorMessage] = useState('');

  // Places search state
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'deam' | 'cras' | 'police'
  const [transportMode, setTransportMode] = useState('walking');

  // Route calculation
  const [routeInfo, setRouteInfo] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Map center trigger
  const [mapCenterTarget, setMapCenterTarget] = useState(null);
  const firstCenterDoneRef = useRef(false);

  // 1. REAL-TIME GEOLOCATION WATCH (watchPosition)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMessage('Geolocalização não é suportada por este navegador.');
      return;
    }

    setGpsStatus('requesting');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const newCoords = [lat, lon];

        setUserCoords(newCoords);
        setGpsStatus('active');
        setGpsErrorMessage('');

        // Center map on first fix
        if (!firstCenterDoneRef.current) {
          firstCenterDoneRef.current = true;
          setMapCenterTarget(newCoords);
        }
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
        if (err.code === 1) { // PERMISSION_DENIED
          setGpsStatus('denied');
          setGpsErrorMessage('Permissão de localização foi recusada. Você pode digitar sua cidade ou bairro abaixo.');
        } else {
          setGpsStatus('error');
          setGpsErrorMessage('Não foi possível obter sinal de GPS no momento. Você pode digitar sua cidade ou bairro abaixo.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. FETCH REAL PLACES UPON RECEIVING COORDS
  useEffect(() => {
    if (!userCoords) return;

    let isMounted = true;
    setIsLoadingPlaces(true);

    const [lat, lon] = userCoords;

    // Step A: Reverse geocode to find municipality
    reverseGeocode(lat, lon)
      .then(geo => {
        if (!isMounted) return;
        const detectedCity = geo.city || '';
        setCityName(detectedCity);

        // Step B & C: Fetch real places via Overpass + Nominatim within 15 km with 40 km distance lock
        return fetchSupportPlacesNearUser(lat, lon, detectedCity);
      })
      .then(foundPlaces => {
        if (!isMounted) return;
        const list = Array.isArray(foundPlaces) ? foundPlaces : [];
        setPlaces(list);
        if (list.length > 0) {
          setSelectedPlace(list[0]);
        } else {
          setSelectedPlace(null);
        }
      })
      .catch(err => {
        console.warn('Erro ao carregar locais:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlaces(false);
      });

    return () => { isMounted = false; };
  }, [userCoords]);

  // 3. OSRM ROUTE CALCULATION TO SELECTED VENUE
  useEffect(() => {
    if (!selectedPlace || !userCoords) {
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    setIsRouting(true);

    osrmService.getRoute(userCoords, selectedPlace.coords, transportMode)
      .then(res => {
        if (isMounted && res.success) {
          setRouteInfo(res);
        }
      })
      .catch(err => {
        console.warn('Erro ao traçar rota:', err);
      })
      .finally(() => {
        if (isMounted) setIsRouting(false);
      });

    return () => { isMounted = false; };
  }, [userCoords, selectedPlace, transportMode]);

  // Re-center on user position
  const handleCenterOnUser = () => {
    if (userCoords) {
      setMapCenterTarget([...userCoords]);
      showToast('Mapa centralizado na sua posição atual.');
    } else {
      showToast('Aguardando coordenadas do GPS...');
    }
  };

  // Manual city/neighborhood search fallback
  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualCityInput.trim()) return;

    setIsLoadingPlaces(true);
    showToast(`Buscando coordenadas de "${manualCityInput.trim()}"...`);

    const result = await searchCityCoords(manualCityInput.trim());
    if (result) {
      const coords = [result.lat, result.lon];
      setUserCoords(coords);
      setCityName(result.city || manualCityInput.trim());
      setGpsStatus('manual');
      setMapCenterTarget(coords);
      showToast(`Localizado: ${result.displayName.split(',')[0]}`);
    } else {
      setIsLoadingPlaces(false);
      showToast('Não foi possível localizar este município. Tente outro termo.');
    }
  };

  // Filter places
  const filteredPlaces = useMemo(() => {
    if (filterType === 'all') return places;
    return places.filter(p => p.type === filterType);
  }, [places, filterType]);

  return (
    <div className="flex flex-col w-full pb-6 space-y-3">
      {/* Confidential Shelter Warning Note */}
      <div className="bg-[#fff0f2] border border-[#ffe8ec] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#5a4040]">
        <Info className="w-4 h-4 text-[#7e001d] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Aviso de Segurança:</strong> Por proteção às vítimas, os endereços de <em>Casas-Abrigo sigilosas</em> não são publicados no mapa. O acolhimento é viabilizado com prioridade via <strong>Ligue 180</strong> ou diretamente na <strong>DEAM / CRAS</strong> mais próximo.
        </p>
      </div>

      {/* --- STATE 1: WAITING FOR GEOLOCATION (No coordinates yet) --- */}
      {!userCoords && (
        <div className="bg-white border border-[#ffe8ec] rounded-3xl p-6 shadow-xs flex flex-col items-center text-center gap-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-[#ffe8ec] flex items-center justify-center text-[#7e001d] relative">
            <Crosshair className="w-7 h-7 text-[#7e001d] animate-spin" />
            <span className="w-full h-full rounded-full border-2 border-[#fe6a7b] animate-ping absolute inset-0 opacity-40"></span>
          </div>

          <div className="space-y-1 max-w-[320px]">
            <h3 className="text-sm font-bold text-[#2e131b]">
              Obtendo sua localização atual...
            </h3>
            <p className="text-xs text-[#5a4040] leading-relaxed">
              Aguardando sinal do GPS para identificar o município e buscar os pontos de acolhimento (DEAM, CRAS e Delegacias) mais próximos de você com total sigilo.
            </p>
          </div>

          {gpsErrorMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 text-xs flex items-start gap-2 text-left w-full">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{gpsErrorMessage}</span>
            </div>
          )}

          {/* Manual Search Form Fallback */}
          <form onSubmit={handleManualSearch} className="w-full flex flex-col gap-2 pt-2 border-t border-[#ffe8ec]">
            <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider text-left">
              Ou digite sua cidade/bairro manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                placeholder="Ex: Curitiba, Campinas, Tijuca..."
                className="flex-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
              />
              <button
                type="submit"
                disabled={isLoadingPlaces || !manualCityInput.trim()}
                className="px-4 py-2 bg-[#7e001d] hover:bg-[#920023] text-white rounded-xl text-xs font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                Localizar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- STATE 2: LOCATION OBTAINED (Interactive Leaflet Map & Live Real Data) --- */}
      {userCoords && (
        <>
          {/* Top GPS Status & Action Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#5a4040] min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${gpsStatus === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-[#ad2e42]'}`}></span>
              <span className="font-semibold truncate">
                {cityName ? `Região: ${cityName}` : 'Localização em Tempo Real'}
              </span>
            </div>

            <button
              onClick={handleCenterOnUser}
              className="h-9 px-3 rounded-xl bg-[#ffe8ec] hover:bg-[#ffd9e0] text-[#7e001d] font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
              title="Centralizar mapa na minha posição"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Centralizar em mim</span>
            </button>
          </div>

          {/* Filter Categories Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: `Todos (${places.length})` },
              { id: 'deam', label: 'Delegacias Mulher (DEAM)' },
              { id: 'cras', label: 'Apoio Social (CRAS/CREAS)' },
              { id: 'police', label: 'Delegacias de Polícia' },
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

          {/* Route Stats Summary Pill */}
          {routeInfo && selectedPlace && (
            <div className="bg-[#fff0f2] border border-[#ffe8ec] rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ad2e42] animate-ping shrink-0"></span>
                <span className="font-semibold text-[#2e131b] truncate">
                  Até <strong>{selectedPlace.name}</strong>:
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

          {/* Interactive Leaflet Map Canvas */}
          <div className="relative w-full h-[360px] rounded-3xl overflow-hidden shadow-xs border border-[#ffe8ec] bg-[#fff8f7]">
            <MapContainer
              center={userCoords}
              zoom={14}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              {mapCenterTarget && (
                <MapCenterController center={mapCenterTarget} zoom={14} />
              )}

              {/* OpenStreetMap TileLayer (Zero tracking, free, open-source) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* User Live Marker */}
              <Marker position={userCoords} icon={userLiveIcon}>
                <Popup>
                  <div className="text-xs font-bold text-[#7e001d] p-1">
                    📍 Você está aqui
                  </div>
                </Popup>
              </Marker>

              {/* Found Real Support Places Markers */}
              {filteredPlaces.map(place => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <Marker
                    key={place.id}
                    position={place.coords}
                    icon={createMarkerIcon(place.type, place.name)}
                    eventHandlers={{
                      click: () => {
                        setSelectedPlace(place);
                        setMapCenterTarget(place.coords);
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 max-w-[200px]">
                        <div className="font-bold text-[#7e001d]">{place.name}</div>
                        <div className="text-[11px] text-[#5a4040] mt-1">{place.address}</div>
                        <div className="mt-1 text-[10px] font-bold text-[#ad2e42]">{place.distanceKm} km de você</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* OSRM Route Line */}
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

            {/* Loading Indicator Overlay */}
            {isLoadingPlaces && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-[#ffe8ec] flex items-center gap-2 text-xs font-bold text-[#7e001d]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Buscando pontos reais no OpenStreetMap...</span>
              </div>
            )}

            {/* Map Legend Footer */}
            <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs flex items-center justify-around text-[10px] font-bold text-[#5a4040]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7e001d]"></span> DEAM / Mulher
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#5f2c37]"></span> CRAS / CREAS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ad2e42]"></span> Delegacia
              </span>
            </div>
          </div>

          {/* --- CASE A: 0 PLACES FOUND WITHIN 15 KM (Per requirement) --- */}
          {!isLoadingPlaces && places.length === 0 && (
            <div className="bg-white border border-[#ffe8ec] rounded-3xl p-5 shadow-xs flex flex-col items-center text-center gap-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#2e131b]">
                  Nenhum ponto de apoio mapeado no OpenStreetMap num raio de 15 km
                </h3>
                <p className="text-xs text-[#5a4040] max-w-[340px] mx-auto leading-relaxed">
                  Não encontramos Delegacias Especializadas ou CRAS catalogados na base pública do mapa para esta região específica. Em situação de risco, utilize imediatamente os canais de atendimento telefônico de emergência:
                </p>
              </div>

              {/* Highlighted Emergency Calling Hotkeys */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <a
                  href="tel:180"
                  className="h-12 bg-[#7e001d] text-white rounded-2xl px-3 flex items-center justify-center gap-2 shadow-xs active:scale-98 font-bold text-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligue 180 (Apoio Mulher)</span>
                </a>
                <a
                  href="tel:190"
                  className="h-12 bg-red-700 text-white rounded-2xl px-3 flex items-center justify-center gap-2 shadow-xs active:scale-98 font-bold text-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Ligue 190 (Polícia Militar)</span>
                </a>
              </div>
            </div>
          )}

          {/* --- CASE B: REAL PLACES FOUND (Ordered from closest to farthest) --- */}
          {selectedPlace && (
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#ffe8ec] text-[#7e001d] text-[10px] font-bold uppercase tracking-wide">
                      {selectedPlace.hours}
                    </span>
                    <span className="text-xs font-semibold text-[#ad2e42]">
                      {selectedPlace.distanceKm} km de você
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[#2e131b] mt-1 leading-snug">
                    {selectedPlace.name}
                  </h2>
                  <p className="text-xs text-[#5a4040] mt-0.5 leading-relaxed">
                    {selectedPlace.address}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] flex items-center justify-center text-[#7e001d] shrink-0 font-bold text-xs">
                  {selectedPlace.distanceKm} km
                </div>
              </div>

              {/* Mode Toggle & Traçar Rota Action */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setTransportMode(transportMode === 'walking' ? 'driving' : 'walking')}
                  className="px-3.5 py-3 rounded-2xl bg-[#fff0f2] text-[#5a4040] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform shrink-0"
                  title="Alternar trajeto a pé ou de carro"
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
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.coords[0]},${selectedPlace.coords[1]}`}
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

          {/* List of Closest Support Places */}
          {filteredPlaces.length > 1 && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold text-[#5a4040] px-1 uppercase tracking-wider">
                Pontos Próximos na Região ({filteredPlaces.length})
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                {filteredPlaces.map(p => {
                  const isSelected = selectedPlace?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPlace(p);
                        setMapCenterTarget(p.coords);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#ffe8ec] border-[#7e001d]/40 shadow-xs'
                          : 'bg-white border-[#ffe8ec] hover:bg-[#fff0f2]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          p.type === 'deam' ? 'bg-[#7e001d] text-white' : p.type === 'cras' ? 'bg-[#5f2c37] text-white' : 'bg-[#ad2e42] text-white'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#2e131b] truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-[#5a4040] truncate">
                            {p.address}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-[#7e001d]">
                          {p.distanceKm} km
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Emergency Hotkeys Bar */}
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
