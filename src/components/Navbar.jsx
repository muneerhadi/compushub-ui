import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          CompusHub
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">Dashboard</Link>
            <Link className="nav-link" to="/courses">Courses</Link>
            <Link className="nav-link" to="/students">Students</Link>
            <Link className="nav-link" to="/sections">Sections</Link>
            <Link className="nav-link" to="/registrations">Registrations</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar