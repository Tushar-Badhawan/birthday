/* ============================================================
   ASSET CONFIGURATION
   ============================================================ */
const ASSETS = {
    kanha: [
        { src: 'assets/kanha_1.svg', pos: 'top-left',     size: 90, anim: 'float' },
        { src: 'assets/kanha_2.svg', pos: 'top-right',    size: 90, anim: 'sway'  },
        { src: 'assets/kanha_3.svg', pos: 'mid-left',     size: 80, anim: 'bob'   },
        { src: 'assets/kanha_4.svg', pos: 'mid-right',    size: 80, anim: 'glow'  },
        { src: 'assets/kanha_5.svg', pos: 'bottom-left',  size: 85, anim: 'float' },
        { src: 'assets/kanha_6.svg', pos: 'bottom-right', size: 85, anim: 'sway'  },
    ],
    centralScene:  'assets/birthday_scene.png',
    finalScene:    'assets/final_scene.png',
    landingMusic:  'assets/happy_birthday_chimes.mp3',
    kanhaMusic:    'assets/krishna_flute.mp3',
    finalMusic:    'assets/soft_chimes.mp3'
};

/* ============================================================
   STATE
   ============================================================ */
const state = {
    noClicked:       false,
    ribbonCut:       false,
    curtainsOpening: false,
    landingMusicOn:  false,
    kanhaMusicOn:    false,
    finalMusicOn:    false,
    page4Visible:    false,
    page5Visible:    false
};

/* ============================================================
   HELPERS
   ============================================================ */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const page1              = $('#page1');
const page1Scroll        = $('#page1-scroll');
const heroSection        = $('.hero-section');
const finalSection       = $('#final-section');

const ribbonScene        = $('#page2-ribbon');
const ribbonTrack        = $('#ribbon-track');
const scissorsIcon       = $('#scissors-icon');

const stageWrapper       = $('#stage-wrapper');
const stageScroll        = $('#stage-scroll');
const page2              = $('#page2');
const page3              = $('#page3');
const page4              = $('#page4');
const page5              = $('#page5');

const btnYes             = $('#btn-yes');
const btnNo              = $('#btn-no');
const playfulMessage     = $('#playful-message');

const centralImg         = $('#central-img');
const centralPlaceholder = $('#central-placeholder');
const finalImg           = $('#final-img');
const finalPlaceholder   = $('#final-placeholder');

const scrollCTA          = $('#scroll-cta');

const landingMusic       = $('#landing-music');
const bgMusic            = $('#bg-music');
const finalMusic         = $('#final-music');
const btnLandingMusic    = $('#btn-landing-music');
const btnMusicToggle     = $('#btn-music-toggle');
const volumeSlider       = $('#volume-slider');
const musicControl       = $('#music-control');

/* ============================================================
   PARTICLE GENERATORS
   ============================================================ */
function spawnParticles(container, count, className, color) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = className;
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (4 + Math.random() * 8) + 's';
        el.style.animationDelay = (Math.random() * 8) + 's';
        el.style.width = (1 + Math.random() * 3) + 'px';
        el.style.height = el.style.width;
        if (color) {
            el.style.background = color;
            el.style.boxShadow = `0 0 8px ${color}`;
        }
        container.appendChild(el);
    }
}

