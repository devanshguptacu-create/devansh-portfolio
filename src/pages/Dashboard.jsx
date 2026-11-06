
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const emptyProject = {
  title: '',
  description: '',
  details: '',
  tech: '',
  status: 'Completed',
  image_url: '',
  demo_url: '',
  github_url: '',
  published: true,
  sort_order: 0,
}

const emptySkill = {
  category: 'Programming',
  name: '',
  level_label: 'Beginner',
  visible: true,
  sort_order: 0,
}

const emptyCertification = {
  name: '',
  provider: '',
  issue_date: '',
  credential_url: '',
  image_url: '',
  visible: true,
}

export default function Dashboard() {
  const { user, profile, loading, isAdmin, signOut } = useAuth()

  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [certifications, setCertifications] = useState([])

  const [form, setForm] = useState(emptyProject)
  const [skillForm, setSkillForm] = useState(emptySkill)
  const [certForm, setCertForm] = useState(emptyCertification)
  const [certImageFile, setCertImageFile] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editingSkillId, setEditingSkillId] = useState(null)
  const [editingCertId, setEditingCertId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    else setProjects(data || [])
  }

  async function loadSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    else setSkills(data || [])
  }

  async function loadCertifications() {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('issue_date', { ascending: false })

    if (error) setError(error.message)
    else setCertifications(data || [])
  }

  async function loadAllData() {
    setError('')
    await Promise.all([
      loadProjects(),
      loadSkills(),
      loadCertifications(),
    ])
  }

  useEffect(() => {
    if (user && isAdmin) {
      loadAllData()
    }
  }, [user, isAdmin])

  if (loading) {
    return <main className="auth-page">Loading account...</main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  function updateProjectField(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function updateSkillField(e) {
    const { name, value, type, checked } = e.target
    setSkillForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function updateCertField(e) {
    const { name, value, type, checked } = e.target
    setCertForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // PROJECTS

  async function saveProject(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      details: form.details.trim() || null,
      tech: form.tech.split(',').map(x => x.trim()).filter(Boolean),
      status: form.status.trim() || 'Completed',
      image_url: form.image_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      github_url: form.github_url.trim() || null,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    }

    const result = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert(payload)

    setBusy(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setNotice(editingId ? 'Project updated successfully!' : 'Project added successfully!')
    setForm(emptyProject)
    setEditingId(null)
    await loadProjects()
  }

  function editProject(project) {
    setEditingId(project.id)
    setForm({
      title: project.title || '',
      description: project.description || '',
      details: project.details || '',
      tech: Array.isArray(project.tech) ? project.tech.join(', ') : '',
      status: project.status || 'Completed',
      image_url: project.image_url || '',
      demo_url: project.demo_url || '',
      github_url: project.github_url || '',
      published: project.published ?? true,
      sort_order: project.sort_order ?? 0,
    })

    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteProject(id) {
    if (!window.confirm('Delete this project permanently?')) return

    setError('')
    setNotice('')

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setNotice('Project deleted successfully!')
    await loadProjects()
  }

  // SKILLS

  async function saveSkill(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    const payload = {
      category: skillForm.category.trim(),
      name: skillForm.name.trim(),
      level_label: skillForm.level_label.trim(),
      visible: skillForm.visible,
      sort_order: Number(skillForm.sort_order) || 0,
    }

    const result = editingSkillId
      ? await supabase.from('skills').update(payload).eq('id', editingSkillId)
      : await supabase.from('skills').insert(payload)

    setBusy(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setNotice(editingSkillId ? 'Skill updated successfully!' : 'Skill added successfully!')
    setSkillForm(emptySkill)
    setEditingSkillId(null)
    await loadSkills()
  }

  function editSkill(skill) {
    setEditingSkillId(skill.id)
    setSkillForm({
      category: skill.category || 'Programming',
      name: skill.name || '',
      level_label: skill.level_label || 'Beginner',
      visible: skill.visible ?? true,
      sort_order: skill.sort_order ?? 0,
    })

    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteSkill(id) {
    if (!window.confirm('Delete this skill permanently?')) return

    setError('')
    setNotice('')

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setNotice('Skill deleted successfully!')
    await loadSkills()
  }

  // CERTIFICATIONS

  async function saveCertification(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    let imageUrl = certForm.image_url.trim() || null

    if (certImageFile) {
      const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      }

      const extension = extensions[certImageFile.type]

      if (!extension || certImageFile.size > 5 * 1024 * 1024) {
        setBusy(false)
        setError('Choose a JPG, PNG or WEBP image smaller than 5 MB.')
        return
      }

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('certificate-images')
        .upload(filePath, certImageFile, {
          contentType: certImageFile.type,
          upsert: false,
        })

      if (uploadError) {
        setBusy(false)
        setError(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from('certificate-images')
        .getPublicUrl(filePath)

      imageUrl = data.publicUrl
    }

    const payload = {
      name: certForm.name.trim(),
      provider: certForm.provider.trim(),
      issue_date: certForm.issue_date || null,
      credential_url: certForm.credential_url.trim() || null,
      image_url: imageUrl,
      visible: certForm.visible,
    }

    const result = editingCertId
      ? await supabase.from('certifications').update(payload).eq('id', editingCertId)
      : await supabase.from('certifications').insert(payload)

    setBusy(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setNotice(
      editingCertId
        ? 'Certificate updated successfully!'
        : 'Certificate added successfully!'
    )

    setCertForm(emptyCertification)
    setCertImageFile(null)
    setEditingCertId(null)
    await loadCertifications()
  }

  function editCertification(cert) {
    setEditingCertId(cert.id)
    setCertForm({
      name: cert.name || '',
      provider: cert.provider || '',
      issue_date: cert.issue_date || '',
      credential_url: cert.credential_url || '',
      image_url: cert.image_url || '',
      visible: cert.visible ?? true,
    })

    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteCertification(id) {
    if (!window.confirm('Delete this certificate permanently?')) return

    setError('')
    setNotice('')

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setNotice('Certificate deleted successfully!')
    await loadCertifications()
  }

  // VISITOR DASHBOARD

  if (!isAdmin) {
    return (
      <main className="admin-shell">
        <header className="admin-topbar">
          <Link to="/" className="admin-brand">DG<span>.</span></Link>
          <span className="admin-topbar-label">PORTFOLIO ACCOUNT</span>
          <button className="admin-signout" onClick={signOut}>Sign out</button>
        </header>
        <div className="visitor-panel">
          <div className="admin-kicker">VISITOR AREA</div>
          <h1>Welcome, {profile?.full_name || user.email?.split('@')[0]}.</h1>
          <p className="admin-subtitle">Your portfolio account is active.</p>
          <div className="visitor-details">
            <p><span>Account type</span><strong>Visitor</strong></p>
            <p><span>Email</span><strong>{user.email}</strong></p>
            <p><span>Account status</span><strong className="status-active">Authenticated</strong></p>
          </div>
          <Link to="/" className="admin-primary-link">View portfolio →</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">DG<span>.</span></Link>
        <div className="admin-side-label">WORKSPACE</div>
        <nav className="admin-side-nav">
          <button type="button" onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}><span>◫</span> Overview</button>
          <button type="button" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}><span>▣</span> Projects</button>
          <button type="button" onClick={() => document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })}><span>✳</span> Skills</button>
          <button type="button" onClick={() => document.getElementById("certifications")?.scrollIntoView({ behavior: "smooth" })}><span>♧</span> Certifications</button>
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-avatar">{(profile?.full_name || user.email || 'A').charAt(0).toUpperCase()}</div>
          <div className="admin-user-meta">
            <strong>{profile?.full_name || 'Administrator'}</strong>
            <span>Administrator</span>
          </div>
          <button className="admin-logout-icon" onClick={signOut} title="Sign out">↗</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-label">ADMINISTRATION / WORKSPACE</div>
            <div className="admin-topbar-title">Portfolio dashboard</div>
          </div>
          <div className="admin-top-actions">
            <span className="admin-live-dot">● Live workspace</span>
            <Link to="/" className="admin-view-site">View portfolio ↗</Link>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome" id="overview">
            <div>
              <div className="admin-kicker">YOUR CONTROL CENTER</div>
              <h1>Good to see you, {profile?.full_name?.split(' ')[0] || 'Devansh'}.</h1>
              <p>Manage your portfolio content, skills and achievements from one place.</p>
            </div>
            <button type="button" className="admin-refresh" onClick={loadAllData}>↻ Refresh data</button>
          </section>

          {notice && <div className="admin-alert admin-alert-success">✓ {notice}</div>}
          {error && <div className="admin-alert admin-alert-error">! {error}</div>}

          <section className="admin-stats">
            <article className="admin-stat-card">
              <span className="admin-stat-icon">▣</span>
              <span className="admin-stat-label">Total projects</span>
              <strong>{projects.length}</strong>
              <small>Portfolio entries</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon">✳</span>
              <span className="admin-stat-label">Total skills</span>
              <strong>{skills.length}</strong>
              <small>Skills in your profile</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon">♧</span>
              <span className="admin-stat-label">Certificates</span>
              <strong>{certifications.length}</strong>
              <small>Learning achievements</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon">◉</span>
              <span className="admin-stat-label">Account status</span>
              <strong className="admin-stat-status">Active</strong>
              <small>Administrator access</small>
            </article>
          </section>

          <section className="admin-manager-section" id="projects">
            <div className="admin-section-heading">
              <div>
                <div className="admin-kicker">PORTFOLIO CONTENT</div>
                <h2>Projects manager</h2>
                <p>Add, update and organize the projects displayed on your portfolio.</p>
              </div>
              <span className="admin-count">{projects.length} items</span>
            </div>

            <div className="admin-manager-grid">
              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <h3>{editingId ? 'Edit project' : 'Add a project'}</h3>
                  <span>{editingId ? 'EDIT MODE' : 'NEW ENTRY'}</span>
                </div>
                <form onSubmit={saveProject} className="project-admin-form admin-form">
                  <label>Project title</label>
                  <input name="title" value={form.title} onChange={updateProjectField} placeholder="Enter project title" required />
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={updateProjectField} required rows="3" placeholder="Short project description" />
                  <label>Project details</label>
                  <textarea name="details" value={form.details} onChange={updateProjectField} rows="3" placeholder="Additional details (optional)" />
                  <label>Project image URL</label>
                  <input name="image_url" value={form.image_url} onChange={updateProjectField} placeholder="https://..." />
                  <div className="admin-form-row">
                    <div><label>Live demo URL</label><input name="demo_url" value={form.demo_url} onChange={updateProjectField} placeholder="https://..." /></div>
                    <div><label>GitHub URL</label><input name="github_url" value={form.github_url} onChange={updateProjectField} placeholder="https://..." /></div>
                  </div>
                  <label>Technologies <small>(comma separated)</small></label>
                  <input name="tech" value={form.tech} onChange={updateProjectField} placeholder="React, JavaScript, Supabase" />
                  <div className="admin-form-row">
                    <div><label>Project status</label><input name="status" value={form.status} onChange={updateProjectField} /></div>
                    <div><label>Display order</label><input name="sort_order" type="number" value={form.sort_order} onChange={updateProjectField} /></div>
                  </div>
                  <label className="admin-check-row"><input name="published" type="checkbox" checked={form.published} onChange={updateProjectField} /> Publish project on portfolio</label>
                  <div className="admin-form-actions">
                    <button className="admin-submit" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Update project' : '+ Add project'}</button>
                    {editingId && <button type="button" className="admin-cancel" onClick={() => { setEditingId(null); setForm(emptyProject) }}>Cancel</button>}
                  </div>
                </form>
              </div>

              <div className="admin-panel admin-list-panel">
                <div className="admin-panel-heading"><h3>Saved projects</h3><span>{projects.length} TOTAL</span></div>
                <div className="admin-record-list">
                  {projects.length === 0 && <p className="admin-empty">No projects added yet.</p>}
                  {projects.map(project => (
                    <article className="admin-record" key={project.id}>
                      <div className="admin-record-icon">▣</div>
                      <div className="admin-record-body">
                        <strong>{project.title}</strong>
                        <p>{project.description}</p>
                        <div className="admin-record-meta">{project.published ? '● Published' : '○ Draft'} · {project.tech?.join(', ') || 'No technologies listed'}</div>
                      </div>
                      <div className="admin-record-actions">
                        <button type="button" onClick={() => editProject(project)}>Edit</button>
                        <button type="button" className="danger" onClick={() => deleteProject(project.id)}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-manager-section" id="skills">
            <div className="admin-section-heading">
              <div>
                <div className="admin-kicker">YOUR EXPERTISE</div>
                <h2>Skills manager</h2>
                <p>Keep your technical skills and proficiency levels up to date.</p>
              </div>
              <span className="admin-count">{skills.length} items</span>
            </div>
            <div className="admin-manager-grid">
              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <h3>{editingSkillId ? 'Edit skill' : 'Add a skill'}</h3>
                  <span>{editingSkillId ? 'EDIT MODE' : 'NEW ENTRY'}</span>
                </div>
                <form onSubmit={saveSkill} className="project-admin-form admin-form">
                  <label>Skill name</label>
                  <input name="name" value={skillForm.name} onChange={updateSkillField} placeholder="e.g. Python" required />
                  <label>Category</label>
                  <select name="category" value={skillForm.category} onChange={updateSkillField}>
                    <option>Programming</option><option>Frontend</option><option>Backend</option><option>AI & Machine Learning</option><option>Database</option><option>Tools & Platforms</option><option>Other</option>
                  </select>
                  <label>Skill level</label>
                  <select name="level_label" value={skillForm.level_label} onChange={updateSkillField}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Proficient</option>
                  </select>
                  <label>Display order</label>
                  <input name="sort_order" type="number" value={skillForm.sort_order} onChange={updateSkillField} />
                  <label className="admin-check-row"><input name="visible" type="checkbox" checked={skillForm.visible} onChange={updateSkillField} /> Show skill on portfolio</label>
                  <div className="admin-form-actions">
                    <button className="admin-submit" disabled={busy}>{busy ? 'Saving...' : editingSkillId ? 'Update skill' : '+ Add skill'}</button>
                    {editingSkillId && <button type="button" className="admin-cancel" onClick={() => { setEditingSkillId(null); setSkillForm(emptySkill) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-panel admin-list-panel">
                <div className="admin-panel-heading"><h3>Saved skills</h3><span>{skills.length} TOTAL</span></div>
                <div className="admin-record-list">
                  {skills.length === 0 && <p className="admin-empty">No skills added yet.</p>}
                  {skills.map(skill => (
                    <article className="admin-record" key={skill.id}>
                      <div className="admin-record-icon">✳</div>
                      <div className="admin-record-body">
                        <strong>{skill.name}</strong>
                        <p>{skill.category} · {skill.level_label}</p>
                        <div className="admin-record-meta">{skill.visible ? '● Visible on portfolio' : '○ Hidden from portfolio'}</div>
                      </div>
                      <div className="admin-record-actions">
                        <button type="button" onClick={() => editSkill(skill)}>Edit</button>
                        <button type="button" className="danger" onClick={() => deleteSkill(skill.id)}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-manager-section" id="certifications">
            <div className="admin-section-heading">
              <div>
                <div className="admin-kicker">LEARNING & ACHIEVEMENTS</div>
                <h2>Certifications manager</h2>
                <p>Upload certificate images and showcase your completed learning milestones.</p>
              </div>
              <span className="admin-count">{certifications.length} items</span>
            </div>
            <div className="admin-manager-grid">
              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <h3>{editingCertId ? 'Edit certificate' : 'Add a certificate'}</h3>
                  <span>{editingCertId ? 'EDIT MODE' : 'NEW ENTRY'}</span>
                </div>
                <form onSubmit={saveCertification} className="project-admin-form admin-form">
                  <label>Certificate name</label>
                  <input name="name" value={certForm.name} onChange={updateCertField} placeholder="e.g. Scientific Paper" required />
                  <label>Issuing organization</label>
                  <input name="provider" value={certForm.provider} onChange={updateCertField} placeholder="e.g. Coursera" required />
                  <label>Issue date</label>
                  <input type="date" name="issue_date" value={certForm.issue_date} onChange={updateCertField} />
                  <label>Credential URL</label>
                  <input type="url" name="credential_url" value={certForm.credential_url} onChange={updateCertField} placeholder="https://..." />
                  <label>Certificate image <small>JPG, PNG or WEBP · Max 5 MB</small></label>
                  <div className="admin-upload-box">
                    <span className="admin-upload-icon">↑</span>
                    <strong>{certImageFile ? certImageFile.name : 'Choose certificate image'}</strong>
                    <span>{certImageFile ? 'New image selected' : 'Select an image from your device'}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
                        setError('Choose a JPG, PNG or WEBP image smaller than 5 MB.')
                        e.target.value = ''
                        setCertImageFile(null)
                        return
                      }
                      setError('')
                      setCertImageFile(file)
                    }} />
                  </div>
                  {certForm.image_url && <p className="admin-help-text">A saved certificate image exists. Select a new file only if you want to replace it.</p>}
                  <label className="admin-check-row"><input type="checkbox" name="visible" checked={certForm.visible} onChange={updateCertField} /> Show certificate on portfolio</label>
                  <div className="admin-form-actions">
                    <button className="admin-submit" disabled={busy}>{busy ? 'Uploading & saving...' : editingCertId ? 'Update certificate' : '+ Add certificate'}</button>
                    {editingCertId && <button type="button" className="admin-cancel" onClick={() => { setEditingCertId(null); setCertForm(emptyCertification); setCertImageFile(null) }}>Cancel</button>}
                  </div>
                </form>
              </div>

              <div className="admin-panel admin-list-panel">
                <div className="admin-panel-heading"><h3>Saved certificates</h3><span>{certifications.length} TOTAL</span></div>
                <div className="admin-certificate-list">
                  {certifications.length === 0 && <p className="admin-empty">No certificates added yet.</p>}
                  {certifications.map(cert => (
                    <article className="admin-certificate-record" key={cert.id}>
                      <div className="admin-certificate-thumb">
                        {cert.image_url ? <img src={cert.image_url} alt={cert.name} /> : <span>♧</span>}
                      </div>
                      <div className="admin-certificate-body">
                        <strong>{cert.name}</strong>
                        <p>{cert.provider}</p>
                        <small>{cert.issue_date || 'Date not specified'} · {cert.visible ? 'Visible' : 'Hidden'}</small>
                        <div className="admin-record-actions">
                          <button type="button" onClick={() => editCertification(cert)}>Edit</button>
                          <button type="button" className="danger" onClick={() => deleteCertification(cert.id)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="admin-footer">DG. Portfolio Admin <span>·</span> Manage your digital presence</footer>
        </div>
      </div>
    </main>
  )
}