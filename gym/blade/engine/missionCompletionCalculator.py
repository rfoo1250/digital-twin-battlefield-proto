from typing import Dict, Any, List, Optional

from sympy import false, true
from blade.Side import Side
from blade.Scenario import Scenario
from blade.mission.PatrolMission import PatrolMission
from blade.mission.StrikeMission import StrikeMission

def are_all_missions_complete(side: Side):
    """
    Checks if the side has completed all assigned missions
    Takes in Side
    Returns boolean
    """
    if side and side.missions_completed == side.missions_assigned:
        return true
    
    return false
        

# --- Mission Success/Failure Counters ---

def increment_strike_mission_success(scenario: Scenario, mission: StrikeMission):
    """
    Increments the success and completion counters for a side
    after its strike mission succeeds.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.missions_completed = getattr(side, 'missions_completed', 0) + 1
        side.missions_succeeded = getattr(side, 'missions_succeeded', 0) + 1
        print(f"{side.name} completed a successful strike mission. Total Succeeded: {side.missions_succeeded}")

def increment_strike_mission_failure(scenario: Scenario, mission: StrikeMission):
    """
    Increments the failure and completion counters for a side
    after its strike mission fails.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.missions_completed = getattr(side, 'missions_completed', 0) + 1
        side.missions_failed = getattr(side, 'missions_failed', 0) + 1
        print(f"{side.name} failed a strike mission. Total Failed: {side.missions_failed}")

def increment_patrol_mission_success(scenario: Scenario, mission: PatrolMission):
    """
    Increments the success and completion counters for a side
    after its patrol mission succeeds.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.missions_completed = getattr(side, 'missions_completed', 0) + 1
        side.missions_succeeded = getattr(side, 'missions_succeeded', 0) + 1
        print(f"{side.name} completed a successful patrol mission. Total Succeeded: {side.missions_succeeded}")

def increment_patrol_mission_failure(scenario: Scenario, mission: PatrolMission):
    """
    Increments the failure and completion counters for a side
    after its patrol mission fails.
    """
    side = scenario.get_side(mission.side_id)
    if side:
        side.missions_completed = getattr(side, 'missions_completed', 0) + 1
        side.missions_failed = getattr(side, 'missions_failed', 0) + 1
        print(f"{side.name} failed a patrol mission. Total Failed: {side.missions_failed}")

# --- Success Rate Calculators ---

def calculate_side_mission_success_rate(side: Side) -> float:
    """
    Calculates the mission success rate for a Side using live Scenario instances.
    Returns the rate as a float between 0.0 and 1.0.
    """
    if not side or getattr(side, 'missions_completed', 0) == 0:
        return 0.0
    
    missions_succeeded = getattr(side, 'missions_succeeded', 0)
    missions_completed = getattr(side, 'missions_completed', 0)
    
    return missions_succeeded / missions_completed

def calculate_mission_success_rate_from_object(scenario_obj: Dict[str, Any], side_id: str) -> float:
    """
    Calculates mission success rate from a plain dictionary representation of a scenario.
    Returns the rate as a float between 0.0 and 1.0.
    """
    side_data = next((s for s in scenario_obj.get("sides", []) if s.get("id") == side_id), None)

    if not side_data:
        return 0.0
    
    missions_completed = side_data.get("missionsCompleted", 0)
    missions_succeeded = side_data.get("missionsSucceeded", 0)

    if missions_completed == 0:
        return 0.0
        
    return missions_succeeded / missions_completed
