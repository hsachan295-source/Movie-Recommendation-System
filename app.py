import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Paths to pickle files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DF_PATH = os.path.join(BASE_DIR, "df.pkl")
INDICES_PATH = os.path.join(BASE_DIR, "indices.pkl")
TFIDF_MATRIX_PATH = os.path.join(BASE_DIR, "tfidf_matrix.pkl")

# Global variables for loaded models
df = None
indices = None
tfidf_matrix = None

print("Loading dataset and recommendation models...")
try:
    with open(DF_PATH, 'rb') as f:
        df = pickle.load(f)
    with open(INDICES_PATH, 'rb') as f:
        indices = pickle.load(f)
    with open(TFIDF_MATRIX_PATH, 'rb') as f:
        tfidf_matrix = pickle.load(f)
    
    # Fill NaN values in df to avoid JSON serialization issues
    df = df.fillna({
        'title': 'Unknown Title',
        'overview': 'No description available.',
        'genres': '',
        'vote_average': 0.0,
        'tagline': '',
        'popularity': 0.0,
        'tag': ''
    })
    
    print(f"Successfully loaded {len(df)} movies.")
except Exception as e:
    print(f"Error loading pickle files: {e}")

@app.route('/')
def index():
    """Serve the main frontend application."""
    return render_template('index.html')

@app.route('/api/search', methods=['GET'])
def search_movies():
    """
    Search endpoint for autocomplete dropdown.
    Returns prefix-matching movies first, followed by substring-matching movies.
    """
    query = request.args.get('q', '').strip().lower()
    if not query:
        return jsonify([])
    
    try:
        # 1. Filter movies starting with the query (prefix search)
        prefix_matches = df[df['title'].str.lower().str.startswith(query, na=False)]
        
        # 2. Filter movies containing the query but not starting with it
        contains_matches = df[
            df['title'].str.lower().str.contains(query, na=False) & 
            ~df['title'].str.lower().str.startswith(query, na=False)
        ]
        
        # Combine matches, showing prefix matches first, and sort by popularity/rating
        combined = pd.concat([prefix_matches, contains_matches])
        
        # Limit matches to top 8 and parse into a lightweight dictionary list
        results = []
        for idx, row in combined.head(8).iterrows():
            results.append({
                'title': row['title'],
                'genres': row['genres'],
                'vote_average': float(row['vote_average']),
                'tagline': row['tagline']
            })
            
        return jsonify(results)
    except Exception as e:
        print(f"Search API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend', methods=['POST'])
def recommend_movies():
    """
    Recommendation engine endpoint.
    Expects JSON: { "title": "Movie Title Here" }
    Returns top 10 recommended movies.
    """
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    
    if not title:
        return jsonify({'error': 'Movie title is required.'}), 400
    
    try:
        # Check if movie exists in our indices
        if title not in indices:
            # Let's do a case-insensitive lookup if direct lookup fails
            matched_row = df[df['title'].str.lower() == title.lower()]
            if not matched_row.empty:
                title = matched_row.iloc[0]['title']
            else:
                return jsonify({'error': f"Movie '{title}' not found in database."}), 404
        
        movie_idx = indices[title]
        # Handle duplicates in indices mapping (e.g. pandas Series returned instead of int)
        if isinstance(movie_idx, pd.Series):
            movie_idx = movie_idx.iloc[0]
            
        # Compute dot product similarities (since tfidf matrix vectors are normalized, dot = cosine sim)
        sim_scores = tfidf_matrix[movie_idx].dot(tfidf_matrix.T).toarray()[0]
        
        # Enumerate and sort by similarity score descending
        sim_scores = list(enumerate(sim_scores))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Exclude the query movie itself, grab the top 10
        sim_scores = [x for x in sim_scores if x[0] != movie_idx][:10]
        movie_indices = [i[0] for i in sim_scores]
        
        # Fetch recommended movies metadata
        recommendations = df.iloc[movie_indices]
        
        results = []
        for _, row in recommendations.iterrows():
            results.append({
                'title': row['title'],
                'overview': row['overview'],
                'genres': row['genres'],
                'vote_average': float(row['vote_average']),
                'tagline': row['tagline'],
                'popularity': float(row['popularity'])
            })
            
        # Fetch query movie details using the original index (not loop variable)
        query_movie_row = df.iloc[movie_idx]
        query_movie = {
            'title': query_movie_row['title'],
            'overview': query_movie_row['overview'],
            'genres': query_movie_row['genres'],
            'vote_average': float(query_movie_row['vote_average']),
            'tagline': query_movie_row['tagline'],
            'popularity': float(query_movie_row['popularity'])
        }
            
        return jsonify({
            'query_movie': query_movie,
            'recommendations': results
        })
        
    except Exception as e:
        print(f"Recommendation API error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
