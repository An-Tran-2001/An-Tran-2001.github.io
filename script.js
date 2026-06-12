document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // AI Door Animation Logic
    const doorOverlay = document.getElementById('door-overlay');
    if (doorOverlay) {
        document.body.style.overflow = 'hidden'; // Lock scroll during animation
        setTimeout(() => {
            document.body.style.overflow = ''; // Unlock scroll when doors open
            setTimeout(() => {
                doorOverlay.remove(); // Clean up DOM
            }, 1000);
        }, 1900); // Wait for doors to start opening
    }

    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'dark') {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    });

    // Language Switcher
    const langSelect = document.getElementById('lang-select');
    
    function setLanguage(lang) {
        if (!window.translations || !window.translations[lang]) return;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.translations[lang][key]) {
                el.textContent = window.translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
        localStorage.setItem('lang', lang);
        if(langSelect) {
            langSelect.value = lang;
        }
    }

    const savedLang = localStorage.getItem('lang') || 'en';
    if(langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    
    // Initial language setup
    setLanguage(savedLang);

    // Neural Network Background
    const canvas = document.getElementById('neural-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        }

        function initParticles() {
            particles = [];
            // Adjust count based on screen size for subtle effect
            const numParticles = Math.min(Math.floor((width * height) / 18000), 80); 
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4, // Slow drift
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 1.5 + 0.5,
                    baseAlpha: Math.random() * 0.4 + 0.1,
                    phase: Math.random() * Math.PI * 2 // Random start phase for pulsing
                });
            }
        }

        window.addEventListener('resize', resize);
        resize();

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            // Subtle tech blue colors for nodes and lines
            const nodeColor = isDark ? '147, 197, 253' : '96, 165, 250'; 
            const lineColor = isDark ? '59, 130, 246' : '147, 197, 253';
            
            const time = Date.now() * 0.001; // Current time in seconds

            particles.forEach((p, index) => {
                // Move particle
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges smoothly
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Pulsing effect (lúc mờ lúc đậm)
                const pulse = Math.sin(time + p.phase) * 0.5 + 0.5; // Oscillates between 0 and 1
                const nodeAlpha = p.baseAlpha + pulse * 0.4;

                // Draw node
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${nodeColor}, ${nodeAlpha})`;
                ctx.fill();

                // Draw connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const maxDist = 160;
                    if (dist < maxDist) {
                        // Line opacity based on distance and pulsing
                        const lineBaseAlpha = isDark ? 0.2 : 0.25;
                        const distFactor = (1 - dist / maxDist);
                        // Combine distance fade with time pulse
                        const lineAlpha = distFactor * lineBaseAlpha * (0.5 + 0.5 * pulse); 
                        
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        }

        animate();
    }
});
