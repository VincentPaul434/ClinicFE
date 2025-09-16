import React from 'react';
import './homepage.css';

const Homepage = ({ onNavigate, onOpenLogin, onOpenStaffLogin }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleLogin = () => {
    onOpenLogin()
  }

  const services = [
    {
      icon: "🩺",
      title: "Medical Consultation",
      description: "Professional medical consultation services with experienced healthcare providers",
    },
    {
      icon: "📋",
      title: "Medical Certificates & Prescriptions",
      description: "Issuance of medical certificates and prescriptions for various needs",
    },
    {
      icon: "🔬",
      title: "Laboratory & Diagnostic Services",
      description: "Complete laboratory testing and diagnostic services for accurate health assessment",
    },
    {
      icon: "💻",
      title: "Online & Home Consultation",
      description: "Convenient remote consultation services from the comfort of your home",
    },
    {
      icon: "✂️",
      title: "Circumcision Services",
      description: "Safe and professional circumcision procedures with proper care",
    },
    {
      icon: "💉",
      title: "Insulin & Drainage Procedures",
      description: "Expert insulin administration and drainage procedures",
    },
    {
      icon: "👁️",
      title: "Cyst Removal",
      description: "Professional minor surgical procedures including cyst removal",
    },
    {
      icon: "🩹",
      title: "Wound Care & Suturing",
      description: "Comprehensive wound care and professional suturing services",
    },
  ]

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Wahing Medical Clinic</h2>
          </div>
          <div className="nav-menu">
            <button className="nav-link" onClick={() => scrollToSection("about")}>
              About
            </button>
            <button className="nav-link" onClick={() => scrollToSection("services")}>
              Services
            </button>
            <button className="nav-link" onClick={handleLogin}>
              Book Appointment
            </button>
            <button className="nav-link login-btn" onClick={handleLogin}>
              Log In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img
            src="/placeholder.svg?height=800&width=1200"
            alt="Medical professional using tablet - healthcare technology background"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Medical services that you can trust</h1>
            <p>Your health is our priority — book and manage appointments with ease</p>
            <div className="clinic-hours">
              <p>
                <strong>Clinic Hours:</strong> Mon-Sat, 8:00 AM - 5:00 PM
              </p>
            </div>
            <div>
              <button className="cta-button" onClick={() => scrollToSection("services")}>
                View Services
              </button>
              <button className="cta-button secondary" onClick={handleLogin}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2>Available Services</h2>
          <p className="subtitle">Comprehensive healthcare services designed to meet all your medical needs</p>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Wahing Medical Services</h2>
              <p>
                At Wahing Medical Services, we are dedicated to providing accessible and compassionate healthcare to the
                residents of Cordova, Cebu, and its neighboring communities. Our clinic is committed to delivering
                quality medical care tailored to the unique needs of our patients.
              </p>

              <div className="mission-section">
                <h3>Our Mission</h3>
                <p>
                  To offer patient-centered healthcare services that prioritize the well-being and satisfaction of our
                  community.
                </p>
              </div>

              <div className="services-section-about">
                <h3>Our Commitment</h3>
                <p>
                  We provide a range of medical services designed to cater to various health needs, ensuring that our
                  patients receive comprehensive care under one roof.
                </p>
              </div>

              <div className="location-section">
                <h3>Our Location</h3>
                <p>Conveniently located in Gabi Road, Cordova, Cebu. Right in front of Phoenix fuel station.</p>
              </div>
            </div>

            <div className="about-image">
              <img
                src="/assets/wahing.jpg"
                alt="Dr. Jessieneth Stephen Wahing - Medical professional at Wahing Medical Clinic"
                className="doctor-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section-main">
        <div className="container">
          <h2>Get In Touch</h2>
          <p className="subtitle">Ready to schedule your appointment? Contact us today.</p>

          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <p>0995 865 987</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <h3>Email</h3>
              <p>wahing@theclinic.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🌐</div>
              <h3>Website</h3>
              <p>www.wahing.com</p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="cta-button" onClick={handleLogin}>
              Book Your Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <h3>Wahing Medical Clinic</h3>
            <p>Providing quality healthcare services to the Cordova community</p>
            <div className="footer-contact">
              <span>© 2024 Wahing Medical Clinic</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage

