import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={`container ${styles.nav}`}>
          <div className={styles.logo}>
            <span className={styles.logoMark} aria-hidden>
              T
            </span>
            Tuitionly
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in →
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className="badge badge-purple" style={{ marginBottom: 24 }}>
            <span>✦</span> Built for India
          </div>
          <h1 className={styles.heroTitle}>
            Fee tracking<br />
            for <span className={styles.heroAccent}>home tutors</span>
          </h1>
          <p className={styles.heroSub}>
            See who paid this month, who is pending, and send a polite WhatsApp reminder in one tap.
            Cloud-backed — no lost registers.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Get started free
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See how it works
            </a>
          </div>
          <div className={styles.heroStats}>
            {[
              { value: 'OTP', label: 'Phone login' },
              { value: '5', label: 'Free students' },
              { value: 'wa.me', label: 'WhatsApp ready' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`container ${styles.heroPreview}`}>
          <div className={styles.mockDashboard}>
            <div className={styles.mockSidebar}>
              <div className={styles.mockLogo} aria-hidden>
                T
              </div>
              {['Dashboard', 'Students', 'Fees', 'Settings'].map(item => (
                <div key={item} className={`${styles.mockNavItem} ${item === 'Students' ? styles.mockNavActive : ''}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className={styles.mockMain}>
              <div className={styles.mockHeader}>
                <div className={styles.mockTitle} />
                <div className={styles.mockBtnPill} />
              </div>
              <div className={styles.mockTable}>
                {[
                  { w: '42%', status: 'done' },
                  { w: '58%', status: 'pending' },
                  { w: '36%', status: 'done' },
                  { w: '52%', status: 'processing' },
                  { w: '48%', status: 'done' },
                ].map((row, i) => (
                  <div key={i} className={styles.mockRow}>
                    <div className={styles.mockCell} style={{ width: row.w }} />
                    <div className={`${styles.mockBadge} ${styles['mockBadge_' + row.status]}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className="badge badge-purple">Features</div>
            <h2 className={styles.sectionTitle}>Everything a solo tutor needs</h2>
            <p className={styles.sectionSub}>
              No institute bloat — just fees, reminders, and a clear monthly picture on your phone.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className="badge badge-purple">How it works</div>
            <h2 className={styles.sectionTitle}>From signup to first reminder in minutes</h2>
          </div>
          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepConnector} />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className="badge badge-purple">Pricing</div>
            <h2 className={styles.sectionTitle}>Start free, upgrade when you grow</h2>
            <p className={styles.sectionSub}>Free tier includes up to 5 students. Paid plans unlock more seats and exports.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Ready to stop chasing fees on calls?</h2>
            <p className={styles.ctaSub}>Sign in with your mobile number — no password to remember.</p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Open Tuitionly →
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>
            <span className={styles.logoMark} aria-hidden>
              T
            </span>
            Tuitionly
          </div>
          <p className={styles.footerCopy}>© 2026 Tuitionly. tuitionly.in</p>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    icon: '📱',
    title: 'WhatsApp reminders',
    desc: 'One tap opens WhatsApp with a polite, editable message for each parent.',
  },
  {
    icon: '☁️',
    title: 'Cloud sync',
    desc: 'Your student list and payment history stay safe when you change phones.',
  },
  {
    icon: '📅',
    title: 'Join-date billing',
    desc: 'Monthly cycles follow when each student joined — not a rigid calendar month.',
  },
  {
    icon: '💸',
    title: 'Partial payments',
    desc: 'Record part payments and see the balance owed at a glance.',
  },
  {
    icon: '🔔',
    title: 'Paid vs pending',
    desc: 'Dashboard shows counts and a pending list so you know who to follow up with.',
  },
  {
    icon: '🔒',
    title: 'Private by design',
    desc: 'Row-level security in Postgres — each tutor only ever sees their own data.',
  },
]

const STEPS = [
  { title: 'Sign in with OTP', desc: 'Enter your Indian mobile number. We text you a code — no password.' },
  { title: 'Add your students', desc: 'Name, fee, parent contact, join date. Mark active or inactive anytime.' },
  { title: 'Mark fees monthly', desc: 'One tap paid, or enter a partial amount. History stays per student.' },
  { title: 'Remind on WhatsApp', desc: 'Use our wa.me link with a ready message — you send it from your own WhatsApp.' },
]
