// Teacher dashboard: view students, mark/view/update attendance and grades.
import { useEffect, useState } from 'react';
import { studentApi, academicApi } from '../api/client';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');

  const [attForm, setAttForm] = useState({ date: '', status: 'present' });
  const [gradeForm, setGradeForm] = useState({ subject: '', term: '', grade: '' });

  useEffect(() => {
    studentApi.get('/students').then((res) => setStudents(res.data)).catch((err) => setError(err.response?.data?.error || 'Failed to load students'));
  }, []);

  async function loadStudentRecords(id) {
    setSelectedId(id);
    setError('');
    if (!id) return;
    try {
      const [aRes, gRes] = await Promise.all([
        academicApi.get(`/attendance/student/${id}`),
        academicApi.get(`/grades/student/${id}`),
      ]);
      setAttendance(aRes.data);
      setGrades(gRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records');
    }
  }

  async function submitAttendance(e) {
    e.preventDefault();
    if (!selectedId) return setError('Select a student first');
    setError('');
    try {
      await academicApi.post('/attendance', { studentId: Number(selectedId), date: attForm.date, status: attForm.status });
      setAttForm({ date: '', status: 'present' });
      loadStudentRecords(selectedId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    }
  }

  async function updateAttendanceStatus(id, status) {
    try {
      await academicApi.put(`/attendance/${id}`, { status });
      loadStudentRecords(selectedId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update attendance');
    }
  }

  async function submitGrade(e) {
    e.preventDefault();
    if (!selectedId) return setError('Select a student first');
    setError('');
    try {
      await academicApi.post('/grades', { studentId: Number(selectedId), ...gradeForm });
      setGradeForm({ subject: '', term: '', grade: '' });
      loadStudentRecords(selectedId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add grade');
    }
  }

  async function updateGradeValue(id, grade) {
    try {
      await academicApi.put(`/grades/${id}`, { grade });
      loadStudentRecords(selectedId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update grade');
    }
  }

  return (
    <div className="container">
      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <h3>All Students</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Class</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Attendance & Grades</h3>
        <label>Select Student</label>
        <select value={selectedId} onChange={(e) => loadStudentRecords(e.target.value)}>
          <option value="">-- choose a student --</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
        </select>

        {selectedId && (
          <>
            <h4>Mark Attendance</h4>
            <form onSubmit={submitAttendance} className="grid-2">
              <div><label>Date</label><input type="date" required value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} /></div>
              <div>
                <label>Status</label>
                <select value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><button className="btn" type="submit">Save Attendance</button></div>
            </form>

            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date?.slice(0, 10)}</td>
                      <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                      <td>
                        <select value={a.status} onChange={(e) => updateAttendanceStatus(a.id, e.target.value)}>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4>Add Grade</h4>
            <form onSubmit={submitGrade} className="grid-2">
              <div><label>Subject</label><input required value={gradeForm.subject} onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })} /></div>
              <div><label>Term</label><input required value={gradeForm.term} onChange={(e) => setGradeForm({ ...gradeForm, term: e.target.value })} /></div>
              <div><label>Grade</label><input required value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} /></div>
              <div style={{ gridColumn: '1 / -1' }}><button className="btn" type="submit">Save Grade</button></div>
            </form>

            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Term</th><th>Grade</th><th>Update</th></tr></thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td>{g.subject}</td><td>{g.term}</td><td>{g.grade}</td>
                      <td>
                        <input style={{ width: 60, margin: 0 }} defaultValue={g.grade}
                          onBlur={(e) => e.target.value !== g.grade && updateGradeValue(g.id, e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
