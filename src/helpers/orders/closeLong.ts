import { OrderParamsV5 } from 'bybit-api';
import { bybit } from '../bybit.js';

// Через 100мс после funding выставить аварийный sell
export async function closeLong({ symbol, qty }: Pick<OrderParamsV5, 'symbol' | 'qty'>) {
  const sellOrder = await bybit.submitOrder({
    category: 'linear',
    symbol,
    side: 'Sell',
    orderType: 'Market',
    qty,
    reduceOnly: true,
  });

  return sellOrder;
}
