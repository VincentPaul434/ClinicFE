import React, { useState } from 'react';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [scheduleData, setScheduleData] = useState([
    {
      day: 'Monday',
      time: '8:00 AM - 5:00 PM',
      status: 'Available'
    },
    {
      day: 'Tuesday',
      time: '8:00 AM - 5:00 PM',
      status: 'Available'
    },
    {
      day: 'Wednesday',
      time: '8:00 AM - 5:00 PM',
      status: 'Available'
    },
    {
      day: 'Thursday',
      time: '8:00 AM - 5:00 PM',
      status: 'Available'
    },
    {
      day: 'Friday',
      time: '8:00 AM - 5:00 PM',
      status: 'Available'
    },
    {
      day: 'Saturday',
      time: '8:00 AM - 12:00 PM',
      status: 'Half-Day'
    },
    {
      day: 'Sunday',
      time: '',
      status: 'Day-off'
    }
  ]);

  const [notes, setNotes] = useState([
    'Doctor will be on leave April 25-26 (Medical Conference)',
    'Saturday Schedule may change next month'
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editFormData, setEditFormData] = useState({
    startTime: '',
    endTime: '',
    status: 'Available'
  });

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleEditSchedule = (index) => {
    const schedule = scheduleData[index];
    setSelectedDay({ ...schedule, index });
    
    if (schedule.time && schedule.time !== '') {
      const [startTime, endTime] = schedule.time.split(' - ');
      setEditFormData({
        startTime: convertTo24Hour(startTime),
        endTime: convertTo24Hour(endTime),
        status: schedule.status
      });
    } else {
      setEditFormData({
        startTime: '',
        endTime: '',
        status: schedule.status
      });
    }
    
    setIsEditModalOpen(true);
  };

  const handleMarkUnavailable = (index) => {
    const updatedSchedule = [...scheduleData];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      status: updatedSchedule[index].status === 'Available' ? 'Unavailable' : 'Available'
    };
    setScheduleData(updatedSchedule);
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  const convertTo12Hour = (time24h) => {
    let [hours, minutes] = time24h.split(':');
    hours = parseInt(hours, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${modifier}`;
  };

  const handleSaveSchedule = () => {
    if (editFormData.startTime && editFormData.endTime) {
      const updatedSchedule = [...scheduleData];
      const startTime12 = convertTo12Hour(editFormData.startTime);
      const endTime12 = convertTo12Hour(editFormData.endTime);
      
      updatedSchedule[selectedDay.index] = {
        ...updatedSchedule[selectedDay.index],
        time: `${startTime12} - ${endTime12}`,
        status: editFormData.status
      };
      setScheduleData(updatedSchedule);
    } else {
      const updatedSchedule = [...scheduleData];
      updatedSchedule[selectedDay.index] = {
        ...updatedSchedule[selectedDay.index],
        time: '',
        status: editFormData.status
      };
      setScheduleData(updatedSchedule);
    }
    
    setIsEditModalOpen(false);
    setSelectedDay(null);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
      setIsNotesModalOpen(false);
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'status-available';
      case 'Half-Day': return 'status-half-day';
      case 'Day-off': return 'status-day-off';
      case 'Unavailable': return 'status-unavailable';
      default: return 'status-available';
    }
  };

  return (
    <div className="doctor-schedule-container">
      <div className="schedule-header">
        <h1>Manage Doctor Schedule</h1>
        <button 
          className="add-notes-btn"
          onClick={() => setIsNotesModalOpen(true)}
        >
          Add Notes
        </button>
      </div>

      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>DAY</th>
              <th>TIME</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((schedule, index) => (
              <tr key={schedule.day}>
                <td>{schedule.day}</td>
                <td>{schedule.time}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-link edit-link"
                      onClick={() => handleEditSchedule(index)}
                    >
                      Edit Schedule
                    </button>
                    <button 
                      className="action-link unavailable-link"
                      onClick={() => handleMarkUnavailable(index)}
                    >
                      Mark as {schedule.status === 'Available' ? 'Unavailable' : 'Available'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notes-section">
        <h3>NOTES:</h3>
        <ul className="notes-list">
          {notes.map((note, index) => (
            <li key={index} className="note-item">
              <span className="note-bullet">●</span>
              <span className="note-text">{note}</span>
              <button 
                className="delete-note-btn"
                onClick={() => handleDeleteNote(index)}
                title="Delete note"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Schedule Modal */}
      {isEditModalOpen && selectedDay && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setIsEditModalOpen(false)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <h3>Edit Schedule - {selectedDay.day}</h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="form-control"
                >
                  <option value="Available">Available</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Day-off">Day-off</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {editFormData.status !== 'Day-off' && (
                <>
                  <div className="form-group">
                    <label htmlFor="startTime">Start Time</label>
                    <input
                      type="time"
                      id="startTime"
                      value={editFormData.startTime}
                      onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime">End Time</label>
                    <input
                      type="time"
                      id="endTime"
                      value={editFormData.endTime}
                      onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                      className="form-control"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button 
                  className="btn btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-save"
                  onClick={handleSaveSchedule}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {isNotesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNotesModalOpen(false)}>
          <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setIsNotesModalOpen(false)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <h3>Add Note</h3>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="newNote">Note</label>
                <textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter a note about the doctor's schedule..."
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-cancel"
                  onClick={() => setIsNotesModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-save"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
