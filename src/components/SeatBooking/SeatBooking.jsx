import React, { useState, useEffect } from "react";
import SeatGrid from "./SeatGrid";
import './SeatBooking.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from "react-router-dom";

const SeatBooking = () => {
    const location = useLocation();
    const userId = location.state?.userId;
    const accessToken = location.state?.accessToken;
    const navigate = useNavigate();
    const [seats, setSeats] = useState(Array(80).fill(false));
    const [bookedSeatsData, setBookedSeatsData] = useState([]);
    const [message, setMessage] = useState("");
    const [numSeatsToBook, setNumSeatsToBook] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bookedSeatsCount, setBookedSeatsCount] = useState(0);
    console.log(bookedSeatsCount)

    // Check if access token is present
    useEffect(() => {
        if (!accessToken) {
            alert("You must be logged in to access this page.");
            navigate("/login");
        }
    }, [accessToken, navigate]);

    // Fetch booked seats on initial load
    useEffect(() => {
        const fetchBookedSeats = async () => {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/showBookedSeat");
            if (response.ok) {
                const data = await response.json();
                const bookedSeatsArray = data.seatNumbers;
                setBookedSeatsData(bookedSeatsArray);
                const updatedSeats = seats.map((seat, index) => bookedSeatsArray.includes(index + 1));
                setSeats(updatedSeats);
            } else {
                console.error("Error fetching booked seats");
            }
            setLoading(false);
        };
        fetchBookedSeats();
    }, []);

    const handleBookSeats = async () => {
        setBookedSeatsData([]);

        if (numSeatsToBook <= 0 || numSeatsToBook > seats.filter(seat => !seat).length) {
        }

        const response = await fetch("http://localhost:5000/api/seatBooking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId, seats: numSeatsToBook }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", response);
            setMessage(errorData.message || "Error booking seats.");
            alert(errorData.message || "Error booking seats.");
            return;
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.allocatedSeats) {
            const updatedSeats = [...seats];
            data.allocatedSeats.forEach((seatNumber) => {
                updatedSeats[seatNumber - 1] = true;
            });

            setSeats(updatedSeats);
            setBookedSeatsData(data.allocatedSeats);
            setMessage(data.message);
            
            setBookedSeatsCount(updatedSeats.filter(seat => seat).length);
        } 
        else {
            setMessage("Unexpected response format.");
        }

        setNumSeatsToBook(0);
    };

    const handleReset = async () => {
        const response = await fetch("http://localhost:5000/api/resetBooking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });

        if (response.ok) {
            setSeats(Array(80).fill(false));
            setBookedSeatsData([]);
            setMessage("");
            setNumSeatsToBook(0);
        } else {
            const errorData = await response.json();
            console.error("Error resetting booking:", errorData);
            alert(errorData.message || "Error resetting booking.");
        }
    };

    const handleLogout = async () => {
        const response = await fetch("http://localhost:5000/api/users/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });

        if (response.ok) {
            const data = await response.json();
            navigate("/login");
            alert(data.message);
        } else {
            console.error("Error logging out");
            alert("Error logging out.");
        }
    };

    return (
        <div className="container">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="row">
                        <h2>Ticket Booking</h2>
                        <div
                            className="profile-section d-flex justify-content-end mt-3"
                            style={{ marginLeft: "178px" }}
                        >
                            <div className="dropdown">
                                <button
                                    className="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className="bi bi-person-circle"></i> Profile
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="booking-layout">
                        <div className="seat-grid-container">
                            <SeatGrid
                                seats={seats}
                                availableCount={seats.filter(seat => !seat).length}
                                bookedCount={bookedSeatsCount}
                                bookedSeats={bookedSeatsData}
                            />
                        </div>
                        <div className="booking-controls">
                            <p>Booked Seats: {bookedSeatsData.length > 0 ? bookedSeatsData.join(", ") : "None"}</p>
                            <input
                                type="number"
                                className="form-control"
                                onChange={(e) => setNumSeatsToBook(Number(e.target.value) || 0)}
                                placeholder="Number of seats"
                            />
                            <button className="button" onClick={handleBookSeats}>
                                Book Seats
                            </button>
                            <button className="button" onClick={handleReset}>
                                Reset Booking
                            </button>
                            {message && <p>{message}</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SeatBooking;
