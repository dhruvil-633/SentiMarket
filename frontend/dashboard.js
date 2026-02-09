// Dashboard Interactions, Chart Rendering, and API Integration

const API_BASE = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Charts (Empty or with loaders)
    initCharts();

    // 2. Add Interactions
    setupInteractions();

    // 3. Routing / Data Fetching based on page
    const path = window.location.pathname;

    if (path.includes('dashboard.html') || path === '/') {
        fetchDashboardData();
    } else if (path.includes('analysis.html')) {
        // Default ticker for now, could be from URL params
        fetchAnalysisData('TSLA');
    } else if (path.includes('watchlist.html')) {
        fetchWatchlistData();
    } else if (path.includes('news.html')) {
        fetchNewsPageData();
    } else if (path.includes('compare.html')) {
        fetchCompareData();
    }
});

function setupInteractions() {
    // Add interactivity to watchlist "add" button
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // Ideally open a modal
            const ticker = prompt("Enter stock ticker to add:");
            if (ticker) addToWatchlist(ticker);
        });
    }

    // Toggle active state on nav items
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        // Basic active state handling
    });

    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// --- Data Fetching Functions ---

async function fetchDashboardData() {
    try {
        await Promise.all([
            fetchMarketIndices(),
            fetchTrendingStocks(),
            fetchNewsHome(),
            fetchMarketSentiment()
        ]);
        console.log("Dashboard data updated.");
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

async function fetchAnalysisData(ticker) {
    try {
        const response = await fetch(`${API_BASE}/analyze/${ticker}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // Update UI logic for Analysis Page
        document.querySelector('.stock-title h2').innerText = data.ticker;
        document.querySelector('.stock-title span').innerText = data.stock.name;
        document.querySelector('.stock-price-lg h2').innerText = `$${data.stock.current_price.toFixed(2)}`;

        // Update Chart (mock update for now, ideally replace data)
        // updateChart('mainStockChart', data.stock.history);

        console.log("Analysis data loaded", data);
    } catch (e) {
        console.error("Analysis load failed", e);
    }
}

async function fetchWatchlistData() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Update Watchlist UI
        renderWatchlist(data);
        console.log("Watchlist loaded", data);
    } catch (e) {
        console.error("Watchlist load failed", e);
    }
}

async function addToWatchlist(ticker) {
    const token = localStorage.getItem('access_token');
    if (!token) return alert("Please login first");

    try {
        // First get stock details to have name etc
        const stockRes = await fetch(`${API_BASE}/stock/${ticker}`);
        const stock = await stockRes.json();

        if (stock.error) return alert("Invalid Ticker");

        const response = await fetch(`${API_BASE}/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ticker: stock.symbol,
                name: stock.name,
                price: stock.current_price
            })
        });

        if (response.ok) {
            alert("Added to watchlist");
            if (window.location.pathname.includes('watchlist.html')) fetchWatchlistData();
        } else {
            alert("Failed to add");
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchNewsPageData() {
    // Similar to fetchNews() but maybe more items or specific logic
    fetchNewsHome();
}

// --- Render Helpers ---

function renderWatchlist(data) {
    const grid = document.querySelector('.watchlist-grid');
    if (!grid) return;

    // Clear existing (keep Add button if possible, or re-add it)
    // For now, simpler to clear all and re-add button at end
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px;">No stocks in watchlist</div>';
    } else {
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'stock-card';
            // Mock change/sentiment for now as watchlist table might just have ticker
            // Ideally we fetch current data for each watchlist item
            const change = ((Math.random() * 5) - 2).toFixed(2);
            const changeClass = change >= 0 ? 'positive' : 'negative';

            card.innerHTML = `
                <div class="card-top">
                    <div class="stock-logo" style="background:rgba(255,255,255,0.1);">${item.ticker[0]}</div>
                    <i class="fa-solid fa-trash menu-dots" onclick="removeFromWatchlist('${item.ticker}')" title="Remove"></i>
                </div>
                <div class="ticker-name">
                    <h3>${item.ticker}</h3>
                    <span>${item.name || item.ticker}</span>
                </div>
                <div class="sparkline-area"></div>
                <div class="card-bottom">
                    <div>
                        <div class="price-large">$${item.price ? item.price.toFixed(2) : '---'}</div>
                        <div class="price-change ${changeClass}"><i class="fa-solid fa-arrow-${change >= 0 ? 'up' : 'down'}"></i> ${Math.abs(change)}%</div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Add "Add Stock" card
    const addCard = document.createElement('div');
    addCard.className = 'stock-card add-stock-card';
    addCard.innerHTML = `
        <i class="fa-solid fa-plus fa-3x" style="margin-bottom: 16px;"></i>
        <span style="font-weight: 600;">Add Stock</span>
    `;
    addCard.addEventListener('click', () => {
        const ticker = prompt("Enter stock ticker:");
        if (ticker) addToWatchlist(ticker);
    });
    grid.appendChild(addCard);
}

async function removeFromWatchlist(ticker) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!confirm(`Remove ${ticker} from watchlist?`)) return;

    try {
        const response = await fetch(`${API_BASE}/watchlist?ticker=${ticker}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchWatchlistData();
        } else {
            alert("Failed to remove");
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchCompareData() {
    // For now, just log success as compare is complex UI
    console.log("Compare page loaded");
}


// --- Component Fetchers ---

async function fetchMarketIndices() {
    const indicesContainer = document.querySelector('.indices-container');
    if (!indicesContainer) return;

    // Tickers for S&P 500, Nasdaq, Dow Jones
    // Note: Free APIs might limit this, or yfinance might be slow. 
    // We'll try to fetch them one by one.
    const indices = [
        { name: 'S&P 500', ticker: '%5EGSPC' }, // URL encoded ^GSPC
        { name: 'NASDAQ', ticker: '%5EIXIC' },
        { name: 'DOW JONES', ticker: '%5EDJI' }
    ];

    indicesContainer.innerHTML = ''; // Clear placeholders

    for (const idx of indices) {
        try {
            const response = await fetch(`${API_BASE}/stock/${idx.ticker}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();

            // Calculate change (mocking % if not provided by simple info)
            // yfinance info often has regularMarketChangePercent
            let change = 0;
            // Mock change for visual demo if 0 returned (common with some yfinance versions on indices)
            // In production, use rigorous checking.

            const price = data.current_price ? data.current_price.toFixed(2) : '---';
            const changeClass = 'positive'; // simplified

            const card = document.createElement('div');
            card.className = 'index-card';
            card.innerHTML = `
                <div class="index-info">
                    <span>${idx.name}</span>
                    <h4>${price}</h4>
                </div>
                <div class="index-change ${changeClass}">Live</div>
            `;
            indicesContainer.appendChild(card);

        } catch (err) {
            console.warn(`Could not fetch index ${idx.name}`, err);
            const card = document.createElement('div');
            card.className = 'index-card';
            card.innerHTML = `
                <div class="index-info">
                    <span>${idx.name}</span>
                    <h4>---</h4>
                </div>
                <div class="index-change">N/A</div>
            `;
            indicesContainer.appendChild(card);
        }
    }
}

async function fetchTrendingStocks() {
    const listContainer = document.querySelector('.stock-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="padding:20px; text-align:center;">Loading trending stocks...</div>';

    try {
        const response = await fetch(`${API_BASE}/trending`);
        const stocks = await response.json();

        listContainer.innerHTML = ''; // Clear loader

        stocks.forEach(stock => {
            if (!stock) return;

            const change = ((Math.random() * 5) - 2).toFixed(2); // Mock change for demo as yfinance history is heavy to calc per call
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const iconLetter = stock.symbol[0];

            const item = document.createElement('div');
            item.className = 'stock-item';
            item.innerHTML = `
                <div class="stock-info">
                    <div class="stock-icon" style="background: rgba(255,255,255,0.1); color:white;">${iconLetter}</div>
                    <div>
                        <h4>${stock.symbol}</h4>
                        <span>${stock.name.substring(0, 15)}...</span>
                    </div>
                </div>
                <div class="stock-graph">
                    <canvas id="chart-${stock.symbol}" height="30"></canvas>
                </div>
                <div class="stock-price">
                    <h4>$${stock.current_price?.toFixed(2)}</h4>
                    <span class="${changeClass}">${change > 0 ? '+' : ''}${change}%</span>
                </div>
            `;
            listContainer.appendChild(item);

            // Render mini chart
            renderSparkline(`chart-${stock.symbol}`, stock.history);
        });

    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color: var(--danger);">Failed to load trending stocks</div>';
    }
}

async function fetchNewsHome() {
    const newsContainer = document.querySelector('.news-list');
    if (!newsContainer) return;

    newsContainer.innerHTML = '<div style="padding:20px; text-align:center;">Loading latest news...</div>';

    try {
        const response = await fetch(`${API_BASE}/news?limit=3`);
        const newsItems = await response.json();

        newsContainer.innerHTML = '';

        if (newsItems.length === 0) {
            newsContainer.innerHTML = '<div style="padding:20px; text-align:center;">No recent news found.</div>';
            return;
        }

        newsItems.forEach(item => {
            const date = new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Random sentiment for demo until we integrate bulk analysis
            const sentiments = ['positive', 'negative', 'neutral'];
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-badge ${sentiment}">${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</div>
                <h4>${item.title}</h4>
                <p>${item.description ? item.description.substring(0, 80) + '...' : 'No description available.'}</p>
                <span class="news-meta">${item.source} • ${date}</span>
                <a href="${item.url}" target="_blank" style="font-size:12px; color:var(--primary); margin-top:8px; display:inline-block;">Read more</a>
            `;
            newsContainer.appendChild(card);
        });

    } catch (err) {
        newsContainer.innerHTML = '<div style="padding:20px; text-align:center; color: var(--danger);">Failed to load news</div>';
    }
}

async function fetchMarketSentiment() {
    // This would ideally hit an endpoint that aggregates sentiment
    // For now, we update the UI to show active status
    const statusEl = document.querySelector('.sentiment-status');
    if (statusEl) {
        statusEl.innerHTML = `Scanning Market...`;
        setTimeout(() => {
            statusEl.innerHTML = `Bullish <i class="fa-solid fa-arrow-trend-up"></i>`;
            statusEl.classList.add('positive');
        }, 2000);
    }
}

// Charting Helpers
function renderSparkline(canvasId, historyData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Safety check if historyData is present
    if (!historyData || historyData.length === 0) return;

    const prices = historyData.map(h => h.price);
    const labels = historyData.map(h => h.date);

    // Determine color based on trend
    const isUp = prices[prices.length - 1] >= prices[0];
    const color = isUp ? '#22c55e' : '#ef4444'; // Green or Red

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                borderColor: color,
                backgroundColor: isUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                fill: true,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 }
            }
        }
    });
}

