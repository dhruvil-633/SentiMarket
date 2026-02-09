from transformers import pipeline
import torch

# Initialize FinBERT pipeline
# We use a singleton pattern or global variable to load it only once
sentiment_pipeline = None

def get_sentiment_pipeline():
    global sentiment_pipeline
    if sentiment_pipeline is None:
        print("Loading FinBERT model... this may take a while.")
        try:
            sentiment_pipeline = pipeline("text-classification", model="ProsusAI/finbert", return_all_scores=True)
            print("FinBERT model loaded successfully.")
        except Exception as e:
            print(f"Error loading FinBERT: {e}")
            return None
    return sentiment_pipeline

def analyze_sentiment(text):
    """
    Analyzes sentiment of a given text using FinBERT.
    Returns: { 'positive': 0.95, 'negative': 0.02, 'neutral': 0.03 }
    """
    pipe = get_sentiment_pipeline()
    if not pipe:
        return {'positive': 0, 'negative': 0, 'neutral': 0}

    try:
        # Truncate text if too long for BERT (512 tokens approx)
        # Simple char truncation for safety
        truncated_text = text[:1000] 
        results = pipe(truncated_text)
        
        # ProssusAI/finbert returns a list of lists of dicts
        # [[{'label': 'positive', 'score': 0.9}, ...]]
        
        scores = {}
        for item in results[0]:
            scores[item['label']] = item['score']
            
        return scores
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return {'positive': 0, 'negative': 0, 'neutral': 0}

def aggregate_sentiment(news_items):
    """
    Analyzes a list of news items and returns an average sentiment.
    """
    if not news_items:
        return None

    total_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
    count = 0

    for item in news_items:
        # Analyze title and description
        text = f"{item['title']}. {item['description']}"
        scores = analyze_sentiment(text)
        
        total_scores['positive'] += scores.get('positive', 0)
        total_scores['negative'] += scores.get('negative', 0)
        total_scores['neutral'] += scores.get('neutral', 0)
        count += 1
    
    if count == 0:
        return None

    # Average
    return {k: v / count for k, v in total_scores.items()}
