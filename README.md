# universmultimedia.fr

Site vitrine d'Univers Multimédia, réparation et accessoires multimédia à Meximieux et Ambérieu-en-Bugey (Ain).

## Stack

Site statique en HTML, CSS et JavaScript purs, sans build ni dépendance. Hébergé sur Cloudflare Pages : tout push sur `main` déploie automatiquement la production.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Tout le site : 5 onglets affichés un à la fois (accueil, boutiques, qui sommes-nous, contact, mentions légales), pop-up de choix de boutique, barre d'actions mobile, données structurées LocalBusiness |
| `styles.css` | Styles complets, organisés par sections commentées |
| `script.js` | Navigation par onglets et hash, choix de boutique, pop-up, épingles carte, apparitions au défilement |
| `404.html` | Page introuvable (servie automatiquement par Cloudflare Pages) |
| `FONTS/` | Polices auto-hébergées : Space Grotesk (titres) et Inter (texte), fichiers variables woff2 |
| `IMAGES/` | Images optimisées WebP ; les originaux lourds sont conservés mais plus référencés |
| `CONTEXT.md` | Glossaire du projet (vocabulaire et invariants) |

## Le modèle « boutique choisie »

Le visiteur choisit obligatoirement sa boutique au début de chaque visite (pop-up, mémorisée en sessionStorage sous la clé `um-boutique`). Tout le site affiche alors uniquement les informations de cette boutique. Il n'existe pas de vue mélangeant les deux boutiques.

Les blocs propres à une boutique portent `data-shop-block="meximieux|amberieu"` et sont masqués par CSS selon `body[data-shop]`. Les liens téléphone et itinéraire dynamiques portent `data-shop-tel` et `data-shop-maps`, mis à jour par `applyShop()` dans `script.js`.

## Modifier les contenus courants

- **Horaires** : dans `index.html`, les deux blocs de la section contact, et les `openingHoursSpecification` du JSON-LD dans le `<head>`. Seul le samedi diffère entre les boutiques (Meximieux ferme à midi).
- **Avis Google** : section « Ils nous font confiance » de l'accueil, un bloc par boutique. Ce sont de vrais avis publiés sur les fiches Google, à tenir à jour de temps en temps (notes et nombres d'avis aussi : héro, pop-up, fiches de la carte).
- **Images** : convertir en WebP redimensionné avant d'ajouter (les photos brutes de téléphone pèsent plusieurs Mo).

## Développement local

Un serveur statique quelconque suffit, par exemple :

```
npx serve .
```
