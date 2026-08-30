// ===== SÉLECTION DES ÉLÉMENTS =====
const burger = document.getElementById('burger');
const nav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');
const header = document.querySelector('header');

// ===== TOGGLE MENU BURGER =====
burger.addEventListener('click', () => {
    const isActive = burger.classList.toggle('active');
    nav.classList.toggle('active');
    burger.setAttribute('aria-expanded', isActive);
});

// ===== NAVIGATION ENTRE LES PAGES =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Fermer le menu mobile
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');

        // Obtenir l'ID de la page cible
        const target = link.getAttribute('href').substring(1);
        const targetPage = document.getElementById(`page-${target}`);
        
        if (!targetPage) return;

        // Mise à jour des états actifs
        navLinks.forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Transition fluide entre les pages
        pages.forEach(page => {
            if (page.classList.contains('active')) {
                page.style.opacity = '0';
                setTimeout(() => {
                    page.classList.remove('active');
                }, 200);
            }
        });

        setTimeout(() => {
            targetPage.classList.add('active');
            targetPage.style.opacity = '0';
            setTimeout(() => {
                targetPage.style.opacity = '1';
            }, 50);
        }, 200);

        // Scroll vers le haut avec animation fluide
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    });
});

// ===== ANIMATION DU HEADER AU SCROLL =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Modifier l'ombre selon le scroll
    if (currentScroll > 50) {
        header.style.boxShadow = '0 6px 30px rgba(0,0,0,0.4)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    }

    lastScroll = currentScroll;
}, { passive: true });

// ===== FERMER LE MENU EN CLIQUANT DEHORS =====
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('active')) {
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
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
    // Fermer le menu si ouvert lors du changement d'orientation
    if (nav.classList.contains('active')) {
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    }
});

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que la première page est visible
    const firstPage = document.getElementById('page-accueil');
    if (firstPage) {
        firstPage.style.opacity = '1';
    }

    // Améliorer les transitions des pages
    pages.forEach(page => {
        page.style.transition = 'opacity 0.3s ease';
    });
});
