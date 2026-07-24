import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

import { getAirlineLogo, DEFAULT_AIRLINE_LOGO } from '../utils/airlineLogos';

const ScheduleView = ({ onSelectFlight }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const fetchSchedule = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.get("https://flight-booking-backend-production-9241.up.railway.app/api/flights/");
      setFlights(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Unable to retrieve flight schedule. Please verify that the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (arr, dep) => {
    const ms = new Date(arr) - new Date(dep);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.round((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  // Client-side quick filter
  const filteredFlights = flights.filter(f => {
    const matchFrom = filterFrom.trim() === '' || 
      f.departure_city.toLowerCase().includes(filterFrom.toLowerCase()) || 
      f.departure_airport.toLowerCase().includes(filterFrom.toLowerCase());
    
    const matchTo = filterTo.trim() === '' || 
      f.arrival_city.toLowerCase().includes(filterTo.toLowerCase()) || 
      f.arrival_airport.toLowerCase().includes(filterTo.toLowerCase());

    return matchFrom && matchTo;
  });

  return (
    <div className="schedule-view-container my-4">
      {/* Timetable Header and Search */}
      <Card className="card-design border-0 shadow-sm p-3 rounded-4 mb-4">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h5 className="fw-bold mb-1">Flight Schedules & Timetable</h5>
              <p className="text-secondary mb-0 fs-7">Real-time timetable of all operating domestic and international routes.</p>
            </div>
            <Button variant="outline-primary" onClick={fetchSchedule} disabled={loading} className="rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2">
              <span className="material-icons font-size-18">refresh</span>
              <span>Refresh Schedule</span>
            </Button>
          </div>
          
          <hr className="my-3" />
          
          {/* Quick Filters */}
          <div className="row g-3">
            <div className="col-md-6">
              <Form.Control 
                type="text" 
                placeholder="Filter by departure city or code (e.g. Chennai / MAA)" 
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="py-2 rounded-3 form-custom-input"
              />
            </div>
            <div className="col-md-6">
              <Form.Control 
                type="text" 
                placeholder="Filter by arrival city or code (e.g. Dubai / DXB)" 
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="py-2 rounded-3 form-custom-input"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {errorMsg && <Alert variant="danger" className="py-2.5 rounded-3 mb-3">{errorMsg}</Alert>}

      {/* Timetable Body */}
      <Card className="card-design border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-2" />
              <p className="text-muted">Loading schedule databank...</p>
            </div>
          ) : filteredFlights.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap table-custom">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary-emphasis">Airline</th>
                    <th className="py-3 text-secondary-emphasis">Route</th>
                    <th className="py-3 text-secondary-emphasis">Departure</th>
                    <th className="py-3 text-secondary-emphasis">Arrival</th>
                    <th className="py-3 text-secondary-emphasis">Duration & Stops</th>
                    <th className="py-3 text-secondary-emphasis">Base Fare</th>
                    <th className="py-3 text-secondary-emphasis text-center">Availability</th>
                    <th className="px-4 py-3 text-end text-secondary-emphasis">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2.5">
                          <img 
                            src={getAirlineLogo(f.airline_name, f.logo_url)} 
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AIRLINE_LOGO; }}
                            width={30} 
                            height={30} 
                            className="bg-light p-1 rounded border object-fit-contain" 
                            alt="" 
                          />
                          <div>
                            <strong className="d-block text-dark">{f.airline_name}</strong>
                            <small className="text-secondary">{f.flight_number}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold">{f.departure_city} → {f.arrival_city}</div>
                        <small className="text-secondary">{f.departure_airport} to {f.arrival_airport}</small>
                      </td>
                      <td className="py-3">
                        <strong>{formatTime(f.departure_time)}</strong>
                        <small className="text-secondary d-block">{formatDate(f.departure_time)}</small>
                      </td>
                      <td className="py-3">
                        <strong>{formatTime(f.arrival_time)}</strong>
                        <small className="text-secondary d-block">{formatDate(f.arrival_time)}</small>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold">{getDuration(f.arrival_time, f.departure_time)}</div>
                        <small className="text-success fw-bold">{f.stops}</small>
                      </td>
                      <td className="py-3">
                        <strong className="text-dark">₹{parseInt(f.price).toLocaleString('en-IN')}</strong>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`badge ${f.available_seats > 20 ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'} px-2.5 py-1.5 rounded fw-semibold`}>
                          {f.available_seats} seats left
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="rounded-2 btn-color font-weight-600 px-3"
                          onClick={() => onSelectFlight(f)}
                        >
                          Book Direct
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <span className="material-icons font-size-36 text-secondary mb-2">flight_takeoff</span>
              <p className="mb-0">No matching flights in schedule.</p>
              <small className="text-secondary-emphasis">Adjust your search filter parameters.</small>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ScheduleView;
