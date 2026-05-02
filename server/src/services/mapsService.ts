/**
 * Maps Service - Google Maps API Integration
 * Built with Google Antigravity & Vertex AI
 *
 * Queries Google Maps Places API to find nearby polling stations
 * based on user-provided location (address or zip code).
 */
import { PollingStationEntry } from '../../shared/types';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Geocode a location string to latitude/longitude coordinates.
 */
async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    location
  )}&key=${MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Unable to geocode location: ${location}`);
  }

  return data.results[0].geometry.location;
}

/**
 * Find polling stations near a given location using Google Maps Places API.
 */
export async function findPollingStations(
  location: string
): Promise<PollingStationEntry[]> {
  try {
    if (!MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    const coords = await geocodeLocation(location);

    const url = `${PLACES_API_URL}/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=5000&keyword=polling+station+voting&key=${MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return [];
    }

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    return data.results.map(
      (place: {
        place_id: string;
        name: string;
        vicinity: string;
        geometry: { location: { lat: number; lng: number } };
      }) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || 'Address not available',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      })
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Maps API error';
    console.error(`[MapsService] Failed to find polling stations: ${message}`);

    if (message.includes('API key')) {
      throw new Error(
        'Google Maps service is temporarily unavailable. Please try again later.'
      );
    }

    throw new Error(
      `Unable to find polling stations for "${location}". ${message}`
    );
  }
}
