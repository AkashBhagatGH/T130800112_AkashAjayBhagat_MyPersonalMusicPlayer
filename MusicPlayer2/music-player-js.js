// Music Player JavaScript

// Songs Database
const songsDatabase = [
    {
        id: 1,
        title: "Midnight Dreams",
        artist: "Luna Sky",
        path: "songs/midnight-dreams.mp3",
        image: "https://picsum.photos/400/400?random=1",
        duration: "1:10"
    },
    {
        id: 2,
        title: "Electric Pulse",
        artist: "Neon Waves",
        path: "songs/electric-pulse.mp3",
        image: "https://picsum.photos/400/400?random=2",
        duration: "2:54"
    },
    {
        id: 3,
        title: "Golden Hour",
        artist: "Sunset Boulevard",
        path: "songs/golden-hour.mp3",
        image: "https://picsum.photos/400/400?random=6",
        duration: "4:12"
    },
    {
        id: 4,
        title: "Starlight Symphony",
        artist: "Cosmic Orchestra",
        path: "songs/starlight-symphony.mp3",
        image: "https://picsum.photos/400/400?random=7",
        duration: "3:04"
    },
    {
        id: 5,
        title: "Velvet Sky",
        artist: "Smooth Jazz Collective",
        path: "songs/velvet-sky.mp3",
        image: "https://picsum.photos/400/400?random=8",
        duration: "1:49"
    },
    {
        id: 6,
        title: "Ocean Waves",
        artist: "Tranquil Shores",
        path: "songs/ocean-waves.mp3",
        image: "https://picsum.photos/400/400?random=10",
        duration: "0:22"
    },
    {
        id: 7,
        title: "Cosmic Journey",
        artist: "Space Odyssey",
        path: "songs/cosmic-journey.mp3",
        image: "https://picsum.photos/400/400?random=15",
        duration: "3:12"
    }
,
  {
    "id": 8,
    "title": "Give Me Some Sunshine",
    "artist": "Unknown",
    "path": "songs/give-me-some-sunshine.mp3",
    "image": "https://picsum.photos/400/400?random=18",
    "duration": "4:07"
  },

];

// Global Variables
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
let shuffledPlaylist = [];

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const seekBar = document.getElementById('seekBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const albumArt = document.getElementById('albumArt');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const favoriteBtn = document.getElementById('favoriteBtn');
const searchInput = document.getElementById('searchInput');
const voiceSearchBtn = document.getElementById('voiceSearchBtn');
const playlistContainer = document.getElementById('playlistContainer');
const favoritesContainer = document.getElementById('favoritesContainer');
const recentContainer = document.getElementById('recentContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlaylist();
    loadFavorites();
    loadRecentlyPlayed();
    initializeVisitorCounter();
    setupEventListeners();
    updateVolumeIcon();
});

// Event Listeners
function setupEventListeners() {
    // Player Controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Seek Bar
    seekBar.addEventListener('input', handleSeek);
    
    // Volume Control
    volumeSlider.addEventListener('input', handleVolumeChange);
    volumeBtn.addEventListener('click', toggleMute);
    
    // Audio Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleSongEnd);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    voiceSearchBtn.addEventListener('click', startVoiceSearch);
    
    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
}

// Load Playlist
function loadPlaylist() {
    playlistContainer.innerHTML = '';
    songsDatabase.forEach((song, index) => {
        const songItem = createSongElement(song, index);
        playlistContainer.appendChild(songItem);
    });
}

// Create Song Element
function createSongElement(song, index) {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.dataset.index = index;
    
    songItem.innerHTML = `
        <img src="${song.image}" alt="${song.title}">
        <div class="song-details">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
        <span class="song-duration">${song.duration}</span>
    `;
    
    songItem.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(song);
        playSong();
    });
    
    return songItem;
}

