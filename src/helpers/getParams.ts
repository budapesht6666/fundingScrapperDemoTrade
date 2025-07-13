import { bybit, FundingTicker } from './bybit.js';

const { LEVERAGE, ORDER_USDT } = process.env;

function calcTakeProfitFromFundingRate({
  fundingRate,
  positionValue,
  entryPrice,
  positionSize,
}: {
  fundingRate: number; // например: 0.0001 (0.01%)
  positionValue: number; // например: 100 * 10 = 1000 USDT
  entryPrice: number; // например: 30000 USDT
  positionSize: number; // например: 0.033 BTC
}): number {
  const targetProfit = 0.9 * Math.abs(fundingRate) * positionValue; // в USDT
  const tpPrice = entryPrice + targetProfit / positionSize; // в цене актива
  return tpPrice;
}

function calcStopLossFromTakeProfit({
  tpPrice,
  entryPrice,
  positionSize,
}: {
  tpPrice: number; // в цене актива
  entryPrice: number; // цена входа
  positionSize: number; // qty, например BTC
}): number {
  const profitUSDT = (tpPrice - entryPrice) * positionSize;
  const lossUSDT = 0.3 * profitUSDT;
  const slPrice = entryPrice - lossUSDT / positionSize;
  return slPrice;
}

async function getQuantity({ symbol, price }: { symbol: string; price: number }): Promise<string> {
  // 1. Запрос параметров инструмента
  const instr = await bybit.getInstrumentsInfo({ category: 'linear', symbol });
  const info = instr.result.list.find((i) => i.symbol === symbol);

  if (!info) throw new Error(`Instrument ${symbol} not found`);

  const lc = info.lotSizeFilter;
  const minQty = Number(lc.minOrderQty);
  const qtyStep = Number(lc.qtyStep);

  // 2. Расчёт qty
  const rawQty = (Number(ORDER_USDT) * Number(LEVERAGE)) / price;

  // 3. Округляем вниз
  const steppedQty = Math.floor(rawQty / qtyStep) * qtyStep;

  // 4. Проверяем минимальные ограничения
  if (steppedQty < minQty) throw new Error(`Calculated qty ${steppedQty} < minQty ${minQty}`);

  // 5. Возвращаем строковое значение с точностью, зависящей от шага
  const decimals = (qtyStep.toString().split('.')[1] || '').length;
  return steppedQty.toFixed(decimals);
}

export async function getParams(ticker: FundingTicker) {
  try {
    // Открыть лонг (market)
    const qty = await getQuantity({ symbol: ticker.symbol, price: ticker.lastPrice });
    const positionValue = Number(ORDER_USDT) * Number(LEVERAGE);
    const positionSize = positionValue / ticker.lastPrice;

    const takeProfit = calcTakeProfitFromFundingRate({
      fundingRate: ticker.fundingRate,
      positionValue,
      positionSize,
      entryPrice: ticker.lastPrice,
    });

    const stopLoss = calcStopLossFromTakeProfit({
      entryPrice: ticker.lastPrice,
      positionSize,
      tpPrice: takeProfit,
    });

    const takeProfitUSDT = (takeProfit - ticker.lastPrice) * positionSize;

    return { qty, stopLoss, takeProfit, takeProfitUSDT };
  } catch (error) {
    console.error('❌ Ошибка в getParams:', error);
  }
}
