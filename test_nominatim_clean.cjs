async function test() {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&q=delegacia+sao+paulo&limit=3';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LineAuraCicloSaudeMulher/1.0 (contato@line.app)'
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Results:', data.length);
    if (data.length > 0) {
      console.log('Sample:', data[0].display_name, data[0].lat, data[0].lon);
    }
  } catch (err) {
    console.error('Err:', err);
  }
}
test();
