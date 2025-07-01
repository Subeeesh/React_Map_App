# 🗺️ React Map App - Interactive Map with Mapbox

An interactive, customizable, multi-page map application built with **React.js** and **Mapbox GL JS**. This app allows users to explore locations, calculate directions, and interact with a fully styled map interface. It also offers controls to change map themes and size dynamically.

---

## 🚀 Features

- 🌐 Multi-page navigation using React Router (`Home`, `Services`, `Map`, `Settings`)
- 🗺️ Fully interactive map powered by [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- 📍 Add markers, view current coordinates, and get directions
- 🚗 Route and travel time support (driving, walking, cycling)
- 🎨 Switch between multiple map styles (Dark, Light, Satellite, Navigation, Outdoor)
- 📏 Adjust map display size (Small, Medium, Large)
- 🧠 React Context API used for global state management
- 💅 Styled-components for modular, scoped styling

---

## 📸 Screenshots

| Map View                                 | Settings Panel                                     |
| ---------------------------------------- | -------------------------------------------------- |
| ![map screenshot](./screenshots/map.png) | ![settings screenshot](./screenshots/settings.png) |

---

## 📂 Project Structure

React_Map_App/
│
├── public/ # Static files
├── src/
│ ├── components/ # Reusable UI components
│ ├── context/ # Context API setup
│ ├── pages/ # Route-based pages (Home, Map, Services, Settings)
│ ├── styles/ # Styled-components and theme configuration
│ ├── App.js # Root component with router setup
│ └── index.js # Entry point
├── .env # Mapbox token (not committed)
├── package.json # Project metadata and dependencies
└── README.md # Project documentation

---

## 🛠️ Getting Started

### 1. Clone the repository

git clone https://github.com/Subeeesh/React_Map_App.git
cd React_Map_App

---

### 2. Install dependencies

npm install

### 3. Configure Mapbox Token

Create a .env file in the root directory:

REACT_APP_MAPBOX_TOKEN=your_mapbox_access_token

### 4. Start development server

npm start

Visit http://localhost:3000 to view the app in your browser.

---

## 🔗 Dependencies

- React

- React Router DOM

- Mapbox GL JS

- Styled-components

- Mapbox Directions Plugin

