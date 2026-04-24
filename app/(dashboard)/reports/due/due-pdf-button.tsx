'use client'

import { jsPDF } from 'jspdf'

type Row = {
  name: string
  period: { label: string }
  feeState: { remaining: number }
}

export default function DuePdfButton({
  tutorName,
  rows,
  asOfLabel,
}: {
  tutorName: string
  rows: Row[]
  asOfLabel: string
}) {
  function downloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    let y = margin
    doc.setFontSize(18)
    doc.text('Tuitionly — Pending fees', margin, y)
    y += 28
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`Tutor: ${tutorName}`, margin, y)
    y += 18
    doc.text(`As of: ${asOfLabel}`, margin, y)
    y += 18
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, y)
    y += 28
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    if (!rows.length) {
      doc.text('No pending students.', margin, y)
    } else {
      doc.setFont('helvetica', 'bold')
      doc.text('Student', margin, y)
      doc.text('Billing cycle', margin + 200, y)
      doc.text('Due (Rs)', margin + 400, y)
      y += 16
      doc.setFont('helvetica', 'normal')
      rows.forEach(r => {
        if (y > 760) {
          doc.addPage()
          y = margin
        }
        doc.text(r.name.slice(0, 40), margin, y)
        doc.text(r.period.label.slice(0, 42), margin + 200, y)
        doc.text(String(Math.round(r.feeState.remaining)), margin + 400, y)
        y += 18
      })
    }
    doc.save(`tuitionly-due-${asOfLabel.replace(/\s+/g, '-')}.pdf`)
  }

  if (!rows.length) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-10 cursor-not-allowed items-center rounded-lg border border-zinc-200 bg-zinc-100 px-4 text-sm font-medium text-zinc-400"
      >
        Download PDF
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={downloadPdf}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
    >
      Download PDF
    </button>
  )
}
