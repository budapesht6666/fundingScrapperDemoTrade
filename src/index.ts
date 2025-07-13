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
          const dt = 2 * 1000;

          if (delay < 3600 * 1000) {
            console.log(`2. ${ticker.symbol} - delay in minutes:`, delay / 1000 / 60);

            await setLeverage(ticker);

            setTimeout(async () => {
              const params = await getParams(ticker);

              if (!params) return;

              const { qty, stopLoss, takeProfit, findingProfitUSDT, targetProfitUsdt, lossUSDT } =
                params;
              console.log(`3. { qty, stopLoss, takeProfit, findingProfitUSDT }:`, params);

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
                message: `📈 <b>${ticker.symbol}</b> ⭐ <b>${(ticker.fundingRate * 100).toFixed(
                  4,
                )}%</b> ⭐\n💲<b>currentPrice=${
                  ticker.lastPrice
                }</b>💲\n💲<b>findingProfit=${findingProfitUSDT}$</b>💲\n💲<b>profitUsdt=${targetProfitUsdt}$</b>💲\n💲<b>lossUSDT=${lossUSDT}$</b>💲\n💲<b>qty=${qty}$</b>💲\n💲<b>takePrice=${takeProfit}</b>💲\n💲<b>stopPrice=${stopLoss}</b>💲`,
              });
            }, delay - dt);
          }
        }
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
