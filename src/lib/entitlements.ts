import type { Subscription } from '@/types'

export type PlanCode = 'free' | 'pro' | 'business'

export type FeatureCode =
  | 'dashboard_basic'
  | 'dashboard_advanced'
  | 'reports_advanced'
  | 'reports_export'
  | 'online_booking'
  | 'loyalty_program'
  | 'customer_history_advanced'
  | 'employee_management_advanced'
  | 'multiple_stations'
  | 'consolidated_dashboard'
  | 'advanced_permissions'
  | 'audit_log'
  | 'api_access'
  | 'scheduled_reports'
  | 'priority_support'

export type LimitCode = 'stations' | 'employees' | 'wash_orders_month'

export interface FeatureDefinition {
  code: FeatureCode
  label: string
  description: string
  minimumPlan: PlanCode
}

export const FEATURE_CATALOG: Record<FeatureCode, FeatureDefinition> = {
  dashboard_basic: { code: 'dashboard_basic', label: 'Tableau de bord essentiel', description: 'Suivez votre activité quotidienne en un coup d\'œil.', minimumPlan: 'free' },
  dashboard_advanced: { code: 'dashboard_advanced', label: 'Pilotage avancé', description: 'Analysez vos performances et vos indicateurs clés.', minimumPlan: 'pro' },
  reports_advanced: { code: 'reports_advanced', label: 'Rapports avancés', description: 'Comparez vos revenus, prestations et périodes.', minimumPlan: 'pro' },
  reports_export: { code: 'reports_export', label: 'Exports CSV et PDF', description: 'Partagez vos données avec votre comptable ou votre équipe.', minimumPlan: 'pro' },
  online_booking: { code: 'online_booking', label: 'Réservations en ligne', description: 'Laissez vos clients réserver avant d\'arriver à la station.', minimumPlan: 'pro' },
  loyalty_program: { code: 'loyalty_program', label: 'Programme de fidélité', description: 'Transformez les visites en habitudes et fidélisez durablement.', minimumPlan: 'pro' },
  customer_history_advanced: { code: 'customer_history_advanced', label: 'Historique client enrichi', description: 'Retrouvez les véhicules, habitudes et prestations de chaque client.', minimumPlan: 'pro' },
  employee_management_advanced: { code: 'employee_management_advanced', label: 'Gestion avancée des employés', description: 'Pilotez les équipes, les responsabilités et la performance.', minimumPlan: 'pro' },
  multiple_stations: { code: 'multiple_stations', label: 'Multi-stations', description: 'Gérez plusieurs sites depuis un espace de pilotage unique.', minimumPlan: 'business' },
  consolidated_dashboard: { code: 'consolidated_dashboard', label: 'Dashboard consolidé', description: 'Comparez vos stations et prenez des décisions à l\'échelle du réseau.', minimumPlan: 'business' },
  advanced_permissions: { code: 'advanced_permissions', label: 'Permissions avancées', description: 'Adaptez les accès à votre organisation et à vos métiers.', minimumPlan: 'business' },
  audit_log: { code: 'audit_log', label: 'Journal d\'audit', description: 'Tracez les actions sensibles et sécurisez votre exploitation.', minimumPlan: 'business' },
  api_access: { code: 'api_access', label: 'API et intégrations', description: 'Connectez LavageAuto à vos outils métier.', minimumPlan: 'business' },
  scheduled_reports: { code: 'scheduled_reports', label: 'Rapports planifiés', description: 'Recevez automatiquement vos indicateurs par e-mail.', minimumPlan: 'business' },
  priority_support: { code: 'priority_support', label: 'Support prioritaire', description: 'Obtenez une assistance accélérée quand votre activité l\'exige.', minimumPlan: 'pro' },
}

const PLAN_RANK: Record<PlanCode, number> = { free: 0, pro: 1, business: 2 }

export function normalizePlanCode(code: string | undefined | null): PlanCode {
  if (code === 'pro') return 'pro'
  if (code === 'business' || code === 'reseau') return 'business'
  return 'free'
}

