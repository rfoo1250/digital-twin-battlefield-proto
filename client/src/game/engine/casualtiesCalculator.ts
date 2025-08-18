// src/game/engine/casualtiesCalculator.ts

import Scenario from "@/game/Scenario";
import Aircraft from "@/game/units/Aircraft";
import Airbase from "@/game/units/Airbase";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";

// Define a type that includes all units that can be considered casualties
type CasualtyUnit = Aircraft | Ship | Facility | Airbase;

/**
 * Increments the casualty counter for a side when one of its units is lost.
 * @param scenario The current game scenario.
 * @param lostUnit The unit that was destroyed.
 */
export function incrementCasualty(scenario: Scenario, lostUnit: CasualtyUnit) {
    const side = scenario.getSide(lostUnit.sideId);
    if (side) {
        side.casualties = (side.casualties || 0) + 1;
        console.log(`${side.name} suffered a casualty. Total Casualties: ${side.casualties}`);
    }
}