// Load Song
function loadSong(song) {
    audioPlayer.src = song.path;
    albumArt.src = song.image;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    
    // Update playing state in playlist
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    const currentSongElement = document.querySelector(`.song-item[data-index="${currentSongIndex}"]`);
    if (currentSongElement) {
        currentSongElement.classList.add('playing');
    }
    
    // Update favorite button
    updateFavoriteButton(song.id);
    
    // Add to recently played
    addToRecentlyPlayed(song);
}

// Play/Pause Functions
function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    if (!audioPlayer.src || audioPlayer.src === window.location.href) {
        loadSong(songsDatabase[currentSongIndex]);
    }
    
    audioPlayer.play();
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    document.body.classList.add('playing');
}

function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    document.body.classList.remove('playing');
}

// Navigation Functions
function playNext() {
    if (isShuffled && shuffledPlaylist.length > 0) {
        const currentShuffleIndex = shuffledPlaylist.indexOf(currentSongIndex);
        const nextShuffleIndex = (currentShuffleIndex + 1) % shuffledPlaylist.length;
        currentSongIndex = shuffledPlaylist[nextShuffleIndex];
    } else {
        currentSongIndex = (currentSongIndex + 1) % songsDatabase.length;
    }
    
    loadSong(songsDatabase[currentSongIndex]);
    playSong();
}

function playPrevious() {
    if (isShuffled && shuffledPlaylist.length > 0) {
        const currentShuffleIndex = shuffledPlaylist.indexOf(currentSongIndex);
        const prevShuffleIndex = currentShuffleIndex - 1 < 0 ? shuffledPlaylist.length - 1 : currentShuffleIndex - 1;
        currentSongIndex = shuffledPlaylist[prevShuffleIndex];
    } else {
        currentSongIndex = currentSongIndex - 1 < 0 ? songsDatabase.length - 1 : currentSongIndex - 1;
    }
    
    loadSong(songsDatabase[currentSongIndex]);
    playSong();
}

// Shuffle Function
function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active');
    
    if (isShuffled) {
        createShuffledPlaylist();
    } else {
        shuffledPlaylist = [];
    }
}

function createShuffledPlaylist() {
    shuffledPlaylist = [...Array(songsDatabase.length).keys()];
    
    // Remove current song from array
    shuffledPlaylist.splice(currentSongIndex, 1);
    
    // Shuffle the array
    for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
    }
    
    // Add current song at the beginning
    shuffledPlaylist.unshift(currentSongIndex);
}

// Repeat Function
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    
    switch(repeatMode) {
        case 0:
            repeatBtn.classList.remove('active');
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            break;
        case 1:
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            break;
        case 2:
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
            break;
    }
}

// Progress Bar Functions
function updateProgress() {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        seekBar.value = progressPercent;
        progressFill.style.width = progressPercent + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
}

function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function handleSeek() {
    const seekTime = (seekBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
    progressFill.style.width = seekBar.value + '%';
}

// Volume Functions
function handleVolumeChange() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    document.querySelector('.volume-value').textContent = volumeSlider.value + '%';
    updateVolumeIcon();
}

function toggleMute() {
    if (audioPlayer.volume === 0) {
        audioPlayer.volume = volumeSlider.value / 100;
        volumeSlider.value = volumeSlider.value || 70;
    } else {
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
    }
    document.querySelector('.volume-value').textContent = volumeSlider.value + '%';
    updateVolumeIcon();
}

