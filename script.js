document.addEventListener('DOMContentLoaded', () => {
    const colorPalette = document.getElementById('color-palette');
    const tray = document.getElementById('tray');
    const mixButton = document.getElementById('mix-button');
    const colorNameInput = document.getElementById('color-name');
    const saveButton = document.getElementById('save-button');
    const gallery = document.getElementById('gallery');

    let selectedColors = [];
    let savedColors = JSON.parse(localStorage.getItem('savedColors') || '[]');

    // Function to generate a wider range of colors (HSL)
    function generatePaletteColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 70) + 30; // High saturation
            const lightness = Math.floor(Math.random() * 70) + 20;   // Medium lightness
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }

    // Initialize color palette with more diverse colors
    const paletteColors = generatePaletteColors(100); // Generate 100 colors for the palette
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
            // Deselect color
            swatch.classList.remove('selected');
            selectedColors = selectedColors.filter(c => c !== color);
            removeColorFromTray(color);
        } else if (selectedColors.length < 3) {
            // Select color if less than 3 are selected
            swatch.classList.add('selected');
            selectedColors.push(color);
            addColorToTray(color);
        } else {
            alert("You can only select up to 3 colors to mix.");
        }
        updateMixButtonState();
    }

    function addColorToTray(color) {
        const trayColor = document.createElement('div');
        trayColor.classList.add('tray-color');
        trayColor.style.backgroundColor = color;
        trayColor.dataset.color = color; // Store color for removal
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
            mixButton.textContent = 'Mix Colors'; // Reset button text when disabled
        }
    }


    mixButton.addEventListener('click', () => {
        if (selectedColors.length >= 2) {
            const mixedColor = mixColors(selectedColors);
            tray.innerHTML = ''; // Clear tray
            addColorToTray(mixedColor); // Add mixed color to tray
            mixButton.textContent = 'Mixed!';
            mixButton.disabled = true; // Disable mix button after mixing until colors are changed
            // Enable name and save button
            colorNameInput.disabled = false;
            saveButton.disabled = false;
            colorNameInput.focus(); // Focus on the name input
        }
    });


    function mixColors(colors) {
        let r = 0, g = 0, b = 0;
        colors.forEach(color => {
            const rgb = hslToRgb(color); // Assuming you have an hslToRgb function
            r += rgb[0];
            g += rgb[1];
            b += rgb[2];
        });
        r = Math.round(r / colors.length);
        g = Math.round(g / colors.length);
        b = Math.round(b / colors.length);
        return `rgb(${r}, ${g}, ${b})`;
    }


    function hslToRgb(hslColor) {
        hslColor = hslColor.substring(4, hslColor.length-1); // Remove "hsl(" and ")"
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
            colorNameInput.value = ''; // Clear input
            mixButton.textContent = 'Mix Colors'; // Reset mix button text
            updateMixButtonState(); // Disable mix and save buttons again
             // Clear tray and reset selection
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
        displayGallery(); // Refresh gallery display
    }

    function displayGallery() {
        gallery.innerHTML = ''; // Clear existing gallery
        if (savedColors.length === 0) {
            gallery.textContent = 'No colors saved yet.';
            return;
        }
        savedColors.forEach((savedColor, index) => {
            const galleryColorDiv = document.createElement('div');
            galleryColorDiv.classList.add('gallery-color');
            galleryColorDiv.style.backgroundColor = savedColor.color;

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent galleryColorDiv click if you add click to it later
                deleteSavedColor(index);
            });
            galleryColorDiv.appendChild(deleteButton);


            galleryColorDiv.addEventListener('click', () => {
                alert(`Color Name: ${savedColor.name}\nColor Value: ${savedColor.color}`);
            });


            gallery.appendChild(galleryColorDiv);
        });
    }

    function deleteSavedColor(index) {
        savedColors.splice(index, 1);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        displayGallery(); // Refresh gallery
    }


    displayGallery(); // Initial gallery display on load
    updateMixButtonState(); // Initial button states
});

