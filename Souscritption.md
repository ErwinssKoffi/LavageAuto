# Feuille de route — Gestion des souscriptions et des fonctionnalités

> Document de référence pour transformer les plans Free, Pro et Business en une véritable couche d'entitlements sécurisée, mesurable et administrable dans LavageAuto.

## 0. Objectif produit

- [ ] Permettre à chaque organisation de souscrire à un plan adapté à son niveau de maturité.
- [ ] Donner une expérience gratuite utile, sans exposer les fonctionnalités stratégiques.
- [ ] Faire du plan Pro l'offre de digitalisation opérationnelle complète pour une station.
- [ ] Faire du plan Business l'offre réseau : multi-stations, pilotage consolidé, permissions avancées et intégrations.
- [ ] Garantir qu'une fonctionnalité payante est contrôlée côté serveur, même si le frontend est contourné.
- [ ] Permettre une évolution future vers des add-ons, des quotas personnalisés et des offres négociées.

## 1. Principes d'architecture à valider

- [ ] Séparer les **rôles utilisateurs** des **droits du plan**.
  - Le rôle répond à : « Cet utilisateur a-t-il le droit d'effectuer cette action ? »
  - Le plan répond à : « Cette organisation a-t-elle acheté cette capacité ? »
  - La décision finale est : `rôle autorisé ET entitlement actif ET quota disponible`.
- [ ] Considérer le backend comme l'unique source de vérité pour l'autorisation.
- [ ] Utiliser le frontend uniquement pour guider l'utilisateur : masquer, verrouiller, expliquer et proposer l'upgrade.
- [ ] Ne jamais vérifier un libellé marketing comme `Plan Pro`; utiliser des codes immuables : `free`, `pro`, `business`.
- [ ] Ne jamais supprimer les données lors d'un downgrade ; bloquer uniquement les nouvelles créations dépassant les droits du nouveau plan.
- [ ] Rendre toutes les décisions d'accès observables et testables.

## 2. Catalogue fonctionnel cible

### 2.1 Fonctionnalités communes

- [ ] Authentification et gestion du profil.
- [ ] Gestion d'une organisation et d'une station principale.
- [ ] Création de prestations de lavage.
- [ ] Enregistrement des commandes et encaissements.
- [ ] Fiches clients et historique basique.
- [ ] Tableau de bord opérationnel : chiffre d'affaires, commandes et activité du jour.
- [ ] Paramètres de base de la station.

### 2.2 Fonctionnalités Pro

- [ ] Rapports avancés par période et par prestation.
- [ ] Export CSV/PDF des rapports.
- [ ] Gestion avancée des employés.
- [ ] Réservations en ligne.
- [ ] Programme de fidélité.
- [ ] Notifications client et rappels.
- [ ] Historique client enrichi.
- [ ] Support prioritaire.

### 2.3 Fonctionnalités Business

- [ ] Gestion de plusieurs stations dans une même organisation.
- [ ] Tableau de bord consolidé multi-stations.
- [ ] Comparaison des performances par station, équipe et période.
- [ ] Permissions avancées et rôles personnalisés.
- [ ] API et intégrations externes.
- [ ] Notifications avancées et automatisations.
- [ ] Exports et rapports planifiés.
- [ ] Journal d'audit et traçabilité des actions sensibles.
- [ ] Support prioritaire renforcé et accompagnement de déploiement.

## 3. Matrice commerciale initiale

| Capacité | Free | Pro | Business |
|---|---:|---:|---:|
| Stations | 1 | 1 | Plusieurs |
| Employés | 2 | 10 | Illimités ou contrat |
| Commandes mensuelles | 50 | 1 000 | Selon contrat |
| Dashboard de base | Oui | Oui | Oui |
| Rapports avancés | Non | Oui | Oui |
| Export CSV/PDF | Non | Oui | Oui |
| Réservations en ligne | Non | Oui | Oui |
| Fidélité client | Non | Oui | Oui |
| Multi-stations | Non | Non | Oui |
| Dashboard consolidé | Non | Non | Oui |
| Permissions avancées | Non | Non | Oui |
| API / intégrations | Non | Non | Oui |
| Journal d'audit | Non | Non | Oui |
| Support prioritaire | Non | Oui | Oui |

