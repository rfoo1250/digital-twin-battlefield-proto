from typing import Union
from blade.Scenario import Scenario
from blade.units.Aircraft import Aircraft
from blade.units.Airbase import Airbase
from blade.units.Facility import Facility
from blade.units.Ship import Ship

# Define a type alias for units that can be considered casualties
CasualtyUnit = Union[Aircraft, Ship, Facility, Airbase]

def increment_casualty(scenario: Scenario, lost_unit: CasualtyUnit):
    """
    Increments the casualty counter for a side when one of its units is lost.
    
    Args:
        scenario (Scenario): The current game scenario.
        lost_unit (CasualtyUnit): The unit that was destroyed.
    """
    side = scenario.get_side(lost_unit.side_id)
    if side:
        side.casualties = getattr(side, 'casualties', 0) + 1
        print(f"{side.name} suffered a casualty. Total Casualties: {side.casualties}")
