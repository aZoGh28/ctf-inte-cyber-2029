# Plan des challenges - Inté Cybersécurité 2029

Plan pédagogique du CTF d'intégration (CentraleSupélec, promo 2029, spé cyber).
Public : débutants (L1). Objectif : découvrir la sécurité en s'amusant, sans jamais rester bloqué.

## Principes pédagogiques

1. **Une notion par épreuve** : chaque challenge enseigne UN concept clair.
2. **Difficulté croissante** : dans chaque branche, on monte marche par marche (20 -> 30 -> 40 -> 50 pts).
3. **Aucun cul-de-sac au départ** : la première épreuve de chaque branche est très accessible.
4. **Indices intégrés** : chaque épreuve a 1 ou 2 indices (éventuellement coûtant quelques points) pour débloquer sans frustrer.
5. **Vrais outils** : on fait manipuler les outils réels du métier (DevTools navigateur, CyberChef, exiftool...).
6. **Progression = déblocage** : une épreuve se débloque quand la précédente de sa branche est validée (prérequis CTFd).
7. **Fair-play** : on n'attaque que l'infra du CTF, jamais les autres joueurs ni la plateforme.

## Convention de flag

Tous les flags ont la forme : **`CS29{...}`**
Le contenu du flag ne doit pas donner la réponse (pas de `CS29{la_reponse_etait_base64}` sur une épreuve base64).

## Barème et déblocage

| Niveau dans la branche | Points | Difficulté |
|---|---|---|
| Départ (échauffement) | 10 | Triviale |
| Niveau 1 | 20 | Facile |
| Niveau 2 | 30 | Facile-moyen |
| Niveau 3 | 40 | Moyen |
| Niveau 4 | 50 | Moyen-corsé |
| Arrivée (finale) | 100 | Synthèse |

Déblocage : `Départ` ouvre les 3 branches ; dans une branche, chaque niveau ouvre le suivant ; l'`Arrivée` s'ouvre quand les 3 branches sont terminées.

---

## Départ

### Ton premier flag  (10 pts)
- **Objectif** : comprendre comment on soumet un flag.
- **Notion** : format d'un flag, champ de soumission.
- **Idée** : le flag est donné directement dans l'énoncé ; il suffit de le copier.
- **Flag** : `CS29{b1envenue_a_l_inte_cyber}`
- **Indice** : aucun (c'est l'échauffement).
- **Matériel** : aucun.

---

## Branche A - Web

Fil rouge : *observer* le navigateur, puis *manipuler* ce qu'on croit figé.

### A1 - Inspecte la page  (20 pts)
- **Objectif** : ouvrir les outils de développement, lire le code source.
- **Notion** : code source HTML, commentaires, DevTools (F12).
- **Idée** : un flag caché dans un commentaire HTML ou un élément masqué (`display:none`).
- **Flag ex.** : `CS29{f0uille_le_code_source}`
- **Indices** : 1) « Clic droit -> Afficher le code source. » 2) « Regarde les commentaires `<!-- -->`. »
- **Matériel** : une page HTML statique (peut être une Page CTFd ou un fichier à héberger).

### A2 - Les cookies  (30 pts)
- **Objectif** : comprendre qu'on peut modifier ce que le navigateur envoie.
- **Notion** : cookies, état côté client.
- **Idée** : la page affiche « accès refusé » ; si le cookie `role=admin` est présent, elle affiche le flag.
- **Flag ex.** : `CS29{c00kie_modifie}`
- **Indices** : 1) « Onglet Application/Stockage -> Cookies. » 2) « Et si `role` valait autre chose ? »
- **Matériel** : petite page dynamique (nécessite un hébergement web léger).

### A3 - Paramètres cachés  (40 pts)
- **Objectif** : manipuler l'URL / un champ caché.
- **Notion** : paramètres GET, champs `hidden`.
- **Idée** : `?price=10` -> le passer à `?price=0`, ou un champ `hidden` `admin=false` à passer à `true`.
- **Flag ex.** : `CS29{param_c_est_pas_secure}`
- **Indices** : 1) « Que se passe-t-il si tu changes la valeur dans l'URL ? »
- **Matériel** : page dynamique.

### A4 - Injection SQL basique  (50 pts)
- **Objectif** : découvrir l'injection SQL sur un formulaire de login volontairement vulnérable.
- **Notion** : injection SQL, `' OR '1'='1`.
- **Idée** : bypass d'authentification pour atteindre une page admin qui affiche le flag.
- **Flag ex.** : `CS29{inj3ction_sql_101}`
- **Indices** : 1) « Le champ de login n'est pas filtré... » 2) « Cherche `SQL injection login bypass`. »
- **Matériel** : mini-appli vulnérable (à héberger, cf. section Infra).

---

## Branche B - Cryptographie & Encodage

Fil rouge : distinguer *encoder* (réversible) de *chiffrer* (avec clé), et casser du faible.

### B1 - Encodages  (20 pts)
- **Objectif** : reconnaître et décoder Base64 / hexadécimal.
- **Notion** : encodage n'est pas chiffrement.
- **Idée** : une chaîne en Base64 (voire double-encodée) à décoder.
- **Flag ex.** : `CS29{decode_moi_ca}`
- **Indices** : 1) « CyberChef -> From Base64. » 2) « Si ça ressemble encore à du charabia, redécode. »
- **Matériel** : juste l'énoncé.

