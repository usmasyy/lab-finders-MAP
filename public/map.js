// Replace the existing Lab Finder initialization code with this updated version
document.addEventListener('DOMContentLoaded', () => {
    const labFinderButton = document.querySelector('[data-action="lab-finder"]');
    
    if (labFinderButton) {
        labFinderButton.addEventListener('click', () => {
            const labFinderUI = document.createElement('div');
            labFinderUI.className = 'lab-finder-overlay';
            labFinderUI.innerHTML = `
                <div class="lab-finder-container">
                    <div class="lab-finder-header">
                        <h2>Find Nearby Labs</h2>
                        <button id="close-lab-finder" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="lab-finder-filters">
                        <select id="service-filter" class="filter-select">
                            <option value="">All Services</option>
                            ${getUniqueServices().map(service => 
                                `<option value="${service}">${service}</option>`
                            ).join('')}
                        </select>
                        <select id="timing-filter" class="filter-select">
                            <option value="">All Timings</option>
                            <option value="24/7">24/7</option>
                            <option value="day">Day Time Only</option>
                        </select>
                        <div class="range-filter">
                            <label>Max Distance (km):</label>
                            <input type="range" id="distance-filter" min="1" max="20" value="5">
                            <span id="distance-value">5 km</span>
                        </div>
                    </div>
                    <div id="filtered-lab-list" class="lab-list"></div>
                </div>
            `;
            document.body.appendChild(labFinderUI);

            // Initialize filters
            initializeFilters();

            // Close button handler
            document.getElementById('close-lab-finder').addEventListener('click', () => {
                document.body.removeChild(labFinderUI);
            });
        });
    } else {
        console.error('Lab Finder button not found');
    }
});


function getUniqueServices() {
    const services = new Set();
    labs.forEach(lab => {
        lab.services.forEach(service => services.add(service));
    });
    return Array.from(services);
}

function initializeFilters() {
    const serviceFilter = document.getElementById('service-filter');
    const timingFilter = document.getElementById('timing-filter');
    const distanceFilter = document.getElementById('distance-filter');
    const distanceValue = document.getElementById('distance-value');

    // Add event listeners for filters
    serviceFilter.addEventListener('change', updateFilteredLabs);
    timingFilter.addEventListener('change', updateFilteredLabs);
    distanceFilter.addEventListener('input', () => {
        distanceValue.textContent = `${distanceFilter.value} km`;
        updateFilteredLabs();
    });

    // Initial update of labs
    updateFilteredLabs();
}

function updateFilteredLabs() {
    const serviceFilter = document.getElementById('service-filter');
    const timingFilter = document.getElementById('timing-filter');
    const distanceFilter = document.getElementById('distance-filter');
    
    const selectedService = serviceFilter.value;
    const selectedTiming = timingFilter.value;
    const maxDistance = parseFloat(distanceFilter.value);
    
    const mapCenter = map.getCenter();
    
    const filteredLabs = labs.filter(lab => {
        const distance = getDistance(mapCenter.lat, mapCenter.lng, lab.lat, lab.lng);
        
        const matchesService = !selectedService || lab.services.includes(selectedService);
        
        const matchesTiming = !selectedTiming || 
            (selectedTiming === '24/7' && lab.timings === '24/7') ||
            (selectedTiming === 'day' && lab.timings.includes('8:00 AM - '));
        
        const matchesDistance = distance <= maxDistance;

        return matchesService && matchesTiming && matchesDistance;
    }).map(lab => {
        const distance = getDistance(mapCenter.lat, mapCenter.lng, lab.lat, lab.lng);
        return { ...lab, distance };
    }).sort((a, b) => a.distance - b.distance);

    displayFilteredLabs(filteredLabs);
}

function displayFilteredLabs(filteredLabs) {
    const labList = document.getElementById('filtered-lab-list');
    
    if (filteredLabs.length === 0) {
        labList.innerHTML = '<div class="no-results">No labs found matching your criteria</div>';
        return;
    }

    labList.innerHTML = filteredLabs.map(lab => `
        <div class="lab-card">
            <h3>${lab.name}</h3>
            <p><strong>Distance:</strong> ${lab.distance.toFixed(2)} km</p>
            <p><strong>Services:</strong> ${lab.services.join(', ')}</p>
            <p><strong>Timings:</strong> ${lab.timings}</p>
            <p><strong>Contact:</strong> ${lab.contact}</p>
            <div class="lab-card-actions">
                <button onclick="getDirections(${lab.lat}, ${lab.lng})" class="direction-btn">
                    Get Directions
                </button>
                <button onclick="map.setView([${lab.lat}, ${lab.lng}], 16)" class="view-btn">
                    View on Map
                </button>
            </div>
        </div>
    `).join('');
}

