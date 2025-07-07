/**
 * @file Main script for Ganesh Saud's interactive portfolio.
 * @description Handles smooth scrolling, navigation highlighting,
 * scroll-reveal animations, the interactive Leaflet/Turf.js map, and form submission.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // 1. UI & NAVIGATION SCRIPTS
    // ===================================================================

    /**
     * Initializes smooth scrolling for all internal navigation links.
     */
    const initSmoothScrolling = () => {
        document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    };

    /**
     * Dynamically highlights the active navigation link based on scroll position
     * using IntersectionObserver for performance.
     */
    const initNavHighlighting = () => {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('nav a');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        sections.forEach(section => observer.observe(section));
    };

    /**
     * Initializes scroll-reveal animations for sections using IntersectionObserver.
     */
    const initScrollAnimations = () => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section').forEach(el => observer.observe(el));
    };

    // ===================================================================
    // 2. INTERACTIVE MAP & SPATIAL TOOLS (LEAFLET + TURF.JS)
    // ===================================================================
    
    const initInteractiveMap = () => {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // --- 2.1. Map Setup ---
        const map = L.map('map').setView([28.3949, 84.1240], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        // --- 2.2. Data & Global State ---
        const projectLocations = [
            { name: "Air Pollution Study", coords: [27.6710, 85.4298], desc: "Bhaktapur, Nepal" },
            { name: "Irrigation Mapping", coords: [29.2833, 81.2500], desc: "Bajura, Nepal" },
            { name: "UAV Topography", coords: [27.6263, 85.5342], desc: "Dhulikhel, KU Campus" }
        ];
        const turfPoints = turf.featureCollection(
            projectLocations.map(p => turf.point(p.coords.slice().reverse(), { name: p.name }))
        );

        let activeTool = null;
        let areaPoints = [];
        let tempLayerGroup = L.layerGroup().addTo(map);
        const permanentLayers = {
            buffer: L.layerGroup().addTo(map),
            area: L.layerGroup().addTo(map),
            nearest: L.layerGroup().addTo(map)
        };

        const instructionEl = document.getElementById('map-instructions');
        const toolButtons = {
            buffer: document.getElementById('buffer-tool'),
            area: document.getElementById('area-tool'),
            nearest: document.getElementById('nearest-tool')
        };
        const mapContainer = map.getContainer();

        // --- 2.3. Core Tool Functions ---
        function deactivateAllTools() {
            if (!activeTool) return;
            mapContainer.style.cursor = '';
            instructionEl.textContent = '';
            if (toolButtons[activeTool]) {
                toolButtons[activeTool].classList.remove('active');
            }
            areaPoints = [];
            tempLayerGroup.clearLayers();
            activeTool = null;
        }

        function activateTool(toolName) {
            if (activeTool === toolName) {
                deactivateAllTools();
                return;
            }
            deactivateAllTools();
            activeTool = toolName;
            mapContainer.style.cursor = 'crosshair';
            toolButtons[toolName].classList.add('active');

            Object.keys(permanentLayers).forEach(key => {
                if (key !== toolName) permanentLayers[key].clearLayers();
            });

            const instructions = {
                buffer: 'Click on the map to create a 50km buffer.',
                area: 'Click to add points. Double-click last point to finish.',
                nearest: 'Click on the map to find the nearest project location.'
            };
            instructionEl.textContent = instructions[toolName];
        }

        // --- 2.4. Map Event Handlers ---
        map.on('click', (e) => {
            if (!activeTool) return;
            switch (activeTool) {
                case 'buffer': handleBuffer(e.latlng); break;
                case 'area': handleAreaClick(e.latlng); break;
                case 'nearest': handleNearest(e.latlng); break;
            }
        });

        map.on('dblclick', (e) => {
            if (activeTool === 'area' && areaPoints.length >= 3) {
                L.DomEvent.stop(e);
                finalizeArea();
            }
        });
        
        map.on('mousemove', (e) => {
            if (activeTool === 'area' && areaPoints.length > 0) {
                updateTempAreaLine(e.latlng);
            }
        });

        // --- 2.5. Tool Logic ---
        function handleBuffer(latlng) {
            permanentLayers.buffer.clearLayers();
            const point = turf.point([latlng.lng, latlng.lat]);
            const buffer = turf.buffer(point, 50, { units: 'kilometers' });
            
            L.geoJSON(buffer, { style: { color: '#09c2a3', weight: 2, opacity: 0.8, fillOpacity: 0.2 } }).addTo(permanentLayers.buffer);
            L.circleMarker(latlng, { radius: 6, color: '#09c2a3', fillOpacity: 1 }).addTo(permanentLayers.buffer);
            L.popup().setLatLng(latlng).setContent('<b>50km Buffer Zone</b>').openOn(map);
            deactivateAllTools();
        }

        function handleAreaClick(latlng) {
            areaPoints.push([latlng.lng, latlng.lat]);
            L.circleMarker(latlng, { radius: 5, color: '#f8d90f' }).addTo(tempLayerGroup);
            if (areaPoints.length > 1) {
                tempLayerGroup.clearLayers(); // Redraw everything to keep it simple
                areaPoints.forEach(p => L.circleMarker(p.slice().reverse(), { radius: 5, color: '#f8d90f' }).addTo(tempLayerGroup));
                const polyline = L.polyline(areaPoints.map(p => p.slice().reverse()), { color: '#f8d90f', weight: 3 });
                tempLayerGroup.addLayer(polyline);
            }
        }

        function updateTempAreaLine(currentLatLng) {
            tempLayerGroup.eachLayer(layer => {
                if (layer.options.dashArray) layer.remove();
            });
            const lastPoint = areaPoints[areaPoints.length - 1].slice().reverse();
            L.polyline([lastPoint, [currentLatLng.lat, currentLatLng.lng]], {
                color: '#f8d90f', weight: 3, dashArray: '5, 10'
            }).addTo(tempLayerGroup);
        }

        function finalizeArea() {
            permanentLayers.area.clearLayers();
            const polygonCoords = [...areaPoints, areaPoints[0]];
            const turfPolygon = turf.polygon([polygonCoords]);
            const areaSqKm = (turf.area(turfPolygon) / 1000000).toFixed(2);

            const finalPolygon = L.geoJSON(turfPolygon, { style: { color: '#f8d90f', weight: 3, fillOpacity: 0.25 } }).addTo(permanentLayers.area);
            L.popup().setLatLng(finalPolygon.getBounds().getCenter()).setContent(`<b>Calculated Area:</b><br>${areaSqKm} sq. km`).openOn(map);
            deactivateAllTools();
        }

        function handleNearest(latlng) {
            permanentLayers.nearest.clearLayers();
            const clickedPoint = turf.point([latlng.lng, latlng.lat]);
            const nearest = turf.nearestPoint(clickedPoint, turfPoints);
            const distance = turf.distance(clickedPoint, nearest, { units: 'kilometers' });

            const line = turf.lineString([clickedPoint.geometry.coordinates, nearest.geometry.coordinates]);
            L.geoJSON(line, { style: { color: '#dc3545', weight: 3, dashArray: '5, 5' } }).addTo(permanentLayers.nearest);
            L.circleMarker(latlng, { radius: 6, color: '#dc3545', fillOpacity: 1 }).addTo(permanentLayers.nearest);
            L.marker(nearest.geometry.coordinates.slice().reverse(), {
                icon: L.divIcon({
                    className: 'nearest-marker-icon',
                    html: `<i class="fas fa-star" style="color:#dc3545; font-size: 20px;"></i>`
                })
            }).addTo(permanentLayers.nearest);
            
            L.popup().setLatLng(latlng).setContent(`<b>Nearest:</b> ${nearest.properties.name}<br><b>Distance:</b> ${distance.toFixed(2)} km`).openOn(map);
            deactivateAllTools();
        }

        // --- 2.6. Initial Setup ---
        projectLocations.forEach(p => {
            L.marker(p.coords).addTo(map).bindPopup(`<b>${p.name}</b><br>${p.desc}`);
        });
        Object.values(toolButtons).forEach(button => {
            button.addEventListener('click', () => activateTool(button.id.replace('-tool', '')));
        });
    };
    
    // ===================================================================
    // 3. CONTACT FORM
    // ===================================================================

    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        const statusEl = document.getElementById('form-status');
        if (!form || !statusEl) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real-world scenario, you would use fetch() to send this data
            // to a backend service (e.g., Formspree, Netlify Forms, custom server).
            // For this portfolio, we'll simulate a successful submission.

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            setTimeout(() => {
                form.reset();
                statusEl.textContent = "Thank you! Your message has been sent.";
                statusEl.className = 'form-status success';
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';

                setTimeout(() => {
                    statusEl.textContent = "";
                    statusEl.className = 'form-status';
                }, 5000); // Clear message after 5 seconds

            }, 1000); // Simulate network delay
        });
    };


    // ===================================================================
    // 4. INITIALIZE ALL SCRIPTS
    // ===================================================================
    initSmoothScrolling();
    initNavHighlighting();
    initScrollAnimations();
    initInteractiveMap();
    initContactForm();
});