- [ ] Faire valider cette matrice par le métier avant tout développement.
- [ ] Documenter la justification commerciale de chaque limite.
- [ ] Vérifier que le plan Free permet une vraie découverte du produit sans devenir une solution complète gratuite.
- [ ] Définir les prix, la périodicité mensuelle/annuelle, la devise, les taxes et les règles d'essai.
- [ ] Définir les fonctionnalités optionnelles pouvant devenir des add-ons, notamment les notifications et intégrations.

## 4. Modèle de données

### 4.1 Plans

- [ ] Conserver un identifiant stable pour chaque plan.
- [ ] Ajouter ou confirmer les champs suivants :
  - `id`
  - `code` : `free`, `pro`, `business`
  - `name`
  - `description`
  - `price_monthly`
  - `price_yearly`
  - `currency`
  - `features` ou référence vers des entitlements normalisés
  - `max_stations`
  - `max_employees`
  - `max_wash_orders_month`
  - `sort_order`
  - `is_public`
  - `is_active`
  - `created_at`, `updated_at`
- [ ] Ajouter une contrainte d'unicité sur `code`.
- [ ] Ne pas coder les tarifs directement dans le frontend.

### 4.2 Souscriptions

- [ ] Rattacher la souscription à une organisation, jamais uniquement à un utilisateur.
- [ ] Stocker :
  - `organization_id`
  - `plan_id`
  - `status`
  - `provider`
  - `provider_customer_id`
  - `provider_subscription_id`
  - `current_period_start`
  - `current_period_end`
  - `trial_ends_at`
  - `cancel_at_period_end`
  - `canceled_at`
  - `created_at`, `updated_at`
- [ ] Ajouter une contrainte empêchant plusieurs souscriptions actives concurrentes pour la même organisation.
- [ ] Prévoir un historique des changements de plan.

### 4.3 Entitlements normalisés — évolution recommandée

Le JSON `plans.features` peut être conservé pour un premier lancement. Pour une gestion robuste, créer ensuite :

```sql
plan_features(
  plan_id,
  feature_code,
  enabled,
  limit_value,
  metadata,
  created_at,
  updated_at
)
```

- [ ] Ajouter une clé primaire composée `plan_id + feature_code`.
- [ ] Utiliser `enabled` pour les droits booléens.
- [ ] Utiliser `limit_value` pour les quotas numériques.
- [ ] Garder les codes de fonctionnalités dans un catalogue versionné.
- [ ] Prévoir une migration réversible depuis le JSON existant.

## 5. Catalogue technique des entitlements

- [ ] Créer une liste centralisée de codes, par exemple :
  - `dashboard_basic`
  - `dashboard_advanced`
  - `reports_advanced`
  - `reports_export`
  - `online_booking`
  - `loyalty_program`
  - `customer_history_advanced`
  - `employee_management_advanced`
  - `multiple_stations`
  - `consolidated_dashboard`
  - `advanced_permissions`
  - `audit_log`
  - `api_access`
  - `scheduled_reports`
  - `priority_support`
- [ ] Documenter pour chaque code : description, plan minimum, route concernée, valeur métier et événement de mesure.
- [ ] Utiliser les mêmes codes dans le backend, le frontend, les tests et l'administration.
- [ ] Refuser silencieusement les codes inconnus lors de l'activation d'un plan.

## 6. Couche d'autorisation backend

- [ ] Implémenter une fonction `RequireFeature(ctx, organizationID, featureCode)`.
- [ ] Implémenter une fonction `RequireLimit(ctx, organizationID, limitCode, requestedValue)`.
- [ ] Implémenter une fonction `GetEntitlements(ctx, organizationID)` pour exposer un snapshot contrôlé au frontend.
- [ ] Vérifier l'abonnement actif avant de vérifier la fonctionnalité.
- [ ] Définir la politique des statuts :
  - `trialing` : accès selon les règles de l'essai ;
  - `active` : accès complet au plan ;
  - `past_due` : période de grâce explicite ;
  - `canceled` : accès jusqu'à la fin de période si `cancel_at_period_end` ;
  - `expired` : lecture seule ou écran de renouvellement.
