// Dashboard Interactions and Chart Rendering

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Charts
    initCharts();

    // 2. Add Interactions
    setupInteractions();
});

function setupInteractions() {
    // Add interactivity to watchlist "add" button (simulation)
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            alert("Add Stock feature would open a modal here.");
        });
    }

    // Toggle active state on nav items
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.nav-links li.active').classList.remove('active');
            link.parentElement.classList.add('active');
        });
    });
}

function initCharts() {
    // Common Chart Options for Mini Sparklines
    const sparklineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2, tension: 0.4 }
        }
    };

    // Data Generators (Mock)
    const generateData = (count) => Array.from({ length: count }, () => Math.floor(Math.random() * 50) + 100);

    // -- Chart: TSLA --
    new Chart(document.getElementById('chart-tsla'), {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7],
            datasets: [{
                data: [210, 215, 220, 218, 225, 230, 245],
                borderColor: '#e60000',
                backgroundColor: 'rgba(230, 0, 0, 0.1)',
                fill: true
            }]
        },
        options: sparklineOptions
    });

    // -- Chart: NVDA --
    new Chart(document.getElementById('chart-nvda'), {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7],
            datasets: [{
                data: [480, 490, 500, 510, 505, 520, 546],
                borderColor: '#76b900',
                backgroundColor: 'rgba(118, 185, 0, 0.1)',
                fill: true
            }]
        },
        options: sparklineOptions
    });

    // -- Chart: AAPL --
    new Chart(document.getElementById('chart-aapl'), {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7],
            datasets: [{
                data: [195, 194, 193, 192, 190, 191, 192],
                borderColor: '#ef4444', // Red for down
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
            }]
        },
        options: sparklineOptions
    });

    // -- Main Sentiment Chart --
    const sentimentCtx = document.getElementById('sentimentChart');
    new Chart(sentimentCtx, {
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
            plugins: {
                legend: { display: false } // Custom legend in HTML
            },
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
}
