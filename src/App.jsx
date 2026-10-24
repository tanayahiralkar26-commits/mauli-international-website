import WhatsAppButton from "./WhatsAppButton";
import EnquiryForm from './EnquiryForm'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import './App.css'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from './LanguageContext'

const categoryOrder = [
  'Waste Water Treatment Chemicals',
  'Engineering Goods',
  'Spices',
  'Agricultural Products',
]

const categoryCopy = {
  en: {
    eyebrow: 'OUR COLLECTION',
    title: 'Explore by category',
    subtitle:
      'Four focused product divisions. Select a category to explore our catalogue and discuss your sourcing requirements.',
    view: 'Explore collection',
    back: 'All categories',
    products: 'Products in this collection',
    items: 'products',
    empty: 'No active products are available in this category yet.',
    all: 'Browse all categories',
    quote: 'Request a quote',
    detail: 'Product overview',
    categoryDescriptions: {
      'Waste Water Treatment Chemicals':
        'Chemical products for water and wastewater treatment requirements.',
      'Engineering Goods':
        'Industrial pipes, fittings, flanges and related engineering goods.',
      Spices:
        'Indian spices for international buyers, wholesale and food processing.',
      'Agricultural Products':
        'Indian agricultural commodities sourced according to buyer requirements.',
    },
  },
  hi: {
    eyebrow: 'हमारा संग्रह',
    title: 'श्रेणी के अनुसार देखें',
    subtitle: 'अपनी पसंद की श्रेणी चुनें और हमारे उत्पादों की सूची देखें।',
    view: 'उत्पाद देखें',
    back: 'सभी श्रेणियाँ',
    products: 'इस श्रेणी के उत्पाद',
    items: 'उत्पाद',
    empty: 'इस श्रेणी में अभी कोई सक्रिय उत्पाद उपलब्ध नहीं है।',
    all: 'सभी श्रेणियाँ देखें',
    quote: 'कोटेशन माँगें',
    detail: 'उत्पाद की जानकारी',
    categoryDescriptions: {
      'Waste Water Treatment Chemicals': 'जल और अपशिष्ट जल उपचार के लिए रासायनिक उत्पाद।',
      'Engineering Goods': 'औद्योगिक पाइप, फिटिंग, फ्लैंज और इंजीनियरिंग उत्पाद।',
      Spices: 'अंतरराष्ट्रीय खरीदारों के लिए भारतीय मसाले।',
      'Agricultural Products': 'खरीदार की आवश्यकताओं के अनुसार भारतीय कृषि उत्पाद।',
    },
  },
  ar: {
    eyebrow: 'مجموعتنا',
    title: 'استكشف حسب الفئة',
    subtitle: 'اختر فئة لاستكشاف منتجاتنا ومناقشة متطلبات التوريد.',
    view: 'استكشف المجموعة',
    back: 'جميع الفئات',
    products: 'منتجات هذه المجموعة',
    items: 'منتجات',
    empty: 'لا توجد منتجات نشطة متاحة في هذه الفئة حاليًا.',
    all: 'تصفح جميع الفئات',
    quote: 'طلب عرض سعر',
    detail: 'نظرة عامة على المنتج',
    categoryDescriptions: {
      'Waste Water Treatment Chemicals': 'مواد كيميائية لمعالجة المياه ومياه الصرف.',
      'Engineering Goods': 'أنابيب صناعية ووصلات وفلنجات ومنتجات هندسية.',
      Spices: 'توابل هندية للمشترين الدوليين.',
      'Agricultural Products': 'سلع زراعية هندية وفقًا لمتطلبات المشترين.',
    },
  },
  fr: {
    eyebrow: 'NOTRE COLLECTION',
    title: 'Explorer par catégorie',
    subtitle: 'Choisissez une catégorie pour découvrir nos produits et discuter de vos besoins.',
    view: 'Explorer la collection',
    back: 'Toutes les catégories',
    products: 'Produits de cette collection',
    items: 'produits',
    empty: 'Aucun produit actif dans cette catégorie pour le moment.',
    all: 'Voir toutes les catégories',
    quote: 'Demander un devis',
    detail: 'Présentation du produit',
    categoryDescriptions: {
      'Waste Water Treatment Chemicals': 'Produits chimiques pour le traitement de l’eau et des eaux usées.',
      'Engineering Goods': 'Tuyaux industriels, raccords, brides et produits techniques.',
      Spices: 'Épices indiennes pour les acheteurs internationaux.',
      'Agricultural Products': 'Produits agricoles indiens selon les besoins des acheteurs.',
    },
  },
  es: {
    eyebrow: 'NUESTRA COLECCIÓN',
    title: 'Explorar por categoría',
    subtitle: 'Elige una categoría para descubrir productos y comentar tus necesidades de suministro.',
    view: 'Explorar colección',
    back: 'Todas las categorías',
    products: 'Productos de esta colección',
    items: 'productos',
    empty: 'Todavía no hay productos activos en esta categoría.',
    all: 'Ver todas las categorías',
    quote: 'Solicitar cotización',
    detail: 'Información del producto',
    categoryDescriptions: {
      'Waste Water Treatment Chemicals': 'Productos químicos para el tratamiento de agua y aguas residuales.',
      'Engineering Goods': 'Tuberías industriales, accesorios, bridas y productos de ingeniería.',
      Spices: 'Especias indias para compradores internacionales.',
      'Agricultural Products': 'Productos agrícolas indios según los requisitos del comprador.',
    },
  },
}

