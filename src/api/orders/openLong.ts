import { OrderParamsV5 } from 'bybit-api';
import { bybit } from '../bybit.js';

// Создать ордер с TP/SL
export async function openLong({
  symbol,
  qty,
  stopLoss,
  takeProfit,
}: Pick<OrderParamsV5, 'symbol' | 'qty' | 'takeProfit' | 'stopLoss'>) {
  const order = await bybit.submitOrder({
    category: 'linear',
    symbol,
    side: 'Buy',
    orderType: 'Market',
    qty,
    takeProfit,
    stopLoss,
    reduceOnly: false,
  });

  return order;
}
