// src/game/engine/missionCompletionCalculator.ts

import Side from "@/game/Side.ts";
import Scenario from "@/game/Scenario";
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
    console.log(`${side.name} completed a successful patrol mission. Total Succeeded: ${side.missionsSucceeded}`);
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

/**
 * Calculates the mission success rate for a Side. 
 *  The calculation is as follows:
 *  missionSuccessRate = missionSuccessCount / totalCompletedMissionCount (arbitrary)
 * @param scenario The current game scenario.
 * @param sideId The side's ID that is being calculated.
 */
export function calculateSideMissionSuccessRate(scenario: Scenario, sideId: string) {
  const side = scenario.getSide(sideId);
  if (!side || side.missionsCompleted === 0) {
    return 0; // Return 0 if no missions are completed to avoid division by zero
  }

  return side.missionsSucceeded / side.missionsCompleted;
}