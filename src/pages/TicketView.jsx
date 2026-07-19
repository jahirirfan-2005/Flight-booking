import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

const TicketView = ({ booking, onSearchRef }) => {
  const [pnrInput, setPnrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeBooking, setActiveBooking] = useState(booking);

  useEffect(() => {
    setActiveBooking(booking);
    setErrorMsg(null);
  }, [booking]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setErrorMsg("Please enter a Booking Reference / PNR.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/bookings/by-reference/${pnrInput.trim()}/`);
      setActiveBooking(response.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Booking reference not found. Please verify the code and try again.";
      setErrorMsg(msg);
      setActiveBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Mock Gate and Boarding time based on departure time
  const getGate = (flightNum) => {
    if (!flightNum) return 'G12';
    const num = parseInt(flightNum.replace(/\D/g, '')) || 5;
    const gates = ['A3', 'B7', 'C11', 'D2', 'E9', 'F4'];
    return gates[num % gates.length];
  };

  const getBoardingTime = (depTimeStr) => {
    if (!depTimeStr) return '';
    const depTime = new Date(depTimeStr);
    const boardingTime = new Date(depTime.getTime() - 40 * 60 * 1000); // 40 mins before
    return boardingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="ticket-view-container my-4">
      {/* Search Bar (only show if no booking passed or searching for another) */}
      <div className="search-pnr-box mb-4 no-print">
        <Card className="card-design border-0 shadow-sm p-3 rounded-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Retrieve Boarding Pass</h5>
            <Form onSubmit={handleSearch} className="d-flex gap-3 align-items-end">
              <Form.Group className="flex-fill" controlId="pnrInput">
                <Form.Label className="fw-semibold text-secondary">Enter Booking Reference (PNR)</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="e.g. FL7X8B" 
                  value={pnrInput} 
                  onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                  className="py-2.5 rounded-3 form-custom-input text-uppercase tracking-wider fw-bold"
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="btn-color px-4 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2"
                style={{ height: '48px' }}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Retrieve"}
              </Button>
            </Form>
            {errorMsg && <Alert variant="danger" className="mt-3 py-2 rounded-3">{errorMsg}</Alert>}
          </Card.Body>
        </Card>
      </div>

      {activeBooking ? (
        <div className="boarding-pass-print-area">
          <div className="no-print d-flex justify-content-between align-items-center mb-3">
            <span className="text-secondary fw-semibold">Boarding pass is generated and active.</span>
            <Button variant="outline-primary" onClick={handlePrint} className="d-flex align-items-center gap-2 fw-bold px-3 py-2 rounded-3">
              <span className="material-icons font-size-18">print</span>
              <span>Print Boarding Pass</span>
            </Button>
          </div>

          <div className={`boarding-pass-card position-relative overflow-hidden rounded-4 shadow-lg border-0 ${activeBooking.status === 'Cancelled' ? 'ticket-cancelled' : ''}`}>
            
            {/* Cancelled Watermark Stamp */}
            {activeBooking.status === 'Cancelled' && (
              <div className="cancelled-stamp">CANCELLED</div>
            )}
            
            {/* Ticket Header */}
            <div className="ticket-header p-4 d-flex justify-content-between align-items-center text-white bg-primary">
              <div className="d-flex align-items-center">
                <span className="material-icons me-2 font-size-24">airplane_ticket</span>
                <span className="h4 mb-0 fw-black tracking-wider text-white">BOARDING PASS</span>
              </div>
              <div className="text-end">
                <span className="badge bg-white text-primary fw-bold px-3 py-2 rounded-pill fs-7">
                  {activeBooking.ticket_class} Class
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="ticket-body p-4 bg-white">
              <div className="row g-4 align-items-center">
                
                {/* Left Side: Route and Passenger details */}
                <div className="col-lg-8 border-end-dashed-md pe-lg-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h2 className="mb-0 fw-black text-dark text-uppercase">{activeBooking.flight_details.departure_city}</h2>
                      <span className="fs-3 fw-bold text-primary">{activeBooking.flight_details.departure_airport}</span>
                    </div>
                    
                    <div className="text-center flex-grow-1 px-4">
                      <div className="fs-7 text-muted fw-bold mb-1">{activeBooking.flight_details.flight_number}</div>
                      <div className="position-relative d-flex align-items-center justify-content-center">
                        <div style={{ borderTop: '2px dashed #4690f6', width: '100%' }}></div>
                        <span className="material-icons position-absolute text-primary bg-white px-2 rotate-90 font-size-20">local_airport</span>
                      </div>
                      <div className="fs-7 text-success fw-bold mt-1">{activeBooking.flight_details.stops}</div>
                    </div>

                    <div className="text-end">
                      <h2 className="mb-0 fw-black text-dark text-uppercase">{activeBooking.flight_details.arrival_city}</h2>
                      <span className="fs-3 fw-bold text-primary">{activeBooking.flight_details.arrival_airport}</span>
                    </div>
                  </div>

                  <div className="row g-3 pt-3 border-top">
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Passenger</small>
                      <strong className="text-dark fs-6 text-truncate d-block">{activeBooking.passenger_name}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Date</small>
                      <strong className="text-dark fs-6 d-block">{formatDate(activeBooking.flight_details.departure_time)}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Gate</small>
                      <strong className="text-dark fs-6 d-block">{getGate(activeBooking.flight_details.flight_number)}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Seat</small>
                      <strong className="text-success fs-5 fw-black d-block">{activeBooking.seat_number}</strong>
                    </div>
                  </div>

                  <div className="row g-3 mt-1 pt-3">
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Departure</small>
                      <strong className="text-dark fs-6 d-block">{formatTime(activeBooking.flight_details.departure_time)}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Boarding Time</small>
                      <strong className="text-primary fs-6 d-block">{getBoardingTime(activeBooking.flight_details.departure_time)}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">Airline</small>
                      <strong className="text-dark fs-6 d-block">{activeBooking.flight_details.airline_name}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <small className="text-secondary d-block text-uppercase fw-semibold font-size-11">PNR Reference</small>
                      <strong className="text-dark fs-6 fw-bold text-uppercase d-block">{activeBooking.booking_reference}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Side: Stub & Barcode */}
                <div className="col-lg-4 text-center ps-lg-4">
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <div className="mb-2 text-secondary fw-semibold font-size-12">SCAN FOR GATE PASS</div>
                    
                    {/* Mock CSS Barcode */}
                    <div className="barcode-box bg-light p-3 rounded border mb-3">
                      <div className="barcode d-flex align-items-stretch">
                        <div className="b-line w-1 bg-dark"></div>
                        <div className="b-line w-2 bg-dark"></div>
                        <div className="b-line w-1 bg-light"></div>
                        <div className="b-line w-3 bg-dark"></div>
                        <div className="b-line w-1 bg-dark"></div>
                        <div className="b-line w-2 bg-light"></div>
                        <div className="b-line w-1 bg-dark"></div>
                        <div className="b-line w-4 bg-dark"></div>
                        <div className="b-line w-2 bg-dark"></div>
                        <div className="b-line w-1 bg-light"></div>
                        <div className="b-line w-1 bg-dark"></div>
                        <div className="b-line w-3 bg-dark"></div>
                        <div className="b-line w-2 bg-light"></div>
                        <div className="b-line w-2 bg-dark"></div>
                        <div className="b-line w-1 bg-dark"></div>
                        <div className="b-line w-2 bg-light"></div>
                        <div className="b-line w-4 bg-dark"></div>
                        <div className="b-line w-1 bg-dark"></div>
                      </div>
                      <small className="text-muted tracking-widest mt-1 d-block font-size-10">{activeBooking.booking_reference}</small>
                    </div>

                    <div className="text-start w-100 p-3 bg-light rounded-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted font-size-12">Carrier ID:</span>
                        <strong className="text-dark font-size-12">{activeBooking.flight_details.flight_number}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted font-size-12">Contact No:</span>
                        <strong className="text-dark font-size-12">{activeBooking.passenger_phone}</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Ticket Footer Accent Bar */}
            <div className="ticket-footer py-2 bg-light text-center border-top fs-7 text-secondary">
              Thank you for choosing {activeBooking.flight_details.airline_name} • Have a safe flight!
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 p-4 text-center my-5 bg-white">
          <div className="text-muted py-5">
            <span className="material-icons font-size-48 text-secondary mb-3">airplane_ticket</span>
            <h4>No Booking Selected</h4>
            <p className="fs-6 max-width-400 mx-auto text-secondary">
              Use the retrieve bar above to find your boarding pass, or book a flight first to display your ticket details.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TicketView;
