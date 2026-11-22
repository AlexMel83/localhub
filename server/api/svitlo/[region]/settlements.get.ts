import { proxyAddress } from '../../../utils/svitlo/addressProxy';
import { settlementsSchema } from '../../../utils/svitlo/schema';

export default defineEventHandler((event) => proxyAddress(event, 'settlements', settlementsSchema, { q: 80 }));
