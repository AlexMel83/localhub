import { proxyAddress } from '../../../utils/svitlo/addressProxy';
import { houseSchema } from '../../../utils/svitlo/schema';

export default defineEventHandler((event) =>
  proxyAddress(event, 'house', houseSchema, { settlement: 128, rem: 128, street: 256, house: 32 }),
);
