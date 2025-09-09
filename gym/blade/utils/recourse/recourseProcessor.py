import json
import csv
import os
from typing import List, Dict, Any, Optional
from blade.engine.missionCompletionCalculator import calculate_mission_success_rate_from_object

def process_data(first_line: str, last_line: str, has_game_ended: bool) -> Optional[Dict[str, Any]]:
    """
    Extracts features and calculates outcomes from the initial and final
    states of a game recording.

    Args:
        first_line (str): The first JSON string line of the recording (initial state).
        last_line (str): The last JSON string line of the recording (final state).

    Returns:
        Optional[Dict[str, Any]]: A dictionary of features and outcomes, or None on error.
    """
    try:
        # --- 1. Extract Features from Game Data ---
        initial_state = json.loads(first_line)
        final_state = json.loads(last_line)

        scenario = initial_state.get("currentScenario", {})
        sides = scenario.get("sides", [])
        if not sides or len(sides) < 2:
            print("Error: Invalid side data in initial state.")
            return None

        side_a_id = sides[0].get("id")
        side_b_id = sides[1].get("id")

        # Helper to count units by class and side
        def count_units(units: List[Dict], side_id: str, class_name: str) -> int:
            return sum(1 for u in units if u.get("sideId") == side_id and u.get("className") == class_name)

        # Extract all unit counts and features from the initial state
        aircraft = scenario.get("aircraft", [])
        ships = scenario.get("ships", [])
        facilities = scenario.get("facilities", [])
        airbases = scenario.get("airbases", [])
        missions = scenario.get("missions", [])

        # --- Feature Dictionary ---
        features = {
            # --- Overall Counts ---
            "side_a_total_ships": sum(1 for s in ships if s.get("sideId") == side_a_id),
            "side_b_total_ships": sum(1 for s in ships if s.get("sideId") == side_b_id),
            "side_a_total_planes": sum(1 for a in aircraft if a.get("sideId") == side_a_id),
            "side_b_total_planes": sum(1 for a in aircraft if a.get("sideId") == side_b_id),
            "side_a_total_sam_sites": sum(1 for f in facilities if f.get("sideId") == side_a_id),
            "side_b_total_sam_sites": sum(1 for f in facilities if f.get("sideId") == side_b_id),
            "side_a_total_airbases": sum(1 for a in airbases if a.get("sideId") == side_a_id),
            "side_b_total_airbases": sum(1 for a in airbases if a.get("sideId") == side_b_id),

            # --- Total Fuel ---
            "side_a_total_fuel_available": sum(u.get("currentFuel", 0) for u in aircraft + ships if u.get("sideId") == side_a_id),
            "side_b_total_fuel_available": sum(u.get("currentFuel", 0) for u in aircraft + ships if u.get("sideId") == side_b_id),

            # --- Specific Ship Counts ---
            "side_a_aircraft_carrier": count_units(ships, side_a_id, "Aircraft Carrier"),
            "side_b_aircraft_carrier": count_units(ships, side_b_id, "Aircraft Carrier"),
            "side_a_destroyer": count_units(ships, side_a_id, "Destroyer"),
            "side_b_destroyer": count_units(ships, side_b_id, "Destroyer"),
            "side_a_frigate": count_units(ships, side_a_id, "Frigate"),
            "side_b_frigate": count_units(ships, side_b_id, "Frigate"),
            "side_a_corvette": count_units(ships, side_a_id, "Corvette"),
            "side_b_corvette": count_units(ships, side_b_id, "Corvette"),
            "side_a_amphibious_assault_ship": count_units(ships, side_a_id, "Amphibious Assault Ship"),
            "side_b_amphibious_assault_ship": count_units(ships, side_b_id, "Amphibious Assault Ship"),
            "side_a_patrol_boat": count_units(ships, side_a_id, "Patrol Boat"),
            "side_b_patrol_boat": count_units(ships, side_b_id, "Patrol Boat"),

            # --- Specific Aircraft Counts ---
            "side_a_f35a_lightning_ii": count_units(aircraft, side_a_id, "F-35A Lightning II"),
            "side_b_f35a_lightning_ii": count_units(aircraft, side_b_id, "F-35A Lightning II"),
            "side_a_kc135r_stratotanker": count_units(aircraft, side_a_id, "KC-135R Stratotanker"),
            "side_b_kc135r_stratotanker": count_units(aircraft, side_b_id, "KC-135R Stratotanker"),
            "side_a_a10c_thunderbolt_ii": count_units(aircraft, side_a_id, "A-10C Thunderbolt II"),
            "side_b_a10c_thunderbolt_ii": count_units(aircraft, side_b_id, "A-10C Thunderbolt II"),
            "side_a_b2_spirit": count_units(aircraft, side_a_id, "B-2 Spirit"),
            "side_b_b2_spirit": count_units(aircraft, side_b_id, "B-2 Spirit"),
            "side_a_f22_raptor": count_units(aircraft, side_a_id, "F-22 Raptor"),
            "side_b_f22_raptor": count_units(aircraft, side_b_id, "F-22 Raptor"),
            "side_a_c130_hercules": count_units(aircraft, side_a_id, "C-130 Hercules"),
            "side_b_c130_hercules": count_units(aircraft, side_b_id, "C-130 Hercules"),
            "side_a_c17_globemaster_iii": count_units(aircraft, side_a_id, "C-17 Globemaster III"),
            "side_b_c17_globemaster_iii": count_units(aircraft, side_b_id, "C-17 Globemaster III"),
            "side_a_f16_fighting_falcon": count_units(aircraft, side_a_id, "F-16 Fighting Falcon"),
            "side_b_f16_fighting_falcon": count_units(aircraft, side_b_id, "F-16 Fighting Falcon"),
            "side_a_e3_sentry": count_units(aircraft, side_a_id, "E-3 Sentry"),
            "side_b_e3_sentry": count_units(aircraft, side_b_id, "E-3 Sentry"),
            "side_a_p8_poseidon": count_units(aircraft, side_a_id, "P-8 Poseidon"),
            "side_b_p8_poseidon": count_units(aircraft, side_b_id, "P-8 Poseidon"),
            "side_a_f14_tomcat": count_units(aircraft, side_a_id, "F-14 Tomcat"),
            "side_b_f14_tomcat": count_units(aircraft, side_b_id, "F-14 Tomcat"),
            "side_a_f4_phantom": count_units(aircraft, side_a_id, "F-4 Phantom II"),
            "side_b_f4_phantom": count_units(aircraft, side_b_id, "F-4 Phantom II"),
            "side_a_f15_eagle": count_units(aircraft, side_a_id, "F-15 Eagle"),
            "side_b_f15_eagle": count_units(aircraft, side_b_id, "F-15 Eagle"),
            "side_a_c12_huron": count_units(aircraft, side_a_id, "C-12 Huron"),
            "side_b_c12_huron": count_units(aircraft, side_b_id, "C-12 Huron"),
            "side_a_b52": count_units(aircraft, side_a_id, "B-52 Stratofortress"),
            "side_b_b52": count_units(aircraft, side_b_id, "B-52 Stratofortress"),

            # --- Specific SAM Site Counts ---
            "side_a_s400_triumf": count_units(facilities, side_a_id, "S-400 Triumf"),
            "side_b_s400_triumf": count_units(facilities, side_b_id, "S-400 Triumf"),
            "side_a_mim104_patriot": count_units(facilities, side_a_id, "MIM-104 Patriot"),
            "side_b_mim104_patriot": count_units(facilities, side_b_id, "MIM-104 Patriot"),
            "side_a_s300": count_units(facilities, side_a_id, "S-300"),
            "side_b_s300": count_units(facilities, side_b_id, "S-300"),
            "side_a_s500": count_units(facilities, side_a_id, "S-500"),
            "side_b_s500": count_units(facilities, side_b_id, "S-500"),

            # --- Mission Counts ---
            "side_a_total_missions": sum(1 for m in missions if m.get("sideId") == side_a_id),
            "side_b_total_missions": sum(1 for m in missions if m.get("sideId") == side_b_id),
            "side_a_patrol_missions": sum(1 for m in missions if m.get("sideId") == side_a_id and "Patrol" in m.get("name", "")),
            "side_b_patrol_missions": sum(1 for m in missions if m.get("sideId") == side_b_id and "Patrol" in m.get("name", "")),
            "side_a_strike_missions": sum(1 for m in missions if m.get("sideId") == side_a_id and "Strike" in m.get("name", "")),
            "side_b_strike_missions": sum(1 for m in missions if m.get("sideId") == side_b_id and "Strike" in m.get("name", "")),
        }

        # --- 2. Calculate Outcomes ---
        if (has_game_ended):
            scenario_result = final_state.get("currentScenario", {})
            # print("[DEBUG] scenario_result:", scenario_result)

            sides_result = scenario_result.get("sides", [])
            print("[DEBUG] sides_result:", sides_result)

            side_a_mission_success_rate = calculate_mission_success_rate_from_object(scenario_result, side_a_id)
            side_b_mission_success_rate = calculate_mission_success_rate_from_object(scenario_result, side_b_id)
            print(f"[DEBUG] Side A mission success rate: {side_a_mission_success_rate}")
            print(f"[DEBUG] Side B mission success rate: {side_b_mission_success_rate}")

            side_a_initial_units = (
                features["side_a_total_ships"]
                + features["side_a_total_planes"]
                + features["side_a_total_sam_sites"]
                + features["side_a_total_airbases"]
            )
            side_b_initial_units = (
                features["side_b_total_ships"]
                + features["side_b_total_planes"]
                + features["side_b_total_sam_sites"]
                + features["side_b_total_airbases"]
            )
            print(f"[DEBUG] Side A initial units: {side_a_initial_units}")
            print(f"[DEBUG] Side B initial units: {side_b_initial_units}")

            side_a_casualties = sides_result[0].get("casualties", 0) if len(sides_result) > 0 else 0
            side_b_casualties = sides_result[1].get("casualties", 0) if len(sides_result) > 1 else 0
            print(f"[DEBUG] Side A casualties: {side_a_casualties}")
            print(f"[DEBUG] Side B casualties: {side_b_casualties}")

            side_a_casualty_rate = (side_a_casualties / side_a_initial_units) if side_a_initial_units > 0 else 0
            side_b_casualty_rate = (side_b_casualties / side_b_initial_units) if side_b_initial_units > 0 else 0
            print(f"[DEBUG] Side A casualty rate: {side_a_casualty_rate:.2f}")
            print(f"[DEBUG] Side B casualty rate: {side_b_casualty_rate:.2f}")

            # Outcome Logic
            features["side_a_outcome"] = 1 if side_a_casualty_rate < 0.5 and side_a_mission_success_rate > 0.75 else 0
            features["side_b_outcome"] = 1 if side_b_casualty_rate < 0.5 and side_b_mission_success_rate > 0.75 else 0
            print(f"[DEBUG] Side A outcome: {features['side_a_outcome']}")
            print(f"[DEBUG] Side B outcome: {features['side_b_outcome']}")

        else:
            print("Game has NOT ended!") # should be has_game_ended=True, something is wrong
            features["side_a_outcome"] = 0
            features["side_b_outcome"] = 0

        return features

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during data processing: {e}")
        return None