function spawnCurtainSparkles(container, count) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'curtain-sparkle';
        el.style.left = Math.random() * 100 + '%';
        el.style.top = Math.random() * 100 + '%';
        el.style.animationDuration = (1.5 + Math.random() * 3) + 's';
        el.style.animationDelay = (Math.random() * 4) + 's';
        container.appendChild(el);
    }
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
    console.log('[Birthday Site] init() running…');

    if (!page1 || !btnYes || !btnNo || !ribbonTrack || !stageWrapper || !page2 || !page3) {
        console.error('[Birthday Site] Critical DOM elements missing.');
        return;
    }

    const p1Particles = $('#page1-particles');
    if (p1Particles) {
        spawnParticles(p1Particles, 25, 'particle');
        $$('#page1-particles .particle').forEach((p, i) => {
            if (i % 4 === 0) p.classList.add('gold');
        });
    }

    const cSparkles = $('#curtain-sparkles');
    if (cSparkles) spawnCurtainSparkles(cSparkles, 40);

    preloadCentralImage();
    preloadFinalImage();
    setupMusic();
    setupScrollReveal();
    setupStageScroll();
    setupSmoothWheelScroll();

    btnYes.addEventListener('click', onYesClick);
    btnNo.addEventListener('click', onNoClick);
    scissorsIcon.addEventListener('click', onRibbonCut);

    if (btnLandingMusic) {
        btnLandingMusic.addEventListener('click', toggleLandingMusic);
    }

    console.log('[Birthday Site] init() complete.');
}

/* ============================================================
   SCROLL REVEAL (landing page sections)
   ============================================================ */
function setupScrollReveal() {
    const sections = $$('.content-section, .hero-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach((s) => observer.observe(s));

    if (heroSection) heroSection.classList.add('in-view');
}

/* ============================================================
   STAGE SCROLL — watches Page 4 and Page 5 only
   ============================================================ */
function setupStageScroll() {
    if (!stageScroll) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target === page4 && entry.isIntersecting && entry.intersectionRatio > 0.5) {
                if (!state.page4Visible) {
                    state.page4Visible = true;
                    onPage4Enter();
                }
            }

            if (entry.target === page5 && entry.isIntersecting && entry.intersectionRatio > 0.5) {
                if (!state.page5Visible) {
                    state.page5Visible = true;
                    onPage5Enter();
                }
            }
        });
    }, {
        threshold: [0.5, 0.6, 0.7]
    });

    if (page4) observer.observe(page4);
    if (page5) observer.observe(page5);
}

/* ============================================================
   SMOOTH WHEEL SCROLL — one wheel flick = one page change
   ============================================================ */
function setupSmoothWheelScroll() {
    if (!stageScroll) return;

    let isAnimating = false;
    let wheelAccumulator = 0;
    let resetTimer = null;

    stageScroll.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

        e.preventDefault();

        wheelAccumulator += e.deltaY;

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            wheelAccumulator = 0;
        }, 150);

        if (isAnimating) return;
        if (Math.abs(wheelAccumulator) < 30) return;

        const direction = wheelAccumulator > 0 ? 1 : -1;
        wheelAccumulator = 0;

        const pageHeight = stageScroll.clientHeight;
        const currentTop = stageScroll.scrollTop;
        const targetIndex = Math.round(currentTop / pageHeight) + direction;

        const maxIndex = Math.ceil(stageScroll.scrollHeight / pageHeight) - 1;
        const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));

        const targetTop = clampedIndex * pageHeight;

        isAnimating = true;
        stageScroll.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isAnimating = false;
        }, 900);
    }, { passive: false });
}

/* ============================================================
   PAGE 3 — Thought bubbles with auto-hide + delayed CTA
   ============================================================ */
function scheduleBubbles(scopeEl) {
    if (!scopeEl) return;

    const bubbles = scopeEl.querySelectorAll('.thought-bubble');
    let latestHide = 0;

    bubbles.forEach((bubble) => {
        const showDelay = parseInt(bubble.dataset.delay || '0', 10);
        const hideDelay = parseInt(bubble.dataset.hide  || (showDelay + 4000).toString(), 10);

        if (hideDelay > latestHide) latestHide = hideDelay;

        bubble.classList.remove('visible', 'hiding');

        setTimeout(() => {
            bubble.classList.add('visible');
            bubble.classList.remove('hiding');
        }, showDelay);

        setTimeout(() => {
            bubble.classList.remove('visible');
            bubble.classList.add('hiding');
        }, hideDelay);
    });

    const cta = scopeEl.querySelector('.scroll-cta');
    if (cta) {
        setTimeout(() => {
            cta.classList.add('visible');
        }, latestHide + 700);
    }
}

/* ============================================================
   PAGE 5 — Final words, timed reveal
   ============================================================ */
function schedulePage5Lines(scopeEl) {
    if (!scopeEl) return;

    const lines = scopeEl.querySelectorAll('.page5-line');
    lines.forEach((line) => {
        const delay = parseInt(line.dataset.delay || '0', 10);
        setTimeout(() => {
            line.classList.add('visible');
        }, delay);
    });
}

/* ============================================================
   IMAGE PRELOADS
   ============================================================ */
function preloadCentralImage() {
    if (!centralImg || !centralPlaceholder) return;

    const img = new Image();
    img.onload = () => {
        centralImg.src = ASSETS.centralScene;
        centralImg.classList.add('loaded');
        centralPlaceholder.classList.add('hidden');
    };
    img.onerror = () => {
        centralPlaceholder.classList.remove('hidden');
        centralImg.style.display = 'none';
    };
    img.src = ASSETS.centralScene;
}

function preloadFinalImage() {
    if (!finalImg || !finalPlaceholder) return;

    const img = new Image();
    img.onload = () => {
        finalImg.src = ASSETS.finalScene;
        finalImg.classList.add('loaded');
        finalPlaceholder.classList.add('hidden');
    };
    img.onerror = () => {
        finalPlaceholder.classList.remove('hidden');
        finalImg.style.display = 'none';
    };
    img.src = ASSETS.finalScene;
}

/* ============================================================
   YES / NO
   ============================================================ */
function onNoClick() {
    if (state.noClicked) return;
    state.noClicked = true;

    btnNo.classList.add('vanish');

    setTimeout(() => {
        playfulMessage.innerHTML = 'Nice try…<br>Someone is waiting for you.<br>Try again — say YES. 🌸';
        playfulMessage.classList.add('visible');
    }, 400);

    setTimeout(() => {
        btnNo.style.display = 'none';
    }, 800);
}

function onYesClick() {
    console.log('[Birthday Site] YES clicked — starting chimes');

    // Play the birthday chimes right now — user gesture guarantees playback
    if (landingMusic) {
        landingMusic.currentTime = 0;
        landingMusic.volume = 0.4;
        landingMusic.play()
            .then(() => {
                console.log('[Birthday Site] Chimes started');
                state.landingMusicOn = true;
                if (btnLandingMusic) btnLandingMusic.classList.remove('muted');
            })
            .catch((err) => {
                console.warn('[Birthday Site] Chimes failed to play:', err.message);
            });
    }

    // Fade the chimes out shortly after, as we move to the ribbon scene
    setTimeout(() => {
        fadeOutMusic(landingMusic, 1200);
    }, 2500);

    page1.style.transition = 'opacity 0.8s ease, visibility 0.8s';
    page1.style.opacity = '0';
    page1.style.visibility = 'hidden';

    setTimeout(() => {
        page1.style.display = 'none';
        ribbonScene.classList.add('active');
    }, 700);
}

/* ============================================================
   RIBBON CUT → WAIT → CURTAINS OPEN → PAGE 3 → BUBBLES
   ============================================================ */
function onRibbonCut() {
    if (state.ribbonCut) return;
    state.ribbonCut = true;

    console.log('[Birthday Site] Ribbon cut');

    ribbonTrack.classList.add('cut');

    setTimeout(() => {
        ribbonScene.classList.add('disappearing');
    }, 1200);

    setTimeout(() => {
        ribbonScene.classList.remove('active');
        ribbonScene.style.display = 'none';

        page2.classList.remove('open');
        stageWrapper.classList.add('active');

        if (stageScroll) stageScroll.scrollTop = 0;

        setTimeout(() => {
            page3.classList.add('revealed');
        }, 200);
    }, 2000);

    setTimeout(() => {
        console.log('[Birthday Site] Opening curtains');
        page2.classList.add('open');
    }, 2000 + 2500);

    setTimeout(() => {
        startKanhaMusic();
    }, 2000 + 2500);

    setTimeout(() => {
        if (!page3.dataset.started) {
            page3.dataset.started = 'true';
            console.log('[Birthday Site] Starting Page 3 bubbles');
            scheduleBubbles(page3);
        }
    }, 2000 + 2500 + 3200);
}

