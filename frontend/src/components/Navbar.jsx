import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="navbar">
      <h1>Regent College London - Student Management</h1>
      <div className="links">
        <span>{user.fullName} ({user.role})</span>
        <Link to="/">Dashboard</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