### B2 - Chiffre de César  (30 pts)
- **Objectif** : comprendre la substitution par décalage.
- **Notion** : César / ROT13, force brute des 25 décalages.
- **Idée** : message décalé à retrouver.
- **Flag ex.** : `CS29{cesar_na_pas_resiste}`
- **Indices** : 1) « Décalage de lettres. » 2) « CyberChef -> ROT13 Brute Force. »
- **Matériel** : énoncé.

### B3 - XOR simple  (40 pts)
- **Objectif** : découvrir le XOR avec une clé courte.
- **Notion** : opération XOR, clé répétée.
- **Idée** : flag XORé avec une clé d'un caractère (ou un mot court fourni en indice).
- **Flag ex.** : `CS29{x0r_est_partout}`
- **Indices** : 1) « La clé fait 1 caractère : teste les 256. » 2) « CyberChef -> XOR Brute Force. »
- **Matériel** : fichier ou chaîne hex.

### B4 - Hash inversé  (50 pts)
- **Objectif** : comprendre qu'un hash faible/commun se retrouve.
- **Notion** : fonction de hachage, dictionnaires en ligne.
- **Idée** : un MD5 d'un mot courant ; le retrouver via une base de lookup, le mot -> le flag.
- **Flag ex.** : `CS29{un_hash_nest_pas_un_coffre}`
- **Indices** : 1) « MD5 d'un mot du dictionnaire. » 2) « crackstation.net. »
- **Matériel** : énoncé (le hash).

---

## Branche C - OSINT & Forensic

Fil rouge : l'information est souvent déjà là, il faut savoir regarder.

### C1 - Métadonnées  (20 pts)
- **Objectif** : lire les métadonnées d'un fichier.
- **Notion** : EXIF, `exiftool`.
- **Idée** : une image dont le champ Auteur/Commentaire EXIF contient le flag.
- **Flag ex.** : `CS29{exif_en_dit_long}`
- **Indices** : 1) « Les images gardent des infos cachées. » 2) « `exiftool image.jpg`. »
- **Matériel** : une image avec EXIF (à fournir en téléchargement).

### C2 - Stéganographie  (30 pts)
- **Objectif** : extraire des données cachées dans une image.
- **Notion** : `strings`, stéganographie simple.
- **Idée** : flag caché en clair dans les octets (`strings`) ou via un outil léger.
- **Flag ex.** : `CS29{cache_dans_l_image}`
- **Indices** : 1) « Une image n'est pas que des pixels. » 2) « `strings image.png | grep CS29`. »
- **Matériel** : image piégée.

### C3 - OSINT  (40 pts)
- **Objectif** : recouper de l'information publique.
- **Notion** : recherche ciblée, image inversée, géolocalisation.
- **Idée** : à partir d'une photo/pseudo, retrouver un lieu ou une info publique donnant le flag.
- **Flag ex.** : `CS29{trouve_sur_le_web}`
- **Indices** : 1) « Recherche d'image inversée. » 2) « Google dorking. »
- **Matériel** : photo + éventuel faux profil.

### C4 - Analyse de fichier  (50 pts)
- **Objectif** : identifier et fouiller un fichier inconnu.
- **Notion** : magic bytes, archive, capture réseau (pcap).
- **Idée** : un fichier sans extension à identifier (`file`), ou un `.pcap` où le flag transite en clair.
- **Flag ex.** : `CS29{le_fichier_parlait}`
- **Indices** : 1) « `file fichier_inconnu`. » 2) « Wireshark -> Follow Stream. »
- **Matériel** : fichier / capture à fournir.

---

## Arrivée

### Le trésor  (100 pts)
- **Objectif** : synthèse : réutiliser plusieurs réflexes acquis.
- **Idée** : une petite épreuve qui enchaîne 2-3 étapes (ex. décoder -> inspecter -> assembler).
- **Flag ex.** : `CS29{tresor_de_l_inte_2029}`
- **Déblocage** : nécessite d'avoir fini les 3 branches.
- **Indices** : renvoyer aux réflexes vus dans chaque branche.

---

## Note infra (important)

- **Sans hébergement** (faciles à déployer sur CTFd, juste un énoncé + éventuel fichier joint) : toute la branche **Crypto**, toute la branche **OSINT/Forensic**, et **A1** (page statique).
- **Avec hébergement** (nécessitent une mini-appli web qui tourne) : **A2, A3, A4**. Pour une inté, on peut soit héberger une petite appli volontairement vulnérable, soit remplacer ces épreuves par des variantes « fichier/énoncé » si on veut rester 100% statique.

## Mapping vers la carte

- **Départ** = « Ton premier flag »
- **Branche A (Web)** : A1 -> A2 -> A3 -> A4
- **Branche B (Crypto)** : B1 -> B2 -> B3 -> B4
- **Branche C (OSINT/Forensic)** : C1 -> C2 -> C3 -> C4
- **Arrivée** = « Le trésor »

Les noms et l'ordre se règlent dans **Admin -> Challenges** (éditeur de carte) : relier chaque nœud à son challenge, choisir l'icône, et sauvegarder.
