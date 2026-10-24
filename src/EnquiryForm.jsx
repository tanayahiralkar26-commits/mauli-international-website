
import { useState } from 'react'
import { supabase } from './supabase'
import { useLanguage } from './LanguageContext'
import './EnquiryForm.css'

const initialForm = {
  customer_name: '',
  email: '',  
  company: '',
  product_name: '',
  quantity: '',
  destination_country: '',
  message: '',
}

export default function EnquiryForm() {
  const { t } = useLanguage()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [success, setSuccess] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function submitEnquiry(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback('')
    setSuccess(false)

    const payload = {
      customer_name: form.customer_name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      product_name: form.product_name.trim(),
      quantity: form.quantity.trim(),
      destination_country: form.destination_country.trim(),
      message: form.message.trim(),
      status: 'new',
    }

    try {
      const { error } = await supabase
        .from('quote_enquiries')
        .insert([payload])

      if (error) {
        setFeedback(`${t('enquiryError')} ${error.message}`)
        return
      }

      setSuccess(true)
      setFeedback(t('enquirySuccess'))
      setForm(initialForm)
    } catch {
      setFeedback(t('enquiryError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="enquiry-trigger"
        onClick={() => {
          setOpen(true)
          setFeedback('')
          setSuccess(false)
        }}
      >
        {t('formTrigger')} <span aria-hidden="true">↗</span>
      </button>

      {open && (
        <div
          className="enquiry-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            className="enquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-heading"
          >
            <button
              type="button"
              className="enquiry-close"
              aria-label={t('closeForm')}
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <p className="enquiry-eyebrow">MAULI INTERNATIONAL</p>

            <h2 id="enquiry-heading">{t('formTitle')}</h2>

            <p className="enquiry-intro">{t('formIntro')}</p>

            {feedback && (
              <div
                className={`enquiry-feedback ${
                  success ? 'is-success' : 'is-error'
                }`}
                role="status"
              >
                {feedback}
              </div>
            )}

            {!success && (
              <form className="enquiry-form" onSubmit={submitEnquiry}>
                <label>
                  {t('fullName')} *
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={updateField}
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  {t('businessEmail')} *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  {t('company')} 
                  <input
                    name="company"
                    value={form.company}
                    onChange={updateField}
                    autoComplete="organization"
                  />
                </label>

                <label>
                  {t('productInterest')} *
                  <input
                    name="product_name"
                    value={form.product_name}
                    onChange={updateField}
                    placeholder={t('productPlaceholder')}
                    required
                  />
                </label>

                <div className="enquiry-form-row">
                  <label>
                    {t('quantity')}
                    <input
                      name="quantity"
                      value={form.quantity}
                      onChange={updateField}
                      placeholder={t('quantityPlaceholder')}
                    />
                  </label>

                  <label>
                    {t('destination')}
                    <input
                      name="destination_country"
                      value={form.destination_country}
                      onChange={updateField}
                      placeholder={t('countryPlaceholder')}
                    />
                  </label>
                </div>

                <label>
                  {t('requirements')}
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    rows={4}
                    placeholder={t('messagePlaceholder')}
                  />
                </label>

                <button
                  className="enquiry-submit"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? t('sending') : t('submit')} <span>↗</span>
                </button>

                <p className="enquiry-privacy">{t('privacy')}</p>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}
