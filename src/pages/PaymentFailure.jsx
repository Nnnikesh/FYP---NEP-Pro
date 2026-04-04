import { Link, useNavigate } from 'react-router-dom'
import { XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export default function PaymentFailure() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
      <XCircle className="h-20 w-20 mx-auto text-destructive" />
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <p className="text-muted-foreground">
        Your eSewa payment was not completed. No amount has been charged.
        You can retry payment from your bookings dashboard.
      </p>
      <div className="flex flex-col gap-2">
        <Button className="w-full gap-2" onClick={() => navigate(-1)}>
          <RefreshCw className="h-4 w-4" />
          Go Back &amp; Retry
        </Button>
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link to="/dashboard/client">View My Bookings</Link>
        </Button>
      </div>
    </div>
  )
}
