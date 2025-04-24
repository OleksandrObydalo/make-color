import 'animal-mixer';

document.addEventListener('DOMContentLoaded', () => {
    const colorPalette = document.getElementById('color-palette');
    const tray = document.getElementById('tray');
    const mixButton = document.getElementById('mix-button');
    const colorNameInput = document.getElementById('color-name');
    const saveButton = document.getElementById('save-button');
    const gallery = document.getElementById('gallery');

    let selectedColors = [];
    let savedColors = JSON.parse(localStorage.getItem('savedColors') || '[]');

    function generatePaletteColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 70) + 30;
            const lightness = Math.floor(Math.random() * 70) + 20;
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }

    const paletteColors = generatePaletteColors(200);
    paletteColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            toggleColorSelection(swatch, color);
        });
        colorPalette.appendChild(swatch);
    });

    function toggleColorSelection(swatch, color) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedColors = selectedColors.filter(c => c !== color);
            removeColorFromTray(color);
        } else {
            swatch.classList.add('selected');
            selectedColors.push(color);
            addColorToTray(color);
        }
        updateMixButtonState();
    }

    function addColorToTray(color) {
        const trayColor = document.createElement('div');
        trayColor.classList.add('tray-color');
        trayColor.style.backgroundColor = color;
        trayColor.dataset.color = color; 
        tray.appendChild(trayColor);
    }

    function removeColorFromTray(color) {
        const trayColors = Array.from(tray.querySelectorAll('.tray-color'));
        const colorToRemove = trayColors.find(tc => tc.dataset.color === color);
        if (colorToRemove) {
            tray.removeChild(colorToRemove);
        }
    }

    function updateMixButtonState() {
        mixButton.disabled = selectedColors.length < 2; 
        colorNameInput.disabled = selectedColors.length < 2;
        saveButton.disabled = selectedColors.length < 2;
        if (mixButton.disabled) {
            mixButton.textContent = 'Mix Colors'; 
        }
    }

    mixButton.addEventListener('click', () => {
        if (selectedColors.length >= 2) {
            const mixedColor = mixColors(selectedColors);
            tray.innerHTML = ''; 
            addColorToTray(mixedColor); 
            mixButton.textContent = 'Mixed!';
            mixButton.disabled = true; 
            colorNameInput.disabled = false;
            saveButton.disabled = false;
            colorNameInput.focus(); 
        }
    });

    function mixColors(colors) {
        let r = 0, g = 0, b = 0;
        colors.forEach(color => {
            let rgb;
            if (color.startsWith('hsl')) {
                rgb = hslToRgb(color);
            } else if (color.startsWith('rgb')) {
                rgb = color.substring(4, color.length-1).split(',').map(Number);
            } else {
                rgb = colorToRgb(color); 
                if (!rgb) {
                    rgb = [0,0,0]; 
                }
            }
            r += rgb[0];
            g += rgb[1];
            b += rgb[2];
        });
        r = Math.round(r / colors.length);
        g = Math.round(g / colors.length);
        b = Math.round(b / colors.length);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function colorToRgb(color) {
        if (color.startsWith('#')) {
            color = color.slice(1);
            if (color.length === 3) {
                color = color[0].repeat(2) + color[1].repeat(2) + color[2].repeat(2);
            }
            if (color.length === 6) {
                const r = parseInt(color.substring(0, 2), 16);
                const g = parseInt(color.substring(2, 4), 16);
                const b = parseInt(color.substring(4, 6), 16);
                return [r, g, b];
            }
        }
        return null;
    }

    function hslToRgb(hslColor) {
        hslColor = hslColor.substring(4, hslColor.length-1); 
        let parts = hslColor.split(',');
        let h = parseInt(parts[0]);
        let s = parseInt(parts[1].replace('%','')) / 100;
        let l = parseInt(parts[2].replace('%','')) / 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;

        if(0 <= h && h < 60){
            r = c; g = x; b = 0;
        }else if(60 <= h && h < 120){
            r = x; g = c; b = 0;
        }else if(120 <= h && h < 180){
            r = 0; g = c; b = x;
        }else if(180 <= h && h < 240){
            r = 0; g = x; b = c;
        }else if(240 <= h && h < 300){
            r = x; g = 0; b = c;
        }else if(300 <= h && h < 360){
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return [r, g, b];
    }

    saveButton.addEventListener('click', () => {
        const colorName = colorNameInput.value.trim();
        if (colorName && tray.firstChild && tray.firstChild.style.backgroundColor) {
            const colorValue = tray.firstChild.style.backgroundColor;
            saveColor(colorName, colorValue);
            colorNameInput.value = ''; 
            mixButton.textContent = 'Mix Colors'; 
            updateMixButtonState(); 
            tray.innerHTML = '';
            selectedColors = [];
            document.querySelectorAll('.color-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));

        } else {
            alert("Please name your color before saving.");
        }
    });

    function saveColor(name, value) {
        savedColors.push({ name: name, color: value });
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        displayGallery(); 
    }

    function displayGallery() {
        gallery.innerHTML = '';
        if (savedColors.length === 0) {
            gallery.textContent = 'No colors saved yet.';
            return;
        }
        savedColors.forEach((savedColor, index) => {
            const galleryColorDiv = document.createElement('div');
            galleryColorDiv.classList.add('gallery-color');
            galleryColorDiv.style.backgroundColor = savedColor.color;

            galleryColorDiv.addEventListener('click', () => {
                toggleGalleryColorSelection(galleryColorDiv, savedColor.color);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedColor(index);
            });
            galleryColorDiv.appendChild(deleteButton);

            gallery.appendChild(galleryColorDiv);
        });
    }

    function toggleGalleryColorSelection(galleryColorDiv, color) {
        if (galleryColorDiv.classList.contains('selected')) {
            galleryColorDiv.classList.remove('selected');
            selectedColors = selectedColors.filter(c => c !== color);
            removeColorFromTray(color);
        } else {
            galleryColorDiv.classList.add('selected');
            selectedColors.push(color);
            addColorToTray(color);
        }
        updateMixButtonState();
    }

    function deleteSavedColor(index) {
        savedColors.splice(index, 1);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        displayGallery(); 
    }

    // Cartoon Character Mixer
    const cartoonPalette = document.getElementById('cartoon-palette');
    const cartoonTray = document.getElementById('cartoon-tray');
    const mixCartoonButton = document.getElementById('mix-cartoon-button');
    const cartoonNameInput = document.getElementById('cartoon-name');
    const saveCartoonButton = document.getElementById('save-cartoon-button');
    const cartoonGallery = document.getElementById('cartoon-gallery');

    let selectedCartoons = [];
    let savedCartoons = JSON.parse(localStorage.getItem('savedCartoons') || '[]');

    const cartoonTypes = {
        'Superhero': '🦸', 'Villain': '🦹', 'Wizard': '🧙', 'Robot': '🤖',
        'Alien': '👽', 'Space Ranger': '👨‍🚀', 'Princess': '👸', 'Prince': '🤴',
        'Cowboy': '🤠', 'Detective': '🕵️', 'Pirate': '🏴‍☠️', 'Ninja': '🥷',
        'Knight': '🛡️', 'Elf': '🧝', 'Fairy': '🧚', 'Mermaid': '🧜',
        'Ghost': '👻', 'Vampire': '🧛', 'Zombie': '🧟', 'Clown': '🤡',
        'Genie': '🧞', 'Dragon': '🐉', 'Unicorn': '🦄', 'Gargoyle': '🗿',
        'Witch': '🧙‍♀️', 'Mad Scientist': '🥼', 'Caveman': '🧔', 'Dinosaur': '🦖',
        'Angel': '😇', 'Demon': '😈', 'Mummy': '🧟‍♂️', 'Frankenstein': ' Frankenstein',
        'Werewolf': '🐺', 'Bigfoot': ' Bigfoot', 'Leprechaun': ' 🍀', 'Troll': '🧌',
        'Merman': '🧜‍♂️', 'Cyclops': ' 👁️', 'Hydra': '🐍', 'Phoenix': ' 🐦‍🔥'
    };

    const cartoonList = Object.keys(cartoonTypes);

    async function generateCartoonCharacter(types) {
        const typeNames = types.join(' mixed with ');
        const prompt = `A colorful cartoon character that is a ${typeNames}, children's TV show style, vibrant, full body, white background`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating cartoon image:', error);
            return null;
        }
    }

    function generateCartoonPalette(cartoons) {
        cartoons.forEach(cartoon => {
            const swatch = document.createElement('div');
            swatch.classList.add('cartoon-swatch');
            swatch.innerHTML = `<span class="cartoon-emoji">${cartoonTypes[cartoon]}</span>`;
            swatch.title = cartoon;
            swatch.dataset.cartoon = cartoon;
            swatch.addEventListener('click', () => {
                toggleCartoonSelection(swatch, cartoon);
            });
            cartoonPalette.appendChild(swatch);
        });
    }

    function toggleCartoonSelection(swatch, cartoon) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedCartoons = selectedCartoons.filter(c => c !== cartoon);
            removeCartoonFromTray(cartoon);
        } else {
            swatch.classList.add('selected');
            selectedCartoons.push(cartoon);
            addCartoonToTray(cartoon);
        }
        updateMixCartoonButtonState();
    }

    function addCartoonToTray(cartoon) {
        const trayCartoon = document.createElement('div');
        trayCartoon.classList.add('tray-cartoon');
        trayCartoon.innerHTML = cartoonTypes[cartoon];
        trayCartoon.dataset.cartoon = cartoon; 
        cartoonTray.appendChild(trayCartoon);
    }

    function removeCartoonFromTray(cartoon) {
        const trayCartoons = Array.from(cartoonTray.querySelectorAll('.tray-cartoon'));
        const cartoonToRemove = trayCartoons.find(tc => tc.dataset.cartoon === cartoon);
        if (cartoonToRemove) {
            cartoonTray.removeChild(cartoonToRemove);
        }
    }

    function updateMixCartoonButtonState() {
        mixCartoonButton.disabled = selectedCartoons.length < 1; 
        cartoonNameInput.disabled = selectedCartoons.length < 1;
        saveCartoonButton.disabled = selectedCartoons.length < 1;
        if (mixCartoonButton.disabled) {
            mixCartoonButton.textContent = 'Create Character'; 
        }
    }

    mixCartoonButton.addEventListener('click', async () => {
        if (selectedCartoons.length >= 1) {
            cartoonTray.innerHTML = '<div class="loading-indicator">Generating character...</div>';
            mixCartoonButton.textContent = 'Generating...';
            mixCartoonButton.disabled = true;
            
            const result = await generateCartoonCharacter(selectedCartoons);
            
            cartoonTray.innerHTML = ''; 
            
            if (result && result.url) {
                const mixedCartoonDisplay = document.createElement('div');
                mixedCartoonDisplay.classList.add('tray-cartoon', 'mixed-cartoon');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Character';
                mixedCartoonDisplay.appendChild(img);
                mixedCartoonDisplay.dataset.cartoons = JSON.stringify(selectedCartoons);
                mixedCartoonDisplay.dataset.imageUrl = result.url;
                cartoonTray.appendChild(mixedCartoonDisplay);
                
                mixCartoonButton.textContent = 'Created!';
                cartoonNameInput.disabled = false;
                saveCartoonButton.disabled = false;
                cartoonNameInput.focus();
            } else {
                mixCartoonButton.textContent = 'Create Character';
                mixCartoonButton.disabled = false;
                alert('Failed to generate character image. Please try again.');
            }
        }
    });

    saveCartoonButton.addEventListener('click', () => {
        const cartoonName = cartoonNameInput.value.trim();
        if (cartoonName && cartoonTray.firstChild) {
            let cartoonData;
            if (cartoonTray.firstChild.classList.contains('mixed-cartoon')) {
                const imageElement = cartoonTray.firstChild.querySelector('img');
                cartoonData = {
                    types: JSON.parse(cartoonTray.firstChild.dataset.cartoons),
                    imageUrl: cartoonTray.firstChild.dataset.imageUrl || imageElement.src
                };
            }
            
            saveCartoon(cartoonName, cartoonData);
            cartoonNameInput.value = '';
            mixCartoonButton.textContent = 'Create Character';
            updateMixCartoonButtonState();
            cartoonTray.innerHTML = '';
            selectedCartoons = [];
            document.querySelectorAll('.cartoon-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your character before saving.");
        }
    });

    function saveCartoon(name, cartoonData) {
        savedCartoons.push({ name: name, cartoonData: cartoonData });
        localStorage.setItem('savedCartoons', JSON.stringify(savedCartoons));
        displayCartoonGallery();
    }

    function displayCartoonGallery() {
        cartoonGallery.innerHTML = '';
        if (savedCartoons.length === 0) {
            cartoonGallery.textContent = 'No characters saved yet.';
            return;
        }
        savedCartoons.forEach((savedCartoon, index) => {
            const galleryCartoonDiv = document.createElement('div');
            galleryCartoonDiv.classList.add('gallery-cartoon');
            
            if (savedCartoon.cartoonData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedCartoon.cartoonData.imageUrl;
                img.alt = savedCartoon.name;
                img.classList.add('cartoon-image');
                galleryCartoonDiv.appendChild(img);
                galleryCartoonDiv.classList.add('mixed-cartoon');
            } else {
                galleryCartoonDiv.innerHTML = '<div class="fallback-cartoon">👾</div>';
            }

            galleryCartoonDiv.addEventListener('click', () => {
                toggleGalleryCartoonSelection(galleryCartoonDiv, savedCartoon);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedCartoon(index);
            });
            galleryCartoonDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('cartoon-name-label');
            nameLabel.textContent = savedCartoon.name;
            galleryCartoonDiv.appendChild(nameLabel);

            cartoonGallery.appendChild(galleryCartoonDiv);
        });
    }

    function toggleGalleryCartoonSelection(galleryCartoonDiv, savedCartoon) {
        if (galleryCartoonDiv.classList.contains('selected')) {
            galleryCartoonDiv.classList.remove('selected');
            selectedCartoons = selectedCartoons.filter(c => c.name !== savedCartoon.name);
            removeCartoonFromTray(savedCartoon.name);
        } else {
            galleryCartoonDiv.classList.add('selected');
            selectedCartoons.push(savedCartoon);
            addCartoonToTrayFromGallery(savedCartoon);
        }
        updateMixCartoonButtonState();
    }

    function addCartoonToTrayFromGallery(savedCartoon) {
        const trayCartoon = document.createElement('div');
        trayCartoon.classList.add('tray-cartoon');
        if (savedCartoon.cartoonData.imageUrl) {
            const img = document.createElement('img');
            img.src = savedCartoon.cartoonData.imageUrl;
            img.alt = savedCartoon.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            trayCartoon.appendChild(img);
            trayCartoon.dataset.cartoonName = savedCartoon.name;
            trayCartoon.dataset.cartoonData = JSON.stringify(savedCartoon.cartoonData);
        } else {
            trayCartoon.innerHTML = '<div class="fallback-cartoon">👾</div>';
            trayCartoon.dataset.cartoonName = savedCartoon.name;
            trayCartoon.dataset.cartoonData = JSON.stringify(savedCartoon.cartoonData);
        }
        cartoonTray.appendChild(trayCartoon);
    }

    function deleteSavedCartoon(index) {
        savedCartoons.splice(index, 1);
        localStorage.setItem('savedCartoons', JSON.stringify(savedCartoons));
        displayCartoonGallery(); 
    }

    // Movie Mixer Code
    const moviePalette = document.getElementById('movie-palette');
    const movieTray = document.getElementById('movie-tray');
    const mixMovieButton = document.getElementById('mix-movie-button');
    const movieNameInput = document.getElementById('movie-name');
    const saveMovieButton = document.getElementById('save-movie-button');
    const movieGallery = document.getElementById('movie-gallery');

    let selectedMovies = [];
    let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');

    const movieGenres = {
        'Action': '💥', 'Comedy': '😂', 'Drama': '🎭', 'Horror': '😱',
        'SciFi': '🚀', 'Fantasy': '🧙‍♂️', 'Romance': '💓', 'Thriller': '🔪',
        'Western': '🤠', 'Animation': '🧩', 'Documentary': '📹', 'Musical': '🎵',
        'War': '🪖', 'Adventure': '🏔️', 'Crime': '🕵️‍♂️', 'Noir': '🎩',
        'Superhero': '🦸‍♀️', 'Disaster': '🌪️', 'Sports': '🏀', 'Historical': '📜',
        'Mystery': '❓', 'Family': '👨‍👩‍👧‍👦', 'Biography': '📖', 'Silent': '🤫',
        'Experimental': '🧪', ' концерты': '🎤', 'Travel': '🌍', 'Zombie': '🧟',
        'Vampire': '🧛', 'Monster': '👾', 'Teen': '🧑‍🎓', 'Cult': '🔪',
        'Political': '🗳️', 'Satire': '讽刺', 'Parody': '🤡', 'Mockumentary': ' fake doc',
        'Space Opera': '🌌', 'Cyberpunk': '💻', 'Steampunk': '⚙️', 'RomCom': ' 💖😂',
        'Coming-of-age': '  성장', 'Epic': '웅장한', 'Psychological': ' 🧠', 'Legal': '⚖️'
    };

    const movieList = Object.keys(movieGenres);

    async function generateMoviePoster(genres) {
        const genreNames = genres.join(' and ');
        const prompt = `Movie poster for a ${genreNames} film, professional quality, high contrast, dramatic lighting, no text or titles`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "2:3",
            });
        } catch (error) {
            console.error('Error generating movie poster:', error);
            return null;
        }
    }

    function generateMoviePalette(movies) {
        movies.forEach(movie => {
            const swatch = document.createElement('div');
            swatch.classList.add('movie-swatch');
            swatch.innerHTML = `<span class="movie-emoji">${movieGenres[movie]}</span>`;
            swatch.title = movie;
            swatch.dataset.movie = movie;
            swatch.addEventListener('click', () => {
                toggleMovieSelection(swatch, movie);
            });
            moviePalette.appendChild(swatch);
        });
    }

    function toggleMovieSelection(swatch, movie) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedMovies = selectedMovies.filter(m => m !== movie);
            removeMovieFromTray(movie);
        } else {
            swatch.classList.add('selected');
            selectedMovies.push(movie);
            addMovieToTray(movie);
        }
        updateMixMovieButtonState();
    }

    function addMovieToTray(movie) {
        const trayMovie = document.createElement('div');
        trayMovie.classList.add('tray-movie');
        trayMovie.innerHTML = movieGenres[movie];
        trayMovie.dataset.movie = movie; 
        movieTray.appendChild(trayMovie);
    }

    function removeMovieFromTray(movie) {
        const trayMovies = Array.from(movieTray.querySelectorAll('.tray-movie'));
        const movieToRemove = trayMovies.find(tm => tm.dataset.movie === movie);
        if (movieToRemove) {
            movieTray.removeChild(movieToRemove);
        }
    }

    function updateMixMovieButtonState() {
        mixMovieButton.disabled = selectedMovies.length < 1; 
        movieNameInput.disabled = selectedMovies.length < 1;
        saveMovieButton.disabled = selectedMovies.length < 1;
        if (mixMovieButton.disabled) {
            mixMovieButton.textContent = 'Create Movie'; 
        }
    }

    mixMovieButton.addEventListener('click', async () => {
        if (selectedMovies.length >= 1) {
            movieTray.innerHTML = '<div class="loading-indicator">Generating movie poster...</div>';
            mixMovieButton.textContent = 'Generating...';
            mixMovieButton.disabled = true;
            
            const result = await generateMoviePoster(selectedMovies);
            
            movieTray.innerHTML = ''; 
            
            if (result && result.url) {
                const mixedMovieDisplay = document.createElement('div');
                mixedMovieDisplay.classList.add('tray-movie', 'mixed-movie');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Movie Poster';
                mixedMovieDisplay.appendChild(img);
                mixedMovieDisplay.dataset.movies = JSON.stringify(selectedMovies);
                mixedMovieDisplay.dataset.imageUrl = result.url;
                movieTray.appendChild(mixedMovieDisplay);
                
                mixMovieButton.textContent = 'Created!';
                movieNameInput.disabled = false;
                saveMovieButton.disabled = false;
                movieNameInput.focus();
            } else {
                mixMovieButton.textContent = 'Create Movie';
                mixMovieButton.disabled = false;
                alert('Failed to generate movie poster. Please try again.');
            }
        }
    });

    saveMovieButton.addEventListener('click', () => {
        const movieName = movieNameInput.value.trim();
        if (movieName && movieTray.firstChild) {
            let movieData;
            if (movieTray.firstChild.classList.contains('mixed-movie')) {
                const imageElement = movieTray.firstChild.querySelector('img');
                movieData = {
                    genres: JSON.parse(movieTray.firstChild.dataset.movies),
                    imageUrl: movieTray.firstChild.dataset.imageUrl || imageElement.src
                };
            }
            
            saveMovie(movieName, movieData);
            movieNameInput.value = '';
            mixMovieButton.textContent = 'Create Movie';
            updateMixMovieButtonState();
            movieTray.innerHTML = '';
            selectedMovies = [];
            document.querySelectorAll('.movie-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your movie before saving.");
        }
    });

    function saveMovie(name, movieData) {
        savedMovies.push({ name: name, movieData: movieData });
        localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
        displayMovieGallery();
    }

    function displayMovieGallery() {
        movieGallery.innerHTML = '';
        if (savedMovies.length === 0) {
            movieGallery.textContent = 'No movies saved yet.';
            return;
        }
        savedMovies.forEach((savedMovie, index) => {
            const galleryMovieDiv = document.createElement('div');
            galleryMovieDiv.classList.add('gallery-movie');
            
            if (savedMovie.movieData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedMovie.movieData.imageUrl;
                img.alt = savedMovie.name;
                img.classList.add('movie-image');
                galleryMovieDiv.appendChild(img);
                galleryMovieDiv.classList.add('mixed-movie');
            } else {
                galleryMovieDiv.innerHTML = '<div class="fallback-movie">🎬</div>';
            }

            galleryMovieDiv.addEventListener('click', () => {
                toggleGalleryMovieSelection(galleryMovieDiv, savedMovie);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedMovie(index);
            });
            galleryMovieDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('movie-name-label');
            nameLabel.textContent = savedMovie.name;
            galleryMovieDiv.appendChild(nameLabel);

            movieGallery.appendChild(galleryMovieDiv);
        });
    }

    function toggleGalleryMovieSelection(galleryMovieDiv, savedMovie) {
        if (galleryMovieDiv.classList.contains('selected')) {
            galleryMovieDiv.classList.remove('selected');
            selectedMovies = selectedMovies.filter(m => m.name !== savedMovie.name);
            removeMovieFromTray(savedMovie.name);
        } else {
            galleryMovieDiv.classList.add('selected');
            selectedMovies.push(savedMovie);
            addMovieToTrayFromGallery(savedMovie);
        }
        updateMixMovieButtonState();
    }

    function addMovieToTrayFromGallery(savedMovie) {
        const trayMovie = document.createElement('div');
        trayMovie.classList.add('tray-movie');
        if (savedMovie.movieData.imageUrl) {
            const img = document.createElement('img');
            img.src = savedMovie.movieData.imageUrl;
            img.alt = savedMovie.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            trayMovie.appendChild(img);
            trayMovie.dataset.movieName = savedMovie.name;
            trayMovie.dataset.movieData = JSON.stringify(savedMovie.movieData);
        } else {
            trayMovie.innerHTML = '<div class="fallback-movie">🎬</div>';
            trayMovie.dataset.movieName = savedMovie.name;
            trayMovie.dataset.movieData = JSON.stringify(savedMovie.movieData);
        }
        movieTray.appendChild(trayMovie);
    }

    function deleteSavedMovie(index) {
        savedMovies.splice(index, 1);
        localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
        displayMovieGallery();
    }

    // Movie Sequel Maker
    const sequelPalette = document.getElementById('sequel-palette');
    const sequelTray = document.getElementById('sequel-tray');
    const mixSequelButton = document.getElementById('mix-sequel-button');
    const sequelNameInput = document.getElementById('sequel-name');
    const saveSequelButton = document.getElementById('save-sequel-button');
    const sequelGallery = document.getElementById('sequel-gallery');

    let selectedSequels = [];
    let savedSequels = JSON.parse(localStorage.getItem('savedSequels') || '[]');

    function generateSequelPalette() {
        if (savedMovies.length === 0) {
            sequelPalette.textContent = 'Create some movies first to make sequels!';
            return;
        }
        
        savedMovies.forEach(movie => {
            const swatch = document.createElement('div');
            swatch.classList.add('sequel-swatch');
            
            if (movie.movieData.imageUrl) {
                const img = document.createElement('img');
                img.src = movie.movieData.imageUrl;
                img.alt = movie.name;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                swatch.appendChild(img);
            } else {
                swatch.innerHTML = `<span class="sequel-emoji">🎬</span>`;
            }
            
            swatch.title = movie.name;
            swatch.dataset.sequel = movie.name;
            swatch.dataset.movieData = JSON.stringify(movie.movieData);
            
            swatch.addEventListener('click', () => {
                toggleSequelSelection(swatch, movie);
            });
            sequelPalette.appendChild(swatch);
        });
    }

    function toggleSequelSelection(swatch, movie) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedSequels = selectedSequels.filter(s => s.name !== movie.name);
            removeSequelFromTray(movie.name);
        } else {
            swatch.classList.add('selected');
            selectedSequels.push(movie);
            addSequelToTray(movie);
        }
        updateMixSequelButtonState();
    }

    function addSequelToTray(movie) {
        const traySequel = document.createElement('div');
        traySequel.classList.add('tray-sequel');
        
        if (movie.movieData.imageUrl) {
            const img = document.createElement('img');
            img.src = movie.movieData.imageUrl;
            img.alt = movie.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            traySequel.appendChild(img);
        } else {
            traySequel.innerHTML = '🎬';
        }
        
        traySequel.dataset.sequel = movie.name;
        sequelTray.appendChild(traySequel);
    }

    function removeSequelFromTray(movieName) {
        const traySequels = Array.from(sequelTray.querySelectorAll('.tray-sequel'));
        const sequelToRemove = traySequels.find(ts => ts.dataset.sequel === movieName);
        if (sequelToRemove) {
            sequelTray.removeChild(sequelToRemove);
        }
    }

    function updateMixSequelButtonState() {
        mixSequelButton.disabled = selectedSequels.length < 1; 
        sequelNameInput.disabled = selectedSequels.length < 1;
        saveSequelButton.disabled = selectedSequels.length < 1;
        if (mixSequelButton.disabled) {
            mixSequelButton.textContent = 'Create Sequel'; 
        }
    }

    async function generateSequelPoster(movie) {
        const genreNames = movie.movieData.genres.join(' and ');
        const prompt = `Movie poster for a sequel to a ${genreNames} film, more epic than the original, high budget look, professional quality, dramatic lighting, no text`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "2:3",
            });
        } catch (error) {
            console.error('Error generating sequel poster:', error);
            return null;
        }
    }

    mixSequelButton.addEventListener('click', async () => {
        if (selectedSequels.length === 1) {
            const originalMovie = selectedSequels[0];
            sequelTray.innerHTML = '<div class="loading-indicator">Generating sequel poster...</div>';
            mixSequelButton.textContent = 'Generating...';
            mixSequelButton.disabled = true;
            
            const result = await generateSequelPoster(originalMovie);
            
            sequelTray.innerHTML = ''; 
            
            if (result && result.url) {
                const mixedSequelDisplay = document.createElement('div');
                mixedSequelDisplay.classList.add('tray-sequel', 'mixed-sequel');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Sequel Poster';
                mixedSequelDisplay.appendChild(img);
                mixedSequelDisplay.dataset.originalMovie = originalMovie.name;
                mixedSequelDisplay.dataset.imageUrl = result.url;
                sequelTray.appendChild(mixedSequelDisplay);
                
                mixSequelButton.textContent = 'Created!';
                sequelNameInput.disabled = false;
                saveSequelButton.disabled = false;
                sequelNameInput.value = originalMovie.name + " 2";
                sequelNameInput.focus();
            } else {
                mixSequelButton.textContent = 'Create Sequel';
                mixSequelButton.disabled = false;
                alert('Failed to generate sequel poster. Please try again.');
            }
        }
    });

    saveSequelButton.addEventListener('click', () => {
        const sequelName = sequelNameInput.value.trim();
        if (sequelName && sequelTray.firstChild) {
            let sequelData;
            if (sequelTray.firstChild.classList.contains('mixed-sequel')) {
                sequelData = {
                    originalMovie: sequelTray.firstChild.dataset.originalMovie,
                    imageUrl: sequelTray.firstChild.dataset.imageUrl
                };
            }
            
            saveSequel(sequelName, sequelData);
            sequelNameInput.value = '';
            mixSequelButton.textContent = 'Create Sequel';
            updateMixSequelButtonState();
            sequelTray.innerHTML = '';
            selectedSequels = [];
            document.querySelectorAll('.sequel-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your sequel before saving.");
        }
    });

    function saveSequel(name, sequelData) {
        savedSequels.push({ name: name, sequelData: sequelData });
        localStorage.setItem('savedSequels', JSON.stringify(savedSequels));
        displaySequelGallery();
    }

    function displaySequelGallery() {
        sequelGallery.innerHTML = '';
        if (savedSequels.length === 0) {
            sequelGallery.textContent = 'No sequels saved yet.';
            return;
        }
        savedSequels.forEach((savedSequel, index) => {
            const gallerySequelDiv = document.createElement('div');
            gallerySequelDiv.classList.add('gallery-sequel');
            
            if (savedSequel.sequelData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedSequel.sequelData.imageUrl;
                img.alt = savedSequel.name;
                img.classList.add('sequel-image');
                gallerySequelDiv.appendChild(img);
                gallerySequelDiv.classList.add('mixed-sequel');
            } else {
                gallerySequelDiv.innerHTML = '<div class="fallback-sequel">🎬</div>';
            }

            gallerySequelDiv.addEventListener('click', () => {
                toggleGallerySequelSelection(gallerySequelDiv, savedSequel);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedSequel(index);
            });
            gallerySequelDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('sequel-name-label');
            nameLabel.textContent = savedSequel.name;
            gallerySequelDiv.appendChild(nameLabel);

            sequelGallery.appendChild(gallerySequelDiv);
        });
    }

    function toggleGallerySequelSelection(gallerySequelDiv, savedSequel) {
        if (gallerySequelDiv.classList.contains('selected')) {
            gallerySequelDiv.classList.remove('selected');
            selectedSequels = selectedSequels.filter(s => s.name !== savedSequel.name);
            removeSequelFromTray(savedSequel.name);
        } else {
            gallerySequelDiv.classList.add('selected');
            selectedSequels.push(savedSequel);
            addSequelToTrayFromGallery(savedSequel);
        }
        updateMixSequelButtonState();
    }

    function addSequelToTrayFromGallery(savedSequel) {
        const traySequel = document.createElement('div');
        traySequel.classList.add('tray-sequel');
        if (savedSequel.sequelData.imageUrl) {
            const img = document.createElement('img');
            img.src = savedSequel.sequelData.imageUrl;
            img.alt = savedSequel.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            traySequel.appendChild(img);
            traySequel.dataset.sequelName = savedSequel.name;
            traySequel.dataset.sequelData = JSON.stringify(savedSequel.sequelData);
        } else {
            traySequel.innerHTML = '<div class="fallback-sequel">🎬</div>';
            traySequel.dataset.sequelName = savedSequel.name;
            traySequel.dataset.sequelData = JSON.stringify(savedSequel.sequelData);
        }
        sequelTray.appendChild(traySequel);
    }

    function deleteSavedSequel(index) {
        savedSequels.splice(index, 1);
        localStorage.setItem('savedSequels', JSON.stringify(savedSequels));
        displaySequelGallery();
    }

    // AI Picture Mixer
    const aiPicturePalette = document.getElementById('ai-picture-palette');
    const aiPictureTray = document.getElementById('ai-picture-tray');
    const mixAiPictureButton = document.getElementById('mix-ai-picture-button');
    const aiPictureNameInput = document.getElementById('ai-picture-name');
    const saveAiPictureButton = document.getElementById('save-ai-picture-button');
    const aiPictureGallery = document.getElementById('ai-picture-gallery');

    let selectedAiPictures = [];
    let savedAiPictures = JSON.parse(localStorage.getItem('savedAiPictures') || '[]');

    const aiPictureConcepts = {
        'Spongebob': 'spongebob squarepants',
        'Mickey Mouse': 'mickey mouse',
        'Bugs Bunny': 'bugs bunny',
        'Bart Simpson': 'bart simpson',
        'Rick Sanchez': 'rick sanchez',
        'Pikachu': 'pikachu',
        'Homer Simpson': 'homer simpson',
        'Peter Griffin': 'peter griffin',
        'Stewie Griffin': 'stewie griffin',
        'Garfield': 'garfield',
        'Scooby Doo': 'scooby doo',
        'Tom Cat': 'tom cat',
        'Jerry Mouse': 'jerry mouse',
        'Donald Duck': 'donald duck',
        'Goofy': 'goofy',
        'Popeye': 'popeye the sailor',
        'Felix the Cat': 'felix the cat',
        'Betty Boop': 'betty boop',
        'Minnie Mouse': 'minnie mouse',
        'Daisy Duck': 'daisy duck',
        'Fred Flintstone': 'fred flintstone',
        'Barney Rubble': 'barney rubble',
        'George Jetson': 'george jetson',
        'Elroy Jetson': 'elroy jetson',
        'Courage the Cowardly Dog': 'courage the cowardly dog',
        'Johnny Bravo': 'johnny bravo',
        'Dexter Boy Genius': 'dexter boy genius',
        'Blossom Powerpuff Girls': 'blossom powerpuff girls',
        'Bubbles Powerpuff Girls': 'bubbles powerpuff girls',
        'Buttercup Powerpuff Girls': 'buttercup powerpuff girls',
        'Ed Edd n Eddy': 'ed edd n eddy',
        'Finn the Human': 'finn the human adventure time',
        'Jake the Dog': 'jake the dog adventure time',
        'Mordecai Regular Show': 'mordecai regular show',
        'Rigby Regular Show': 'rigby regular show',
        'Gumball Watterson': 'gumball watterson',
        'Darwin Watterson': 'darwin watterson',
        'Anais Watterson': 'anais watterson',
        'Ice King': 'ice king adventure time',
        'Marceline Vampire Queen': 'marceline vampire queen',
        'Princess Bubblegum': 'princess bubblegum',
        'BMO': 'bmo adventure time',
        'Lumpy Space Princess': 'lumpy space princess',
        'Muscle Man Regular Show': 'muscle man regular show',
        'Benson Regular Show': 'benson regular show',
        'Pops Regular Show': 'pops regular show'
    };

    const aiPictureList = Object.keys(aiPictureConcepts);

    async function generateAiMixedPicture(concepts) {
        const conceptNames = concepts.join(' and ');
        const prompt = `Mix of ${conceptNames}, cartoon style, vibrant colors, simple background`;

        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating AI mixed picture:', error);
            return null;
        }
    }

    async function generateAiPicturePalette(pictures) {
        aiPicturePalette.innerHTML = ''; 
        for (const picture of pictures) {
            const prompt = aiPictureConcepts[picture];
            try {
                const result = await websim.imageGen({
                    prompt: `cartoon of ${prompt}, simple background`,
                    aspect_ratio: "1:1",
                });
                if (result && result.url) {
                    const swatch = document.createElement('div');
                    swatch.classList.add('ai-picture-swatch');
                    const img = document.createElement('img');
                    img.src = result.url;
                    img.alt = picture;
                    swatch.appendChild(img);
                    swatch.title = picture;
                    swatch.dataset.aiPicture = picture;
                    swatch.dataset.imageUrl = result.url; 
                    swatch.addEventListener('click', () => {
                        toggleAiPictureSelection(swatch, picture);
                    });
                    aiPicturePalette.appendChild(swatch);
                } else {
                    console.warn(`Failed to generate image for ${picture}`);
                    const swatch = document.createElement('div');
                    swatch.classList.add('ai-picture-swatch', 'fallback-swatch');
                    swatch.textContent = '?'; 
                    swatch.title = picture + ' (failed to load)';
                    swatch.dataset.aiPicture = picture;
                    swatch.addEventListener('click', () => {
                        toggleAiPictureSelection(swatch, picture);
                    });
                    aiPicturePalette.appendChild(swatch);
                }
            } catch (error) {
                console.error('Error generating palette image:', error);
            }
        }
    }

    function toggleAiPictureSelection(swatch, picture) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedAiPictures = selectedAiPictures.filter(c => c !== picture);
            removeAiPictureFromTray(picture);
        } else {
            swatch.classList.add('selected');
            selectedAiPictures.push(picture);
            addAiPictureToTray(picture, swatch.dataset.imageUrl); 
        }
        updateMixAiPictureButtonState();
    }

    function addAiPictureToTray(picture, imageUrl) {
        const trayAiPicture = document.createElement('div');
        trayAiPicture.classList.add('tray-ai-picture');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = picture;
        trayAiPicture.appendChild(img);
        trayAiPicture.dataset.aiPicture = picture;
        trayAiPicture.dataset.imageUrl = imageUrl;
        aiPictureTray.appendChild(trayAiPicture);
    }

    function removeAiPictureFromTray(picture) {
        const trayAiPictures = Array.from(aiPictureTray.querySelectorAll('.tray-ai-picture'));
        const pictureToRemove = trayAiPictures.find(tc => tc.dataset.aiPicture === picture);
        if (pictureToRemove) {
            aiPictureTray.removeChild(pictureToRemove);
        }
    }

    function updateMixAiPictureButtonState() {
        mixAiPictureButton.disabled = selectedAiPictures.length < 1; 
        aiPictureNameInput.disabled = selectedAiPictures.length < 1;
        saveAiPictureButton.disabled = selectedAiPictures.length < 1;
        if (mixAiPictureButton.disabled) {
            mixAiPictureButton.textContent = 'Create AI Picture';
        }
    }

    mixAiPictureButton.addEventListener('click', async () => {
        if (selectedAiPictures.length >= 1) {
            aiPictureTray.innerHTML = '<div class="loading-indicator">Generating mixed picture...</div>';
            mixAiPictureButton.textContent = 'Generating...';
            mixAiPictureButton.disabled = true;

            const result = await generateAiMixedPicture(selectedAiPictures);

            aiPictureTray.innerHTML = '';

            if (result && result.url) {
                const mixedAiPictureDisplay = document.createElement('div');
                mixedAiPictureDisplay.classList.add('tray-ai-picture', 'mixed-ai-picture');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Mixed AI Picture';
                mixedAiPictureDisplay.appendChild(img);
                mixedAiPictureDisplay.dataset.aiPictures = JSON.stringify(selectedAiPictures);
                mixedAiPictureDisplay.dataset.imageUrl = result.url;
                aiPictureTray.appendChild(mixedAiPictureDisplay);

                mixAiPictureButton.textContent = 'Created!';
                aiPictureNameInput.disabled = false;
                saveAiPictureButton.disabled = false;
                aiPictureNameInput.focus();
            } else {
                mixAiPictureButton.textContent = 'Create AI Picture';
                mixAiPictureButton.disabled = false;
                alert('Failed to generate mixed AI picture. Please try again.');
            }
        }
    });

    saveAiPictureButton.addEventListener('click', () => {
        const aiPictureName = aiPictureNameInput.value.trim();
        if (aiPictureName && aiPictureTray.firstChild) {
            let aiPictureData;
            if (aiPictureTray.firstChild.classList.contains('mixed-ai-picture')) {
                const imageElement = aiPictureTray.firstChild.querySelector('img');
                aiPictureData = {
                    concepts: JSON.parse(aiPictureTray.firstChild.dataset.aiPictures),
                    imageUrl: aiPictureTray.firstChild.dataset.imageUrl || imageElement.src
                };
            }

            saveAiPicture(aiPictureName, aiPictureData);
            aiPictureNameInput.value = '';
            mixAiPictureButton.textContent = 'Create AI Picture';
            updateMixAiPictureButtonState();
            aiPictureTray.innerHTML = '';
            selectedAiPictures = [];
            document.querySelectorAll('.ai-picture-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your AI Picture before saving.");
        }
    });

    function saveAiPicture(name, aiPictureData) {
        savedAiPictures.push({ name: name, aiPictureData: aiPictureData });
        localStorage.setItem('savedAiPictures', JSON.stringify(savedAiPictures));
        displayAiPictureGallery();
    }

    function displayAiPictureGallery() {
        aiPictureGallery.innerHTML = '';
        if (savedAiPictures.length === 0) {
            aiPictureGallery.textContent = 'No AI Pictures saved yet.';
            return;
        }
        savedAiPictures.forEach((savedAiPicture, index) => {
            const galleryAiPictureDiv = document.createElement('div');
            galleryAiPictureDiv.classList.add('gallery-ai-picture');

            if (savedAiPicture.aiPictureData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedAiPicture.aiPictureData.imageUrl;
                img.alt = savedAiPicture.name;
                img.classList.add('ai-picture-image');
                galleryAiPictureDiv.appendChild(img);
                galleryAiPictureDiv.classList.add('mixed-ai-picture');
            } else {
                galleryAiPictureDiv.innerHTML = '<div class="fallback-ai-picture">🖼️</div>';
            }

            galleryAiPictureDiv.addEventListener('click', () => {
                toggleGalleryAiPictureSelection(galleryAiPictureDiv, savedAiPicture);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteSavedAiPicture(index);
            });
            galleryAiPictureDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('ai-picture-name-label');
            nameLabel.textContent = savedAiPicture.name;
            galleryAiPictureDiv.appendChild(nameLabel);

            aiPictureGallery.appendChild(galleryAiPictureDiv);
        });
    }

    function toggleGalleryAiPictureSelection(galleryAiPictureDiv, savedAiPicture) {
        if (galleryAiPictureDiv.classList.contains('selected')) {
            galleryAiPictureDiv.classList.remove('selected');
            selectedAiPictures = selectedAiPictures.filter(p => p.name !== savedAiPicture.name);
            removeAiPictureFromTray(savedAiPicture.name);
        } else {
            galleryAiPictureDiv.classList.add('selected');
            selectedAiPictures.push(savedAiPicture);
            addAiPictureToTrayFromGallery(savedAiPicture);
        }
        updateMixAiPictureButtonState();
    }

    function addAiPictureToTrayFromGallery(savedAiPicture) {
        const trayAiPicture = document.createElement('div');
        trayAiPicture.classList.add('tray-ai-picture');
        if (savedAiPicture.aiPictureData.imageUrl) {
            const img = document.createElement('img');
            img.src = savedAiPicture.aiPictureData.imageUrl;
            img.alt = savedAiPicture.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            trayAiPicture.appendChild(img);
            trayAiPicture.dataset.aiPictureName = savedAiPicture.name;
            trayAiPicture.dataset.aiPictureData = JSON.stringify(savedAiPicture.aiPictureData);
        } else {
            trayAiPicture.innerHTML = '<div class="fallback-ai-picture">🖼️</div>';
            trayAiPicture.dataset.aiPictureName = savedAiPicture.name;
            trayAiPicture.dataset.aiPictureData = JSON.stringify(savedAiPicture.aiPictureData);
        }
        aiPictureTray.appendChild(trayAiPicture);
    }

    function deleteSavedAiPicture(index) {
        savedAiPictures.splice(index, 1);
        localStorage.setItem('savedAiPictures', JSON.stringify(savedAiPictures));
        displayAiPictureGallery();
    }

    // Gem Maker
    const gemPalette = document.getElementById('gem-palette');
    const gemTray = document.getElementById('gem-tray');
    const mixGemButton = document.getElementById('mix-gem-button');
    const gemNameInput = document.getElementById('gem-name');
    const saveGemButton = document.getElementById('save-gem-button');
    const gemGallery = document.getElementById('gem-gallery');

    let selectedGems = [];
    let savedGems = JSON.parse(localStorage.getItem('savedGems') || '[]');

    const gemTypes = {
        'Ruby': 'red', 'Sapphire': 'blue', 'Emerald': 'green', 'Diamond': 'white',
        'Amethyst': 'purple', 'Topaz': 'yellow', 'Opal': 'rainbow', 'Amber': 'orange',
        'Jade': 'lightgreen', 'Aquamarine': 'aqua', 'Pearl': 'ivory', 'Garnet': 'darkred',
        'Zircon': 'lightblue', 'Tourmaline': 'pink', 'Lapis': 'navy', 'Turquoise': 'turquoise',
        'Onyx': 'black', 'Moonstone': 'silvery', 'Tanzanite': 'violet', 'Alexandrite': 'color-changing',
        'Malachite': 'striped-green', 'Obsidian': 'glossy-black', 'Kunzite': 'pale-pink', 'Spinel': 'bright-red'
    };

    const gemList = Object.keys(gemTypes);

    async function generateGemImage(gemNames) {
        const gemsDescription = gemNames.join(' fused with ');
        const prompt = `A beautiful realistic ${gemsDescription} gemstone on black background, macro photography, sharp focus, high detail, brilliant facets, sparkling, transparent, studio lighting`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating gem image:', error);
            return null;
        }
    }

    async function generateGemPalette(gems) {
        gemPalette.innerHTML = '';
        for (const gem of gems) {
            const prompt = `A beautiful realistic ${gem} gemstone on black background, macro photography`;
            try {
                const result = await websim.imageGen({
                    prompt: prompt,
                    aspect_ratio: "1:1",
                });
                if (result && result.url) {
                    const swatch = document.createElement('div');
                    swatch.classList.add('gem-swatch');
                    const img = document.createElement('img');
                    img.src = result.url;
                    img.alt = gem;
                    swatch.appendChild(img);
                    swatch.title = gem;
                    swatch.dataset.gem = gem;
                    swatch.dataset.imageUrl = result.url;
                    swatch.addEventListener('click', () => {
                        toggleGemSelection(swatch, gem);
                    });
                    gemPalette.appendChild(swatch);
                }
            } catch (error) {
                console.error('Error generating gem palette image:', error);
            }
        }
    }

    function toggleGemSelection(swatch, gem) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedGems = selectedGems.filter(g => g !== gem);
            removeGemFromTray(gem);
        } else {
            swatch.classList.add('selected');
            selectedGems.push(gem);
            addGemToTray(gem, swatch.dataset.imageUrl);
        }
        updateMixGemButtonState();
    }

    function addGemToTray(gem, imageUrl) {
        const trayGem = document.createElement('div');
        trayGem.classList.add('tray-gem');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = gem;
        trayGem.appendChild(img);
        trayGem.dataset.gem = gem;
        trayGem.dataset.imageUrl = imageUrl;
        gemTray.appendChild(trayGem);
    }

    function removeGemFromTray(gem) {
        const trayGems = Array.from(gemTray.querySelectorAll('.tray-gem'));
        const gemToRemove = trayGems.find(tg => tg.dataset.gem === gem);
        if (gemToRemove) {
            gemTray.removeChild(gemToRemove);
        }
    }

    function updateMixGemButtonState() {
        mixGemButton.disabled = selectedGems.length < 1; 
        gemNameInput.disabled = selectedGems.length < 1;
        saveGemButton.disabled = selectedGems.length < 1;
        if (mixGemButton.disabled) {
            mixGemButton.textContent = 'Create Gem';
        }
    }

    mixGemButton.addEventListener('click', async () => {
        if (selectedGems.length >= 1) {
            gemTray.innerHTML = '<div class="loading-indicator">Creating gem...</div>';
            mixGemButton.textContent = 'Generating...';
            mixGemButton.disabled = true;

            const result = await generateGemImage(selectedGems);

            gemTray.innerHTML = '';

            if (result && result.url) {
                const mixedGemDisplay = document.createElement('div');
                mixedGemDisplay.classList.add('tray-gem', 'mixed-gem');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Mixed Gem';
                mixedGemDisplay.appendChild(img);
                mixedGemDisplay.dataset.gems = JSON.stringify(selectedGems);
                mixedGemDisplay.dataset.imageUrl = result.url;
                gemTray.appendChild(mixedGemDisplay);

                mixGemButton.textContent = 'Created!';
                gemNameInput.disabled = false;
                saveGemButton.disabled = false;
                gemNameInput.focus();
            } else {
                mixGemButton.textContent = 'Create Gem';
                mixGemButton.disabled = false;
                alert('Failed to generate gem image. Please try again.');
            }
        }
    });

    saveGemButton.addEventListener('click', () => {
        const gemName = gemNameInput.value.trim();
        if (gemName && gemTray.firstChild) {
            let gemData;
            if (gemTray.firstChild.classList.contains('mixed-gem')) {
                const imageElement = gemTray.firstChild.querySelector('img');
                gemData = {
                    gems: JSON.parse(gemTray.firstChild.dataset.gems),
                    imageUrl: gemTray.firstChild.dataset.imageUrl || imageElement.src
                };
            } else {
                gemData = {
                    gems: [gemTray.firstChild.dataset.gem],
                    imageUrl: gemTray.firstChild.dataset.imageUrl
                };
            }

            saveGem(gemName, gemData);
            gemNameInput.value = '';
            mixGemButton.textContent = 'Create Gem';
            updateMixGemButtonState();
            gemTray.innerHTML = '';
            selectedGems = [];
            document.querySelectorAll('.gem-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your gem before saving.");
        }
    });

    function saveGem(name, gemData) {
        savedGems.push({ name: name, gemData: gemData });
        localStorage.setItem('savedGems', JSON.stringify(savedGems));
        displayGemGallery();
        updateCreationPalette(); // Update creation mixer with new gem
    }

    function displayGemGallery() {
        gemGallery.innerHTML = '';
        if (savedGems.length === 0) {
            gemGallery.textContent = 'No gems saved yet.';
            return;
        }
        savedGems.forEach((savedGem, index) => {
            const galleryGemDiv = document.createElement('div');
            galleryGemDiv.classList.add('gallery-gem');

            if (savedGem.gemData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedGem.gemData.imageUrl;
                img.alt = savedGem.name;
                img.classList.add('gem-image');
                galleryGemDiv.appendChild(img);
            } else {
                galleryGemDiv.innerHTML = '<div class="fallback-gem">💎</div>';
            }

            galleryGemDiv.addEventListener('click', () => {
                toggleGalleryGemSelection(galleryGemDiv, savedGem);
            });

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteSavedGem(index);
            });
            galleryGemDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('gem-name-label');
            nameLabel.textContent = savedGem.name;
            galleryGemDiv.appendChild(nameLabel);

            gemGallery.appendChild(galleryGemDiv);
        });
    }

    function toggleGalleryGemSelection(galleryGemDiv, savedGem) {
        if (galleryGemDiv.classList.contains('selected')) {
            galleryGemDiv.classList.remove('selected');
            selectedGems = selectedGems.filter(g => g !== savedGem.name);
            removeGemFromTray(savedGem.name);
        } else {
            galleryGemDiv.classList.add('selected');
            selectedGems.push(savedGem);
            addGemToTrayFromGallery(savedGem);
        }
        updateMixGemButtonState();
    }

    function addGemToTrayFromGallery(savedGem) {
        const trayGem = document.createElement('div');
        trayGem.classList.add('tray-gem');
        if (savedGem.gemData.imageUrl) {
            const img = document.createElement('img');
            img.src = savedGem.gemData.imageUrl;
            img.alt = savedGem.name;
            trayGem.appendChild(img);
            trayGem.dataset.gemName = savedGem.name;
            trayGem.dataset.gemData = JSON.stringify(savedGem.gemData);
        } else {
            trayGem.innerHTML = '<div class="fallback-gem">💎</div>';
            trayGem.dataset.gemName = savedGem.name;
            trayGem.dataset.gemData = JSON.stringify(savedGem.gemData);
        }
        gemTray.appendChild(trayGem);
    }

    function deleteSavedGem(index) {
        savedGems.splice(index, 1);
        localStorage.setItem('savedGems', JSON.stringify(savedGems));
        displayGemGallery();
        updateCreationPalette(); // Update creation mixer after deletion
    }

    // Creation Mixer - combines all saved creations
    const creationPalette = document.getElementById('creation-palette');
    const creationTray = document.getElementById('creation-tray');
    const mixCreationButton = document.getElementById('mix-creation-button');
    const creationNameInput = document.getElementById('creation-name');
    const saveCreationButton = document.getElementById('save-creation-button');
    const creationGallery = document.getElementById('creation-gallery');

    let selectedCreations = [];
    let savedCreations = JSON.parse(localStorage.getItem('savedCreations') || '[]');

    function updateCreationPalette() {
        creationPalette.innerHTML = '';
        
        // Get all saved items from different categories
        const allItems = [
            ...savedColors.map(item => ({ type: 'color', data: item })),
            ...savedCartoons.map(item => ({ type: 'cartoon', data: item })),
            ...savedMovies.map(item => ({ type: 'movie', data: item })),
            ...savedSequels.map(item => ({ type: 'sequel', data: item })),
            ...savedAiPictures.map(item => ({ type: 'aiPicture', data: item })),
            ...savedGems.map(item => ({ type: 'gem', data: item })),
            ...savedFoods.map(item => ({ type: 'food', data: item })),
            ...savedMagicItems.map(item => ({ type: 'magic', data: item })),
            ...savedCreations.map(item => ({ type: 'creation', data: item }))
        ];

        if (allItems.length === 0) {
            creationPalette.textContent = 'Create and save items in other sections first!';
            return;
        }

        allItems.forEach(item => {
            const swatch = document.createElement('div');
            swatch.classList.add('creation-swatch');
            
            // Handle different item types
            switch(item.type) {
                case 'color':
                    swatch.style.backgroundColor = item.data.color;
                    swatch.title = `Color: ${item.data.name}`;
                    break;
                case 'cartoon':
                    if (item.data.cartoonData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.cartoonData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '👾';
                    }
                    swatch.title = `Cartoon: ${item.data.name}`;
                    break;
                case 'movie':
                    if (item.data.movieData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.movieData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '🎬';
                    }
                    swatch.title = `Movie: ${item.data.name}`;
                    break;
                case 'sequel':
                    if (item.data.sequelData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.sequelData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '🎬';
                    }
                    swatch.title = `Sequel: ${item.data.name}`;
                    break;
                case 'aiPicture':
                    if (item.data.aiPictureData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.aiPictureData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '🖼️';
                    }
                    swatch.title = `AI Picture: ${item.data.name}`;
                    break;
                case 'gem':
                    if (item.data.gemData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.gemData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '💎';
                    }
                    swatch.title = `Gem: ${item.data.name}`;
                    break;
                case 'food':
                    if (item.data.foodData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.foodData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '🍽️';
                    }
                    swatch.title = `Food: ${item.data.name}`;
                    break;
                case 'magic':
                    if (item.data.magicData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.magicData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '✨';
                    }
                    swatch.title = `Magic Item: ${item.data.name}`;
                    break;
                case 'creation':
                    if (item.data.creationData.imageUrl) {
                        const img = document.createElement('img');
                        img.src = item.data.creationData.imageUrl;
                        img.alt = item.data.name;
                        swatch.appendChild(img);
                    } else {
                        swatch.innerHTML = '🎨';
                    }
                    swatch.title = `Creation: ${item.data.name}`;
                    break;
            }

            swatch.dataset.creation = JSON.stringify(item);
            swatch.addEventListener('click', () => {
                toggleCreationSelection(swatch, item);
            });
            creationPalette.appendChild(swatch);
        });
    }

    function toggleCreationSelection(swatch, item) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedCreations = selectedCreations.filter(c => 
                JSON.stringify(c) !== JSON.stringify(item));
            removeCreationFromTray(item);
        } else {
            swatch.classList.add('selected');
            selectedCreations.push(item);
            addCreationToTray(item, swatch);
        }
        updateMixCreationButtonState();
    }

    function addCreationToTray(item, swatch) {
        const trayCreation = document.createElement('div');
        trayCreation.classList.add('tray-creation');
        
        // Clone the content from the swatch
        if (swatch.querySelector('img')) {
            const img = document.createElement('img');
            img.src = swatch.querySelector('img').src;
            img.alt = swatch.title;
            trayCreation.appendChild(img);
            trayCreation.dataset.imageUrl = img.src;
        } else if (item.type === 'color') {
            trayCreation.style.backgroundColor = item.data.color;
        } else {
            trayCreation.innerHTML = swatch.innerHTML;
        }
        
        trayCreation.dataset.creation = JSON.stringify(item);
        creationTray.appendChild(trayCreation);
    }

    function removeCreationFromTray(item) {
        const trayCreations = Array.from(creationTray.querySelectorAll('.tray-creation'));
        const itemToRemove = trayCreations.find(tc => 
            tc.dataset.creation === JSON.stringify(item));
        if (itemToRemove) {
            creationTray.removeChild(itemToRemove);
        }
    }

    function updateMixCreationButtonState() {
        mixCreationButton.disabled = selectedCreations.length < 1; 
        creationNameInput.disabled = selectedCreations.length < 1;
        saveCreationButton.disabled = selectedCreations.length < 1;
        if (mixCreationButton.disabled) {
            mixCreationButton.textContent = 'Mix Creations';
        }
    }

    async function generateMixedCreationImage(creations) {
        let prompt = "A creative fusion artwork combining ";
        
        const descriptions = creations.map(creation => {
            switch(creation.type) {
                case 'color':
                    return `${creation.data.color} color`;
                case 'cartoon':
                    return `a cartoon character named ${creation.data.name}`;
                case 'movie':
                    return `a movie poster for ${creation.data.name}`;
                case 'sequel':
                    return `a sequel movie poster for ${creation.data.name}`;
                case 'aiPicture':
                    return `a character named ${creation.data.name}`;
                case 'gem':
                    return `a ${creation.data.name} gemstone`;
                case 'food':
                    return `a ${creation.data.name} dish`;
                case 'magic':
                    return `a magical item called ${creation.data.name}`;
                case 'creation':
                    return `a creation named ${creation.data.name}`;
                default:
                    return creation.data.name;
            }
        });
        
        prompt += descriptions.join(" and ") + ", digital art, vibrant colors, high detail";
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating mixed creation image:', error);
            return null;
        }
    }

    mixCreationButton.addEventListener('click', async () => {
        if (selectedCreations.length >= 1) {
            creationTray.innerHTML = '<div class="loading-indicator">Creating mixed artwork...</div>';
            mixCreationButton.textContent = 'Generating...';
            mixCreationButton.disabled = true;

            const result = await generateMixedCreationImage(selectedCreations);

            creationTray.innerHTML = '';

            if (result && result.url) {
                const mixedCreationDisplay = document.createElement('div');
                mixedCreationDisplay.classList.add('tray-creation', 'mixed-creation');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Mixed Creation';
                mixedCreationDisplay.appendChild(img);
                mixedCreationDisplay.dataset.creations = JSON.stringify(selectedCreations);
                mixedCreationDisplay.dataset.imageUrl = result.url;
                creationTray.appendChild(mixedCreationDisplay);

                mixCreationButton.textContent = 'Created!';
                creationNameInput.disabled = false;
                saveCreationButton.disabled = false;
                creationNameInput.focus();
            } else {
                mixCreationButton.textContent = 'Mix Creations';
                mixCreationButton.disabled = false;
                alert('Failed to generate mixed creation. Please try again.');
            }
        }
    });

    saveCreationButton.addEventListener('click', () => {
        const creationName = creationNameInput.value.trim();
        if (creationName && creationTray.firstChild) {
            let creationData;
            if (creationTray.firstChild.classList.contains('mixed-creation')) {
                const imageElement = creationTray.firstChild.querySelector('img');
                creationData = {
                    sources: JSON.parse(creationTray.firstChild.dataset.creations),
                    imageUrl: creationTray.firstChild.dataset.imageUrl || imageElement.src
                };
            } else {
                creationData = {
                    sources: [JSON.parse(creationTray.firstChild.dataset.creation)],
                    imageUrl: creationTray.firstChild.dataset.imageUrl || ''
                };
            }

            saveCreation(creationName, creationData);
            creationNameInput.value = '';
            mixCreationButton.textContent = 'Mix Creations';
            updateMixCreationButtonState();
            creationTray.innerHTML = '';
            selectedCreations = [];
            document.querySelectorAll('.creation-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your creation before saving.");
        }
    });

    function saveCreation(name, creationData) {
        savedCreations.push({ name: name, creationData: creationData });
        localStorage.setItem('savedCreations', JSON.stringify(savedCreations));
        displayCreationGallery();
        updateCreationPalette(); // Update to include the new creation
    }

    function displayCreationGallery() {
        creationGallery.innerHTML = '';
        if (savedCreations.length === 0) {
            creationGallery.textContent = 'No mixed creations saved yet.';
            return;
        }
        savedCreations.forEach((savedCreation, index) => {
            const galleryCreationDiv = document.createElement('div');
            galleryCreationDiv.classList.add('gallery-creation');

            if (savedCreation.creationData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedCreation.creationData.imageUrl;
                img.alt = savedCreation.name;
                img.classList.add('creation-image');
                galleryCreationDiv.appendChild(img);
            } else {
                galleryCreationDiv.innerHTML = '<div class="fallback-creation">🎨</div>';
            }

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteSavedCreation(index);
            });
            galleryCreationDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('creation-name-label');
            nameLabel.textContent = savedCreation.name;
            galleryCreationDiv.appendChild(nameLabel);

            creationGallery.appendChild(galleryCreationDiv);
        });
    }

    function deleteSavedCreation(index) {
        savedCreations.splice(index, 1);
        localStorage.setItem('savedCreations', JSON.stringify(savedCreations));
        displayCreationGallery();
        updateCreationPalette();
    }

    // Food Mixer
    const foodPalette = document.getElementById('food-palette');
    const foodTray = document.getElementById('food-tray');
    const mixFoodButton = document.getElementById('mix-food-button');
    const foodNameInput = document.getElementById('food-name');
    const saveFoodButton = document.getElementById('save-food-button');
    const foodGallery = document.getElementById('food-gallery');

    let selectedFoods = [];
    let savedFoods = JSON.parse(localStorage.getItem('savedFoods') || '[]');

    const foodItems = {
        'Tomato': '🍅', 'Potato': '🥔', 'Carrot': '🥕', 'Corn': '🌽',
        'Broccoli': '🥦', 'Lettuce': '🥬', 'Cucumber': '🥒', 'Pepper': '🫑',
        'Eggplant': '🍆', 'Avocado': '🥑', 'Garlic': '🧄', 'Onion': '🧅',
        'Mushroom': '🍄', 'Olive': '🫒', 'Lemon': '🍋', 'Banana': '🍌',
        'Watermelon': '🍉', 'Grapes': '🍇', 'Strawberry': '🍓', 'Blueberry': '🫐',
        'Cherry': '🍒', 'Peach': '🍑', 'Mango': '🥭', 'Pineapple': '🍍',
        'Coconut': '🥥', 'Kiwi': '🥝', 'Apple': '🍎', 'Pear': '🍐',
        'Orange': '🍊', 'Rice': '🍚', 'Bread': '🍞', 'Croissant': '🥐',
        'Baguette': '🥖', 'Pretzel': '🥨', 'Pancakes': '🥞', 'Waffle': '🧇',
        'Cheese': '🧀', 'Egg': '🥚', 'Butter': '🧈', 'Bacon': '🥓',
        'Meat': '🍖', 'Poultry': '🍗', 'Shrimp': '🍤', 'Fish': '🐟',
        'Ice Cream': '🍨', 'Cake': '🍰', 'Pie': '🥧', 'Chocolate': '🍫',
        'Honey': '🍯', 'Milk': '🥛', 'Coffee': '☕', 'Tea': '🍵',
        'Wine': '🍷', 'Beer': '🍺', 'Cocktail': '🍸', 'Salt': '🧂'
    };

    const foodList = Object.keys(foodItems);

    async function generateFoodImage(foods) {
        const foodNames = foods.join(' combined with ');
        const prompt = `A delicious gourmet dish combining ${foodNames}, professional food photography, top view, on white plate, studio lighting, high detail, appetizing presentation`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating food image:', error);
            return null;
        }
    }

    function generateFoodPalette(foods) {
        foods.forEach(food => {
            const swatch = document.createElement('div');
            swatch.classList.add('food-swatch');
            swatch.innerHTML = `<span class="food-emoji">${foodItems[food]}</span>`;
            swatch.title = food;
            swatch.dataset.food = food;
            swatch.addEventListener('click', () => {
                toggleFoodSelection(swatch, food);
            });
            foodPalette.appendChild(swatch);
        });
    }

    function toggleFoodSelection(swatch, food) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedFoods = selectedFoods.filter(f => f !== food);
            removeFoodFromTray(food);
        } else {
            swatch.classList.add('selected');
            selectedFoods.push(food);
            addFoodToTray(food);
        }
        updateMixFoodButtonState();
    }

    function addFoodToTray(food) {
        const trayFood = document.createElement('div');
        trayFood.classList.add('tray-food');
        trayFood.innerHTML = foodItems[food];
        trayFood.dataset.food = food; 
        foodTray.appendChild(trayFood);
    }

    function removeFoodFromTray(food) {
        const trayFoods = Array.from(foodTray.querySelectorAll('.tray-food'));
        const foodToRemove = trayFoods.find(tf => tf.dataset.food === food);
        if (foodToRemove) {
            foodTray.removeChild(foodToRemove);
        }
    }

    function updateMixFoodButtonState() {
        mixFoodButton.disabled = selectedFoods.length < 1; 
        foodNameInput.disabled = selectedFoods.length < 1;
        saveFoodButton.disabled = selectedFoods.length < 1;
        if (mixFoodButton.disabled) {
            mixFoodButton.textContent = 'Create Dish';
        }
    }

    mixFoodButton.addEventListener('click', async () => {
        if (selectedFoods.length >= 1) {
            foodTray.innerHTML = '<div class="loading-indicator">Creating dish...</div>';
            mixFoodButton.textContent = 'Generating...';
            mixFoodButton.disabled = true;

            const result = await generateFoodImage(selectedFoods);

            foodTray.innerHTML = '';

            if (result && result.url) {
                const mixedFoodDisplay = document.createElement('div');
                mixedFoodDisplay.classList.add('tray-food', 'mixed-food');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Food Dish';
                mixedFoodDisplay.appendChild(img);
                mixedFoodDisplay.dataset.foods = JSON.stringify(selectedFoods);
                mixedFoodDisplay.dataset.imageUrl = result.url;
                foodTray.appendChild(mixedFoodDisplay);

                mixFoodButton.textContent = 'Created!';
                foodNameInput.disabled = false;
                saveFoodButton.disabled = false;
                foodNameInput.focus();
            } else {
                mixFoodButton.textContent = 'Create Dish';
                mixFoodButton.disabled = false;
                alert('Failed to generate food image. Please try again.');
            }
        }
    });

    saveFoodButton.addEventListener('click', () => {
        const foodName = foodNameInput.value.trim();
        if (foodName && foodTray.firstChild) {
            let foodData;
            if (foodTray.firstChild.classList.contains('mixed-food')) {
                const imageElement = foodTray.firstChild.querySelector('img');
                foodData = {
                    foods: JSON.parse(foodTray.firstChild.dataset.foods),
                    imageUrl: foodTray.firstChild.dataset.imageUrl || imageElement.src
                };
            } else {
                foodData = {
                    foods: [foodTray.firstChild.dataset.food],
                    imageUrl: ''
                };
            }

            saveFood(foodName, foodData);
            foodNameInput.value = '';
            mixFoodButton.textContent = 'Create Dish';
            updateMixFoodButtonState();
            foodTray.innerHTML = '';
            selectedFoods = [];
            document.querySelectorAll('.food-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your dish before saving.");
        }
    });

    function saveFood(name, foodData) {
        savedFoods.push({ name: name, foodData: foodData });
        localStorage.setItem('savedFoods', JSON.stringify(savedFoods));
        displayFoodGallery();
        updateCreationPalette(); // Update creation mixer with new food
    }

    function displayFoodGallery() {
        foodGallery.innerHTML = '';
        if (savedFoods.length === 0) {
            foodGallery.textContent = 'No dishes saved yet.';
            return;
        }
        savedFoods.forEach((savedFood, index) => {
            const galleryFoodDiv = document.createElement('div');
            galleryFoodDiv.classList.add('gallery-food');

            if (savedFood.foodData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedFood.foodData.imageUrl;
                img.alt = savedFood.name;
                img.classList.add('food-image');
                galleryFoodDiv.appendChild(img);
            } else {
                const foodEmoji = document.createElement('div');
                foodEmoji.style.fontSize = '2em';
                foodEmoji.textContent = foodItems[savedFood.foodData.foods[0]] || '🍽️';
                galleryFoodDiv.appendChild(foodEmoji);
            }

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedFood(index);
            });
            galleryFoodDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('food-name-label');
            nameLabel.textContent = savedFood.name;
            galleryFoodDiv.appendChild(nameLabel);

            foodGallery.appendChild(galleryFoodDiv);
        });
    }

    function deleteSavedFood(index) {
        savedFoods.splice(index, 1);
        localStorage.setItem('savedFoods', JSON.stringify(savedFoods));
        displayFoodGallery();
        updateCreationPalette(); // Update creation mixer after deletion
    }

    // Magical Item Mixer
    const magicPalette = document.getElementById('magic-palette');
    const magicTray = document.getElementById('magic-tray');
    const mixMagicButton = document.getElementById('mix-magic-button');
    const magicNameInput = document.getElementById('magic-name');
    const saveMagicButton = document.getElementById('save-magic-button');
    const magicGallery = document.getElementById('magic-gallery');

    let selectedMagicItems = [];
    let savedMagicItems = JSON.parse(localStorage.getItem('savedMagicItems') || '[]');

    const magicalElements = {
        'Fire': '🔥', 'Water': '💧', 'Earth': '🌿', 'Air': '💨',
        'Light': '✨', 'Shadow': '🌑', 'Life': '💓', 'Death': '💀',
        'Thunder': '⚡', 'Ice': '❄️', 'Metal': '⚙️', 'Wood': '🪵',
        'Crystal': '💎', 'Poison': '☠️', 'Mind': '🧠', 'Spirit': '👻',
        'Time': '⏳', 'Space': '🌌', 'Sound': '🔊', 'Gravity': '⚓',
        'Dragon': '🐉', 'Phoenix': '🔥🐦', 'Unicorn': '🦄', 'Fairy': '🧚',
        'Demon': '👿', 'Angel': '😇', 'Vampire': '🧛', 'Werewolf': '🐺',
        'Alchemy': '⚗️', 'Rune': '🔮', 'Illusion': '🎭', 'Healing': '💊',
        'Telekinesis': '🧿', 'Necromancy': '🧟', 'Oracle': '🔮', 'Divination': '🧙‍♀️',
        'Summoning': '📜', 'Enchantment': '✨', 'Transformation': '🧪', 'Invisibility': '👁️',
        'Flight': '🦅', 'Teleportation': '🌀', 'Shapeshifting': '🦊', 'Elemental': '🌪️',
        'Stealth': '👤', 'Strength': '💪', 'Speed': '🏃', 'Shield': '🛡️',
        'Poison': '☣️', 'Curse': '📿', 'Blessing': '🙏', 'Luck': '🍀',
        'Chaos': '💥', 'Order': '⚖️', 'Void': '⚫', 'Stars': '✨'
    };

    const magicalItemTypes = [
        'Wand', 'Staff', 'Grimoire', 'Amulet', 'Ring', 'Crown', 
        'Sword', 'Bow', 'Shield', 'Armor', 'Cloak', 'Boots', 
        'Potion', 'Scroll', 'Orb', 'Crystal Ball', 'Talisman', 'Pendant',
        'Bracelet', 'Belt', 'Mask', 'Gloves', 'Dagger', 'Axe',
        'Hammer', 'Spear', 'Flute', 'Drum', 'Horn', 'Lute'
    ];

    const magicList = Object.keys(magicalElements);

    async function generateMagicalItemImage(elements) {
        const elementNames = elements.join(' and ');
        // Randomly select an item type
        const itemType = magicalItemTypes[Math.floor(Math.random() * magicalItemTypes.length)];
        
        const prompt = `A fantasy magical ${itemType} imbued with ${elementNames} elements, highly detailed, magical glow, mystical appearance, on dark background, professional fantasy art`;
        
        try {
            return await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
        } catch (error) {
            console.error('Error generating magical item image:', error);
            return null;
        }
    }

    function generateMagicPalette(magicElements) {
        magicElements.forEach(element => {
            const swatch = document.createElement('div');
            swatch.classList.add('magic-swatch');
            swatch.innerHTML = `<span class="magic-emoji">${magicalElements[element]}</span>`;
            swatch.title = element;
            swatch.dataset.magic = element;
            swatch.addEventListener('click', () => {
                toggleMagicSelection(swatch, element);
            });
            magicPalette.appendChild(swatch);
        });
    }

    function toggleMagicSelection(swatch, element) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedMagicItems = selectedMagicItems.filter(e => e !== element);
            removeMagicFromTray(element);
        } else {
            swatch.classList.add('selected');
            selectedMagicItems.push(element);
            addMagicToTray(element);
        }
        updateMixMagicButtonState();
    }

    function addMagicToTray(element) {
        const trayMagic = document.createElement('div');
        trayMagic.classList.add('tray-magic');
        trayMagic.innerHTML = magicalElements[element];
        trayMagic.dataset.magic = element; 
        magicTray.appendChild(trayMagic);
    }

    function removeMagicFromTray(element) {
        const trayMagics = Array.from(magicTray.querySelectorAll('.tray-magic'));
        const magicToRemove = trayMagics.find(tm => tm.dataset.magic === element);
        if (magicToRemove) {
            magicTray.removeChild(magicToRemove);
        }
    }

    function updateMixMagicButtonState() {
        mixMagicButton.disabled = selectedMagicItems.length < 1; 
        magicNameInput.disabled = selectedMagicItems.length < 1;
        saveMagicButton.disabled = selectedMagicItems.length < 1;
        if (mixMagicButton.disabled) {
            mixMagicButton.textContent = 'Create Magical Item';
        }
    }

    mixMagicButton.addEventListener('click', async () => {
        if (selectedMagicItems.length >= 1) {
            magicTray.innerHTML = '<div class="loading-indicator">Creating magical item...</div>';
            mixMagicButton.textContent = 'Generating...';
            mixMagicButton.disabled = true;

            const result = await generateMagicalItemImage(selectedMagicItems);

            magicTray.innerHTML = '';

            if (result && result.url) {
                const mixedMagicDisplay = document.createElement('div');
                mixedMagicDisplay.classList.add('tray-magic', 'mixed-magic');
                const img = document.createElement('img');
                img.src = result.url;
                img.alt = 'Magical Item';
                mixedMagicDisplay.appendChild(img);
                mixedMagicDisplay.dataset.magics = JSON.stringify(selectedMagicItems);
                mixedMagicDisplay.dataset.imageUrl = result.url;
                magicTray.appendChild(mixedMagicDisplay);

                mixMagicButton.textContent = 'Created!';
                magicNameInput.disabled = false;
                saveMagicButton.disabled = false;
                magicNameInput.focus();
            } else {
                mixMagicButton.textContent = 'Create Magical Item';
                mixMagicButton.disabled = false;
                alert('Failed to generate magical item image. Please try again.');
            }
        }
    });

    saveMagicButton.addEventListener('click', () => {
        const magicName = magicNameInput.value.trim();
        if (magicName && magicTray.firstChild) {
            let magicData;
            if (magicTray.firstChild.classList.contains('mixed-magic')) {
                const imageElement = magicTray.firstChild.querySelector('img');
                magicData = {
                    elements: JSON.parse(magicTray.firstChild.dataset.magics),
                    imageUrl: magicTray.firstChild.dataset.imageUrl || imageElement.src
                };
            } else {
                magicData = {
                    elements: [magicTray.firstChild.dataset.magic],
                    imageUrl: ''
                };
            }

            saveMagic(magicName, magicData);
            magicNameInput.value = '';
            mixMagicButton.textContent = 'Create Magical Item';
            updateMixMagicButtonState();
            magicTray.innerHTML = '';
            selectedMagicItems = [];
            document.querySelectorAll('.magic-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your magical item before saving.");
        }
    });

    function saveMagic(name, magicData) {
        savedMagicItems.push({ name: name, magicData: magicData });
        localStorage.setItem('savedMagicItems', JSON.stringify(savedMagicItems));
        displayMagicGallery();
        updateCreationPalette(); // Update creation mixer with new magical item
    }

    function displayMagicGallery() {
        magicGallery.innerHTML = '';
        if (savedMagicItems.length === 0) {
            magicGallery.textContent = 'No magical items saved yet.';
            return;
        }
        savedMagicItems.forEach((savedMagic, index) => {
            const galleryMagicDiv = document.createElement('div');
            galleryMagicDiv.classList.add('gallery-magic');

            if (savedMagic.magicData.imageUrl) {
                const img = document.createElement('img');
                img.src = savedMagic.magicData.imageUrl;
                img.alt = savedMagic.name;
                img.classList.add('magic-image');
                galleryMagicDiv.appendChild(img);
            } else {
                const magicEmoji = document.createElement('div');
                magicEmoji.style.fontSize = '2em';
                magicEmoji.textContent = magicalElements[savedMagic.magicData.elements[0]] || '✨';
                galleryMagicDiv.appendChild(magicEmoji);
            }

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedMagic(index);
            });
            galleryMagicDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('magic-name-label');
            nameLabel.textContent = savedMagic.name;
            galleryMagicDiv.appendChild(nameLabel);

            magicGallery.appendChild(galleryMagicDiv);
        });
    }

    function deleteSavedMagic(index) {
        savedMagicItems.splice(index, 1);
        localStorage.setItem('savedMagicItems', JSON.stringify(savedMagicItems));
        displayMagicGallery();
        updateCreationPalette(); // Update creation mixer after deletion
    }

    // Initialize all sections
    generateCartoonPalette(cartoonList);
    displayCartoonGallery();
    updateMixCartoonButtonState();

    generateMoviePalette(movieList);
    displayMovieGallery();
    updateMixMovieButtonState();

    generateSequelPalette();
    displaySequelGallery();
    updateMixSequelButtonState();

    generateAiPicturePalette(aiPictureList);
    displayAiPictureGallery();
    updateMixAiPictureButtonState();

    generateGemPalette(gemList);
    displayGemGallery();
    updateMixGemButtonState();
    
    generateFoodPalette(foodList);
    displayFoodGallery();
    updateMixFoodButtonState();
    
    updateCreationPalette();
    displayCreationGallery();
    updateMixCreationButtonState();

    generateMagicPalette(magicList);
    displayMagicGallery();
    updateMixMagicButtonState();
});