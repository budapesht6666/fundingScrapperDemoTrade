import 'dotenv/config';
import { getTopNegativeFundingTickers } from './api/getFundingTickers.js';
import { setLeverage } from './api/setLeverage.js';
import { closeLong } from './api/orders/closeLong.js';
import { openLong } from './api/orders/openLong.js';
import { sendTelegramNotification } from './api/sendTelegramNotification.js';
import { getParams } from './api/getParams.js';
import { getParamsAndOpenLong } from './examples/getParamsAndOpenLong.js';
import { getTickerLogStr } from './helpers/getTickerLogStr.js';
import { getOpenOrderTgMessage } from './helpers/getOpenOrderTgMessage.js';

// Загрузка переменных окружения
const {
  BYBIT_API_KEY,
  BYBIT_API_SECRET,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  LEVERAGE,
  ORDER_USDT,
  CONVENIENT_FR,
} = process.env;

if (
  !BYBIT_API_KEY ||
  !BYBIT_API_SECRET ||
  !TELEGRAM_BOT_TOKEN ||
  !TELEGRAM_CHAT_ID ||
  !LEVERAGE ||
  !ORDER_USDT ||
  !CONVENIENT_FR
) {
  throw new Error('Не заданы все необходимые переменные окружения (.env)');
}

async function main() {
  console.log('fundingScrapperDemoTrade запущен');

  // test example
  // getParamsAndOpenLong();
  // return;

  while (true) {
    try {
      const topTickers = await getTopNegativeFundingTickers();
      console.log('1. topTickers', topTickers.map((ticker) => getTickerLogStr(ticker)).join('; '));

      for (const ticker of topTickers) {
        if (ticker.fundingRate > Number(CONVENIENT_FR) / 100) continue;

        // Считаем задержку до funding
        const delay = ticker.nextFundingTime - Date.now();
        const dt = 2 * 1000;

        if (delay > 3600 * 1000) continue;

        console.log(`2. Будет открыта позиция`, getTickerLogStr(ticker));

        await setLeverage(ticker);

        setTimeout(async () => {
          const params = await getParams(ticker);

          if (!params) return;

          const { qty, stopLoss, takeProfit } = params;

          console.log(
            `3. { qty, stopLoss, takeProfit, findingProfitUSDT, targetProfitUsdt, lossUSDT }:`,
            params,
          );

          const order = await openLong({
            symbol: ticker.symbol,
            qty,
            stopLoss,
            takeProfit,
          });
          console.log('4. order:', order.result.orderId || order.retMsg);

          setTimeout(async () => {
            const sellOrder = await closeLong({ symbol: ticker.symbol, qty });
            console.log('5. sellOrder:', sellOrder.result.orderId || sellOrder.retMsg);
          }, dt + 250);

          // Уведомление
          await sendTelegramNotification({
            message: getOpenOrderTgMessage(ticker, params),
          });
        }, delay - dt);
      }
    } catch (e) {
      console.error('Ошибка в основном цикле:', e);
      await sendTelegramNotification({ message: `'Ошибка в основном цикле:', ${e}` });
    }

    // Ждём до следующего часа
    const msToNextHour = 3600 * 1000 - (Date.now() % 3600) * 1000;
    await new Promise((res) => setTimeout(res, msToNextHour));
  }
}

main().catch(async (err) => {
  console.error('Ошибка в работе бота:', err);
  await sendTelegramNotification({ message: `'Ошибка в работе бота:', ${err}` });
});
