document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const connectBtn = document.getElementById('connect-btn');
    const connectView = document.getElementById('connect-view');
    const portfolioView = document.getElementById('portfolio-view');
    const portfolioList = document.getElementById('portfolio-list');
    const searchForm = document.getElementById('insight-form');
    
    // Chatbot Elements
    const openChatFab = document.getElementById('open-chat-fab');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatWidget = document.getElementById('chat-widget-container');
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    
    // --- Mock Data ---
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
        openChatFab.style.display = 'flex';
        displayPortfolio(mockPortfolio);
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
        if (ticker) getInsight(ticker);
    });

    openChatFab.addEventListener('click', () => {
        chatWidget.classList.remove('hidden');
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
    });

    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleChatMessage();
    });

    // --- Functions ---
    function displayPortfolio(portfolio) {
        portfolioList.innerHTML = '';
        portfolio.forEach(stock => {
            const stockItem = document.createElement('div');
            stockItem.className = 'stock-item';
            stockItem.innerHTML = `
                <div class="stock-info">
                    <div class="ticker">${stock.ticker}</div>
                    <div class="shares">${stock.shares} Shares</div>
                </div>
                <button class="insight-btn logo-btn" data-ticker="${stock.ticker}">in</button>
            `;
            portfolioList.appendChild(stockItem);
        });

        // --- THIS IS THE CRUCIAL PART THAT WAS MISSING ---
        // It finds all the new "in" buttons and tells them to run getInsight when clicked.
        document.querySelectorAll('.insight-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const buttonEl = event.target.closest('button');
                const ticker = buttonEl.dataset.ticker;
                getInsight(ticker);
            });
        });
    }

    async function getInsight(ticker) {
        const loadingIndicator = document.getElementById('loading-indicator');
        const resultContainer = document.getElementById('result-container');

        // Make sure the result container is visible for insights
        resultContainer.style.display = 'block';
        loadingIndicator.style.display = 'block';
        resultContainer.innerHTML = '';
        try {
            const response = await fetch(`http://localhost:5001/api/insight/${ticker}`);
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const data = await response.json();
            resultContainer.innerHTML = `<h3>Insight for ${ticker}</h3><p>${data.insight}</p>`;
        } catch (error) {
            resultContainer.innerHTML = `<p style="color: #ff4d4d;">Error: ${error.message}</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    async function handleChatMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user-message');
        chatInput.value = '';
        appendMessage('Thinking...', 'bot-message', true);

        try {
            const response = await fetch(`http://localhost:5001/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            updateLastBotMessage(data.reply);
        } catch (error) {
            updateLastBotMessage('Sorry, I encountered an error. Please try again.');
            console.error('Chat error:', error);
        }
    }

    function appendMessage(text, className, isTyping = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${className}`;
        messageElement.textContent = text;
        if (isTyping) {
            messageElement.id = 'typing-indicator';
        }
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function updateLastBotMessage(text) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.textContent = text;
            typingIndicator.id = '';
        }
    }
});