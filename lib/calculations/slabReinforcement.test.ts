import {
  calculateSlabReinforcement,
  SlabReinforcementGroup,
} from "./slabReinforcement";

const slab: SlabReinforcementGroup = {
  type: "S1",

  length: 3.0,
  width: 3.33,
  cover: 0.025,

  mainBarDiameterMm: 12,
  mainBarSpacing: 0.15,

  distributionBarDiameterMm: 6,
  distributionBarSpacing: 0.2,
};

const result = calculateSlabReinforcement(slab);

console.log(result);