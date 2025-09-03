// this file needs refactoring, if python code successfully integrated/translated

import { calculateMissionSuccessRateFromObject } from "@/game/engine/missionCompletionCalculator";

/**
 * Parses the raw text content of a CSV file into an array of objects.
 * @param csvText The string content of the CSV file.
 * @returns An array of objects representing the CSV rows.
 */
function parseCsv(csvText: string): { headers: string[], data: { [key: string]: string }[] } {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], data: [] };
  }
  
  const headers = lines[0].split(',').map(header => header.trim());

  if (lines.length <= 1) {
    console.log("CSV file is empty or contains only a header.");
    return { headers, data: [] };
  }

  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    const entry: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      entry[header] = (values[index] || '').trim();
    });
    return entry;
  });
  
  return { headers, data };
}

/**
 * Fetches and processes the recourse CSV file from the client-side.
 * @returns A promise that resolves to the parsed CSV data.
*/
async function processRecourseCsv(): Promise<{ headers: string[], data: { [key: string]: string }[] }> {
 try {
    const filePath = "../recourse/results/algo_recourse_results.csv";
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCsv(csvText);

  } catch (error) {
    console.error("Error reading or processing the CSV file:", error);
    return { headers: [], data: [] }; // Return the correct object shape on error
  }
}

/**
 * Fetches and processes the recourse CSV file from the server.
 * @returns A promise that resolves to the parsed CSV data.
*/
async function server_processRecourseCsv(): Promise<{ headers: string[], data: { [key: string]: string }[] }> {
 try {
    const apiUrl = "http://127.0.0.1:8009/data"; 
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    
    return jsonData;

  } catch (error) {
    console.error("Error fetching or processing the CSV data from the backend:", error);
    return { headers: [], data: [] }; 
  }
}


/**
 * Constructs a CSV file from data and triggers a download.
 * @param headers The CSV headers.
 * @param existingData The existing rows of data.
 * @param newDataRow The new row to add.
 */
function constructAndDownloadCsv(headers: string[], existingData: { [key: string]: any }[], newDataRow: { [key: string]: any }) {
  const updatedData = [...existingData, newDataRow];

  const csvRows = updatedData.map(row =>
    headers.map(header => row[header] ?? '').join(',')
  );

  const csvContent = [headers.join(','), ...csvRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "algo_recourse_results_updated.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log("constructAndDownloadCsv finished!");
}

/**
 * Sends a new data row to the backend server to be appended to the CSV file.
 * @param newDataRow An object where keys are the CSV headers and values are the new data.
 */
async function updateCsvOnServer(newDataRow: { [key: string]: any }) {
  const apiUrl = "http://127.0.0.1:8009/update";

  console.log("Sending data to server:", newDataRow);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST', // Specify the request method is POST
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(newDataRow), // Convert the JavaScript object to a JSON string
    });

    // Check if the server responded with a success status code (e.g., 200)
    if (!response.ok) {
      // If not, get the error message from the server and throw an error
      const errorData = await response.json();
      throw new Error(`Server error: ${response.status} - ${errorData.description || 'Unknown error'}`);
    }

    // If the request was successful, log the confirmation message from the server
    const result = await response.json();
    console.log("Server response:", result.message);

  } catch (error) {
    // Catch any network errors or errors thrown from the response check
    console.error("Failed to update CSV on server:", error);
  }
}

/**
 * Main function to process game state data and generate a recourse CSV file.
 * It extracts features from the initial and final states of a simulation,
 * combines them with existing CSV data, and triggers a download.
 * @param firstLine The first line of the recording (JSON string).
 * @param lastLine The last line of the recording (JSON string).
 * @param hasGameEnded A boolean indicating if the game has concluded.
 */
