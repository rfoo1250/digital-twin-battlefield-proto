// new file: src/game/engine/ScoreCalculator.ts

import Scenario from "@/game/Scenario";
import Airbase from "@/game/units/Airbase";
import Facility from "@/game/units/Facility";
import Aircraft from "@/game/units/Aircraft";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";
import PatrolMission from "@/game/mission/PatrolMission";
import StrikeMission from "@/game/mission/StrikeMission";

type ScorableUnit = Aircraft | Ship | Facility | Airbase | Weapon;

// Change this if scoring system changes
const POINT_VALUES = {
    UNIT_DEFEATS_ENEMY: 50,
    FACILITY_DEFEATS_ENEMY: 30,
    UNIT_DEFEATED: -50,
    FACILITY_OR_AIRBASE_DEFEATED: -70,
    UNIT_OUT_OF_FUEL: -100,
    UNIT_SHOOT_DOWN_WEAPON: 10,
    WEAPON_INEFFECTIVE: -5,
    STRIKE_MISSION_SUCCESS: 200,
    PATROL_MISSION_TICK: 10, // time passed for patrol mission
};

/**
 * Processes the score change when one unit defeats another.
 * @param scenario The current game scenario.
 * @param victor The unit that won the engagement.
 * @param defeated The unit that was destroyed.
 */
export function processKill(scenario: Scenario, victor: ScorableUnit | null, defeated: ScorableUnit) {
    // Award points to the victor's side
    if (victor) {
        const victorSide = scenario.getSide(victor.sideId);
        if (victorSide) {
            
            if (victor instanceof Facility) {
                victorSide.totalScore += POINT_VALUES.FACILITY_DEFEATS_ENEMY;
            } else if (defeated instanceof Weapon) {
                victorSide.totalScore += POINT_VALUES.UNIT_SHOOT_DOWN_WEAPON;
                
            } else {
                victorSide.totalScore += POINT_VALUES.UNIT_DEFEATS_ENEMY;
            }
        }
    }
    
    // Deduct points from the defeated side
    const defeatedSide = scenario.getSide(defeated.sideId);
    if (defeatedSide) {
        if (defeated instanceof Facility || defeated instanceof Airbase) {
            defeatedSide.totalScore += POINT_VALUES.FACILITY_OR_AIRBASE_DEFEATED;
        } else {
            defeatedSide.totalScore += POINT_VALUES.UNIT_DEFEATED;
        }
    }
}

/**
 * Processes the score change when a unit runs out of fuel.
 * @param scenario The current game scenario.
 * @param unit The unit that ran out of fuel (must be an Aircraft or Ship).
 */
export function processFuelExhaustion(scenario: Scenario, unit: Aircraft | Ship) {
    const side = scenario.getSide(unit.sideId);
    if (side) {
        side.totalScore += POINT_VALUES.UNIT_OUT_OF_FUEL;
    }
}

/**
 * Processes the score change when a unit runs out of fuel.
 * @param scenario The current game scenario.
 * @param weapon The weapon that ran out of fuel (must be a Weapon).
 */
export function processWeaponIneffective(scenario: Scenario, unit: Weapon) {
    const side = scenario.getSide(unit.sideId);
    if (side) {
        side.totalScore += POINT_VALUES.WEAPON_INEFFECTIVE;
    }
}

/**
 * Awards points to a side for successfully completing a strike mission objective.
 * @param scenario The current game scenario.
 * @param mission The completed strike mission.
 */
export function processStrikeMissionSuccess(scenario: Scenario, mission: StrikeMission) {
    const side = scenario.getSide(mission.sideId);
    if (side) {
        side.totalScore += POINT_VALUES.STRIKE_MISSION_SUCCESS;
    }
}

/**
 * Awards points to a side for successfully maintaining a patrol for a set duration.
 * @param scenario The current game scenario.
 * @param mission The ongoing patrol mission.
 */
export function processPatrolMissionSuccess(scenario: Scenario, mission: PatrolMission) {
    const side = scenario.getSide(mission.sideId);
    if (side) {
        side.totalScore += POINT_VALUES.PATROL_MISSION_TICK;
    }
}