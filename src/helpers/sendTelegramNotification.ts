import { FundingTicker } from './bybit.js';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

type Params = {
  ticker: FundingTicker;
  takeProfitUSDT: string;
  qty: string;
  stopLoss: string;
  takeProfit: string;
};
export async function sendTelegramNotification({
  takeProfitUSDT,
  qty,
  stopLoss,
  takeProfit,
  ticker,
}: Params) {
  const message = `📈 <b>${ticker.symbol}</b> ⭐ <b>${(ticker.fundingRate * 100).toFixed(
    4,
  )}%</b> ⭐\n💲<b>currentPrice=${
    ticker.lastPrice
  }</b>💲\n💲<b>${takeProfitUSDT}$</b>💲\n💲<b>qty=${qty}$</b>💲\n💲<b>takePrice=${takeProfit}</b>💲\n💲<b>stopPrice=${stopLoss}</b>💲`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }
}
