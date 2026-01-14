# 📊 Analyse de l'endpoint ROSTERS - Goalserve

## 🔍 Endpoint analysé

```
http://www.goalserve.com/getfeed/{TOKEN}/hockey/{TEAM_ID}_rosters
```

**Exemple:**
```
http://www.goalserve.com/getfeed/174a9bd35aac4c6ba67a08de21cd460f/hockey/2786_rosters
```

## ✅ Résultats de l'analyse

### 1. **Structure XML**

```xml
<?xml version="1.0" encoding="utf-8"?>
<team name="Winnipeg Jets" abbreviation="WPG" season="2025/2026" id="2786">
  <position name="Centers">
    <player number="36" name="Morgan Barron" age="27" height="6' 4&quot;" 
            weight="220 lbs" shot="R" birth_place="Halifax, CAN" 
            salarycap="$1,850,000" id="4316970" />
    <!-- Plus de joueurs... -->
  </position>
  <position name="Left Wings">...</position>
  <position name="Right Wings">...</position>
  <position name="Defense">...</position>
  <position name="Goalies">...</position>
  <image>iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU... (base64)</image>
</team>
```

### 2. **Images disponibles**

#### ✅ **Logo d'équipe (PRÉSENT)**
- **Emplacement:** Balise `<image>` au niveau de `<team>`
- **Format:** Base64 encodé (PNG)
- **Taille moyenne:** ~17,000 caractères
- **Type:** Logo de l'équipe
- **Début:** `iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU...`

#### ❌ **Images de joueurs (ABSENTES)**
- Les joueurs n'ont **pas** d'attribut `image` ou balise `<image>`
- Seules les informations textuelles sont disponibles (nom, numéro, âge, taille, poids, etc.)

### 3. **Données disponibles par joueur**

Chaque joueur contient:
- `@_number`: Numéro du joueur
- `@_name`: Nom complet
- `@_age`: Âge
- `@_height`: Taille
- `@_weight`: Poids
- `@_shot`: Main de tir (L/R)
- `@_birth_place`: Lieu de naissance
- `@_salarycap`: Salaire
- `@_id`: ID unique du joueur

### 4. **Positions disponibles**

1. **Centers** (Centres)
2. **Left Wings** (Ailiers gauches)
3. **Right Wings** (Ailiers droits)
4. **Defense** (Défenseurs)
5. **Goalies** (Gardiens)

## 💡 Utilisation dans l'application

### Extraction du logo d'équipe

```typescript
// lib/services/api.ts

/**
 * Récupère le roster d'une équipe avec son logo
 */
export async function fetchTeamRoster(teamId: string): Promise<TeamRosterData> {
  const url = `${API_BASE_URL}/${GOALSERVE_TOKEN}/hockey/${teamId}_rosters`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/xml',
    },
  })
  
  const xml = await response.text()
  return parseTeamRosterXML(xml)
}

function parseTeamRosterXML(xml: string): TeamRosterData {
  const parsed = xmlParser.parse(xml)
  const team = parsed.team
  
  // Extraire le logo (base64)
  const logoBase64 = team.image || ''
  const logoUrl = logoBase64 
    ? `data:image/png;base64,${logoBase64}` 
    : undefined
  
  // Extraire les joueurs par position
  const positions = Array.isArray(team.position) ? team.position : [team.position]
  
  const roster: TeamRoster = {
    forwards: [],
    defensemen: [],
    goalies: [],
  }
  
  for (const position of positions) {
    const players = Array.isArray(position.player) 
      ? position.player 
      : [position.player]
    
    for (const playerData of players) {
      const player: Player = {
        id: String(playerData['@_id']),
        name: String(playerData['@_name']),
        number: String(playerData['@_number']),
        position: String(position['@_name']),
        age: parseInt(String(playerData['@_age']), 10),
        height: String(playerData['@_height']),
        weight: String(playerData['@_weight']),
        shot: String(playerData['@_shot']),
        birthplace: String(playerData['@_birth_place']),
        salarycap: String(playerData['@_salarycap']),
      }
      
      // Classer par position
      if (position['@_name'].includes('Center') || 
          position['@_name'].includes('Wing')) {
        roster.forwards.push(player)
      } else if (position['@_name'].includes('Defense')) {
        roster.defensemen.push(player)
      } else if (position['@_name'].includes('Goalie')) {
        roster.goalies.push(player)
      }
    }
  }
  
  return {
    teamInfo: {
      id: String(team['@_id']),
      name: String(team['@_name']),
      abbr: String(team['@_abbreviation']),
      logo: logoUrl, // ✅ Logo disponible ici
    },
    roster,
  }
}
```

### Utilisation dans les composants

```typescript
// components/TeamBanner.tsx
<Image 
  source={{ uri: teamInfo.logo }} 
  style={styles.logo}
  // Le logo est en base64, donc on peut l'utiliser directement
/>
```

## 📝 Notes importantes

1. **Format Base64:** L'image est encodée en base64 directement dans le XML. On peut l'utiliser avec un `data:image/png;base64,{base64}` URI.

2. **Pas d'images de joueurs:** Si vous avez besoin de photos de joueurs, il faudra utiliser un autre service ou endpoint.

3. **ID d'équipe:** L'ID d'équipe (ex: `2786` pour Winnipeg Jets) doit être connu à l'avance. Il faudra peut-être créer un mapping équipe → ID.

4. **Performance:** Les images base64 peuvent être lourdes. Considérez:
   - Mettre en cache les logos
   - Convertir en fichiers locaux si nécessaire
   - Utiliser un CDN si possible

## 🧪 Tests effectués

### Équipe testée: Winnipeg Jets (ID: 2786)
- ✅ **Logo présent:** Oui
- ✅ **Format:** Base64 PNG
- ✅ **Taille:** ~17,000 caractères
- ✅ **Structure XML:** Valide

### Autres équipes testées
- ❌ **ID 2787:** Erreur serveur (Root element is missing)
- ❌ **ID 2788:** Erreur serveur (Root element is missing)

**Note:** Il faut trouver les bons IDs d'équipes. L'ID `2786` fonctionne pour Winnipeg Jets.

## 📍 Où les logos sont utilisés dans l'app

1. **`MatchCard.tsx`** (lignes 71-75, 102-106)
   - Affiche les logos des équipes `awayTeam` et `homeTeam`
   - Supporte déjà les URLs string et les images require()

2. **`TeamCard.tsx`** (lignes 43-53)
   - Affiche le logo de l'équipe dans la liste des équipes
   - Fallback sur l'abréviation si pas de logo

3. **`TeamBanner.tsx`** (ligne 31)
   - Actuellement affiche seulement l'abréviation
   - **À améliorer:** Ajouter le support du logo

## 🔄 Prochaines étapes

1. ✅ **Créer la fonction `fetchTeamRoster`** dans `lib/services/api.ts`
2. ✅ **Ajouter le parser XML** pour extraire le logo et les joueurs
3. ✅ **Mettre à jour les types** pour inclure le logo dans `TeamInfo`
4. ⚠️ **Trouver le mapping équipe → ID** pour toutes les équipes NHL
5. ⚠️ **Intégrer dans `TeamBanner`** pour afficher le logo
6. ⚠️ **Mettre à jour `fetchMatches`** pour récupérer les logos des équipes depuis les rosters

