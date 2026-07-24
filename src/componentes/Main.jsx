import { useState, useEffect } from "react";
import axios from "axios";
import FlightSearchCard from "./FlightSearchCard";
import FlightsDetailCard from "./FlightsDetailCard";
import BookingModal from "./BookingModal";
import FlightSliderDetails from "./FlightSliderDetails";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

const Main = ({ onBookingSuccess, onSelectDirectFlight, preselectedFlight, clearPreselectedFlight }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Search parameters tracked in state
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
    travelClass: "Economy"
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState("price_asc"); // price_asc, price_desc, time_asc
  const [airlineFilter, setAirlineFilter] = useState("All");

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Load all/upcoming flights initially
  const loadInitialFlights = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get("https://flight-booking-backend-production-9241.up.railway.app/api/flights/");
      setFlights(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to connect to the flight server. Showing offline/mock suggestions instead.");
      
      // Offline fallback: generate mock flights so UI is always visual and testable
      setFlights([
        {
          id: 9991,
          airline_name: "Air India",
          flight_number: "AI243",
          departure_airport: "MAA",
          departure_city: "Chennai",
          arrival_airport: "BOM",
          arrival_city: "Mumbai",
          departure_time: new Date(Date.now() + 4 * 3600000).toISOString(),
          arrival_time: new Date(Date.now() + 6.2 * 3600000).toISOString(),
          price: 5200,
          available_seats: 45,
          stops: "Non-stop",
          logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Air_India_Logo.svg/256px-Air_India_Logo.svg.png"
        },
        {
          id: 9992,
          airline_name: "Emirates",
          flight_number: "EK542",
          departure_airport: "MAA",
          departure_city: "Chennai",
          arrival_airport: "DXB",
          arrival_city: "Dubai",
          departure_time: new Date(Date.now() + 8 * 3600000).toISOString(),
          arrival_time: new Date(Date.now() + 12.5 * 3600000).toISOString(),
          price: 24500,
          available_seats: 12,
          stops: "Non-stop",
          logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/256px-Emirates_logo.svg.png"
        },
        {
          id: 9993,
          airline_name: "IndiGo",
          flight_number: "6E503",
          departure_airport: "MAA",
          departure_city: "Delhi",
          arrival_airport: "BOM",
          arrival_city: "Mumbai",
          departure_time: new Date(Date.now() + 24 * 3600000).toISOString(),
          arrival_time: new Date(Date.now() + 26.5 * 3600000).toISOString(),
          price: 4300,
          available_seats: 5,
          stops: "Non-stop",
          logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/IndiGo_logo.svg/256px-IndiGo_logo.svg.png"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialFlights();
  }, []);

  // Handle direct flight selection from schedule
  useEffect(() => {
    if (preselectedFlight) {
      setSelectedFlight(preselectedFlight);
      setSearchParams(prev => ({
        ...prev,
        travelClass: "Economy" // default
      }));
      setShowBookingModal(true);
      if (clearPreselectedFlight) {
        clearPreselectedFlight();
      }
    }
  }, [preselectedFlight]);

  const handleSearch = async (userdata) => {
    setLoading(true);
    setErrorMsg(null);
    setHasSearched(true);
    setSearchParams(userdata);
    
    try {
      // Build query string
      const response = await axios.get(
        `http://localhost:8000/api/flights/?from=${encodeURIComponent(userdata.from)}&to=${encodeURIComponent(userdata.to)}&date=${userdata.date}`
      );
      setFlights(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Error matching flight database. Showing mock filters for offline search.");
      // offline filter helper
      const matched = flights.filter(f => 
        (f.departure_city.toLowerCase().includes(userdata.from.toLowerCase()) || f.departure_airport.toLowerCase().includes(userdata.from.toLowerCase())) &&
        (f.arrival_city.toLowerCase().includes(userdata.to.toLowerCase()) || f.arrival_airport.toLowerCase().includes(userdata.to.toLowerCase()))
      );
      setFlights(matched);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingDetails) => {
    if (onBookingSuccess) {
      onBookingSuccess(bookingDetails);
    }
  };

  // Unique airlines for dropdown filter
  const getUniqueAirlines = () => {
    const names = flights.map(f => f.airline_name);
    return ["All", ...new Set(names)];
  };

  // Filter & Sort flights
  const getProcessedFlights = () => {
    let list = [...flights];

    // Filter by airline
    if (airlineFilter !== "All") {
      list = list.filter(f => f.airline_name === airlineFilter);
    }

    // Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "time_asc") {
      list.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
    }

    return list;
  };

  const getFeaturedFlights = () => {
    return [...flights]
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 5);
  };

  const featuredFlights = getFeaturedFlights();
  const processedFlights = getProcessedFlights();

  return (
    <div className="row g-4">
      <div className="col-12">
        {/* Advanced search section */}
        <FlightSearchCard onSearch={handleSearch} />

        {/* Dynamic Search Route details header */}
        {hasSearched && searchParams.from && searchParams.to && (
          <div className="my-4 p-4 rounded-4 bg-white shadow-sm border border-light">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <small className="text-secondary fw-semibold uppercase block">Departure</small>
                  <h4 className="fw-bold mb-0 text-dark">{searchParams.from}</h4>
                </div>
                <div className="px-3 d-flex align-items-center justify-content-center text-primary">
                  <span className="material-icons font-size-24 rotate-90">flight_takeoff</span>
                </div>
                <div>
                  <small className="text-secondary fw-semibold uppercase block">Destination</small>
                  <h4 className="fw-bold mb-0 text-dark">{searchParams.to}</h4>
                </div>
              </div>
              <div className="border-start-dashed ps-md-4 py-1">
                <small className="text-secondary d-block">Travel Details</small>
                <strong className="text-primary-emphasis">
                  {new Date(searchParams.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {searchParams.passengers} Traveler(s) • {searchParams.travelClass}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Split results list and Featured Flights Sidebar */}
        <div className="row g-4 mt-2">
          <div className={!hasSearched && featuredFlights.length > 0 ? "col-lg-8 col-md-7 col-12" : "col-12"}>
            {/* Dashboard Results Controls */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-3 bg-light p-3 rounded-3 border">
              <div className="fw-bold text-dark">
                Showing {processedFlights.length} {processedFlights.length === 1 ? "flight" : "flights"} found
              </div>
              
              <div className="d-flex flex-wrap gap-2.5 w-100 w-sm-auto justify-content-sm-end">
                {/* Sort by dropdown */}
                <div className="d-flex align-items-center gap-1.5">
                  <small className="text-secondary fw-bold">Sort:</small>
                  <select 
                    className="form-select form-select-sm rounded-2 cursor-pointer border-grey"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ width: '135px' }}
                  >
                    <option value="price_asc">Price: Low-High</option>
                    <option value="price_desc">Price: High-Low</option>
                    <option value="time_asc">Departure Time</option>
                  </select>
                </div>

                {/* Filter by Airline */}
                <div className="d-flex align-items-center gap-1.5">
                  <small className="text-secondary fw-bold">Airline:</small>
                  <select 
                    className="form-select form-select-sm rounded-2 cursor-pointer border-grey"
                    value={airlineFilter} 
                    onChange={(e) => setAirlineFilter(e.target.value)}
                    style={{ width: '135px' }}
                  >
                    {getUniqueAirlines().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Warnings or alerts */}
            {errorMsg && <Alert variant="warning" className="py-2.5 rounded-3">{errorMsg}</Alert>}

            {/* Loading Spinner */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="text-muted">Fetching matching flights...</p>
              </div>
            ) : (
              <div className="flights-list">
                {processedFlights.length > 0 ? (
                  processedFlights.map((flight) => (
                    <FlightsDetailCard 
                      key={flight.id} 
                      flight={flight} 
                      onBook={handleBookFlight} 
                    />
                  ))
                ) : (
                  <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted">
                    <span className="material-icons font-size-48 text-secondary mb-3">sentiment_dissatisfied</span>
                    <h4>No Flights Available</h4>
                    <p className="max-width-400 mx-auto text-secondary">
                      We couldn't find flights matching your destination. Try adjusting your search values or check upcoming dates.
                    </p>
                    <Button variant="outline-primary" onClick={loadInitialFlights} className="mt-2 rounded-3 px-4">
                      Show All Flights
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!hasSearched && featuredFlights.length > 0 && (
            <div className="col-lg-4 col-md-5 col-12 ps-lg-4">
              <div className="card-design border-0 shadow-sm p-4 rounded-4 bg-white position-sticky" style={{ top: '24px' }}>
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <span className="material-icons text-warning font-size-24">local_fire_department</span>
                  <h5 className="fw-bold mb-0 text-dark">Trending Deals</h5>
                </div>
                <p className="text-secondary fs-7 mb-4">Grab these low-cost routes before they sell out!</p>
                <FlightSliderDetails flights={featuredFlights} onBook={handleBookFlight} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedFlight && (
        <BookingModal 
          show={showBookingModal} 
          onHide={() => setShowBookingModal(false)} 
          flight={selectedFlight} 
          onBookingSuccess={handleBookingSuccess}
          initialClass={searchParams.travelClass}
          passengers={searchParams.passengers}
        />
      )}
    </div>
  );
};

export default Main;