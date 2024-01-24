console.log("Hello.\n\nIf you are reading this it's because you love Pirate Chain.");
window.currentCoin = "";

document.addEventListener("DOMContentLoaded", function () {
  getExchangeRate();

  // Update interval. Wooo!

  setInterval(getExchangeRate, 2 * 60 * 1000);

  // Event listener for changes in the coin input field, with cows

  document.getElementById("coin").addEventListener("change", getExchangeRate);
});

function getExchangeRate() {
  const urlParams = new URLSearchParams(window.location.search);
  const coin = urlParams.get("coin") || currentCoin || "pirate-chain";
  const url = `https://api.coingecko.com/api/v3/coins/${coin}`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Coin not found");
      }
      return response.json();
    })
    .then((data) => {

      // Data extractionings

      const priceUSD = data.market_data.current_price.usd;
      const priceBTC = Number(data.market_data.current_price.btc).toFixed(8);
      const volume24h = data.market_data.total_volume.usd;
      const high24h = data.market_data.high_24h.usd;
      const low24h = data.market_data.low_24h.usd;
      window.coinSymbol = data.symbol.toUpperCase();
      window.coinRank = data.market_cap_rank;
      window.coinThumb = data.image.thumb;
      
      

      // Local storage

      localStorage.setItem("arrrData", JSON.stringify({ priceUSD, priceBTC, volume24h, high24h, low24h, coinSymbol, coinRank, coinThumb }));

      // Console log

      console.log(`Current Price USD: ${priceUSD}`);
      console.log(`Current Price BTC: ${priceBTC}`);
      console.log(`24h Volume: ${volume24h}`);
      console.log(`24h High: ${high24h}`);
      console.log(`24h Low: ${low24h}`);
      console.log(`Coin Symbol: ${coinSymbol}`);
      window.coinRank = data.market_cap_rank != null ? "#" + data.market_cap_rank : "";


      console.log(`Coin Thumb: ${coinThumb}`);

      // Update page elements

      updatePageElements(priceUSD, priceBTC, volume24h, high24h, low24h, coinSymbol, coinRank, coinThumb);
    })
    .catch((error) => {
      console.error("Error fetching exchange rate:", error);
    });
}

function updatePageElements(priceUSD, priceBTC, volume24h, high24h, low24h, coinSymbol) {
  document.getElementById("coinSymbolBox").textContent = " " + coinSymbol;
  document.getElementById("coinRankBox").textContent = coinRank;
  document.getElementById("coinThumbBox").src = coinThumb;
  document.getElementById("coinThumbBoxNav").src = coinThumb;
}

// Create a predictive search

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("coin");
  const getStatsButton = document.getElementById("getStats");
  getStatsButton.disabled = true;

  const suggestionsContainer = document.createElement("ul");
  suggestionsContainer.classList.add("suggestions");

  const coinSelectDiv = document.createElement("div");
  coinSelectDiv.classList.add("coin-select");
  coinSelectDiv.appendChild(suggestionsContainer);

  const coinSelectBoxParent = document.querySelector(".coin-select-box").parentNode;
  coinSelectBoxParent.insertBefore(coinSelectDiv, document.querySelector(".coin-select-box").nextSibling);

  let coins = JSON.parse(localStorage.getItem("coins") || "[]");

  if (coins.length === 0) {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    coins = await response.json();
    localStorage.setItem("coins", JSON.stringify(coins));
  }

  // Function to check if input matches any coin name or id

  const isMatch = (inputText) => {
    return coins.some((coin) => coin.id.toLowerCase() === inputText || coin.name.toLowerCase() === inputText);
  };

  const toggleCoinSelectDisplay = () => {
    coinSelectDiv.style.display = searchInput.value.trim() && !isMatch(searchInput.value) ? "block" : "none";
  };

  searchInput.addEventListener("input", (event) => {
    const inputTextOriginalCase = event.target.value;
    const inputTextLowerCase = inputTextOriginalCase.toLowerCase();

    const filteredCoins = coins.filter((coin) => coin.name.toLowerCase().startsWith(inputTextLowerCase));
    suggestionsContainer.innerHTML = "";

    filteredCoins.forEach((coin) => {
      const listItem = document.createElement("li");
      listItem.classList.add("suggestion-item");
      listItem.textContent = coin.name;
      listItem.addEventListener("click", () => selectCoin(coin));
      suggestionsContainer.appendChild(listItem);
    });

    const validCoinFound = isMatch(inputTextOriginalCase);
    getStatsButton.disabled = !validCoinFound;

    toggleCoinSelectDisplay();
  });

  const selectCoin = (coin) => {
    searchInput.value = coin.id;
    suggestionsContainer.innerHTML = "";
    getStatsButton.disabled = false;
    toggleCoinSelectDisplay();
  };
  toggleCoinSelectDisplay();
});