export function minimumPlanLabel(plan: PlanCode): string {
  return plan === 'business' ? 'Business' : plan === 'pro' ? 'Pro' : 'Free'
}

export function hasFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  if (!subscription || ['expired', 'suspended', 'canceled'].includes(subscription.status)) return false
  if (subscription.features && feature in subscription.features) return subscription.features[feature] === true
  return PLAN_RANK[normalizePlanCode(subscription.plan_code)] >= PLAN_RANK[FEATURE_CATALOG[feature].minimumPlan]
}

export function featureDefinition(feature: FeatureCode): FeatureDefinition {
  return FEATURE_CATALOG[feature]
}

export function hasPlanAtLeast(subscription: Subscription | null | undefined, plan: PlanCode): boolean {
  if (!subscription || ['expired', 'suspended', 'canceled'].includes(subscription.status)) return false
  return PLAN_RANK[normalizePlanCode(subscription.plan_code)] >= PLAN_RANK[plan]
}

export function getLimit(subscription: Subscription | null | undefined, limit: LimitCode): { used: number; max: number; remaining: number | null; reached: boolean } {
  const used = limit === 'stations' ? subscription?.usage.stations ?? 0 : limit === 'employees' ? subscription?.usage.employees ?? 0 : subscription?.usage.wash_orders ?? 0
  const max = limit === 'stations' ? subscription?.max_stations ?? 0 : limit === 'employees' ? subscription?.max_employees ?? 0 : subscription?.max_wash_orders_month ?? 0
  return { used, max, remaining: max > 0 ? Math.max(max - used, 0) : null, reached: max > 0 && used >= max }
}

export function upgradePlanFor(feature: FeatureCode): PlanCode {
  return FEATURE_CATALOG[feature].minimumPlan
}

export function upgradePlanLabel(feature: FeatureCode): string {
  return `Passer au ${minimumPlanLabel(upgradePlanFor(feature))}`
}

export function featureCatalog(): FeatureDefinition[] {
  return Object.values(FEATURE_CATALOG)
}

export function planFeatures(plan: PlanCode): FeatureCode[] {
  return featureCatalog().filter((feature) => PLAN_RANK[plan] >= PLAN_RANK[feature.minimumPlan]).map((feature) => feature.code)
}

export function canCreateWithinLimit(subscription: Subscription | null | undefined, limit: LimitCode, amount = 1): boolean {
  const quota = getLimit(subscription, limit)
  return quota.max === 0 || quota.used + amount <= quota.max
}

export const PLAN_LABELS: Record<PlanCode, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
}

export const PLAN_CODES: PlanCode[] = ['free', 'pro', 'business']

export function isSubscriptionUsable(subscription: Subscription | null | undefined): boolean {
  return Boolean(subscription && ['trialing', 'active', 'past_due'].includes(subscription.status))
}

export function entitlementReason(feature: FeatureCode): string {
  const definition = featureDefinition(feature)
  return `${definition.label} est disponible à partir du plan ${minimumPlanLabel(definition.minimumPlan)}.`
}

export function isPlanCode(value: string): value is PlanCode {
  return value === 'free' || value === 'pro' || value === 'business'
}

export function planRank(code: string): number {
  return PLAN_RANK[normalizePlanCode(code)]
}

export function comparePlans(left: string, right: string): number {
  return planRank(left) - planRank(right)
}

export function hasExplicitFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return Boolean(subscription?.features && Object.prototype.hasOwnProperty.call(subscription.features, feature))
}

export function featureStatus(subscription: Subscription | null | undefined, feature: FeatureCode): 'enabled' | 'locked' | 'unavailable' {
  if (!subscription) return 'unavailable'
  return hasFeature(subscription, feature) ? 'enabled' : 'locked'
}

export function planFeatureMatrix(): Record<PlanCode, FeatureCode[]> {
  return { free: planFeatures('free'), pro: planFeatures('pro'), business: planFeatures('business') }
}