const categoryNames = {
  en: {
    'Waste Water Treatment Chemicals': 'Waste Water Treatment Chemicals',
    'Engineering Goods': 'Engineering Goods',
    Spices: 'Spices',
    'Agricultural Products': 'Agricultural Products',
  },
  hi: {
    'Waste Water Treatment Chemicals': 'अपशिष्ट जल उपचार रसायन',
    'Engineering Goods': 'इंजीनियरिंग उत्पाद',
    Spices: 'मसाले',
    'Agricultural Products': 'कृषि उत्पाद',
  },
  ar: {
    'Waste Water Treatment Chemicals': 'كيماويات معالجة مياه الصرف',
    'Engineering Goods': 'المنتجات الهندسية',
    Spices: 'التوابل',
    'Agricultural Products': 'المنتجات الزراعية',
  },
  fr: {
    'Waste Water Treatment Chemicals': 'Produits chimiques de traitement des eaux usées',
    'Engineering Goods': 'Produits d’ingénierie',
    Spices: 'Épices',
    'Agricultural Products': 'Produits agricoles',
  },
  es: {
    'Waste Water Treatment Chemicals': 'Productos químicos para tratamiento de aguas',
    'Engineering Goods': 'Productos de ingeniería',
    Spices: 'Especias',
    'Agricultural Products': 'Productos agrícolas',
  },
}

