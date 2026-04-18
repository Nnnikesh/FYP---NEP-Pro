import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const API        = 'http://localhost:5001'
const COUNTDOWN  = 20   // seconds

// ── Inline SVG QR Code (eSewa demo placeholder) ───────────────────────────────
function EsewaQRCode() {
  // A hardcoded 21×21 QR-like grid with proper finder patterns
  const modules = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,0,1,1,0,1,1,1,0,0,1,0,0,1,0],
    [1,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1],
    [0,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,1,0,1,1,1],
  ]

  return (
    <div className="p-3 bg-white rounded-lg shadow-inner inline-block">
      <svg viewBox="0 0 21 21" width="168" height="168" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        {modules.map((row, y) =>
          row.map((cell, x) =>
            cell ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#1a1a1a" /> : null
          )
        )}
      </svg>
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function QRPaymentModal({ booking, depositAmount, token, onClose, onSuccess }) {
  const [phase, setPhase]         = useState('waiting')  // waiting | confirming | success | error
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [errMsg, setErrMsg]       = useState('')
  const confirmedRef              = useRef(false)

  // Countdown tick
  useEffect(() => {
    if (phase !== 'waiting') return
    if (countdown === 0) { confirmPayment(); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  const confirmPayment = async () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    setPhase('confirming')
    try {
      const res = await fetch(`${API}/api/payment/qr-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: booking.id }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error || 'Confirmation failed.'); setPhase('error'); return }
      setPhase('success')
      setTimeout(() => { onSuccess() }, 2500)
    } catch {
      setErrMsg('Could not reach server. Please try again.')
      setPhase('error')
    }
  }

  const progress = ((COUNTDOWN - countdown) / COUNTDOWN) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: '#60BB46' }}>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-wide">eSewa</span>
            <span className="text-white/80 text-sm">QR Payment</span>
          </div>
          {phase !== 'success' && (
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-5">

          {/* ── Success Screen ── */}
          {phase === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-20 w-20 mx-auto text-green-500 animate-bounce" />
              <div>
                <h2 className="text-xl font-bold">Payment Successful ✅</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  NPR {depositAmount.toLocaleString()} deposit confirmed
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to your bookings…
              </p>
            </div>
          )}

          {/* ── Error Screen ── */}
          {phase === 'error' && (
            <div className="text-center space-y-4 py-2">
              <AlertCircle className="h-14 w-14 mx-auto text-destructive" />
              <p className="text-sm text-destructive">{errMsg}</p>
              <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {/* ── Confirming ── */}
          {phase === 'confirming' && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 mx-auto animate-spin" style={{ color: '#60BB46' }} />
              <p className="font-medium">Confirming payment…</p>
            </div>
          )}

          {/* ── Waiting / QR Screen ── */}
          {phase === 'waiting' && (
            <>
              {/* Amount */}
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Deposit Amount (20%)</p>
                <p className="text-3xl font-bold" style={{ color: '#c2410c' }}>
                  NPR {depositAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Booking: {booking.business_name}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <EsewaQRCode />
              </div>

              {/* Instruction */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Scan with eSewa app to pay</p>
                <p className="text-xs text-muted-foreground">
                  eSewa ID: <span className="font-mono">9806800001</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: progress > 70 ? '#60BB46' : '#c2410c',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: '#60BB46' }}
                    />
                    Waiting for payment…
                  </span>
                  <span className="font-mono font-semibold" style={{ color: countdown <= 5 ? '#60BB46' : undefined }}>
                    {countdown}s
                  </span>
                </div>
              </div>

              {/* Manual confirm */}
              <button
                onClick={confirmPayment}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#60BB46' }}
              >
                I have paid — Confirm ✓
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Auto-confirms in {countdown} second{countdown !== 1 ? 's' : ''}. Demo mode — no real payment required.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
