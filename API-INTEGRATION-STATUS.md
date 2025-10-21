# 📊 État de l'intégration API - Mordu Sport Mobile

Date: 21 octobre 2025
Dernière mise à jour: Endpoints API documentés

## ⚠️ STATUT ACTUEL

**API Choisie: Goalserve** 🎯
- L'API Goalserve sera utilisée pour toutes les données
- Actuellement en attente de disponibilité/accès
- Toute la structure est PRÊTE et compatible avec Goalserve
- L'application fonctionne actuellement avec des **données mock** complètes
- La migration sera simple une fois l'accès API obtenu

---

## ✅ CE QUI EST API-READY

### 1. **Types TypeScript** ✅
Tous les types sont bien définis et prêts pour l'API :

#### **Matchs** (`lib/types.ts`)
```typescript
interface Match {
  id: string
  league: "NHL" | "NBA" | "NFL"
  status: "upcoming" | "live" | "finished"
  date: string
  time?: string
  period?: string
  timeRemaining?: string
  awayTeam: TeamInMatch
  homeTeam: TeamInMatch
}
```

#### **Équipes (liste)** (`lib/teamData.ts`)
```typescript
interface Team {
  id: string
  name: string
  abbr: string
  city: string
  league: "NHL" | "NBA" | "NFL"
  conference: string
  division: string
  stats?: {
    wins: number
    losses: number
    otLosses?: number
    points: number
  }
}
```

#### **Détail équipe** (`lib/teamTypes.ts`)
```typescript
interface TeamDetailData {
  teamInfo: TeamInfo
  teamStats: TeamStats
  roster: TeamRoster
  injuries: Injury[]
}

interface Player {
  id: string
  name: string
  number: string
  position: string
  gamesPlayed?: number
  birthplace?: string
  points?: number
  goals?: number
  assists?: number
}

interface TeamStats {
  wins, losses, otLosses, points, gamesPlayed
  goalsFor, goalsAgainst
  shotsPerGame, shotsAllowedPerGame
  powerPlayPercentage, penaltyKillPercentage
  faceoffWinPercentage
  etc.
}

interface Injury {
  playerId: string
  playerName: string
  position: string
  injury: string
  status: 'OUT' | 'Day-to-Day' | 'IR'
  date?: string
}
```

### 2. **Composants** ✅
Tous les composants acceptent des props et peuvent facilement recevoir des données d'API :

- ✅ `MatchCard` - Reçoit un objet `Match`
- ✅ `MatchList` - Filtre par ligue et date
- ✅ `TeamCard` - Reçoit un objet `Team`
- ✅ `ConferenceSection` - Reçoit un tableau de `Team[]`
- ✅ `TeamBanner` - Reçoit les infos d'équipe
- ✅ `TeamRosterComponent` - Reçoit un `TeamRoster`
- ✅ `TeamStatsComponent` - Reçoit un `TeamStats`
- ✅ `InjuryReport` - Reçoit un `Injury[]`

### 3. **Structure de données Mock** ✅
Les données mock ont la même structure que les données API :

- ✅ `lib/mockData.ts` - Matchs avec toutes les propriétés
- ✅ `lib/teamData.ts` - Équipes avec stats
- ✅ `lib/mockTeamDetail.ts` - Détails complets d'équipe

---

## ⚠️ CE QUI MANQUE POUR L'API

### 1. **Services/Hooks API** ❌
**Statut:** Non créés

**Ce qu'il faut créer:**

```typescript
// services/api.ts
const API_BASE_URL = 'https://your-api.com'

export const fetchMatches = async (date?: string, league?: string) => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (league && league !== 'ALL') params.append('league', league)
  
  const response = await fetch(`${API_BASE_URL}/matches?${params}`)
  return response.json()
}

export const fetchTeams = async (league?: string) => {
  const params = league && league !== 'TOUS' 
    ? `?league=${league}` 
    : ''
  
  const response = await fetch(`${API_BASE_URL}/teams${params}`)
  return response.json()
}

export const fetchTeamDetail = async (teamId: string) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`)
  return response.json()
}
```

### 2. **Custom Hooks** ❌
**Statut:** Non créés

**Ce qu'il faut créer:**

```typescript
// hooks/useMatches.ts
import { useEffect, useState } from 'react'
import { fetchMatches } from '@/services/api'
import { Match } from '@/lib/types'

