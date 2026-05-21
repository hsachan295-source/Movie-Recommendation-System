/* ==========================================================================
   CineSuggest Frontend JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('movie-search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchSpinner = document.getElementById('search-spinner');
    
    const onboardingSection = document.getElementById('onboarding-section');
    const recommendationsSection = document.getElementById('recommendations-section');
    const recommendationsGrid = document.getElementById('recommendations-grid');
    const queryMovieContainer = document.getElementById('query-movie-container');
    const globalLoader = document.getElementById('global-loader');
    
    const movieDetailModal = document.getElementById('movie-detail-modal');
    const modalContentArea = document.getElementById('modal-content-area');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const brandLogo = document.getElementById('brand-logo');

    // State Variables
    let searchDebounceTimeout = null;
    let autocompleteItems = [];
    let currentFocusIndex = -1;

    /* ==========================================================================
       1. Poster Generation Engine (HTML5 Canvas Artwork)
       ========================================================================== */

    /**
     * Map genres to rich cinematic HSL color schemes
     */
    function getGenreColorPalette(genresStr) {
        const genres = genresStr.toLowerCase();
        
        const palettes = {
            scifi: {
                grad1: 'hsl(260, 85%, 20%)', // Deep Indigo
                grad2: 'hsl(190, 90%, 15%)', // Deep Cyan
                accent: 'hsl(180, 100%, 50%)', // Neon Cyan
                symbol: 'aperture'
            },
            action: {
                grad1: 'hsl(350, 75%, 15%)', // Crimson Dark
                grad2: 'hsl(15, 80%, 12%)',  // Dark Rust
                accent: 'hsl(10, 95%, 55%)',  // Flame Orange
                symbol: 'shield'
            },
            comedy: {
                grad1: 'hsl(35, 90%, 18%)',  // Deep Amber
                grad2: 'hsl(20, 85%, 15%)',  // Burnt Sienna
                accent: 'hsl(45, 95%, 55%)',  // Sun Gold
                symbol: 'comedy'
            },
            horror: {
                grad1: 'hsl(0, 0%, 5%)',     // Jet Black
                grad2: 'hsl(0, 85%, 10%)',    // Blood Maroon
                accent: 'hsl(0, 100%, 45%)',   // Blood Red
                symbol: 'skull'
            },
            romance: {
                grad1: 'hsl(320, 70%, 18%)', // Deep Wine
                grad2: 'hsl(340, 60%, 15%)', // Dark Rose
                accent: 'hsl(330, 85%, 60%)', // Hot Pink
                symbol: 'heart'
            },
            drama: {
                grad1: 'hsl(220, 60%, 15%)', // Royal Blue Slate
                grad2: 'hsl(240, 50%, 10%)', // Midnight Blue
                accent: 'hsl(210, 90%, 50%)', // Neon Blue
                symbol: 'drama'
            },
            animation: {
                grad1: 'hsl(280, 70%, 20%)', // Purple Rain
                grad2: 'hsl(310, 65%, 18%)', // Dark Orchid
                accent: 'hsl(290, 90%, 60%)', // Neon Purple
                symbol: 'star'
            },
            thriller: {
                grad1: 'hsl(160, 60%, 10%)', // Deep Emerald Dark
                grad2: 'hsl(200, 70%, 8%)',  // Abyss Navy
                accent: 'hsl(145, 85%, 45%)',  // Poison Green
                symbol: 'crosshair'
            },
            documentary: {
                grad1: 'hsl(120, 45%, 12%)', // Forest Dark
                grad2: 'hsl(60, 30%, 10%)',  // Olive Dark
                accent: 'hsl(90, 80%, 45%)',  // Lime Eco
                symbol: 'globe'
            },
            default: {
                grad1: 'hsl(270, 50%, 15%)', // Indigo Violet
                grad2: 'hsl(290, 45%, 12%)', // Deep Purple
                accent: 'hsl(280, 85%, 55%)', // Bright Purple
                symbol: 'reel'
            }
        };

        if (genres.includes('sci-fi') || genres.includes('science fiction') || genres.includes('fantasy')) {
            return palettes.scifi;
        } else if (genres.includes('action') || genres.includes('adventure') || genres.includes('war')) {
            return palettes.action;
        } else if (genres.includes('comedy')) {
            return palettes.comedy;
        } else if (genres.includes('horror')) {
            return palettes.horror;
        } else if (genres.includes('romance') || genres.includes('drama & romance')) {
            return palettes.romance;
        } else if (genres.includes('animation') || genres.includes('family')) {
            return palettes.animation;
        } else if (genres.includes('thriller') || genres.includes('mystery') || genres.includes('crime')) {
            return palettes.thriller;
        } else if (genres.includes('documentary') || genres.includes('history')) {
            return palettes.documentary;
        } else if (genres.includes('drama')) {
            return palettes.drama;
        }
        
        return palettes.default;
    }

    /**
     * Renders a premium abstract movie poster cover onto a Canvas element
     */
    function renderCustomPoster(canvas, title, genresStr, tagline) {
        const ctx = canvas.getContext('2d');
        const width = 400;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        const palette = getGenreColorPalette(genresStr);

        // 1. Draw rich background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, palette.grad1);
        bgGrad.addColorStop(1, palette.grad2);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Draw modern diagonal glass shimmer lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 2;
        for (let i = -width; i < width * 2; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 300, height);
            ctx.stroke();
        }

        // 3. Draw premium background concentric circles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.4, 180, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.4, 120, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.4, 60, 0, Math.PI * 2);
        ctx.stroke();

        // 4. Draw stylized neon centerpiece geometry based on genre theme
        ctx.shadowColor = palette.accent;
        ctx.shadowBlur = 25;
        ctx.strokeStyle = palette.accent;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 3;

        const centerX = width / 2;
        const centerY = height * 0.4;

        if (palette.symbol === 'aperture') {
            // Draw camera aperture geometric iris
            ctx.beginPath();
            ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw blades
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const sx = centerX + Math.cos(angle) * 45;
                const sy = centerY + Math.sin(angle) * 45;
                const ex = centerX + Math.cos(angle + 0.8) * 80;
                const ey = centerY + Math.sin(angle + 0.8) * 80;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
        } else if (palette.symbol === 'shield') {
            // Draw sleek cinematic shield/chevron
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 50);
            ctx.lineTo(centerX + 40, centerY - 30);
            ctx.lineTo(centerX + 40, centerY + 15);
            ctx.quadraticCurveTo(centerX + 40, centerY + 55, centerX, centerY + 70);
            ctx.quadraticCurveTo(centerX - 40, centerY + 55, centerX - 40, centerY + 15);
            ctx.lineTo(centerX - 40, centerY - 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (palette.symbol === 'comedy') {
            // Draw comedy mask geometric abstraction
            ctx.beginPath();
            ctx.arc(centerX, centerY, 45, 0, Math.PI, false);
            ctx.stroke();
            // Eyes
            ctx.beginPath();
            ctx.arc(centerX - 18, centerY - 10, 6, 0, Math.PI * 2);
            ctx.arc(centerX + 18, centerY - 10, 6, 0, Math.PI * 2);
            ctx.fillStyle = palette.accent;
            ctx.fill();
        } else if (palette.symbol === 'skull') {
            // Horror geometric skull profile
            ctx.beginPath();
            ctx.arc(centerX, centerY - 15, 38, Math.PI, 0); // skull cap
            ctx.lineTo(centerX + 38, centerY + 15);
            ctx.lineTo(centerX + 20, centerY + 45);
            ctx.lineTo(centerX - 20, centerY + 45);
            ctx.lineTo(centerX - 38, centerY + 15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Eye sockets
            ctx.fillStyle = '#05070a';
            ctx.beginPath();
            ctx.arc(centerX - 15, centerY + 2, 8, 0, Math.PI * 2);
            ctx.arc(centerX + 15, centerY + 2, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (palette.symbol === 'heart') {
            // Beautiful minimalist heart shape
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 35);
            ctx.bezierCurveTo(centerX - 50, centerY - 15, centerX - 40, centerY - 55, centerX, centerY - 30);
            ctx.bezierCurveTo(centerX + 40, centerY - 55, centerX + 50, centerY - 15, centerX, centerY + 35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (palette.symbol === 'star') {
            // Sparkly 5-point star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                const angle2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
                ctx.lineTo(centerX + Math.cos(angle1) * 50, centerY + Math.sin(angle1) * 50);
                ctx.lineTo(centerX + Math.cos(angle2) * 22, centerY + Math.sin(angle2) * 22);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (palette.symbol === 'crosshair') {
            // Precision target crosshair
            ctx.beginPath();
            ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
            ctx.stroke();
            // Lines
            ctx.beginPath();
            ctx.moveTo(centerX - 60, centerY); ctx.lineTo(centerX - 10, centerY);
            ctx.moveTo(centerX + 10, centerY); ctx.lineTo(centerX + 60, centerY);
            ctx.moveTo(centerX, centerY - 60); ctx.lineTo(centerX, centerY - 10);
            ctx.moveTo(centerX, centerY + 10); ctx.lineTo(centerX, centerY + 60);
            ctx.stroke();
        } else if (palette.symbol === 'globe') {
            // Abstract planetary globe
            ctx.beginPath();
            ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
            ctx.stroke();
            // Latitude lines
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 45, 15, 0, 0, Math.PI * 2);
            ctx.ellipse(centerX, centerY, 15, 45, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Classic abstract movie reel
            ctx.beginPath();
            ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
            ctx.stroke();
            
            // Core reels
            ctx.fillStyle = '#05070a';
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5;
                const holeX = centerX + Math.cos(angle) * 24;
                const holeY = centerY + Math.sin(angle) * 24;
                ctx.beginPath();
                ctx.arc(holeX, holeY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = palette.accent;
                ctx.stroke();
            }
        }

        // Reset shadow for text drawing
        ctx.shadowBlur = 0;

        // 5. Draw Movie Genres at the Top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        
        let cleanedGenres = genresStr.toUpperCase().replace(/[\[\]']/g, '').split(',').slice(0, 2).join(' • ');
        ctx.fillText(cleanedGenres || 'CINEMA', width / 2, 50);

        // 6. Draw CineSuggest Logo Watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.font = '900 13px "Outfit", sans-serif';
        ctx.fillText('CINESUGGEST AI', width / 2, height - 40);

        // 7. Write Movie Title (with wrapping)
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 24px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        
        const maxTextWidth = 320;
        const words = title.split(' ');
        let lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxTextWidth && n > 0) {
                lines.push(currentLine.trim());
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        // Max 3 lines of title on the poster
        lines = lines.slice(0, 3);
        const titleStartY = height * 0.75;
        const lineHeight = 30;

        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, titleStartY + (index * lineHeight));
        });

        // 8. Write Movie Tagline / Subtitle
        if (tagline && tagline.trim() !== "") {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = 'italic 13px "Inter", sans-serif';
            
            let cleanTagline = tagline.replace(/[".]/g, '');
            if (cleanTagline.length > 40) {
                cleanTagline = cleanTagline.substring(0, 37) + '...';
            }
            
            // Place tagline 25px below the last title line
            const taglineY = titleStartY + (lines.length * lineHeight) + 10;
            if (taglineY < height - 60) {
                ctx.fillText(`"${cleanTagline}"`, width / 2, taglineY);
            }
        }
    }

    /**
     * Generates a canvas and returns its data URL to insert as <img> source, 
     * providing fallbacks and optimizing rendering.
     */
    function generatePosterURL(title, genresStr, tagline) {
        const offscreenCanvas = document.createElement('canvas');
        renderCustomPoster(offscreenCanvas, title, genresStr, tagline);
        return offscreenCanvas.toDataURL();
    }


    /* ==========================================================================
       2. API Request Handlers
       ========================================================================== */

    /**
     * Perform prefix-first case-insensitive search to feed autocomplete suggestions
     */
    async function searchMoviesAPI(query) {
        if (!query) {
            hideAutocomplete();
            return;
        }
        
        searchSpinner.classList.remove('hidden');
        
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Search failed");
            
            const matches = await res.json();
            renderAutocomplete(matches);
        } catch (error) {
            console.error("Autocomplete search error:", error);
        } finally {
            searchSpinner.classList.add('hidden');
        }
    }

    /**
     * Submit selected title to recommendation engine and render results
     */
    async function fetchRecommendations(title) {
        if (!title) return;
        
        hideAutocomplete();
        showLoader();
        
        try {
            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.error || "Failed to fetch movie recommendations.");
                return;
            }

            const data = await response.json();
            
            // Smoothly render query and recommended movies
            renderRecommendationPage(data);
            
            // Set input value to matching movie title
            searchInput.value = data.query_movie.title;
            clearSearchBtn.style.display = 'block';
            
            // Scroll to search results section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
        } catch (error) {
            console.error("Recommendation retrieval error:", error);
            alert("An error occurred while connecting to the recommendation server.");
        } finally {
            hideLoader();
        }
    }


    /* ==========================================================================
       3. UI Renderer Functions
       ========================================================================== */

    /**
     * Formats genre text block dynamically (removes python list brackets/quotes)
     */
    function formatGenres(genresStr) {
        if (!genresStr) return 'Uncategorized';
        return genresStr
            .replace(/[\[\]']/g, '')
            .split(',')
            .map(g => g.trim())
            .filter(Boolean)
            .join(', ');
    }

    /**
     * Formats genre text into independent markup tags
     */
    function renderGenreTags(genresStr) {
        if (!genresStr) return '<span class="genre-tag">Cinema</span>';
        return genresStr
            .replace(/[\[\]']/g, '')
            .split(',')
            .map(g => g.trim())
            .filter(Boolean)
            .map(genre => `<span class="genre-tag">${genre}</span>`)
            .join('');
    }

    /**
     * Render results dropdown for movie autocomplete search
     */
    function renderAutocomplete(matches) {
        autocompleteList.innerHTML = '';
        currentFocusIndex = -1;
        
        if (matches.length === 0) {
            autocompleteList.innerHTML = `<div class="autocomplete-item" style="pointer-events:none;color:var(--color-text-muted);">No movies match your search</div>`;
            showAutocomplete();
            return;
        }

        autocompleteItems = matches;
        
        matches.forEach((movie, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.dataset.index = index;
            
            const ratingHTML = movie.vote_average > 0 
                ? `<span style="color:var(--accent-star);font-weight:600;"><i class="fa-solid fa-star"></i> ${movie.vote_average.toFixed(1)}</span>`
                : '';
                
            const formattedGenre = formatGenres(movie.genres);
            
            item.innerHTML = `
                <span class="autocomplete-title">${movie.title}</span>
                <div class="autocomplete-meta">
                    <span class="autocomplete-genres">${formattedGenre}</span>
                    ${ratingHTML}
                </div>
            `;
            
            item.addEventListener('click', () => {
                searchInput.value = movie.title;
                fetchRecommendations(movie.title);
            });
            
            autocompleteList.appendChild(item);
        });
        
        showAutocomplete();
    }

    /**
     * Populates page elements with retrieved movie recommendations
     */
    function renderRecommendationPage(data) {
        const queryMovie = data.query_movie;
        const recList = data.recommendations;
        
        // Hide onboarding, show recommendation layout
        onboardingSection.classList.add('hidden');
        recommendationsSection.classList.remove('hidden');
        
        // 1. Populate Selected Movie Banner
        const queryPosterURL = generatePosterURL(queryMovie.title, queryMovie.genres, queryMovie.tagline);
        const queryGenresHTML = renderGenreTags(queryMovie.genres);
        
        queryMovieContainer.innerHTML = `
            <div class="query-movie-poster-box">
                <img src="${queryPosterURL}" alt="${queryMovie.title}" class="custom-poster-canvas">
            </div>
            <div class="query-movie-details">
                <div class="query-label">Currently Analyzing</div>
                <h1 class="query-title">${queryMovie.title}</h1>
                ${queryMovie.tagline ? `<p class="query-tagline">${queryMovie.tagline}</p>` : ''}
                
                <div class="meta-stats">
                    <div class="stat-item" title="Average Rating">
                        <i class="fa-solid fa-star star-filled"></i>
                        <span>${queryMovie.vote_average > 0 ? queryMovie.vote_average.toFixed(1) + ' / 10' : 'No Rating'}</span>
                    </div>
                    <div class="stat-item" title="Popularity Score">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Popularity: ${Math.round(queryMovie.popularity)}</span>
                    </div>
                </div>
                
                <div class="genre-container">
                    ${queryGenresHTML}
                </div>
                
                <p class="query-overview">${queryMovie.overview}</p>
            </div>
        `;
        
        // 2. Populate Recommendations Grid
        recommendationsGrid.innerHTML = '';
        
        if (recList.length === 0) {
            recommendationsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--color-text-muted); padding: 40px 0;">No matching recommendations found in dataset.</p>`;
            return;
        }

        recList.forEach((movie, index) => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            const cardPosterURL = generatePosterURL(movie.title, movie.genres, movie.tagline);
            const firstGenre = formatGenres(movie.genres).split(',')[0] || 'Movie';
            const ratingHTML = movie.vote_average > 0 
                ? `<div class="rating-badge"><i class="fa-solid fa-star"></i> ${movie.vote_average.toFixed(1)}</div>`
                : '';

            card.innerHTML = `
                <div class="movie-poster">
                    ${ratingHTML}
                    <img src="${cardPosterURL}" alt="${movie.title}" class="custom-poster-canvas">
                    <div class="card-hover-overlay">
                        <button class="overlay-btn btn-primary rec-btn">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Match Similar
                        </button>
                        <button class="overlay-btn btn-outline detail-btn">
                            <i class="fa-solid fa-circle-info"></i> More Details
                        </button>
                    </div>
                </div>
                <div class="movie-card-info">
                    <span class="card-genres">${firstGenre}</span>
                    <h3 class="card-title">${movie.title}</h3>
                    ${movie.tagline ? `<span class="card-tagline">${movie.tagline}</span>` : ''}
                </div>
            `;
            
            // Event listeners inside hover card overlays
            card.querySelector('.detail-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openMovieDetailsModal(movie);
            });
            
            card.querySelector('.rec-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                fetchRecommendations(movie.title);
            });
            
            // Standard card click opens details
            card.addEventListener('click', () => {
                openMovieDetailsModal(movie);
            });

            recommendationsGrid.appendChild(card);
        });
    }

    /**
     * Escape special characters in movie titles for HTML attributes
     */
    String.prototype.escapeTitle = function(str) {
        return (str || this)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    /**
     * Opens dynamic movie information detail modal
     */
    function openMovieDetailsModal(movie) {
        const modalPosterURL = generatePosterURL(movie.title, movie.genres, movie.tagline);
        const genresHTML = renderGenreTags(movie.genres);
        
        modalContentArea.innerHTML = `
            <div class="modal-details-grid">
                <div class="modal-poster-wrapper">
                    <img src="${modalPosterURL}" alt="${movie.title}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div class="modal-info-col">
                    <h2 class="modal-title">${movie.title}</h2>
                    ${movie.tagline ? `<p class="modal-tagline">${movie.tagline}</p>` : ''}
                    
                    <div class="modal-stats">
                        <div class="stat-item" title="Rating">
                            <i class="fa-solid fa-star star-filled"></i>
                            <span>${movie.vote_average > 0 ? movie.vote_average.toFixed(1) + ' / 10' : 'No Rating'}</span>
                        </div>
                        <div class="stat-item" title="Popularity Score">
                            <i class="fa-solid fa-chart-line"></i>
                            <span>Popularity: ${Math.round(movie.popularity)}</span>
                        </div>
                    </div>
                    
                    <div class="genre-container">
                        ${genresHTML}
                    </div>
                    
                    <h3 class="modal-overview-title">Overview</h3>
                    <p class="modal-overview-text">${movie.overview}</p>
                    
                    <div class="modal-action-row">
                        <button class="modal-btn-recommend" id="modal-recommend-trigger">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Find Matches Similar to This
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Modal Trigger to recommend based on this movie
        document.getElementById('modal-recommend-trigger').addEventListener('click', () => {
            closeModal();
            fetchRecommendations(movie.title);
        });

        // Show Modal
        movieDetailModal.classList.add('active');
        movieDetailModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }


    /* ==========================================================================
       4. Navigation, Suggestions & Modal Controllers
       ========================================================================== */

    function showAutocomplete() {
        autocompleteList.classList.remove('hidden');
    }

    function hideAutocomplete() {
        autocompleteList.classList.add('hidden');
        autocompleteList.innerHTML = '';
        currentFocusIndex = -1;
    }

    function showLoader() {
        globalLoader.classList.remove('hidden');
    }

    function hideLoader() {
        globalLoader.classList.add('hidden');
    }

    function closeModal() {
        movieDetailModal.classList.remove('active');
        movieDetailModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Unlock background scroll
        setTimeout(() => {
            modalContentArea.innerHTML = '';
        }, 300);
    }

    /* ==========================================================================
       5. Event Listeners & Keyboard Accessibility
       ========================================================================== */

    // Debounced input search listeners
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        
        if (val.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        
        clearTimeout(searchDebounceTimeout);
        
        if (val.length < 2) {
            hideAutocomplete();
            return;
        }
        
        searchDebounceTimeout = setTimeout(() => {
            searchMoviesAPI(val);
        }, 250);
    });

    // Handle Keyboard Accessibility in Search Dropdown
    searchInput.addEventListener('keydown', (e) => {
        const items = autocompleteList.querySelectorAll('.autocomplete-item');
        if (!items || items.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocusIndex = (currentFocusIndex + 1) % items.length;
            setActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
            setActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocusIndex > -1) {
                const selectedMovie = autocompleteItems[currentFocusIndex];
                searchInput.value = selectedMovie.title;
                fetchRecommendations(selectedMovie.title);
            } else if (items.length > 0 && !items[0].style.pointerEvents) {
                // Default to first match if no active selection
                const selectedMovie = autocompleteItems[0];
                searchInput.value = selectedMovie.title;
                fetchRecommendations(selectedMovie.title);
            }
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });

    function setActiveItem(items) {
        items.forEach(item => item.classList.remove('active'));
        if (currentFocusIndex > -1 && currentFocusIndex < items.length) {
            items[currentFocusIndex].classList.add('active');
            items[currentFocusIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Clear search bar
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        hideAutocomplete();
        searchInput.focus();
    });

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            hideAutocomplete();
        }
    });

    // Quick Start Movie Buttons in Hero
    document.querySelectorAll('.quick-start-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieTitle = card.dataset.movie;
            searchInput.value = movieTitle;
            fetchRecommendations(movieTitle);
        });
    });

    // Brand Logo click resets page view
    brandLogo.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        hideAutocomplete();
        onboardingSection.classList.remove('hidden');
        recommendationsSection.classList.add('hidden');
    });

    // Modal Close Trigger
    modalCloseBtn.addEventListener('click', closeModal);
    
    // Close Modal on click outside card
    movieDetailModal.addEventListener('click', (e) => {
        if (e.target === movieDetailModal) {
            closeModal();
        }
    });

    // Close Modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && movieDetailModal.classList.contains('active')) {
            closeModal();
        }
    });
});
