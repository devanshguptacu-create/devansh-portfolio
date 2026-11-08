import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!supabase) { setExpired(true); return }
    let on = true
    supabase.auth.getSession().then(({ data }) => { if (on && data.session) setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => {
      if (on && s && ['PASSWORD_RECOVERY', 'SIGNED_IN', 'INITIAL_SESSION'].includes(ev)) setReady(true)
    })
    const t = setTimeout(() => { if (on) setExpired(true) }, 4000)
    return () => { on = false; clearTimeout(t); sub.subscription.unsubscribe() }
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (pw.length < 8) return setError('Password must be at least 8 characters.')
    if (pw !== pw2) return setError('Passwords do not match.')
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (err) return setError(err.message)
    setDone(true)
    setTimeout(() => navigate('/dashboard'), 1800)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo">DG<span>.</span></Link>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Choose a new password.</h1>
        {done ? (
          <p className="auth-success">Password updated. Taking you to your dashboard...</p>
        ) : ready ? (
          <form onSubmit={submit} className="auth-form">
            <label>New password
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            <label>Confirm password
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn auth-submit" disabled={busy}>{busy ? 'Saving...' : 'Update password'}</button>
          </form>
        ) : expired ? (
          <>
            <p className="auth-error">This reset link is invalid or has expired.</p>
            <Link to="/forgot" className="auth-back">Request a new link &rarr;</Link>
          </>
        ) : (
          <p className="auth-muted">Verifying your reset link...</p>
        )}
      </section>
    </main>
  )
}