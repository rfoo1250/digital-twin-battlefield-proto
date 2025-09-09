import json
from blade.utils.colors import convert_color_name_to_side_color, SIDE_COLOR


class Side:

    def __init__(
        self,
        id: str,
        name: str,
        total_score: int = 0,
        casualties: int = 0,
        missions_assigned: int = 0,
        missions_completed: int = 0,
        missions_succeeded: int = 0,
        missions_failed: int = 0,
        color: str | SIDE_COLOR | None = None,
    ):
        self.id = id
        self.name = name
        self.total_score = total_score
        self.casualties = casualties
        self.missions_assigned = missions_assigned
        self.missions_completed = missions_completed
        self.missions_succeeded = missions_succeeded
        self.missions_failed = missions_failed
        self.color = convert_color_name_to_side_color(color)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "total_score": self.total_score,
            "casualties": self.casualties,
            "missions_assigned": self.missions_assigned,
            "missions_completed": self.missions_completed,
            "missions_succeeded": self.missions_succeeded,
            "missions_failed": self.missions_failed,
            "color": (
                self.color.value if isinstance(self.color, SIDE_COLOR) else self.color
            ),
        }
