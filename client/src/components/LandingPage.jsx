import './LandingPage.css'

function LandingPage({ onGetStarted, theme, onThemeToggle }) {
  const technologies = [
    {
      name: 'React',
      icon: '⚛️',
      description: 'Modern UI library for building interactive interfaces',
      color: '#61dafb'
    },
    {
      name: 'Node.js',
      icon: '🟢',
      description: 'JavaScript runtime for building scalable server applications',
      color: '#68a063'
    },
    {
      name: 'Express',
      icon: '🚂',
      description: 'Fast, minimalist web framework for Node.js',
      color: '#ffffff'
    },
    {
      name: 'Socket.IO',
      icon: '⚡',
      description: 'Real-time bidirectional event-based communication',
      color: '#25c2a0'
    },
    {
      name: 'MongoDB',
      icon: '🍃',
      description: 'NoSQL database for flexible data storage',
      color: '#4db33d'
    },
    {
      name: 'CSS Variables',
      icon: '🎨',
      description: 'Dynamic theming with custom CSS properties',
      color: '#ff6b9d'
    }
  ]

  const features = [
    {
      title: 'Real-Time Messaging',
      description: 'Instant message delivery with Socket.IO',
      icon: '💬'
    },
    {
      title: 'Private Chats',
      description: 'Secure one-on-one conversations',
      icon: '🔒'
    },
    {
      title: 'Multiple Rooms',
      description: 'Create and join different chat rooms',
      icon: '🏠'
    },
    {
      title: 'Dark/Light Theme',
      description: 'Futuristic theme switching',
      icon: '🌓'
    },
    {
      title: 'Offline Messages',
      description: 'Messages delivered when users come online',
      icon: '📭'
    },
    {
      title: 'Typing Indicators',
      description: 'See when others are typing',
      icon: '✍️'
    }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#hero-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--neon-cyan)" />
                  <stop offset="100%" stopColor="var(--neon-magenta)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="hero-title">ChatFlow</h1>
          <p className="hero-subtitle">Real-Time Communication Platform</p>
          <p className="hero-description">
            A modern chat application built with cutting-edge web technologies,
            featuring real-time messaging, private chats, and a beautiful futuristic UI.
          </p>
          <button onClick={onGetStarted} className="get-started-btn">
            <span>Get Started</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="technologies-section">
        <h2 className="section-title">Built With Modern Technologies</h2>
        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <div key={index} className="tech-card" style={{'--tech-color': tech.color}}>
              <div className="tech-icon">{tech.icon}</div>
              <h3 className="tech-name">{tech.name}</h3>
              <p className="tech-description">{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Chatting?</h2>
        <p className="cta-description">Join the conversation and experience real-time communication</p>
        <button onClick={onGetStarted} className="cta-btn">
          <span>Launch ChatFlow</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>
    </div>
  )
}

export default LandingPage
