import React, { useState } from 'react';
import './staffRegister.css';

const StaffRegister = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone1: '',
    emergencyContactPhone2: '',
    streetAddress: '',
    barangay: '',
    municipality: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactRelationship.trim()) newErrors.emergencyContactRelationship = 'Emergency contact relationship is required';
    if (!formData.emergencyContactPhone1.trim()) newErrors.emergencyContactPhone1 = 'Emergency contact phone is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
    if (!formData.municipality.trim()) newErrors.municipality = 'Municipality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please correct the errors below');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Staff member registered successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          emergencyContactName: '',
          emergencyContactRelationship: '',
          emergencyContactPhone1: '',
          emergencyContactPhone2: '',
          streetAddress: '',
          barangay: '',
          municipality: ''
        });
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    onNavigate('home');
  };

  return (
    <div className="staff-register-container">
      <div className="staff-register-form">
        <div className="form-header">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h2>Staff Registration</h2>
          <p>Register new staff member for Wahing Medical Clinic</p>
        </div>
        
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="staff@wahingclinic.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="09123456789"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactName">Contact Name *</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={errors.emergencyContactName ? 'error' : ''}
                  placeholder="Emergency contact full name"
                />
                {errors.emergencyContactName && <span className="error-text">{errors.emergencyContactName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactRelationship">Relationship *</label>
                <input
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className={errors.emergencyContactRelationship ? 'error' : ''}
                  placeholder="Relationship to staff member"
                />
                {errors.emergencyContactRelationship && <span className="error-text">{errors.emergencyContactRelationship}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactPhone1">Primary Phone *</label>
                <input
                  type="tel"
                  id="emergencyContactPhone1"
                  name="emergencyContactPhone1"
                  value={formData.emergencyContactPhone1}
                  onChange={handleChange}
                  className={errors.emergencyContactPhone1 ? 'error' : ''}
                  placeholder="09123456789"
                />
                {errors.emergencyContactPhone1 && <span className="error-text">{errors.emergencyContactPhone1}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactPhone2">Secondary Phone</label>
                <input
                  type="tel"
                  id="emergencyContactPhone2"
                  name="emergencyContactPhone2"
                  value={formData.emergencyContactPhone2}
                  onChange={handleChange}
                  placeholder="09876543211"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="streetAddress">Street Address *</label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className={errors.streetAddress ? 'error' : ''}
                  placeholder="Complete street address"
                />
                {errors.streetAddress && <span className="error-text">{errors.streetAddress}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="barangay">Barangay *</label>
                <input
                  type="text"
                  id="barangay"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  className={errors.barangay ? 'error' : ''}
                  placeholder="Barangay"
                />
                {errors.barangay && <span className="error-text">{errors.barangay}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="municipality">Municipality *</label>
                <input
                  type="text"
                  id="municipality"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  className={errors.municipality ? 'error' : ''}
                  placeholder="Municipality"
                />
                {errors.municipality && <span className="error-text">{errors.municipality}</span>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Registering Staff...' : 'Register Staff Member'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRegister;
                 