import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

import { getAirlineLogo, DEFAULT_AIRLINE_LOGO } from '../utils/airlineLogos';

const HistoryView = ({ onViewTicket }) => {
  const [emailInput, setEmailInput] = useState(() => {
    return localStorage.getItem('passenger_history_email') || '';
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchHistory = async (emailToFetch) => {
    if (!emailToFetch) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/bookings/?email=${emailToFetch.trim()}`);
      setBookings(response.data);
      localStorage.setItem('passenger_history_email', emailToFetch.trim());
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to retrieve booking history. Please make sure the backend is active.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailInput) {
      fetchHistory(emailInput);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    fetchHistory(emailInput);
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelLoadingId(bookingId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await axios.post(`http://localhost:8000/api/bookings/${bookingId}/cancel/`);
      setSuccessMsg(`Booking ${response.data.booking_reference} has been cancelled successfully.`);
      
      // Update local state list
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || "Failed to cancel booking. Please try again later.";
      setErrorMsg(errMsg);
    } finally {
      setCancelLoadingId(null);
    }
  };

  const requestCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history-view-container my-4">
      {/* Search Panel */}
      <Card className="card-design border-0 shadow-sm p-3 rounded-4 mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Lookup Booking History</h5>
          <Form onSubmit={handleSearch} className="d-flex gap-3 align-items-end">
            <Form.Group className="flex-fill" controlId="emailHistoryInput">
              <Form.Label className="fw-semibold text-secondary">Enter Passenger Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="passenger@example.com" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)}
                className="py-2.5 rounded-3 form-custom-input"
              />
            </Form.Group>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="btn-color px-4 py-2.5 rounded-3 fw-bold shadow-sm"
              style={{ height: '48px' }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Fetch History"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {errorMsg && <Alert variant="danger" className="py-2.5 rounded-3 mb-3">{errorMsg}</Alert>}
      {successMsg && <Alert variant="success" className="py-2.5 rounded-3 mb-3">{successMsg}</Alert>}

      {/* History table */}
      <Card className="card-design border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
          <h5 className="fw-bold text-dark mb-0">Bookings List</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {bookings.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap table-custom">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary-emphasis">PNR</th>
                    <th className="py-3 text-secondary-emphasis">Route</th>
                    <th className="py-3 text-secondary-emphasis">Flight Details</th>
                    <th className="py-3 text-secondary-emphasis">Passenger / Seat</th>
                    <th className="py-3 text-secondary-emphasis">Booking Date</th>
                    <th className="py-3 text-secondary-emphasis text-center">Status</th>
                    <th className="px-4 py-3 text-end text-secondary-emphasis">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 fw-bold text-primary tracking-wider">{b.booking_reference}</td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <strong>{b.flight_details?.departure_city || 'N/A'}</strong>
                          <span className="mx-2 text-muted">→</span>
                          <strong>{b.flight_details?.arrival_city || 'N/A'}</strong>
                        </div>
                        <small className="text-secondary">{b.flight_details?.departure_airport || ''} • {b.flight_details?.arrival_airport || ''}</small>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-1.5">
                          <img 
                            src={getAirlineLogo(b.flight_details?.airline_name, b.flight_details?.logo_url)} 
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AIRLINE_LOGO; }}
                            width={22} 
                            height={22} 
                            className="object-fit-contain" 
                            alt="" 
                          />
                          <span>{b.flight_details?.airline_name || 'Airline'}</span>
                        </div>
                        <small className="text-secondary">{b.flight_details?.flight_number || ''} | {b.flight_details?.departure_time ? formatTime(b.flight_details.departure_time) : ''}</small>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold">{b.passenger_name}</div>
                        <small className="text-secondary">Seat {b.seat_number} ({b.ticket_class})</small>
                      </td>
                      <td className="py-3">{formatDate(b.booking_date)}</td>
                      <td className="py-3 text-center">
                        <Badge 
                          bg={b.status === 'Confirmed' ? 'success' : 'danger'} 
                          className="px-2.5 py-1.5 rounded-pill fw-semibold"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-2 px-2.5 py-1.5 font-weight-600"
                            onClick={() => onViewTicket(b)}
                          >
                            Boarding Pass
                          </Button>
                          {b.status === 'Confirmed' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="rounded-2 px-2.5 py-1.5 font-weight-600"
                              disabled={cancelLoadingId === b.id}
                              onClick={() => requestCancelBooking(b)}
                            >
                              {cancelLoadingId === b.id ? "..." : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <span className="material-icons font-size-36 text-secondary mb-2">history</span>
              <p className="mb-0">No booking records found.</p>
              <small className="text-secondary-emphasis d-block mt-1">Enter your passenger email above to fetch all bookings associated with it.</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Cancellation Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
            <span className="material-icons text-danger">warning</span>
            Confirm Booking Cancellation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="mb-0">
            Are you sure you want to cancel your flight reservation for booking reference{" "}
            <strong className="text-primary">{bookingToCancel?.booking_reference}</strong>?
          </p>
          {bookingToCancel?.flight_details && (
            <div className="mt-3 p-3 bg-light rounded-3 fs-7 text-secondary">
              <strong className="text-dark d-block mb-1">Flight Details:</strong>
              <div className="mt-1 d-flex align-items-center gap-1.5">
                 <img src={bookingToCancel.flight_details.logo_url || "https://img.icons8.com/ios-filled/100/airplane-tail-fin.png"} width={18} height={18} className="rounded" alt="" />
                <strong>{bookingToCancel.flight_details.airline_name}</strong> ({bookingToCancel.flight_details.flight_number})
              </div>
              <div className="mt-1">
                Route: <strong>{bookingToCancel.flight_details.departure_city} ({bookingToCancel.flight_details.departure_airport})</strong> → <strong>{bookingToCancel.flight_details.arrival_city} ({bookingToCancel.flight_details.arrival_airport})</strong>
              </div>
              <div className="mt-1">
                Seat: <strong className="text-success">{bookingToCancel.seat_number}</strong> | Class: <strong>{bookingToCancel.ticket_class}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="rounded-3 px-3 py-2 fw-semibold">
            No, Keep Reservation
          </Button>
          <Button 
            variant="danger" 
            onClick={async () => {
              if (bookingToCancel) {
                setShowCancelModal(false);
                await handleCancelBooking(bookingToCancel.id);
              }
            }} 
            className="rounded-3 px-3 py-2 fw-semibold"
          >
            Yes, Cancel Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoryView;
