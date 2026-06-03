/**
 * Room Inventory Management System
 * 
 * This utility handles tracking room availability and reservations
 * using local storage to persist the data between page visits.
 */

// Initial room inventory data
const initialInventory = {
  1: { id: 1, name: 'Luxury Suite', totalRooms: 5, reservedRooms: 0 },
  2: { id: 2, name: 'Ocean View Room', totalRooms: 8, reservedRooms: 0 },
  3: { id: 3, name: 'Family Suite', totalRooms: 4, reservedRooms: 0 },
  4: { id: 4, name: 'Deluxe Single Room', totalRooms: 10, reservedRooms: 0 },
  5: { id: 5, name: 'Presidential Suite', totalRooms: 2, reservedRooms: 0 },
  6: { id: 6, name: 'Honeymoon Suite', totalRooms: 3, reservedRooms: 0 }
};

/**
 * Initialize the inventory system on first load
 */
const initializeInventory = () => {
  if (!localStorage.getItem('roomInventory')) {
    localStorage.setItem('roomInventory', JSON.stringify(initialInventory));
  }
  
  if (!localStorage.getItem('reservations')) {
    localStorage.setItem('reservations', JSON.stringify([]));
  }
};

/**
 * Get the current inventory state
 */
const getInventory = () => {
  initializeInventory();
  return JSON.parse(localStorage.getItem('roomInventory'));
};

/**
 * Get all reservations
 */
const getReservations = () => {
  initializeInventory();
  return JSON.parse(localStorage.getItem('reservations'));
};

/**
 * Check if a room is available
 * @param {number} roomId - The room ID to check
 * @param {number} quantity - Number of rooms needed
 */
const isRoomAvailable = (roomId, quantity = 1) => {
  const inventory = getInventory();
  const room = inventory[roomId];

  if (!room) return false;
  return room.totalRooms - room.reservedRooms >= quantity;
};

/**
 * Get available number of rooms
 * @param {number} roomId - The room ID to check
 */
const getAvailableRoomCount = (roomId) => {
  const inventory = getInventory();
  const room = inventory[roomId];

  if (!room) return 0;
  return room.totalRooms - room.reservedRooms;
};

/**
 * Reserve a room
 * @param {object} reservation - Reservation data including roomId, quantity, checkIn, checkOut
 */
const reserveRoom = (reservation) => {
  if (!reservation.roomId || !reservation.quantity) {
    throw new Error('Invalid reservation data');
  }

  // Check if room is available
  if (!isRoomAvailable(reservation.roomId, reservation.quantity)) {
    return false;
  }

  // Update inventory
  const inventory = getInventory();
  inventory[reservation.roomId].reservedRooms += parseInt(reservation.quantity);
  localStorage.setItem('roomInventory', JSON.stringify(inventory));

  // Add to reservations
  const reservations = getReservations();
  reservations.push({
    ...reservation,
    id: Date.now(), // Simple unique ID
    dateCreated: new Date().toISOString()
  });
  localStorage.setItem('reservations', JSON.stringify(reservations));

  return true;
};

/**
 * Cancel a reservation
 * @param {number} reservationId - The reservation ID to cancel
 */
const cancelReservation = (reservationId) => {
  const reservations = getReservations();
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);
  
  if (reservationIndex === -1) return false;
  
  const reservation = reservations[reservationIndex];
  
  // Update inventory
  const inventory = getInventory();
  inventory[reservation.roomId].reservedRooms -= reservation.quantity;
  localStorage.setItem('roomInventory', JSON.stringify(inventory));
  
  // Remove from reservations
  reservations.splice(reservationIndex, 1);
  localStorage.setItem('reservations', JSON.stringify(reservations));
  
  return true;
};

/**
 * Reset the inventory system (for testing)
 */
const resetInventory = () => {
  localStorage.setItem('roomInventory', JSON.stringify(initialInventory));
  localStorage.setItem('reservations', JSON.stringify([]));
};

export {
  initializeInventory,
  getInventory,
  getReservations,
  isRoomAvailable,
  getAvailableRoomCount,
  reserveRoom,
  cancelReservation,
  resetInventory
};
