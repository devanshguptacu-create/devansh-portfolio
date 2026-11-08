import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) return setError('Supabase is not configured.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    const { error: err } = await resetPassword(email.trim())
    setBusy(false)
    // Same message whether or not the account exists (no account enumeration).
    if (err && /rate|too many|seconds/i.test(err.message)) return setError('Too many requests. Please wait a few minutes and try again.')
    setSent(true)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo">DG<span>.</span></Link>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Reset your password.</h1>
        {sent ? (
          <>
            <p className="auth-success">If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.</p>
            <Link to="/login" className="auth-back">&larr; Back to sign in</Link>
          </>
        ) : (
          <>
            <p className="auth-muted">Enter your account email and we will send you a link to choose a new password.</p>
            <form onSubmit={submit} className="auth-form" noValidate>
              <label>Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button className="btn auth-submit" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
            </form>
            <Link to="/login" className="auth-back">&larr; Back to sign in</Link>
          </>
        )}
      </section>
    </main>
  )
}