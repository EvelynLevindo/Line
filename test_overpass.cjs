const query = `[out:json][timeout:15];
(
  node["amenity"="police"](around:5000, -23.5505, -46.6333);
  node["amenity"="social_facility"](around:5000, -23.5505, -46.6333);
);
out center 15;`;

async function test(endpoint) {
  console.log(`Testing ${endpoint}...`);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LineAuraCicloApp/1.0'
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}, Preview: ${text.slice(0, 150)}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function run() {
  await test('https://overpass-api.de/api/interpreter');
  await test('https://overpass.kumi.systems/api/interpreter');
  await test('https://maps.mail.ru/osm/tools/overpass/api/interpreter');
}

run();
