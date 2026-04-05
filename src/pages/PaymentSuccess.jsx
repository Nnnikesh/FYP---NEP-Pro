import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const API = 'http://localhost:5001'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState('verifying') // verifying | success | error
  const [info, setInfo]   = useState(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      setState('error')
      setErrMsg('No payment data received from eSewa.')
      return
    }

    fetch(`${API}/api/payment/verify?data=${encodeURIComponent(data)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setState('success')
          setInfo(json)
        } else {
          setState('error')
          setErrMsg(json.error || 'Verification failed.')
        }
      })
      .catch(() => {
        setState('error')
        setErrMsg('Could not reach server to verify payment.')
      })
  }, [])

  if (state === 'verifying') {
    return (
      <div className="container mx-auto px-4 py-28 max-w-md text-center space-y-4">
        <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
        <p className="text-lg font-medium">Verifying your payment…</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <XCircle className="h-20 w-20 mx-auto text-destructive" />
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">{errMsg}</p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/dashboard/client">Go to My Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
      <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p className="text-muted-foreground">
        {info?.payment_type === 'deposit'
          ? '20% deposit received. The remaining 80% balance is due after the event.'
          : info?.payment_type === 'balance'
          ? 'Final 80% balance received. Your booking is fully paid.'
          : 'Your payment has been received via eSewa.'}
      </p>

      {info && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-left space-y-2 text-sm">
          {info.payment_type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-semibold capitalize">
                {info.payment_type === 'deposit' ? 'Deposit (20%)' : 'Balance (80%)'}
              </span>
            </div>
          )}
          {info.transaction_code && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-semibold">{info.transaction_code}</span>
            </div>
          )}
          {info.total_amount && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-green-600">NPR {info.total_amount}</span>
            </div>
          )}
          {info.booking_id && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking #</span>
              <span className="font-semibold">{info.booking_id}</span>
            </div>
          )}
        </div>
      )}

      <Button asChild className="w-full">
        <Link to="/dashboard/client">View My Bookings</Link>
      </Button>
    </div>
  )
}
