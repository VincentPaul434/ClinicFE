import React, { useState } from 'react';
import './AdminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/admins/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Admin login successful!');
        // Store admin data with proper field mapping
        const adminData = {
          ...data.admin,
          // Ensure we have the correct adminId field
          adminId: data.admin.adminId || data.admin.id
        };
        localStorage.setItem('admin', JSON.stringify(adminData));
        if (rememberMe) {
          localStorage.setItem('rememberMeAdmin', 'true');
        }
        // Close modal and navigate to admin dashboard
        setTimeout(() => {
          onClose();
          onNavigate('adminDashboard');
        }, 1000);
      } else {
        setMessage(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Please contact the system administrator for password reset.');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>ADMIN LOGIN</h2>
          <p>Administrative access only</p>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-container">
                
                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="input-container">
                
                <input
                  type="password"
                  name="password"
                  placeholder="Admin Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="forgot-password" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="admin-login-btn">
              {isLoading ? 'LOGGING IN...' : 'ADMIN LOGIN'}
            </button>
          </form>

          <div className="modal-footer">
            <div className="admin-notice">
              <p>⚠️ This is a restricted area. Unauthorized access is prohibited.</p>
              <p>Contact system administrator for account issues.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
