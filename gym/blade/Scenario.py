import json
from uuid import uuid4

from blade.units.Aircraft import Aircraft
from blade.units.Ship import Ship
from blade.units.Facility import Facility
from blade.units.Airbase import Airbase
from blade.units.Weapon import Weapon
from blade.units.ReferencePoint import ReferencePoint
from blade.Side import Side
from blade.mission.PatrolMission import PatrolMission
from blade.mission.StrikeMission import StrikeMission
from blade.utils.utils import get_distance_between_two_points
from blade.utils.colors import SIDE_COLOR
from blade.Relationships import Relationships
from blade.Doctrine import Doctrine, DoctrineType, SideDoctrine

HomeBase = Airbase | Ship
Target = Aircraft | Facility | Weapon | Airbase | Ship
Mission = PatrolMission | StrikeMission


class Scenario:
    def __init__(
        self,
        id: str = "",
        name: str = "",
        start_time: int = 0,
        duration: int = 1,
        sides: list[Side] = [],
        current_time: int = None,
        end_time: int = None,
        time_compression: int = 1,
        aircraft: list[Aircraft] = None,
        ships: list[Ship] = None,
        facilities: list[Facility] = None,
        airbases: list[Airbase] = None,
        weapons: list[Weapon] = None,
        reference_points: list[ReferencePoint] = None,
        missions: list[Mission] = None,
        relationships: Relationships = None,
        doctrine: Doctrine = None,
    ):
        self.id = id
        self.name = name
        self.start_time = start_time
        self.current_time = current_time if current_time is not None else start_time
        self.duration = duration
        self.end_time = end_time if end_time is not None else self.start_time + self.duration
        self.sides = sides if sides is not None else []
        self.time_compression = time_compression
        self.aircraft = aircraft if aircraft is not None else []
        self.ships = ships if ships is not None else []
        self.facilities = facilities if facilities is not None else []
        self.airbases = airbases if airbases is not None else []
        self.weapons = weapons if weapons is not None else []
        self.reference_points = reference_points if reference_points is not None else []
        self.missions = missions if missions is not None else []
        self.relationships = relationships if relationships is not None else Relationships({})
        self.doctrine = doctrine if doctrine is not None else self.get_default_doctrine()

    def get_default_doctrine(self) -> Doctrine:
        default_doctrine: Doctrine = {}
        for side in self.sides:
            default_doctrine[side.id] = self.get_default_side_doctrine()
        return default_doctrine

    def get_default_side_doctrine(self) -> SideDoctrine:
        return {
            DoctrineType.AIRCRAFT_ATTACK_HOSTILE: True,
            DoctrineType.AIRCRAFT_CHASE_HOSTILE: True,
            DoctrineType.AIRCRAFT_RTB_WHEN_OUT_OF_RANGE: False,
            DoctrineType.AIRCRAFT_RTB_WHEN_STRIKE_MISSION_COMPLETE: False,
            DoctrineType.SAM_ATTACK_HOSTILE: True,
            DoctrineType.SHIP_ATTACK_HOSTILE: True,
        }

    def get_side_doctrine(self, side_id: str) -> SideDoctrine:
        if side_id not in self.doctrine:
            self.doctrine[side_id] = self.get_default_side_doctrine()
        return self.doctrine[side_id]

    def check_side_doctrine(self, side_id: str, doctrine_type: DoctrineType) -> bool:
        if side_id not in self.doctrine:
            return False
        return self.doctrine[side_id].get(doctrine_type, False)

    def update_side_doctrine(self, side_id: str, side_doctrine: SideDoctrine = None) -> None:
        if side_id not in self.doctrine:
            self.doctrine[side_id] = self.get_default_side_doctrine()
        if side_doctrine:
            for key, value in side_doctrine.items():
                if key in self.doctrine[side_id]:
                    self.doctrine[side_id][key] = value

    def remove_side_doctrine(self, side_id: str) -> None:
        if side_id in self.doctrine:
            del self.doctrine[side_id]

    def get_side(self, side_id: str | None) -> Side | None:
        return next((side for side in self.sides if side.id == side_id), None)

    def get_side_name(self, side_id: str | None) -> str:
        side = self.get_side(side_id)
        return side.name if side else "N/A"

    def get_side_color(self, side_id: str | None) -> SIDE_COLOR:
        side = self.get_side(side_id)
        return side.color if side else SIDE_COLOR.BLACK

    def get_aircraft(self, aircraft_id: str) -> Aircraft | None:
        return next((ac for ac in self.aircraft if ac.id == aircraft_id), None)

    def get_facility(self, facility_id: str) -> Facility | None:
        return next((f for f in self.facilities if f.id == facility_id), None)

    def get_airbase(self, airbase_id: str) -> Airbase | None:
        return next((ab for ab in self.airbases if ab.id == airbase_id), None)

    def get_ship(self, ship_id: str) -> Ship | None:
        return next((s for s in self.ships if s.id == ship_id), None)

    def get_weapon(self, weapon_id: str) -> Weapon | None:
        return next((w for w in self.weapons if w.id == weapon_id), None)

    def get_target(self, target_id: str) -> Target | None:
        all_targets = self.aircraft + self.ships + self.facilities + self.airbases + self.weapons
        return next((t for t in all_targets if t.id == target_id), None)

    def get_reference_point(self, reference_point_id: str) -> ReferencePoint | None:
        return next((rp for rp in self.reference_points if rp.id == reference_point_id), None)

    def get_patrol_mission(self, mission_id: str) -> PatrolMission | None:
        return next((m for m in self.missions if isinstance(m, PatrolMission) and m.id == mission_id), None)

    def get_strike_mission(self, mission_id: str) -> StrikeMission | None:
        return next((m for m in self.missions if isinstance(m, StrikeMission) and m.id == mission_id), None)

    def get_all_patrol_missions(self) -> list[PatrolMission]:
        return [m for m in self.missions if isinstance(m, PatrolMission)]

    def get_all_strike_missions(self) -> list[StrikeMission]:
        return [m for m in self.missions if isinstance(m, StrikeMission)]

    def get_mission_by_assigned_unit_id(self, unit_id: str) -> Mission | None:
        return next((m for m in self.missions if unit_id in m.assigned_unit_ids), None)

    def update_scenario_name(self, name: str):
        self.name = name

    def delete_weapon_from_aircraft(self, aircraft_id: str, weapon_id: str) -> list[Weapon]:
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft:
            aircraft.weapons = [w for w in aircraft.weapons if w.id != weapon_id]
            return aircraft.weapons
        return []

    def update_aircraft_weapon_quantity(self, aircraft_id: str, weapon_id: str, increment: int) -> list[Weapon]:
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft:
            weapon = next((w for w in aircraft.weapons if w.id == weapon_id), None)
            if weapon:
                weapon.current_quantity += increment
                if weapon.current_quantity < 0:
                    weapon.current_quantity = 0
            return aircraft.weapons
        return []

    def add_weapon_to_aircraft(self, aircraft_id: str, **kwargs) -> list[Weapon]:
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft:
            weapon_class_name = kwargs.get("weapon_class_name")
            if not weapon_class_name or any(w.class_name == weapon_class_name for w in aircraft.weapons):
                return aircraft.weapons
            
            new_weapon = Weapon(
                id=str(uuid4()),
                launcher_id="None",
                name=weapon_class_name,
                side_id=aircraft.side_id,
                class_name=weapon_class_name,
                latitude=0.0, longitude=0.0, altitude=10000.0, heading=90.0,
                speed=kwargs.get("weapon_speed", 0),
                current_fuel=kwargs.get("weapon_max_fuel", 0),
                max_fuel=kwargs.get("weapon_max_fuel", 0),
                fuel_rate=kwargs.get("weapon_fuel_rate", 0),
                range=100,
                side_color=aircraft.side_color,
                target_id=None,
                lethality=kwargs.get("weapon_lethality", 0),
                max_quantity=1,
                current_quantity=1,
            )
            aircraft.weapons.append(new_weapon)
        return aircraft.weapons if aircraft else []

    def update_aircraft(self, aircraft_id: str, **kwargs):
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft:
            for key, value in kwargs.items():
                if hasattr(aircraft, key):
                    setattr(aircraft, key, value)

    def update_facility(self, facility_id: str, **kwargs):
        facility = self.get_facility(facility_id)
        if facility:
            for key, value in kwargs.items():
                if hasattr(facility, key):
                    setattr(facility, key, value)

    def update_airbase(self, airbase_id: str, airbase_name: str):
        airbase = self.get_airbase(airbase_id)
        if airbase:
            airbase.name = airbase_name

    def update_ship(self, ship_id: str, **kwargs):
        ship = self.get_ship(ship_id)
        if ship:
            for key, value in kwargs.items():
                if hasattr(ship, key):
                    setattr(ship, key, value)

    def update_aircraft(
        self,
        aircraft_id: str,
        aircraft_name: str,
        aircraft_class_name: str,
        aircraft_speed: float,
        aircraft_current_fuel: float,
        aircraft_fuel_rate: float,
    ):
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft is not None:
            aircraft.name = aircraft_name
            aircraft.class_name = aircraft_class_name
            aircraft.speed = aircraft_speed
            aircraft.current_fuel = aircraft_current_fuel
            aircraft.fuel_rate = aircraft_fuel_rate

    def update_facility(
        self,
        facility_id: str,
        facility_name: str,
        facility_class_name: str,
        facility_range: float,
    ):
        facility = self.get_facility(facility_id)
        if facility is not None:
            facility.name = facility_name
            facility.class_name = facility_class_name
            facility.range = facility_range

    def update_airbase(
        self,
        airbase_id: str,
        airbase_name: str,
    ):
        airbase = self.get_airbase(airbase_id)
        if airbase is not None:
            airbase.name = airbase_name

    def update_ship(
        self,
        ship_id: str,
        ship_name: str,
        ship_class_name: str,
        ship_speed: float,
        ship_current_fuel: float,
        ship_fuel_rate: float,
        ship_range: float,
    ):
        ship = self.get_ship(ship_id)
        if ship is not None:
            ship.name = ship_name
            ship.class_name = ship_class_name
            ship.speed = ship_speed
            ship.current_fuel = ship_current_fuel
            ship.fuel_rate = ship_fuel_rate
            ship.range = ship_range

    def update_reference_point(
        self,
        reference_point_id: str,
        reference_point_name: str,
    ):
        reference_point = self.get_reference_point(reference_point_id)
        if reference_point is not None:
            reference_point.name = reference_point_name

    def get_aircraft_homebase(self, aircraft_id: str) -> HomeBase | None:
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft is not None:
            base = self.get_airbase(aircraft.home_base_id)
            if base is not None:
                return base
            else:
                ship = self.get_ship(aircraft.home_base_id)
                if ship is not None:
                    return ship
        return None

    def get_closest_base_to_aircraft(self, aircraft_id: str) -> HomeBase | None:
        aircraft = self.get_aircraft(aircraft_id)
        if aircraft is not None:
            closest_base = None
            closest_distance = float("inf")
            for base in self.airbases + self.ships:
                if base.side_id != aircraft.side_id:
                    continue
                distance = get_distance_between_two_points(
                    aircraft.latitude, aircraft.longitude, base.latitude, base.longitude
                )
                if distance < closest_distance:
                    closest_base = base
                    closest_distance = distance
            return closest_base
        return None

    def get_all_targets_from_enemy_sides(self, side_id: str) -> Target:
        targets = []
        for aircraft in self.aircraft:
            if self.is_hostile(aircraft.side_id, side_id):
                targets.append(aircraft)
        for facility in self.facilities:
            if self.is_hostile(facility.side_id, side_id):
                targets.append(facility)
        for ship in self.ships:
            if self.is_hostile(ship.side_id, side_id):
                targets.append(ship)
        for airbase in self.airbases:
            if self.is_hostile(airbase.side_id, side_id):
                targets.append(airbase)
        return targets

    def is_hostile(self, side_id: str, target_id: str) -> bool:
        return self.relationships.is_hostile(side_id, target_id)

    def to_dict(self):
        def serialize(obj):
            if hasattr(obj, "to_dict"):
                return obj.to_dict()
            elif isinstance(obj, list):
                return [serialize(item) for item in obj]
            elif isinstance(obj, dict):
                return {key: serialize(value) for key, value in obj.items()}
            else:
                return obj

        return serialize(self.__dict__)

    def toJson(self):
        return json.dumps(self.to_dict(), sort_keys=True, indent=4)