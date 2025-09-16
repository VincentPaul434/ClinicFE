import React, { useState, useEffect } from 'react';
import './Reminders.css';

const Reminders = ({ patient }) => {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  useEffect(() => {
    if (patient) {
      fetchReminders();
    }
  }, [patient]);

  useEffect(() => {
    filterReminders();
  }, [reminders, searchTerm, filterStatus]);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/reminders/patient/${patient.patientId}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      } else {
        setMessage('Failed to fetch reminders');
      }
    } catch (error) {
      setMessage('Error fetching reminders');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReminders = () => {
    let filtered = reminders.filter(reminder => {
      const messageMatch = reminder.message.toLowerCase().includes(searchTerm.toLowerCase());
      const serviceMatch = reminder.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = messageMatch || serviceMatch;

      if (filterStatus === 'read') return searchMatch && reminder.isRead === 1;
      if (filterStatus === 'unread') return searchMatch && reminder.isRead === 0;
      return searchMatch;
    });

    // Sort by creation date (most recent first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredReminders(filtered);
  };

  const handleMarkAsRead = async (reminderId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reminders/${reminderId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setMessage('Reminder marked as read');
        fetchReminders();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update reminder');
      }
    } catch (error) {
      setMessage('Unable to update reminder. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleMarkAsUnread = async (reminderId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reminders/${reminderId}/unread`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setMessage('Reminder marked as unread');
        fetchReminders();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update reminder');
      }
    } catch (error) {
      setMessage('Unable to update reminder. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    setIsViewModalOpen(true);
    
    // Mark as read if not already read
    if (reminder.isRead === 0) {
      handleMarkAsRead(reminder.reminderId);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReminder(null);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReminderStats = () => {
    const total = reminders.length;
    const unread = reminders.filter(r => r.isRead === 0).length;
    const today = reminders.filter(r => {
      const reminderDate = new Date(r.preferredDateTime).toDateString();
      const today = new Date().toDateString();
      return reminderDate === today;
    }).length;
    return { total, unread, today };
  };

  const stats = getReminderStats();

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <div className="header-content">
          <h1>My Reminders</h1>
          <p>View your medical reminders and notifications</p>
        </div>
        
        
      </div>

      <div className="reminders-controls">
        
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Reminders</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') || message.includes('marked') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading reminders...</div>
      ) : (
        <div className="reminders-content">
          {filteredReminders.length === 0 ? (
            <div className="no-reminders">
              <div className="no-reminders-icon">🔔</div>
              <p>No reminders found matching your criteria.</p>
            </div>
          ) : (
            <div className="reminders-list">
              {filteredReminders.map((reminder) => (
                <div 
                  key={reminder.reminderId} 
                  className={`reminder-card ${reminder.isRead === 0 ? 'unread' : 'read'}`}
                  onClick={() => handleViewReminder(reminder)}
                >
                  <div className="reminder-header">
                    <div className="reminder-service">
                      <h3>{reminder.serviceName || 'Medical Reminder'}</h3>
                      {reminder.isRead === 0 && <span className="unread-badge">New</span>}
                    </div>
                    <div className="reminder-actions" onClick={(e) => e.stopPropagation()}>
                      {reminder.isRead === 0 ? (
                        <button 
                          className="action-btn mark-read-btn"
                          onClick={() => handleMarkAsRead(reminder.reminderId)}
                          title="Mark as Read"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <button 
                          className="action-btn mark-unread-btn"
                          onClick={() => handleMarkAsUnread(reminder.reminderId)}
                          title="Mark as Unread"
                        >
                          Mark Unread
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="reminder-content">
                    <p className="reminder-message">
                      {reminder.message.length > 100 
                        ? `${reminder.message.substring(0, 100)}...` 
                        : reminder.message}
                    </p>
                    {reminder.preferredDateTime && (
                      <div className="reminder-datetime">
                        📅 {formatDateTime(reminder.preferredDateTime)}
                      </div>
                    )}
                    
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Reminder Modal */}
      {isViewModalOpen && selectedReminder && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="reminder-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeViewModal}>×</button>
            
            <div className="modal-header">
              <h3>Reminder Details</h3>
              <span className={`status-badge ${selectedReminder.isRead === 0 ? 'unread' : 'read'}`}>
                {selectedReminder.isRead === 0 ? 'Unread' : 'Read'}
              </span>
            </div>

            <div className="modal-body">
              <div className="reminder-detail">
                <div className="detail-section">
                  <h4>Service Information</h4>
                  <p><strong>Service:</strong> {selectedReminder.serviceName || 'Medical Reminder'}</p>
                  {selectedReminder.appointmentId && (
                    <p><strong>Related Appointment:</strong> #{selectedReminder.appointmentId}</p>
                  )}
                  {selectedReminder.preferredDateTime && (
                    <p><strong>Scheduled Date & Time:</strong> {formatDateTime(selectedReminder.preferredDateTime)}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Message</h4>
                  <div className="message-content">
                    <p>{selectedReminder.message}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Reminder Information</h4>
                  <p><strong>Created:</strong> {formatDateTime(selectedReminder.createdAt)}</p>
                  <p><strong>Status:</strong> {selectedReminder.isRead === 0 ? 'Unread' : 'Read'}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="action-btn close-btn" onClick={closeViewModal}>
                  Close
                </button>
                {selectedReminder.isRead === 0 ? (
                  <button 
                    className="action-btn mark-read-btn"
                    onClick={() => {
                      handleMarkAsRead(selectedReminder.reminderId);
                      closeViewModal();
                    }}
                  >
                    Mark as Read
                  </button>
                ) : (
                  <button 
                    className="action-btn mark-unread-btn"
                    onClick={() => {
                      handleMarkAsUnread(selectedReminder.reminderId);
                      closeViewModal();
                    }}
                  >
                    Mark as Unread
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
