console.log("Hello.\n\nIf you are reading this it's because you love zk-Snarks.");

// Configuration

const API_CONFIG = {
  BASE_URL: "https://api.coingecko.com/api/v3",
  API_KEY: "CG-7tRyvcttBwaPTyXmmRzXGtKd", // Replace with your actual API key
  UPDATE_INTERVAL: 2 * 60 * 1000,
  DEFAULT_COIN: "bitcoin"
};

// Global state

window.currentCoin = "";

// Custom event for data updates instead of localStorage polling

const createDataUpdateEvent = (data) => {
  return new CustomEvent('cryptoDataUpdated', { 
    detail: data,
    bubbles: true 
  });
};

document.addEventListener("DOMContentLoaded", function () {
  initializeAPIManager();
});

function initializeAPIManager() {
  try {
    getExchangeRate();
    
    // Update interval. Wooo!
    
    setInterval(getExchangeRate, API_CONFIG.UPDATE_INTERVAL);
    
    // Event listener for changes in the coin input field, with cows
    
    const coinInput = document.getElementById("coin");
    if (coinInput) {
      coinInput.addEventListener("change", getExchangeRate);
    }
    
    initializeCoinSearch();
  } catch (error) {
    console.error("Failed to initialize API manager:", error);
  }
}

function getExchangeRate() {
  const urlParams = new URLSearchParams(window.location.search);
  const coin = urlParams.get("coin") || window.currentCoin || API_CONFIG.DEFAULT_COIN;
  
  // Add API key as URL parameter to avoid CORS preflight
  const url = `${API_CONFIG.BASE_URL}/coins/${coin}?x_cg_demo_api_key=${API_CONFIG.API_KEY}`;

  return fetch(url, {
    method: 'GET'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Coin not found: ${coin}`);
      }
      return response.json();
    })
    .then((data) => {
      try {
        const processedData = extractCoinData(data);
        storeCoinData(processedData);
        updatePageElements(processedData);
        logCoinData(processedData);
        
        // Check if coin is a privacy coin
        checkIfPrivacyCoin(processedData.coinId, processedData.coinSymbol);
        
        // Dispatch custom event instead of relying on localStorage polling
        
        document.dispatchEvent(createDataUpdateEvent(processedData));
        
        return processedData;
      } catch (error) {
        console.error("Error processing coin data:", error);
        throw error;
      }
    })
    .catch((error) => {
      console.error("Error fetching exchange rate:", error);
      throw error;
    });
}

// Data extraction

function extractCoinData(data) {
  try {
    return {
      coinId: data.id,
      priceUSD: data.market_data.current_price.usd,
      priceBTC: Number(data.market_data.current_price.btc).toFixed(8),
      volume24h: data.market_data.total_volume.usd,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      price_change_percentage_7d: data.market_data.price_change_percentage_7d,
      price_change_percentage_30d: data.market_data.price_change_percentage_30d,
      price_change_percentage_1y: data.market_data.price_change_percentage_1y,
      ath_change_percentage: data.market_data.ath_change_percentage.usd,
      coinSymbol: data.symbol.toUpperCase(),
      coinRank: Number.isFinite(data.market_cap_rank) ? "#" + data.market_cap_rank : "",
      coinThumb: data.image.thumb,
      coinURL: data.links.homepage[0]
    };
  } catch (error) {
    console.error("Error extracting coin data:", error);
    throw new Error("Invalid API response structure");
  }
}

// Local storage

function storeCoinData(coinData) {
  try {
    localStorage.setItem("coinData", JSON.stringify(coinData));
    
    // Update global variables for backward compatibility
    
    window.coinSymbol = coinData.coinSymbol;
    window.coinRank = coinData.coinRank;
    window.coinThumb = coinData.coinThumb;
    window.coinURL = coinData.coinURL;
  } catch (error) {
    console.error("Error storing coin data:", error);
    
    // Check if localStorage is full
    
    if (error.name === 'QuotaExceededError') {
      console.warn("localStorage quota exceeded. Clearing old data...");
      localStorage.clear();
      localStorage.setItem("coinData", JSON.stringify(coinData));
    }
  }
}

// Update page elements

function updatePageElements(coinData) {
  try {
    const symbolElements = document.querySelectorAll(".coin-symbol-box");
    symbolElements.forEach(element => {
      element.textContent = ` ${coinData.coinSymbol}`;
    });
    
    const rankElement = document.getElementById("coinRankBox");
    if (rankElement) {
      rankElement.textContent = coinData.coinRank;
    }
    
    const thumbElement = document.getElementById("coinThumbBoxNav");
    if (thumbElement) {
      thumbElement.src = coinData.coinThumb;
    }
    
    const urlElements = document.querySelectorAll(".coin-urls");
    urlElements.forEach(link => {
      link.href = coinData.coinURL;
      link.title = `View the ${coinData.coinSymbol} website`;
    });

    // Update the Note field with the coin symbol
    const textInput = document.getElementById("textInput");
    if (textInput) {
      textInput.value = coinData.coinSymbol;
      // Trigger input event to refresh the cube
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (error) {
    console.error("Error updating page elements:", error);
  }
}

// Console log

function logCoinData(coinData) {
  console.log(`Current Price USD: ${coinData.priceUSD}`);
  console.log(`Current Price BTC: ${coinData.priceBTC}`);
  console.log(`24h Volume: ${coinData.volume24h}`);
  console.log(`24h High: ${coinData.high24h}`);
  console.log(`24h Low: ${coinData.low24h}`);
  console.log(`Coin Symbol: ${coinData.coinSymbol}`);
  console.log(`Coin Rank: ${coinData.coinRank}`);
  console.log(`Coin URL: ${coinData.coinURL}`);
  console.log(`Coin Thumb: ${coinData.coinThumb}`);
}

// Check if coin is a privacy coin

async function checkIfPrivacyCoin(coinId, coinSymbol) {
  try {
    const url = `${API_CONFIG.BASE_URL}/coins/${coinId}?x_cg_demo_api_key=${API_CONFIG.API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coin data for: ${coinId}`);
    }
    
    const coinData = await response.json();
    const categories = coinData.categories || [];
    const isPrivacy = categories.includes('Privacy Coins');
    
    // Log to console

    console.log(`${coinSymbol} - is privacy coin: ${isPrivacy}`);
    
    // Update HTML element
    
    const privacyElement = document.getElementById("isPrivacyCoin");
    if (privacyElement) {
      privacyElement.style.display = isPrivacy ? "block" : "none";
    }
    
    return isPrivacy;
  } catch (error) {
    console.error("Error checking privacy coin status:", error);
    const privacyElement = document.getElementById("isPrivacyCoin");
    if (privacyElement) {
      privacyElement.style.display = "none";
    }
    return false;
  }
}

// Create a predictive search

async function initializeCoinSearch() {
  try {
    const searchInput = document.getElementById("coin");
    const getStatsButton = document.getElementById("getStats");
    
    if (!searchInput || !getStatsButton) {
      console.warn("Search elements not found");
      return;
    }
    
    getStatsButton.disabled = true;

    const suggestionsContainer = document.createElement("ul");
    suggestionsContainer.classList.add("suggestions");

    const coinSelectDiv = document.createElement("div");
    coinSelectDiv.classList.add("coin-select");
    coinSelectDiv.appendChild(suggestionsContainer);

    const coinSelectBoxParent = document.querySelector(".coin-select-box")?.parentNode;
    if (coinSelectBoxParent) {
      coinSelectBoxParent.insertBefore(coinSelectDiv, document.querySelector(".coin-select-box").nextSibling);
    }

    let coins = await loadCoinsList();

    // Function to check if input matches any coin name or id

    const isMatch = (inputText) => {
      const lowerInput = inputText.toLowerCase();
      return coins.some((coin) => 
        coin.id.toLowerCase() === lowerInput || 
        coin.name.toLowerCase() === lowerInput
      );
    };

    const toggleCoinSelectDisplay = () => {
      const shouldShow = searchInput.value.trim() && !isMatch(searchInput.value.toLowerCase());
      coinSelectDiv.style.display = shouldShow ? "block" : "none";
    };

    searchInput.addEventListener("input", (event) => {
      const inputText = event.target.value;
      const inputLower = inputText.toLowerCase();

      const filteredCoins = coins.filter((coin) => 
        coin.name.toLowerCase().startsWith(inputLower)
      );
      
      suggestionsContainer.innerHTML = "";

      filteredCoins.forEach((coin) => {
        const listItem = document.createElement("li");
        listItem.classList.add("suggestion-item");
        listItem.textContent = coin.name;
        listItem.addEventListener("click", () => selectCoin(coin));
        suggestionsContainer.appendChild(listItem);
      });

      const validCoinFound = isMatch(inputText);
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
  } catch (error) {
    console.error("Error initializing coin search:", error);
  }
}

async function loadCoinsList() {
  try {
    let coins = JSON.parse(localStorage.getItem("coins") || "[]");

    if (coins.length === 0) {

      // Add API key as URL parameter to avoid CORS preflight
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/coins/list?x_cg_demo_api_key=${API_CONFIG.API_KEY}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch coins list");
      }
      
      coins = await response.json();
      localStorage.setItem("coins", JSON.stringify(coins));
    }

    return coins;
  } catch (error) {
    console.error("Error loading coins list:", error);
    return [];
  }
}

// Export for use in other modules

window.getExchangeRate = getExchangeRate;