function initCharts() {
    // Helper to safely create chart if element exists
    const createSafeChart = (id, config) => {
        const el = document.getElementById(id);
        if (el) return new Chart(el, config);
        return null;
    };

    // -- Main Sentiment Chart (Dashboard) --
    createSafeChart('sentimentChart', {
        type: 'bar',
        data: {
            labels: ['Tech', 'Finance', 'Energy', 'Health', 'Consumer'],
            datasets: [
                {
                    label: 'Positive',
                    data: [65, 45, 20, 55, 40],
                    backgroundColor: '#22c55e',
                    borderRadius: 4
                },
                {
                    label: 'Neutral',
                    data: [20, 30, 40, 30, 40],
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                },
                {
                    label: 'Negative',
                    data: [15, 25, 40, 15, 20],
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    stacked: true,
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { display: false }
                }
            }
        }
    });

    // -- Analysis Page Main Chart --
    createSafeChart('mainStockChart', {
        type: 'line',
        data: {
            labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
            datasets: [{
                label: 'Price',
                data: [238, 241, 240, 242, 244, 243, 245.32],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });

    // -- Compare Page Chart --
    createSafeChart('compareChart', {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'TSLA',
                    data: [100, 95, 110, 105, 120, 125], // Normalized
                    borderColor: '#38bdf8',
                    tension: 0.4
                },
                {
                    label: 'AAPL',
                    data: [100, 102, 105, 103, 106, 108],
                    borderColor: '#94a3b8',
                    tension: 0.4
                },
                {
                    label: 'NVDA',
                    data: [100, 120, 140, 130, 150, 160],
                    borderColor: '#22c55e',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}
