import { useEffect, useState } from "react";
import { randomUUID } from "@/utils/generateUUID";
import { get as getProjection, transform } from "ol/proj.js";
import ScenarioMap from "@/gui/map/ScenarioMap";
import Scenario from "@/game/Scenario";
import Game from "@/game/Game";
import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";
import armyDemoScenarioJson from "@/scenarios/army_demo_1.json";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import WelcomePopover from "@/WelcomePopover";
import { useAuth0 } from "@auth0/auth0-react";
import { runAllScenarios } from "@/run_recourse";

export default function App() {
  const { isAuthenticated } = useAuth0();
  const [openWelcomePopover, setOpenWelcomePopover] = useState(
    import.meta.env.VITE_ENV === "production"
  );
  const [status, setStatus] = useState("Ready to start simulations.");

  useEffect(() => {
    if (isAuthenticated) {
      setOpenWelcomePopover(false);
    }
  }, [isAuthenticated]);

  const isMobile = useMediaQuery("(max-width:600px)");
  // TODO: make this dynamic
  // startTime <-- takes real time
  // duration <-- remains
  // endTime <-- startTime + duration
  const currentScenario = new Scenario({
    id: randomUUID(),
    name: "New Scenario",
    startTime: 1699073110,
    duration: 14400,
  });
  const theGame = new Game(currentScenario);
  const projection = getProjection(DEFAULT_OL_PROJECTION_CODE) ?? undefined;

  theGame.loadScenario(JSON.stringify(armyDemoScenarioJson)); // loads default scenario for easier testing

  const handleStartSimulations = () => {
    setStatus("handleStartSimulations starts");
    // NOTE: This will still freeze the UI while running, but at least the
    // app renders first and the user initiates it. A more advanced
    // solution would use Web Workers to prevent freezing.
    runAllScenarios();
    setStatus("handleStartSimulations ends!");
  };
  
  return (
    <div>
    <h1>Recourse Simulation Runner</h1>
    <button onClick={handleStartSimulations}>
    Start All Scenarios
    </button>
    <p>Status: {status}</p>
    </div>
    );
  
    
    
  }
  
  /*
  
  return (
      <Box className="App" sx={{ display: "flex" }}>
      <ScenarioMap
      center={transform(
        theGame.mapView.currentCameraCenter,
        "EPSG:4326",
        DEFAULT_OL_PROJECTION_CODE
        )}
        zoom={theGame.mapView.currentCameraZoom}
        game={theGame}
        projection={projection}
        mobileView={isMobile}
        />
        </Box>
        );
  






  <WelcomePopover
  open={openWelcomePopover}
  onClose={() => setOpenWelcomePopover(false)}
  />
    */