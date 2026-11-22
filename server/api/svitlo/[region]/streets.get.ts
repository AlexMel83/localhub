import { proxyAddress } from '../../../utils/svitlo/addressProxy';
import { streetsSchema } from '../../../utils/svitlo/schema';

export default defineEventHandler((event) =>
  proxyAddress(event, 'streets', streetsSchema, { settlement: 128, rem: 128, q: 80 }),
);
