import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from 'react'
import Layout from "./pages/layout";
import ArgoAbout from "./pages/about"
import ArgovisExplore from "./pages/explore"
import Grids from "./pages/grids"
import ArgoExplore from "./pages/argo"
import TCExplore from "./pages/tc"
import DriftersExplore from "./pages/drifters"
import ShipsExplore from "./pages/ships"
import ArgoPlots from "./pages/argoPlots"
import TCPlots from "./pages/tcPlots"
import DrifterPlots from "./pages/drifterPlots"
import ShipPlots from "./pages/shipPlots"
import APIintro from "./pages/api_intro"
import Hackathon from "./pages/hackathon2024"

export default function App() {
  useEffect(() => {    
    // refresh iff query string changed onpopstate, so the back button works in a relatively reasonable manner and hash changes dont trigger refresh
    window.onpopstate = function(event){
      if(window.argoPrevious !== window.location.search){
        window.argoPrevious = window.location.search
        window.location.reload() 
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Layout />}>
          <Route path="about" element={<ArgoAbout />} />
          <Route index element={<ArgovisExplore />} />
          <Route path="argo" element={<ArgoExplore />} />
          <Route path="tc" element={<TCExplore />} />
          <Route path="drifters" element={<DriftersExplore />} />
          <Route path="ships" element={<ShipsExplore />} />
          <Route path="grids" element={<Grids />} />
          <Route path="plots/argo" element={<ArgoPlots />} />
          <Route path="plots/tc" element={<TCPlots />} />
          <Route path="plots/drifters" element={<DrifterPlots />} />
          <Route path="plots/ships" element={<ShipPlots />} />
          <Route path="apiintro" element={<APIintro />} />
          <Route path="hackathon" element={<Hackathon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);