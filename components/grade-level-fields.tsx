'use client'

import { useState } from 'react'
import { GRADE_LEVEL_OPTIONS } from '@/lib/student-fields'

export default function GradeLevelFields({
  defaultLevel = '',
  defaultDetail = '',
}: {
  defaultLevel?: string
  defaultDetail?: string
}) {
  const [level, setLevel] = useState(defaultLevel)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-[13px] font-medium text-zinc-600" htmlFor="grade_level">
          Class / level
        </label>
        <select
          id="grade_level"
          name="grade_level"
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
        >
          {GRADE_LEVEL_OPTIONS.map(o => (
            <option key={o.value || 'unset'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {level === 'other' && (
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[13px] font-medium text-zinc-600" htmlFor="grade_detail">
            Describe level
          </label>
          <input
            id="grade_detail"
            name="grade_detail"
            defaultValue={defaultDetail}
            placeholder="e.g. Phonics batch, Std 10 Gujarat board"
            className="flex h-11 w-full rounded-lg border border-zinc-200 px-3 text-[15px] outline-none ring-zinc-950 focus:ring-2"
          />
        </div>
      )}
    </div>
  )
}
