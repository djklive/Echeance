# Fonctionnement des Boutons - Échéances

## ✅ Bouton "Payée" / "Non payée"

### Comment ça fonctionne

1. **Clic sur le bouton** : Quand vous cliquez sur le bouton "Payée" ou "Non payée"
2. **Mise à jour en base** : Le statut `paid` de l'échéance est mis à jour dans Supabase
3. **Rechargement automatique** : La liste des échéances est automatiquement rechargée pour afficher le nouveau statut
4. **Mise à jour visuelle** : 
   - Le badge de statut change de couleur (vert pour payée, orange pour non payée)
   - La bordure de la carte change de couleur
   - Le bouton change de texte et de couleur

### Code implémenté

```typescript
const handleTogglePaid = async (id: number, currentPaid: boolean) => {
  // Met à jour le statut dans Supabase
  await supabase
    .from('echeances')
    .update({ paid: !currentPaid })
    .eq('id', id)
  
  // Recharge la liste pour voir le changement
  await loadEcheances()
}
```

### Comportement

- **Si l'échéance est "Non payée"** → Clic sur "Payée" → Devient "Payée"
- **Si l'échéance est "Payée"** → Clic sur "Non payée" → Devient "Non payée"

### Realtime

Grâce au système Realtime de Supabase, si vous ouvrez deux onglets :
- Clic sur "Payée" dans l'onglet 1
- L'onglet 2 se met à jour automatiquement sans rechargement

---

## ✏️ Bouton "Modifier"

### Comment ça fonctionne

1. **Clic sur "Modifier"** : Le formulaire d'édition s'affiche en haut de la page
2. **Pré-remplissage** : Les champs sont automatiquement remplis avec les données de l'échéance
3. **Modification** : Vous modifiez les champs souhaités (titre, montant, date)
4. **Sauvegarde** : Cliquez sur "Modifier" dans le formulaire pour sauvegarder
5. **Mise à jour** : L'échéance est mise à jour dans Supabase et la liste se recharge

### Code implémenté

```typescript
const handleEdit = (echeance: Echeance) => {
  // Définit l'échéance à modifier
  setEditingEcheance(echeance)
  // Affiche le formulaire
  setShowForm(true)
  // Scroll vers le formulaire pour une meilleure UX
  setTimeout(() => {
    const formElement = document.querySelector('.echeance-form-container')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}
```

### Comportement du formulaire

- **Titre du formulaire** : Change de "Nouvelle échéance" à "Modifier l'échéance"
- **Bouton de soumission** : Change de "Créer" à "Modifier"
- **Bouton Annuler** : Ferme le formulaire sans sauvegarder
- **Bouton X** : Apparaît en haut à droite pour fermer le formulaire

### Après modification

- Le formulaire se ferme automatiquement
- La liste se recharge pour afficher les modifications
- L'échéance modifiée apparaît avec les nouvelles valeurs

---

## 🔍 Dépannage

### Le bouton "Payée" ne fonctionne pas

**Vérifications :**
1. Ouvrez la console du navigateur (F12)
2. Regardez s'il y a des erreurs
3. Vérifiez que vous êtes bien connecté
4. Vérifiez que les policies RLS sont bien configurées dans Supabase

**Solution :**
- Exécutez le script `sql/setup.sql` dans Supabase SQL Editor pour vérifier les policies

### Le bouton "Modifier" ne fonctionne pas

**Vérifications :**
1. Le formulaire devrait s'afficher en haut de la page
2. Les champs devraient être pré-remplis
3. Si le formulaire ne s'affiche pas, vérifiez la console

**Solution :**
- Vérifiez que `showForm` est bien à `true` après le clic
- Vérifiez que `editingEcheance` contient bien les données de l'échéance

### Les modifications ne se sauvegardent pas

**Vérifications :**
1. Ouvrez la console du navigateur
2. Regardez les erreurs lors de la soumission du formulaire
3. Vérifiez les logs Supabase

**Solution :**
- Vérifiez que vous avez les permissions (RLS policies)
- Vérifiez que tous les champs requis sont remplis
- Vérifiez que la date est valide

---

## 📝 Notes techniques

### Realtime

Les changements sont propagés en temps réel grâce à Supabase Realtime :
- Pas besoin de recharger la page
- Les autres onglets se mettent à jour automatiquement
- Les autres utilisateurs voient les changements en temps réel

### Sécurité

- Les policies RLS garantissent que vous ne pouvez modifier que vos propres échéances
- L'authentification est vérifiée à chaque action
- Les données sont validées avant l'envoi

### Performance

- Les requêtes sont optimisées avec des filtres
- Le rechargement ne se fait que si nécessaire
- Les animations sont fluides grâce à CSS

---

## 🎯 Résumé

| Action | Bouton | Résultat |
|--------|--------|----------|
| Marquer comme payée | "Payée" (vert) | Statut → Payée, Badge vert |
| Marquer comme non payée | "Non payée" (orange) | Statut → Non payée, Badge orange |
| Modifier | "Modifier" (bleu) | Formulaire s'affiche avec données pré-remplies |
| Supprimer | "Supprimer" (rouge) | Confirmation puis suppression |
| Notifier | 🔔 (bleu clair) | Envoie une notification (si Edge Function déployée) |

Tous les boutons fonctionnent maintenant correctement ! 🎉

