// ===== SÉLECTION DES ÉLÉMENTS =====
const burger = document.getElementById('burger');
const nav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');
const header = document.querySelector('header');

// ===== NAVIGATION ENTRE LES PAGES =====
const PAGE_IDS = ['accueil', 'boutiques', 'partenaires', 'qui-sommes-nous', 'contact', 'mentions-legales'];
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

// Liens internes hors navigation principale (pied de page)
document.querySelectorAll('a[data-page-link]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
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
const SHOP_INFOS = {
    meximieux: {
        tel: '+33782332464',
        maps: 'https://www.google.com/maps/search/?api=1&query=Univers+Multim%C3%A9dia+45+Rue+de+Gen%C3%A8ve+01800+Meximieux'
    },
    amberieu: {
        tel: '+33652623298',
        maps: 'https://www.google.com/maps/search/?api=1&query=Univers+Multim%C3%A9dia+33+Avenue+Paul+Painlev%C3%A9+01500+Amb%C3%A9rieu-en-Bugey'
    }
};
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
    if (!SHOP_LABELS[shop]) return;
    document.body.dataset.shop = shop;
    shopSwitchLabel.textContent = SHOP_LABELS[shop];
    saveChoice(shop);
    partnersEmpty.hidden = shop !== 'amberieu';
    contactSwitchNote.hidden = false;
    shopChooser.querySelectorAll('.chooser-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.choose === shop);
    });
    // Les boutons Appeler et Itinéraire suivent la boutique choisie
    document.querySelectorAll('[data-shop-tel]').forEach(a => {
        a.href = 'tel:' + SHOP_INFOS[shop].tel;
    });
    document.querySelectorAll('[data-shop-maps]').forEach(a => {
        a.href = SHOP_INFOS[shop].maps;
    });
}

function openChooser() {
    lastFocused = document.activeElement;
    // Tant qu'aucune boutique n'est choisie, le choix est obligatoire :
    // pas de croix, et la fermeture par clic dehors ou Echap est neutralisee
    shopChooser.querySelector('.chooser-close').hidden = !document.body.dataset.shop;
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

// Fermer la pop-up sans rien changer (croix, clic hors de la fenêtre, Échap).
// Possible uniquement quand une boutique est déjà choisie : le premier choix est obligatoire.
function dismissChooser() {
    if (!document.body.dataset.shop) return;
    closeChooser();
}

// Choix d'une boutique (pop-up et boutons du site)
document.querySelectorAll('[data-choose]').forEach(btn => {
    btn.addEventListener('click', () => {
        applyShop(btn.dataset.choose);
        if (!shopChooser.hidden) closeChooser();
    });
});

// Fermeture sans changement
shopChooser.querySelectorAll('[data-chooser-dismiss]').forEach(el => {
    el.addEventListener('click', dismissChooser);
});

// Géolocalisation : sélectionne la boutique la plus proche du visiteur
const SHOP_COORDS = {
    meximieux: { lat: 45.9066, lng: 5.1946 },
    amberieu: { lat: 45.9539, lng: 5.3455 }
};
const geoBtn = document.getElementById('chooserGeo');
const geoStatus = document.getElementById('chooserGeoStatus');

geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        geoStatus.hidden = false;
        geoStatus.textContent = 'La géolocalisation n\'est pas disponible sur cet appareil.';
        return;
    }
    geoBtn.disabled = true;
    geoStatus.hidden = false;
    geoStatus.textContent = 'Recherche de la boutique la plus proche...';
    navigator.geolocation.getCurrentPosition((pos) => {
        const rad = Math.PI / 180;
        const distance = (c) => {
            const dLat = (c.lat - pos.coords.latitude) * rad;
            const dLng = (c.lng - pos.coords.longitude) * rad;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(pos.coords.latitude * rad) * Math.cos(c.lat * rad) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };
        const shop = distance(SHOP_COORDS.meximieux) <= distance(SHOP_COORDS.amberieu) ? 'meximieux' : 'amberieu';
        geoBtn.disabled = false;
        geoStatus.hidden = true;
        applyShop(shop);
        closeChooser();
    }, () => {
        geoBtn.disabled = false;
        geoStatus.textContent = 'Position indisponible, choisissez votre boutique ci-dessus.';
    }, { timeout: 8000, maximumAge: 600000 });
});

shopSwitch.addEventListener('click', openChooser);
document.getElementById('contactSwitchBtn').addEventListener('click', openChooser);

// Clavier dans la pop-up : Échap ferme sans rien changer, Tab reste dans la fenêtre
shopChooser.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        dismissChooser();
        return;
    }
    if (e.key === 'Tab') {
        const focusables = [...chooserCard.querySelectorAll('button')].filter(b => !b.hidden && !b.disabled);
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

// ===== APPARITION DOUCE DES SECTIONS AU DÉFILEMENT =====
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('revealed'));
}

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

    // Boutique déjà choisie pendant cette visite ? Sinon le choix est obligatoire.
    const saved = readChoice();
    if (SHOP_LABELS[saved]) {
        applyShop(saved);
    } else {
        openChooser();
    }
});
