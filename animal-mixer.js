document.addEventListener('DOMContentLoaded', () => {
    const animalPalette = document.getElementById('animal-palette');
    const animalTray = document.getElementById('animal-tray');
    const mixAnimalButton = document.getElementById('mix-animal-button');
    const animalNameInput = document.getElementById('animal-name');
    const saveAnimalButton = document.getElementById('save-animal-button');
    const animalGallery = document.getElementById('animal-gallery');

    let selectedAnimals = [];
    let savedAnimals = JSON.parse(localStorage.getItem('savedAnimals') || '[]');

    const animalEmojis = {
        'Dog': '🐕', 'Cat': '🐈', 'Bird': '🐦', 'Fish': '🐠', 'Rabbit': '🐇', 
        'Hamster': '🐹', 'Snake': '🐍', 'Lizard': '🦎', 'Turtle': '🐢', 
        'Horse': '🐎', 'Cow': '🐄', 'Pig': '🐖', 'Chicken': '🐓', 'Duck': '🦆', 
        'Sheep': '🐑', 'Goat': '🐐', 'Llama': '🦙', 'Fox': '🦊', 'Wolf': '🐺', 
        'Bear': '🐻', 'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Giraffe': '🦒', 
        'Zebra': '🦓', 'Monkey': '🐒', 'Gorilla': '🦍', 'Panda': '🐼', 'Koala': '🐨', 
        'Kangaroo': '🦘', 'Penguin': '🐧', 'Owl': '🦉', 'Eagle': '🦅', 'Parrot': '🦜',
        'Frog': '🐸', 'Dolphin': '🐬', 'Whale': '🐋', 'Octopus': '🐙', 'Butterfly': '🦋'
    };

    const animalList = Object.keys(animalEmojis);

    async function generateMixedAnimalImage(animals) {
        const animalNames = animals.join(' mixed with ');
        const prompt = `A cute cartoon drawing of a ${animalNames} hybrid animal, simple background, children's book style`;
        
        try {
            const result = await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
            
            return result.url;
        } catch (error) {
            console.error('Error generating animal image:', error);
            return null;
        }
    }

    function generateAnimalPalette(animals) {
        animals.forEach(animal => {
            const swatch = document.createElement('div');
            swatch.classList.add('animal-swatch');
            swatch.innerHTML = `<span class="animal-emoji">${animalEmojis[animal]}</span>`;
            swatch.title = animal;
            swatch.dataset.animal = animal;
            swatch.addEventListener('click', () => {
                toggleAnimalSelection(swatch, animal);
            });
            animalPalette.appendChild(swatch);
        });
    }

    function toggleAnimalSelection(swatch, animal) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedAnimals = selectedAnimals.filter(a => a !== animal);
            removeAnimalFromTray(animal);
        } else {
            swatch.classList.add('selected');
            selectedAnimals.push(animal);
            addAnimalToTray(animal);
        }
        updateMixAnimalButtonState();
    }

    function addAnimalToTray(animal) {
        const trayAnimal = document.createElement('div');
        trayAnimal.classList.add('tray-animal');
        trayAnimal.innerHTML = animalEmojis[animal];
        trayAnimal.dataset.animal = animal; 
        animalTray.appendChild(trayAnimal);
    }

    function removeAnimalFromTray(animal) {
        const trayAnimals = Array.from(animalTray.querySelectorAll('.tray-animal'));
        const animalToRemove = trayAnimals.find(ta => ta.dataset.animal === animal);
        if (animalToRemove) {
            animalTray.removeChild(animalToRemove);
        }
    }

    function updateMixAnimalButtonState() {
        mixAnimalButton.disabled = selectedAnimals.length < 2;
        animalNameInput.disabled = selectedAnimals.length < 2;
        saveAnimalButton.disabled = selectedAnimals.length < 2;
        if (mixAnimalButton.disabled) {
            mixAnimalButton.textContent = 'Mix Animals'; 
        }
    }

    mixAnimalButton.addEventListener('click', async () => {
        if (selectedAnimals.length >= 2) {
            // Show loading state
            animalTray.innerHTML = '<div class="loading-indicator">Generating animal...</div>';
            mixAnimalButton.textContent = 'Generating...';
            mixAnimalButton.disabled = true;
            
            // Generate AI image
            const imageUrl = await generateMixedAnimalImage(selectedAnimals);
            
            animalTray.innerHTML = ''; 
            
            if (imageUrl) {
                const mixedAnimalDisplay = document.createElement('div');
                mixedAnimalDisplay.classList.add('tray-animal', 'mixed-animal');
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Mixed Animal';
                mixedAnimalDisplay.appendChild(img);
                mixedAnimalDisplay.dataset.animals = JSON.stringify(selectedAnimals);
                mixedAnimalDisplay.dataset.imageUrl = imageUrl;
                animalTray.appendChild(mixedAnimalDisplay);
                
                mixAnimalButton.textContent = 'Mixed!';
                animalNameInput.disabled = false;
                saveAnimalButton.disabled = false;
                animalNameInput.focus();
            } else {
                // Handle error
                mixAnimalButton.textContent = 'Mix Animals';
                mixAnimalButton.disabled = false;
                alert('Failed to generate animal image. Please try again.');
            }
        }
    });

    saveAnimalButton.addEventListener('click', () => {
        const animalName = animalNameInput.value.trim();
        if (animalName && animalTray.firstChild) {
            let animalData;
            if (animalTray.firstChild.classList.contains('mixed-animal')) {
                const imageElement = animalTray.firstChild.querySelector('img');
                animalData = {
                    type: 'mixed',
                    animals: JSON.parse(animalTray.firstChild.dataset.animals),
                    imageUrl: animalTray.firstChild.dataset.imageUrl || imageElement.src
                };
            } else {
                animalData = {
                    type: 'single',
                    emoji: animalTray.firstChild.innerHTML,
                    animal: animalTray.firstChild.dataset.animal
                };
            }
            
            saveAnimal(animalName, animalData);
            animalNameInput.value = '';
            mixAnimalButton.textContent = 'Mix Animals';
            updateMixAnimalButtonState();
            animalTray.innerHTML = '';
            selectedAnimals = [];
            document.querySelectorAll('.animal-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your animal before saving.");
        }
    });

    function saveAnimal(name, animalData) {
        savedAnimals.push({ name: name, animalData: animalData });
        localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
        displayAnimalGallery();
    }

    function displayAnimalGallery() {
        animalGallery.innerHTML = '';
        if (savedAnimals.length === 0) {
            animalGallery.textContent = 'No animals saved yet.';
            return;
        }
        savedAnimals.forEach((savedAnimal, index) => {
            const galleryAnimalDiv = document.createElement('div');
            galleryAnimalDiv.classList.add('gallery-animal');
            
            if (savedAnimal.animalData.type === 'mixed') {
                // Use img element for AI-generated image
                if (savedAnimal.animalData.imageUrl) {
                    const img = document.createElement('img');
                    img.src = savedAnimal.animalData.imageUrl;
                    img.alt = savedAnimal.name;
                    img.classList.add('animal-image');
                    galleryAnimalDiv.appendChild(img);
                    galleryAnimalDiv.classList.add('mixed-animal');
                } else {
                    // Fallback for old saved animals
                    galleryAnimalDiv.innerHTML = '<div class="fallback-animal">🐾</div>';
                }
            } else {
                galleryAnimalDiv.innerHTML = savedAnimal.animalData.emoji;
            }

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedAnimal(index);
            });
            galleryAnimalDiv.appendChild(deleteButton);

            const nameLabel = document.createElement('div');
            nameLabel.classList.add('animal-name-label');
            nameLabel.textContent = savedAnimal.name;
            galleryAnimalDiv.appendChild(nameLabel);

            galleryAnimalDiv.addEventListener('click', () => {
                let animalDescription;
                if (savedAnimal.animalData.type === 'mixed') {
                    const animalNames = savedAnimal.animalData.animals.join(' + ');
                    animalDescription = `Mixed Animal: ${animalNames}`;
                } else {
                    animalDescription = `Animal: ${savedAnimal.animalData.animal}`;
                }
                alert(`Name: ${savedAnimal.name}\n${animalDescription}`);
            });

            animalGallery.appendChild(galleryAnimalDiv);
        });
    }

    function deleteSavedAnimal(index) {
        savedAnimals.splice(index, 1);
        localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
        displayAnimalGallery();
    }

    generateAnimalPalette(animalList);
    displayAnimalGallery();
    updateMixAnimalButtonState();
});

export { };