// Function to get unique services from the labs data
function getUniqueServices() {
    const services = new Set();
    labs.forEach(lab => {
        lab.services.forEach(service => services.add(service));
    });
    return Array.from(services);
}
let serviceFilter = null;
let timingFilter = null;
let distanceFilter = null;
let distanceValue = null;
let searchMarker = null;
const DEFAULT_CENTER = [33.7500, 72.7700];
const MAX_RECENT_SEARCHES = 5;
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

// Initialize map without bounds restriction
const map = L.map('map', {
    center: DEFAULT_CENTER,
    zoom: 13,
    minZoom: 3,
    maxZoom: 19
});

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);
function saveImage(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'map-screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Extended labs data
const labs = [
    {
        name: "Capital Diagnostic Centre",
        lat: 33.78895628970263,
        lng: 72.72671488011703,
        contact: "051-123-4567",
        info: "Full service medical laboratory with state-of-the-art equipment",
        services: ["Blood Tests", "X-Ray", "MRI", "CT Scan", "Ultrasound"],
        timings: "24/7",
        address: "Near POF Hospital, The Mall, Wah Cantt"
    },
    {
        name: "POF Hospital Labs",
        lat: 33.75014826546548,
        lng: 72.78497798750843,
        contact: "051-234-5678",
        info: "Specialized diagnostic center serving POF employees and general public",
        services: ["Pathology", "Radiology", "Microbiology", "Biochemistry"],
        timings: "8:00 AM - 10:00 PM",
        address: "POF Hospital Complex, Wah Cantt"
    },
    {
        name: "IDC Labs Barrier 3",
        lat: 33.74675630883451,
        lng: 72.77142146406703,
        contact: "051-345-6789",
        info: "Hospital laboratory services with quick reporting",
        services: ["Emergency Tests", "COVID Testing", "Blood Banking"],
        timings: "24/7",
        address: "Near Barrier 3, Wah Cantt"
    },
    {
        name: "Wah Medical Complex Lab",
        lat: 33.76234567890123,
        lng: 72.77567890123456,
        contact: "051-905-1234",
        info: "Modern diagnostic facility with latest equipment",
        services: ["Clinical Laboratory", "Molecular Diagnostics", "Histopathology"],
        timings: "8:00 AM - 11:00 PM",
        address: "Main GT Road, Wah Cantt"
    },
    {
        name: "Taxila Diagnostic Center",
        lat: 33.74567890123456,
        lng: 72.79123456789012,
        contact: "051-876-5432",
        info: "Comprehensive diagnostic services with home sample collection",
        services: ["Blood Tests", "X-Ray", "ECG", "Ultrasound"],
        timings: "24/7",
        address: "Near Heavy Industries, Taxila"
    },
    {
        name: "Al-Shifa Laboratory",
        lat: 33.77890123456789,
        lng: 72.76234567890123,
        contact: "051-442-8899",
        info: "Reliable testing services with quick turnaround time",
        services: ["Clinical Pathology", "Biochemistry", "Serology"],
        timings: "8:00 AM - 10:00 PM",
        address: "Kashmir Road, Wah Cantt"
    },
    {
        name: "Wah General Hospital Lab",
        lat: 33.75567890123456,
        lng: 72.78234567890123,
        contact: "051-987-6543",
        info: "Hospital-based laboratory with emergency services",
        services: ["Emergency Tests", "Routine Lab Tests", "Specialized Tests"],
        timings: "24/7",
        address: "Hospital Road, Wah Cantt"
    },
    {
        name: "Medicare Diagnostic Lab",
        lat: 33.76789012345678,
        lng: 72.75345678901234,
        contact: "051-333-4455",
        info: "Modern lab facility with home sampling services",
        services: ["Blood Tests", "Urine Tests", "Stool Tests", "Hormone Tests"],
        timings: "7:00 AM - 11:00 PM",
        address: "Lala Rukh, Wah Cantt"
    },

    // Add these to your existing labs array
{
    name: "Citi Lab & Blood Bank",
    lat: 33.77456789012345,
    lng: 72.76123456789012,
    contact: "051-4911177",
    info: "24/7 blood bank and diagnostic services",
    services: ["Blood Bank", "Clinical Lab", "PCR Testing", "Biochemistry"],
    timings: "24/7",
    address: "Block D, Commercial Area, Wah Cantt"
},
{
    name: "Islamabad Diagnostic Centre (IDC) Wah",
    lat: 33.75678901234567,
    lng: 72.77234567890123,
    contact: "051-4545777",
    info: "Branch of renowned IDC with complete diagnostic facilities",
    services: ["MRI", "CT Scan", "X-Ray", "Ultrasound", "Laboratory Tests"],
    timings: "24/7",
    address: "Main GT Road, Near PSO Pump, Wah Cantt"
},
{
    name: "Rehman Medical Complex Lab",
    lat: 33.76345678901234,
    lng: 72.75678901234567,
    contact: "051-4431234",
    info: "Hospital laboratory with advanced testing facilities",
    services: ["Emergency Tests", "Routine Lab Tests", "COVID Testing"],
    timings: "24/7",
    address: "Near Wah Railway Station, Wah Cantt"
},
{
    name: "Chughtai Lab Wah Branch",
    lat: 33.78123456789012,
    lng: 72.76789012345678,
    contact: "051-4557890",
    info: "Branch of Chughtai Lab network with international standards",
    services: ["Blood Tests", "Molecular Testing", "Histopathology", "Microbiology"],
    timings: "7:00 AM - 11:00 PM",
    address: "Mall Road, Wah Cantt"
},
{
    name: "Wah Medical Center Laboratory",
    lat: 33.75890123456789,
    lng: 72.77901234567890,
    contact: "051-4526677",
    info: "Complete diagnostic center with home sampling",
    services: ["Clinical Pathology", "Radiology", "ECG", "Ultrasound"],
    timings: "8:00 AM - 10:00 PM",
    address: "Saddar Road, Wah Cantt"
},
{
    name: "Al-Shifa Diagnostic Complex",
    lat: 33.77234567890123,
    lng: 72.78012345678901,
    contact: "051-4538899",
    info: "Modern diagnostic facility with latest equipment",
    services: ["CT Scan", "MRI", "X-Ray", "Laboratory Tests"],
    timings: "24/7",
    address: "Near Wah General Hospital, Wah Cantt"
},
{
    name: "Fauji Foundation Laboratory",
    lat: 33.76012345678901,
    lng: 72.77123456789012,
    contact: "051-4511122",
    info: "Hospital laboratory serving military personnel and civilians",
    services: ["Blood Tests", "Urine Tests", "Biochemistry", "Serology"],
    timings: "8:00 AM - 9:00 PM",
    address: "Fauji Foundation Hospital, Wah Cantt"
},
{
    name: "Wah International Laboratory",
    lat: 33.75123456789012,
    lng: 72.76234567890123,
    contact: "051-4533344",
    info: "International standard testing facility",
    services: ["Molecular Biology", "Genetic Testing", "Specialized Tests"],
    timings: "24/7",
    address: "Block B, Commercial Area, Wah Cantt"
},
{
    name: "Care Laboratory & Diagnostic Center",
    lat: 33.77901234567890,
    lng: 72.75345678901234,
    contact: "051-4566677",
    info: "Complete care diagnostic facility with home services",
    services: ["Blood Tests", "X-Ray", "ECG", "Ultrasound"],
    timings: "8:00 AM - 11:00 PM",
    address: "Near Police Station, Wah Cantt"
},
{
    name: "Prime Care Diagnostic Center",
    lat: 33.76567890123456,
    lng: 72.78123456789012,
    contact: "051-4544433",
    info: "Premium diagnostic services with quick reporting",
    services: ["Pathology", "Radiology", "Cardiac Tests", "Ultrasound"],
    timings: "24/7",
    address: "Main Market, Lala Rukh, Wah Cantt"
}
,
    {
        name: "City Medical Lab",
        lat: 33.74123456789012,
        lng: 72.76789012345678,
        contact: "051-665-5577",
        info: "Affordable and reliable diagnostic services",
        services: ["Basic Lab Tests", "X-Ray", "Ultrasound"],
        timings: "8:00 AM - 10:00 PM",
        address: "Near Barrier 4, Wah Cantt"
    },
    {
        name: "Shifa Medical Laboratory",
        lat: 33.77234567123456,
        lng: 72.76345678234567,
        contact: "051-4577890",
        info: "State-of-the-art diagnostic center with digital reporting system",
        services: ["Molecular Testing", "Hormone Analysis", "Drug Testing", "Allergy Tests"],
        timings: "24/7",
        address: "Plaza Road, Near UBL Bank, Wah Cantt"
    },
    {
        name: "Medix Diagnostic Center",
        lat: 33.75678912345678,
        lng: 72.77456789123456,
        contact: "051-4533221",
        info: "Modern lab with automated testing equipment",
        services: ["Blood Banking", "Microbiology", "Clinical Chemistry", "Immunology"],
        timings: "8:00 AM - 11:00 PM",
        address: "Main Market, Block C, Wah Cantt"
    },
    {
        name: "LifeCare Laboratory",
        lat: 33.76789123456789,
        lng: 72.75567891234567,
        contact: "051-4566789",
        info: "Specialized in genetic testing and molecular diagnostics",
        services: ["Genetic Testing", "Cancer Markers", "Prenatal Testing", "PCR Tests"],
        timings: "24/7",
        address: "Near Wah Medical College, Wah Cantt"
    },
    {
        name: "Doctors Laboratory & Diagnostic",
        lat: 33.78012345678912,
        lng: 72.76678912345678,
        contact: "051-4544567",
        info: "Complete diagnostic solution with home sampling",
        services: ["Clinical Pathology", "Radiology", "Ultrasound", "ECG"],
        timings: "7:00 AM - 10:00 PM",
        address: "Kashmir Road, Near PSO Pump, Wah Cantt"
    },
    {
        name: "Smart Lab Diagnostics",
        lat: 33.75345678912345,
        lng: 72.77789123456789,
        contact: "051-4588999",
        info: "Digital lab with online report delivery system",
        services: ["Blood Tests", "COVID Testing", "Hormone Tests", "Liver Function Tests"],
        timings: "24/7",
        address: "Commercial Area, Block B, Wah Cantt"
    },
    
    {
        name: "Advanced Diagnostic Center",
        lat: 33.77123456789012,
        lng: 72.77890123456789,
        contact: "051-908-7654",
        info: "State-of-the-art diagnostic facility with expert staff",
        services: ["MRI", "CT Scan", "Ultrasound", "X-Ray", "Laboratory Tests"],
        timings: "24/7",
        address: "Main Market, Wah Cantt"
    }

    
];

// Icons
const labIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const searchIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Add lab markers
labs.forEach(lab => {
    const marker = L.marker([lab.lat, lab.lng], { icon: labIcon }).addTo(map);
    const popupContent = `
        <div class="popup-content">
            <h3 class="text-lg font-bold mb-2">${lab.name}</h3>
            <p class="mb-1"><strong>Address:</strong> ${lab.address}</p>
            <p class="mb-1"><strong>Contact:</strong> ${lab.contact}</p>
            <p class="mb-1"><strong>Timings:</strong> ${lab.timings}</p>
            <p class="mb-1"><strong>Services:</strong> ${lab.services.join(', ')}</p>
            <p class="mb-2"><strong>Info:</strong> ${lab.info}</p>
            <button onclick="getDirections(${lab.lat}, ${lab.lng})" 
                class="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
                Get Directions
            </button>
        </div>
    `;
    marker.bindPopup(popupContent);
});

// Search functionality
async function searchLabs() {
    const searchInput = document.getElementById('search').value.trim();
    
    if (!searchInput) {
        alert('Please enter a location');
        return;
    }

    try {
        const searchQuery = encodeURIComponent(searchInput);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1&addressdetails=1`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);

            // Remove existing search marker if any
            if (searchMarker) {
                map.removeLayer(searchMarker);
            }

            // Add new search marker
            searchMarker = L.marker([lat, lon], { icon: searchIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="search-popup">
                        <h4 class="font-bold mb-1">Searched Location:</h4>
                        <p class="mb-1">${searchInput}</p>
                        <p class="text-sm text-gray-600">${location.display_name}</p>
                    </div>
                `)
                .openPopup();

            // Pan and zoom to the location
            map.setView([lat, lon], 15);

            // Add to recent searches
            addToRecentSearches(searchInput);
            
            // Find and display nearby labs
            const nearbyLabs = findNearbyLabs(lat, lon);
            updateLabList(nearbyLabs);
        } else {
            alert('Location not found. Please try a different search term.');
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
    }
}

