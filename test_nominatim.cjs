async function testNominatim() {
  const lat = -23.5505;
  const lon = -46.6333;
  // Bounding box around ~10km (0.09 degrees approx)
  const left = lon - 0.09;
  const right = lon + 0.09;
  const top = lat + 0.09;
  const bottom = lat - 0.09;
  const viewbox = `${left},${top},${right},${bottom}`;

  const queries = ['delegacia da mulher', 'cras', 'delegacia'];
  for (const q of queries) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1`;
    console.log('Fetching Nominatim:', url);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LineAuraCicloApp/1.0 (apoio.line@example.com)' }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log(`Results for ${q}:`, data.length);
    if (data.length > 0) {
      console.log('Sample:', data[0].display_name, data[0].lat, data[0].lon);
    }
  }
}

testNominatim();
