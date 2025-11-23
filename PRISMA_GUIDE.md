# Guide d'utilisation de Prisma avec Supabase

## Pourquoi utiliser Prisma avec Supabase ?

Prisma est utilisé ici pour :
- **Modélisation** : Définir le schéma de la base de données de manière déclarative
- **Migrations** : Gérer les changements de schéma de manière versionnée
- **Type Safety** : Générer des types TypeScript à partir du schéma
- **Scripts locaux** : Utiliser Prisma Client pour des opérations batch ou scripts

**Important** : Dans le frontend React, nous utilisons `supabase-js` directement car :
- Il fonctionne nativement avec l'authentification Supabase
- Il respecte automatiquement les Row Level Security (RLS)
- Il supporte le Realtime
- Il est optimisé pour les opérations côté client

## Workflow Prisma + Supabase

### 1. Développement Local

```bash
# 1. Modifier le schéma Prisma
# Éditez prisma/schema.prisma

# 2. Créer une migration
npx prisma migrate dev --name description_du_changement

# 3. Prisma va :
#    - Créer un fichier de migration SQL
#    - Appliquer la migration à votre base Supabase
#    - Régénérer le client Prisma
```

### 2. Synchronisation avec Supabase

Quand vous créez une migration avec Prisma, elle est appliquée directement à votre base Supabase via la `DATABASE_URL`.

**Note** : Les policies RLS et autres objets Supabase (triggers, fonctions) doivent être gérés séparément via SQL dans le Supabase SQL Editor.

### 3. Utilisation du Client Prisma

Le client Prisma peut être utilisé dans des scripts Node.js locaux :

```typescript
// scripts/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Exemple: créer des données de test
  const echeance = await prisma.echeance.create({
    data: {
      titre: 'Test',
      montant: 100.50,
      date: new Date(),
      owner: 'user-uuid-here',
      paid: false,
    },
  })
  console.log('Échéance créée:', echeance)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Important** : Le client Prisma utilise la `DATABASE_URL` qui peut pointer vers Supabase, mais il **bypass les RLS**. Utilisez-le uniquement pour des scripts locaux ou des opérations admin.

### 4. Commandes Prisma Utiles

```bash
# Générer le client Prisma (après modification du schéma)
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Introspecter une base existante (mettre à jour le schéma depuis la DB)
npx prisma db pull

# Ouvrir Prisma Studio (GUI pour visualiser/éditer les données)
npx prisma studio

# Formater le schéma Prisma
npx prisma format

# Valider le schéma
npx prisma validate
```

### 5. Quand utiliser Prisma vs Supabase Client

| Tâche | Outil | Raison |
|-------|-------|--------|
| CRUD depuis React | `supabase-js` | RLS, Auth, Realtime |
| Migrations | Prisma | Versioning, type safety |
| Scripts locaux | Prisma Client | Plus simple pour batch operations |
| Realtime | `supabase-js` | Prisma ne supporte pas le realtime |
| Authentification | `supabase-js` | Intégration native |

### 6. Structure des Migrations

Les migrations Prisma sont stockées dans `prisma/migrations/`. Chaque migration contient :
- Un fichier SQL avec les changements
- Un fichier `migration_lock.toml` pour verrouiller le provider

**Ne modifiez jamais manuellement les fichiers de migration** après leur création.

### 7. Exemple de Modification du Schéma

Si vous voulez ajouter un champ `description` à la table `echeances` :

1. **Modifier `prisma/schema.prisma`** :
```prisma
model echeance {
  id          Int      @id @default(autoincrement())
  titre       String
  description String?  // Nouveau champ optionnel
  montant     Float
  date        DateTime
  paid        Boolean  @default(false)
  owner       String
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("echeances")
}
```

2. **Créer la migration** :
```bash
npx prisma migrate dev --name add_description
```

3. **Mettre à jour le code TypeScript** :
```typescript
// src/types/index.ts
export interface Echeance {
  // ...
  description?: string
}
```

4. **Mettre à jour les composants React** pour utiliser le nouveau champ.

### 8. Production

En production, utilisez :
```bash
npx prisma migrate deploy
```

Cette commande applique toutes les migrations en attente sans créer de nouvelles migrations (contrairement à `migrate dev`).

### 9. Résolution de Conflits

Si vous avez modifié la base directement dans Supabase et que Prisma est désynchronisé :

```bash
# 1. Introspecter la base pour mettre à jour le schéma
npx prisma db pull

# 2. Créer une migration pour synchroniser
npx prisma migrate dev --name sync_with_db
```

**Attention** : `db pull` peut écraser certaines modifications manuelles. Utilisez avec précaution.

