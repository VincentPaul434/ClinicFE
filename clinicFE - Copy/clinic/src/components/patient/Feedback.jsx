import React, { useState, useEffect } from 'react';
import './Feedback.css';

const Feedback = ({ patient }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  
  // Form data for new/edit feedback
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    isAnonymous: false
  });

  useEffect(() => {
    if (patient) {
      fetchFeedbacks();
    }
  }, [patient]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/patient/${patient.patientId}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else if (response.status === 404) {
        // No feedbacks found is not an error
        setFeedbacks([]);
      } else {
        setMessage('Failed to fetch feedbacks');
      }
    } catch (error) {
      setMessage('Error fetching feedbacks');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!formData.comment.trim()) {
      setMessage('Please provide a comment for your feedback');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const feedbackData = {
        patientId: patient.patientId,
        rating: parseInt(formData.rating),
        comment: formData.comment.trim(),
        isAnonymous: formData.isAnonymous
      };

      let response;
      if (editingFeedback) {
        // Update existing feedback
        response = await fetch(`http://localhost:3000/api/feedback/${editingFeedback.feedbackId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
      } else {
        // Create new feedback
        response = await fetch('http://localhost:3000/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
      }

      if (response.ok) {
        setMessage(editingFeedback ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
        closeModal();
        fetchFeedbacks(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      rating: feedback.rating,
      comment: feedback.comment,
      isAnonymous: feedback.isAnonymous || false
    });
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/feedback/${feedbackId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Feedback deleted successfully');
        fetchFeedbacks(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete feedback');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error:', error);
    }
  };

  const openNewFeedbackModal = () => {
    setEditingFeedback(null);
    setFormData({
      rating: 5,
      comment: '',
      isAnonymous: false
    });
    setIsModalOpen(true);
    setMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFeedback(null);
    setFormData({
      rating: 5,
      comment: '',
      isAnonymous: false
    });
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  const renderRatingSelect = () => {
    return (
      <div className="rating-select">
        <label htmlFor="rating">Rating *</label>
        <div className="rating-options">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className={`rating-option ${formData.rating == value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={formData.rating == value}
                onChange={handleInputChange}
              />
              <span className="rating-label">
                {renderStars(value)}
                <span className="rating-text">
                  {value === 1 && 'Very Poor'}
                  {value === 2 && 'Poor'}
                  {value === 3 && 'Average'}
                  {value === 4 && 'Good'}
                  {value === 5 && 'Excellent'}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>Feedback & Reviews</h1>
        <p>Share your experience with Wahing Medical Clinic</p>
        <button className="add-feedback-btn" onClick={openNewFeedbackModal}>
          Write a Review
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isLoading && !isModalOpen ? (
        <div className="loading">Loading feedbacks...</div>
      ) : (
        <div className="feedback-content">
          <div className="feedback-stats">
            <div className="stats-card">
              <h3>Your Reviews</h3>
              <div className="stats-number">{feedbacks.length}</div>
              <p>Total reviews submitted</p>
            </div>
            
            {feedbacks.length > 0 && (
              <div className="stats-card">
                <h3>Average Rating</h3>
                <div className="stats-number">
                  {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
                </div>
                <div className="average-stars">
                  {renderStars(Math.round(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length))}
                </div>
              </div>
            )}
          </div>

          <div className="feedback-list">
            <h2>Your Reviews ({feedbacks.length})</h2>
            
            {feedbacks.length === 0 ? (
              <div className="no-feedback">
                <div className="no-feedback-icon">📝</div>
                <p>You haven't written any reviews yet.</p>
                <button className="add-feedback-btn" onClick={openNewFeedbackModal}>
                  Write Your First Review
                </button>
              </div>
            ) : (
              <div className="feedback-items">
                {feedbacks.map((feedback) => (
                  <div key={feedback.feedbackId} className="feedback-item">
                    <div className="feedback-header-item">
                      <div className="feedback-rating">
                        {renderStars(feedback.rating)}
                        <span className="rating-number">({feedback.rating}/5)</span>
                      </div>
                      <div className="feedback-date">
                        {formatDate(feedback.createdAt)}
                      </div>
                    </div>
                    
                    <div className="feedback-comment">
                      <p>"{feedback.comment}"</p>
                    </div>

                    {feedback.isAnonymous && (
                      <div className="anonymous-indicator">
                        <span className="anonymous-badge">Anonymous Review</span>
                      </div>
                    )}
                    
                    <div className="feedback-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditFeedback(feedback)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteFeedback(feedback.feedbackId)}
                      >
                        Delete
                      </button>
                    </div>
                    
                    {feedback.updatedAt !== feedback.createdAt && (
                      <div className="feedback-updated">
                        <small>Last updated: {formatDate(feedback.updatedAt)}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h3>{editingFeedback ? 'Edit Your Review' : 'Write a Review'}</h3>
              <p>Share your experience with our medical services</p>
            </div>

            <div className="modal-body">
              {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="feedback-form">
                {renderRatingSelect()}

                <div className="form-group">
                  <label htmlFor="comment">Your Review *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Please share your experience with our clinic, staff, and services..."
                    rows="6"
                    required
                  />
                  <div className="character-count">
                    {formData.comment.length}/500 characters
                  </div>
                </div>

                <div className="form-group">
                  <div className="anonymous-option">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          isAnonymous: e.target.checked
                        }))}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">Submit feedback anonymously</span>
                    </label>
                    <p className="anonymous-note">
                      Anonymous feedback will not show your name publicly, but we may still use it to improve our services.
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="action-btn cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button 
                    className="action-btn submit-btn"
                    onClick={handleSubmitFeedback}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : (editingFeedback ? 'Update Review' : 'Submit Review')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