export function useMatches(date?: string, league?: string) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        const data = await fetchMatches(date, league)
        setMatches(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [date, league])

  return { matches, loading, error }
}

// hooks/useTeams.ts
export function useTeams(league?: string) {
  // Même pattern
}

// hooks/useTeamDetail.ts
export function useTeamDetail(teamId: string) {
  // Même pattern
}
```

### 3. **Gestion du Cache** ❌
**Statut:** Non implémenté

**Recommandations:**
- Utiliser **React Query** ou **SWR** pour le caching automatique
- Ou implémenter un cache manuel avec `AsyncStorage`

```bash
npm install @tanstack/react-query
```

```typescript
// hooks/useMatches.ts avec React Query
import { useQuery } from '@tanstack/react-query'

export function useMatches(date?: string, league?: string) {
  return useQuery({
    queryKey: ['matches', date, league],
    queryFn: () => fetchMatches(date, league),
    staleTime: 30000, // 30 secondes
  })
}
```

### 4. **Gestion des erreurs** ❌
**Statut:** Partiellement implémenté

**Ce qui existe:**
- ✅ État d'erreur dans la page de détail d'équipe ("Équipe non trouvée")

**Ce qui manque:**
- ❌ Composant d'erreur générique
- ❌ Retry automatique
- ❌ Messages d'erreur utilisateur-friendly
- ❌ Fallback vers données cached

### 5. **Loading States** ❌
**Statut:** Non implémenté

**Ce qu'il faut ajouter:**
```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text>Chargement...</Text>
    </View>
  )
}

// Dans MatchList.tsx
export function MatchList({ selectedLeague, selectedDate }: MatchListProps) {
  const { matches, loading, error } = useMatches(selectedDate, selectedLeague)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    // ... render matches
  )
}
```

### 6. **Variables d'environnement** ❌
**Statut:** Non configurées

**Ce qu'il faut créer:**

```bash
# .env
API_BASE_URL=https://api.mordu-sport.com
API_KEY=your-api-key-here
```

```typescript
// config/env.ts
import Constants from 'expo-constants'

export const ENV = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000',
  API_KEY: Constants.expoConfig?.extra?.apiKey || '',
}
```

```javascript
// app.json
{
  "expo": {
    "extra": {
      "apiBaseUrl": process.env.API_BASE_URL,
      "apiKey": process.env.API_KEY
    }
  }
}
```

### 7. **Polling/WebSocket pour données live** ❌
**Statut:** Non implémenté

**Pour les matchs en direct:**
```typescript
// hooks/useLiveMatch.ts
export function useLiveMatch(matchId: string) {
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch updated match data every 10 seconds
      fetchMatch(matchId)
    }, 10000)

    return () => clearInterval(interval)
  }, [matchId])
}
```

### 8. **Authentification** ❌
**Statut:** Non implémenté

**Si l'API nécessite une authentification:**
- Headers Authorization
- Token refresh
- Gestion de session

---

## 🔄 PLAN DE MIGRATION VERS L'API

### Phase 1: Infrastructure (1-2 jours)
1. ✅ Installer dépendances (`@tanstack/react-query`, `axios`)
2. ✅ Créer service API (`services/api.ts`)
3. ✅ Configurer variables d'environnement
4. ✅ Créer composants Loading/Error

### Phase 2: Hooks (1 jour)
1. ✅ Créer `useMatches`
2. ✅ Créer `useTeams`
3. ✅ Créer `useTeamDetail`

### Phase 3: Intégration (2-3 jours)
1. ✅ Remplacer données mock dans `MatchList`
2. ✅ Remplacer données mock dans `Teams`
3. ✅ Remplacer données mock dans `TeamDetail`
4. ✅ Tester tous les cas d'erreur

### Phase 4: Optimisation (1-2 jours)
1. ✅ Ajouter caching
2. ✅ Ajouter retry logic
3. ✅ Implémenter polling pour matchs live
4. ✅ Optimiser performance

---

## 📝 EXEMPLE DE MIGRATION

### Avant (Mock):
```typescript
// components/MatchList.tsx
import { mockMatches } from '@/lib/mockData'

export function MatchList({ selectedLeague }: MatchListProps) {
  const matches = mockMatches.filter(m => m.league === selectedLeague)
  
  return matches.map(match => <MatchCard match={match} />)
}
```

### Après (API):
```typescript
// components/MatchList.tsx
import { useMatches } from '@/hooks/useMatches'

