// Student dashboard: view own profile, attendance, and grades (read-only).
import { useEffect, useState } from 'react';
import { studentApi, academicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [pRes, aRes, gRes] = await Promise.all([
          studentApi.get(`/students/${user.linkedId}`),
          academicApi.get(`/attendance/student/${user.linkedId}`),
          academicApi.get(`/grades/student/${user.linkedId}`),
        ]);
        setProfile(pRes.data);
        setAttendance(aRes.data);
        setGrades(gRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load your data');
      }
    }
    if (user?.linkedId) load();
  }, [user]);

  const presentCount = attendance.filter((a) => a.status === 'present').length;

  return (
    <div className="container">
      {error && <div className="error-msg">{error}</div>}

      {profile && (
        <div className="card">
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Class:</strong> {profile.class}</p>
          <p><strong>Date of Birth:</strong> {profile.dob?.slice(0, 10)}</p>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-box"><div className="num">{attendance.length}</div><div className="label">Attendance Records</div></div>
        <div className="stat-box"><div className="num">{presentCount}</div><div className="label">Days Present</div></div>
        <div className="stat-box"><div className="num">{grades.length}</div><div className="label">Grades Recorded</div></div>
      </div>

      <div className="card">
        <h3>My Attendance</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}><td>{a.date?.slice(0, 10)}</td><td><span className={`badge ${a.status}`}>{a.status}</span></td></tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan={2}>No records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>My Grades</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Term</th><th>Grade</th></tr></thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}><td>{g.subject}</td><td>{g.term}</td><td>{g.grade}</td></tr>
              ))}
              {grades.length === 0 && <tr><td colSpan={3}>No records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
