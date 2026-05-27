import { useEffect, useState } from 'react'

type AuthRouteLoadingProps = {
  message: string
  delayMs?: number
}

export function AuthRouteLoading({
  message,
  delayMs = 250,
}: AuthRouteLoadingProps) {
  const [shouldShow, setShouldShow] = useState(delayMs <= 0)

  useEffect(() => {
    if (delayMs <= 0) {
      setShouldShow(true)
      return
    }

    setShouldShow(false)

    const timeoutId = window.setTimeout(() => {
      setShouldShow(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delayMs, message])

  if (!shouldShow) {
    return null
  }

  return (
    <div
      style={{
        borderRadius: '24px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #d8e3ef',
        color: '#49627f',
      }}
    >
      {message}
    </div>
  )
}
