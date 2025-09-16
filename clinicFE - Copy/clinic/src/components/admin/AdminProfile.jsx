import React, { useState, useEffect } from 'react';
import './AdminProfile.css';

const AdminProfile = ({ admin }) => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone1: '',
    emergencyContactPhone2: '',
    streetAddress: '',
    barangay: '',
    municipality: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (admin) {
      fetchAdminProfile();
    }
  }, [admin]);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admins/${admin.adminId}`);
      if (response.ok) {
        const adminData = await response.json();
        setProfileData({
          firstName: adminData.firstName || '',
          lastName: adminData.lastName || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          dateOfBirth: adminData.dateOfBirth || '',
          emergencyContactName: adminData.emergencyContactName || '',
          emergencyContactRelationship: adminData.emergencyContactRelationship || '',
          emergencyContactPhone1: adminData.emergencyContactPhone1 || '',
          emergencyContactPhone2: adminData.emergencyContactPhone2 || '',
          streetAddress: adminData.streetAddress || '',
          barangay: adminData.barangay || '',
          municipality: adminData.municipality || ''
        });
      } else {
        setMessage('Failed to load profile information');
      }
    } catch (error) {
      setMessage('Unable to load profile. Please try again later.');
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
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

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      setMessage('Please correct the errors below');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Exclude dateOfBirth from the update payload
      const { dateOfBirth, ...updateData } = profileData;
      
      const response = await fetch(`http://localhost:3000/api/admins/${admin.adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Update localStorage with new admin data
        const updatedAdmin = { ...admin, ...profileData };
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Unable to update profile. Please try again later.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!profileData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!profileData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!profileData.emergencyContactRelationship.trim()) newErrors.emergencyContactRelationship = 'Emergency contact relationship is required';
    if (!profileData.emergencyContactPhone1.trim()) newErrors.emergencyContactPhone1 = 'Emergency contact phone is required';
    if (!profileData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!profileData.barangay.trim()) newErrors.barangay = 'Barangay is required';
    if (!profileData.municipality.trim()) newErrors.municipality = 'Municipality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setMessage('');
    fetchAdminProfile(); // Reset to original data
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <div className="admin-profile-avatar">
          <div className="admin-avatar-circle">
            <span>{profileData.firstName?.[0]}{profileData.lastName?.[0]}</span>
          </div>
        </div>
        <div className="admin-profile-title">
          <h1>Administrator Account Settings</h1>
          <p>Update your administrator account information accordingly.</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-profile-content">
        <div className="admin-profile-section">
          <div className="section-header">
            <h2>Basic Information</h2>
            {!isEditing && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          <div className="admin-profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className={errors.firstName ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span className="user-icon">👤</span>
                    <span>{profileData.firstName} {profileData.lastName}</span>
                  </div>
                )}
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              {isEditing ? (
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              ) : (
                <div className="form-group">
                  <label>Date of Birth</label>
                  <div className="form-display">
                    <span>{formatDate(profileData.dateOfBirth)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <div className="form-display">
                  <span className="email-icon">✉️</span>
                  <span>{profileData.email}</span>
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.phone}</span>
                  </div>
                )}
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            {isEditing && (
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <div className="form-display">
                    <span>{formatDate(profileData.dateOfBirth)}</span>
                  </div>
                </div>
                <div className="form-group">
                  {/* Empty space for alignment */}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="admin-profile-section">
          <h2>Emergency Contact Information</h2>
          
          <div className="admin-profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>In Case of Emergency Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={profileData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="Emergency Contact Name"
                    className={errors.emergencyContactName ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.emergencyContactName}</span>
                  </div>
                )}
                {errors.emergencyContactName && <span className="error-text">{errors.emergencyContactName}</span>}
              </div>

              <div className="form-group">
                <label>In Case of Emergency Relationship to Administrator</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={profileData.emergencyContactRelationship}
                    onChange={handleInputChange}
                    placeholder="Relationship"
                    className={errors.emergencyContactRelationship ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.emergencyContactRelationship}</span>
                  </div>
                )}
                {errors.emergencyContactRelationship && <span className="error-text">{errors.emergencyContactRelationship}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>In Case of Emergency Phone Number 1</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContactPhone1"
                    value={profileData.emergencyContactPhone1}
                    onChange={handleInputChange}
                    placeholder="09123456789"
                    className={errors.emergencyContactPhone1 ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.emergencyContactPhone1}</span>
                  </div>
                )}
                {errors.emergencyContactPhone1 && <span className="error-text">{errors.emergencyContactPhone1}</span>}
              </div>

              <div className="form-group">
                <label>In Case of Emergency Phone Number 2</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContactPhone2"
                    value={profileData.emergencyContactPhone2}
                    onChange={handleInputChange}
                    placeholder="09876543211"
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.emergencyContactPhone2 || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-profile-section">
          <h2>Contact Details</h2>
          
          <div className="admin-profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="streetAddress"
                    value={profileData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className={errors.streetAddress ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.streetAddress}</span>
                  </div>
                )}
                {errors.streetAddress && <span className="error-text">{errors.streetAddress}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Baranggay</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="barangay"
                    value={profileData.barangay}
                    onChange={handleInputChange}
                    placeholder="Barangay"
                    className={errors.barangay ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.barangay}</span>
                  </div>
                )}
                {errors.barangay && <span className="error-text">{errors.barangay}</span>}
              </div>

              <div className="form-group">
                <label>Municipality</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="municipality"
                    value={profileData.municipality}
                    onChange={handleInputChange}
                    placeholder="Municipality"
                    className={errors.municipality ? 'error' : ''}
                  />
                ) : (
                  <div className="form-display">
                    <span>{profileData.municipality}</span>
                  </div>
                )}
                {errors.municipality && <span className="error-text">{errors.municipality}</span>}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="admin-profile-actions">
            <button className="cancel-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
