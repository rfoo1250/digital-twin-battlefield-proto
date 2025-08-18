import { fromLonLat, get as getProjection } from "ol/proj";
import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";
import { Polygon } from "ol/geom";
import ReferencePoint from "@/game/units/ReferencePoint";

interface IPatrolMission {
  id: string;
  name: string;
  sideId: string;
  assignedUnitIds: string[];
  assignedArea: ReferencePoint[];
  lastScoringTime?: number;
  timeLimit: number;
  active: boolean;
}

export default class PatrolMission {
  id: string;
  name: string;
  sideId: string;
  assignedUnitIds: string[];
  assignedArea: ReferencePoint[];
  active: boolean;
  patrolAreaGeometry: Polygon;
  lastScoringTime?: number;
  timeLimit: number;

  constructor(parameters: IPatrolMission) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.sideId = parameters.sideId;
    this.assignedUnitIds = parameters.assignedUnitIds;
    this.assignedArea = parameters.assignedArea;
    this.active = parameters.active;
    this.patrolAreaGeometry = this.createPatrolAreaGeometry(
      parameters.assignedArea
    );
    this.lastScoringTime = parameters.lastScoringTime;
    this.timeLimit = parameters.timeLimit ?? 1;
  }

  updatePatrolAreaGeometry(): void {
    this.patrolAreaGeometry = this.createPatrolAreaGeometry(this.assignedArea);
  }

  createPatrolAreaGeometry(area: ReferencePoint[]): Polygon {
    const projection = getProjection(DEFAULT_OL_PROJECTION_CODE);
    return new Polygon([
      area.map((point) =>
        fromLonLat([point.longitude, point.latitude], projection!!)
      ),
    ]);
  }

  checkIfCoordinatesIsWithinPatrolArea(coordinates: number[]): boolean {
    const projection = getProjection(DEFAULT_OL_PROJECTION_CODE);
    return this.patrolAreaGeometry.intersectsCoordinate(
      fromLonLat([coordinates[1], coordinates[0]], projection!!)
    );
  }

  generateRandomCoordinatesWithinPatrolArea(): number[] {
    const randomCoordinates = [
      Math.random() *
        (this.assignedArea[2].latitude - this.assignedArea[0].latitude) +
        this.assignedArea[0].latitude,
      Math.random() *
        (this.assignedArea[1].longitude - this.assignedArea[0].longitude) +
        this.assignedArea[0].longitude,
    ];
    return randomCoordinates;
  }

  /**
   * Checks if the mission's time limit, when added to the current time,
   * would exceed the overall simulation time limit.
   * - for validating mission parameters upon creation.
   * @param currentTime The current elapsed time in the simulation (in seconds).
   * @param simulationTimeLimit The absolute maximum duration of the simulation (in seconds).
   * @returns {boolean} - True if the mission is impossible to complete within the simulation time, false otherwise.
   */
  checkTimeLimit(currentTime: number, simulationTimeLimit: number): boolean {
    
    return currentTime + this.timeLimit > simulationTimeLimit;
  }
}
