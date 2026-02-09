import yfinance as yf
import pandas as pd

def get_stock_data(ticker_symbol):
    """
    Fetches current stock info and recent history.
    """
    try:
        ticker = yf.Ticker(ticker_symbol)
        
        # Get current info (price, etc)
        # Note: yfinance info can sometimes be slow/flaky, use fast_info if needed
        info = ticker.info 
        
        # Get recent history (e.g., last 1 month for sparklines)
        history = ticker.history(period="1mo")
        
        # Format history for frontend chart
        history_data = []
        for date, row in history.iterrows():
            history_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': row['Close']
            })

        return {
            'symbol': ticker_symbol.upper(),
            'name': info.get('longName', ticker_symbol),
            'current_price': info.get('currentPrice', info.get('regularMarketPrice')),
            'market_cap': info.get('marketCap'),
            'pe_ratio': info.get('trailingPE'),
            'history': history_data
        }
    except Exception as e:
        print(f"Error fetching stock data for {ticker_symbol}: {e}")
        return None

def get_trending_stocks():
    """
    Returns a hardcoded list of trending stocks for now, 
    or fetches from a specific source if available.
    """
    # yfinance doesn't have a direct 'trending' method that is reliable.
    # We will return a predefined list of popular tech stocks for the dashboard.
    return [
        get_stock_data('NVDA'),
        get_stock_data('TSLA'),
        get_stock_data('AAPL'),
        get_stock_data('MSFT')
    ]
