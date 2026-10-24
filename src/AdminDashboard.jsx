
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [page, setPage] = useState('Overview')
  const [products, setProducts] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const emptyForm = {
    name: '',
    category: '',
    description: '',
    image_url: '',
    origin: 'India',
  }

  const [form, setForm] = useState(emptyForm)
const [imageFile, setImageFile] = useState(null)
const [imageUploading, setImageUploading] = useState(false)
  async function loadData() {
    setLoading(true)
    setMessage('')

    const [productResult, enquiryResult] = await Promise.all([
      supabase.from('products')
        .select('id, name, category, description, image_url, origin, is_active, created_at')
        .order('id', { ascending: false }),
      supabase.from('quote_enquiries')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (productResult.error) {
      setMessage('Products: ' + productResult.error.message)
    } else {
      setProducts(productResult.data || [])
    }

    if (enquiryResult.error) {
      setMessage((previous) =>
        [previous, 'Enquiries: ' + enquiryResult.error.message]
          .filter(Boolean).join(' | ')
      )
    } else {
      setEnquiries(enquiryResult.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function startNewProduct() {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setFormOpen(true)
    setMessage('')
  }

  function startEdit(product) {
    setEditingId(product.id)
    setImageFile(null)
    setForm({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      image_url: product.image_url || '',
      origin: product.origin || 'India',
    })
    setFormOpen(true)
    setMessage('')
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const imageUrl = await uploadProductImage()

      const payload = {
        ...form,
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        image_url: imageUrl || '',
        origin: form.origin.trim() || 'India',
      }

      const result = editingId
        ? await supabase.from('products')
            .update(payload).eq('id', editingId).select()
        : await supabase.from('products')
            .insert([payload]).select()

      if (result.error) {
        setMessage('Could not save product: ' + result.error.message)
      } else {
        setMessage(editingId ? 'Product updated successfully.' : 'Product added successfully.')
        setFormOpen(false)
        setEditingId(null)
        setForm(emptyForm)
        setImageFile(null)
        await loadData()
      }
    } catch (error) {
      setMessage('Could not upload image or save product: ' + (error?.message || 'Unknown error'))
    } finally {
      setSaving(false)
      setImageUploading(false)
    }
  }

  async function uploadProductImage() {
    if (!imageFile) return form.image_url

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Choose a JPG, PNG, or WEBP image.')
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image must be 5 MB or smaller.')
    }

    setImageUploading(true)

    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        upsert: false,
        contentType: imageFile.type,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async function toggleProduct(product) {
    setMessage('')

    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      setMessage('Could not update product: ' + error.message)
    } else {
      setMessage('Product visibility updated.')
      await loadData()
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return

    setMessage('')
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      setMessage('Could not delete product: ' + error.message)
    } else {
      setMessage('Product deleted.')
      await loadData()
    }
  }

  async function updateEnquiryStatus(enquiry, status) {
    setMessage('')

    const { error } = await supabase
      .from('quote_enquiries')
      .update({ status })
      .eq('id', enquiry.id)

    if (error) {
      setMessage('Could not update enquiry: ' + error.message)
    } else {
      setMessage('Enquiry status updated.')
      await loadData()
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(error.message)
    else window.location.assign('/admin')
  }

  const activeProducts = products.filter((product) => product.is_active).length
  const newEnquiries = enquiries.filter((item) => item.status === 'new').length

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">M</span>
          <div><h2>MAULI</h2><p>INTERNATIONAL</p></div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        {['Overview', 'Products', 'Enquiries'].map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? 'active' : ''}`}
            onClick={() => {
              setPage(item)
              setFormOpen(false)
              setMessage('')
            }}
          >
            <span>{item === 'Overview' ? '▦' : item === 'Products' ? '□' : '✉'}</span>
            {item}
          </button>
        ))}

        <div className="sidebar-bottom">
          <span className="status-dot" /> Admin workspace
          <p>Private management portal</p>
          <button className="nav-item" onClick={signOut}>↪ Sign out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">MAULI INTERNATIONAL / WORKSPACE</p>
            <h1>{page}</h1>
          </div>
          <button className="admin-refresh" onClick={loadData}>↻ Refresh</button>
        </header>

        {message && <div className="admin-message" role="status">{message}</div>}

        {loading ? (
          <p>Loading your business data...</p>
        ) : (
          <>
            {page === 'Overview' && (
              <>
                <section className="welcome-panel">
                  <div>
                    <p className="eyebrow">MANAGEMENT CONSOLE</p>
                    <h2>Your business, in one place.</h2>
                    <p>Manage your catalogue and customer enquiries from one workspace.</p>
                  </div>
                  <div className="welcome-symbol">M.</div>
                </section>

                <section className="admin-stats">
                  <article className="stat-card">
                    <p>Total products</p><h3>{products.length}</h3>
                    <span>Catalogue records</span>
                  </article>
                  <article className="stat-card">
                    <p>Active products</p><h3>{activeProducts}</h3>
                    <span>Visible on the public website</span>
                  </article>
                  <article className="stat-card">
                    <p>New enquiries</p><h3>{newEnquiries}</h3>
                    <span>Awaiting your response</span>
                  </article>
                </section>

                <section className="admin-section">
                  <h2>Manage your workspace</h2>
                  <div className="admin-action-grid">
                    <article className="action-card">
                      <span className="action-icon">↗</span>
                      <h3>Product catalogue</h3>
                      <p>Add products and update your existing catalogue.</p>
                      <button className="admin-action-button" onClick={() => setPage('Products')}>
                        Manage products →
                      </button>
                    </article>
                    <article className="action-card">
                      <span className="action-icon">✉</span>
                      <h3>Customer enquiries</h3>
                      <p>Review quote requests and track their status.</p>
                      <button className="admin-action-button" onClick={() => setPage('Enquiries')}>
                        View enquiries →
                      </button>
                    </article>
                  </div>
                </section>
              </>
            )}

            {page === 'Products' && (
              <section className="admin-section">
                <div className="admin-list-heading">
                  <div>
                    <p className="eyebrow">CATALOGUE MANAGEMENT</p>
                    <h2>Products ({products.length})</h2>
                  </div>
                  <button className="admin-primary-button" onClick={startNewProduct}>
                    + Add product
                  </button>
                </div>

                {formOpen && (
                  <form className="product-form" onSubmit={saveProduct}>
                    <h3>{editingId ? 'Edit product' : 'Add a product'}</h3>

                    <label>Product name *
                      <input required maxLength={150} value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </label>

                    <label>Category *
                      <input required maxLength={100} value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    </label>

                    <label>Description
                      <textarea rows={3} maxLength={2000} value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </label>

                    <label>Upload product image (JPG, PNG, or WEBP; max 5 MB)
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    {imageFile && (
                      <p className="image-upload-note">
                        Selected: {imageFile.name}
                      </p>
                    )}

                    <label>Or use an image URL
                      <input type="url" value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://..." />
                    </label>

                    <label>Origin
                      <input value={form.origin}
                        onChange={(e) => setForm({ ...form, origin: e.target.value })} />
                    </label>

                    <div className="product-form-actions">
                      <button className="admin-primary-button" disabled={saving || imageUploading}>
                        {imageUploading ? 'Uploading image...' : saving ? 'Saving...' : 'Save product'}
                      </button>
                      <button type="button" className="admin-secondary-button"
                        onClick={() => { setFormOpen(false); setImageFile(null); setMessage('') }}>Cancel</button>
                    </div>
                  </form>
                )}

                <div className="admin-product-list">
                  {products.map((product) => (
                    <article className="admin-product-row" key={product.id}>
                      <div className="admin-product-thumb">
                        {product.image_url
                          ? <img src={product.image_url} alt="" />
                          : <span>M.</span>}
                      </div>
                      <div className="admin-product-details">
                        <h3>{product.name}</h3>
                        <p>{product.category} · {product.origin || 'India'}</p>
                        <span className={product.is_active ? 'product-active' : 'product-inactive'}>
                          {product.is_active ? 'Active on website' : 'Hidden from website'}
                        </span>
                      </div>
                      <div className="admin-product-actions">
                        <button onClick={() => startEdit(product)}>Edit</button>
                        <button onClick={() => toggleProduct(product)}>
                          {product.is_active ? 'Hide' : 'Publish'}
                        </button>
                        <button className="danger-button" onClick={() => deleteProduct(product)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                  {products.length === 0 && <p>No products found.</p>}
                </div>
              </section>
            )}

            {page === 'Enquiries' && (
              <section className="admin-section">
                <p className="eyebrow">CUSTOMER RELATIONSHIPS</p>
                <h2>Customer enquiries ({enquiries.length})</h2>

                <div className="admin-enquiry-list">
                  {enquiries.map((item) => (
                    <article className="admin-enquiry-card" key={item.id}>
                      <div className="enquiry-card-top">
                        <div>
                          <h3>{item.customer_name}</h3>
                          <a href={`mailto:${item.email}`}>{item.email}</a>
                        </div>
                        <span className={`enquiry-status ${item.status}`}>{item.status}</span>
                      </div>
                      <p><strong>Product:</strong> {item.product_name}</p>
                      <p><strong>Company:</strong> {item.company || 'Not provided'}</p>
                      <p><strong>Quantity:</strong> {item.quantity || 'Not provided'}</p>
                      <p><strong>Destination:</strong> {item.destination_country || 'Not provided'}</p>
                      {item.message && <p><strong>Message:</strong> {item.message}</p>}
                      <p className="enquiry-date">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <label className="enquiry-status-control">
                        Update status
                        <select value={item.status}
                          onChange={(e) => updateEnquiryStatus(item, e.target.value)}>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>
                    </article>
                  ))}
                  {enquiries.length === 0 && <p>No customer enquiries yet.</p>}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="admin-footer">
          MAULI INTERNATIONAL <span>Private workspace</span>
        </footer>
      </main>
    </div>
  )
}
