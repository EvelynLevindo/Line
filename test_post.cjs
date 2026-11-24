async function testPost() {
  const q = `[out:json][timeout:15];(node["amenity"="police"](around:5000,-23.5505,-46.6333);node["amenity"="social_facility"](around:5000,-23.5505,-46.6333););out center 15;`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(q),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Text start:', text.slice(0, 150));
    const data = JSON.parse(text);
    console.log('Found elements:', data.elements?.length);
    if (data.elements?.length > 0) {
      console.log('Sample item:', data.elements[0].tags?.name, data.elements[0].lat, data.elements[0].lon);
    }
  } catch (err) {
    console.error('Err:', err);
  }
}
testPost();
