import 'dotenv/config';
import { getTopNegativeFundingTickers } from './helpers/getFundingTickers.js';
import { setLeverage } from './helpers/setLeverage.js';
import { closeLong } from './helpers/orders/closeLong.js';
import { openLong } from './helpers/orders/openLong.js';
import { sendTelegramNotification } from './helpers/sendTelegramNotification.js';
import { getParams } from './helpers/getParams.js';
import { getParamsAndOpenLong } from './examples/getParamsAndOpenLong.js';

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
      console.log('1. topTickers', topTickers);

      for (const ticker of topTickers) {
        if (ticker.fundingRate <= Number(CONVENIENT_FR) / 100) {
          // Считаем задержку до funding
          const now = Date.now();
          const delay = ticker.nextFundingTime - now;

          if (delay < 3600 * 1000) {
            console.log(`2. ${ticker.symbol} - delay in minutes:`, delay / 1000 / 60);

            await setLeverage(ticker);
            const params = await getParams(ticker);

            if (!params) return;

            const { qty, stopLoss, takeProfit, takeProfitUSDT } = params;
            console.log(`3. { qty, stopLoss, takeProfit, takeProfitUSDT }:`, params);

            setTimeout(async () => {
              const order = await openLong({
                symbol: ticker.symbol,
                qty,
                stopLoss,
                takeProfit,
              });
              console.log('4. order:', order.result.orderId || order.retMsg);
            }, delay - 2 * 1000);

            setTimeout(async () => {
              const sellOrder = await closeLong({ symbol: ticker.symbol, qty });
              console.log('5. sellOrder:', sellOrder.result.orderId || sellOrder.retMsg);
            }, delay + 100);

            // Уведомление
            await sendTelegramNotification({
              takeProfitUSDT,
              qty,
              stopLoss: stopLoss.toString(),
              takeProfit: takeProfit.toString(),
              ticker,
            });
          }
        }
      }
    } catch (e) {
      console.error('Ошибка в основном цикле:', e);
    }

    // Ждём до следующего часа
    const msToNextHour = 3600 * 1000 - (Date.now() % 3600) * 1000;
    await new Promise((res) => setTimeout(res, msToNextHour));
  }
}

main().catch((err) => {
  console.error('Ошибка в работе бота:', err);
});
