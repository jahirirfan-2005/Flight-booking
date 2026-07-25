import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { getAirlineLogo, DEFAULT_AIRLINE_LOGO } from "../utils/airlineLogos";

const FlightsDetailCard = ({ flight, onBook, compact = false }) => {
  if (!flight) return null;

  const logoSrc = getAirlineLogo(flight.airline_name, flight.logo_url);

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

  if (compact) {
    return (
      <Card className="flight-detail-card border shadow-sm rounded-4 overflow-hidden position-relative bg-white">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <img
                src={logoSrc}
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AIRLINE_LOGO; }}
                alt={flight.airline_name}
                width={36}
                height={36}
                className="p-1 rounded bg-light border object-fit-contain"
              />
              <div>
                <h6 className="mb-0 fw-bold text-dark fs-7">{flight.airline_name}</h6>
                <small className="text-secondary fs-8">{flight.flight_number}</small>
              </div>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis fw-bold fs-8">
              {flight.available_seats} seats left
            </span>
          </div>

          <div className="d-flex align-items-center justify-content-between text-center bg-light p-2.5 rounded-3 mb-3">
            <div className="text-start">
              <span className="fs-6 fw-bold text-primary d-block">{formatTime(depDate)}</span>
              <span className="fw-bold text-dark fs-7">{flight.departure_airport}</span>
            </div>
            <div className="px-2">
              <small className="text-muted fs-8 d-block">{durationStr}</small>
              <span className="material-icons text-primary font-size-16 rotate-90">flight_takeoff</span>
              <small className="text-success fw-semibold fs-8 d-block">{flight.stops}</small>
            </div>
            <div className="text-end">
              <span className="fs-6 fw-bold text-primary d-block">{formatTime(arrDate)}</span>
              <span className="fw-bold text-dark fs-7">{flight.arrival_airport}</span>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between pt-1">
            <div>
              <small className="text-muted d-block font-size-11">Price per passenger</small>
              <strong className="fs-5 fw-black text-dark">₹{parseFloat(flight.price).toLocaleString('en-IN')}</strong>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="rounded-3 px-3 py-1.5 fw-bold btn-color shadow-sm fs-7"
              onClick={() => onBook(flight)}
              disabled={flight.available_seats <= 0}
            >
              {flight.available_seats > 0 ? "Book Deal" : "Sold Out"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="flight-detail-card border-0 shadow-sm rounded-4 mb-3 overflow-hidden position-relative hover-lift">
      <Card.Body className="p-4">
        <div className="row g-3 align-items-center">
          
          {/* Airline Logo & Name */}
          <div className="col-lg-3 col-md-12 d-flex align-items-center">
            <div className="airline-logo-container p-2 rounded-3 bg-light d-flex align-items-center justify-content-center">
              <img
                src={logoSrc}
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AIRLINE_LOGO; }}
                alt={flight.airline_name}
                className="airline-logo-img object-fit-contain"
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
          <div className="col-lg-3 col-md-4 border-start-lg ps-lg-4 text-start text-md-end mt-3 mt-md-0 pt-3 pt-md-0 border-top border-top-md-0 border-light">
            <div className="d-flex flex-row flex-md-column justify-content-between align-items-center align-items-md-end w-100 gap-2">
              <div className="text-start text-md-end">
                <span className="text-muted d-block fs-7">Price per passenger</span>
                <span className="fs-2 fw-black text-dark d-block">₹{parseFloat(flight.price).toLocaleString('en-IN')}</span>
              </div>
              
              <div className="d-flex flex-column align-items-end gap-1">
                <span className="badge bg-warning-subtle text-warning-emphasis mb-1 mb-md-2 fw-bold align-self-end">
                  {flight.available_seats} seats left
                </span>
                <Button
                  variant="primary"
                  className="rounded-3 py-2 px-4 px-md-3 w-md-100 fw-bold btn-color text-uppercase letter-spacing-1 shadow-sm fs-6"
                  onClick={() => onBook(flight)}
                  disabled={flight.available_seats <= 0}
                >
                  {flight.available_seats > 0 ? "Book Now" : "Sold Out"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </Card.Body>
    </Card>
  );
};

export default FlightsDetailCard;