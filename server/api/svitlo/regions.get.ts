import { SVITLO_REGIONS, publicRegion } from '../../../shared/utils/svitloRegions';

export default defineEventHandler(() => SVITLO_REGIONS.map(publicRegion));
