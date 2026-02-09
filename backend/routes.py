from flask import Blueprint, jsonify, request
from services.stock_service import get_stock_data, get_trending_stocks
from services.news_service import get_market_news
from services.sentiment_service import get_sentiment_pipeline, analyze_sentiment
from db import supabase

api_bp = Blueprint('api', __name__)

# --- Auth Routes ---
@api_bp.route('/register', methods=['POST'])
def register():
    if not supabase:
        return jsonify({'error': 'Database not connected'}), 503
        
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return jsonify({'user': res.user, 'session': res.session})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api_bp.route('/login', methods=['POST'])
def login():
    if not supabase:
        return jsonify({'error': 'Database not connected'}), 503

    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return jsonify({'user': res.user, 'session': res.session})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

# --- Watchlist Routes ---
@api_bp.route('/watchlist', methods=['GET', 'POST', 'DELETE'])
def watchlist():
    if not supabase:
        return jsonify({'error': 'Database not connected'}), 503

    # Get token from header
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Missing Authorization header'}), 401
    
    try:
        # Verify user
        user = supabase.auth.get_user(token.replace('Bearer ', ''))
        user_id = user.user.id
        
        if request.method == 'GET':
            res = supabase.table('watchlist').select('*').eq('user_id', user_id).execute()
            return jsonify(res.data)
            
        elif request.method == 'POST':
            stock_data = request.json
            stock_data['user_id'] = user_id
            res = supabase.table('watchlist').insert(stock_data).execute()
            return jsonify(res.data)
            
        elif request.method == 'DELETE':
            ticker = request.args.get('ticker')
            res = supabase.table('watchlist').delete().eq('user_id', user_id).eq('ticker', ticker).execute()
            return jsonify(res.data)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 401

# --- Existing Routes ---
@api_bp.route('/stock/<ticker>', methods=['GET'])
def stock_detail(ticker):
    data = get_stock_data(ticker)
    if data:
        return jsonify(data)
    return jsonify({'error': 'Stock not found'}), 404

@api_bp.route('/trending', methods=['GET'])
def trending_stocks():
    stocks = get_trending_stocks()
    return jsonify(stocks)

@api_bp.route('/news', methods=['GET'])
def news():
    limit = request.args.get('limit', 5)
    keywords = request.args.get('keywords')
    news_items = get_market_news(limit=int(limit), keywords=keywords)
    return jsonify(news_items)

@api_bp.route('/analyze/<ticker>', methods=['GET'])
def analyze_ticker(ticker):
    # 1. Get stock data
    stock_info = get_stock_data(ticker)
    if not stock_info:
        return jsonify({'error': 'Stock not found'}), 404

    # 2. Get recent news for this ticker
    news_items = get_market_news(limit=5, keywords=stock_info['name'])
    
    # 3. Analyze sentiment of news
    sentiment_score = 0
    sentiment_label = "Neutral"
    
    # Simple aggregation for demo (FinBERT is heavy, we'll try to load it)
    pipeline = get_sentiment_pipeline()
    
    if pipeline and news_items:
        total_score = 0
        count = 0
        for item in news_items:
            # Analyze title
            text = item['title']
            # FinBERT returns [{'label': 'positive', 'score': 0.9}, ...]
            result = pipeline(text)[0] 
            
            score = result['score']
            if result['label'] == 'negative':
                score = -score
            elif result['label'] == 'neutral':
                score = 0
            
            total_score += score
            count += 1
        
        if count > 0:
            avg_score = total_score / count
            sentiment_score = avg_score
            if avg_score > 0.3:
                sentiment_label = "Bullish"
            elif avg_score < -0.3:
                sentiment_label = "Bearish"

    return jsonify({
        'ticker': ticker,
        'stock': stock_info,
        'news': news_items,
        'sentiment': {
            'score': sentiment_score,
            'label': sentiment_label
        }
    })
