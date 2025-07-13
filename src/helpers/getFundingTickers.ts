import { bybit, FundingTicker } from './bybit.js';

export async function getTopNegativeFundingTickers(): Promise<FundingTicker[]> {
  // Получаем тикеры с fundingRate
  const res = await bybit.getTickers({ category: 'linear' });
  if (!res.result || !Array.isArray(res.result.list)) {
    throw new Error('Некорректный ответ getTickers');
  }

  res.result.list[0].lastPrice;

  return res.result.list
    .map((t: any) => ({
      // ...t,
      symbol: t.symbol,
      fundingRate: parseFloat(t.fundingRate),
      nextFundingTime: Number(t.nextFundingTime),
      volume24h: parseFloat(t.volume24h),
      lastPrice: parseFloat(t.lastPrice),
    }))
    .filter((t) => t.fundingRate < 0 && t.volume24h >= 10_000_000)
    .sort((a, b) => a.fundingRate - b.fundingRate)
    .slice(0, 3);
}
