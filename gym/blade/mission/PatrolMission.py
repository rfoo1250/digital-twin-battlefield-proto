import json
from typing import List, Optional
from random import random
from shapely.geometry import Point, Polygon
from blade.units.ReferencePoint import ReferencePoint


class PatrolMission:

    def __init__(
        self,
        id: str,
        name: str,
        side_id: str,
        assigned_unit_ids: List[str],
        assigned_area: List[ReferencePoint],
        active: bool,
        creation_time: int,
        time_limit: int = 1,
        last_scoring_time: Optional[int] = None,
    ):
        self.id = id
        self.name = name
        self.side_id = side_id
        self.assigned_unit_ids = assigned_unit_ids
        self.assigned_area = assigned_area
        self.active = active
        self.creation_time = creation_time
        self.time_limit = time_limit
        self.last_scoring_time = last_scoring_time
        self.patrol_area_geometry = Polygon(
            [(point.longitude, point.latitude) for point in self.assigned_area]
        )

    def update_patrol_area_geometry(self):
        self.patrol_area_geometry = Polygon(
            [(point.longitude, point.latitude) for point in self.assigned_area]
        )

    def check_if_coordinates_is_within_patrol_area(
        self, coordinates: List[float]
    ) -> bool:
        point = Point(coordinates)
        return self.patrol_area_geometry.contains(point)

    def generate_random_coordinates_within_patrol_area(self) -> List[float]:
        min_lon = self.assigned_area[0].longitude
        max_lon = self.assigned_area[1].longitude
        min_lat = self.assigned_area[0].latitude
        max_lat = self.assigned_area[2].latitude

        random_lat = random() * (max_lat - min_lat) + min_lat
        random_lon = random() * (max_lon - min_lon) + min_lon
        
        return [random_lat, random_lon]

    def get_mission_end_time(self) -> int:
        """Calculates the absolute end time of the mission in the simulation."""
        return self.creation_time + self.time_limit

    def check_time_limit(self, current_time: int, simulation_time_limit: int) -> bool:
        """
        Checks if the mission is impossible to complete within the simulation time.
        """
        return current_time + self.time_limit > simulation_time_limit

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "side_id": str(self.side_id),
            "assigned_unit_ids": [str(id) for id in self.assigned_unit_ids],
            "assigned_area": [point.to_dict() for point in self.assigned_area],
            "active": self.active,
            "creation_time": self.creation_time,
            "time_limit": self.time_limit,
            "last_scoring_time": self.last_scoring_time,
        }
