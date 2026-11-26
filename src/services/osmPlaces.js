// Serviço de busca real no OpenStreetMap (Overpass API + Nominatim)
// Não utiliza coordenadas fixas nem mock de cidades pré-definidas.
// Opera estritamente com a localização fornecida pela usuária em tempo real.

const APP_USER_AGENT = 'LineAuraCicloSaudeMulherApp/1.0 (https://github.com/line-aura; contato@line.app)';

/**
 * Cálculo de distância real via fórmula de Haversine em quilômetros
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

/**
 * Geocodificação reversa via Nominatim para identificar o município da usuária
 */
export const reverseGeocode = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': APP_USER_AGENT
      }
    });
    if (!res.ok) throw new Error(`Nominatim reverse HTTP ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county || '';
    const state = addr.state || '';
    return {
      city: city.trim(),
      state: state.trim(),
      displayName: data.display_name || city
    };
  } catch (err) {
    console.warn('Falha no reverse geocode Nominatim:', err);
    return { city: '', state: '', displayName: '' };
  }
};

/**
 * Busca de coordenadas manuais por nome de cidade ou bairro
 */
export const searchCityCoords = async (queryText) => {
  const cleanQuery = queryText.trim();
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery + ', Brasil')}&format=json&limit=1&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': APP_USER_AGENT
      }
    });
    if (!res.ok) throw new Error(`Nominatim search HTTP ${res.status}`);
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const item = data[0];
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || cleanQuery;
    return {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      city: city.trim(),
      displayName: item.display_name
    };
  } catch (err) {
    console.warn('Falha ao buscar coordenadas da cidade:', err);
    return null;
  }
};

/**
 * Consulta a Overpass API em raio de 15 km
 */
const fetchOverpass = async (lat, lon) => {
  const query = `[out:json][timeout:12];
(
  node["amenity"="police"](around:15000,${lat},${lon});
  way["amenity"="police"](around:15000,${lat},${lon});
  node["amenity"="social_facility"](around:15000,${lat},${lon});
  way["amenity"="social_facility"](around:15000,${lat},${lon});
  nwr["name"~"DEAM|DDM|Delegacia|CRAS|CRAM|CREAS|Mulher",i](around:15000,${lat},${lon});
);
out center 40;`;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(ep, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': APP_USER_AGENT
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.elements)) {
          return json.elements;
        }
      }
    } catch {
      // Tenta próximo espelho do Overpass
    }
  }
  return [];
};

/**
 * Consulta paralela de reforço no Nominatim usando viewbox ao redor de lat, lon
 */
const fetchNominatimSearch = async (term, lat, lon) => {
  // Delta de ~15 km (aproximadamente 0.14 graus)
  const delta = 0.14;
  const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&viewbox=${viewbox}&bounded=1&format=json&limit=8&addressdetails=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': APP_USER_AGENT
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // Falha silenciosa no termo individual
  }
  return [];
};

/**
 * Classifica a categoria do ponto de apoio
 */
const classifyPlace = (name = '', amenity = '', tags = {}) => {
  const text = `${name} ${amenity} ${tags['social_facility'] || ''} ${tags['description'] || ''}`.toLowerCase();

  // 1. Delegacia da Mulher / DEAM / DDM
  if (
    text.includes('deam') || 
    text.includes('ddm') || 
    (text.includes('delegacia') && text.includes('mulher')) ||
    text.includes('defesa da mulher') ||
    text.includes('atendimento à mulher')
  ) {
    return {
      type: 'deam',
      typeName: 'Delegacia da Mulher (DEAM/DDM)',
      badge: 'Atendimento Especializado 24h',
      iconType: 'shield'
    };
  }

  // 2. CRAS / CREAS / CRAM / Casa da Mulher / Acolhimento
  if (
    text.includes('cras') ||
    text.includes('creas') ||
    text.includes('cram') ||
    text.includes('casa da mulher') ||
    text.includes('centro de referência') ||
    text.includes('assistência social') ||
    text.includes('acolhimento') ||
    amenity === 'social_facility'
  ) {
    return {
      type: 'cras',
      typeName: 'Apoio Social (CRAS / CREAS / CRAM)',
      badge: 'Suporte Assistencial & Psicológico',
      iconType: 'cras'
    };
  }

  // 3. Delegacia de Polícia Geral
  return {
    type: 'police',
    typeName: 'Delegacia de Polícia Civil/Militar',
    badge: 'Segurança Pública & Flagrante',
    iconType: 'police'
  };
};

/**
 * Busca Real Combinada (Overpass API + Nominatim com Trava de 40 km)
 */
export const fetchSupportPlacesNearUser = async (lat, lon, cityName = '') => {
  // 1. Executa Overpass e buscas do Nominatim em paralelo
  const nominatimTerms = cityName
    ? [
        `Delegacia da Mulher ${cityName}`,
        `DEAM ${cityName}`,
        `CRAS ${cityName}`,
        `CREAS ${cityName}`,
        `Delegacia ${cityName}`
      ]
    : [
        'Delegacia da Mulher',
        'DEAM',
        'CRAS',
        'CREAS',
        'Delegacia de Polícia'
      ];

  const [overpassElements, ...nominatimResults] = await Promise.all([
    fetchOverpass(lat, lon),
    ...nominatimTerms.map(term => fetchNominatimSearch(term, lat, lon))
  ]);

  const rawPlaces = [];

  // 2. Mapeia resultados da Overpass API
  if (Array.isArray(overpassElements)) {
    overpassElements.forEach(el => {
      const pLat = el.lat ?? el.center?.lat;
      const pLon = el.lon ?? el.center?.lon;
      if (!pLat || !pLon) return;

      const tags = el.tags || {};
      const name = tags.name || tags['operator'] || (tags.amenity === 'police' ? 'Delegacia de Polícia' : 'Centro de Assistência Social');
      const classification = classifyPlace(name, tags.amenity, tags);

      // Formata endereço legível
      const street = tags['addr:street'] || '';
      const housenumber = tags['addr:housenumber'] ? `, ${tags['addr:housenumber']}` : '';
      const suburb = tags['addr:suburb'] ? ` - ${tags['addr:suburb']}` : '';
      const address = street ? `${street}${housenumber}${suburb}` : (tags['addr:full'] || 'Endereço registrado no OpenStreetMap');

      rawPlaces.push({
        id: `osm_${el.id}`,
        name: name.trim(),
        coords: [pLat, pLon],
        address: address.trim(),
        phone: tags.phone || tags['contact:phone'] || 'Disque 180 / 190',
        hours: tags.opening_hours || (classification.type === 'deam' || classification.type === 'police' ? 'Plantão 24 Horas' : 'Seg a Sex · 08h às 17h'),
        ...classification
      });
    });
  }

  // 3. Mapeia resultados do Nominatim
  nominatimResults.flat().forEach(item => {
    if (!item || !item.lat || !item.lon) return;
    const pLat = parseFloat(item.lat);
    const pLon = parseFloat(item.lon);
    if (isNaN(pLat) || isNaN(pLon)) return;

    const name = item.name || item.display_name.split(',')[0];
    const classification = classifyPlace(name, item.type || item.class, {});

    rawPlaces.push({
      id: `nom_${item.place_id || item.osm_id || Math.random()}`,
      name: name.trim(),
      coords: [pLat, pLon],
      address: item.display_name.trim(),
      phone: 'Disque 180 / 190',
      hours: classification.type === 'deam' || classification.type === 'police' ? 'Plantão 24 Horas' : 'Seg a Sex · 08h às 17h',
      ...classification
    });
  });

  // 4. Calcula distância real de cada local e aplica a TRAVA DE 40 KM
  const validPlaces = [];
  const seenCoordinates = new Set();

  rawPlaces.forEach(p => {
    const dist = calculateDistanceKm([lat, lon], p.coords);

    // Trava de distância estrita: descarta qualquer local a mais de 40 km
    if (dist > 40) return;

    // Deduplicação por proximidade (raio de ~120m arredondado a 3 casas decimais)
    const coordKey = `${p.coords[0].toFixed(3)}_${p.coords[1].toFixed(3)}`;
    if (seenCoordinates.has(coordKey)) return;
    seenCoordinates.add(coordKey);

    validPlaces.push({
      ...p,
      distanceKm: dist
    });
  });

  // 5. Ordena do mais próximo para o mais distante
  validPlaces.sort((a, b) => a.distanceKm - b.distanceKm);

  return validPlaces;
};
