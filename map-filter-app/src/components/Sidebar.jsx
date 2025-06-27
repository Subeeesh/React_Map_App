import React, { useState } from "react";
import { SearchBox } from "@mapbox/search-js-react";

const Sidebar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    county: "",
    zipcode: "",
  });

  const handleSearch = async () => {
    const query = `${filters.city}, ${filters.county}, ${filters.state}, ${filters.zipcode}`.trim();
    
    if (!query) {
      alert("Please enter at least one location filter.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1Ijoic3ViZWVzaDk3IiwiYSI6ImNtNzhrOHdueTBndjIycHNoOXRxNXdtODMifQ.7QV-5dZy3fU1q2pMP2BZ_Q`
      );
      const data = await response.json();

      if (data?.features?.length > 0) {
        const { center, place_name } = data.features[0]; // Extracts location
        onSearch({
          lat: center[1],
          lng: center[0],
          place: place_name,
        });
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Something went wrong! Try again.");
    }
  };

  return (
    <div className="w-1/4 p-4 bg-gray-100 h-screen shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filter Locations</h2>

      {/* Input Fields for State, City, County, Zipcode */}
      <input
        type="text"
        placeholder="State"
        className="w-full p-2 border mb-2"
        value={filters.state}
        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
      />
      <input
        type="text"
        placeholder="City"
        className="w-full p-2 border mb-2"
        value={filters.city}
        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
      />
      <input
        type="text"
        placeholder="County"
        className="w-full p-2 border mb-2"
        value={filters.county}
        onChange={(e) => setFilters({ ...filters, county: e.target.value })}
      />
      <input
        type="text"
        placeholder="Zipcode"
        className="w-full p-2 border mb-4"
        value={filters.zipcode}
        onChange={(e) => setFilters({ ...filters, zipcode: e.target.value })}
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
      >
        Search
      </button>
    </div>
  );
};

export default Sidebar;
