import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminInventoryDashboard.css';

const AdminInventoryDashboard = () => {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMessage, setStatusMessage] = useState('');

  const roomTypeLabels = {
    honeymoon: 'Honeymoon Suite',
    family: 'Family Suite',
    panoramic: 'Ocean View Room',
    exclusive: 'Luxury Suite',
    deluxe: 'Deluxe Single Room',
    presidential: 'Presidential Suite'
  };

  useEffect(() => {
    fetchInventoryData();
  }, [selectedDate]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current inventory status
      const response = await axios.get('/api/inventory', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Get availability for today
      const availabilityResponse = await axios.get(`/api/inventory/availability?checkInDate=${selectedDate}&checkOutDate=${getNextDay(selectedDate)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Combine the data
      const combinedData = {};
      for (const [type, data] of Object.entries(response.data)) {
        combinedData[type] = {
          ...data,
          dailyAvailability: availabilityResponse.data[type]?.availableRooms || 0
        };
      }
      
      setInventory(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError('Failed to load inventory data. Please try again later.');
      setLoading(false);
    }
  };

  const getNextDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getOccupancyPercentage = (available, total) => {
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  const getStatusColor = (occupancy) => {
    if (occupancy < 50) return 'low';
    if (occupancy < 80) return 'medium';
    return 'high';
  };

  const handleRefresh = () => {
    fetchInventoryData();
    setStatusMessage('Inventory data refreshed!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="admin-inventory-dashboard">
      <div className="dashboard-header">
        <h2>Room Inventory Dashboard</h2>
        <div className="dashboard-controls">
          <div className="date-selector">
            <label htmlFor="date-select">Select Date:</label>
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button className="refresh-btn" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i> Refresh Data
          </button>
        </div>
        {statusMessage && <div className="status-message">{statusMessage}</div>}
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading inventory data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="inventory-grid">
          {Object.keys(inventory).map(roomType => {
            const room = inventory[roomType];
            const occupancy = getOccupancyPercentage(room.dailyAvailability, room.totalRooms);
            
            return (
              <div key={roomType} className="inventory-card">
                <div className="card-header">
                  <h3>{roomTypeLabels[roomType] || roomType}</h3>
                  <span className={`status-indicator ${getStatusColor(occupancy)}`}></span>
                </div>
                
                <div className="inventory-details">
                  <div className="inventory-stat">
                    <span className="stat-value">{room.totalRooms}</span>
                    <span className="stat-label">Total Rooms</span>
                  </div>
                  
                  <div className="inventory-stat">
                    <span className="stat-value">{room.dailyAvailability}</span>
                    <span className="stat-label">Available ({selectedDate})</span>
                  </div>
                  
                  <div className="inventory-stat">
                    <span className="stat-value">{room.totalRooms - room.dailyAvailability}</span>
                    <span className="stat-label">Booked</span>
                  </div>
                </div>
                
                <div className="occupancy-bar-container">
                  <div className="occupancy-label">
                    <span>Occupancy</span>
                    <span>{occupancy}%</span>
                  </div>
                  <div className="occupancy-bar">
                    <div 
                      className={`occupancy-fill ${getStatusColor(occupancy)}`} 
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="dashboard-summary">
        <h3>Inventory Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">
              {Object.values(inventory).reduce((sum, room) => sum + room.totalRooms, 0)}
            </span>
            <span className="stat-label">Total Hotel Capacity</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">
              {Object.values(inventory).reduce((sum, room) => sum + room.dailyAvailability, 0)}
            </span>
            <span className="stat-label">Available Rooms</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">
              {Object.values(inventory).reduce((sum, room) => sum + (room.totalRooms - room.dailyAvailability), 0)}
            </span>
            <span className="stat-label">Booked Rooms</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">
              {Math.round(
                (Object.values(inventory).reduce((sum, room) => sum + (room.totalRooms - room.dailyAvailability), 0) /
                Object.values(inventory).reduce((sum, room) => sum + room.totalRooms, 0)) * 100
              )}%
            </span>
            <span className="stat-label">Total Occupancy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryDashboard;
