import streamlit as st
import pickle
import pandas as pd
import os

# 1. Page Configuration & Custom CSS Injection
st.set_page_config(
    page_title="CineSuggest // AI Movie Recommendation System",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom premium styling injected directly into Streamlit
st.markdown("""
<style>
    /* Reset and global dark-mode elements */
    .stApp {
        background-color: #07090e !important;
        background-image: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 50%),
                          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, rgba(0, 0, 0, 0) 50%) !important;
        color: #f1f5f9 !important;
    }
    
    /* Hide Streamlit header & branding for a pure custom look */
    header { visibility: hidden; }
    .stDeployButton { display: none !important; }
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    
    /* Title and description styles */
    .brand-title {
        font-family: 'Outfit', sans-serif;
        font-size: 54px;
        font-weight: 800;
        text-align: center;
        margin-top: 20px;
        letter-spacing: -1.5px;
    }
    .accent-text {
        background: linear-gradient(135deg, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .subtitle-text {
        font-family: 'Inter', sans-serif;
        color: #94a3b8;
        font-size: 16px;
        text-align: center;
        max-width: 700px;
        margin: 10px auto 40px auto;
        font-weight: 300;
        line-height: 1.6;
    }
    
    /* Query Movie Banner styling */
    .query-banner {
        background: rgba(13, 18, 30, 0.65);
        border: 1px solid rgba(124, 58, 237, 0.25);
        border-radius: 20px;
        padding: 30px;
        margin-bottom: 40px;
        display: flex;
        gap: 30px;
        align-items: center;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
    }
    .banner-poster {
        width: 180px;
        height: 270px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 24px;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .banner-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .banner-label {
        font-size: 10px;
        font-weight: 750;
        text-transform: uppercase;
        color: #06b6d4;
        letter-spacing: 2px;
        border: 1px solid rgba(6, 182, 212, 0.3);
        padding: 2px 10px;
        border-radius: 12px;
        align-self: flex-start;
        background: rgba(6, 182, 212, 0.08);
    }
    .banner-title {
        font-size: 32px;
        font-weight: 800;
        margin: 0;
    }
    .banner-tagline {
        font-style: italic;
        color: #a855f7;
        font-weight: 500;
    }
    .banner-meta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    .meta-badge {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    .genre-tag {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: #f1f5f9;
        font-size: 11px;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 30px;
    }
    .banner-overview {
        color: #94a3b8;
        font-size: 14px;
        line-height: 1.6;
        margin-top: 5px;
    }
    
    /* Recommendations grid and cards styling */
    .grid-title {
        font-size: 24px;
        font-weight: 700;
        margin: 40px 0 20px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .movie-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
        margin-bottom: 50px;
    }
    .movie-card {
        background: rgba(13, 18, 30, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .movie-card:hover {
        transform: translateY(-5px);
        border-color: rgba(124, 58, 237, 0.35);
        box-shadow: 0 10px 25px rgba(124, 58, 237, 0.15);
    }
    .card-poster {
        width: 100%;
        aspect-ratio: 2/3;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px;
        color: white;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .card-poster-shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
    }
    .card-badge-rating {
        align-self: flex-end;
        background: rgba(11, 15, 25, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: 700;
        font-size: 10px;
        padding: 3px 6px;
        border-radius: 6px;
    }
    .card-poster-emoji {
        font-size: 36px;
        align-self: center;
        margin-top: 15px;
        opacity: 0.85;
    }
    .card-poster-watermark {
        align-self: center;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1px;
        opacity: 0.15;
    }
    .card-info {
        padding: 14px;
        display: flex;
        flex-direction: column;
        flex: 1;
    }
    .card-genres {
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        color: #06b6d4;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .card-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 4px 0;
        height: 36px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .card-tagline {
        font-size: 10px;
        font-style: italic;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: auto;
    }
    
    /* Responsive Adjustments */
    @media (max-width: 1200px) {
        .movie-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 992px) {
        .movie-grid { grid-template-columns: repeat(3, 1fr); }
        .query-banner { flex-direction: column; text-align: center; }
        .banner-poster { margin: 0 auto; }
        .banner-details { align-items: center; }
    }
    @media (max-width: 768px) {
        .movie-grid { grid-template-columns: repeat(2, 1fr); }
        .brand-title { font-size: 38px; }
    }
    @media (max-width: 480px) {
        .movie-grid { grid-template-columns: 1fr; }
    }
</style>
""", unsafe_allow_html=True)

# 2. Dataset Loader (Cached for fast page loads)
@st.cache_resource
def load_models():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DF_PATH = os.path.join(BASE_DIR, "df.pkl")
    INDICES_PATH = os.path.join(BASE_DIR, "indices.pkl")
    TFIDF_MATRIX_PATH = os.path.join(BASE_DIR, "tfidf_matrix.pkl")
    
    with open(DF_PATH, 'rb') as f:
        df = pickle.load(f)
    with open(INDICES_PATH, 'rb') as f:
        indices = pickle.load(f)
    with open(TFIDF_MATRIX_PATH, 'rb') as f:
        tfidf_matrix = pickle.load(f)
        
    df = df.fillna({
        'title': 'Unknown Title',
        'overview': 'No description available.',
        'genres': '',
        'vote_average': 0.0,
        'tagline': '',
        'popularity': 0.0,
        'tag': ''
    })
    return df, indices, tfidf_matrix

try:
    df, indices, tfidf_matrix = load_models()
except Exception as e:
    st.error(f"Error loading pickle dataset files. Make sure 'df.pkl', 'indices.pkl', and 'tfidf_matrix.pkl' are placed in the root directory. Error: {e}")
    st.stop()

# 3. Helper Functions
def get_genre_gradient(genres_str):
    """Maps movie genres to rich CSS gradients and graphical icons matching the JS engine"""
    genres = str(genres_str).lower()
    
    if any(g in genres for g in ['sci-fi', 'science fiction', 'fantasy']):
        return "linear-gradient(135deg, #1e1b4b 0%, #0891b2 100%)", "#06b6d4", "🛸"
    elif any(g in genres for g in ['action', 'adventure', 'war']):
        return "linear-gradient(135deg, #4c0519 0%, #7c2d12 100%)", "#f97316", "⚔️"
    elif 'comedy' in genres:
        return "linear-gradient(135deg, #78350f 0%, #9a3412 100%)", "#eab308", "🎭"
    elif 'horror' in genres:
        return "linear-gradient(135deg, #020617 0%, #450a0a 100%)", "#dc2626", "💀"
    elif any(g in genres for g in ['romance', 'drama & romance']):
        return "linear-gradient(135deg, #4c0519 0%, #881337 100%)", "#ec4899", "💖"
    elif 'animation' in genres or 'family' in genres:
        return "linear-gradient(135deg, #3b0764 0%, #701a75 100%)", "#a855f7", "⭐"
    elif any(g in genres for g in ['thriller', 'mystery', 'crime']):
        return "linear-gradient(135deg, #022c22 0%, #0f172a 100%)", "#10b981", "🔍"
    elif any(g in genres for g in ['documentary', 'history']):
        return "linear-gradient(135deg, #064e3b 0%, #3f6212 100%)", "#84cc16", "🌍"
    elif 'drama' in genres:
        return "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", "#3b82f6", "🎬"
    else:
        return "linear-gradient(135deg, #2e1065 0%, #3b0764 100%)", "#8b5cf6", "🎥"

def clean_genres(genres_str):
    if not genres_str:
         return 'Cinema'
    return genres_str.replace(/[\[\]']/g, '').split(',')[0].strip()

def get_recommendations(title):
    """Core TF-IDF similarity matcher returning the top 10 matches"""
    try:
        # Resolve casing differences
        if title not in indices:
            matched_row = df[df['title'].str.lower() == title.lower()]
            if not matched_row.empty:
                title = matched_row.iloc[0]['title']
            else:
                return None, None
                
        movie_idx = indices[title]
        if isinstance(movie_idx, pd.Series):
            movie_idx = movie_idx.iloc[0]
            
        sim_scores = tfidf_matrix[movie_idx].dot(tfidf_matrix.T).toarray()[0]
        sim_scores = list(enumerate(sim_scores))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Exclude self, take top 10
        sim_scores = [x for x in sim_scores if x[0] != movie_idx][:10]
        movie_indices = [i[0] for i in sim_scores]
        
        return df.iloc[movie_idx], df.iloc[movie_indices]
    except Exception as e:
        print(f"Error computing recommendations: {e}")
        return None, None

# 4. Header UI
st.markdown('<h1 class="brand-title">Cine<span class="accent-text">Suggest</span></h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle-text">Enter any movie title, and our content-based vector similarity engine will mathematically analyze over 39,000 films to recommend 10 similar titles based on storylines, genres, and themes.</p>', unsafe_allow_html=True)

# 5. Search Bar Integration
# Use Streamlit's built-in searchable selectbox for clean prefix-autocomplete
all_movie_titles = sorted(df['title'].unique().tolist())

col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    selected_title = st.selectbox(
        label="Search Movie Dataset:",
        options=all_movie_titles,
        index=None,
        placeholder="Type or select a movie title (e.g. Toy Story, Inception...)",
        label_visibility="collapsed"
    )
    
    st.markdown('<div style="height:15px;"></div>', unsafe_allow_html=True)
    
    btn_col1, btn_col2, btn_col3 = st.columns([1, 1, 1])
    with btn_col2:
        search_button = st.button("✨ Match Similar", use_container_width=True)

st.markdown('<hr style="border: 0; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(124,58,237,0.3) 50%, rgba(255,255,255,0) 100%); margin: 40px 0;">', unsafe_allow_html=True)

# 6. Render Recommendations Section
if selected_title or search_button:
    if not selected_title:
        st.warning("Please type or select a movie title first!")
    else:
        with st.spinner("Analyzing 39,700 plot points & tags..."):
            query_movie, recs = get_recommendations(selected_title)
            
            if query_movie is None:
                st.error("Movie not found in the database.")
            else:
                # A. Render Selected Movie Banner
                grad, accent, emoji = get_genre_gradient(query_movie['genres'])
                
                genres_html = "".join([f'<span class="genre-tag">{g.strip()}</span>' for g in query_movie['genres'].replace(/[\[\]']/g, '').split(',') if g.strip()])
                rating_str = f"⭐ {query_movie['vote_average']:.1f} / 10" if query_movie['vote_average'] > 0 else "No Rating"
                
                banner_html = f"""
                <div class="query-banner">
                    <div class="banner-poster" style="background: {grad};">
                        <div class="card-poster-shimmer"></div>
                        <div class="card-badge-rating">{rating_str}</div>
                        <div class="card-poster-emoji">{emoji}</div>
                        <div class="card-poster-watermark">CINESUGGEST</div>
                    </div>
                    <div class="banner-details">
                        <div class="banner-label">Currently Analyzing</div>
                        <h2 class="banner-title">{query_movie['title']}</h2>
                        {f'<div class="banner-tagline">{query_movie["tagline"]}</div>' if query_movie['tagline'] else ''}
                        <div class="banner-meta">
                            <div class="meta-badge">Popularity: {round(query_movie['popularity'])}</div>
                            <div class="meta-badge">{rating_str}</div>
                        </div>
                        <div class="genre-container" style="display:flex; gap:8px; margin: 4px 0;">
                            {genres_html}
                        </div>
                        <p class="banner-overview">{query_movie['overview']}</p>
                    </div>
                </div>
                """
                st.markdown(banner_html, unsafe_allow_html=True)
                
                # B. Render Grid Title
                st.markdown('<h2 class="grid-title">🪄 Recommended for You</h2>', unsafe_allow_html=True)
                
                # C. Generate Grid HTML for the 10 recommendations
                grid_items_html = ""
                for _, rec in recs.iterrows():
                    rec_grad, _, rec_emoji = get_genre_gradient(rec['genres'])
                    rec_genre = clean_genres(rec['genres'])
                    rec_rating_str = f"⭐ {rec['vote_average']:.1f}" if rec['vote_average'] > 0 else "No Rating"
                    
                    grid_items_html += f"""
                    <div class="movie-card">
                        <div class="card-poster" style="background: {rec_grad};">
                            <div class="card-poster-shimmer"></div>
                            <div class="card-badge-rating">{rec_rating_str}</div>
                            <div class="card-poster-emoji">{rec_emoji}</div>
                            <div class="card-poster-watermark">CINESUGGEST</div>
                        </div>
                        <div class="card-info">
                            <span class="card-genres">{rec_genre}</span>
                            <h3 class="card-title" title="{rec['title']}">{rec['title']}</h3>
                            {f'<span class="card-tagline">{rec["tagline"]}</span>' if rec['tagline'] else ''}
                        </div>
                    </div>
                    """
                
                grid_wrapper_html = f"""
                <div class="movie-grid">
                    {grid_items_html}
                </div>
                """
                st.markdown(grid_wrapper_html, unsafe_allow_html=True)
else:
    # Onboarding Section (when no search has been made)
    st.info("💡 To start, search for a movie in the box above or select one from the list! The interface will automatically load and display your recommendations in real-time.")