export function MatchList({ selectedLeague }: MatchListProps) {
  const { matches, loading, error } = useMatches(undefined, selectedLeague)
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return matches.map(match => <MatchCard match={match} />)
}
```

---

## ✅ RÉSUMÉ

### Ce qui est prêt:
- ✅ Types TypeScript complets
- ✅ Structure de composants
- ✅ UI complète
- ✅ Navigation
- ✅ Données mock pour dev

### Ce qui manque:
- ❌ Services API
- ❌ Custom hooks
- ❌ Loading states
- ❌ Error handling
- ❌ Caching
- ❌ Variables d'env
- ❌ Polling pour live data

### Estimation temps total: **5-8 jours**
- Infrastructure: 1-2 jours
- Hooks: 1 jour
- Intégration: 2-3 jours
- Optimisation: 1-2 jours

---

## 📞 PROCHAINES ÉTAPES

1. **Obtenir les spécifications de l'API:**
   - Base URL
   - Endpoints disponibles
   - Format des réponses
   - Authentification requise?
   - Rate limits?

2. **Installer les outils:**
   ```bash
   npm install @tanstack/react-query axios
   npm install --save-dev @types/axios
   ```

3. **Commencer par un endpoint:**
   - Commencer par `/matches` ou `/teams`
   - Tester la réponse
   - Créer le hook correspondant
   - L'intégrer dans 1 composant
   - Valider que ça fonctionne
   - Répéter pour les autres endpoints

---

## 🔌 ENDPOINTS API REQUIS (PAR PRIORITÉ)

### **CRITIQUE (Must Have)** ⭐⭐⭐

#### 1. Liste des matchs par ligue
```
GET /nhl/matches?date=YYYY-MM-DD
GET /nba/matches?date=YYYY-MM-DD
GET /nfl/matches?date=YYYY-MM-DD
```

**Utilisé dans:** Page d'accueil (`app/(tabs)/index.tsx`)

**Réponse attendue:**
```json
{
  "matches": [
    {
      "id": "match-123",
      "league": "NHL",
      "status": "live" | "upcoming" | "finished",
      "date": "2025-01-20",
      "time": "19:00",
      "period": "2e période",
      "timeRemaining": "12:45",
      "awayTeam": {
        "name": "Montreal Canadiens",
        "abbr": "MTL",
        "logo": "https://...",
        "score": 2,
        "record": "15-8-2"
      },
      "homeTeam": {
        "name": "Toronto Maple Leafs",
        "abbr": "TOR",
        "logo": "https://...",
        "score": 3,
        "record": "12-10-3"
      }
    }
  ]
}
```

**Fréquence de mise à jour:**
- Matchs live: Toutes les 10-30 secondes
- Matchs upcoming/finished: Au changement de date

---

#### 2. Détail d'un match
```
GET /nhl/match/:matchId
GET /nba/match/:matchId
GET /nfl/match/:matchId
```

**Utilisé dans:** Page de détail de match (future feature)

**Réponse attendue:**
```json
{
  "match": {
    "id": "match-123",
    "league": "NHL",
    "status": "live",
    "date": "2025-01-20",
    "time": "19:00",
    "period": "2e période",
    "timeRemaining": "12:45",
    "awayTeam": {
      "name": "Montreal Canadiens",
      "abbr": "MTL",
      "logo": "https://...",
      "score": 2,
      "record": "15-8-2",
      "p1": 1,
      "p2": 0,
      "p3": 1,
      "ot": 0,
      "so": 0
    },
    "homeTeam": {
      "name": "Toronto Maple Leafs",
      "abbr": "TOR",
      "logo": "https://...",
      "score": 3,
      "record": "12-10-3",
      "p1": 1,
      "p2": 2,
      "p3": 0,
      "ot": 0,
      "so": 0
    },
    "odds": {
      "bookmaker": "BET99",
      "home": "2.50",
      "away": "1.80"
    }
  }
}
```

**Fréquence de mise à jour:**
- Match live: Toutes les 10-30 secondes
- Match terminé: Une seule fois

---

#### 3. WebSocket Chat en temps réel
```
wss://api.mordu-sport.com/socket.io
```

**Utilisé dans:** Chat de match (future feature)

**Événements:**
```javascript
// Connexion
emit('join', { matchId, username, avatar })
emit('leave', { matchId })

