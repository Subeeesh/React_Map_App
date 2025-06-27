import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import Sidebar from "./components/Sidebar";

const accessToken = "pk.eyJ1Ijoic3ViZWVzaDk3IiwiYSI6ImNtNzhrOHdueTBndjIycHNoOXRxNXdtODMifQ.7QV-5dZy3fU1q2pMP2BZ_Q";

const App = () => {
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [circleData, setCircleData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;

    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [location.lng, location.lat],
      zoom: 10,
    });

    mapInstanceRef.current.on("load", () => {
      setMapLoaded(true);
      if (circleData) {
        drawCircleOnMap(circleData);
      }
    });

    return () => mapInstanceRef.current?.remove();
  }, []);

  useEffect(() => {
    if (mapLoaded && location) {
      mapInstanceRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 14,
        duration: 2000,
        essential: true,
      });
    }
  }, [mapLoaded, location]);

  // Enable circle drawing
  const enableCircleDrawing = () => {
    setDrawingEnabled(true);
    setIsDrawing(false);
    console.log("Circle drawing enabled. Click and drag to draw.");
  };

  // Start drawing a circle
  const startDrawing = (e) => {
    if (!drawingEnabled) return;
    setIsDrawing(true);
    const { lng, lat } = e.lngLat;
    setStartPoint([lng, lat]);
  };

  // Update circle dynamically
  const updateDrawing = (e) => {
    if (!drawingEnabled || !startPoint || !isDrawing) return;
    const { lng, lat } = e.lngLat;
    const radius = turf.distance(turf.point(startPoint), turf.point([lng, lat]), { units: "kilometers" });
    const centerLng = (startPoint[0] + lng) / 2;
    const centerLat = (startPoint[1] + lat) / 2;
    const circleCenter = [centerLng, centerLat];

    const circle = turf.circle(circleCenter, radius, { steps: 64, units: "kilometers" });

    setCircleData(circle);
    drawCircleOnMap(circle);
  };

  // Draw circle on the map
  const drawCircleOnMap = (circle) => {
    if (!mapInstanceRef.current.getSource("circle")) {
      mapInstanceRef.current.addSource("circle", { type: "geojson", data: circle });
      mapInstanceRef.current.addLayer({
        id: "circle-layer",
        type: "fill",
        source: "circle",
        paint: { "fill-color": "#ff0000", "fill-opacity": 0.3 },
      });
    } else {
      mapInstanceRef.current.getSource("circle").setData(circle);
    }
  };

  // Stop drawing
  const stopDrawing = async () => {
    if (!drawingEnabled || !circleData) return;
    setIsDrawing(false);
  
    const userChoice = window.confirm("Do you want to download the circle's coordinates as a JSON file?");
    
    if (userChoice) {
      // Fetch details for coordinates inside the circle
      const circleDetails = await fetchDetailsForCircle(circleData);
      
      // Download JSON file
      downloadJSON(circleDetails);
    } else {
      console.log("Circle drawn:", circleData);
    }
  };

  // Remove circle on right-click
  const removeCircle = (e) => {
    if (!circleData) return;
    e.preventDefault();
    const { lng, lat } = e.lngLat;
    const point = turf.point([lng, lat]);

    if (turf.booleanPointInPolygon(point, circleData)) {
      if (mapInstanceRef.current.getLayer("circle-layer")) {
        mapInstanceRef.current.removeLayer("circle-layer");
        mapInstanceRef.current.removeSource("circle");
      }
      setCircleData(null);
      console.log("Circle removed!");
    }
  };

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (Array.isArray(jsonData)) {
            addMarkers(jsonData);
          } else {
            console.error("Invalid JSON format. Expected an array of { lat, lng } objects.");
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to add markers
  const addMarkers = (locations) => {
    if (!mapInstanceRef.current) return;
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location, index) => {
      if (location.lat && location.lng) {
        const marker = new mapboxgl.Marker({ color: "red", scale: 1.5 })
          .setLngLat([location.lng, location.lat])
          .addTo(mapInstanceRef.current)
          .setPopup(new mapboxgl.Popup().setText(`Marker ${index + 1}`));

        // Add click event to remove marker
        marker.getElement().addEventListener("click", () => {
          // Zoom into the marker
          mapInstanceRef.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 16,
            duration: 1500,
          });
        
          // Log the clicked coordinates
          console.log(`Marker clicked at: Latitude: ${location.lat}, Longitude: ${location.lng}`);
        
          // Fetch location details (State, City, ZIP Code, and County)
          fetchLocationDetails(location.lat, location.lng);
        });
        
        setMarkers((prev) => [...prev, { id: `marker-${index}`, marker }]);
        bounds.extend([location.lng, location.lat]);
      }
    });

    console.log("Markers added:", locations);

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50, maxZoom: 10, duration: 1500 });
    }
  };
  const fetchDetailsForCircle = async (circle) => {
    const coordinates = circle.geometry.coordinates[0]; // Get boundary points
    const details = [];
  
    for (let coord of coordinates) {
      const [lng, lat] = coord;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=place,postcode,region,district`
        );
        const data = await response.json();
        
        let state = "", city = "", zip = "", county = "";
  
        data.features.forEach((feature) => {
          if (feature.place_type.includes("region")) state = feature.text;
          if (feature.place_type.includes("place")) city = feature.text;
          if (feature.place_type.includes("postcode")) zip = feature.text;
          if (feature.place_type.includes("district")) county = feature.text;
        });
  
        details.push({ lat, lng, state, city, zip, county });
  
      } catch (error) {
        console.error("Error fetching location details:", error);
      }
    }
  
    return details;
  };
  const downloadJSON = (data) => {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(jsonBlob);
    link.download = "circle_coordinates.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const fetchLocationDetails = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=place,postcode,region,district`
      );
      const data = await response.json();
  
      let state = "";
      let city = "";
      let zip = "";
      let county = "";
  
      data.features.forEach((feature) => {
        if (feature.place_type.includes("region")) state = feature.text;
        if (feature.place_type.includes("place")) city = feature.text;
        if (feature.place_type.includes("postcode")) zip = feature.text;
        if (feature.place_type.includes("district")) county = feature.text;
      });
  
      console.log(`State: ${state}, City: ${city}, ZIP Code: ${zip}, County: ${county}`);
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };
  

  useEffect(() => {
    if (mapLoaded) {
      mapInstanceRef.current.on("mousedown", startDrawing);
      mapInstanceRef.current.on("mousemove", updateDrawing);
      mapInstanceRef.current.on("mouseup", stopDrawing);
      mapInstanceRef.current.on("contextmenu", removeCircle);
    }

    return () => {
      if (mapLoaded) {
        mapInstanceRef.current.off("mousedown", startDrawing);
        mapInstanceRef.current.off("mousemove", updateDrawing);
        mapInstanceRef.current.off("mouseup", stopDrawing);
        mapInstanceRef.current.off("contextmenu", removeCircle);
      }
    };
  }, [mapLoaded, drawingEnabled, startPoint, circleData, isDrawing]);

  return (
    <div className="flex">
      <Sidebar onSearch={setLocation} />

      <div className="relative flex-1">
        {/* Circle Drawing Button */}
        <button
          onClick={enableCircleDrawing}
          className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-10 hover:bg-blue-700 transition"
        >
          Circle the Area
        </button>

        {/* File Upload Button */}
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="absolute top-4 right-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer z-10"
        />

        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-screen" />
      </div>
    </div>
  );
};

export default App;
