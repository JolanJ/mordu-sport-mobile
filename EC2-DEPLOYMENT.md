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


À CETTE ÉTAPE ON EST PRÊT À INSTALLER EXPRESS