import React from "react";
import './SeatBooking.css';

const SeatGrid = ({ seats, availableCount, bookedCount }) => {
  return (
    <div>
      <div className="seat-grid">
        {seats.map((seat, index) => (
          <div
            key={index}
            role="button"
            aria-pressed={seat}
            className={`seat ${seat ? "booked" : "available"}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="seat-counts" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="available-seats" style={{ backgroundColor: 'green', color: 'white', padding: '10px', flex: 1, marginRight: '5px' }}>
          Available Seats: {availableCount}
        </div>
        <div className="booked-seats" style={{ backgroundColor: 'yellow', color: 'black', padding: '10px', flex: 1 }}>
          Booked Seats: {bookedCount}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
