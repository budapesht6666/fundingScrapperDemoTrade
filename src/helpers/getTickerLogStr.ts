import { FundingTicker } from '../api/bybit.js';

export const getTickerLogStr = (ticker: FundingTicker) => {
  return `${ticker.symbol} = fr: ${(ticker.fundingRate * 100).toFixed(2)}%, delay: ${Math.trunc(
    (ticker.nextFundingTime - Date.now()) / 1000 / 60,
  )}min`;
};
