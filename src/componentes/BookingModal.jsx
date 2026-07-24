import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';

const BookingModal = ({ show, onHide, flight, onBookingSuccess, initialClass = "Economy", passengers = 1 }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ticketClass: initialClass
  });

  // Seat map state
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // PNR Result
  const [bookingResult, setBookingResult] = useState(null);

  const passengerCount = parseInt(passengers) || 1;

  // Sync default class on load
  useEffect(() => {
    if (initialClass) {
      setFormData(prev => ({ ...prev, ticketClass: initialClass }));
    }
  }, [initialClass, show]);

  // Load bookings for this flight to find occupied seats
  useEffect(() => {
    if (show && flight) {
      setStep(1);
      setErrorMsg(null);
      setBookingResult(null);
      setSelectedSeats([]);
      setFormData({
        name: '',
        email: '',
        phone: '',
        ticketClass: initialClass || 'Economy'
      });
      
      const fetchBookedSeats = async () => {
        try {
          const response = await axios.get('https://flight-booking-backend-production-9241.up.railway.app/api/bookings/');
          // Filter bookings for this flight that are Confirmed
          const activeBookings = response.data.filter(
            b => b.flight === flight.id && b.status === "Confirmed"
          );
          const seats = activeBookings.flatMap(b => (b.seat_number || '').split(',').map(s => s.trim()));
          
          // Generate some mock occupied seats based on flight number so the cabin looks alive
          const mockSeats = [];
          const seed = (flight.id * 7) % 100;
          const rows = 12;
          const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
          for (let i = 0; i < seed; i++) {
            const r = ((i * 3) % rows) + 1;
            const c = cols[(i * 2) % cols.length];
            const s = `${r}${c}`;
            if (!mockSeats.includes(s)) {
              mockSeats.push(s);
            }
          }
          
          setBookedSeats([...new Set([...seats, ...mockSeats])]);
        } catch (error) {
          console.error("Error fetching booked seats:", error);
          // Fallback to mock occupied seats if API fails
          const mockSeats = [];
          const seed = (flight.id * 13) % 40 + 10;
          const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
          for (let i = 0; i < seed; i++) {
            const r = Math.floor(Math.sin(flight.id + i) * 6) + 7;
            const c = cols[Math.floor(Math.abs(Math.cos(flight.id - i)) * cols.length)];
            mockSeats.push(`${r}${c}`);
          }
          setBookedSeats(mockSeats);
        }
      };
      
      fetchBookedSeats();
    }
  }, [show, flight]);

  if (!flight) return null;

  // Calculate pricing based on travel class & passenger count
  const getBasePrice = () => parseFloat(flight.price);
  
  const getClassMultiplier = () => {
    if (formData.ticketClass === "Business") return 2.0;
    if (formData.ticketClass === "First") return 3.5;
    return 1.0;
  };

  const getSubtotal = () => getBasePrice() * getClassMultiplier() * passengerCount;
  const getTax = () => getSubtotal() * 0.08; // 8% Tax
  const getSeatSelectionFee = () => {
    if (!selectedSeats || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((sum, seat) => {
      const row = parseInt(seat);
      return sum + (row <= 4 ? 1500 : 300);
    }, 0);
  };
  const getTotalPrice = () => getSubtotal() + getTax() + getSeatSelectionFee();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setErrorMsg("Please fill in all traveler details.");
        return;
      }
      setErrorMsg(null);
    }
    if (step === 2) {
      if (selectedSeats.length < passengerCount) {
        setErrorMsg(`Please select ${passengerCount} seat${passengerCount > 1 ? 's' : ''} to proceed (${selectedSeats.length} selected).`);
        return;
      }
      setErrorMsg(null);
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setErrorMsg(null);
    setStep(step - 1);
  };

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) return; // Occupied
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      }
      if (prev.length < passengerCount) {
        return [...prev, seat];
      }
      return [...prev.slice(0, passengerCount - 1), seat];
    });
    setErrorMsg(null);
  };

  const submitBooking = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        flight: flight.id,
        passenger_name: formData.name,
        passenger_email: formData.email,
        passenger_phone: formData.phone,
        seat_number: selectedSeats.join(', '),
        ticket_class: formData.ticketClass
      };

      const response = await axios.post("https://flight-booking-backend-production-9241.up.railway.app/api/bookings/", payload);
      setBookingResult(response.data);
      setStep(4);
      if (onBookingSuccess) {
        onBookingSuccess(response.data);
      }
    } catch (error) {
      console.error(error);
      const serverError = error.response?.data?.error || error.response?.data?.detail || "An error occurred while booking. Please try again.";
      setErrorMsg(serverError);
    } finally {
      setLoading(false);
    }
  };

  // Seat Map Builder
  const renderSeatMap = () => {
    const rows = 12;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    return (
      <div className="cabin-map my-3 p-3 bg-light rounded-4 border">
        {/* Plane Front Indicator */}
        <div className="plane-nose text-center py-2 mb-4 bg-secondary text-white rounded-pill fw-bold fs-7">
          FLIGHT DECK / COCKPIT
        </div>

        <div className="d-flex justify-content-around text-center fw-bold text-secondary mb-2 fs-7 px-4">
          <div style={{ width: '30px' }}>A</div>
          <div style={{ width: '30px' }}>B</div>
          <div style={{ width: '30px' }}>C</div>
          <div style={{ width: '20px' }}></div>
          <div style={{ width: '30px' }}>D</div>
          <div style={{ width: '30px' }}>E</div>
          <div style={{ width: '30px' }}>F</div>
        </div>

        <div className="seat-grid d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '280px' }}>
          {Array.from({ length: rows }).map((_, rIdx) => {
            const rowNum = rIdx + 1;
            const isFirstClassRow = rowNum <= 2;
            const isBusinessClassRow = rowNum > 2 && rowNum <= 4;
            
            return (
              <div key={rowNum} className="d-flex align-items-center justify-content-around">
                {cols.map((col, cIdx) => {
                  const seatCode = `${rowNum}${col}`;
                  const isOccupied = bookedSeats.includes(seatCode);
                  const isSelected = selectedSeats.includes(seatCode);
                  
                  let seatClass = "seat-economy";
                  if (isFirstClassRow) seatClass = "seat-first";
                  else if (isBusinessClassRow) seatClass = "seat-business";

                  let btnVariant = "outline-primary";
                  if (isOccupied) btnVariant = "secondary disabled-seat";
                  else if (isSelected) btnVariant = "success selected-seat";
                  else if (isFirstClassRow) btnVariant = "outline-warning";
                  else if (isBusinessClassRow) btnVariant = "outline-info";
                  
                  // Add gap in center for aisle
                  const renderAisle = cIdx === 3;

                  return (
                    <span key={col} className="d-flex align-items-center">
                      {renderAisle && (
                        <span className="aisle text-muted fw-bold d-flex align-items-center justify-content-center mx-2 fs-7" style={{ width: '20px' }}>
                          {rowNum}
                        </span>
                      )}
                      <button
                        type="button"
                        className={`btn seat-btn ${seatClass} ${isSelected ? 'btn-success text-white' : ''} d-flex align-items-center justify-content-center p-0 rounded`}
                        style={{ width: '32px', height: '32px', fontSize: '11px', fontWeight: 'bold' }}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seatCode)}
                        title={`${seatCode} (${isFirstClassRow ? 'First' : isBusinessClassRow ? 'Business' : 'Economy'})`}
                      >
                        {col}
                      </button>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 border-top pt-3 fs-7">
          <div className="d-flex align-items-center gap-1.5">
            <span className="legend-box bg-secondary rounded" style={{ width: '14px', height: '14px' }}></span>
            <span>Occupied</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span className="legend-box bg-success rounded" style={{ width: '14px', height: '14px' }}></span>
            <span>Selected</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span className="legend-box border border-warning rounded" style={{ width: '14px', height: '14px' }}></span>
            <span>First Class</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span className="legend-box border border-info rounded" style={{ width: '14px', height: '14px' }}></span>
            <span>Business</span>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <span className="legend-box border border-primary rounded" style={{ width: '14px', height: '14px' }}></span>
            <span>Economy</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size={step === 2 ? "md" : "lg"} centered className="booking-flow-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-4">
          {step === 1 && "Traveler Details"}
          {step === 2 && "Select Your Preferred Seat"}
          {step === 3 && "Review Your Booking"}
          {step === 4 && "Booking Confirmed!"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3">
        {/* Progress Tracker */}
        {step < 4 && (
          <div className="booking-progress-container mb-4">
            <div className="d-flex justify-content-between position-relative py-2">
              <div className="progress-bar-bg"></div>
              <div className="progress-bar-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
              
              <div className={`progress-dot z-1 ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`progress-dot z-1 ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className={`progress-dot z-1 ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
            <div className="d-flex justify-content-between text-muted fs-7 font-weight-600 px-1 mt-1">
              <div>Traveler Info</div>
              <div className="text-center">Seat Selection</div>
              <div className="text-end">Payment & Review</div>
            </div>
          </div>
        )}

        {errorMsg && <Alert variant="danger" className="py-2.5 rounded-3">{errorMsg}</Alert>}

        {/* STEP 1: Traveler Details */}
        {step === 1 && (
          <div className="row g-4">
            <div className="col-md-7">
              <Form>
                <Form.Group className="mb-3" controlId="bookName">
                  <Form.Label className="fw-semibold text-secondary">Full Name (as in Passport)</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter full name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="py-2.5 rounded-3 form-custom-input"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="bookEmail">
                  <Form.Label className="fw-semibold text-secondary">Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@example.com" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="py-2.5 rounded-3 form-custom-input"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="bookPhone">
                  <Form.Label className="fw-semibold text-secondary">Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    placeholder="e.g. +91 98765 43210" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    className="py-2.5 rounded-3 form-custom-input"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="bookClass">
                  <Form.Label className="fw-semibold text-secondary">Travel Class</Form.Label>
                  <Form.Select 
                    name="ticketClass" 
                    value={formData.ticketClass} 
                    onChange={handleInputChange}
                    className="py-2.5 rounded-3 form-custom-input"
                  >
                    <option value="Economy">Economy (Standard Fare)</option>
                    <option value="Business">Business (+100% Markup)</option>
                    <option value="First">First Class (+250% Markup)</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </div>
            
            {/* Flight Summary Card */}
            <div className="col-md-5">
              <div className="card border-0 bg-light-subtle shadow-sm rounded-4 p-4 h-100 border-start border-primary border-4">
                <h5 className="fw-bold mb-3">Flight Selected</h5>
                <div className="d-flex align-items-center mb-3">
                  <img src={flight.logo_url} alt="" width={45} className="me-2 rounded-2 bg-light p-1" />
                  <div>
                    <h6 className="mb-0 fw-bold">{flight.airline_name}</h6>
                    <small className="text-secondary">{flight.flight_number}</small>
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>From:</span>
                  <strong className="text-dark">{flight.departure_city} ({flight.departure_airport})</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>To:</span>
                  <strong className="text-dark">{flight.arrival_city} ({flight.arrival_airport})</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Date:</span>
                  <strong className="text-dark">{new Date(flight.departure_time).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-2">
                  <span>Base Price:</span>
                  <strong className="text-primary fs-5">₹{parseFloat(flight.price).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Seat Selection */}
        {step === 2 && (
          <div>
            <p className="text-muted fs-6 mb-3">
              Seat prices: Rows 1-2 (First Class) and Rows 3-4 (Business Class) are premium. Remaining are standard economy seats. Select your seat code below.
            </p>
            {renderSeatMap()}
          </div>
        )}

        {/* STEP 3: Review & Summary */}
        {step === 3 && (
          <div className="row g-4">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Traveler Summary</h5>
              <table className="table table-borderless fs-6">
                <tbody>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5" style={{ width: '40%' }}>Passenger Name:</td>
                    <td className="fw-bold py-1.5">{formData.name}</td>
                  </tr>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5">Email Address:</td>
                    <td className="fw-bold py-1.5">{formData.email}</td>
                  </tr>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5">Phone Number:</td>
                    <td className="fw-bold py-1.5">{formData.phone}</td>
                  </tr>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5">Travelers:</td>
                    <td className="fw-bold py-1.5">{passengerCount} Passenger{passengerCount > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5">Travel Class:</td>
                    <td className="fw-bold py-1.5">
                      <span className={`badge ${formData.ticketClass === 'First' ? 'bg-warning text-dark' : formData.ticketClass === 'Business' ? 'bg-info text-dark' : 'bg-primary'}`}>
                        {formData.ticketClass}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-secondary ps-0 py-1.5">Selected Seat(s):</td>
                    <td className="fw-bold text-success py-1.5 fs-5">{selectedSeats.join(', ') || 'None'}</td>
                  </tr>
                </tbody>
              </table>

              <h5 className="fw-bold mt-4 mb-3 border-bottom pb-2">Flight Schedule</h5>
              <div className="p-3 bg-light rounded-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block text-primary fs-5">
                      {new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </strong>
                    <span className="text-muted fs-7">{flight.departure_city} ({flight.departure_airport})</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="fs-7 text-secondary">{flight.stops}</span>
                    <div style={{ height: '2px', width: '60px', background: '#ccc', margin: '4px auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-3px', right: '0', border: 'solid 4px transparent', borderLeftColor: '#ccc' }}></div>
                    </div>
                  </div>
                  <div className="text-end">
                    <strong className="d-block text-primary fs-5">
                      {new Date(flight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </strong>
                    <span className="text-muted fs-7">{flight.arrival_city} ({flight.arrival_airport})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 bg-light-subtle shadow-sm rounded-4 p-4 border-end border-success border-4 h-100">
                <h5 className="fw-bold mb-3 border-bottom pb-2">Fare Breakdown</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Base Fare ({passengerCount} x Standard):</span>
                  <span>₹{(getBasePrice() * passengerCount).toLocaleString('en-IN')}</span>
                </div>
                {formData.ticketClass !== 'Economy' && (
                  <div className="d-flex justify-content-between mb-2 text-info-emphasis">
                    <span className="text-muted">{formData.ticketClass} Class Markup:</span>
                    <span>x{getClassMultiplier().toFixed(1)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Seat Fees ({selectedSeats.join(', ')}):</span>
                  <span>₹{getSeatSelectionFee().toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">GST & Airport Tax (8%):</span>
                  <span>₹{getTax().toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h4 className="fw-bold text-dark mb-0">Total Amount:</h4>
                  <h3 className="fw-black text-success mb-0">₹{Math.round(getTotalPrice()).toLocaleString('en-IN')}</h3>
                </div>
                
                <div className="mt-4 p-3 bg-success-subtle text-success-emphasis rounded-3 fs-7 border border-success border-opacity-25">
                  <div className="d-flex align-items-center">
                    <span className="material-icons me-2">verified_user</span>
                    <span>By clicking 'Pay & Book', your seat will be reserved instantly. No refund on cancel window applies.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && bookingResult && (
          <div className="text-center py-4">
            <div className="success-icon-wrapper mb-3 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" fill="currentColor" className="bi bi-check-circle-fill text-success bounce" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>
            <h3 className="fw-bold text-dark mb-1">Reservation Confirmed!</h3>
            <p className="text-muted mb-4">Your ticket is ready and seat has been locked.</p>
            
            <div className="d-flex justify-content-center my-3">
              <div className="p-3 bg-light border rounded-3 text-center" style={{ minWidth: '220px' }}>
                <small className="text-secondary d-block text-uppercase fw-semibold tracking-wider">Booking Reference (PNR)</small>
                <h2 className="fw-black text-primary letter-spacing-2 mb-0 mt-1">{bookingResult.booking_reference}</h2>
              </div>
            </div>

            <p className="text-muted fs-7 mt-3">
              Confirmation details sent to <strong>{bookingResult.passenger_email}</strong>. You can look up your boarding pass at any time in the <strong>History</strong> tab using this email.
            </p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-0 px-4 pb-4 pt-0">
        {step < 4 ? (
          <div className="d-flex justify-content-between w-100">
            {step > 1 ? (
              <Button variant="secondary" onClick={prevStep} className="px-4 py-2 rounded-3 fw-bold">
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button variant="primary" onClick={nextStep} className="btn-color px-4 py-2 rounded-3 fw-bold shadow-sm">
                Continue
              </Button>
            ) : (
              <Button 
                variant="success" 
                onClick={submitBooking} 
                disabled={loading}
                className="px-4 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                {loading ? "Processing..." : "Pay & Book"}
              </Button>
            )}
          </div>
        ) : (
          <div className="d-flex justify-content-center w-100 gap-3">
            <Button variant="outline-primary" onClick={onHide} className="px-4 py-2 rounded-3 fw-bold">
              Close Window
            </Button>
            <Button 
              variant="primary" 
              className="btn-color px-4 py-2 rounded-3 fw-bold shadow-sm"
              onClick={() => {
                onHide();
                // We'll call onBookingSuccess to switch the view to "Ticket" and pass the booking info
                if (onBookingSuccess) {
                  onBookingSuccess(bookingResult);
                }
              }}
            >
              View Boarding Pass
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;
