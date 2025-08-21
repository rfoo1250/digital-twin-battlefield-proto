import Scenario from "@/game/Scenario";
import { calculateMissionSuccessRateFromObject } from "@/game/engine/missionCompletionCalculator";
import { RECORDING_INTERVALS_SECONDS } from "@/utils/constants";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";

const FILE_SIZE_LIMIT_MB = 1000;
const CHARACTER_LIMIT = FILE_SIZE_LIMIT_MB * 1024 * 1024;
const RECORDING_INTERVAL_SECONDS = 10;

class PlaybackRecorder {
  scenarioName: string = "New Scenario";
  lastRecordingTime: number = 0;
  recording: string = "";
  recordingStartTime: number = 0;
  recordEverySeconds: number = RECORDING_INTERVAL_SECONDS;

  constructor(recordEverySeconds: number) {
    this.recordEverySeconds = recordEverySeconds || RECORDING_INTERVAL_SECONDS;
  }

  /**
   * Parses the raw text content of a CSV file into an array of objects.
   * @param csvText The string content of the CSV file.
   * @returns An array of objects representing the CSV rows.
   */
  private parseCsv(csvText: string): { [key: string]: string }[] {
    const lines = csvText.trim().split('\n');
    
    const headers = lines[0].split(',').map(header => header.trim());

    if (lines.length <= 1) {
      console.log("CSV file is empty or contains only a header.");
      return [];
    }

    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const entry: { [key: string]: string } = {};

      headers.forEach((header, index) => {
        entry[header] = (values[index] || '').trim();
      });

      return entry;
    });

    console.log("Parsed CSV Data:", data);
    return data;
  }

  /**
   * Fetches and processes the recourse CSV file from the server.
   * This function is now asynchronous.
   * @returns A promise that resolves to the parsed CSV data.
   */
  private async processRecourseCsv() {
    try {
      const filePath = "/recourse/results/algo_recourse_results.csv";
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      return this.parseCsv(csvText);

    } catch (error) {
      console.error("Error reading or processing the CSV file:", error);
      return []; // Return an empty array on error
    }
  }


  switchRecordingInterval() {
    for (let i = 0; i < RECORDING_INTERVALS_SECONDS.length; i++) {
      if (this.recordEverySeconds === RECORDING_INTERVALS_SECONDS[i]) {
        this.recordEverySeconds =
          RECORDING_INTERVALS_SECONDS[
            (i + 1) % RECORDING_INTERVALS_SECONDS.length
          ];
          break;
        }
    }
  }
  
  shouldRecord(currentScenarioTime: number) {
    if (
      currentScenarioTime - this.lastRecordingTime >=
      this.recordEverySeconds
    ) {
      this.lastRecordingTime = currentScenarioTime;
      return true;
    }
    return false;
  }
  
  reset() {
    this.scenarioName = "New Scenario";
    this.recording = "";
    this.lastRecordingTime = 0;
    this.recordingStartTime = 0;
  }
  
  startRecording(scenario: Scenario) {
    this.reset();
    this.scenarioName = scenario.name;
    this.lastRecordingTime = scenario.currentTime;
    this.recordingStartTime = scenario.currentTime;
  }
  
  recordStep(currentStep: string, currentScenarioTime: number) {
    this.recording += currentStep + "\n";
    this.lastRecordingTime = currentScenarioTime;
    if (this.recording.length > CHARACTER_LIMIT) {
      this.exportRecording(currentScenarioTime, this.recordingStartTime);
      this.recordingStartTime = currentScenarioTime;
      this.recording = "";
    }
  }

  exportRecording(
    recordingEndTimeUnix: number,
    recordingStartTimeUnix: number = this.recordingStartTime
  ) {
    if (this.recording.length === 0) {
      return;
    }
    const jsonlDataStrUrl =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(this.recording.slice(0, -1));
    const downloadJsonlAnchorNode = document.createElement("a");
    downloadJsonlAnchorNode.setAttribute("href", jsonlDataStrUrl);
    const formattedRecordingStartTime = unixToLocalTime(
      recordingStartTimeUnix
    ).replace(/:/g, "");
    const formattedRecordingEndTime = unixToLocalTime(
      recordingEndTimeUnix
    ).replace(/:/g, "");
    const recordingFileTimespanSuffix = `${formattedRecordingStartTime} - ${formattedRecordingEndTime}`;
    downloadJsonlAnchorNode.setAttribute(
      "download",
      `${this.scenarioName} Recording ${recordingFileTimespanSuffix}.jsonl`
    );
    document.body.appendChild(downloadJsonlAnchorNode); // required for firefox
    downloadJsonlAnchorNode.click();
    downloadJsonlAnchorNode.remove();
  }

  
  processRecourseData(
    firstLine: string,
    lastLine: string,
    hasGameEnded: boolean
  ) {
    /*
    This function handles the data processing needed for algo recourse.
    Takes out the needed features and outcome for the csv.
    Then store in csv.
    */
    // assuming recording is json parsable
    const jsonData = JSON.parse(firstLine);
    
    // console.log(jsonData);
    // const jsonStrUrl =
    // "data:text/json;charset=utf-8," +
    // encodeURIComponent(JSON.stringify(jsonData, null, 2));

    // const downloadAnchor = document.createElement("a");
    // downloadAnchor.setAttribute("href", jsonStrUrl);
    // downloadAnchor.setAttribute("download", "data.json");

    // document.body.appendChild(downloadAnchor); // Firefox requires it in DOM
    // downloadAnchor.click();
    // downloadAnchor.remove();

    // separate data  
    const { sides, aircraft, ships, facilities, weapons, missions } = jsonData.currentScenario;
    console.log(sides);
    console.log(aircraft);
    console.log(ships);
    console.log(facilities);
    console.log(weapons);
    console.log(missions);

    // since assuming two hostiles sides only, assign sides first, to side_a or side_b
    const side_a = sides[0];
    const side_b = sides[1];
    let side_a_id = side_a.id;
    let side_b_id = side_b.id;
    // console.log("Printing side ids");
    // console.log(side_a_id);
    // console.log(side_b_id);
    // take out needed data only
    
    // Helper function to count units of a specific class for a given side
    const countUnits = (units: any[], sideId: string, className: string) => {
      return units.filter(u => u.sideId === sideId && u.className === className).length;
    };

    // --- Overall Counts ---
    const side_a_total_ships = ships.filter((s: any) => s.sideId === side_a_id).length;
    const side_b_total_ships = ships.filter((s: any) => s.sideId === side_b_id).length;
    const side_a_total_planes = aircraft.filter((a: any) => a.sideId === side_a_id).length;
    const side_b_total_planes = aircraft.filter((a: any) => a.sideId === side_b_id).length;
    const side_a_total_sam_sites = facilities.filter((f: any) => f.sideId === side_a_id).length;
    const side_b_total_sam_sites = facilities.filter((f: any) => f.sideId === side_b_id).length;

    // --- Total Fuel ---
    const side_a_total_fuel_available = [...aircraft, ...ships]
      .filter(u => u.sideId === side_a_id)
      .reduce((sum, unit) => sum + unit.currentFuel, 0);
    const side_b_total_fuel_available = [...aircraft, ...ships]
      .filter(u => u.sideId === side_b_id)
      .reduce((sum, unit) => sum + unit.currentFuel, 0);

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

    // --- Specific SAM Site Counts ---
    const side_a_s400_triumf = countUnits(facilities, side_a_id, 'S-400 Triumf');
    const side_b_s400_triumf = countUnits(facilities, side_b_id, 'S-400 Triumf');
    const side_a_mim104_patriot = countUnits(facilities, side_a_id, 'MIM-104 Patriot');
    const side_b_mim104_patriot = countUnits(facilities, side_b_id, 'MIM-104 Patriot');
    const side_a_s300 = countUnits(facilities, side_a_id, 'S-300'); // Assumed className
    const side_b_s300 = countUnits(facilities, side_b_id, 'S-300'); // Assumed className
    const side_a_s500 = countUnits(facilities, side_a_id, 'S-500'); // Assumed className
    const side_b_s500 = countUnits(facilities, side_b_id, 'S-500'); // Assumed className
    // airbases not needed for now; FIXME
    // const side_a_airbase = airbases.filter((a: any) => a.sideId === side_a_id).length;
    // const side_b_airbase = airbases.filter((a: any) => a.sideId === side_b_id).length;
    
    // --- Doctrine / Rules of Engagement (ROE) ---
    // const side_a_doctrine = doctrine[side_a_id];
    // const side_b_doctrine = doctrine[side_b_id];
    // const side_a_roe_attack_and_chase = side_a_doctrine['Aircraft attack hostile aircraft'] && side_a_doctrine['Aircraft chase hostile aircraft'];
    // const side_b_roe_attack_and_chase = side_b_doctrine['Aircraft attack hostile aircraft'] && side_b_doctrine['Aircraft chase hostile aircraft'];
    // const side_a_roe_rtb_oor = side_a_doctrine['Aircraft RTB when out of range of homebase'];
    // const side_b_roe_rtb_oor = side_b_doctrine['Aircraft RTB when out of range of homebase'];
    // const side_a_roe_rtb_strike_complete = side_a_doctrine['Aircraft RTB when strike mission complete'];
    // const side_b_roe_rtb_strike_complete = side_b_doctrine['Aircraft RTB when strike mission complete'];

    // --- Mission Counts ---
    const side_a_total_missions = missions.filter((m: any) => m.sideId === side_a_id).length;
    const side_b_total_missions = missions.filter((m: any) => m.sideId === side_b_id).length;
    const side_a_patrol_missions = missions.filter((m: any) => m.sideId === side_a_id && m.name.includes('Patrol')).length;
    const side_b_patrol_missions = missions.filter((m: any) => m.sideId === side_b_id && m.name.includes('Patrol')).length;
    const side_a_strike_missions = missions.filter((m: any) => m.sideId === side_a_id && m.name.includes('Strike')).length;
    const side_b_strike_missions = missions.filter((m: any) => m.sideId === side_b_id && m.name.includes('Strike')).length;

    
    // Get outcomes from lastLine
    const jsonResult = JSON.parse(lastLine);
    const scenarioResult = jsonResult.currentScenario;
    const side_a_outcome = scenarioResult.sides[0].totalScore;
    const side_b_outcome = scenarioResult.sides[1].totalScore;

    const side_a_mission_success_rate = calculateMissionSuccessRateFromObject(scenarioResult, side_a_id);
    const side_b_mission_success_rate = calculateMissionSuccessRateFromObject(scenarioResult, side_b_id);
    // console.log(scenarioResult.endTime === scenarioResult.currentTime); // works!
    // only get outcome when simmulation ended [PORTAL]

    // this.processRecourseCsv();
    console.log(this.processRecourseCsv());



    // TODO: test hasGameEnded if it actually returns
    // two scenarios, one game ended time limit reached one not
    // two sc, one one side win, one no one won
    if (hasGameEnded) {
      console.log(scenarioResult.endTime === scenarioResult.currentTime); // works!
      
      console.log("Printing side mission_success_rate");
      console.log(side_a_mission_success_rate);
      console.log(side_b_mission_success_rate);
      
    }
    else {

    }
    
  }

  exportRecourseRecording(
    recordingEndTimeUnix: number,
    recordingStartTimeUnix: number = this.recordingStartTime,
    hasGameEnded: boolean
  ) {
    if (this.recording.length === 0) {
      return;
    }
    // non-empty, split the lines
    const lines = this.recording.trim().split('\n');
    const firstLine = lines[0];
    const lastLine = lines[lines.length - 1];
    // console.log(this.recording.split('\n')[0]); // this is the one
    this.processRecourseData(firstLine, lastLine, hasGameEnded);
        
    /*
    const jsonlDataStrUrl =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(this.recording.slice(0, -1));
    const downloadJsonlAnchorNode = document.createElement("a");
    downloadJsonlAnchorNode.setAttribute("href", jsonlDataStrUrl);
    const formattedRecordingStartTime = unixToLocalTime(
      recordingStartTimeUnix
    ).replace(/:/g, "");
    const formattedRecordingEndTime = unixToLocalTime(
      recordingEndTimeUnix
    ).replace(/:/g, "");
    const recordingFileTimespanSuffix = `${formattedRecordingStartTime} - ${formattedRecordingEndTime}`;
    downloadJsonlAnchorNode.setAttribute(
      "download",
      `${this.scenarioName} Recourse-Recording ${recordingFileTimespanSuffix}.jsonl`
    );
    document.body.appendChild(downloadJsonlAnchorNode); // required for firefox
    downloadJsonlAnchorNode.click();
    downloadJsonlAnchorNode.remove();
    */
  }
}

export default PlaybackRecorder;
