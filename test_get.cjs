async function testGet() {
  const q = `[out:json][timeout:15];(node["amenity"="police"](around:5000,-23.5505,-46.6333);node["amenity"="social_facility"](around:5000,-23.5505,-46.6333););out center 15;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Found elements:', data.elements?.length);
    if (data.elements?.length > 0) {
      console.log('Sample item:', data.elements[0].tags?.name, data.elements[0].lat, data.elements[0].lon);
    }
  } catch (err) {
    console.error('Err:', err);
  }
}
testGet();