// Messages
emit('message', { matchId, user, avatar, message, time })
on('message', (data) => { ... })

// Utilisateurs (optionnel)
on('users', (userList) => { ... })
on('user_joined', (user) => { ... })
on('user_left', (user) => { ... })
```

**Structure message:**
```json
{
  "id": 123,
  "matchId": "match-123",
  "user": "HabsFan22",
  "avatar": "🏒",
  "message": "Let's go Habs!!!",
  "time": "19:23",
  "timestamp": 1705776180000
}
```

**Fonctionnalités:**
- Rate limiting: 1 message / 3 secondes
- Modération (optionnel)
- Reconnexion automatique

---

### **IMPORTANT (Should Have)** ⭐⭐

#### 4. Liste des équipes par ligue
```
GET /nhl/teams
GET /nba/teams
GET /nfl/teams
```

**Utilisé dans:** Page Équipes (`app/(tabs)/teams.tsx`)

**Réponse attendue:**
```json
{
  "teams": [
    {
      "id": "montreal-canadiens",
      "name": "Montreal Canadiens",
      "abbr": "MTL",
      "city": "Montreal",
      "league": "NHL",
      "conference": "Eastern",
      "division": "Atlantic",
      "logo": "https://..."
    }
  ]
}
```

**Fréquence de mise à jour:**
- Une fois au mount (données statiques)
- Cache local long terme (7 jours)

---

#### 5. Détail d'une équipe (Roster, Stats, Blessures)
```
GET /nhl/team/:teamId
GET /nba/team/:teamId
GET /nfl/team/:teamId
```

**Utilisé dans:** Page de détail d'équipe (`app/(tabs)/teams/[id].tsx`)

**Réponse attendue:**
```json
{
  "teamInfo": {
    "id": "montreal-canadiens",
    "name": "Montreal Canadiens",
    "abbr": "MTL",
    "city": "Montreal",
    "league": "NHL",
    "conference": "Eastern",
    "division": "Atlantic"
  },
  "teamStats": {
    "wins": 15,
    "losses": 8,
    "otLosses": 2,
    "points": 32,
    "gamesPlayed": 25,
    "goalsFor": 78,
    "goalsAgainst": 71,
    "shotsPerGame": 30.5,
    "shotsAllowedPerGame": 29.2,
    "powerPlayPercentage": "22.5%",
    "powerPlayGoals": 18,
    "powerPlayOpportunities": 80,
    "penaltyKillPercentage": "82.3%",
    "faceoffWinPercentage": "51.2%"
  },
  "roster": {
    "forwards": [
      {
        "id": "nick-suzuki",
        "name": "Nick Suzuki",
        "number": "14",
        "position": "C",
        "gamesPlayed": 25,
        "points": 28,
        "goals": 12,
        "assists": 16,
        "birthplace": "London, ON"
      }
    ],
    "defensemen": [],
    "goalies": []
  },
  "injuries": [
    {
      "playerId": "cole-caufield",
      "playerName": "Cole Caufield",
      "position": "RW",
      "injury": "Blessure au haut du corps",
      "status": "Day-to-Day",
      "date": "2025-01-20"
    }
  ]
}
```

**Fréquence de mise à jour:**
- Roster & Stats: Quotidienne (cache 24h)
- Injuries: Toutes les heures

---

### **OPTIONNEL (Nice to Have)** ⭐

#### 6. Classements
```
GET /nhl/standings
GET /nba/standings
GET /nfl/standings
```

**Utilisé dans:** Affichage des records dans les cartes de match

**Réponse attendue:**
```json
{
  "standings": [
    {
      "teamName": "Montreal Canadiens",
      "wins": 15,
      "losses": 8,
      "otLosses": 2,
      "points": 32,
      "gamesPlayed": 25,
      "division": "Atlantic",
      "conference": "Eastern"
    }
  ]
}
```

**Fréquence:** Quotidienne (cache 24h)

---

#### 7. Favoris utilisateur
```
POST /user/favorites
GET /user/favorites
DELETE /user/favorites/:matchId
```

**Utilisé dans:** Page Favoris (`app/(tabs)/favorites.tsx`)

**Requiert:** Authentification (JWT, OAuth, etc.)

**Requêtes:**
```json
// POST /user/favorites
{
  "userId": "user-123",
  "matchId": "match-123",
  "type": "match" | "team"
}

