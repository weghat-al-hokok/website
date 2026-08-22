document.addEventListener('DOMContentLoaded', () => {
    
    // Set Current Year in Footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);


    // 2. Navigation & Mobile Menu Logic
    const header = document.getElementById('header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    // Sticky Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if(mobileToggle && mobileClose && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent scrolling
        });

        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth Scroll for anchor links using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    lenis.scrollTo(targetElement, {
                        offset: -100 // adjust for sticky header
                    });
                }
            }
        });
    });

    // Active Nav Link Tracking
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });


    // 3. Services Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding tab content
            const targetId = btn.getAttribute('data-target');
            const targetContent = document.querySelector(targetId);
            if(targetContent) {
                targetContent.classList.add('active');
            }
            
            // Re-trigger scrolltrigger for the active tab content if necessary
            ScrollTrigger.refresh();
        });
    });


    // 4. GSAP Animations

    // Custom Split Text functionality
    function splitText(selector) {
        document.querySelectorAll(selector).forEach(el => {
            const text = el.innerText;
            el.innerHTML = '';
            text.split(' ').forEach(word => {
                const wordWrap = document.createElement('span');
                wordWrap.style.display = 'inline-block';
                wordWrap.style.overflow = 'hidden';
                wordWrap.style.marginRight = '0.3em'; // RTL support
                wordWrap.style.paddingTop = '0.2em';
                wordWrap.style.paddingBottom = '0.2em';
                
                const wordInner = document.createElement('span');
                wordInner.innerText = word;
                wordInner.style.display = 'inline-block';
                wordInner.classList.add('split-inner');
                
                wordWrap.appendChild(wordInner);
                el.appendChild(wordWrap);
            });
        });
    }

    splitText('.hero .reveal-text');

    // Typewriter effect for subtitle
    const phrases = ["للمحاماة", "للاستشارات القانونية", "لتأسيس الشركات", "لتسوية النزاعات"];
    const typewriterEl = document.querySelector('.typewriter-text');
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        if (!typewriterEl) return;
        
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 40 : 100;
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400; // Pause before next
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start typewriter after a short delay
    setTimeout(typeWriter, 1500);

    // Hero Text Reveal with cinematic stagger
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    heroTl.fromTo('.hero .split-inner', 
        { y: '120%', rotation: 5, opacity: 0 },
        { y: '0%', rotation: 0, opacity: 1, duration: 1.8, stagger: 0.1 },
        0.2
    );

    heroTl.fromTo('.hero-cta', 
        { y: 40, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: "power3.out" }, 
        "-=1.2"
    );

    // Hero Logo entrance animation (replaces legal-abstract / scales)
    const heroLogo = document.querySelector('.hero-logo-img');
    const heroRings = document.querySelectorAll('.hero-logo-ring');
    
    if (heroLogo) {
        // Immediately hide it off-screen to the right
        gsap.set(heroLogo, { x: '100vw', opacity: 1, rotation: 180 });
        
        const logoTl = gsap.timeline({ delay: 1 }); // Wait 1 second before rushing in
        logoTl.to(heroLogo, { x: -50, rotation: -20, duration: 0.6, ease: "power4.inOut" }) // Rush in
              .to(heroLogo, { opacity: 0, scale: 0.2, duration: 0.15 }) // Disappear
              .set(heroLogo, { x: 0, rotation: 0, scale: 0 }) // Reset position invisibly
              .to(heroLogo, { opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.4)" }); // Pop up in place
    }
    
    if (heroRings.length) {
        heroRings.forEach((ring, i) => {
            heroTl.fromTo(ring,
                { opacity: 0, scale: 0.5 },
                { opacity: 0.6, scale: 1, duration: 1.2, ease: "power2.out" },
                `-=${1.0 - i * 0.15}`
            );
        });
    }


    // ScrollReveal Animations with alternating directions (from top and bottom)
    const revealElements = document.querySelectorAll('.gs-reveal');
    
    revealElements.forEach((elem, index) => {
        let delay = 0;
        if(elem.classList.contains('delay-1')) delay = 0.15;
        if(elem.classList.contains('delay-2')) delay = 0.3;
        if(elem.classList.contains('delay-3')) delay = 0.45;

        // Alternate direction based on index to create dynamic up/down reveals
        const yOffset = (index % 2 === 0) ? 60 : -60;

        gsap.fromTo(elem, 
            { y: yOffset, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1.2, 
                delay: delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Staggered grid animations (features, sectors, etc.)
    const staggerGrids = [
        '.features-grid',
        '.sectors-grid',
        '.clients-list ul'
    ];

    staggerGrids.forEach(selector => {
        const grid = document.querySelector(selector);
        if (grid) {
            const children = grid.children;
            gsap.fromTo(children,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: grid,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });

    // Timeline steps stagger animation
    const timelineSteps = document.querySelectorAll('.t-step');
    if (timelineSteps.length) {
        gsap.fromTo(timelineSteps,
            { y: 50, opacity: 0, scale: 0.9 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: '.timeline-container',
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Timeline line draw animation
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        gsap.fromTo(timelineLine,
            { scaleX: 0, transformOrigin: "right center" },
            {
                scaleX: 1,
                duration: 1.5,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: '.timeline-container',
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Services tabs container entrance
    const servicesWrapper = document.querySelector('.services-wrapper');
    if (servicesWrapper) {
        gsap.fromTo(servicesWrapper,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: servicesWrapper,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Section titles enhanced entrance
    document.querySelectorAll('.section-title').forEach(title => {
        const titleLine = title.querySelector('.title-line');
        if (titleLine) {
            gsap.fromTo(titleLine,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });

    // Parallax effects
    gsap.to('.shape-1', {
        y: 150,
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });

    gsap.to('.shape-2', {
        y: -150,
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });

    // Hero content parallax on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            y: -80,
            opacity: 0.3,
            scrollTrigger: {
                trigger: '.hero',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    // Hero logo parallax on scroll
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        gsap.to(heroVisual, {
            y: -50,
            opacity: 0.5,
            scrollTrigger: {
                trigger: '.hero',
                start: "center top",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    // 3D Magnetic hover effect for cards & buttons
    const magneticElements = document.querySelectorAll('.about-card, .vms-card, .sector-card, .feature-item, .s-item-card, .btn-primary, .btn-outline');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotX = (y / rect.height) * -20;
            const rotY = (x / rect.width) * 20;
            
            gsap.to(el, {
                x: x * 0.05,
                y: y * 0.05,
                rotationX: rotX,
                rotationY: rotY,
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });
        });
    });

    // 5. Dynamic Premium Background Animations
    gsap.to('.ambient-orb', {
        y: 'random(-200, 200)',
        x: 'random(-150, 150)',
        scale: 'random(0.5, 1.5)',
        rotation: 'random(-45, 45)',
        duration: 'random(4, 8)',
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to('.ambient-shard', {
        y: 'random(-150, 150)',
        x: 'random(-100, 100)',
        rotation: 'random(-90, 90)',
        scale: 'random(0.7, 1.3)',
        duration: 'random(5, 10)',
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
});
