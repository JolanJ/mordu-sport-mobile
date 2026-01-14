# Documentation du déploiement EC2 - Étape 2 : Connexion et debug SSH

## 1. Instance EC2

- Nom : Serveur PredictionXpert
- Type : t2.micro Ubuntu
- Elastic IP : 3.233.18.235
- Security Group : launch-wizard-1
- Clé privée : serveurpredictionxpert.pem

---

## 2. Première tentative de connexion SSH

### Commande utilisée

```powershell
ssh -i "C:\Users\key\serveurpredictionxpert.pem" ubuntu@3.233.18.235
```

### Message rencontré

```
ssh: connect to host 3.233.18.235 port 22: Connection timed out
```

### Analyse

La connexion a échoué car le Security Group ne permettait que l'accès SSH depuis l'IP 142.117.104.57.

Mon IP publique avait changé, donc AWS a bloqué la connexion.

---

## 3. Mise à jour de la règle Security Group

Nouvelle IP publique : 204.144.63.175 

Règle SSH modifiée : 22 TCP 204.144.63.175/32

---

## 4. Nouvelle tentative de connexion

### Message rencontré

```
The authenticity of host '3.233.18.235 (3.233.18.235)' can't be established.
ED25519 key fingerprint is SHA256:T8yl24Sg7lc3vLeH30FDkXirz1jzpb6om4s9VMGEuUM.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

### Action

Taper yes pour continuer.

SSH ajoute automatiquement l'IP du serveur à la liste known_hosts.

---

## 5. Problème de permissions sur la clé

### Message rencontré

```
Bad permissions. Try removing permissions for user: BUILTIN\Utilisateurs ...
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
La clé était trop public donc j'ai du ouvrir powershell sur mon ordi en mode ADMIN et effectuer les commandes en bas
```

### Solution (PowerShell en mode administrateur)

```powershell
icacls "C:\Users\key\serveurpredictionxpert.pem" /inheritance:r
icacls "C:\Users\key\serveurpredictionxpert.pem" /grant:r "%username%:R"
```

---

## 6. Connexion réussie

Après avoir corrigé les permissions, la connexion SSH fonctionne et le terminal affiche :

```
* Documentation:  https://help.ubuntu.com
* Management:     https://landscape.canonical.com
* Support:        https://ubuntu.com/pro
...
```

L'utilisateur est connecté à l'EC2.

## 7 chercher les maj et s'assurer que le système est prêt pour l'installation de node

## Je cherche les maj avec la commande: sudo apt update et il y a en 81 donc je les installes avec la commandes : sudo apt upgrade -y

Vérification du système
Commande utilisée
lsb_release -a

Objectif

Vérifier la version Ubuntu installée.

Confirmer que le système est prêt pour installer Node.js.

Si nécessaire, redémarrer avec :

sudo reboot


##8 installer node et npm

### Commandes utilisées
 ** je lai pas installé
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
LTS = Long Term Support
C’est une version de Node.js qui est stabilisée et maintenue pendant plusieurs années.
Elle reçoit des mises à jour de sécurité et de stabilité, mais pas de changements majeurs qui pourraient casser ton code.
Pourquoi c’est recommandé
Comme tu prévois d’héberger un proxy pour Goalserve en production, tu veux éviter que des mises à jour de Node.js cassent ton serveur.
Pour une application mobile ou un backend qui tourne 24/7, LTS est plus sûr que la version Current (qui est plus récente mais peut être instable).
Est-ce que c’est nécessaire ?
Pas strictement, tu peux installer la version Current de Node.js, mais ce n’est pas conseillé pour un serveur de production.
LTS est un standard pour la majorité des projets backend et serveurs en production.


sudo apt install -y nodejs
sudo apt install -y npm


###creer le dossier sur le ec2: 
mkdir ~/goalserve-proxy
cd ~/goalserve-proxy

ensuite de ca installer express: 
npm install express axios dotenv
Ça va installer :

Express → ton serveur HTTP

Axios → pour appeler Goalserve

Dotenv → pour lire ton API Key de Goalserve proprement

---

## 9. Création du fichier .env

### Commande utilisée
```bash
nano .env
```

### Contenu du fichier .env
```
GOALSERVE_TOKEN=174a9bd35aac4c6ba67a08de21cd460f
```

**Important :** La variable d'environnement doit s'appeler `GOALSERVE_TOKEN` (pas `GOALSERVE_KEY`) car c'est ce que `server.js` utilise.

Sauvegarde : `Ctrl+X`, puis `Y`, puis `Enter`

Vérification :
```bash
cat .env
# Devrait afficher : GOALSERVE_TOKEN=174a9bd35aac4c6ba67a08de21cd460f
```

---

## 10. Création du fichier server.js

### Commande utilisée
```bash
nano server.js
```

### Contenu du fichier server.js

Fichier complet du serveur proxy Express :

```javascript
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Créer l'application Express
const app = express();
const PORT = 3000;
const GOALSERVE_TOKEN = process.env.GOALSERVE_TOKEN;

// Middleware pour parser JSON
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    proxy: 'Goalserve'
  });
});