- [ ] Retourner une erreur stable : `feature_not_in_plan`, `quota_exceeded`, `subscription_inactive`.
- [ ] Ajouter les informations utiles dans la réponse : code, plan requis, quota actuel, quota maximum et action recommandée.
- [ ] Effectuer la vérification avant toute écriture en base.
- [ ] Protéger les exports, les routes d'administration, les endpoints API et les jobs planifiés.
- [ ] Éviter de faire confiance à un `planCode` envoyé par le navigateur.
- [ ] Vérifier systématiquement l'appartenance de l'utilisateur à l'organisation.
- [ ] Ajouter du rate limiting aux endpoints coûteux : exports, rapports et API.

## 7. Quotas et compteurs

- [ ] Définir les périodes de comptage : calendrier mensuel ou période de facturation.
- [ ] Choisir une source fiable pour les compteurs de commandes.
- [ ] Compter les créations validées, pas les simples tentatives échouées.
- [ ] Rendre les opérations quota + création atomiques pour éviter les dépassements concurrents.
- [ ] Gérer les cas limites : suppression, remboursement, annulation et import en masse.
- [ ] Afficher au frontend : `utilisé`, `maximum`, `pourcentage` et date de remise à zéro.
- [ ] Prévoir une marge et une alerte à 80 %, 90 % et 100 %.
- [ ] Après downgrade, conserver les données existantes mais empêcher les ajouts hors quota.

## 8. Frontend et expérience d'upgrade

- [ ] Créer un hook ou service unique `useEntitlements()`.
- [ ] Créer un composant `FeatureGate` pour les sections verrouillées.
- [ ] Créer un composant `PlanBadge` avec les labels Free, Pro et Business.
- [ ] Afficher un verrouillage explicatif plutôt qu'une page vide.
- [ ] Afficher la valeur de la fonctionnalité avant le CTA d'upgrade.
- [ ] Utiliser des CTA cohérents : « Passer au Pro », « Débloquer Business », « Voir les plans ».
- [ ] Conserver l'URL ou l'action initiale après le paiement.
- [ ] Prévoir un état de chargement pendant la récupération des droits.
- [ ] Prévoir un état « abonnement expiré » et un état « paiement en attente ».
- [ ] Ne pas utiliser le masquage frontend comme mécanisme de sécurité.
- [ ] Ajouter une page tarifs accessible depuis le dashboard et les écrans verrouillés.

## 9. Paiement et synchronisation

- [ ] Choisir le fournisseur de paiement et séparer les environnements test et production.
- [ ] Créer les produits et prix côté fournisseur, avec un identifiant par plan et périodicité.
- [ ] Ne jamais accepter le montant ou le plan depuis le client sans validation serveur.
- [ ] Créer les checkouts avec une clé d'idempotence.
- [ ] Vérifier les signatures des webhooks.
- [ ] Traiter au minimum : souscription créée, paiement réussi, paiement échoué, changement de plan, annulation et expiration.
- [ ] Rendre le traitement des webhooks idempotent.
- [ ] Stocker les événements déjà traités.
- [ ] Mettre à jour la souscription locale seulement après validation de l'événement fournisseur.
- [ ] Prévoir un bouton ou job de resynchronisation contrôlée.
- [ ] Définir le comportement exact en cas de retard ou d'échec de webhook.

## 10. Administration

- [ ] Permettre à un administrateur de créer et modifier les plans sans modifier le code.
- [ ] Empêcher la modification accidentelle d'un code utilisé en production.
- [ ] Afficher les fonctionnalités sous forme de tableau lisible.
- [ ] Permettre l'activation/désactivation contrôlée d'un entitlement.
- [ ] Afficher le nombre d'organisations par plan.
- [ ] Afficher les souscriptions en anomalie : expirées, impayées, incohérentes.
- [ ] Ajouter une action de prévisualisation : « ce que verra une organisation sur ce plan ».
- [ ] Journaliser les changements effectués par les administrateurs.
- [ ] Prévoir une fonctionnalité de plan personnalisé uniquement pour les contrats Business.

## 11. Tests obligatoires

### Tests unitaires

- [ ] Un plan Free refuse chaque fonctionnalité Pro et Business.
- [ ] Un plan Pro accepte les fonctionnalités Free et Pro.
- [ ] Un plan Pro refuse les fonctionnalités Business.
- [ ] Un plan Business accepte toutes les fonctionnalités incluses.
- [ ] Un abonnement expiré refuse les écritures protégées.
- [ ] Un rôle sans permission refuse une action même si le plan l'autorise.
- [ ] Un utilisateur d'une autre organisation ne peut jamais lire les entitlements.
- [ ] Les quotas refusent les valeurs nulles, négatives ou dépassées.

