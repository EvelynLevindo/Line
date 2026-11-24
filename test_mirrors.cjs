const endpoints = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/cgi/interpreter'
];

const query = `[out:json][timeout:10];node["amenity"="police"](around:2000,-23.55,-46.63);out 5;`;

async function run() {
  for (const ep of endpoints) {
    try {
      console.log('Testing', ep);
      const res = await fetch(ep, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log(ep, 'status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(ep, 'SUCCESS! Elements:', data.elements?.length);
        return;
      }
    } catch (e) {
      console.log(ep, 'ERR:', e.message);
    }
  }
}

run();
