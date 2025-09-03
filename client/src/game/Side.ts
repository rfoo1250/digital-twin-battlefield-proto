import { convertColorNameToSideColor, SIDE_COLOR } from "@/utils/colors";

interface ISide {
  id: string;
  name: string;
  totalScore?: number;
  casualties?: number;
  missionsAssigned?: number;
  missionsCompleted?: number;
  missionsSucceeded?: number;
  missionsFailed?: number
  color?: string | SIDE_COLOR;
}

export default class Side {
  id: string;
  name: string;
  totalScore: number;
  casualties: number;
  missionsAssigned: number;
  missionsCompleted: number;
  missionsSucceeded: number;
  missionsFailed: number;
  color: SIDE_COLOR;

  constructor(parameters: ISide) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.totalScore = parameters.totalScore ?? 0;
    this.casualties = parameters.casualties ?? 0;
    this.missionsAssigned = parameters.missionsAssigned ?? 0;
    this.missionsCompleted = parameters.missionsCompleted ?? 0;
    this.missionsSucceeded = parameters.missionsSucceeded ?? 0;
    this.missionsFailed = parameters.missionsFailed ?? 0;
    this.color = convertColorNameToSideColor(parameters.color);
  }
}