export function isQuotaNearLimit(subscription: Subscription | null | undefined, limit: LimitCode, threshold = 0.8): boolean {
  const quota = getLimit(subscription, limit)
  return quota.max > 0 && quota.used / quota.max >= threshold
}

export function subscriptionPlanLabel(subscription: Subscription | null | undefined): string {
  return subscription ? PLAN_LABELS[normalizePlanCode(subscription.plan_code)] : 'Aucun plan'
}

export function featureMinimumPlan(feature: FeatureCode): PlanCode {
  return FEATURE_CATALOG[feature].minimumPlan
}

export function featureIsBusinessOnly(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) === 'business'
}

export function featureIsProOrAbove(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) !== 'free'
}

export function featureCodesForPlan(plan: string): FeatureCode[] {
  return planFeatures(normalizePlanCode(plan))
}

export function planCanAccessFeature(plan: string, feature: FeatureCode): boolean {
  return PLAN_RANK[normalizePlanCode(plan)] >= PLAN_RANK[featureMinimumPlan(feature)]
}

export function subscriptionNeedsUpgrade(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return Boolean(subscription) && !hasFeature(subscription, feature)
}

export function getFeatureTitle(feature: FeatureCode): string {
  return featureDefinition(feature).label
}

export function getFeatureDescription(feature: FeatureCode): string {
  return featureDefinition(feature).description
}

export function getRequiredPlan(feature: FeatureCode): PlanCode {
  return featureDefinition(feature).minimumPlan
}

export function allFeatureCodes(): FeatureCode[] {
  return Object.keys(FEATURE_CATALOG) as FeatureCode[]
}

export function hasAnyFeature(subscription: Subscription | null | undefined, features: FeatureCode[]): boolean {
  return features.some((feature) => hasFeature(subscription, feature))
}

export function hasAllFeatures(subscription: Subscription | null | undefined, features: FeatureCode[]): boolean {
  return features.every((feature) => hasFeature(subscription, feature))
}

export function missingFeatures(subscription: Subscription | null | undefined, features: FeatureCode[]): FeatureCode[] {
  return features.filter((feature) => !hasFeature(subscription, feature))
}

export function requiredPlanForFeatures(features: FeatureCode[]): PlanCode {
  return features.reduce<PlanCode>((highest, feature) => comparePlans(featureMinimumPlan(feature), highest) > 0 ? featureMinimumPlan(feature) : highest, 'free')
}

export function hasFeatureFromPlanCode(planCode: string, feature: FeatureCode): boolean {
  return planCanAccessFeature(planCode, feature)
}

export function subscriptionFeatureSnapshot(subscription: Subscription | null | undefined): Record<FeatureCode, boolean> {
  return allFeatureCodes().reduce((snapshot, feature) => ({ ...snapshot, [feature]: hasFeature(subscription, feature) }), {} as Record<FeatureCode, boolean>)
}

export function featureUpgradeCopy(feature: FeatureCode): { title: string; description: string; cta: string } {
  const definition = featureDefinition(feature)
  return { title: `Débloquez ${definition.label}`, description: definition.description, cta: upgradePlanLabel(feature) }
}

export function isPlanHigherOrEqual(current: string, required: PlanCode): boolean {
  return planRank(current) >= PLAN_RANK[required]
}

export function planNameFromCode(code: string): string {
  return PLAN_LABELS[normalizePlanCode(code)]
}

export function featureKey(feature: FeatureCode): string {
  return `feature:${feature}`
}

export function quotaKey(limit: LimitCode): string {
  return `limit:${limit}`
}

export function isSubscriptionActive(subscription: Subscription | null | undefined): boolean {
  return isSubscriptionUsable(subscription)
}