function Homepage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { t, language } = useLanguage()

  const copy = categoryCopy[language] || categoryCopy.en
  const translatedCategoryNames = categoryNames[language] || categoryNames.en

  const detailLabels = {
    en: { view: 'View Product Details', close: 'Close', details: 'Product Details' },
    hi: { view: 'उत्पाद की जानकारी देखें', close: 'बंद करें', details: 'उत्पाद विवरण' },
    ar: { view: 'عرض تفاصيل المنتج', close: 'إغلاق', details: 'تفاصيل المنتج' },
    fr: { view: 'Voir les détails du produit', close: 'Fermer', details: 'Détails du produit' },
    es: { view: 'Ver detalles del producto', close: 'Cerrar', details: 'Detalles del producto' },
  }

  const labels = detailLabels[language] || detailLabels.en

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (error) {
        console.error('Could not load products:', error.message)
      } else {
        setProducts(data || [])
      }

      setLoadingProducts(false)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (!selectedProduct) return

    function handleEscape(event) {
      if (event.key === 'Escape') setSelectedProduct(null)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedProduct])

  const categoryData = useMemo(() => {
    return categoryOrder.map((category) => {
      const categoryProducts = products.filter(
        (product) => product.category === category
      )

      return {
        name: category,
        products: categoryProducts,
        image:
          categoryProducts.find((product) => product.image_url)?.image_url || '',
      }
    })
  }, [products])

  const visibleProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : []

  function getProductName(product) {
    return language === 'en'
      ? product.name
      : product[`name_${language}`] || product.name
  }

  function getProductDescription(product) {
    return language === 'en'
      ? product.description
      : product[`description_${language}`] || product.description
  }

  function getProductCategory(product) {
    return translatedCategoryNames[product.category] || product.category
  }

  function openCategory(category) {
    setSelectedCategory(category)
    window.setTimeout(() => {
      document.getElementById('category-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  }

  return (
    <main>
      <div className="announcement">
        <span>{t('announcement')}</span>
        <span>
          {t('announcementText')}
          <span className="announcement-arrow"> ↗</span>
        </span>
      </div>

      <header className="navbar">
        <a className="brand" href="#home" aria-label="Mauli International home">
          <span className="brand-symbol">M<span>.</span></span>
          <span className="brand-name">
            MAULI<span>INTERNATIONAL</span>
          </span>
        </a>

        <nav>
          <a href="#home">{t('home')}</a>
          <a href="#about">{t('about')}</a>
          <a href="#products">{t('products')} <span className="nav-plus">↗</span></a>
          <a href="#process">{t('approach')}</a>
          <LanguageSelector />
        </nav>

        <a className="nav-cta" href="#contact">
          {t('connect')} <span>↗</span>
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-image" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="eyebrow light">
            <span className="eyebrow-dot" />
            {t('heroEyebrow')}
          </div>

          <h1>
            {t('heroTitle')}<br />
            <em>{t('heroTitleSecond')}</em>
          </h1>

          <p className="hero-description">{t('heroText')}</p>

          <div className="hero-actions">
            <a className="button button-light" href="#products">
              {t('exploreProducts')} <span>↗</span>
            </a>
            <a className="text-link" href="#about">
              {t('discoverMauli')} <span>↓</span>
            </a>
          </div>
        </div>

        <div className="hero-bottom">
          <span>{t('proudlySourced')}</span>
          <span>{t('globalPartners')}</span>
          <span className="hero-index">01 / 04</span>
        </div>

        <div className="hero-stamp">
          <span>{t('india')}</span>
          <span className="stamp-star">✳</span>
          <span>{t('toWorld')}</span>
        </div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="section-label">
          <span>01</span> / {t('whoWeAre')}
        </div>

        <div className="intro-content">
          <h2>
            {t('aboutTitle')}<br />
            <span>{t('aboutTitleSecond')}</span>
          </h2>

          <div className="intro-copy">
            <p>{t('aboutText')}</p>
            <a className="dark-link" href="#process">
              {t('getToKnow')} <span>↗</span>
            </a>
          </div>
        </div>

        <div className="values-row">
          <div>
            <span className="value-number">01</span>
            <h3>{t('qualityMinded')}</h3>
            <p>{t('qualityText')}</p>
          </div>
          <div>
            <span className="value-number">02</span>
            <h3>{t('globallyFocused')}</h3>
            <p>{t('globalText')}</p>
          </div>
          <div>
            <span className="value-number">03</span>
            <h3>{t('relationshipLed')}</h3>
            <p>{t('relationshipText')}</p>
          </div>
        </div>
      </section>

      <section className="products-section section-pad" id="products">
        <div className="products-heading">
          <div>
            <div className="section-label">
              <span>02</span> / {t('whatWeOffer')}
            </div>
            <h2>
              {t('exploreOur')}<br />
              <em>{t('productWorld')}</em>
            </h2>
          </div>
          <p>{t('productsText')}</p>
        </div>

        {loadingProducts ? (
          <p>{t('loadingProducts')}</p>
        ) : (
          <>
            <div className="category-intro">
              <span className="category-eyebrow">{copy.eyebrow}</span>
              <h3>{copy.title}</h3>
              <p>{copy.subtitle}</p>
            </div>

            <div className="category-grid">
              {categoryData.map((category, index) => (
                <button
                  type="button"
                  className={`category-card ${
                    selectedCategory === category.name ? 'is-selected' : ''
                  }`}
                  key={category.name}
                  onClick={() => openCategory(category.name)}
                  style={
                    category.image
                      ? { '--category-image': `url("${category.image}")` }
                      : undefined
                  }
                >
                  <span className="category-card-number">
                    0{index + 1} / 04
                  </span>
                  <span className="category-card-image" aria-hidden="true" />
                  <span className="category-card-content">
                    <span className="category-card-count">
                      {category.products.length} {copy.items}
                    </span>
                    <span className="category-card-title">
                      {translatedCategoryNames[category.name] || category.name}
                    </span>
                    <span className="category-card-description">
                      {copy.categoryDescriptions[category.name]}
                    </span>
                    <span className="category-card-action">
                      {copy.view} <span aria-hidden="true">↗</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {selectedCategory && (
              <div className="category-products-panel" id="category-products">
                <div className="category-products-heading">
                  <div>
                    <span className="category-eyebrow">{copy.products}</span>
                    <h3>
                      {translatedCategoryNames[selectedCategory] || selectedCategory}
                    </h3>
                    <p>
                      {visibleProducts.length} {copy.items}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="category-back-button"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ← {copy.back}
                  </button>
                </div>

                {visibleProducts.length === 0 ? (
                  <p className="category-empty">{copy.empty}</p>
                ) : (
                  <div className="product-grid">
                    {visibleProducts.map((product, index) => (
                      <article className="product-card" key={product.id}>
                        <button
                          type="button"
                          className="product-image"
                          style={{
                            backgroundImage: product.image_url
                              ? `url("${product.image_url}")`
                              : 'none',
                          }}
                          onClick={() => setSelectedProduct(product)}
                          aria-label={`${labels.view}: ${getProductName(product)}`}
                        >
                          <span className="product-number">
                            {String(index + 1).padStart(2, '0')} /{' '}
                            {String(visibleProducts.length).padStart(2, '0')}
                          </span>
                          <span className="product-arrow">↗</span>
                        </button>

                        <div className="product-info">
                          <span className="product-category">
                            {getProductCategory(product)}
                          </span>
                          <h3>{getProductName(product)}</h3>
                          <p>{getProductDescription(product)}</p>

                          <button
                            type="button"
                            className="product-link product-link-button"
                            onClick={() => setSelectedProduct(product)}
                          >
                            {labels.view} <span>↗</span>
                          </button>

                          <button
                            type="button"
                            className="product-details-button"
                            onClick={() => setSelectedProduct(product)}
                          >
                            {labels.view}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="catalogue-note">
          {t('specificProduct')}{' '}
          <a href="#contact">{t('tellUs')} ↗</a>
        </div>
      </section>

      <section className="process section-pad" id="process">
        <div className="section-label">
          <span>03</span> / {t('mauliApproach')}
        </div>

        <div className="process-content">
          <h2>
            {t('processTitle')}<br />
            {t('understanding')}
          </h2>
          <p>{t('processText')}</p>
        </div>

        <div className="process-steps">
          <div>
            <span>01</span>
            <h3>{t('understand')}</h3>
            <p>{t('understandText')}</p>
          </div>
          <div>
            <span>02</span>
            <h3>{t('explore')}</h3>
            <p>{t('exploreText')}</p>
          </div>
          <div>
            <span>03</span>
            <h3>{t('connectStep')}</h3>
            <p>{t('connectText')}</p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-top">
          <div className="section-label light">
            <span>04</span> / {t('startConversation')}
          </div>

          <h2>
            {t('contactTitle')}<br />
            <em>{t('inMind')}</em>
          </h2>

          <p>{t('contactText')}</p>
          <EnquiryForm />
        </div>

        <div className="contact-decoration">
          M<span>.</span>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-symbol">M<span>.</span></span>
          <span className="brand-name">
            MAULI<span>INTERNATIONAL</span>
          </span>
        </a>
        <span>{t('footerText')}</span>
        <a href="#home">{t('backToTop')} ↑</a>
        <span className="copyright">
          © {new Date().getFullYear()} Mauli International
        </span>
      </footer>

      {selectedProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label={labels.close}
              title={labels.close}
            >
              ×
            </button>

            <span className="product-category">
              {getProductCategory(selectedProduct)}
            </span>

            <h2 id="product-modal-title">
              {getProductName(selectedProduct)}
            </h2>

            {selectedProduct.image_url && (
              <img
                className="product-modal-image"
                src={selectedProduct.image_url}
                alt={getProductName(selectedProduct)}
              />
            )}

            <h3>{copy.detail}</h3>

            <p className="product-modal-description">
              {getProductDescription(selectedProduct)}
            </p>

            <div className="product-modal-details">
              {selectedProduct[`details_${language}`] ||
                selectedProduct.details ||
                getProductDescription(selectedProduct)}
            </div>

            <a
              href="#contact"
              className="product-modal-enquire"
              onClick={() => setSelectedProduct(null)}
            >
              {copy.quote} ↗
            </a>
          </section>
        </div>
      )}
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setCheckingAuth(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setCheckingAuth(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

if (window.location.pathname === '/admin') {
  if (checkingAuth) {
    return <p style={{ padding: 30 }}>Checking secure access...</p>
  }

  return session ? <AdminDashboard /> : <AdminLogin />
}

return (
  <>
    <Homepage />
    <WhatsAppButton />
  </>
)
}

export default App
