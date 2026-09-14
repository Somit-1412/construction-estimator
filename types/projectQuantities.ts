export type ProjectQuantities = {
  excavationVolume: number;
  pccVolume: number;

  footingConcreteVolume: number;
  footingSteelWeight: number;
  footingShutteringArea: number;

  columnConcreteVolume: number;
  columnSteelWeight: number;
  columnShutteringArea: number;

  beamConcreteVolume: number;
  beamSteelWeight: number;
  beamShutteringArea: number;

  slabConcreteVolume: number;
  slabSteelWeight: number;
  slabShutteringArea: number;

  lintelConcreteVolume: number;
  lintelSteelWeight: number;
  lintelShutteringArea: number;

  foundationBrickworkVolume: number;
  brickworkVolume: number;
  dpcArea: number;

  internalPlasterArea: number;
  externalPlasterArea: number;

  flooringArea: number;
  tileQuantity: number;

  doorOpeningArea: number;
  windowOpeningArea: number;
  ventilatorOpeningArea: number;

  fillingVolume: number;
};

export const emptyProjectQuantities: ProjectQuantities = {
  excavationVolume: 0,
  pccVolume: 0,

  footingConcreteVolume: 0,
  footingSteelWeight: 0,
  footingShutteringArea: 0,

  columnConcreteVolume: 0,
  columnSteelWeight: 0,
  columnShutteringArea: 0,

  beamConcreteVolume: 0,
  beamSteelWeight: 0,
  beamShutteringArea: 0,

  slabConcreteVolume: 0,
  slabSteelWeight: 0,
  slabShutteringArea: 0,

  lintelConcreteVolume: 0,
  lintelSteelWeight: 0,
  lintelShutteringArea: 0,

  foundationBrickworkVolume: 0,
  brickworkVolume: 0,
  dpcArea: 0,

  internalPlasterArea: 0,
  externalPlasterArea: 0,

  flooringArea: 0,
  tileQuantity: 0,

  doorOpeningArea: 0,
  windowOpeningArea: 0,
  ventilatorOpeningArea: 0,

  fillingVolume: 0,
};