import { ExtendedJob } from './scheduleHelpers';

// Interface for location with coordinates
export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Interface for route between locations
export interface Route {
  origin: Location;
  destination: Location;
  distance: string;
  duration: string;
  polyline: string;
}

// Interface for optimized route with ordered stops
export interface OptimizedRoute {
  stops: Location[];
  routes: Route[];
  totalDistance: string;
  totalDuration: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param address The address to geocode
 * @returns Promise resolving to location coordinates
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.error('Geocoding failed:', status);
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Extract custom address from job description if available
 * @param job Job with potential address in description
 * @returns Extracted address or null
 */
export const extractAddressFromDescription = (job: ExtendedJob): { address: string, city: string, state: string, zipCode: string } | null => {
  if (!job.description) return null;
  
  // Look for address information in job description
  const addressMatch = job.description.match(/---JOB_ADDRESS---\s*(.*?)\s*(.*?),\s*(.*?)\s+(.*?)\s*---END_ADDRESS---/s);
  
  if (addressMatch) {
    return {
      address: addressMatch[1].trim(),
      city: addressMatch[2].trim(),
      state: addressMatch[3].trim(),
      zipCode: addressMatch[4].trim()
    };
  }
  
  return null;
};

/**
 * Convert jobs to locations with coordinates
 * @param jobs List of jobs with client addresses
 * @returns Promise resolving to locations with coordinates
 */
export const jobsToLocations = async (jobs: ExtendedJob[]): Promise<Location[]> => {
  const locations: Location[] = [];
  
  for (const job of jobs) {
    // First check if there's a custom address in the job description
    const customAddress = extractAddressFromDescription(job);
    
    if (customAddress) {
      // Use custom address from job description
      const fullAddress = `${customAddress.address}, ${customAddress.city}, ${customAddress.state} ${customAddress.zipCode}`;
      
      try {
        const coordinates = await geocodeAddress(fullAddress);
        
        if (coordinates) {
          locations.push({
            id: job.id,
            name: job.title,
            address: fullAddress,
            lat: coordinates.lat,
            lng: coordinates.lng
          });
        } else {
          console.warn(`Could not geocode custom address for job ${job.id}: ${fullAddress}`);
        }
      } catch (error) {
        console.error(`Failed to geocode custom address for job ${job.id}:`, error);
      }
    } 
    // Fall back to client address if available
    else if (job.client && job.startDate) {
      // Skip jobs without complete address information
      if (!job.client.address || !job.client.city || !job.client.state || !job.client.zipCode) {
        console.warn(`Job ${job.id} has incomplete address information`);
        continue;
      }
      
      // Create full address from client data
      const fullAddress = `${job.client.address}, ${job.client.city}, ${job.client.state} ${job.client.zipCode}`;
      
      try {
        const coordinates = await geocodeAddress(fullAddress);
        
        if (coordinates) {
          locations.push({
            id: job.id,
            name: job.title,
            address: fullAddress,
            lat: coordinates.lat,
            lng: coordinates.lng
          });
        } else {
          console.warn(`Could not geocode address for job ${job.id}: ${fullAddress}`);
        }
      } catch (error) {
        console.error(`Failed to geocode address for job ${job.id}:`, error);
      }
    }
  }
  
  return locations;
};

/**
 * Calculate distance and duration between two locations
 * @param origin Origin location
 * @param destination Destination location
 * @returns Promise resolving to distance and duration
 */
export const calculateRoute = async (
  origin: Location,
  destination: Location
): Promise<Route | null> => {
  try {
    const directionsService = new google.maps.DirectionsService();
    
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            const route = response.routes[0];
            const leg = route.legs[0];
            
            resolve({
              origin,
              destination,
              distance: leg.distance?.text || '0 km',
              duration: leg.duration?.text || '0 mins',
              polyline: route.overview_polyline
            });
          } else {
            console.error('Directions request failed:', status);
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};

/**
 * Find the nearest location to a given origin
 * @param origin Origin location
 * @param destinations List of potential destination locations
 * @returns Promise resolving to the nearest location
 */
export const findNearestLocation = async (
  origin: Location,
  destinations: Location[]
): Promise<Location | null> => {
  if (destinations.length === 0) return null;
  if (destinations.length === 1) return destinations[0];
  
  try {
    const distanceMatrixService = new google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [{ lat: origin.lat, lng: origin.lng }],
          destinations: destinations.map(dest => ({ lat: dest.lat, lng: dest.lng })),
          travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            const distances = response.rows[0].elements;
            
            // Find the index of the shortest distance
            let nearestIndex = 0;
            let shortestDuration = distances[0].duration.value;
            
            for (let i = 1; i < distances.length; i++) {
              if (distances[i].duration.value < shortestDuration) {
                nearestIndex = i;
                shortestDuration = distances[i].duration.value;
              }
            }
            
            resolve(destinations[nearestIndex]);
          } else {
            console.error('Distance matrix request failed:', status);
            reject(new Error(`Distance matrix request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error finding nearest location:', error);
    return null;
  }
};

/**
 * Optimize route using nearest neighbor algorithm
 * @param locations List of locations to visit
 * @param startLocation Optional starting location (e.g., company HQ)
 * @returns Promise resolving to optimized route
 */
export const optimizeRoute = async (
  locations: Location[],
  startLocation?: Location
): Promise<OptimizedRoute | null> => {
  if (locations.length === 0) return null;
  
  try {
    const orderedStops: Location[] = [];
    const routes: Route[] = [];
    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;
    
    // Start with the first location or provided start location
    let currentLocation = startLocation || locations[0];
    orderedStops.push(currentLocation);
    
    // Create a copy of locations to work with
    let remainingLocations = startLocation 
      ? [...locations] 
      : locations.slice(1);
    
    // Find the nearest location and add it to the route until all locations are visited
    while (remainingLocations.length > 0) {
      const nearestLocation = await findNearestLocation(currentLocation, remainingLocations);
      
      if (nearestLocation) {
        const route = await calculateRoute(currentLocation, nearestLocation);
        
        if (route) {
          routes.push(route);
          orderedStops.push(nearestLocation);
          
          // Add to total distance and duration
          const distanceMatch = route.distance.match(/\d+(\.\d+)?/);
          const durationMatch = route.duration.match(/\d+/);
          
          if (distanceMatch) {
            totalDistanceMeters += parseFloat(distanceMatch[0]) * 1000; // Convert km to meters
          }
          
          if (durationMatch) {
            totalDurationSeconds += parseInt(durationMatch[0]) * 60; // Convert minutes to seconds
          }
          
          // Remove the visited location from remaining locations
          remainingLocations = remainingLocations.filter(loc => loc.id !== nearestLocation.id);
          
          // Update current location
          currentLocation = nearestLocation;
        } else {
          console.error('Failed to calculate route, skipping location');
          remainingLocations = remainingLocations.filter(loc => loc.id !== nearestLocation.id);
        }
      } else {
        console.error('Failed to find nearest location, exiting optimization');
        break;
      }
    }
    
    // Format total distance and duration
    const totalDistance = totalDistanceMeters >= 1000
      ? `${(totalDistanceMeters / 1000).toFixed(1)} km`
      : `${totalDistanceMeters.toFixed(0)} m`;
    
    let totalDuration = '';
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    
    if (hours > 0) {
      totalDuration = `${hours} hr ${minutes} min`;
    } else {
      totalDuration = `${minutes} min`;
    }
    
    return {
      stops: orderedStops,
      routes,
      totalDistance,
      totalDuration
    };
  } catch (error) {
    console.error('Error optimizing route:', error);
    return null;
  }
}; 