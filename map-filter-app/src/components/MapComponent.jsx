import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const accessToken = "pk.eyJ1Ijoic3ViZWVzaDk3IiwiYSI6ImNtNzhrOHdueTBndjIycHNoOXRxNXdtODMifQ.7QV-5dZy3fU1q2pMP2BZ_Q";

const MapComponent = ({ location }) => {
  const mapContainerRef = useRef();
  const mapInstanceRef = useRef();
  const [mapLoaded, setMapLoaded] = useState(false);

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
    });

    return () => mapInstanceRef.current?.remove();
  }, [location]);

  return <div ref={mapContainerRef} className="w-full h-screen" />;
};

export default MapComponent; 