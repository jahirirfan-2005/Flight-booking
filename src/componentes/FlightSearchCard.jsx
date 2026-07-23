import { useState, useRef, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const AIRPORTS = [
  { city: "Chennai", code: "MAA", name: "Chennai International Airport" },
  { city: "Mumbai", code: "BOM", name: "Chhatrapati Shivaji Maharaj Airport" },
  { city: "Delhi", code: "DEL", name: "Indira Gandhi International Airport" },
  { city: "Dubai", code: "DXB", name: "Dubai International Airport" },
  { city: "London", code: "LHR", name: "Heathrow Airport" },
  { city: "New York", code: "JFK", name: "John F. Kennedy Airport" },
  { city: "Singapore", code: "SIN", name: "Changi Airport" },
  { city: "Jakarta", code: "CGK", name: "Soekarno-Hatta Airport" }
];

const FlightSearchCard = ({ onSearch }) => {
  const [userdata, setUserdata] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    passengers: 1,
    travelClass: 'Economy'
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const swapCities = () => {
    setUserdata(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setUserdata({
      ...userdata,
      [name]: value
    });

    // Suggestions logic
    if (name === 'from') {
      if (value.trim().length > 0) {
        const filtered = AIRPORTS.filter(
          item => item.city.toLowerCase().includes(value.toLowerCase()) || 
                  item.code.toLowerCase().includes(value.toLowerCase())
        );
        setFromSuggestions(filtered);
        setShowFromSuggestions(true);
      } else {
        setFromSuggestions([]);
        setShowFromSuggestions(false);
      }
    }

    if (name === 'to') {
      if (value.trim().length > 0) {
        const filtered = AIRPORTS.filter(
          item => item.city.toLowerCase().includes(value.toLowerCase()) || 
                  item.code.toLowerCase().includes(value.toLowerCase())
        );
        setToSuggestions(filtered);
        setShowToSuggestions(true);
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
    }
  };

  const selectSuggestion = (name, item) => {
    setUserdata({
      ...userdata,
      [name]: item.city
    });
    if (name === 'from') {
      setShowFromSuggestions(false);
    } else {
      setShowToSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(userdata);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="search-card-container" ref={cardRef}>
      <Card className="card-design border-0 shadow-lg p-3 rounded-4 overflow-hidden position-relative">
        <div className="gradient-accent-bar"></div>
        <Card.Body className="pt-4">
          <div className="row g-4 align-items-center">
            {/* Visual Section */}
            <div className="col-lg-5 d-none d-lg-block position-relative">
              <div className="text-white p-4 rounded-4 h-100 d-flex flex-column justify-content-between search-card-hero">
                <div className="overlay-gradient"></div>
                <div className="z-1">
                  <span className="badge bg-light text-primary mb-2 fw-semibold px-3 py-2 rounded-pill">Premium Experience</span>
                  <h2 className="display-6 fw-bold mb-3 text-white">Let's explore the world together</h2>
                  <p className="opacity-75 fs-6">Find the best fares, check real-time schedules, and secure your seats instantly.</p>
                </div>
                <div className="z-1 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-group">
                      <div className="avatar-dot bg-success"></div>
                    </div>
                    <small className="text-white-50">300+ Active routes populated</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="col-lg-7 col-md-12">
              <div className="d-flex align-items-center mb-3">
                <span className="material-icons text-primary me-2">flight_takeoff</span>
                <h4 className="fw-bold mb-0">Book your Flight</h4>
              </div>
              
              <Form onSubmit={handleSubmit} className="position-relative">
                <div className="row g-3 align-items-end">
                  {/* From Field */}
                  <div className="col-md-5 position-relative">
                    <Form.Group controlId="searchFrom">
                      <Form.Label className="fw-semibold text-secondary">From</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g. Chennai" 
                        onChange={handlechange} 
                        value={userdata.from} 
                        name="from"
                        autoComplete="off"
                        className="py-2.5 rounded-3 form-custom-input"
                        required
                      />
                    </Form.Group>
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <div className="autocomplete-suggestions shadow-lg rounded-3 border">
                        {fromSuggestions.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="suggestion-item d-flex justify-content-between align-items-center"
                            onClick={() => selectSuggestion('from', item)}
                          >
                            <div>
                              <strong className="text-dark">{item.city}</strong> 
                              <span className="text-muted ms-2 fs-7">{item.name}</span>
                            </div>
                            <span className="badge bg-secondary-subtle text-secondary">{item.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="col-md-2 text-center d-flex justify-content-center">
                    <Button 
                      type="button" 
                      variant="light" 
                      onClick={swapCities} 
                      title="Swap departure and destination"
                      className="rounded-circle border shadow-sm p-2 d-flex align-items-center justify-content-center hover-lift"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <span className="material-icons text-primary font-size-20">swap_horiz</span>
                    </Button>
                  </div>

                  {/* To Field */}
                  <div className="col-md-5 position-relative">
                    <Form.Group controlId="searchTo">
                      <Form.Label className="fw-semibold text-secondary">To</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g. Dubai" 
                        onChange={handlechange} 
                        value={userdata.to} 
                        name="to"
                        autoComplete="off"
                        className="py-2.5 rounded-3 form-custom-input"
                        required
                      />
                    </Form.Group>
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <div className="autocomplete-suggestions shadow-lg rounded-3 border">
                        {toSuggestions.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="suggestion-item d-flex justify-content-between align-items-center"
                            onClick={() => selectSuggestion('to', item)}
                          >
                            <div>
                              <strong className="text-dark">{item.city}</strong> 
                              <span className="text-muted ms-2 fs-7">{item.name}</span>
                            </div>
                            <span className="badge bg-secondary-subtle text-secondary">{item.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Field */}
                  <div className="col-md-4">
                    <Form.Group controlId="searchDate">
                      <Form.Label className="fw-semibold text-secondary">Departure Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        min={todayStr}
                        onChange={handlechange} 
                        value={userdata.date} 
                        name="date"
                        className="py-2.5 rounded-3 form-custom-input"
                        required
                      />
                    </Form.Group>
                  </div>

                  {/* Passengers Count */}
                  <div className="col-md-4">
                    <Form.Group controlId="searchPassengers">
                      <Form.Label className="fw-semibold text-secondary">Passengers</Form.Label>
                      <Form.Select 
                        name="passengers" 
                        value={userdata.passengers} 
                        onChange={handlechange}
                        className="py-2.5 rounded-3 form-custom-input"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  {/* Travel Class */}
                  <div className="col-md-4">
                    <Form.Group controlId="searchClass">
                      <Form.Label className="fw-semibold text-secondary">Class</Form.Label>
                      <Form.Select 
                        name="travelClass" 
                        value={userdata.travelClass} 
                        onChange={handlechange}
                        className="py-2.5 rounded-3 form-custom-input"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Business">Business</option>
                        <option value="First">First Class</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                <Button variant="primary" className="w-100 btn-color py-2.5 rounded-3 mt-4 fs-5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" type="submit">
                  <span>Search Flights</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </Button>
              </Form>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FlightSearchCard;