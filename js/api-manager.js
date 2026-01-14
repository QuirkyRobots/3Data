console.log("Hello.\n\nIf you are reading this it's because you love zk-Snarks.");

// Configuration

const API_CONFIG = {
  BASE_URL: "https://api.coingecko.com/api/v3",
  API_KEY: "CG-7tRyvcttBwaPTyXmmRzXGtKd",
  UPDATE_INTERVAL: 2 * 60 * 1000,
  DEFAULT_COIN: "bitcoin",
  SUGGESTION_LIMIT: 20,
  SEARCH_DEBOUNCE_MS: 300
};

// Global state - Damm globalists

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

// Helper functions for access warning - Arrgh!

function toggleAccessWarning(show) {
  const warningElement = document.getElementById("accessWarning");
  warningElement && (warningElement.style.display = show ? "block" : "none");
}

function isNetworkError(error) {
  return error.message.includes('Failed to fetch') || 
         error.name === 'TypeError' ||
         error.message.includes('NetworkError');
}

function handleCoinSearch() {
  const coinInput = document.getElementById("coin");
  coinInput && (window.currentCoin = coinInput.value);
  getExchangeRate();
}

function initializeAPIManager() {
  try {

    // Setup close icon click handler - No MKUltra invloved

    const closeIcon = document.getElementById("closeIcon");
    closeIcon && closeIcon.addEventListener("click", () => toggleAccessWarning(false));
    
    getExchangeRate();
    
    // Update interval. Wooo!
    
    setInterval(getExchangeRate, API_CONFIG.UPDATE_INTERVAL);
    
    // Event listener for changes in the coin input field, with cows
    
    const coinInput = document.getElementById("coin");
    coinInput && coinInput.addEventListener("change", getExchangeRate);
    
    initializeCoinSearch();
  } catch (error) {
    console.error("Failed to initialize API manager:", error);
    toggleAccessWarning(true);
  }
}

function getExchangeRate() {
  const urlParams = new URLSearchParams(window.location.search);
  const coin = urlParams.get("coin") || window.currentCoin || API_CONFIG.DEFAULT_COIN;
  
  // Add API key as URL parameter to avoid CORS preflight - No aviation fuel

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
        
        // Check if coin is a privacy coin - if not, chop head off

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
      
      // Check if it's a network/CORS error (API blocked)

      if (isNetworkError(error)) {
        toggleAccessWarning(true);
      }
      
      throw error;
    });
}

// Data and tooth extraction

