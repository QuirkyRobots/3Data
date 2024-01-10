console.log(
  "Hello.\n\nIf you are reading this it's because you love Pirate Chain."
);
document.addEventListener("DOMContentLoaded", function () {
  getExchangeRate();

  // Update interval. Wooo!

  setInterval(getExchangeRate, 5 * 60 * 1000);
});

function getExchangeRate() {
  fetch("https://api.coingecko.com/api/v3/coins/pirate-chain")
    .then((response) => response.json())
    .then((data) => {
      
      // Data tooth extractions

      const priceUSD = data.market_data.current_price.usd;
      const priceBTC = data.market_data.current_price.btc;
      const volume24h = data.market_data.total_volume.usd;
      const high24h = data.market_data.high_24h.usd;
      const low24h = data.market_data.low_24h.usd;

      // Local storage

      localStorage.setItem(
        "arrrData",
        JSON.stringify({
          priceUSD,
          priceBTC,
          volume24h,
          high24h,
          low24h,
        })
      );

      // Console log

      console.log(`Current Price USD: ${priceUSD}`);
      console.log(`Current Price BTC: ${priceBTC}`);
      console.log(`24h Volume: ${volume24h}`);
      console.log(`24h High: ${high24h}`);
      console.log(`24h Low: ${low24h}`);

      updatePageElements(priceUSD, priceBTC, volume24h, high24h, low24h);
    })
    .catch((error) => {
      console.error("Error fetching exchange rate:", error);
    });
}

function updatePageElements(priceUSD, priceBTC, volume24h, high24h, low24h) {
  // document.getElementById("priceUSD").textContent = `USD: ${priceUSD}`;
  // document.getElementById("priceBTC").textContent = `BTC: ${priceBTC}`;
}
