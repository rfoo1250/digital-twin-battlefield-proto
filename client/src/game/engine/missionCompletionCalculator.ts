// src/game/engine/missionCompletionCalculator.ts

import Side from "@/game/Side.ts";
import Scenario from "@/game/Scenario";
import PatrolMission from "@/game/mission/PatrolMission";
import StrikeMission from "@/game/mission/StrikeMission";

/**
 * Checks if the side has completed all assigned missions
 * @param Scenario current scenario object
 * @param sideId id of concerned side
 * @returns boolean
*/
export function areAllMissionsCompleteFromScenario(scenario: Scenario, sideId: string): boolean {
  const side = scenario.getSide(sideId);
  if (side && side.missionsCompleted === side.missionsAssigned) {
    return true;
  }

  return false;
}

/**
 * Checks if the side has completed all assigned missions
 * @param Side object
 * @returns boolean all assigned missions are complete 
 */
export function areAllMissionsCompleteFromSide(side: Side): boolean {
  
  if (side 
    && side.missionsCompleted > 0
    && side.missionsCompleted === side.missionsAssigned) {
    return true;
  }

  return false;
}

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
    // console.log(`${side.name} completed a successful strike mission. Total Succeeded: ${side.missionsSucceeded}`);
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
    // console.log(`${side.name} failed a strike mission. Total Failed: ${side.missionsFailed}`);
  }
}


/**
 * Increments the success and completion counters for a side
 * after its patrol mission succeeds.
 * @param scenario The current game scenario.
 * @param mission The successful patrol mission.
 */
export function incrementPatrolMissionSuccess(scenario: Scenario, mission: PatrolMission) {
  const side = scenario.getSide(mission.sideId);
  if (side) {
    side.missionsCompleted = (side.missionsCompleted || 0) + 1; // This line was added
    side.missionsSucceeded = (side.missionsSucceeded || 0) + 1;
    // console.log(`${side.name} completed a successful patrol mission. Total Succeeded: ${side.missionsSucceeded}`);
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
    // console.log(`${side.name} failed a patrol mission. Total Failed: ${side.missionsFailed}`);
  }
}

/**
 * Calculates the mission success rate for a Side. 
 * The calculation is as follows:
 *     missionSuccessRate = missionSuccessCount / totalCompletedMissionCount (arbitrary)
 * This function uses live Scenario instance.
 * @param scenario The final scenario state as a plain object.
 * @param sideId The ID of the side to calculate the rate for.
 * @returns The mission success rate as a percentage (0-100).
 */
export function calculateSideMissionSuccessRate(side: Side): number {

  if (!side || !side.missionsCompleted || side.missionsCompleted === 0) {
    return 0.0;
  }
    
  return side.missionsSucceeded / side.missionsCompleted;
}

/**
 * Calculates the mission success rate for a Side. 
 * The calculation is as follows:
 *     missionSuccessRate = missionSuccessCount / totalCompletedMissionCount (arbitrary)
 * This function is designed to work with a plain JSON object, not a Scenario class instance.
 * @param scenario The final scenario state as a plain object.
 * @param sideId The ID of the side to calculate the rate for.
 * @returns The mission success rate as a percentage (0-100).
 */
export function calculateMissionSuccessRateFromObject(scenario: any, sideId: string): number {
  const side = scenario.sides.find((s: any) => s.id === sideId);

  if (!side || !side.missionsCompleted || side.missionsCompleted === 0) {
    return 0.0;
  }

  return side.missionsSucceeded / side.missionsCompleted;
}