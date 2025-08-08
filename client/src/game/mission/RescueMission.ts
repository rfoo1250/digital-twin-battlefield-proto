interface IRescueMission {
  id: string;
  name: string;
  sideId: string;
  assignedUnitIds: string[];
  assignedTargetIds: string[];
  active: boolean;
}

export default class RescueMission {
  id: string;
  name: string;
  sideId: string;
  assignedUnitIds: string[];
  assignedTargetIds: string[];
  active: boolean;

  constructor(parameters: IRescueMission) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.sideId = parameters.sideId;
    this.assignedUnitIds = parameters.assignedUnitIds;
    this.assignedTargetIds = parameters.assignedTargetIds;
    this.active = parameters.active;
  }
}
