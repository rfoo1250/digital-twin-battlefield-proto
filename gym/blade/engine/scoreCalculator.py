from typing import Union, Optional
from blade.Scenario import Scenario
from blade.units.Airbase import Airbase
from blade.units.Facility import Facility
from blade.units.Aircraft import Aircraft
from blade.units.Ship import Ship
from blade.units.Weapon import Weapon
from blade.mission.PatrolMission import PatrolMission
from blade.mission.StrikeMission import StrikeMission

# Type alias for units that can be scored
ScorableUnit = Union[Aircraft, Ship, Facility, Airbase, Weapon]

# Point values for scoring events
POINT_VALUES = {
    "UNIT_DEFEATS_ENEMY": 50,
    "FACILITY_DEFEATS_ENEMY": 30,
    "UNIT_DEFEATED": -50,
    "FACILITY_OR_AIRBASE_DEFEATED": -70,
    "UNIT_OUT_OF_FUEL": -100,
    "UNIT_SHOOT_DOWN_WEAPON": 10,
    "WEAPON_INEFFECTIVE": -5,
    "STRIKE_MISSION_SUCCESS": 200,
    "PATROL_MISSION_TICK": 10,  # time passed for patrol mission
}

def process_kill(scenario: Scenario, victor: Optional[ScorableUnit], defeated: ScorableUnit):
    """
    Processes the score change when one unit defeats another.
    """
    # Award points to the victor's side
    if victor:
        victor_side = scenario.get_side(victor.side_id)
        if victor_side:
            if isinstance(victor, Facility):
                victor_side.total_score += POINT_VALUES["FACILITY_DEFEATS_ENEMY"]
            elif isinstance(defeated, Weapon):
                victor_side.total_score += POINT_VALUES["UNIT_SHOOT_DOWN_WEAPON"]
            else:
                victor_side.total_score += POINT_VALUES["UNIT_DEFEATS_ENEMY"]

    # Deduct points from the defeated side
    defeated_side = scenario.get_side(defeated.side_id)
    if defeated_side:
        if isinstance(defeated, (Facility, Airbase)):
            defeated_side.total_score += POINT_VALUES["FACILITY_OR_AIRBASE_DEFEATED"]
        else:
            defeated_side.total_score += POINT_VALUES["UNIT_DEFEATED"]

def process_fuel_exhaustion(scenario: Scenario, unit: Union[Aircraft, Ship]):
    """
    Processes the score change when a unit runs out of fuel.
    """
    side = scenario.get_side(unit.side_id)
    if side:
        side.total_score += POINT_VALUES["UNIT_OUT_OF_FUEL"]

def process_weapon_ineffective(scenario: Scenario, weapon: Weapon):
    """
    Processes the score change when a weapon runs out of fuel.
    """
    side = scenario.get_side(weapon.side_id)
    if side:
        side.total_score += POINT_VALUES["WEAPON_INEFFECTIVE"]

def process_strike_mission_success(scenario: Scenario, mission: StrikeMission):
    """
    Awards points for a successful strike mission.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.total_score += POINT_VALUES["STRIKE_MISSION_SUCCESS"]

def process_patrol_mission_success(scenario: Scenario, mission: PatrolMission):
    """
    Awards points for maintaining a patrol mission.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.total_score += POINT_VALUES["PATROL_MISSION_TICK"]
