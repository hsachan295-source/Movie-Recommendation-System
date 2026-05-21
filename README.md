# CineSuggest // Premium AI Movie Recommendation System

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Render-6366f1?style=for-the-badge&logo=render&logoColor=white)](https://movie-recommendation-system-5gbq.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)

CineSuggest is a cinematic, state-of-the-art Single-Page Web Application (SPA) that recommends mathematically similar movies based on content features (genres, plot overviews, and story tags). It combines a highly optimized Python recommendation engine with a highly polished modern user interface featuring translucent glassmorphism panels, glowing neon accents, and smooth micro-animations.

---

## 🌐 Live Demo

**🎬 Try it live here → [https://movie-recommendation-system-5gbq.onrender.com](https://movie-recommendation-system-5gbq.onrender.com)**

> ⚠️ Hosted on Render free tier — the app may take **~30 seconds to wake up** on first visit if it has been idle.

---

## 🌟 Key Features

- **High-Performance Content-Based Matcher**: Uses TF-IDF vectorization and sparse matrix dot-product similarity (cosine similarity) to scan over 39,000 films and deliver recommendations in under **0.05 seconds**!
- **Sleek Glassmorphic UI**: Premium dark mode theme built with pure CSS containing ambient backdrop blurring, custom typography, glowing shadows, and micro-hover transitions.
- **Smart Autocomplete Search**: An interactive autocomplete search box that indexes prefix matches first, helping users seamlessly select movies without manual typing errors.
- **Dynamic Genre-Based Canvas Poster Generator**: Renders unique, gorgeous abstract cinematic cover art dynamically inside HTML5 Canvas based on the movie's specific genres (e.g. neon cyan/purple for Sci-Fi, deep crimson/jet black for Horror, flame orange for Action), ensuring a complete visual aesthetic without missing poster fallbacks.
- **Endless Exploration Loop**: Interactive movie details modal containing film descriptions, rating metrics, genres, and a **"Find Matches Similar to This"** button that lets users navigate endlessly from one suggestion to another.

---

## 🛠️ Tech Stack

- **Backend**: Flask (Python 3.x), Pandas, Scikit-learn, Scipy
- **Frontend**: HTML5, Vanilla CSS3 (Custom properties, grid, flexbox), Vanilla JavaScript (HTML5 Canvas drawing APIs, debouncing, keyboard navigation accessibility)
- **Algorithms**: Content-based filtering, TF-IDF Vectorization, Cosine Similarity via sparse matrix dot-product

---

## 📂 Project Structure

```text
├── app.py                  # Main Flask backend and REST API endpoints
├── run.py                  # Automatic dependency checking and launcher utility
├── requirements.txt        # Backend dependencies
├── .gitignore              # Ignores large pickle files & pycache
├── templates/
│   └── index.html          # Semantic HTML5 SPA structure
└── static/
    ├── style.css           # Premium glassmorphic styling system
    └── app.js              # Keyboard-accessible search, modal triggers & Canvas poster engines
```

*Note: For the application to function locally, the dataset pickle files (`df.pkl`, `indices.pkl`, `tfidf.pkl`, and `tfidf_matrix.pkl`) must be placed in the project root directory.*

---

## 🚀 Setup and Launch

### Prerequisite
Ensure Python 3.8+ is installed on your system.

### Running Automatically (Recommended)
Simply run the helper launcher utility in your terminal:
```bash
python run.py
```
This utility will automatically verify your python packages, install `flask` if it is missing, and launch the web server.

### Running Manually
1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Launch the Flask application:
   ```bash
   python app.py
   ```
3. Open your browser and navigate to:
   [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🧬 How the Recommendation Algorithm Works

1. **Feature Synthesis**: Plot descriptions, movie genres, tags, and key metadata are combined and cleaned to form a unified text representation for each movie.
2. **Vector Space Model (TF-IDF)**: The vectorizer maps the dataset into a sparse matrix representing word frequencies adjusted for corpus-wide importance.
3. **Similarity Indexing**: The dot-product is calculated between the query movie's vectorized representation and all other movies in the sparse dataset matrix. Since the TF-IDF vectors are unit-normalized, the dot product computes the cosine similarity instantly:
   $$\text{similarity}(A, B) = A \cdot B$$
4. **Ranked Sorting**: The top 10 matches are returned (excluding the searched movie itself) and rendered as cinematic cards.
