'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Chip,
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { Loader } from '@googlemaps/js-api-loader';
import { ExtendedJob } from '../../utils/scheduleHelpers';
import { 
  Location, 
  Route, 
  OptimizedRoute, 
  jobsToLocations, 
  optimizeRoute,
  extractAddressFromDescription 
} from '../../utils/mapHelpers';

// Google Maps API key from environment variable
const GOOGLE_MAPS_API_KEY = 'AIzaSyBsOCfsqBpgSXoIGtrJkDIfX96L2k4g8YM';

interface MapViewProps {
  jobs: ExtendedJob[];
  date: Date;
  employeeId?: string;
}

const MapView: React.FC<MapViewProps> = ({ jobs, date, employeeId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry', 'drawing']
      });

      const google = await loader.load();
      setMapLoaded(true);

      const mapOptions: google.maps.MapOptions = {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;

      // Create a directions renderer
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We'll create our own markers
        polylineOptions: {
          strokeColor: '#2a724a', // Match the green branding
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      directionsRendererRef.current = directionsRenderer;

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load Google Maps. Please try refreshing the page.');
      setLoading(false);
    }
  }, []);

  // Load job locations
  useEffect(() => {
    const loadLocations = async () => {
      if (!jobs.length) {
        setLocations([]);
        setOptimizedRoute(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobLocations = await jobsToLocations(jobs);
        setLocations(jobLocations);
        
        // Optimize route if we have locations
        if (jobLocations.length > 0) {
          const route = await optimizeRoute(jobLocations);
          setOptimizedRoute(route);
        }
      } catch (err) {
        console.error('Error loading locations:', err);
        setError('Failed to load job locations. Please check your addresses.');
      } finally {
        setLoading(false);
      }
    };

    if (mapLoaded) {
      loadLocations();
    }
  }, [jobs, mapLoaded]);

  // Display markers and routes on the map
  useEffect(() => {
    if (!googleMapRef.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();

    // Create markers for each location
    locations.forEach((location, index) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMapRef.current,
        title: location.name,
        label: {
          text: `${index + 1}`,
          color: 'white'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#2a724a',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: 10
        }
      });

      // Add click listener to show location details
      marker.addListener('click', () => {
        setSelectedLocation(location);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition()!);
    });

    // Fit map to bounds
    googleMapRef.current.fitBounds(bounds);

    // Display optimized route if available
    if (optimizedRoute && directionsRendererRef.current) {
      const directionsService = new google.maps.DirectionsService();
      
      // If we have a valid route with multiple stops
      if (optimizedRoute.stops.length > 1) {
        const origin = optimizedRoute.stops[0];
        const destination = optimizedRoute.stops[optimizedRoute.stops.length - 1];
        
        // Create waypoints from stops (excluding first and last)
        const waypoints = optimizedRoute.stops.slice(1, -1).map(stop => ({
          location: new google.maps.LatLng(stop.lat, stop.lng),
          stopover: true
        }));

        directionsService.route({
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints,
          optimizeWaypoints: false, // We've already optimized
          travelMode: google.maps.TravelMode.DRIVING
        }, (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            directionsRendererRef.current!.setDirections(response);
          }
        });
      }
    }
  }, [locations, optimizedRoute]);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Handle the "Refresh Route" action
  const handleRefreshRoute = async () => {
    if (!locations.length) return;

    setLoading(true);
    try {
      const route = await optimizeRoute(locations);
      setOptimizedRoute(route);
    } catch (err) {
      console.error('Error refreshing route:', err);
      setError('Failed to refresh route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get job by ID
  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Map Container */}
      <Box sx={{ 
        flex: 2, 
        height: { xs: '400px', md: '100%' }, 
        position: 'relative',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        {/* Map Loading Overlay */}
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10
          }}>
            <CircularProgress />
          </Box>
        )}

        {/* Map Error */}
        {error && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            zIndex: 10
          }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Google Map Element */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Map Controls */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Tooltip title="Refresh Route">
            <span>
              <IconButton 
                sx={{ bgcolor: 'background.paper' }}
                onClick={handleRefreshRoute}
                disabled={loading || locations.length < 2}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Sidebar with Route Information */}
      <Box sx={{ 
        flex: 1, 
        height: { xs: 'auto', md: '100%' },
        overflow: 'auto',
        p: 2,
        bgcolor: 'background.paper',
        borderLeft: { xs: 'none', md: '1px solid rgba(0, 0, 0, 0.12)' }
      }}>
        <Typography variant="h6" gutterBottom>
          Route for {formatDate(date)}
          {employeeId && (
            <Typography variant="body2" color="text.secondary">
              {jobs.length > 0 && jobs[0].assignedTo?.name}
            </Typography>
          )}
        </Typography>

        {/* Route Summary */}
        {optimizedRoute && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Route Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Distance:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {optimizedRoute.totalDistance}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Drive Time:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {optimizedRoute.totalDuration}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Number of Stops:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {optimizedRoute.stops.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Stop List */}
        {optimizedRoute && (
          <List sx={{ 
            width: '100%', 
            bgcolor: 'background.paper',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 1,
          }}>
            {optimizedRoute.stops.map((stop, index) => {
              const job = getJobById(stop.id);
              
              return (
                <Box key={stop.id}>
                  {index > 0 && (
                    <Box sx={{ pl: 2, pr: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        py: 1,
                        color: 'text.secondary',
                        borderLeft: '2px dashed #2a724a',
                        ml: 1.2,
                        pl: 2
                      }}>
                        <DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {optimizedRoute.routes[index - 1]?.duration} ({optimizedRoute.routes[index - 1]?.distance})
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <ListItem
                    button
                    alignItems="flex-start"
                    onClick={() => {
                      if (stop) {
                        setSelectedLocation(stop);
                        // Center map on selected location
                        googleMapRef.current?.panTo({ lat: stop.lat, lng: stop.lng });
                        googleMapRef.current?.setZoom(15);
                      }
                    }}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      borderLeft: index === 0 ? 4 : 0,
                      borderLeftColor: index === 0 ? 'primary.main' : 'transparent',
                    }}
                  >
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          bgcolor: '#2a724a',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" noWrap>
                          {stop.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            component="div"
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              mb: 0.5
                            }}
                          >
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main', fontSize: '1rem', mt: 0.3 }} />
                            <span>{stop.address}</span>
                          </Typography>
                          {job && job.client && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Client: {job.client.name}
                            </Typography>
                          )}
                          {job && job.status && (
                            <Chip 
                              size="small" 
                              label={job.status.replace(/_/g, ' ')} 
                              sx={{ 
                                mt: 0.5,
                                bgcolor: 
                                  job.status === 'COMPLETED' ? 'success.light' :
                                  job.status === 'IN_PROGRESS' ? 'info.light' :
                                  job.status === 'SCHEDULED' ? 'primary.light' :
                                  job.status === 'CANCELLED' ? 'error.light' :
                                  'warning.light',
                                color: 'white'
                              }} 
                            />
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < optimizedRoute.stops.length - 1 && <Divider component="li" />}
                </Box>
              );
            })}
          </List>
        )}

        {/* No Jobs Message */}
        {!loading && locations.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No jobs scheduled for this day or the selected employee.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default MapView; 