import { GetTickersParamsV5 } from 'bybit-api';
import { bybit, FundingTicker } from './bybit.js';

export async function getTickerByName(
  symbol: Required<GetTickersParamsV5<'linear'>['symbol']>,
): Promise<FundingTicker> {
  // Получаем тикеры с fundingRate
  const ticker = await bybit.getTickers({ category: 'linear', symbol });
  if (!ticker.result || !Array.isArray(ticker.result.list)) {
    throw new Error('Некорректный ответ getTickerByName');
  }

  return ticker.result.list.map((t: any) => ({
    symbol: t.symbol,
    fundingRate: parseFloat(t.fundingRate),
    nextFundingTime: Number(t.nextFundingTime),
    volume24h: parseFloat(t.volume24h),
    lastPrice: parseFloat(t.lastPrice),
  }))[0];
}
