/** Stored in `students.grade_level`; detail when value is `other`. */
export const GRADE_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Not set' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: `class_${i + 1}`,
    label: `Class ${i + 1}`,
  })),
  { value: 'college', label: 'College' },
  { value: 'jee_neet', label: 'JEE / NEET / competitive' },
  { value: 'arts_music', label: 'Arts / music / hobby' },
  { value: 'other', label: 'Other…' },
]

export function labelForGradeLevel(gradeLevel: string | null | undefined, gradeDetail: string | null | undefined) {
  if (!gradeLevel?.trim()) return null
  if (gradeLevel === 'other' && gradeDetail?.trim()) return gradeDetail.trim()
  const opt = GRADE_LEVEL_OPTIONS.find(o => o.value === gradeLevel)
  return opt?.label ?? gradeLevel
}

export type BillingMode = 'postpaid' | 'prepaid'

export function isBillingMode(s: string | null | undefined): s is BillingMode {
  return s === 'postpaid' || s === 'prepaid'
}