// Helper functions
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findNearbyLabs(lat, lon) {
    return labs.map(lab => {
        const distance = getDistance(lat, lon, lab.lat, lab.lng);
        return { ...lab, distance };
    }).sort((a, b) => a.distance - b.distance);
}

function updateLabList(nearbyLabs) {
    const labListElement = document.getElementById('labList');
    if (!labListElement) return;

    const labsHtml = nearbyLabs.map(lab => `
        <div class="lab-item p-4 border-b border-gray-200 hover:bg-gray-50">
            <h4 class="font-bold text-lg mb-2">${lab.name}</h4>
            <p class="text-sm mb-1">Distance: ${lab.distance.toFixed(2)} km</p>
            <p class="text-sm mb-1">Contact: ${lab.contact}</p>
            <p class="text-sm mb-1">Timings: ${lab.timings}</p>
            <p class="text-sm mb-1">Address: ${lab.address}</p>
            <p class="text-sm">Services: ${lab.services.join(', ')}</p>
        </div>
    `).join('');

    labListElement.innerHTML = labsHtml || '<p class="p-4 text-gray-500">No labs found in the database</p>';
}

// Recent searches functionality
function addToRecentSearches(searchInput) {
    recentSearches = recentSearches.filter(search => search !== searchInput);
    recentSearches.unshift(searchInput);
    
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
        recentSearches.pop();
    }
    
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    updateRecentSearchesUI();
}

