import { FundingTicker } from '../api/bybit.js';

export const getOpenOrderTgMessage = (
  ticker: FundingTicker,
  params: {
    qty: string;
    stopLoss: string;
    takeProfit: string;
    findingProfitUSDT: string;
    targetProfitUsdt: string;
    lossUSDT: string;
  },
) => {
  const { findingProfitUSDT, lossUSDT, qty, stopLoss, takeProfit, targetProfitUsdt } = params;

  return `📈 <b>${ticker.symbol}</b> ⭐ <b>${(ticker.fundingRate * 100).toFixed(
    2,
  )}%</b> ⭐\n💲<b>currentPrice=${
    ticker.lastPrice
  }</b>💲\n💲<b>findingProfit=${findingProfitUSDT}$</b>💲\n💲<b>profitUsdt=${targetProfitUsdt}$</b>💲\n💲<b>lossUSDT=${lossUSDT}$</b>💲\n💲<b>qty=${qty}$</b>💲\n💲<b>takePrice=${takeProfit}</b>💲\n💲<b>stopPrice=${stopLoss}</b>💲`;
};
