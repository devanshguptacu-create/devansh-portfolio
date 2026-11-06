import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'

export default function AuthPage({ mode }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const register = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!isSupabaseConfigured) return setError('Supabase is not configured.')
    setBusy(true)
    try {
      const result = register
        ? await signUp(email, password, name)
        : await signIn(email, password)
      if (result.error) throw result.error
      if (register && !result.data.session) {
        setMessage('Registration successful! Please verify your email.')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    if (!isSupabaseConfigured) return setError('Supabase is not configured.')
    setBusy(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google login failed.')
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo">DG<span>.</span></Link>
        <p className="eyebrow">{register ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</p>
        <h1>{register ? 'Join the community.' : 'Sign in to continue.'}</h1>
        <p className="auth-muted">
          {register ? 'Create your visitor account.' : 'Access your portfolio account.'}
        </p>

        <button type="button" className="btn auth-submit"
          disabled={busy} onClick={handleGoogle}>
          {busy ? 'Please wait...' : 'Continue with Google'}
        </button>

        <p className="auth-muted" style={{ textAlign: 'center', margin: '18px 0' }}>
          — or continue with email —
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {register && (
            <label>Full name
              <input value={name} onChange={e => setName(e.target.value)}
                required maxLength={100} autoComplete="name" />
            </label>
          )}
          <label>Email
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              required autoComplete="email" />
          </label>
          <label>Password
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={6}
              autoComplete={register ? 'new-password' : 'current-password'} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}
          <button className="btn auth-submit" disabled={busy}>
            {busy ? 'Please wait...' : register ? 'Create account →' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-switch">
          {register ? 'Already registered? ' : "Don't have an account? "}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Register'}
          </Link>
        </p>
        <Link to="/" className="auth-back">← Back to portfolio</Link>
      </section>
    </main>
  )
}
