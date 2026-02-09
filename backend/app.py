from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes

    # Import routes
    from routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def health_check():
        return {'status': 'healthy', 'message': 'SentiMarket Backend is running'}

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
