const query = `[out:json][timeout:15];
(
  nwr["amenity"="police"](around:10000, -23.5505, -46.6333);
  nwr["amenity"="social_facility"](around:10000, -23.5505, -46.6333);
  nwr["name"~"CRAS|CREAS|CRAM|DEAM|Delegacia|Mulher", i](around:10000, -23.5505, -46.6333);
);
out center 25;`;

fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: 'data=' + encodeURIComponent(query),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total returned:', data.elements.length);
  const sample = data.elements.slice(0, 5).map(el => ({
    id: el.id,
    type: el.type,
    name: el.tags?.name || 'Sem nome',
    amenity: el.tags?.amenity,
    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon,
    tags: Object.keys(el.tags || {})
  }));
  console.log('Samples:', JSON.stringify(sample, null, 2));
})
.catch(e => console.error('Error:', e));