// GET /user/favorites
{
  "favorites": [
    {
      "id": "fav-1",
      "userId": "user-123",
      "matchId": "match-123",
      "type": "match",
      "createdAt": "2025-01-20T19:00:00Z"
    }
  ]
}
```

---

#### 8. Notifications Push
```
POST /notifications/subscribe
POST /notifications/unsubscribe
```

**Technologie:** Firebase Cloud Messaging (FCM), Expo Push, ou OneSignal

**Données:**
```json
{
  "userId": "user-123",
  "token": "ExponentPushToken[xxx]",
  "preferences": {
    "matchStart": true,
    "goals": true,
    "finalScore": true,
    "favoriteTeams": ["montreal-canadiens"]
  }
}
```

---

## 🏒 API GOALSERVE

**URL de base:** `https://www.goalserve.com/`

### **Caractéristiques de Goalserve:**
- ✅ Données en temps réel pour NHL, NBA, NFL
- ✅ Format XML (parsing déjà préparé dans `lib/parsers/`)
- ✅ Mises à jour fréquentes pour les matchs live
- ✅ Données complètes : scores, stats, rosters, blessures
- ✅ Fiable et utilisé par de nombreuses applications sportives

### **Structure des parsers (déjà créée):**
```
lib/parsers/
├── nhl-parser.ts     ✅ Parser XML → JSON pour NHL
├── nba-parser.ts     ✅ Parser XML → JSON pour NBA  
├── nfl-parser.ts     ✅ Parser XML → JSON pour NFL
└── team-parser.ts    ✅ Parser pour équipes/roster
```

### **Hooks prêts:**
```
lib/hooks/
├── useNHLData.ts     ✅ useNHLMatches, useNHLMatch, useNHLTeams
├── useNBAData.ts     ✅ useNBAMatches, useNBAMatch, useNBATeams
├── useNFLData.ts     ✅ useNFLMatches, useNFLMatch, useNFLTeams
└── useTeamData.ts    ✅ useTeamData pour roster/stats/injuries
```

### **Service API:**
```typescript
// lib/services/goalserve.ts (À ADAPTER une fois accès obtenu)
export const goalServeService = {
  async getNHLMatches(date: string) {
    const response = await fetch(`https://goalserve.com/nhl/...`)
    const xml = await response.text()
    return parseNHLMatches(xml)
  }
}
```

---

## 🔄 SOLUTIONS ALTERNATIVES (BACKUP)

En cas de problème avec Goalserve, voici des alternatives :

### 1. **API-Sports.io** ⭐⭐⭐
- NHL, NBA, NFL disponibles
- Freemium (100 requêtes/jour gratuit)
- 🔗 https://api-sports.io

### 2. **TheSportsDB** ⭐⭐
- Gratuit mais moins de données live
- 🔗 https://www.thesportsdb.com

### 3. **SportsData.io** ⭐⭐⭐
- Payant mais très complet
- 🔗 https://sportsdata.io

---

## 📝 EXEMPLE D'INTÉGRATION

### Avant (avec Mock Data)
```typescript
// components/MatchList.tsx
import { mockMatches } from '@/lib/mockData'

export function MatchList({ selectedLeague }: MatchListProps) {
  const matches = mockMatches.filter(m => m.league === selectedLeague)
  
  return matches.map(match => <MatchCard match={match} />)
}
```

### Après (avec API)
```typescript
// components/MatchList.tsx
import { useMatches } from '@/hooks/useMatches'

export function MatchList({ selectedLeague }: MatchListProps) {
  const { matches, loading, error } = useMatches(undefined, selectedLeague)
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return matches.map(match => <MatchCard match={match} />)
}
```

### Service API à créer
```typescript
// services/api.ts
const API_BASE_URL = process.env.API_BASE_URL

export const fetchMatches = async (date?: string, league?: string) => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (league && league !== 'ALL') params.append('league', league)
  
  const response = await fetch(`${API_BASE_URL}/matches?${params}`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
    }
  })
  
  if (!response.ok) throw new Error('Failed to fetch matches')
  
  return response.json()
}
```

---

**Note:** Ton application est très bien structurée et la migration vers l'API sera facile grâce à la séparation claire entre données mock et composants. Tous les types sont déjà définis, il suffit de remplacer les imports de données mock par des appels API via des hooks. 🚀

