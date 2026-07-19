import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const FlightsDetailCard = ({ flight, onBook }) => {
  if (!flight) return null;

  // Format datetimes
  const depDate = new Date(flight.departure_time);
  const arrDate = new Date(flight.arrival_time);
  
  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Calculate duration
  const durationMs = arrDate - depDate;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = `${hours}h ${minutes}m`;

  return (
    <Card className="flight-detail-card border-0 shadow-sm rounded-4 mb-3 overflow-hidden position-relative hover-lift">
      <Card.Body className="p-4">
        <div className="row g-3 align-items-center">
          
          {/* Airline Logo & Name */}
          <div className="col-lg-3 col-md-12 d-flex align-items-center">
            <div className="airline-logo-container p-2 rounded-3 bg-light d-flex align-items-center justify-content-center">
              <img
                src={flight.logo_url || "https://img.icons8.com/ios-filled/100/airplane-tail-fin.png"}
                alt={flight.airline_name}
                className="airline-logo-img"
              />
            </div>
            <div className="ms-3">
              <h5 className="mb-0 fw-bold text-dark">{flight.airline_name}</h5>
              <small className="text-secondary fw-semibold">{flight.flight_number}</small>
            </div>
          </div>

          {/* Times & Route info */}
          <div className="col-lg-6 col-md-8">
            <div className="d-flex align-items-center justify-content-between text-center px-lg-3">
              
              {/* Departure */}
              <div className="text-start">
                <span className="text-muted d-block fs-7 fw-medium">{formatDate(depDate)}</span>
                <span className="fs-4 fw-bold text-primary d-block">{formatTime(depDate)}</span>
                <span className="badge bg-secondary-subtle text-dark-emphasis fw-bold px-2.5 py-1.5 rounded">{flight.departure_airport}</span>
                <small className="text-muted d-block mt-1 font-size-12">{flight.departure_city}</small>
              </div>

              {/* Path/Duration visualizer */}
              <div className="flex-grow-1 px-3 position-relative d-flex flex-column align-items-center justify-content-center">
                <small className="text-secondary-emphasis fw-semibold mb-1 d-block">{durationStr}</small>
                <div className="w-100 position-relative d-flex align-items-center justify-content-center my-2">
                  <div className="path-line"></div>
                  <div className="dot-start"></div>
                  <div className="path-icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-airplane-fill text-primary rotate-90" viewBox="0 0 16 16">
                      <path d="M6.428 1.151C6.708.591 7.303 0 8 0s1.293.592 1.572 1.151C9.861 1.73 10 2.481 10 3.1c0 .986-.838 2.205-2.531 3.89L8 7.05l-.469-.06C5.838 5.306 5 4.085 5 3.1c0-.619.14-1.369.428-1.909"/>
                      <path d="M8 8c-.482 0-.964-.132-1.377-.377L1.623 4.623a.5.5 0 0 0-.623.754l4 4A2 2 0 0 0 6 10v4a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-4a2 2 0 0 0 1-.623l4-4a.5.5 0 0 0-.623-.754l-5 3A2 2 0 0 0 8 8"/>
                    </svg>
                  </div>
                  <div className="dot-end"></div>
                </div>
                <small className="text-success fw-bold d-block">{flight.stops}</small>
              </div>

              {/* Arrival */}
              <div className="text-end">
                <span className="text-muted d-block fs-7 fw-medium">{formatDate(arrDate)}</span>
                <span className="fs-4 fw-bold text-primary d-block">{formatTime(arrDate)}</span>
                <span className="badge bg-secondary-subtle text-dark-emphasis fw-bold px-2.5 py-1.5 rounded">{flight.arrival_airport}</span>
                <small className="text-muted d-block mt-1 font-size-12">{flight.arrival_city}</small>
              </div>

            </div>
          </div>

          {/* Pricing & Booking CTA */}
          <div className="col-lg-3 col-md-4 text-end border-start-lg ps-lg-4">
            <div className="mb-2">
              <span className="text-muted d-block fs-7">Price per passenger</span>
              <span className="fs-2 fw-black text-dark d-block">₹{parseFloat(flight.price).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="d-flex flex-column align-items-end gap-1 w-100">
              <span className="badge bg-warning-subtle text-warning-emphasis mb-2 fw-bold">
                {flight.available_seats} seats left
              </span>
              <Button
                variant="primary"
                className="w-100 rounded-3 py-2 fw-bold btn-color text-uppercase letter-spacing-1 shadow-sm fs-6"
                onClick={() => onBook(flight)}
                disabled={flight.available_seats <= 0}
              >
                {flight.available_seats > 0 ? "Book Now" : "Sold Out"}
              </Button>
            </div>
          </div>

        </div>
      </Card.Body>
    </Card>
  );
};

export default FlightsDetailCard;