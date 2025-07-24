import { getParams } from '../api/getParams.js';
import { getTickerByName } from '../api/getTickerByName.js';
import { openLong } from '../api/orders/openLong.js';
import { getTickerLogStr } from '../helpers/getTickerLogStr.js';

export async function getParamsAndOpenLong() {
  try {
    const ticker = await getTickerByName('SDUSDT');
    console.log('1. ticker:', getTickerLogStr(ticker));

    const params = await getParams(ticker);

    if (!params) return;

    const { qty, stopLoss, takeProfit } = params;
    console.log(`2. params:`, params);

    const order = await openLong({
      symbol: ticker.symbol,
      qty,
      stopLoss,
      takeProfit,
    });

    console.log('3. order:', order.result.orderId || order.retMsg);
  } catch (error) {
    console.error('Ошибка в getParamsAndOpenLong:', error);
  }
}
