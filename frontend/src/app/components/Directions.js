/**
 * This is the Directions component. It's a simple map that allows you to select a start and end point.
 * Once you've selected both points, it will fetch the directions and display them on the map.
 * You can also copy, share, and save the directions as an image.
 * 
 * The component uses the react-leaflet library for the map functionality.
 * It dynamically imports the necessary components to reduce the initial bundle size.
 * 
 * The map is initialized with a set of campus locations, and you can select the start and end points by clicking on the map.
 * 
 * The directions are fetched from a third-party API and displayed as a list of steps.
 * 
 * The map also provides options to copy, share, and save the directions as an image.
 * 
 * The component is designed to be used in a larger application
 */
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Copy, Share2 } from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

const campusLocations = {
  "University Center": { lat: 32.73166141145963, lng: -97.11092778726972 },
  "Engineering Research Building": { lat: 32.7333, lng: -97.1147 },
  "Nedderman Hall": { lat: 32.7324, lng: -97.1134 },
  "Science Hall": { lat: 32.7305, lng: -97.1123 },
  "Fine Arts Building": { lat: 32.7289, lng: -97.1156 },
  "Business Building": { lat: 32.7282, lng: -97.1108 },
};

const Directions = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    if (startPoint && endPoint) {
      fetchDirections();
    }
  }, [startPoint, endPoint]);

  const handleLocationSelect = (location, isStart) => {
    const coords = campusLocations[location];
    if (isStart) {
      setStartPoint({ ...coords, name: location });
    } else {
      setEndPoint({ ...coords, name: location });
    }
  };

  const fetchDirections = async () => {
    try {
      const response = await fetch(
        `/api/directions?start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const routeCoordinates = data.features[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]]
        );
        setRoute(routeCoordinates);

        const steps = data.features[0].properties.segments[0].steps;
        const formattedDirections = steps.map((step) => step.instruction);
        setDirections([
          `Start at ${startPoint.name}`,
          ...formattedDirections,
          `Arrive at ${endPoint.name}`,
        ]);
      } else {
        setError("No route found. Please try different locations.");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setError("Unable to fetch directions. Please try again later.");
      setDirections([]);
      setRoute([]);
    }
  };

  const copyDirections = () => {
    const directionsText = directions.join("\n");
    navigator.clipboard
      .writeText(directionsText)
      .then(() => alert("Directions copied to clipboard!"))
      .catch((err) => console.error("Failed to copy directions: ", err));
  };

  const shareDirections = () => {
    if (navigator.share) {
      const shareText = `Directions from ${startPoint.name} to ${
        endPoint.name
      } at UTA Campus:\n\n${directions.join("\n")}`;

      navigator
        .share({
          title: "UTA Campus Directions",
          text: shareText,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      alert(
        "Sharing is not supported on this device. You can copy the directions instead."
      );
      copyDirections();
    }
  };

  if (error) {
    return <div className="text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 relative z-0 pb-20 md:pb-12">
      <h1 className="text-2xl font-bold mb-4">UTA Campus Directions</h1>
      <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2">Start Point:</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => handleLocationSelect(e.target.value, true)}
          >
            <option value="">Select start point</option>
            {Object.keys(campusLocations).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block mb-2">End Point:</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => handleLocationSelect(e.target.value, false)}
          >
            <option value="">Select end point</option>
            {Object.keys(campusLocations).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isMapReady && (
        <div className="h-[300px] md:h-[500px] mb-4 relative z-0">
          <MapContainer
            center={[32.7299, -97.1135]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            zIndex={0}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {startPoint && (
              <Marker position={[startPoint.lat, startPoint.lng]}>
                <Popup>Start: {startPoint.name}</Popup>
              </Marker>
            )}
            {endPoint && (
              <Marker position={[endPoint.lat, endPoint.lng]}>
                <Popup>End: {endPoint.name}</Popup>
              </Marker>
            )}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
          </MapContainer>
        </div>
      )}

{directions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4 mb-8"> {/* Added mb-8 for extra bottom margin */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-bold mb-2 md:mb-0">Directions:</h2>
            <div className="flex space-x-2">
              <button
                onClick={copyDirections}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <Copy className="mr-2" size={18} /> Copy
              </button>
              <button
                onClick={shareDirections}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors inline-flex items-center"
              >
                <Share2 className="mr-2" size={18} /> Share
              </button>
            </div>
          </div>
          <ol className="list-decimal list-inside">
            {directions.map((step, index) => (
              <li key={index} className="mb-2">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Directions;