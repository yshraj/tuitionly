'use client'

import { useState } from 'react'
import {
  FEE_PERIOD_OPTIONS,
  feeAmountHelp,
  feeAmountLabel,
  normalizeBillingInterval,
  type BillingIntervalMonths,
} from '@/lib/fee-period'

export default function FeeCadenceFields({
  defaultFeePeriodMonths = 1,
  defaultFeeAmount = 1500,
  feeInputId = 'monthly_fee',
}: {
  defaultFeePeriodMonths?: number
  defaultFeeAmount?: number
  feeInputId?: string
}) {
  const [interval, setInterval] = useState<BillingIntervalMonths>(normalizeBillingInterval(defaultFeePeriodMonths))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="fee_period_months">
          How often is the fee due?
        </label>
        <select
          id="fee_period_months"
          name="fee_period_months"
          value={interval}
          onChange={e => setInterval(normalizeBillingInterval(e.target.value))}
          className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
        >
          {FEE_PERIOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500">
          Each period starts from the student&apos;s join date (same logic as monthly, but longer gaps for sem / year).
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor={feeInputId}>
          {feeAmountLabel(interval)}
        </label>
        <input
          id={feeInputId}
          name="monthly_fee"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={defaultFeeAmount}
          className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
        />
        <p className="text-xs text-zinc-500">{feeAmountHelp(interval)}</p>
      </div>
    </div>
  )
}