export async function generateRecourseCsv(
  firstLine: string,
  lastLine: string,
  hasGameEnded: boolean
) {
  const jsonData = JSON.parse(firstLine);

  const { sides, aircraft, ships, facilities, airbases, missions } = jsonData.currentScenario;

  const side_a = sides[0];
  const side_b = sides[1];
  let side_a_id = side_a.id;
  let side_b_id = side_b.id;
  
  // Helper function to count units of a specific class for a given side
  const countUnits = (units: any[], sideId: string, className: string) => {
    return units.filter(u => u.sideId === sideId && u.className === className).length;
  };

  //TODO: put these in a data structure, that way we dont have to manually add variables
  
  // --- Overall Counts ---
  const side_a_total_ships = ships.filter((s: any) => s.sideId === side_a_id).length;
  const side_b_total_ships = ships.filter((s: any) => s.sideId === side_b_id).length;
  const side_a_total_planes = aircraft.filter((a: any) => a.sideId === side_a_id).length;
  const side_b_total_planes = aircraft.filter((a: any) => a.sideId === side_b_id).length;
  const side_a_total_sam_sites = facilities.filter((f: any) => f.sideId === side_a_id).length;
  const side_b_total_sam_sites = facilities.filter((f: any) => f.sideId === side_b_id).length;

  // --- Total Fuel ---
  const side_a_total_fuel_available = [...aircraft, ...ships]
    .filter((u:any) => u.sideId === side_a_id)
    .reduce((sum: number, unit: any) => sum + unit.currentFuel, 0);
  const side_b_total_fuel_available = [...aircraft, ...ships]
    .filter((u: any) => u.sideId === side_b_id)
    .reduce((sum: number, unit: any) => sum + unit.currentFuel, 0);

  // These might change
  // --- Specific Ship Counts ---
  const side_a_aircraft_carrier = countUnits(ships, side_a_id, 'Aircraft Carrier');
  const side_b_aircraft_carrier = countUnits(ships, side_b_id, 'Aircraft Carrier');
  const side_a_destroyer = countUnits(ships, side_a_id, 'Destroyer');
  const side_b_destroyer = countUnits(ships, side_b_id, 'Destroyer');
  const side_a_frigate = countUnits(ships, side_a_id, 'Frigate');
  const side_b_frigate = countUnits(ships, side_b_id, 'Frigate');
  const side_a_corvette = countUnits(ships, side_a_id, 'Corvette');
  const side_b_corvette = countUnits(ships, side_b_id, 'Corvette');
  const side_a_amphibious_assault_ship = countUnits(ships, side_a_id, 'Amphibious Assault Ship');
  const side_b_amphibious_assault_ship = countUnits(ships, side_b_id, 'Amphibious Assault Ship');
  const side_a_patrol_boat = countUnits(ships, side_a_id, 'Patrol Boat');
  const side_b_patrol_boat = countUnits(ships, side_b_id, 'Patrol Boat');
  
  // These might change
  // --- Specific Aircraft Counts ---
  const side_a_f35a_lightning_ii = countUnits(aircraft, side_a_id, 'F-35A Lightning II');
  const side_b_f35a_lightning_ii = countUnits(aircraft, side_b_id, 'F-35A Lightning II');
  const side_a_kc135r_stratotanker = countUnits(aircraft, side_a_id, 'KC-135R Stratotanker');
  const side_b_kc135r_stratotanker = countUnits(aircraft, side_b_id, 'KC-135R Stratotanker');
  const side_a_a10c_thunderbolt_ii = countUnits(aircraft, side_a_id, 'A-10C Thunderbolt II');
  const side_b_a10c_thunderbolt_ii = countUnits(aircraft, side_b_id, 'A-10C Thunderbolt II');
  const side_a_b2_spirit = countUnits(aircraft, side_a_id, 'B-2 Spirit');
  const side_b_b2_spirit = countUnits(aircraft, side_b_id, 'B-2 Spirit');
  const side_a_f22_raptor = countUnits(aircraft, side_a_id, 'F-22 Raptor');
  const side_b_f22_raptor = countUnits(aircraft, side_b_id, 'F-22 Raptor');
  const side_a_c130_hercules = countUnits(aircraft, side_a_id, 'C-130 Hercules');
  const side_b_c130_hercules = countUnits(aircraft, side_b_id, 'C-130 Hercules');
  const side_a_c17_globemaster_iii = countUnits(aircraft, side_a_id, 'C-17 Globemaster III');
  const side_b_c17_globemaster_iii = countUnits(aircraft, side_b_id, 'C-17 Globemaster III');
  const side_a_f16_fighting_falcon = countUnits(aircraft, side_a_id, 'F-16 Fighting Falcon');
  const side_b_f16_fighting_falcon = countUnits(aircraft, side_b_id, 'F-16 Fighting Falcon');
  const side_a_e3_sentry = countUnits(aircraft, side_a_id, 'E-3 Sentry');
  const side_b_e3_sentry = countUnits(aircraft, side_b_id, 'E-3 Sentry');
  const side_a_p8_poseidon = countUnits(aircraft, side_a_id, 'P-8 Poseidon');
  const side_b_p8_poseidon = countUnits(aircraft, side_b_id, 'P-8 Poseidon');
  const side_a_f14_tomcat = countUnits(aircraft, side_a_id, 'F-14 Tomcat');
  const side_b_f14_tomcat = countUnits(aircraft, side_b_id, 'F-14 Tomcat');
  const side_a_f4_phantom = countUnits(aircraft, side_a_id, 'F-4 Phantom II');
  const side_b_f4_phantom = countUnits(aircraft, side_b_id, 'F-4 Phantom II');
  const side_a_f15_eagle = countUnits(aircraft, side_a_id, 'F-15 Eagle');
  const side_b_f15_eagle = countUnits(aircraft, side_b_id, 'F-15 Eagle');
  const side_a_c12_huron = countUnits(aircraft, side_a_id, 'C-12 Huron');
  const side_b_c12_huron = countUnits(aircraft, side_b_id, 'C-12 Huron');
  const side_a_b52 = countUnits(aircraft, side_a_id, 'B-52 Stratofortress');
  const side_b_b52 = countUnits(aircraft, side_b_id, 'B-52 Stratofortress');

  // These might change
  // --- Specific SAM Site Counts ---
  const side_a_s400_triumf = countUnits(facilities, side_a_id, 'S-400 Triumf');
  const side_b_s400_triumf = countUnits(facilities, side_b_id, 'S-400 Triumf');
  const side_a_mim104_patriot = countUnits(facilities, side_a_id, 'MIM-104 Patriot');
  const side_b_mim104_patriot = countUnits(facilities, side_b_id, 'MIM-104 Patriot');
  const side_a_s300 = countUnits(facilities, side_a_id, 'S-300');
  const side_b_s300 = countUnits(facilities, side_b_id, 'S-300');
  const side_a_s500 = countUnits(facilities, side_a_id, 'S-500');
  const side_b_s500 = countUnits(facilities, side_b_id, 'S-500');
  const side_a_total_airbases = airbases.filter((a: any) => a.sideId === side_a_id).length;
  const side_b_total_airbases = airbases.filter((a: any) => a.sideId === side_b_id).length;
  
  // These might change
  // --- Mission Counts ---
  const side_a_total_missions = missions.filter((m: any) => m.sideId === side_a_id).length;
  const side_b_total_missions = missions.filter((m: any) => m.sideId === side_b_id).length;
  const side_a_patrol_missions = missions.filter((m: any) => m.sideId === side_a_id && m.name.includes('Patrol')).length;
  const side_b_patrol_missions = missions.filter((m: any) => m.sideId === side_b_id && m.name.includes('Patrol')).length;
  const side_a_strike_missions = missions.filter((m: any) => m.sideId === side_a_id && m.name.includes('Strike')).length;
  const side_b_strike_missions = missions.filter((m: any) => m.sideId === side_b_id && m.name.includes('Strike')).length;
  
  const jsonResult = JSON.parse(lastLine);
  const scenarioResult = jsonResult.currentScenario;
  const sidesResult = scenarioResult.sides;

  if (hasGameEnded) {
    // process current outcome from missionSuccessRate and casualty rate
    const side_a_mission_success_rate = calculateMissionSuccessRateFromObject(scenarioResult, side_a_id);
    const side_b_mission_success_rate = calculateMissionSuccessRateFromObject(scenarioResult, side_b_id);
    
    // Fetch existing CSV data
    const { headers, data } = await server_processRecourseCsv();
    
    const side_a_total_initial_units = side_a_total_ships + side_a_total_planes + side_a_total_sam_sites + side_a_total_airbases;
    const side_b_total_initial_units = side_b_total_ships + side_b_total_planes + side_b_total_sam_sites + side_b_total_airbases;
    
    const side_a_casualties = sidesResult[0].casualties;
    const side_b_casualties = sidesResult[1].casualties;
    
    const side_a_casualty_rate = side_a_total_initial_units > 0 ? (side_a_casualties / side_a_total_initial_units) : 0;
    const side_b_casualty_rate = side_b_total_initial_units > 0 ? (side_b_casualties / side_b_total_initial_units) : 0;
    
    const side_a_outcome = (side_a_casualty_rate < 0.5 && side_a_mission_success_rate > 0.75) ? 1 : 0;
    const side_b_outcome = (side_b_casualty_rate < 0.5 && side_b_mission_success_rate > 0.75) ? 1 : 0;
    
    console.log("side_b_outcome: ", side_b_outcome);
    console.log("side_a_outcome: ", side_a_outcome);
    
    const newDataRow = {
      // Outcomes
      side_a_outcome,
      side_b_outcome,
      
      // --- Totals ---
      side_a_total_ships,
      side_b_total_ships,
      side_a_total_planes,
      side_b_total_planes,
      side_a_total_sam_sites,
      side_b_total_sam_sites,
      side_a_total_fuel_available,
      side_b_total_fuel_available,
      
      // --- Ship Types ---
      side_a_aircraft_carrier,
      side_b_aircraft_carrier,
      side_a_destroyer,
      side_b_destroyer,
      side_a_frigate,
      side_b_frigate,
      side_a_corvette,
      side_b_corvette,
      side_a_amphibious_assault_ship,
      side_b_amphibious_assault_ship,
      side_a_patrol_boat,
      side_b_patrol_boat,
      
      // --- Aircraft Types ---
      side_a_f35a_lightning_ii,
      side_b_f35a_lightning_ii,
      side_a_kc135r_stratotanker,
      side_b_kc135r_stratotanker,
      side_a_a10c_thunderbolt_ii,
      side_b_a10c_thunderbolt_ii,
      side_a_b2_spirit,
      side_b_b2_spirit,
      side_a_f22_raptor,
      side_b_f22_raptor,
      side_a_c130_hercules,
      side_b_c130_hercules,
      side_a_c17_globemaster_iii,
      side_b_c17_globemaster_iii,
      side_a_f16_fighting_falcon,
      side_b_f16_fighting_falcon,
      side_a_e3_sentry,
      side_b_e3_sentry,
      side_a_p8_poseidon,
      side_b_p8_poseidon,
      side_a_f14_tomcat,
      side_b_f14_tomcat,
      side_a_f4_phantom,
      side_b_f4_phantom,
      side_a_f15_eagle,
      side_b_f15_eagle,
      side_a_c12_huron,
      side_b_c12_huron,
      side_a_b52,
      side_b_b52,
      
      // --- SAM Sites ---
      side_a_s400_triumf,
      side_b_s400_triumf,
      side_a_mim104_patriot,
      side_b_mim104_patriot,
      side_a_s300,
      side_b_s300,
      side_a_s500,
      side_b_s500,
      
      // --- Missions ---
      side_a_total_missions,
      side_b_total_missions,
      side_a_patrol_missions,
      side_b_patrol_missions,
      side_a_strike_missions,
      side_b_strike_missions,
    };
    
    updateCsvOnServer(newDataRow);
    // constructAndDownloadCsv(headers, existingCsvData, newDataRow);
  } else {
    // TODO: Determine how to calculate outcomes when the game hasn't ended.
    // For now, we only process data if the game is over.
    console.log("Game has not ended, recourse data will not be processed.");
  }
}
