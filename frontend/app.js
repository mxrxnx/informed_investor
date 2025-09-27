// frontend/app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const connectBtn = document.getElementById('connect-btn');
    const connectView = document.getElementById('connect-view');
    const portfolioView = document.getElementById('portfolio-view');
    const portfolioList = document.getElementById('portfolio-list');
    const searchForm = document.getElementById('insight-form');
    const tickerInput = document.getElementById('ticker-input');
    const resultContainer = document.getElementById('result-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- Mock Data (Simulating a Robinhood/Plaid API Call) ---
    const mockPortfolio = [
        { ticker: 'AAPL', shares: 10 },
        { ticker: 'TSLA', shares: 5 },
        { ticker: 'NVDA', shares: 15 },
        { ticker: 'GOOGL', shares: 2 }
    ];

    // --- Event Listeners ---
    connectBtn.addEventListener('click', () => {
        connectView.style.display = 'none';
        portfolioView.style.display = 'block';
        displayPortfolio(mockPortfolio);
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const ticker = tickerInput.value.trim().toUpperCase();
        if (ticker) {
            getInsight(ticker);
        }
    });

    // --- Functions ---
    function displayPortfolio(portfolio) {
        portfolioList.innerHTML = ''; // Clear previous list
        portfolio.forEach(stock => {
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="ticker">${stock.ticker}</div>
                    <div class="shares">${stock.shares} Shares</div>
                </div>
                <button class="insight-btn" data-ticker="${stock.ticker}">Get Insight</button>
            `;
            portfolioList.appendChild(stockItem);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.insight-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ticker = event.target.dataset.ticker;
                getInsight(ticker);
            });
        });
    }

    async function getInsight(ticker) {
        // Show loading state and clear/hide previous results
        loadingIndicator.style.display = 'block';
        resultContainer.style.display = 'none';
        resultContainer.innerHTML = '';

        try {
            const response = await fetch(`http://localhost:5001/api/insight/${ticker}`);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const data = await response.json();
            
            // Display the result
            resultContainer.innerHTML = `<h3>Insight for ${ticker}</h3><p>${data.insight}</p>`;
            resultContainer.style.display = 'block';

        } catch (error) {
            resultContainer.innerHTML = `<p style="color: #ff4d4d;">Error: ${error.message}</p>`;
            resultContainer.style.display = 'block';
            console.error('Fetch error:', error);
        } finally {
            loadingIndicator.style.display = 'none'; // Always hide loading indicator
        }
    }
});