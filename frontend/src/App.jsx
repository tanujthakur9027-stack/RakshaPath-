import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import TacticalSidebar from './components/TacticalSidebar';
import RouteMetricsHUD from './components/RouteMetricsHUD';
import TacticalDrawer from './components/TacticalDrawer';
import CivilianSafetyCard from './components/CivilianSafetyCard';
import CivilianSOSModal from './components/CivilianSOSModal';
import GuideModal from './components/GuideModal';
import AuthModal from './components/AuthModal';
import { api } from './api/client';
import { CITY_PRESETS, NETWORK_NODES, VEHICLE_PROFILES } from './api/embeddedEngine';

export default function App() {
  // 1. Core State
  const [currentCityId, setCurrentCityId] = useState('lucknow');
  const [disasterType, setDisasterType] = useState('flood');
  const [isCivilianMode, setIsCivilianMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('NDRF Tactical Lead');

  // Selected Territory & Endpoints
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Lucknow');
  const [originNodeId, setOriginNodeId] = useState('UP_GOMTI_CHOKE');
  const [destNodeId, setDestNodeId] = useState('UP_SGPGI_LKO');

  // Vehicle Profile & Hazard Physics
  const [vehicleType, setVehicleType] = useState('ambulance');
  const [waterDepth, setWaterDepth] = useState(55);
  const [damageLevel, setDamageLevel] = useState(3.5);
  const [debrisLevel, setDebrisLevel] = useState(2.5);

  // Computed Route & Telemetry
  const [routeData, setRouteData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [mapCenter, setMapCenter] = useState([80.9462, 26.8467]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // States & Districts derived from NETWORK_NODES
  const statesList = useMemo(() => {
    return Array.from(new Set(Object.values(NETWORK_NODES).map(n => n.state)));
  }, []);

  const districtsList = useMemo(() => {
    return Array.from(new Set(
      Object.values(NETWORK_NODES)
        .filter(n => n.state === selectedState)
        .map(n => n.district)
    ));
  }, [selectedState]);

  // Available nodes in current state/district
  const currentNodes = useMemo(() => {
    return Object.entries(NETWORK_NODES)
      .filter(([_, n]) => n.state === selectedState && (n.district === selectedDistrict || districtsList.length <= 1))
      .map(([id, n]) => ({ id, ...n }));
  }, [selectedState, selectedDistrict, districtsList]);

  // Handle City Jump from Top Bar
  const handleSelectCity = useCallback((cityId) => {
    const preset = CITY_PRESETS.find(c => c.id === cityId);
    if (!preset) return;
    setCurrentCityId(cityId);
    setSelectedState(preset.state);
    setSelectedDistrict(preset.district);
    setOriginNodeId(preset.defaultOrigin);
    setDestNodeId(preset.defaultDest);
    setMapCenter(preset.coords);
  }, []);

  // Handle State & District change from Sidebar
  const handleSelectState = (state) => {
    setSelectedState(state);
    const firstDistrict = Object.values(NETWORK_NODES).find(n => n.state === state)?.district || '';
    setSelectedDistrict(firstDistrict);
    const stateNodes = Object.entries(NETWORK_NODES).filter(([_, n]) => n.state === state);
    if (stateNodes.length > 1) {
      setOriginNodeId(stateNodes[0][0]);
      setDestNodeId(stateNodes[1][0]);
      setMapCenter([stateNodes[0][1].lon, stateNodes[0][1].lat]);
    }
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    const distNodes = Object.entries(NETWORK_NODES).filter(([_, n]) => n.district === district);
    if (distNodes.length > 1) {
      setOriginNodeId(distNodes[0][0]);
      setDestNodeId(distNodes[1][0]);
      setMapCenter([distNodes[0][1].lon, distNodes[0][1].lat]);
    }
  };

  // Landmark Search Select
  const handleSearchSelect = (nodeId, nodeData) => {
    setSelectedState(nodeData.state);
    setSelectedDistrict(nodeData.district);
    setOriginNodeId(nodeId);
    setMapCenter([nodeData.lon, nodeData.lat]);
  };

  // GPS Geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([longitude, latitude]);

        // Find nearest node
        let nearest = null;
        let minDist = Infinity;
        Object.entries(NETWORK_NODES).forEach(([id, n]) => {
          const d = Math.hypot(n.lat - latitude, n.lon - longitude);
          if (d < minDist) {
            minDist = d;
            nearest = { id, ...n };
          }
        });
        if (nearest) {
          setSelectedState(nearest.state);
          setSelectedDistrict(nearest.district);
          setOriginNodeId(nearest.id);
        }
      },
      (err) => {
        alert('Could not determine your GPS location. Please check browser permissions.');
      }
    );
  };

  // Live Vehicle Hazard Evaluation
  const vehicleEval = useMemo(() => {
    return api.evaluateHazard(waterDepth, damageLevel, debrisLevel, vehicleType);
  }, [waterDepth, damageLevel, debrisLevel, vehicleType]);

  // Recalculate Route whenever Origin, Dest, Vehicle, or Hazards change
  const recalculateRoute = useCallback(async () => {
    try {
      const res = await api.computeRoute(
        originNodeId,
        destNodeId,
        vehicleType,
        waterDepth,
        damageLevel,
        debrisLevel,
        incidents
      );
      setRouteData(res);
    } catch (err) {
      console.error('Route calculation error:', err);
    }
  }, [originNodeId, destNodeId, vehicleType, waterDepth, damageLevel, debrisLevel, incidents]);

  useEffect(() => {
    recalculateRoute();
  }, [recalculateRoute]);

  // Load Hospitals & Fleet for current city
  useEffect(() => {
    async function loadData() {
      const [hospData, fleetData, incData] = await Promise.all([
        api.getHospitals(currentCityId),
        api.getFleet(currentCityId),
        api.getIncidents(currentCityId, disasterType)
      ]);
      setHospitals(hospData);
      setFleet(fleetData);
      setIncidents(incData);
    }
    loadData();
  }, [currentCityId, disasterType]);

  // Ground Incident Transmission Handler
  const handleReportIncident = async (newIncidentData) => {
    const created = await api.createIncident(newIncidentData);
    setIncidents(prev => [created, ...prev]);
    // Recalculate route with new hazard immediately
    recalculateRoute();
  };

  // Coords for endpoints
  const originCoords = useMemo(() => {
    const n = NETWORK_NODES[originNodeId];
    return n ? [n.lon, n.lat] : null;
  }, [originNodeId]);

  const destCoords = useMemo(() => {
    const n = NETWORK_NODES[destNodeId];
    return n ? [n.lon, n.lat] : null;
  }, [destNodeId]);

  const originName = NETWORK_NODES[originNodeId]?.name || 'Origin';
  const destName = NETWORK_NODES[destNodeId]?.name || 'Destination';

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans overflow-hidden text-slate-100">
      {/* 1. Top Hero Header Bar */}
      <Header
        currentRegion={currentCityId}
        onSelectCity={handleSelectCity}
        disasterType={disasterType}
        onSelectDisaster={setDisasterType}
        isCivilianMode={isCivilianMode}
        onToggleMode={() => setIsCivilianMode(!isCivilianMode)}
        onSearchSelect={handleSearchSelect}
        onGeolocate={handleGeolocate}
        currentRole={currentRole}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Docked Tactical Sidebar */}
        <TacticalSidebar
          statesList={statesList}
          selectedState={selectedState}
          onSelectState={handleSelectState}
          selectedDistrict={selectedDistrict}
          districtsList={districtsList}
          onSelectDistrict={handleSelectDistrict}
          nodes={currentNodes.length > 0 ? currentNodes : Object.entries(NETWORK_NODES).map(([id, n]) => ({ id, ...n }))}
          originNode={originNodeId}
          onSelectOrigin={setOriginNodeId}
          destNode={destNodeId}
          onSelectDest={setDestNodeId}
          vehicleType={vehicleType}
          onSelectVehicle={setVehicleType}
          waterDepth={waterDepth}
          onChangeWaterDepth={setWaterDepth}
          damageLevel={damageLevel}
          onChangeDamageLevel={setDamageLevel}
          debrisLevel={debrisLevel}
          onChangeDebrisLevel={setDebrisLevel}
          vehicleEval={vehicleEval}
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentRole={currentRole}
        />

        {/* Center/Right Map & Analytics Zone */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Floating HUD Metrics directly over map */}
          <RouteMetricsHUD
            routeData={routeData}
            vehicleProfile={VEHICLE_PROFILES[vehicleType]}
          />

          {/* Interactive OpenStreetMap Map Libre View */}
          <div className="flex-1 relative">
            <MapView
              regionCenter={mapCenter}
              routeData={routeData}
              hospitals={hospitals}
              fleet={fleet}
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              originCoords={originCoords}
              destCoords={destCoords}
              originName={originName}
              destName={destName}
            />

            {/* Civilian Mode Overlay Card */}
            {isCivilianMode && (
              <div className="absolute top-20 right-4 z-30 max-w-sm pointer-events-auto">
                <CivilianSafetyCard
                  recommendation={routeData ? {
                    primary_route: {
                      travel_time_min: routeData.safe_corridor?.estimated_transit_time_min || 15,
                      total_length_km: routeData.safe_corridor?.total_distance_km || 10,
                      max_water_depth_m: (waterDepth * 0.3) / 100
                    },
                    assigned_hospital: {
                      name: destName,
                      beds_trauma_avail: 16,
                      beds_icu_avail: 18,
                      beds_general_avail: 72
                    },
                    assigned_vehicle: {
                      callsign: 'Verified Emergency Corridor'
                    }
                  } : null}
                  disasterType={disasterType}
                  onOpenSOS={() => setIsSOSOpen(true)}
                />
              </div>
            )}
          </div>

          {/* Bottom Contextual Tactical Drawer (Tabs) */}
          <TacticalDrawer
            routeData={routeData}
            fleet={fleet}
            onReportIncident={handleReportIncident}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
          />
        </div>
      </div>

      {/* 3. Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isCivilianMode={isCivilianMode}
        onToggleCivilianMode={() => setIsCivilianMode(!isCivilianMode)}
      />

      <CivilianSOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        disasterType={disasterType}
        userLocation={mapCenter}
        onReportHazard={(hazard) => {
          handleReportIncident({
            title: `Citizen SOS: ${hazard.hazardType} Report`,
            state: selectedState,
            district: selectedDistrict,
            incident_type: disasterType,
            severity: 'Critical',
            lat: hazard.location?.lat || mapCenter[1],
            lon: hazard.location?.lng || mapCenter[0],
            water_depth_cm: 60,
            damage_level: 5,
            debris_level: 4,
            description: hazard.description
          });
        }}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
