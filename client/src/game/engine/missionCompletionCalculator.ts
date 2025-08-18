// new file: src/game/engine/missionCompletionCalculator.ts

import Scenario from "@/game/Scenario";
import Airbase from "@/game/units/Airbase";
import Facility from "@/game/units/Facility";
import Aircraft from "@/game/units/Aircraft";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";
import PatrolMission from "@/game/mission/PatrolMission";
import StrikeMission from "@/game/mission/StrikeMission";

/**
 * Increments the success and completion counters for a side
 * after its strike mission succeeds (target destroyed).
 * @param scenario The current game scenario.
 * @param mission The successful strike mission.
 */
export function incrementStrikeMissionSuccess(scenario: Scenario, mission: StrikeMission) {
    const side = scenario.getSide(mission.sideId);
    if (side) {
        side.missionsCompleted = (side.missionsCompleted || 0) + 1;
        side.missionsSucceeded = (side.missionsSucceeded || 0) + 1;
        console.log(`${side.name} completed a successful strike mission. Total Succeeded: ${side.missionsSucceeded}`);
  }
}

/**
 * Increments the failure and completion counters for a side
 * after its strike mission fails (e.g., all attackers lost).
 * @param scenario The current game scenario.
 * @param mission The failed strike mission.
 */
export function incrementStrikeMissionFailure(scenario: Scenario, mission: StrikeMission) {
    const side = scenario.getSide(mission.sideId);
    if (side) {
        side.missionsCompleted = (side.missionsCompleted || 0) + 1;
        side.missionsFailed = (side.missionsFailed || 0) + 1;
        console.log(`${side.name} failed a strike mission. Total Failed: ${side.missionsFailed}`);
    }
}


/**
 * Increments the success counter for a side after it
 * successfully maintains a patrol for a set duration.
 * Note: This does not increment the main 'missionsCompleted' counter,
 * as the patrol mission is ongoing.
 * @param scenario The current game scenario.
 * @param mission The ongoing patrol mission.
 */
export function incrementPatrolPeriodSuccess(scenario: Scenario, mission: PatrolMission) {
  const side = scenario.getSide(mission.sideId);
  if (side) {
    // Each successful patrol period contributes to the success count.
    side.missionsSucceeded = (side.missionsSucceeded || 0) + 1;
    console.log(`${side.name} completed a patrol period. Total Succeeded: ${side.missionsSucceeded}`);
  }
}

/**
 * Increments the failure and completion counters for a side
 * after its patrol mission fails (all assigned units lost).
 * @param scenario The current game scenario.
 * @param mission The failed patrol mission.
 */
export function incrementPatrolMissionFailure(scenario: Scenario, mission: PatrolMission) {
    const side = scenario.getSide(mission.sideId);
    if (side) {
        side.missionsCompleted = (side.missionsCompleted || 0) + 1;
        side.missionsFailed = (side.missionsFailed || 0) + 1;
        console.log(`${side.name} failed a patrol mission. Total Failed: ${side.missionsFailed}`);
    }
}