// Route proxy pour Goalserve avec regex
app.get(/^\/goalserve\/(.+)$/, async (req, res) => {
  try {
    const relativePath = req.params[0];
    const url = `https://www.goalserve.com/getfeed/${GOALSERVE_TOKEN}/${relativePath}`;
    
    console.log(`[PROXY] ${req.method} ${req.url}`);
    console.log(`[PROXY] → ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/xml, application/json',
        'User-Agent': 'MorduSport-Mobile/1.0'
      },
      timeout: 10000
    });
    
    res.set('Content-Type', response.headers['content-type'] || 'application/xml');
    res.send(response.data);
    
    console.log(`[PROXY] ✓ Réponse envoyée (${response.status})`);
    
  } catch (error) {
    console.error('[PROXY] ✗ Erreur:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Erreur Goalserve',
        status: error.response.status,
        message: error.response.statusText
      });
    } else if (error.request) {
      res.status(504).json({ 
        error: 'Timeout ou Goalserve inaccessible',
        message: 'Le serveur Goalserve ne répond pas'
      });
    } else {
      res.status(500).json({ 
        error: 'Erreur serveur',
        message: error.message 
      });
    }
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 Proxy Goalserve démarré');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Accessible sur: http://3.233.18.235:${PORT}`);
  console.log(`🔑 API Key: ${GOALSERVE_TOKEN ? '✓ Configurée' : '✗ Manquante'}`);
  console.log('═══════════════════════════════════════');
});
```

**Points importants :**
- Utilise `require()` et non `import` (CommonJS, pas ES6 modules)
- Route avec regex : `/^\/goalserve\/(.+)$/` pour capturer tout après `/goalserve/`
- Supporte tous les sports : `football/`, `hockey/`, `basketball/`, etc.
- Supporte les query params : `?date=18.05.2018`

---

## 11. Résolution des erreurs rencontrées

### Erreur 1 : "cannot use import statement outside a module"
**Cause :** Utilisation de `import` au lieu de `require`  
**Solution :** Remplacer `import` par `require()` (CommonJS)

### Erreur 2 : "missing parameter name at index"
**Cause :** Syntaxe de route invalide (`/goalserve/*` ou `/goalserve/:path(*)`)  
**Solution :** Utiliser une regex : `/^\/goalserve\/(.+)$/`

### Erreur 3 : "app is not defined"
**Cause :** Code incomplet, déclaration de `app` manquante  
**Solution :** S'assurer d'avoir `const app = express();` au début du fichier

---

## 12. Démarrage du serveur

### Commande utilisée
```bash
node server.js
```

### Résultat attendu
```
═══════════════════════════════════════
🚀 Proxy Goalserve démarré
📡 Port: 3000
🌐 Accessible sur: http://3.233.18.235:3000
🔑 API Key: ✓ Configurée
═══════════════════════════════════════
```

---

## 13. Tests du serveur proxy

### Test 1 : Route de santé (depuis PC Windows - PowerShell)
```powershell
curl http://3.233.18.235:3000/health
```

**Résultat attendu :**
```json
{"status":"OK","timestamp":"2025-01-20T...","proxy":"Goalserve"}
```

### Test 2 : Endpoint Goalserve - NFL Scores
```powershell
curl http://3.233.18.235:3000/goalserve/football/nfl-scores
```

**Résultat :** ✅ **SUCCÈS** - Données XML de Goalserve reçues dans le terminal

### Test 3 : Endpoint avec query params
```powershell
curl http://3.233.18.235:3000/goalserve/football/nfl-scores?date=18.05.2018
```

**Résultat :** ✅ Fonctionne (query params préservés)

---

## ✅ ÉTAT ACTUEL

**Statut :** 🟢 **SERVEUR PROXY OPÉRATIONNEL**

- ✅ Serveur Express démarré sur EC2
- ✅ Proxy fonctionnel et accessible depuis Internet
- ✅ Communication avec Goalserve établie
- ✅ Données renvoyées correctement
- ✅ Support de tous les sports (football, hockey, basketball)
- ✅ Support des query params

**URL du proxy :** `http://3.233.18.235:3000`

**Routes disponibles :**
- `GET /health` - Vérification de santé
- `GET /goalserve/*` - Proxy vers Goalserve (tous les endpoints)

**Exemples d'endpoints :**
- `http://3.233.18.235:3000/goalserve/football/nfl-scores`
- `http://3.233.18.235:3000/goalserve/hockey/nhl-scores`
- `http://3.233.18.235:3000/goalserve/basketball/nba-scores`

---

## 📋 PROCHAINES ÉTAPES

1. **Configurer le serveur pour qu'il tourne en arrière-plan** (PM2 ou screen)
2. **Intégrer le proxy dans l'app mobile** (remplacer les appels directs à Goalserve)
3. **Ajouter le Security Group pour le port 3000** (si pas déjà fait)
4. **Tester depuis l'app mobile** (React Native/Expo)

---

## 🔒 Sécurité

**Important :** Assure-toi que le Security Group AWS permet les connexions sur le port 3000 :
- Type : Custom TCP
- Port : 3000
- Source : 0.0.0.0/0 (ou ton IP publique si tu veux limiter)