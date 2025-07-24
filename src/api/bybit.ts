import { RestClientV5 } from 'bybit-api';

// Загрузка переменных окружения
const { BYBIT_API_KEY, BYBIT_API_SECRET } = process.env;

if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
  throw new Error('Не заданы все необходимые переменные окружения (.env)');
}

// Инициализация Bybit REST API клиента
export const bybit = new RestClientV5({
  key: BYBIT_API_KEY,
  secret: BYBIT_API_SECRET,
  demoTrading: true,
  syncTimeBeforePrivateRequests: true,
});

export interface FundingTicker {
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  volume24h: number;
  lastPrice: number;
}
