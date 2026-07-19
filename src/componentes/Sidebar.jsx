const Sidebar = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'Home', label: 'Home', icon: 'home' },
    { id: 'Ticket', label: 'Ticket', icon: 'confirmation_number' },
    { id: 'Schedule', label: 'Schedule', icon: 'schedule' },
    { id: 'History', label: 'History', icon: 'history' },
    { id: 'Support', label: 'Support', icon: 'contact_support' }
  ];

  const handleLinkClick = (e, pageId) => {
    e.preventDefault();
    if (onPageChange) {
      onPageChange(pageId);
    }
  };

  return (
    <div className="sidebar shadow-sm">
      <div className="sidebar-container d-flex flex-column justify-content-between h-100 py-3">
        <div className="w-100">
          <div className="sidebar-brand px-3 py-4 text-center">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="material-icons text-primary font-size-28">flight_takeoff</span>
              <h5 className="mb-0 fw-black text-dark brand-text">AeroSwift</h5>
            </div>
            <small className="text-secondary fw-semibold">Flight Booking App</small>
          </div>
          
          <nav className="sidebar-links mt-4">
            <ul>
              {menuItems.map((item) => (
                <li 
                  key={item.id} 
                  className={currentPage === item.id ? 'active' : ''}
                  onClick={(e) => handleLinkClick(e, item.id)}
                >
                  <a href={`#${item.id}`} className="d-flex align-items-center gap-3">
                    <span className="material-icons font-size-20">{item.icon}</span>
                    <span className="link-text font-weight-500">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav className="sidebar-links w-100 border-top pt-3">
          <ul>
            <li 
              className={currentPage === 'Settings' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'Settings')}
            >
              <a href="#Settings" className="d-flex align-items-center gap-3">
                <span className="material-icons font-size-20">settings</span>
                <span className="link-text font-weight-500">Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;