import { useState } from "react"
import "./patientRegister.css"

const PatientRegister = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone1: "",
    emergencyContactPhone2: "",
    streetAddress: "",
    barangay: "",
    municipality: "",
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const steps = [
    { number: 1, title: "Personal Info", icon: "👤" },
    { number: 2, title: "Emergency Contact", icon: "🚨" },
    { number: 3, title: "Address", icon: "📍" },
    { number: 4, title: "Review", icon: "✅" },
  ]

  const relationshipOptions = [
    "Parent",
    "Spouse",
    "Sibling",
    "Child",
    "Relative",
    "Friend",
    "Guardian",
    "Other",
  ]

  // Removed unused barangayOptions variable

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required"
      } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number"
      }
      if (!formData.password.trim()) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number"
      }
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
      if (!formData.gender) newErrors.gender = "Gender is required"
    }

    if (step === 2) {
      if (!formData.emergencyContactName.trim())
        newErrors.emergencyContactName = "Emergency contact name is required"
      if (!formData.emergencyContactRelationship.trim())
        newErrors.emergencyContactRelationship = "Relationship is required"
      if (!formData.emergencyContactPhone1.trim()) {
        newErrors.emergencyContactPhone1 = "Primary phone is required"
      } else if (!/^[0-9+\-\s()]+$/.test(formData.emergencyContactPhone1)) {
        newErrors.emergencyContactPhone1 = "Please enter a valid phone number"
      }
    }

    if (step === 3) {
      if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required"
      if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required"
      if (!formData.municipality.trim()) newErrors.municipality = "Municipality is required"
    }

    if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      setMessage("")
    } else {
      setMessage("Please correct the errors below")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setMessage("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(4)) {
      setMessage("Please correct the errors below")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const { confirmPassword, agreeToTerms, ...submitData } = formData
      const response = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Registration successful! Welcome to Wahing Medical Clinic.")
        setTimeout(() => {
          onNavigate("home")
        }, 2000)
      } else {
        setMessage(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      setMessage("Unable to register. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    onNavigate("home")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Personal Information</h3>
              <p>Please provide your basic information</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "error" : ""}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "error" : ""}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  placeholder="your.email@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "error" : ""}
                  placeholder="+63 912 345 6789"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? "error" : ""}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? "error" : ""}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Emergency Contact</h3>
              <p>Please provide emergency contact information</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactName">
                  Contact Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={errors.emergencyContactName ? "error" : ""}
                  placeholder="Full name of emergency contact"
                />
                {errors.emergencyContactName && <span className="error-text">{errors.emergencyContactName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactRelationship">
                  Relationship <span className="required">*</span>
                </label>
                <select
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className={errors.emergencyContactRelationship ? "error" : ""}
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.emergencyContactRelationship && (
                  <span className="error-text">{errors.emergencyContactRelationship}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactPhone1">
                  Primary Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone1"
                  name="emergencyContactPhone1"
                  value={formData.emergencyContactPhone1}
                  onChange={handleChange}
                  className={errors.emergencyContactPhone1 ? "error" : ""}
                  placeholder="+63 912 345 6789"
                />
                {errors.emergencyContactPhone1 && (
                  <span className="error-text">{errors.emergencyContactPhone1}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactPhone2">Secondary Phone</label>
                <input
                  type="tel"
                  id="emergencyContactPhone2"
                  name="emergencyContactPhone2"
                  value={formData.emergencyContactPhone2}
                  onChange={handleChange}
                  placeholder="+63 912 345 6789 (optional)"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Address Information</h3>
              <p>Please provide your current address</p>
            </div>

            <div className="form-group">
              <label htmlFor="streetAddress">
                Street Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className={errors.streetAddress ? "error" : ""}
                placeholder="House number, street name"
              />
              {errors.streetAddress && <span className="error-text">{errors.streetAddress}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="barangay">
                  Barangay <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="barangay"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  className={errors.barangay ? "error" : ""}
                  placeholder="Enter barangay"
                />
                {errors.barangay && <span className="error-text">{errors.barangay}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="municipality">
                  Municipality <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="municipality"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  className={errors.municipality ? "error" : ""}
                  placeholder="e.g., Cordova"
                />
                {errors.municipality && <span className="error-text">{errors.municipality}</span>}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Review & Confirm</h3>
              <p>Please review your information before submitting</p>
            </div>

            <div className="review-section">
              <div className="review-card">
                <h4>Personal Information</h4>
                <div className="review-item">
                  <span>Name:</span>
                  <span>
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="review-item">
                  <span>Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="review-item">
                  <span>Phone:</span>
                  <span>{formData.phone}</span>
                </div>
                <div className="review-item">
                  <span>Date of Birth:</span>
                  <span>{formData.dateOfBirth}</span>
                </div>
                <div className="review-item">
                  <span>Gender:</span>
                  <span>{formData.gender}</span>
                </div>
              </div>

              <div className="review-card">
                <h4>Emergency Contact</h4>
                <div className="review-item">
                  <span>Name:</span>
                  <span>{formData.emergencyContactName}</span>
                </div>
                <div className="review-item">
                  <span>Relationship:</span>
                  <span>{formData.emergencyContactRelationship}</span>
                </div>
                <div className="review-item">
                  <span>Primary Phone:</span>
                  <span>{formData.emergencyContactPhone1}</span>
                </div>
                {formData.emergencyContactPhone2 && (
                  <div className="review-item">
                    <span>Secondary Phone:</span>
                    <span>{formData.emergencyContactPhone2}</span>
                  </div>
                )}
              </div>

              <div className="review-card">
                <h4>Address</h4>
                <div className="review-item">
                  <span>Street:</span>
                  <span>{formData.streetAddress}</span>
                </div>
                <div className="review-item">
                  <span>Barangay:</span>
                  <span>{formData.barangay}</span>
                </div>
                <div className="review-item">
                  <span>Municipality:</span>
                  <span>{formData.municipality}</span>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={errors.agreeToTerms ? "error" : ""}
                />
                <span className="checkmark"></span>
                I agree to the{" "}
                <a href="/terms" className="terms-link">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="terms-link">
                  Privacy Policy
                </a>
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="patient-register-container">
      <div className="register-header">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <div className="clinic-info">
          <h1>🏥 Wahing Medical Clinic</h1>
          <p>Patient Registration</p>
        </div>
      </div>

      <div className="register-content">
        {/* Progress Steps */}
        <div className="progress-container">
          <div className="progress-steps">
            {steps.map((step) => (
              <div key={step.number} className={`progress-step ${currentStep >= step.number ? "active" : ""}`}>
                <div className="step-circle">
                  <span>{currentStep > step.number ? "✓" : step.icon}</span>
                </div>
                <div className="step-info">
                  <span className="step-number">Step {step.number}</span>
                  <span className="step-title">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-container">
          {message && (
            <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
              <span>{message.includes("successful") ? "✅" : "⚠️"}</span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
                  ← Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn btn-success">
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      ✅ Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PatientRegister
  