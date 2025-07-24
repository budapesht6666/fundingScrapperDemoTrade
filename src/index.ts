import 'dotenv/config';
import { sendTelegramNotification } from './api/sendTelegramNotification.js';
import { tradingStrategy } from './tradingStrategy.js';
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

  const endHourDelay = 3600 * 1000 - (new Date().getTime() % (3600 * 1000));
  setTimeout(() => tradingStrategy(), endHourDelay - 5000);
}

main().catch(async (err) => {
  console.error('Ошибка в работе бота:', err);
  await sendTelegramNotification({ message: `'Ошибка в работе бота:', ${err}` });
});
