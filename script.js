// Smooth scroll for internal nav links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const sectionId = this.getAttribute('href');
        if (sectionId.startsWith('#')) {
            e.preventDefault();
            document.querySelector(sectionId).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Dynamic nav highlighting based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY || window.pageYOffset;

    sections.forEach(section => {
        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
});

// Reveal sections on scroll (fade-in effect)
const revealSections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

revealSections.forEach(section => sectionObserver.observe(section));

// Reveal project cards on scroll (already present, improved)
const cards = document.querySelectorAll('.project-card');
const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

cards.forEach(card => cardObserver.observe(card));

import * as turf from "@turf/turf";
//Buffer Tool
const point = turf.point([85.3, 27.7]); // Example: Kathmandu coordinates
const buffered = turf.buffer(point, 10, { units: "kilometers" });
console.log(buffered);
// You can display this on a map using Leaflet or other mapping libraries
// Area Calculation Tool
const polygon = turf.polygon([
  [
    [85.3, 27.7],
    [85.4, 27.7],
    [85.4, 27.6],
    [85.3, 27.6],
    [85.3, 27.7]
  ]
]);
const area = turf.area(polygon); // Area in square meters
console.log(area);
// Display the area to users, e.g., "Area: 12345 m²"
//Nearest Point Tool
const targetPoint = turf.point([85.3, 27.7]);
const points = turf.featureCollection([
  turf.point([85.31, 27.71]),
  turf.point([85.32, 27.72]),
  turf.point([85.29, 27.69])
]);
const nearest = turf.nearestPoint(targetPoint, points);
console.log(nearest);
// You can highlight the nearest point on a map
// Spatial Tools Implementation (Turf.js)
function runBufferTool() {
  const point = turf.point([85.3240, 27.7172]);  // Kathmandu coordinates
  const buffered = turf.buffer(point, 0.5, { units: 'kilometers' });
  document.getElementById('buffer-result').textContent = 'Buffer created: 500m radius around point';
}

function runAreaTool() {
  const polygon = turf.polygon([[
    [85.3240, 27.7172],
    [85.3250, 27.7172],
    [85.3245, 27.7162],
    [85.3240, 27.7172]
  ]]);
  const area = turf.area(polygon);
  document.getElementById('area-result').textContent = `Area: ${area.toFixed(2)} m²`;
}

function runNearestTool() {
  const line = turf.lineString([
    [85.3240, 27.7172],
    [85.3250, 27.7172],
    [85.3260, 27.7182]
  ]);
  const pt = turf.point([85.3245, 27.7170]);
  const snapped = turf.nearestPointOnLine(line, pt, { units: 'meters' });
  document.getElementById('nearest-result').textContent = 
    `Nearest point: [${snapped.geometry.coordinates[0].toFixed(6)}, ${snapped.geometry.coordinates[1].toFixed(6)}]`;
}

// Existing Portfolio Scripts (unchanged)
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const sectionId = this.getAttribute('href');
    if (sectionId.startsWith('#')) {
      e.preventDefault();
      document.querySelector(sectionId).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY || window.pageYOffset;
  
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    
    if (scrollPos >= top && scrollPos < bottom) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
});

const revealSections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealSections.forEach(section => sectionObserver.observe(section));

const cards = document.querySelectorAll('.project-card');
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

cards.forEach(card => cardObserver.observe(card));