function updateRecentSearchesUI() {
    const recentSearchesElement = document.getElementById('recentSearches');
    if (!recentSearchesElement) return;

    recentSearchesElement.innerHTML = recentSearches
        .map(search => `
            <div class="recent-search-item p-2 hover:bg-gray-100 cursor-pointer" 
                onclick="document.getElementById('search').value='${search}'; searchLabs();">
                ${search}
            </div>
        `)
        .join('');
}

// Directions functionality
function getDirections(lat, lng) {
    // Open in Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

// Initialize screenshot functionality
function initializeScreenshot() {
    const cameraButton = document.querySelector('button:has(span:contains("Camera"))');
    if (!cameraButton) {
        console.error("Camera button not found");
        return;
    }

    cameraButton.addEventListener('click', () => {
        console.log("Camera button clicked"); // Debugging log
        html2canvas(document.getElementById('map')).then(canvas => {
            const screenshot = canvas.toDataURL('image/png');
            saveImage(screenshot); // Save the screenshot
        }).catch(error => {
            console.error('Error taking screenshot:', error);
            alert('Unable to take screenshot. Please try again.');
        });
    });
}

// Initialize lab finder functionality
function initializeLabFinder() {
    const labFinderButton = document.querySelector('button:has(span:contains("Lab Finder"))');
    if (!labFinderButton) return;

    labFinderButton.addEventListener('click', () => {
        const labFinderUI = document.createElement('div');
        labFinderUI.className = 'lab-finder-overlay';
        labFinderUI.innerHTML = `
            <div class="lab-finder-container">
                <div class="lab-finder-header">
                    <h2>Find Nearby Labs</h2>
                    <button id="close-lab-finder" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lab-finder-filters">
                    <select id="service-filter" class="filter-select">
                        <option value="">All Services</option>
                        ${getUniqueServices().map(service => 
                            `<option value="${service}">${service}</option>`
                        ).join('')}
                    </select>
                    <select id="timing-filter" class="filter-select">
                        <option value="">All Timings</option>
                        <option value="24/7">24/7</option>
                        <option value="day">Day Time Only</option>
                    </select>
                    <div class="range-filter">
                        <label>Max Distance (km):</label>
                        <input type="range" id="distance-filter" min="1" max="20" value="5">
                        <span id="distance-value">5 km</span>
                    </div>
                </div>
                <div id="filtered-lab-list" class="lab-list"></div>
            </div>
        `;
        document.body.appendChild(labFinderUI);

        // Initialize filters
        initializeFilters();

        // Close button handler
        document.getElementById('close-lab-finder').onclick = () => {
            document.body.removeChild(labFinderUI);
        };
    });
}
function initializeScreenshot() {
    const cameraButton = document.querySelector('.action-button:has(i.fa-camera)');
    
    cameraButton.addEventListener('click', function() {
        // Add a loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = 'Taking screenshot...';
        loadingDiv.className = 'screenshot-loading';
        document.body.appendChild(loadingDiv);

        // Hide controls temporarily
        const controls = document.querySelectorAll('.leaflet-control');
        controls.forEach(control => control.style.display = 'none');

        html2canvas(document.getElementById('map'), {
            useCORS: true,
            allowTaint: true,
            logging: true,
            windowWidth: document.getElementById('map').scrollWidth,
            windowHeight: document.getElementById('map').scrollHeight
        }).then(canvas => {
            // Show controls again
            controls.forEach(control => control.style.display = '');
            
            // Remove loading indicator
            document.body.removeChild(loadingDiv);
            
            // Convert and save
            const screenshot = canvas.toDataURL('image/png');
            saveImage(screenshot);
        }).catch(error => {
            console.error('Screenshot error:', error);
            alert('Failed to take screenshot. Please try again.');
            
            // Cleanup
            controls.forEach(control => control.style.display = '');
            if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        });
    });
}
function saveImage(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `map-screenshot-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize features
    initializeScreenshot(); // Call the screenshot function
    initializeLabFinder(); // Keep the lab finder functionality

    // Set up search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLabs();
            }
        });
    }

    // Update recent searches UI
    updateRecentSearchesUI();
});