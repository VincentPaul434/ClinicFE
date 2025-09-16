import React, { useState, useEffect } from 'react';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    serviceName: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/medical-services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setMessage('Failed to fetch services');
      }
    } catch (error) {
      setMessage('Error fetching services');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services.filter(service => {
      const nameMatch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      const priceMatch = service.price.toString().includes(searchTerm);
      const descriptionMatch = service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return nameMatch || priceMatch || descriptionMatch;
    });

    // Sort by service name alphabetically
    filtered.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

    setFilteredServices(filtered);
  };

  const handleCreateService = async () => {
    if (!serviceFormData.serviceName.trim() || !serviceFormData.price) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/medical-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: serviceFormData.serviceName.trim(),
          price: parseFloat(serviceFormData.price),
          description: serviceFormData.description.trim()
        }),
      });

      if (response.ok) {
        setMessage('Service created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchServices();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to create service');
      }
    } catch (error) {
      setMessage('Unable to create service. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleUpdateService = async () => {
    if (!serviceFormData.serviceName.trim() || !serviceFormData.price) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/medical-services/${selectedService.serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: serviceFormData.serviceName.trim(),
          price: parseFloat(serviceFormData.price),
          description: serviceFormData.description.trim()
        }),
      });

      if (response.ok) {
        setMessage('Service updated successfully');
        setIsEditModalOpen(false);
        resetForm();
        fetchServices();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update service');
      }
    } catch (error) {
      setMessage('Unable to update service. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/medical-services/${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Service deleted successfully');
        fetchServices();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete service');
      }
    } catch (error) {
      setMessage('Unable to delete service. Please try again later.');
      console.error('Error:', error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
    setMessage('');
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setServiceFormData({
      serviceName: service.serviceName,
      price: service.price.toString(),
      description: service.description || ''
    });
    setIsEditModalOpen(true);
    setMessage('');
  };

  const openViewModal = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedService(null);
    resetForm();
    setMessage('');
  };

  const resetForm = () => {
    setServiceFormData({
      serviceName: '',
      price: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
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

  return (
    <div className="service-management-container">
      <div className="service-management-header">
        <div className="header-content">
          <h1>Service Management</h1>
          <p>Manage medical services offered by the clinic</p>
        </div>
        
        <button className="create-service-btn" onClick={openCreateModal}>
          + Add New Service
        </button>
      </div>

      <div className="service-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading services...</div>
      ) : (
        <div className="services-content">
          {filteredServices.length === 0 ? (
            <div className="no-services">
              <div className="no-services-icon">🏥</div>
              <p>No services found matching your criteria.</p>
              {services.length === 0 && (
                <button className="create-service-btn" onClick={openCreateModal}>
                  Create First Service
                </button>
              )}
            </div>
          ) : (
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
            
                    <th>Service Name</th>
                    <th>Price</th>
                    
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service.serviceId}>
                      
                      <td>
                        <div className="service-name">
                          {service.serviceName}
                        </div>
                      </td>
                      <td>
                        <span className="service-price">
                          {formatPrice(service.price)}
                        </span>
                      </td>
                      
                        
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => openViewModal(service)}
                            title="View Details"
                          >
                            View
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => openEditModal(service)}
                            title="Edit Service"
                          >
                            Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteService(service.serviceId, service.serviceName)}
                            title="Delete Service"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Service Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>×</button>
            
            <div className="modal-header">
              <h3>Create New Service</h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="serviceName">Service Name *</label>
                <input
                  type="text"
                  id="serviceName"
                  name="serviceName"
                  value={serviceFormData.serviceName}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={serviceFormData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  className="form-control"
                  required
                />
              </div>

             

              <div className="modal-actions">
                <button className="action-btn cancel-btn" onClick={closeModals}>
                  Cancel
                </button>
                <button className="action-btn save-btn" onClick={handleCreateService}>
                  Create Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && selectedService && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>×</button>
            
            <div className="modal-header">
              <h3>Edit Service</h3>
              <p>Service ID: #{selectedService.serviceId}</p>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="editServiceName">Service Name *</label>
                <input
                  type="text"
                  id="editServiceName"
                  name="serviceName"
                  value={serviceFormData.serviceName}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editPrice">Price *</label>
                <input
                  type="number"
                  id="editPrice"
                  name="price"
                  value={serviceFormData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  className="form-control"
                  required
                />
              </div>

              

              <div className="modal-actions">
                <button className="action-btn cancel-btn" onClick={closeModals}>
                  Cancel
                </button>
                <button className="action-btn save-btn" onClick={handleUpdateService}>
                  Update Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Service Modal */}
      {isViewModalOpen && selectedService && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="service-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>×</button>
            
            <div className="modal-header">
              <h3>Service Details</h3>
            </div>

            <div className="modal-body">
              <div className="service-detail">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <p><strong>Service ID:</strong> #{selectedService.serviceId}</p>
                  <p><strong>Service Name:</strong> {selectedService.serviceName}</p>
                  <p><strong>Price:</strong> {formatPrice(selectedService.price)}</p>
                </div>

                

                <div className="detail-section">
                  <h4>Service Information</h4>
                  <p><strong>Created:</strong> {formatDateTime(selectedService.createdAt)}</p>
                  <p><strong>Last Updated:</strong> {formatDateTime(selectedService.updatedAt)}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="action-btn close-btn" onClick={closeModals}>
                  Close
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    closeModals();
                    openEditModal(selectedService);
                  }}
                >
                  Edit Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
