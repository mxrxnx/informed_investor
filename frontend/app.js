const form = document.getElementById('insight-form');
const tickerInput = document.getElementById('ticker-input');
const resultContainer = document.getElementById('result-container');
const loadingIndicator = document.getElementById('loading-indicator');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    const ticker = tickerInput.value.trim().toUpperCase();
    if (!ticker) return;

    // Show loading state and clear previous results
    loadingIndicator.style.display = 'block';
    resultContainer.innerHTML = '';

    try {
        // Send the ticker to the backend API
        const response = await fetch(`http://localhost:5001/api/insight/${ticker}`);

        if (!response.ok) {
            throw new Error('Failed to get a response from the server.');
        }

        const data = await response.json();
        
        // Display the result
        resultContainer.innerHTML = `<p>${data.insight}</p>`;

    } catch (error) {
        // Display an error message
        resultContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Fetch error:', error);
    } finally {
        // Always hide the loading indicator
        loadingIndicator.style.display = 'none';
    }
});