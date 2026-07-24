import { useState } from "react";
import Sidebar from "../componentes/Sidebar";
import Main from "../componentes/Main";
import TicketView from "./TicketView";
import HistoryView from "./HistoryView";
import ScheduleView from "./ScheduleView";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

const Home = () => {
  const [currentPage, setCurrentPage] = useState("Home");
  const [activeBooking, setActiveBooking] = useState(null);
  const [preselectedFlight, setPreselectedFlight] = useState(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aeroswift_settings');
    return saved ? JSON.parse(saved) : {
      glassmorphism: true,
      animations: true,
      autoCacheEmail: true
    };
  });

  const [supportSubmitted, setSupportSubmitted] = useState(null); // ticket ID or null
  const [supportInquiries, setSupportInquiries] = useState(() => {
    const saved = localStorage.getItem('aeroswift_support_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSetting = (key) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('aeroswift_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBookingSuccess = (bookingDetails) => {
    setActiveBooking(bookingDetails);
    setCurrentPage("Ticket"); // redirect immediately to show boarding pass
  };

  const handleSelectFlightDirect = (flight) => {
    setPreselectedFlight(flight);
    setCurrentPage("Home"); // Redirect to home search view to trigger modal
  };

  const handleViewTicket = (bookingDetails) => {
    setActiveBooking(bookingDetails);
    setCurrentPage("Ticket"); // Redirect to boarding pass details
  };

  // Render subviews
  const renderContent = () => {
    switch (currentPage) {
      case "Home":
        return (
          <Main 
            onBookingSuccess={handleBookingSuccess} 
            preselectedFlight={preselectedFlight}
            clearPreselectedFlight={() => setPreselectedFlight(null)}
          />
        );
      case "Ticket":
        return <TicketView booking={activeBooking} />;
      case "Schedule":
        return <ScheduleView onSelectFlight={handleSelectFlightDirect} />;
      case "History":
        return <HistoryView onViewTicket={handleViewTicket} />;
      case "Support":
        return renderSupportView();
      case "Settings":
        return renderSettingsView();
      default:
        return <Main onBookingSuccess={handleBookingSuccess} />;
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.supportName.value;
    const email = form.supportEmail.value;
    const msg = form.supportMsg.value;
    const ticketId = 'TK-' + Math.floor(100000 + Math.random() * 900000);
    const newInquiry = { id: ticketId, name, email, msg, date: new Date().toLocaleDateString() };
    const updated = [newInquiry, ...supportInquiries];
    setSupportInquiries(updated);
    localStorage.setItem('aeroswift_support_tickets', JSON.stringify(updated));
    setSupportSubmitted(ticketId);
    form.reset();
  };

  const renderSupportView = () => (
    <div className="support-view my-4">
      <Card className="card-design border-0 shadow-sm p-4 rounded-4 bg-white">
        <Card.Body>
          <div className="text-center mb-4">
            <span className="material-icons text-primary font-size-48 mb-2">support_agent</span>
            <h4 className="fw-bold">AeroSwift Customer Care</h4>
            <p className="text-secondary fs-7 max-width-500 mx-auto">
              Our 24/7 help desk is here to support you with ticket refunds, schedules, gate change info, or flight changes.
            </p>
          </div>
          <hr />
          {supportSubmitted ? (
            <Alert variant="success" onClose={() => setSupportSubmitted(null)} dismissible className="py-3 px-4 rounded-4 shadow-sm text-center my-4">
              <span className="material-icons text-success font-size-36 mb-2">check_circle</span>
              <h5 className="fw-bold mb-1">Support Ticket {supportSubmitted} Created!</h5>
              <p className="text-secondary-emphasis fs-7 mb-0">Our support staff will review your inquiry and contact you via email within 2 hours.</p>
            </Alert>
          ) : (
            <div className="row g-4 mt-2">
              <div className="col-md-6">
                <h5 className="fw-bold mb-3 text-dark">Submit Support Ticket</h5>
                <Form onSubmit={handleSupportSubmit}>
                  <Form.Group className="mb-3" controlId="supportName">
                    <Form.Label className="fw-semibold text-secondary">Your Name</Form.Label>
                    <Form.Control type="text" placeholder="Irfan" name="supportName" className="py-2 rounded-3 form-custom-input" required />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="supportEmail">
                    <Form.Label className="fw-semibold text-secondary">Email</Form.Label>
                    <Form.Control type="email" placeholder="name@example.com" name="supportEmail" className="py-2 rounded-3 form-custom-input" required />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="supportMsg">
                    <Form.Label className="fw-semibold text-secondary">Message Description</Form.Label>
                    <Form.Control as="textarea" rows={4} name="supportMsg" placeholder="Describe your query or refund details" className="rounded-3 form-custom-input" required />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-color px-4 py-2 rounded-3 fw-bold shadow-sm">
                    Send Inquiry
                  </Button>
                </Form>
              </div>
            <div className="col-md-6">
              <h5 className="fw-bold mb-3 text-dark">Instant Helpline Contacts</h5>
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="material-icons text-primary font-size-18">phone</span>
                  <strong className="text-dark">India Toll-Free Helpline:</strong>
                </div>
                <div className="fs-6 fw-bold ps-4 text-primary">+91 1800 240 500</div>
              </div>
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="material-icons text-primary font-size-18">email</span>
                  <strong className="text-dark">Global Support Email:</strong>
                </div>
                <div className="fs-6 fw-bold ps-4 text-primary">support@aeroswift-airlines.com</div>
              </div>

              {supportInquiries.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-2 text-dark">Submitted Tickets ({supportInquiries.length})</h6>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {supportInquiries.map((ticket) => (
                      <div key={ticket.id} className="p-2.5 bg-light rounded-3 border fs-7">
                        <div className="d-flex justify-content-between font-weight-600">
                          <span className="text-primary">{ticket.id}</span>
                          <span className="text-muted fs-8">{ticket.date}</span>
                        </div>
                        <div className="text-truncate text-secondary">{ticket.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  const renderSettingsView = () => (
    <div className="settings-view my-4">
      <Card className="card-design border-0 shadow-sm p-4 rounded-4 bg-white">
        <Card.Body>
          <h4 className="fw-bold mb-1">Configuration & Settings</h4>
          <p className="text-secondary fs-7 mb-4">Manage app behavior and connect backend databases.</p>
          <hr />
          
          <div className="row g-4 pt-2">
            <div className="col-md-7">
              <h5 className="fw-bold mb-3 text-dark">Server Endpoints</h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Django Core API Base Endpoint</Form.Label>
                <Form.Control type="text" value="https://flight-booking-backend-production-9241.up.railway.app/api/" disabled className="py-2.5 rounded-3 form-custom-input font-monospace bg-light-subtle" />
                <Form.Text className="text-muted">Currently routed to live local flight engine.</Form.Text>
              </Form.Group>

              <h5 className="fw-bold mt-4 mb-3 text-dark">UI Customization</h5>
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="themeSwitch" 
                  checked={settings.glassmorphism}
                  onChange={() => toggleSetting('glassmorphism')}
                />
                <label className="form-check-label fw-semibold text-secondary" htmlFor="themeSwitch">Enable Premium Glassmorphism styling</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="animSwitch" 
                  checked={settings.animations}
                  onChange={() => toggleSetting('animations')}
                />
                <label className="form-check-label fw-semibold text-secondary" htmlFor="animSwitch">Enable hover lift animation filters</label>
              </div>
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="emailCacheSwitch" 
                  checked={settings.autoCacheEmail}
                  onChange={() => toggleSetting('autoCacheEmail')}
                />
                <label className="form-check-label fw-semibold text-secondary" htmlFor="emailCacheSwitch">Auto-cache history lookup email in browser</label>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card bg-primary-subtle text-primary-emphasis p-4 rounded-4 border-0 h-100">
                <h6 className="fw-bold mb-2">Developer Tools</h6>
                <p className="fs-7 text-secondary-emphasis">You can run direct seeding scripts or reset flight databases inside workspace shell terminal.</p>
                <code className="bg-white p-2 rounded d-block font-monospace fs-7 border border-primary border-opacity-10 mb-3 text-center">
                  python backend/seed.py
                </code>
                <small className="font-weight-600 block mt-2 text-dark">Active Modules:</small>
                <ul className="fs-7 mt-1 ps-3 mb-0">
                  <li>SQLite Database</li>
                  <li>Django Core API Viewsets</li>
                  <li>React Bootstrap Framework</li>
                  <li>Material Icons CDN</li>
                </ul>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <div className="d-flex w-100 flex-column flex-md-row min-vh-100 bg-body-tertiary">
      {/* Sidebar Panel */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main Content Area */}
      <div className="main-container flex-grow-1 p-3 p-md-4 p-lg-5 overflow-x-hidden">
        <header className="no-print d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-black text-dark mb-1 h3">
              {currentPage === "Home" && "Discover Flights"}
              {currentPage === "Ticket" && "Your Boarding Pass"}
              {currentPage === "Schedule" && "Flight Directory"}
              {currentPage === "History" && "Manage Bookings"}
              {currentPage === "Support" && "Customer Support Desk"}
              {currentPage === "Settings" && "Application Control"}
            </h1>
            <p className="text-secondary mb-0 fs-7">
              {currentPage === "Home" && "Search, select, and book tickets globally."}
              {currentPage === "Ticket" && "Print or save your digital boarding ticket."}
              {currentPage === "Schedule" && "Complete catalog of operational routes."}
              {currentPage === "History" && "Check active itineraries or cancel reservations."}
              {currentPage === "Support" && "Get immediate help with support tickets."}
              {currentPage === "Settings" && "Adjust API targets and aesthetic variables."}
            </p>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <span className="fw-bold d-block text-dark">Irfan's Profile</span>
              <small className="text-secondary fw-semibold">Standard traveler</small>
            </div>
            <span className="avatar bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center font-size-18" style={{ width: '40px', height: '40px' }}>
              I
            </span>
          </div>
        </header>

        {/* Content Box */}
        <div className="content-render-box">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Home;