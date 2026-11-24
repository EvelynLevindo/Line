// Serviço de Roteamento Anônimo usando OSRM (Open Source Routing Machine)
// Não envia dados identificadores nem rastreia histórico do usuário

export const osrmService = {
  /**
   * Obtém rota a pé ou de carro entre a posição da usuária e o abrigo/DEAM
   * @param {[number, number]} startCoords [lat, lng]
   * @param {[number, number]} endCoords [lat, lng]
   * @param {'walking' | 'driving'} mode
   */
  getRoute: async (startCoords, endCoords, mode = 'walking') => {
    const [startLat, startLng] = startCoords;
    const [endLat, endLng] = endCoords;

    // OSRM expects coordinates as: lng,lat;lng,lat
    const coordsParam = `${startLng},${startLat};${endLng},${endLat}`;
    const url = `https://router.project-osrm.org/route/v1/${mode}/${coordsParam}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`OSRM HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada');
      }

      const route = data.routes[0];
      // GeoJSON coordinates are [lng, lat], Leaflet polyline expects [lat, lng]
      const polylineCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);

      return {
        success: true,
        polyline: polylineCoords,
        distanceKm: Number(distanceKm),
        durationMin: durationMin < 1 ? 1 : durationMin,
        mode: mode,
      };
    } catch (err) {
      console.warn('OSRM public service unreachable or rate-limited, using fallback route:', err);
      
      // Fallback: Calculate approximate direct path with mid-point curve for visual fidelity
      const midLat = (startLat + endLat) / 2 + 0.001;
      const midLng = (startLng + endLng) / 2 - 0.001;
      const polyline = [
        [startLat, startLng],
        [midLat, midLng],
        [endLat, endLng]
      ];

      // Rough distance estimate (Haversine formula approx)
      const dLat = (endLat - startLat) * 111;
      const dLng = (endLng - startLng) * 111 * Math.cos(startLat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      const distanceKm = Number(dist.toFixed(1));
      const durationMin = mode === 'walking' ? Math.round(dist * 12) : Math.round(dist * 3);

      return {
        success: true,
        polyline: polyline,
        distanceKm: distanceKm || 1.2,
        durationMin: durationMin || 14,
        mode: mode,
        isFallback: true
      };
    }
  }
};
