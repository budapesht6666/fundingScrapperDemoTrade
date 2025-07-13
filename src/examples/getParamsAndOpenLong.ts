import { getParams } from '../helpers/getParams.js';
import { getTickerByName } from '../helpers/getTickerByName.js';
import { openLong } from '../helpers/orders/openLong.js';

export async function getParamsAndOpenLong() {
  try {
    const ticker = await getTickerByName('MUSDT');
    console.log('1. ticker:', ticker);

    const params = await getParams(ticker);

    if (!params) return;

    const { qty, stopLoss, takeProfit } = params;
    console.log(`2. params:`, params);

    setTimeout(async () => {
      const order = await openLong({
        symbol: ticker.symbol,
        qty,
        stopLoss: stopLoss.toFixed(4),
        takeProfit: takeProfit.toFixed(4),
      });

      console.log('3. order:', order);
    }, 10);
  } catch (error) {
    console.error('Ошибка в getParamsAndOpenLong:', error);
  }
}