def generate_recourse_csv(recording_export_path: str, first_line: str, last_line: str, has_game_ended: bool):
    """
    Processes game data to generate a new data row and appends it to a CSV file.

    Args:
        first_line (str): The first JSON string line of the recording.
        last_line (str): The last JSON string line of the recording.
    """
    # --- 1. Process Data ---
    new_data_row = process_data(first_line, last_line, has_game_ended)

    if not new_data_row:
        print("Halting CSV generation due to data processing error.")
        return

    # --- 2. Read Existing CSV and Append New Data ---

    CSV_FILE_PATH = os.path.join(recording_export_path, "algo_recourse_results.csv")

    try:
        headers = list(new_data_row.keys())
        # Ensure outcome keys are first for readability
        headers.insert(0, headers.pop(headers.index("side_b_outcome")))
        headers.insert(0, headers.pop(headers.index("side_a_outcome")))

        os.makedirs(os.path.dirname(CSV_FILE_PATH), exist_ok=True)
        
        file_exists = os.path.isfile(CSV_FILE_PATH)
        
        with open(CSV_FILE_PATH, mode='a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            if not file_exists:
                writer.writeheader()
            writer.writerow(new_data_row)
            
        print(f"Recourse data successfully appended to '{os.path.abspath(CSV_FILE_PATH)}'")
    
    except Exception as e:
        print(f"An unexpected error occurred during CSV file operation: {e}")
