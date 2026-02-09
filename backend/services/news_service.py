import requests
import os

MEDIASTACK_API_KEY = os.getenv('MEDIASTACK_API_KEY')
BASE_URL = "http://api.mediastack.com/v1/news"

def get_market_news(limit=5, keywords=None):
    """
    Fetches general finance/market news or specific keyword news.
    """
    if not MEDIASTACK_API_KEY:
        print("Warning: MEDIASTACK_API_KEY not found in environment variables.")
        return []

    params = {
        'access_key': MEDIASTACK_API_KEY,
        'categories': 'business,technology',
        'languages': 'en',
        'limit': limit,
        'sort': 'published_desc'
    }
    
    if keywords:
        params['keywords'] = keywords

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()
        
        if 'data' in data:
            news_items = []
            for item in data['data']:
                news_items.append({
                    'title': item['title'],
                    'description': item['description'],
                    'source': item['source'],
                    'url': item['url'],
                    'image': item['image'],
                    'published_at': item['published_at']
                })
            return news_items
        else:
            print(f"MediaStack API Error: {data.get('error')}")
            return []
            
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []
