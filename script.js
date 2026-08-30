// ===== SÉLECTION DES ÉLÉMENTS =====
const burger = document.getElementById('burger');
const nav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');
const header = document.querySelector('header');

// ===== NAVIGATION ENTRE LES PAGES =====
const PAGE_IDS = ['accueil', 'boutiques', 'partenaires', 'qui-sommes-nous', 'contact'];
let pageTransition = null;

function showPage(target, updateHash = true) {
    if (!PAGE_IDS.includes(target)) return;
    const targetPage = document.getElementById(`page-${target}`);
    const currentPage = document.querySelector('.page-content.active');
    if (!targetPage || targetPage === currentPage) return;

    // Mise à jour des états actifs de la navigation
    navLinks.forEach(l => {
        const isTarget = l.getAttribute('href') === `#${target}`;
        l.classList.toggle('active', isTarget);
        if (isTarget) {
            l.setAttribute('aria-current', 'page');
        } else {
            l.removeAttribute('aria-current');
        }
    });

    // Transition fluide entre les pages
    clearTimeout(pageTransition);
    if (currentPage) {
        currentPage.style.opacity = '0';
    }
    pageTransition = setTimeout(() => {
        pages.forEach(page => page.classList.remove('active'));
        targetPage.classList.add('active');
        targetPage.style.opacity = '0';
        requestAnimationFrame(() => {
            targetPage.style.opacity = '1';
        });
    }, 200);

    // L'URL reflète l'onglet ouvert (liens partageables, sitemap)
    if (updateHash) {
        history.replaceState(null, '', `#${target}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Fermer le menu mobile
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');

        showPage(link.getAttribute('href').substring(1));
    });
});

// Ouvrir le bon onglet si l'URL contient un hash (lien direct, sitemap)
window.addEventListener('hashchange', () => {
    showPage(location.hash.substring(1), false);
});

// ===== TOGGLE MENU BURGER =====
burger.addEventListener('click', () => {
    const isActive = burger.classList.toggle('active');
    nav.classList.toggle('active');
    burger.setAttribute('aria-expanded', isActive);
});

// ===== FERMER LE MENU EN CLIQUANT DEHORS =====
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('active')) {
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    }
});

// ===== ANIMATION DU HEADER AU SCROLL =====
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        header.style.boxShadow = '0 6px 30px rgba(0,0,0,0.4)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    }
}, { passive: true });

// ===== CHOIX DE LA BOUTIQUE =====
const SHOP_LABELS = { meximieux: 'Meximieux', amberieu: 'Ambérieu-en-Bugey' };
const STORAGE_KEY = 'um-boutique';
const shopChooser = document.getElementById('shopChooser');
const chooserCard = shopChooser.querySelector('.chooser-card');
const shopSwitch = document.getElementById('shopSwitch');
const shopSwitchLabel = document.getElementById('shopSwitchLabel');
const partnersEmpty = document.getElementById('partnersEmpty');
const contactSwitchNote = document.getElementById('contactSwitchNote');
let lastFocused = null;

// sessionStorage peut être indisponible (navigation privée stricte) : ne jamais planter
function readChoice() {
    try { return sessionStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
}
function saveChoice(value) {
    try { sessionStorage.setItem(STORAGE_KEY, value); } catch (e) { /* choix non mémorisé */ }
}

function applyShop(shop) {
    if (shop) {
        document.body.dataset.shop = shop;
        shopSwitchLabel.textContent = SHOP_LABELS[shop];
        saveChoice(shop);
    } else {
        delete document.body.dataset.shop;
        shopSwitchLabel.textContent = 'Choisir ma boutique';
        saveChoice('toutes');
    }
    partnersEmpty.hidden = shop !== 'amberieu';
    contactSwitchNote.hidden = !shop;
    shopChooser.querySelectorAll('.chooser-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.choose === shop);
    });
}

function openChooser() {
    lastFocused = document.activeElement;
    shopChooser.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => {
        shopChooser.classList.add('visible');
        const current = shopChooser.querySelector('.chooser-option.selected') ||
            shopChooser.querySelector('.chooser-option');
        current.focus();
    });
}

function closeChooser() {
    shopChooser.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { shopChooser.hidden = true; }, 250);
    if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus();
    }
}

// Choix d'une boutique (pop-up et boutons du site)
document.querySelectorAll('[data-choose]').forEach(btn => {
    btn.addEventListener('click', () => {
        applyShop(btn.dataset.choose);
        if (!shopChooser.hidden) closeChooser();
    });
});

// Continuer sans choisir : le site affiche les deux boutiques
shopChooser.querySelectorAll('[data-chooser-skip]').forEach(el => {
    el.addEventListener('click', () => {
        applyShop(null);
        closeChooser();
    });
});

shopSwitch.addEventListener('click', openChooser);
document.getElementById('contactSwitchBtn').addEventListener('click', openChooser);

// Clavier dans la pop-up : Échap pour continuer sans choisir, Tab reste dans la fenêtre
shopChooser.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        applyShop(null);
        closeChooser();
        return;
    }
    if (e.key === 'Tab') {
        const focusables = chooserCard.querySelectorAll('button');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// ===== GESTION DES ÉPINGLES MAP (TAP + CLAVIER) =====
const mapPins = document.querySelectorAll('.map-pin');

const setPinState = (pin, isActive) => {
    pin.classList.toggle('active', isActive);
    pin.setAttribute('aria-expanded', isActive);
};

const closeOtherPins = (except) => {
    mapPins.forEach(p => {
        if (p !== except) {
            setPinState(p, false);
        }
    });
};

mapPins.forEach(pin => {
    // Tap ou clic : ouvrir/fermer la fiche boutique
    pin.addEventListener('click', (e) => {
        // Laisser les liens de la fiche (adresse) fonctionner normalement
        if (e.target.closest('a')) return;
        e.stopPropagation();
        closeOtherPins(pin);
        setPinState(pin, !pin.classList.contains('active'));
    });

    // Accessibilité clavier : Entrée/Espace pour ouvrir, Échap pour fermer
    pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeOtherPins(pin);
            setPinState(pin, !pin.classList.contains('active'));
        } else if (e.key === 'Escape') {
            setPinState(pin, false);
            pin.blur();
        }
    });
});

// Fermer les fiches en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (!e.target.closest('.map-pin')) {
        closeOtherPins(null);
    }
});

// ===== DÉTECTION DU CHANGEMENT D'ORIENTATION =====
window.addEventListener('orientationchange', () => {
    if (nav.classList.contains('active')) {
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    }
});

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Transitions des pages
    pages.forEach(page => {
        page.style.transition = 'opacity 0.3s ease';
    });
    const firstPage = document.querySelector('.page-content.active');
    if (firstPage) {
        firstPage.style.opacity = '1';
    }

    // Onglet demandé dans l'URL (lien direct ou sitemap)
    const hash = location.hash.substring(1);
    if (hash && hash !== 'accueil') {
        showPage(hash, false);
    }

    // Boutique déjà choisie pendant cette visite ?
    const saved = readChoice();
    if (saved === 'toutes') {
        applyShop(null);
    } else if (SHOP_LABELS[saved]) {
        applyShop(saved);
    } else {
        openChooser();
    }
});