### Tests d'intégration

- [ ] Chaque endpoint sensible vérifie plan, statut, organisation et rôle.
- [ ] Les webhooks mettent à jour la souscription une seule fois.
- [ ] Un upgrade débloque les droits après synchronisation.
- [ ] Un downgrade ne supprime aucune donnée.
- [ ] Une création concurrente ne dépasse pas un quota.

### Tests frontend

- [ ] Les badges de plan sont cohérents.
- [ ] Les fonctionnalités verrouillées affichent une explication et un CTA.
- [ ] Les compteurs se mettent à jour après création.
- [ ] Les états loading, erreur, impayé et expiré sont accessibles.
- [ ] Les CTA fonctionnent sur mobile et clavier.

## 12. Observabilité et indicateurs

- [ ] Journaliser chaque refus avec `organization_id`, `user_id`, `feature_code`, route et raison.
- [ ] Ne jamais journaliser de données de paiement sensibles.
- [ ] Suivre les métriques : activation, conversion Free → Pro, conversion Pro → Business, churn, MRR et utilisation des quotas.
- [ ] Mesurer les fonctionnalités les plus demandées lorsqu'elles sont verrouillées.
- [ ] Créer une alerte sur les incohérences entre fournisseur de paiement et base locale.
- [ ] Ajouter un dashboard interne de santé des souscriptions.

## 13. Ordre d'implémentation recommandé

### Phase 1 — Cadrage métier

- [ ] Valider la matrice Free/Pro/Business.
- [ ] Valider les prix, essais, limites et politique de grâce.
- [ ] Finaliser le catalogue des codes.
- [ ] Écrire les règles de downgrade, annulation et expiration.

### Phase 2 — Fondations données

- [ ] Auditer les tables existantes `plans`, `subscriptions` et organisations.
- [ ] Ajouter les contraintes, index et champs manquants.
- [ ] Insérer les plans de référence.
- [ ] Migrer et versionner les fonctionnalités existantes.

### Phase 3 — Sécurité backend

- [ ] Implémenter `RequireFeature`.
- [ ] Implémenter `RequireLimit`.
- [ ] Protéger progressivement chaque route sensible.
- [ ] Ajouter les tests d'isolation par organisation.

### Phase 4 — Frontend

- [ ] Exposer un snapshot minimal des entitlements.
- [ ] Construire `FeatureGate`, `PlanBadge` et les états de quota.
- [ ] Ajouter la page tarifs et les CTA contextuels.
- [ ] Ajouter les états locked, loading, expired et past due.

### Phase 5 — Paiement

- [ ] Configurer les produits/prix.
- [ ] Implémenter checkout sécurisé et idempotent.
- [ ] Implémenter les webhooks signés et idempotents.
- [ ] Tester upgrade, downgrade, annulation et paiement échoué.

### Phase 6 — Exploitation

- [ ] Ajouter l'administration des plans.
- [ ] Ajouter logs, métriques et alertes.
- [ ] Documenter les procédures de support et de resynchronisation.
- [ ] Faire un audit de sécurité avant production.

## 14. Critères d'acceptation avant mise en production

- [ ] Aucun endpoint payant n'est protégé uniquement par le frontend.
- [ ] Les trois plans sont identifiables par des codes stables.
- [ ] Les rôles et entitlements sont vérifiés ensemble.
- [ ] Les quotas sont atomiques et testés en concurrence.
- [ ] Les webhooks sont signés, idempotents et observables.
- [ ] Les changements de plan n'entraînent aucune suppression de données.
- [ ] Les erreurs d'accès sont compréhensibles par l'utilisateur.
- [ ] Les plans, prix et limites sont administrables sans redéploiement lorsque cela est nécessaire.
- [ ] Les parcours mobile, clavier et lecteur d'écran sont vérifiés.
- [ ] La matrice de tests d'autorisation est entièrement verte.

## Décision structurante

La règle à conserver dans toute l'application est :

```text
Accès final = organisation active
           ET abonnement exploitable
           ET fonctionnalité incluse dans le plan
           ET permission du rôle
           ET quota disponible
```

Cette règle doit être implémentée une seule fois dans les services backend, réutilisée par toutes les routes, puis reflétée dans le frontend pour offrir une expérience commerciale claire et cohérente.
