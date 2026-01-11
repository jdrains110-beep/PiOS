/**
 * Triumph Synergy Integration Examples
 */

async function trackPortfolio(piAccount) {
  const portfolio = await fetch(`https://api.triumph-synergy.com/portfolio/${piAccount}`).then(r => r.json());
  const prices = await fetch(`https://api.triumph-synergy.com/api/chainlink/prices`).then(r => r.json());
  
  let totalValue = 0;
  const holdings = portfolio.assets.map(asset => {
    const price = prices.find(p => p.pair === `${asset.symbol}/USD`);
    const value = asset.amount * price.rate;
    totalValue += value;
    return { symbol: asset.symbol, amount: asset.amount, price: price.rate, value };
  });
  
  console.log(`Portfolio Value: $${totalValue.toFixed(2)}`);
  return { totalValue, holdings };
}

async function executeSmartTrade(config) {
  const { fromAsset, toAsset, targetPrice, amount } = config;
  const prices = await fetch(`https://api.triumph-synergy.com/api/chainlink/prices`).then(r => r.json());
  const toPrice = prices.find(p => p.pair === `${toAsset}/USD`);
  
  if (toPrice.rate <= targetPrice) {
    const tradeResult = await fetch(`https://api.triumph-synergy.com/trade`, {
      method: 'POST',
      body: JSON.stringify({ from: fromAsset, to: toAsset, amount, executionPrice: toPrice.rate })
    }).then(r => r.json());
    return tradeResult;
  }
  return null;
}

async function stakeWithAutomation(piAccount, stakingAmount) {
  const stakingResult = await fetch(`https://api.triumph-synergy.com/staking/stake`, {
    method: 'POST',
    body: JSON.stringify({ account: piAccount, amount: stakingAmount, autoCompound: true })
  }).then(r => r.json());
  
  const automation = await fetch(`https://api.triumph-synergy.com/api/chainlink/automations`, {
    method: 'POST',
    body: JSON.stringify({ stakingId: stakingResult.stakingId, action: 'rebalance', interval: 86400 })
  }).then(r => r.json());
  
  return { stakingResult, automation };
}

async function processPayment(config) {
  const { fromChain, toChain, amount, recipientAddress } = config;
  const rates = await fetch(`https://api.triumph-synergy.com/api/chainlink/prices`).then(r => r.json());
  
  const payment = await fetch(`https://api.triumph-synergy.com/payment/cross-chain`, {
    method: 'POST',
    body: JSON.stringify({ fromChain, toChain, amount, recipientAddress, exchangeRates: rates })
  }).then(r => r.json());
  
  return payment;
}

async function monitorOracleHealth() {
  const health = await fetch(`https://api.triumph-synergy.com/api/chainlink/health`).then(r => r.json());
  console.log(`Oracle Status: ${health.status}`);
  console.log(`Uptime: ${health.uptime}%`);
  return health;
}

module.exports = { trackPortfolio, executeSmartTrade, stakeWithAutomation, processPayment, monitorOracleHealth };
