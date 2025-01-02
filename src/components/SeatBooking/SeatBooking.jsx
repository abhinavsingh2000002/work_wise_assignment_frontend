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
    const [numSeatsToBook, setNumSeatsToBook] = useState();
    const [loading, setLoading] = useState(true);
    const [bookedSeatsCount, setBookedSeatsCount] = useState(0);
    const [bookingLoading, setBookingLoading] = useState(false);

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
            const response = await fetch("https://work-wise-assignment-backend.onrender.com/api/showBookedSeat");
            if (response.ok) {
                const data = await response.json();

                setBookedSeatsCount(data.bookedSeatsCount);
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

    const handleBookSeats = async (e) => {
        e.preventDefault()
        setBookedSeatsData([]);
        setBookingLoading(true);

        const response = await fetch("https://work-wise-assignment-backend.onrender.com/api/seatBooking", {
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
            setNumSeatsToBook('')
            setBookingLoading(false);
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

        setNumSeatsToBook('');
        setBookingLoading(false);
    };

    const handleReset = async () => {
        setLoading(true);
        const response = await fetch("https://work-wise-assignment-backend.onrender.com/api/resetBooking", {
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
            setNumSeatsToBook();
        } else {
            const errorData = await response.json();
            console.error("Error resetting booking:", errorData);
            alert(errorData.message || "Error resetting booking.");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        const response = await fetch("https://work-wise-assignment-backend.onrender.com/api/users/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.removeItem('userId');
            localStorage.removeItem('accessToken');
            navigate("/login");
            alert(data.message);
        } else {
            console.error("Error logging out");
            alert("Error logging out.");
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid p-0">
            {loading && (
                <div className="loader-background">
                    <div className="loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            )}
            {bookingLoading && (
                <div className="booking-loader">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            )}
    
            {/* Navbar Section */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        Ticket Booking
                    </a>
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
            </nav>
    
            {/* Main Content Section */}
            <div className="row" style={{ marginTop: "70px" }}> {/* Added marginTop to prevent overlap with navbar */}
                {/* Seat Grid on Left */}
                <div className="col-12 col-md-6">
                    <div className="seat-grid-container">
                        <SeatGrid
                            seats={seats}
                            availableCount={seats.filter((seat) => !seat).length}
                            bookedCount={bookedSeatsCount}
                            bookedSeats={bookedSeatsData}
                        />
                    </div>
                </div>
    
                {/* Booking Controls on Right */}
                <div className="col-12 col-md-4 mt-4">
                    <div className="booking-controls">

                        <p>Allocated Seats: {bookedSeatsData.length > 0 ? bookedSeatsData.join(", ") : "None"}</p>
                        <div className="form-group mb-3">
                            <input
                                type="number"
                                className="form-control"
                                value={numSeatsToBook === 0 ? "" : numSeatsToBook}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                        setNumSeatsToBook("");
                                    } else {
                                        setNumSeatsToBook(Number(value));
                                    }
                                }}
                                placeholder="Number of seats"
                            />
                        </div>
                        <button className="btn btn-primary w-100 mb-3" onClick={handleBookSeats}>
                            Book Seats
                        </button>
                        <button className="btn btn-danger w-100" onClick={handleReset}>
                            Reset Booking
                        </button>
                        {message && <p className="mt-3">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
    
    
};

export default SeatBooking;
