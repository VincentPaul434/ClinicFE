import React, { useState, useEffect } from 'react';
import './Appointments.css';

const Appointments = ({ patient }) => {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [acceptedAppointments, setAcceptedAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Edit appointment modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    preferredDateTime: '',
    symptom: ''
  });

  useEffect(() => {
    if (patient) {
      fetchAppointments();
      fetchServices();
    }
  }, [patient]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Fetch both pending and accepted appointments
      const [pendingResponse, acceptedResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/appointments/patient/${patient.patientId}`),
        fetch(`http://localhost:3000/api/accepted-appointments/patient/${patient.patientId}`)
      ]);

      let pendingData = [];
      let acceptedData = [];

      if (pendingResponse.ok) {
        pendingData = await pendingResponse.json();
      }

      if (acceptedResponse.ok) {
        acceptedData = await acceptedResponse.json();
      }

      // Get array of appointmentIds that have been accepted
      const acceptedAppointmentIds = acceptedData.map(accepted => accepted.appointmentId);

      // Filter out pending appointments that have been accepted
      const filteredPendingData = pendingData.filter(
        pending => !acceptedAppointmentIds.includes(pending.appointmentId)
      );

      setPendingAppointments(filteredPendingData);
      setAcceptedAppointments(acceptedData);
    } catch (error) {
      setMessage('Error fetching appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medical-services');
      if (response.ok) {
        const servicesData = await response.json();
        setServices(servicesData);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.serviceName : 'Unknown Service';
  };

  const getServicePrice = (serviceId) => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.price : '0';
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditFormData({
      preferredDateTime: appointment.preferredDateTime,
      symptom: appointment.symptom
    });
    setIsEditModalOpen(true);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Appointment cancelled successfully');
        fetchAppointments(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editFormData.preferredDateTime || !editFormData.symptom.trim()) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${editingAppointment.appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setMessage('Appointment updated successfully');
        setIsEditModalOpen(false);
        fetchAppointments(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update appointment');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error updating appointment:', error);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
    setEditFormData({
      preferredDateTime: '',
      symptom: ''
    });
    setMessage('');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getAttendanceStatus = (isAttended) => {
    return isAttended === 1 ? 'Attended' : 'Not Attended';
  };

  const getAttendanceColor = (isAttended) => {
    return isAttended === 1 ? 'status-attended' : 'status-not-attended';
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <p>Manage your medical appointments and view appointment history</p>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="appointments-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Appointments ({pendingAppointments.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted Appointments ({acceptedAppointments.length})
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <div className="appointments-content">
          {activeTab === 'pending' && (
            <div className="appointments-section">
              <h2>Pending Appointments</h2>
              {pendingAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No pending appointments found.</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {pendingAppointments.map((appointment) => (
                    <div key={appointment.appointmentId} className="appointment-card">
                      <div className="appointment-header">
                        <div className="appointment-service">
                          <h3>{getServiceName(appointment.serviceId)}</h3>
                          <span className="appointment-price">₱{getServicePrice(appointment.serviceId)}</span>
                        </div>
                        <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                          {appointment.status || 'Pending'}
                        </div>
                      </div>
                      
                      <div className="appointment-details">
                        <div className="appointment-info">
                          <p><strong>Date & Time:</strong> {formatDateTime(appointment.preferredDateTime)}</p>
                          <p><strong>Symptoms/Reason:</strong> {appointment.symptom}</p>
                          <p><strong>Appointment ID:</strong> #{appointment.appointmentId}</p>
                          <p><strong>Booked on:</strong> {formatDateTime(appointment.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="appointment-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="action-btn cancel-btn"
                          onClick={() => handleCancelAppointment(appointment.appointmentId)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'accepted' && (
            <div className="appointments-section">
              <h2>Accepted Appointments</h2>
              {acceptedAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No accepted appointments found.</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {acceptedAppointments.map((appointment) => (
                    <div key={appointment.acceptedAppointmentId} className="appointment-card accepted">
                      <div className="appointment-header">
                        <div className="appointment-service">
                          <h3>{getServiceName(appointment.serviceId)}</h3>
                          <span className="appointment-price">₱{getServicePrice(appointment.serviceId)}</span>
                        </div>
                        <div className={`appointment-status ${getAttendanceColor(appointment.isAttended)}`}>
                          {getAttendanceStatus(appointment.isAttended)}
                        </div>
                      </div>
                      
                      <div className="appointment-details">
                        <div className="appointment-info">
                          <p><strong>Date & Time:</strong> {formatDateTime(appointment.preferredDateTime)}</p>
                          <p><strong>Symptoms/Reason:</strong> {appointment.symptom}</p>
                          <p><strong>Accepted Appointment ID:</strong> #{appointment.acceptedAppointmentId}</p>
                          <p><strong>Original Appointment ID:</strong> #{appointment.appointmentId}</p>
                          <p><strong>Accepted on:</strong> {formatDateTime(appointment.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Appointment Modal */}
      {isEditModalOpen && editingAppointment && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEditModal}>×</button>
            
            <div className="modal-header">
              <h3>Reschedule Appointment</h3>
              <p>Service: {getServiceName(editingAppointment.serviceId)}</p>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="editDateTime">New Date & Time *</label>
                <input
                  type="datetime-local"
                  id="editDateTime"
                  name="preferredDateTime"
                  value={editFormData.preferredDateTime}
                  onChange={handleEditInputChange}
                  min={getMinDateTime()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editSymptom">Symptoms / Reason for Visit *</label>
                <textarea
                  id="editSymptom"
                  name="symptom"
                  value={editFormData.symptom}
                  onChange={handleEditInputChange}
                  placeholder="Update your symptoms or reason for this appointment..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button className="action-btn cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button className="action-btn save-btn" onClick={handleUpdateAppointment}>
                  Update Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