function updateVolumeIcon() {
    const volume = audioPlayer.volume;
    const volumeIcon = volumeBtn.querySelector('i');
    
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Song End Handler
function handleSongEnd() {
    if (repeatMode === 2) {
        // Repeat one
        audioPlayer.currentTime = 0;
        playSong();
    } else if (repeatMode === 1 || currentSongIndex < songsDatabase.length - 1 || isShuffled) {
        // Repeat all or has next song
        playNext();
    } else {
        // Stop at the end
        pauseSong();
    }
}

// Favorites Functions
function toggleFavorite() {
    const currentSong = songsDatabase[currentSongIndex];
    const songId = currentSong.id;
    
    const index = favorites.findIndex(fav => fav.id === songId);
    
    if (index === -1) {
        favorites.push(currentSong);
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        favorites.splice(index, 1);
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

function updateFavoriteButton(songId) {
    const isFavorite = favorites.some(fav => fav.id === songId);
    
    if (isFavorite) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

function loadFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No favorite songs yet</p>';
        return;
    }
    
    favorites.forEach(song => {
        const index = songsDatabase.findIndex(s => s.id === song.id);
        const songItem = createSongElement(song, index);
        favoritesContainer.appendChild(songItem);
    });
}

// Recently Played Functions
function addToRecentlyPlayed(song) {
    // Remove if already exists
    recentlyPlayed = recentlyPlayed.filter(s => s.id !== song.id);
    
    // Add to beginning
    recentlyPlayed.unshift(song);
    
    // Keep only last 10
    if (recentlyPlayed.length > 10) {
        recentlyPlayed.pop();
    }
    
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    loadRecentlyPlayed();
}

function loadRecentlyPlayed() {
    recentContainer.innerHTML = '';
    
    if (recentlyPlayed.length === 0) {
        recentContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No recently played songs</p>';
        return;
    }
    
    recentlyPlayed.forEach(song => {
        const index = songsDatabase.findIndex(s => s.id === song.id);
        const songItem = createSongElement(song, index);
        recentContainer.appendChild(songItem);
    });
}

// Search Functions
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const allSongItems = playlistContainer.querySelectorAll('.song-item');
    
    allSongItems.forEach(item => {
        const songDetails = item.querySelector('.song-details');
        const title = songDetails.querySelector('h4').textContent.toLowerCase();
        const artist = songDetails.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || artist.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Voice Search Function
function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Voice search is not supported in your browser.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceSearchBtn.classList.add('recording');
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        handleSearch({ target: { value: transcript } });
        voiceSearchBtn.classList.remove('recording');
    };
    
    recognition.onerror = function(event) {
        console.error('Voice search error:', event.error);
        voiceSearchBtn.classList.remove('recording');
    };
    
    recognition.onend = function() {
        voiceSearchBtn.classList.remove('recording');
    };
    
    recognition.start();
}

// Tab Switching
function switchTab(e) {
    const targetTab = e.currentTarget.dataset.tab;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${targetTab}-tab`).classList.add('active');
}

// Visitor Counter
function initializeVisitorCounter() {
    let visitorCount = localStorage.getItem('visitorCount') || 0;
    visitorCount = parseInt(visitorCount) + 1;
    localStorage.setItem('visitorCount', visitorCount);
    document.getElementById('visitorCount').textContent = visitorCount;
}

// Utility Functions
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Initialize audio volume
audioPlayer.volume = 0.7;
volumeSlider.value = 70;


var total = 40,
    playerSection = document.querySelector('.player-section'),
    rect = playerSection.getBoundingClientRect(),
    w = rect.width,
    h = rect.height,
    Tweens = [],
    SPs = 1;

for (var i = total; i--;) { 
    var Div = document.createElement('div');
    Div.className = 'dot'; // Set class directly
    playerSection.appendChild(Div); 
    TweenLite.set(Div, {x: R(w), y: R(h), opacity: 0}); // Only GSAP properties
    Anim(Div);  
    Tweens.push(Div);
}

function Anim(elm) { 
    elm.Tween = TweenLite.to(elm, R(20) + 10, {
        bezier: {values: [{x: R(w), y: R(h)}, {x: R(w), y: R(h)}]},
        opacity: R(1),
        scale: R(1) + 0.5,
        delay: R(2),
        onComplete: Anim,
        onCompleteParams: [elm]
    });
}

for (var i = total; i--;) {
    Tweens[i].Tween.play();
}

function R(max) { return Math.random() * max; }