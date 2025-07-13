import { bybit, FundingTicker } from './bybit.js';

const { LEVERAGE } = process.env;

export async function setLeverage(ticker: FundingTicker) {
  try {
    // Установить плечо
    const setLeverageRes = await bybit.setLeverage({
      category: 'linear',
      symbol: ticker.symbol,
      buyLeverage: String(LEVERAGE),
      sellLeverage: String(LEVERAGE),
    });
    console.log('setLeverageRes:', setLeverageRes);

    return setLeverageRes;
  } catch (error) {
    console.error('Ошибка в setLeverageAndGetParams:', error);
  }
}