function extractCoinData(data) {
  try {
    const { id, symbol, image, links, market_cap_rank, market_data } = data;
    
    return {
      coinId: id,
      priceUSD: market_data.current_price.usd,
      priceBTC: Number(market_data.current_price.btc).toFixed(8),
      volume24h: market_data.total_volume.usd,
      high24h: market_data.high_24h.usd,
      low24h: market_data.low_24h.usd,
      price_change_percentage_7d: market_data.price_change_percentage_7d,
      price_change_percentage_30d: market_data.price_change_percentage_30d,
      price_change_percentage_1y: market_data.price_change_percentage_1y,
      ath_change_percentage: market_data.ath_change_percentage.usd,
      coinSymbol: symbol.toUpperCase(),
      coinRank: Number.isFinite(market_cap_rank) ? `#${market_cap_rank}` : "",
      coinThumb: image.thumb,
      coinURL: links.homepage[0]
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
    
    // Check if localStorage is full and if it is, you're not coming in
    
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
    rankElement && (rankElement.textContent = coinData.coinRank);
    
    const thumbElement = document.getElementById("coinThumbBoxNav");
    thumbElement && (thumbElement.src = coinData.coinThumb);
    
    const urlElements = document.querySelectorAll(".coin-urls");
    urlElements.forEach(link => {
      link.href = coinData.coinURL;
      link.title = `View the ${coinData.coinSymbol} website`;
    });

    // Update the Note field with the coin symbol - now cow here either

    const textInput = document.getElementById("textInput");
    if (textInput) {
      textInput.value = coinData.coinSymbol;

      // Trigger input event to refresh the Borg cube

      textInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (error) {
    console.error("Error updating page elements:", error);
  }
}

// Console log - not to be put on a fire

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

// Check if coin is a privacy coin - again

const cachedPrivacyElement = (() => document.getElementById("isPrivacyCoin"))();

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
    
    // Log to console (not Xbox)

    console.log(`${coinSymbol} - is privacy coin: ${isPrivacy}`);
    
    // Update HTML element
    
    cachedPrivacyElement && (cachedPrivacyElement.style.display = isPrivacy ? "block" : "none");
    
    return isPrivacy;
  } catch (error) {
    console.error("Error checking privacy coin status:", error);
    cachedPrivacyElement && (cachedPrivacyElement.style.display = "none");
    return false;
  }
}

// Create a predictive search

let searchDebounceTimer;

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

    const coins = await loadCoinsList();

    // Function to check if input matches any coin name or id

    const isMatch = (inputText) => {
      const lowerInput = inputText.toLowerCase();
      return coins.some((coin) => 
        coin.id.toLowerCase() === lowerInput || 
        coin.name.toLowerCase() === lowerInput
      );
    };

    const toggleCoinSelectDisplay = () => {
      coinSelectDiv.style.display = searchInput.value.trim() && !isMatch(searchInput.value.toLowerCase()) ? "block" : "none";
    };

    const selectCoin = (coin) => {
      searchInput.value = coin.id;
      window.currentCoin = coin.id;
      suggestionsContainer.innerHTML = "";
      getStatsButton.disabled = false;
      getStatsButton.classList.remove("disabled-btn");
      toggleCoinSelectDisplay();
      
      // Use shared search function

      handleCoinSearch();
    };

    const updateSuggestions = (inputText) => {
      const inputLower = inputText.toLowerCase();

      const filteredCoins = coins
        .filter((coin) => coin.name.toLowerCase().startsWith(inputLower))
        .slice(0, API_CONFIG.SUGGESTION_LIMIT);
      
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
      
      // Toggle disabled-btn class - Not really needed, but thought I'd add it anyway

      getStatsButton.classList.toggle("disabled-btn", !validCoinFound);

      toggleCoinSelectDisplay();
    };

    searchInput.addEventListener("input", (event) => {
      const inputText = event.target.value;
      
      // Debounce the search, it's not a ball

      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        updateSuggestions(inputText);
      }, API_CONFIG.SEARCH_DEBOUNCE_MS);
    });

    // Keyboard navigation for suggestions

    searchInput.addEventListener("keydown", (event) => {
      const items = suggestionsContainer.querySelectorAll(".suggestion-item");
      
      if (event.key === "Enter") {
        event.preventDefault();
        
        // If there's an active suggestion, select it

        const activeItem = suggestionsContainer.querySelector(".suggestion-item.active");
        if (activeItem) {
          const coinName = activeItem.textContent;
          const selectedCoin = coins.find((coin) => coin.name === coinName);
          selectedCoin && selectCoin(selectedCoin);
          return;
        }
        
        // Otherwise, click the button (it handles validation)

        if (!getStatsButton.disabled) {
          getStatsButton.click();
        }
        return;
      }
      
      if (items.length === 0) return;
      
      const activeItem = suggestionsContainer.querySelector(".suggestion-item.active");
      let currentIndex = activeItem ? Array.from(items).indexOf(activeItem) : -1;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items.forEach((item, idx) => {
          item.classList.toggle("active", idx === currentIndex);
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items.forEach((item, idx) => {
          item.classList.toggle("active", idx === currentIndex);
        });
      } else if (event.key === "Escape") {
        coinSelectDiv.style.display = "none";
        suggestionsContainer.innerHTML = "";
      }
    });
    
    // Random comment for no reason

    toggleCoinSelectDisplay();
  } catch (error) {
    console.error("Error initializing coin search:", error);
  }
}

async function loadCoinsList() {
  try {
    const coins = JSON.parse(localStorage.getItem("coins") || "[]");

    if (coins.length === 0) {

      // Add API key as URL parameter to avoid CORS preflight
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/coins/list?x_cg_demo_api_key=${API_CONFIG.API_KEY}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch coins list");
      }
      
      const fetchedCoins = await response.json();
      localStorage.setItem("coins", JSON.stringify(fetchedCoins));
      return fetchedCoins;
    }

    return coins;
  } catch (error) {
    console.error("Error loading coins list:", error);
    
    // Check if it's a network/CORS error (API blocked)

    if (isNetworkError(error)) {
      toggleAccessWarning(true);
    }
    
    return [];
  }
}

// Export for use in other modules

window.getExchangeRate = getExchangeRate;