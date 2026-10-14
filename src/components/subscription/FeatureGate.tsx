import type { ReactNode } from 'react'

import {
  featureDefinition,
  minimumPlanLabel,
  type FeatureCode,
  hasFeature,
  upgradePlanLabel,
} from '@/lib/entitlements'
import type { Subscription } from '@/types'

interface FeatureGateProps {
  subscription: Subscription | null | undefined
  feature: FeatureCode
  children: ReactNode
  fallback?: ReactNode
  onUpgrade?: () => void
}

export function FeatureGate({ subscription, feature, children, fallback, onUpgrade }: FeatureGateProps) {
  if (hasFeature(subscription, feature)) return <>{children}</>

  if (fallback) return <>{fallback}</>

  const definition = featureDefinition(feature)

  return (
    <section className="rounded-xl border border-line bg-surface p-4" aria-label={`${definition.label} verrouillé`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">{definition.label}</p>
          <p className="mt-1 text-sm text-ink-muted">{definition.description}</p>
          <p className="mt-2 text-xs font-medium text-brand">Disponible avec le plan {minimumPlanLabel(definition.minimumPlan)}.</p>
        </div>
        {onUpgrade ? (
          <button type="button" className="button button-secondary shrink-0" onClick={onUpgrade}>
            {upgradePlanLabel(feature)}
          </button>
        ) : null}
      </div>
    </section>
  )
}