export function planIncludesFeature(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function getPlanRank(plan: PlanCode): number {
  return PLAN_RANK[plan]
}

export function lowestPlanFor(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isFeatureLocked(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return !hasFeature(subscription, feature)
}

export function featureLabel(feature: FeatureCode): string {
  return FEATURE_CATALOG[feature].label
}

export function featureDescription(feature: FeatureCode): string {
  return FEATURE_CATALOG[feature].description
}

export function planLabel(plan: PlanCode): string {
  return PLAN_LABELS[plan]
}

export function allPlans(): PlanCode[] {
  return PLAN_CODES
}

export function defaultPlan(): PlanCode {
  return 'free'
}

export function hasBusinessAccess(subscription: Subscription | null | undefined): boolean {
  return hasPlanAtLeast(subscription, 'business')
}

export function hasProAccess(subscription: Subscription | null | undefined): boolean {
  return hasPlanAtLeast(subscription, 'pro')
}

export function hasFreeAccess(subscription: Subscription | null | undefined): boolean {
  return hasPlanAtLeast(subscription, 'free')
}

export function canUseFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function canUseLimit(subscription: Subscription | null | undefined, limit: LimitCode, amount = 1): boolean {
  return canCreateWithinLimit(subscription, limit, amount)
}

export function featureRequiresPlan(feature: FeatureCode): PlanCode {
  return FEATURE_CATALOG[feature].minimumPlan
}

export function planHasFeature(plan: PlanCode, feature: FeatureCode): boolean {
  return planIncludesFeature(plan, feature)
}

export function getEntitlement(feature: FeatureCode): FeatureDefinition {
  return FEATURE_CATALOG[feature]
}

export function listEntitlements(): FeatureDefinition[] {
  return featureCatalog()
}

export function isPlanFeatureEnabled(plan: PlanCode, feature: FeatureCode): boolean {
  return planHasFeature(plan, feature)
}

export function subscriptionHasFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function canAccess(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getUpgradePlan(feature: FeatureCode): PlanCode {
  return upgradePlanFor(feature)
}

export function isFreePlan(code: string): boolean {
  return normalizePlanCode(code) === 'free'
}

export function isProPlan(code: string): boolean {
  return normalizePlanCode(code) === 'pro'
}

export function isBusinessPlan(code: string): boolean {
  return normalizePlanCode(code) === 'business'
}

export function hasValidPlan(subscription: Subscription | null | undefined): boolean {
  return isSubscriptionUsable(subscription)
}

export function getPlanFeatures(plan: PlanCode): FeatureDefinition[] {
  return planFeatures(plan).map((feature) => FEATURE_CATALOG[feature])
}

export function getLockedFeatures(subscription: Subscription | null | undefined): FeatureDefinition[] {
  return featureCatalog().filter((feature) => !hasFeature(subscription, feature.code))
}

export function getEnabledFeatures(subscription: Subscription | null | undefined): FeatureDefinition[] {
  return featureCatalog().filter((feature) => hasFeature(subscription, feature.code))
}

export function getPlanForFeature(feature: FeatureCode): PlanCode {
  return featureDefinition(feature).minimumPlan
}

export function accessDecision(subscription: Subscription | null | undefined, feature: FeatureCode): { allowed: boolean; requiredPlan: PlanCode; reason: string } {
  return { allowed: hasFeature(subscription, feature), requiredPlan: featureMinimumPlan(feature), reason: entitlementReason(feature) }
}

export function isSubscriptionExpired(subscription: Subscription | null | undefined): boolean {
  return Boolean(subscription && ['expired', 'suspended', 'canceled'].includes(subscription.status))
}

export function getQuotaUsage(subscription: Subscription | null | undefined, limit: LimitCode): number {
  return getLimit(subscription, limit).used
}

export function getQuotaMax(subscription: Subscription | null | undefined, limit: LimitCode): number {
  return getLimit(subscription, limit).max
}

export function getQuotaRemaining(subscription: Subscription | null | undefined, limit: LimitCode): number | null {
  return getLimit(subscription, limit).remaining
}

export function quotaReached(subscription: Subscription | null | undefined, limit: LimitCode): boolean {
  return getLimit(subscription, limit).reached
}

export function planSupports(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function requiredPlanName(feature: FeatureCode): string {
  return minimumPlanLabel(featureMinimumPlan(feature))
}

export function featureGateMessage(feature: FeatureCode): string {
  return `${featureLabel(feature)} nécessite le plan ${requiredPlanName(feature)}.`
}

export function isFeatureAvailable(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function entitlementCodes(): FeatureCode[] {
  return allFeatureCodes()
}

export function planHasEntitlement(plan: PlanCode, feature: FeatureCode): boolean {
  return planHasFeature(plan, feature)
}

export function currentPlanCode(subscription: Subscription | null | undefined): PlanCode {
  return normalizePlanCode(subscription?.plan_code)
}

export function currentPlanRank(subscription: Subscription | null | undefined): number {
  return PLAN_RANK[currentPlanCode(subscription)]
}

export function isAtLeastPlan(subscription: Subscription | null | undefined, plan: PlanCode): boolean {
  return currentPlanRank(subscription) >= PLAN_RANK[plan]
}

export function isAboveFree(subscription: Subscription | null | undefined): boolean {
  return isAtLeastPlan(subscription, 'pro')
}

export function isBusiness(subscription: Subscription | null | undefined): boolean {
  return isAtLeastPlan(subscription, 'business')
}

export function getFeatureMinimumPlan(feature: FeatureCode): PlanCode {
  return FEATURE_CATALOG[feature].minimumPlan
}

export function featureIsEnabled(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getFeature(feature: FeatureCode): FeatureDefinition {
  return FEATURE_CATALOG[feature]
}

export function listPlanFeatures(plan: PlanCode): FeatureCode[] {
  return planFeatures(plan)
}

export function entitlementEnabled(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function isFeatureAllowed(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getPlanFeaturesByCode(code: string): FeatureCode[] {
  return planFeatures(normalizePlanCode(code))
}

export function currentPlanLabel(subscription: Subscription | null | undefined): string {
  return planNameFromCode(subscription?.plan_code ?? '')
}

export function requiredPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isFeatureIncluded(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function featureAvailability(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function planAllows(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionAllows(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function subscriptionPlan(subscription: Subscription | null | undefined): PlanCode {
  return normalizePlanCode(subscription?.plan_code)
}

export function featureRequiredPlan(feature: FeatureCode): PlanCode {
  return FEATURE_CATALOG[feature].minimumPlan
}

export function enabledFeatureCodes(subscription: Subscription | null | undefined): FeatureCode[] {
  return getEnabledFeatures(subscription).map((feature) => feature.code)
}

export function lockedFeatureCodes(subscription: Subscription | null | undefined): FeatureCode[] {
  return getLockedFeatures(subscription).map((feature) => feature.code)
}

export function access(feature: FeatureCode, subscription: Subscription | null | undefined): boolean {
  return hasFeature(subscription, feature)
}

export function entitlement(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function currentPlan(subscription: Subscription | null | undefined): PlanCode {
  return normalizePlanCode(subscription?.plan_code)
}

export function planMinimumForFeature(feature: FeatureCode): PlanCode {
  return featureDefinition(feature).minimumPlan
}

export function isFeatureInPlan(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function hasAccessToFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getFeatureGate(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function isPlanActive(subscription: Subscription | null | undefined): boolean {
  return isSubscriptionUsable(subscription)
}

export function planForFeature(feature: FeatureCode): PlanCode {
  return featureDefinition(feature).minimumPlan
}

export function plansForFeature(feature: FeatureCode): PlanCode[] {
  const minimum = PLAN_RANK[featureMinimumPlan(feature)]
  return PLAN_CODES.filter((plan) => PLAN_RANK[plan] >= minimum)
}

export function featureGate(feature: FeatureCode, subscription: Subscription | null | undefined): { allowed: boolean; requiredPlan: PlanCode } {
  return { allowed: hasFeature(subscription, feature), requiredPlan: featureMinimumPlan(feature) }
}

export function subscriptionPlanCode(subscription: Subscription | null | undefined): PlanCode {
  return normalizePlanCode(subscription?.plan_code)
}

export function getPlanCode(subscription: Subscription | null | undefined): PlanCode {
  return subscriptionPlanCode(subscription)
}

export function isOnPlan(subscription: Subscription | null | undefined, plan: PlanCode): boolean {
  return subscriptionPlanCode(subscription) === plan
}

export function maxAllowed(subscription: Subscription | null | undefined, limit: LimitCode): number {
  return getLimit(subscription, limit).max
}

export function currentUsage(subscription: Subscription | null | undefined, limit: LimitCode): number {
  return getLimit(subscription, limit).used
}

export function remainingQuota(subscription: Subscription | null | undefined, limit: LimitCode): number | null {
  return getLimit(subscription, limit).remaining
}

export function isQuotaExceeded(subscription: Subscription | null | undefined, limit: LimitCode, amount = 1): boolean {
  return !canCreateWithinLimit(subscription, limit, amount)
}

export function featureMinimumPlanLabel(feature: FeatureCode): string {
  return minimumPlanLabel(featureMinimumPlan(feature))
}

export function featureCta(feature: FeatureCode): string {
  return upgradePlanLabel(feature)
}

export function allFeatureDefinitions(): FeatureDefinition[] {
  return Object.values(FEATURE_CATALOG)
}

export function planEntitlements(plan: PlanCode): Record<FeatureCode, boolean> {
  return allFeatureCodes().reduce((result, feature) => ({ ...result, [feature]: planCanAccessFeature(plan, feature) }), {} as Record<FeatureCode, boolean>)
}

export function subscriptionEntitlements(subscription: Subscription | null | undefined): Record<FeatureCode, boolean> {
  return allFeatureCodes().reduce((result, feature) => ({ ...result, [feature]: hasFeature(subscription, feature) }), {} as Record<FeatureCode, boolean>)
}

export function shouldShowUpgrade(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return Boolean(subscription && !hasFeature(subscription, feature))
}

export function featureEntitlementCode(feature: FeatureCode): FeatureCode {
  return feature
}

export function normalizeSubscriptionPlan(subscription: Subscription | null | undefined): PlanCode {
  return normalizePlanCode(subscription?.plan_code)
}

export function supportsFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function requiredPlanForFeature(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function getRequiredPlanLabel(feature: FeatureCode): string {
  return minimumPlanLabel(requiredPlanForFeature(feature))
}

export function featureAccess(subscription: Subscription | null | undefined, feature: FeatureCode): { allowed: boolean; plan: PlanCode } {
  return { allowed: hasFeature(subscription, feature), plan: requiredPlanForFeature(feature) }
}

export function isPaidFeature(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) !== 'free'
}

export function isBusinessFeature(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) === 'business'
}

export function isProFeature(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) === 'pro'
}

export function isFreeFeature(feature: FeatureCode): boolean {
  return featureMinimumPlan(feature) === 'free'
}

export function accessMessage(feature: FeatureCode): string {
  return entitlementReason(feature)
}

export function featureUpgrade(feature: FeatureCode): { plan: PlanCode; label: string } {
  return { plan: featureMinimumPlan(feature), label: minimumPlanLabel(featureMinimumPlan(feature)) }
}

export function planFeatureCodes(plan: PlanCode): FeatureCode[] {
  return planFeatures(plan)
}

export function planFeatureDefinitions(plan: PlanCode): FeatureDefinition[] {
  return getPlanFeatures(plan)
}

export function featureDefinitions(): FeatureDefinition[] {
  return allFeatureDefinitions()
}

export function isFeatureAvailableForPlan(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function isFeatureAvailableForSubscription(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function entitlementForFeature(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function featurePlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function planIsSufficient(plan: string, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionIsSufficient(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function featureLocked(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return !hasFeature(subscription, feature)
}

export function featureUnlocked(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function minimumPlanForFeature(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function featureRequires(feature: FeatureCode): string {
  return minimumPlanLabel(featureMinimumPlan(feature))
}

export function getFeaturePlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isSubscriptionTrial(subscription: Subscription | null | undefined): boolean {
  return subscription?.status === 'trialing'
}

export function isSubscriptionPastDue(subscription: Subscription | null | undefined): boolean {
  return subscription?.status === 'past_due'
}

export function isSubscriptionBlocked(subscription: Subscription | null | undefined): boolean {
  return isSubscriptionExpired(subscription)
}

export function activePlan(subscription: Subscription | null | undefined): PlanCode {
  return subscriptionPlanCode(subscription)
}

export function canAccessPlanFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function featureIsAvailable(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getMinimumPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function featurePlanLabel(feature: FeatureCode): string {
  return minimumPlanLabel(featureMinimumPlan(feature))
}

export function subscriptionCan(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function planSupportsFeature(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function currentSubscriptionPlan(subscription: Subscription | null | undefined): PlanCode {
  return subscriptionPlanCode(subscription)
}

export function isFeatureEntitled(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getPlanEntitlements(plan: PlanCode): Record<FeatureCode, boolean> {
  return planEntitlements(plan)
}

export function getSubscriptionEntitlements(subscription: Subscription | null | undefined): Record<FeatureCode, boolean> {
  return subscriptionEntitlements(subscription)
}

export function getFeatureAccess(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getFeatureMinimumPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function getFeatureUpgradePlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isUpgradeRequired(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return !hasFeature(subscription, feature)
}

export function getFeatureUpgradeLabel(feature: FeatureCode): string {
  return upgradePlanLabel(feature)
}

export function planContainsFeature(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionContainsFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function canUse(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getPlanFeaturesForCode(code: string): FeatureDefinition[] {
  return getPlanFeatures(normalizePlanCode(code))
}

export function isFeatureInSubscription(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function planTier(code: string): PlanCode {
  return normalizePlanCode(code)
}

export function featureTier(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function supports(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function isIncluded(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function featureGateCopy(feature: FeatureCode): { title: string; description: string; cta: string } {
  return featureUpgradeCopy(feature)
}

export function planName(plan: PlanCode): string {
  return planLabel(plan)
}

export function planCode(code: string): PlanCode {
  return normalizePlanCode(code)
}

export function planFeaturesMap(): Record<PlanCode, FeatureCode[]> {
  return planFeatureMatrix()
}

export function subscriptionIsActive(subscription: Subscription | null | undefined): boolean {
  return isSubscriptionActive(subscription)
}

export function featureIsLocked(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return isFeatureLocked(subscription, feature)
}

export function getFeatureRequiredPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function getFeatureUpgradeCta(feature: FeatureCode): string {
  return upgradePlanLabel(feature)
}

export function hasPlanFeature(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function currentPlanFeatures(subscription: Subscription | null | undefined): FeatureCode[] {
  return enabledFeatureCodes(subscription)
}

export function currentPlanLockedFeatures(subscription: Subscription | null | undefined): FeatureCode[] {
  return lockedFeatureCodes(subscription)
}

export function accessForFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function requiredTier(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function hasRequiredTier(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function planIncludes(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionIncludes(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function isFeatureEnabled(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function featureRequiresUpgrade(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return !hasFeature(subscription, feature)
}

export function planCodeLabel(code: string): string {
  return planNameFromCode(code)
}

export function getPlanLabel(code: string): string {
  return planNameFromCode(code)
}

export function getFeatureLabel(feature: FeatureCode): string {
  return featureLabel(feature)
}

export function getFeatureCopy(feature: FeatureCode): string {
  return featureDescription(feature)
}

export function currentPlanFeaturesMap(subscription: Subscription | null | undefined): Record<FeatureCode, boolean> {
  return subscriptionEntitlements(subscription)
}

export function isFeatureGranted(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getPlanMinimum(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function featureMinimumLabel(feature: FeatureCode): string {
  return minimumPlanLabel(featureMinimumPlan(feature))
}

export function planMeetsRequirement(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionMeetsRequirement(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getEntitlementCode(feature: FeatureCode): FeatureCode {
  return feature
}

export function getFeatureGateCopy(feature: FeatureCode): { title: string; description: string; cta: string } {
  return featureUpgradeCopy(feature)
}

export function featureIsInPlan(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionFeatureEnabled(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getPlanForEntitlement(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function canAccessEntitlement(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function entitlementLabel(feature: FeatureCode): string {
  return featureLabel(feature)
}

export function entitlementDescription(feature: FeatureCode): string {
  return featureDescription(feature)
}

export function entitlementRequiredPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function entitlementUpgradeCta(feature: FeatureCode): string {
  return upgradePlanLabel(feature)
}

export function getQuota(subscription: Subscription | null | undefined, limit: LimitCode) {
  return getLimit(subscription, limit)
}

export function hasQuota(subscription: Subscription | null | undefined, limit: LimitCode, amount = 1): boolean {
  return canCreateWithinLimit(subscription, limit, amount)
}

export function planEntitlementCodes(plan: PlanCode): FeatureCode[] {
  return planFeatures(plan)
}

export function subscriptionEntitlementCodes(subscription: Subscription | null | undefined): FeatureCode[] {
  return enabledFeatureCodes(subscription)
}

export function planHasEntitlementCode(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function subscriptionHasEntitlementCode(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function shouldLockFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return !hasFeature(subscription, feature)
}

export function shouldOfferUpgrade(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return shouldShowUpgrade(subscription, feature)
}

export function getPlanUpgradeCta(feature: FeatureCode): string {
  return upgradePlanLabel(feature)
}

export function entitlementPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function entitlementAccess(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function planEntitlementMap(plan: PlanCode): Record<FeatureCode, boolean> {
  return planEntitlements(plan)
}

export function subscriptionEntitlementMap(subscription: Subscription | null | undefined): Record<FeatureCode, boolean> {
  return subscriptionEntitlements(subscription)
}

export function isPlanEligible(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function isSubscriptionEligible(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function featureEntitlement(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function subscriptionAccess(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getEntitlementPlan(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isFeatureGrantedForPlan(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function isFeatureGrantedForSubscription(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getCurrentPlan(subscription: Subscription | null | undefined): PlanCode {
  return subscriptionPlanCode(subscription)
}

export function getCurrentPlanLabel(subscription: Subscription | null | undefined): string {
  return currentPlanLabel(subscription)
}

export function getEntitlement(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function planMinimum(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function featureAccessAllowed(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getAccessDecision(subscription: Subscription | null | undefined, feature: FeatureCode) {
  return accessDecision(subscription, feature)
}

export function canAccessFeature(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getFeatureAccessDecision(subscription: Subscription | null | undefined, feature: FeatureCode) {
  return accessDecision(subscription, feature)
}

export function getPlanForFeatureCode(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function getFeatureMinimumPlanCode(feature: FeatureCode): PlanCode {
  return featureMinimumPlan(feature)
}

export function isFeatureAllowedForPlan(plan: PlanCode, feature: FeatureCode): boolean {
  return planCanAccessFeature(plan, feature)
}

export function isFeatureAllowedForSubscription(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}

export function getFeatureDefinition(feature: FeatureCode): FeatureDefinition {
  return featureDefinition(feature)
}

export function getPlanFeatureCodes(plan: PlanCode): FeatureCode[] {
  return planFeatures(plan)
}

export function getSubscriptionFeatureCodes(subscription: Subscription | null | undefined): FeatureCode[] {
  return enabledFeatureCodes(subscription)
}

export function canAccessFeatureCode(subscription: Subscription | null | undefined, feature: FeatureCode): boolean {
  return hasFeature(subscription, feature)
}
