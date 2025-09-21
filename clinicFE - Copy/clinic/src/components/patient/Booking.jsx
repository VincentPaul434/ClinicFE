import React, { useState, useEffect } from 'react';
import './Booking.css';

const Booking = ({ patient }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Appointment form data
  const [appointmentData, setAppointmentData] = useState({
    preferredDateTime: '',
    symptom: ''
  });

  // Fetch medical services on component mount
  useEffect(() => {
    fetchMedicalServices();
  }, []);

  // Filter and sort services when search term or sort option changes
  useEffect(() => {
    let filtered = services.filter(service =>
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort services based on selected option
    if (sortBy === 'a-z') {
      filtered = filtered.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    } else if (sortBy === 'z-a') {
      filtered = filtered.sort((a, b) => b.serviceName.localeCompare(a.serviceName));
    } else if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    // 'default' keeps original order

    setFilteredServices(filtered);
  }, [services, searchTerm, sortBy]);

  const fetchMedicalServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medical-services');
      if (response.ok) {
        const servicesData = await response.json();
        setServices(servicesData);
        setFilteredServices(servicesData);
      } else {
        setMessage('Failed to load medical services');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error fetching medical services:', error);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setMessage(''); // Clear any previous messages
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setAppointmentData({
      preferredDateTime: '',
      symptom: ''
    });
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = async () => {
    if (!appointmentData.preferredDateTime) {
      setMessage('Please select a preferred date and time');
      return;
    }

    if (!appointmentData.symptom.trim()) {
      setMessage('Please describe your symptoms or reason for visit');
      return;
    }

    if (!patient?.patientId || !selectedService?.serviceId) {
      setMessage('Missing patient or service information. Please try again.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Convert HTML datetime-local (YYYY-MM-DDTHH:mm) to SQL DATETIME (YYYY-MM-DD HH:mm:ss)
      const toSqlDateTime = (dtLocal) => {
        if (!dtLocal) return dtLocal;
        // Ensure seconds are present and replace 'T' with space
        const [datePart, timePart] = dtLocal.split('T');
        const timeWithSeconds = timePart?.length === 5 ? `${timePart}:00` : timePart; // HH:mm -> HH:mm:00
        return `${datePart} ${timeWithSeconds}`;
      };

      const appointmentPayload = {
        patientId: patient.patientId,
        serviceId: selectedService.serviceId,
        preferredDateTime: toSqlDateTime(appointmentData.preferredDateTime),
        symptom: appointmentData.symptom
      };

      console.log('Booking appointment with data:', appointmentPayload);

      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentPayload),
      });

      // Try to parse JSON; if it fails, fall back to text
      let data;
      try {
        data = await response.json();
      } catch (_) {
        const text = await response.text();
        data = { error: text };
      }

      if (response.ok) {
        setMessage('Appointment booked successfully!');
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        const backendMsg = typeof data === 'string' ? data : (data?.error || data?.message);
        setMessage(backendMsg || 'Failed to book appointment');
        console.error('Appointment booking failed:', data);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Error booking appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>BOOK</h1>
        <div className="booking-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="control-buttons">
            <button 
              className={`control-btn ${sortBy === 'default' ? 'active' : ''}`}
              onClick={() => setSortBy('default')}
            >
              Default
            </button>
            <button 
              className={`control-btn ${sortBy === 'a-z' ? 'active' : ''}`}
              onClick={() => setSortBy('a-z')}
            >
              A-Z
            </button>
            <button 
              className={`control-btn ${sortBy === 'z-a' ? 'active' : ''}`}
              onClick={() => setSortBy('z-a')}
            >
              Z-A
            </button>
            <button 
              className={`control-btn ${sortBy === 'price-low' ? 'active' : ''}`}
              onClick={() => setSortBy('price-low')}
            >
              Price: Low to High
            </button>
            <button 
              className={`control-btn ${sortBy === 'price-high' ? 'active' : ''}`}
              onClick={() => setSortBy('price-high')}
            >
              Price: High to Low
            </button>
          </div>
        </div>
      </div>

      <div className="booking-content">
        <div className="services-section">
          <p className="services-description">
            Please choose the type of service that you will be availing.
          </p>
          <h2>Available Services ({filteredServices.length})</h2>

          {message && !isModalOpen && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="no-services">
              <p>No services found matching your search criteria.</p>
            </div>
          ) : (
            <div className="services-list">
              {filteredServices.map((service) => (
                <div 
                  key={service.serviceId} 
                  className="service-item"
                >
                  <div className="service-info">
                    <div className="service-header">
                      <span className="service-price">₱{service.price}</span>
                      <span className="service-name">{service.serviceName}</span>
                    </div>
                    {service.description && (
                      <span className="service-description">{service.description}</span>
                    )}
                  </div>
                  <button 
                    className="select-btn"
                    onClick={() => handleServiceSelect(service)}
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedService && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h3>Book Appointment for {selectedService.serviceName}</h3>
            </div>

            <div className="modal-body">
              {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="appointment-form">
                <div className="form-group">
                  <label htmlFor="preferredDateTime">Preferred Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="preferredDateTime"
                    name="preferredDateTime"
                    value={appointmentData.preferredDateTime}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="symptom">Symptoms / Reason for Visit *</label>
                  <textarea
                    id="symptom"
                    name="symptom"
                    value={appointmentData.symptom}
                    onChange={handleInputChange}
                    placeholder="Please describe your symptoms or reason for this appointment..."
                    rows="4"
                    required
                  />
                </div>

                <div className="appointment-summary">
                  <h4>Appointment Summary</h4>
                  <p><strong>Service:</strong> {selectedService.serviceName}</p>
                  <p><strong>Price:</strong> ₱{selectedService.price}</p>
                  <p><strong>Patient:</strong> {patient.firstName} {patient.lastName}</p>
                  {appointmentData.preferredDateTime && (
                    <p><strong>Date & Time:</strong> {new Date(appointmentData.preferredDateTime).toLocaleString()}</p>
                  )}
                </div>

                <button 
                  className="book-appointment-btn"
                  onClick={handleBookAppointment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Booking...' : 'BOOK APPOINTMENT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