/* ============================================================
   PAGE 4 — FINAL FLUTE SCENE (image only)
   ============================================================ */
function onPage4Enter() {
    console.log('[Birthday Site] Page 4 entered');

    if (page4) page4.classList.add('revealed');

    fadeOutMusic(bgMusic, 1500);

    setTimeout(() => {
        startFinalMusic();
    }, 800);
}

/* ============================================================
   PAGE 5 — FINAL WORDS PAGE
   ============================================================ */
function onPage5Enter() {
    console.log('[Birthday Site] Page 5 entered');

    schedulePage5Lines(page5);
}

/* ============================================================
   MUSIC
   ============================================================ */
function setupMusic() {
    if (landingMusic) landingMusic.volume = 0.25;
    if (bgMusic)      bgMusic.volume      = 0.3;
    if (finalMusic)   finalMusic.volume   = 0.28;

    if (landingMusic) {
        const t1 = new Audio();
        t1.onerror = () => {
            if (btnLandingMusic) btnLandingMusic.style.display = 'none';
            console.warn('[Birthday Site] Landing music not found — control hidden.');
        };
        t1.src = ASSETS.landingMusic;
    }

    if (bgMusic) {
        const t2 = new Audio();
        t2.onerror = () => {
            if (musicControl) musicControl.style.display = 'none';
            console.warn('[Birthday Site] Krishna flute audio not found — music control hidden.');
        };
        t2.src = ASSETS.kanhaMusic;
    }

    if (btnMusicToggle) {
        btnMusicToggle.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(() => {});
                btnMusicToggle.classList.remove('muted');
            } else {
                bgMusic.pause();
                btnMusicToggle.classList.add('muted');
            }
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            bgMusic.volume = parseFloat(e.target.value);
        });
    }
}

function toggleLandingMusic() {
    if (!landingMusic) return;

    if (landingMusic.paused) {
        landingMusic.play().catch(() => {});
        btnLandingMusic.classList.remove('muted');
        state.landingMusicOn = true;
    } else {
        landingMusic.pause();
        btnLandingMusic.classList.add('muted');
        state.landingMusicOn = false;
    }
}

function stopLandingMusic() {
    if (landingMusic && !landingMusic.paused) {
        landingMusic.pause();
    }
}

function startKanhaMusic() {
    if (!bgMusic) return;

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            if (btnMusicToggle) btnMusicToggle.classList.remove('muted');
            state.kanhaMusicOn = true;
        }).catch(() => {
            if (btnMusicToggle) btnMusicToggle.classList.add('muted');
        });
    }
}

function startFinalMusic() {
    if (!finalMusic) return;

    finalMusic.play()
        .then(() => {
            state.finalMusicOn = true;
        })
        .catch(() => {
            // Missing or blocked — silently ignore
        });
}

function fadeOutMusic(audioEl, duration) {
    if (!audioEl) return;

    const startVol = audioEl.volume;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
        current++;
        const ratio = current / steps;
        audioEl.volume = Math.max(0, startVol * (1 - ratio));

        if (current >= steps) {
            clearInterval(timer);
            audioEl.pause();
            audioEl.volume = startVol;
        }
    }, stepTime);
}

/* ============================================================
   FIRST USER INTERACTION — landing music pre-warm
   ============================================================ */
function tryStartLandingMusicOnce() {
    if (state.landingMusicOn) return;
    if (!landingMusic) return;

    landingMusic.play()
        .then(() => {
            state.landingMusicOn = true;
            if (btnLandingMusic) btnLandingMusic.classList.remove('muted');
        })
        .catch(() => {
            // Autoplay blocked — will be triggered again on YES
        });
}

document.addEventListener('click', tryStartLandingMusicOnce, { once: true });
document.addEventListener('touchstart', tryStartLandingMusicOnce, { once: true });

/* ============================================================
   BOOT
   ============================================================ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}