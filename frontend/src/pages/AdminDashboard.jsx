// Admin dashboard: view/add/edit/delete students and teachers.
import { useEffect, useState } from 'react';
import { studentApi } from '../api/client';

const emptyStudentForm = { username: '', password: '', name: '', email: '', dob: '', class: '' };
const emptyTeacherForm = { username: '', password: '', name: '', email: '', subject: '' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');

  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  async function loadData() {
    setError('');
    try {
      const [sRes, tRes] = await Promise.all([studentApi.get('/students'), studentApi.get('/teachers')]);
      setStudents(sRes.data);
      setTeachers(tRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ---------- Students ----------
  async function submitStudent(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingStudentId) {
        await studentApi.put(`/students/${editingStudentId}`, {
          name: studentForm.name,
          email: studentForm.email,
          dob: studentForm.dob || null,
          class: studentForm.class,
        });
      } else {
        await studentApi.post('/students', studentForm);
      }
      setStudentForm(emptyStudentForm);
      setEditingStudentId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save student');
    }
  }

  function editStudent(s) {
    setEditingStudentId(s.id);
    setStudentForm({ username: '', password: '', name: s.name, email: s.email, dob: s.dob?.slice(0, 10) || '', class: s.class || '' });
  }

  async function deleteStudent(id) {
    if (!confirm('Delete this student?')) return;
    try {
      await studentApi.delete(`/students/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete student');
    }
  }

  // ---------- Teachers ----------
  async function submitTeacher(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingTeacherId) {
        await studentApi.put(`/teachers/${editingTeacherId}`, {
          name: teacherForm.name,
          email: teacherForm.email,
          subject: teacherForm.subject,
        });
      } else {
        await studentApi.post('/teachers', teacherForm);
      }
      setTeacherForm(emptyTeacherForm);
      setEditingTeacherId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save teacher');
    }
  }

  function editTeacher(t) {
    setEditingTeacherId(t.id);
    setTeacherForm({ username: '', password: '', name: t.name, email: t.email, subject: t.subject || '' });
  }

  async function deleteTeacher(id) {
    if (!confirm('Delete this teacher?')) return;
    try {
      await studentApi.delete(`/teachers/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete teacher');
    }
  }

  return (
    <div className="container">
      <div className="stats-row">
        <div className="stat-box"><div className="num">{students.length}</div><div className="label">Students</div></div>
        <div className="stat-box"><div className="num">{teachers.length}</div><div className="label">Teachers</div></div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <button className="btn" onClick={() => setTab('students')}>Students</button>
          <button className="btn" onClick={() => setTab('teachers')}>Teachers</button>
        </div>

        {tab === 'students' && (
          <>
            <h3>{editingStudentId ? 'Edit Student' : 'Add Student'}</h3>
            <form onSubmit={submitStudent} className="grid-2">
              {!editingStudentId && (
                <>
                  <div><label>Username</label><input required value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} /></div>
                  <div><label>Password</label><input required type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} /></div>
                </>
              )}
              <div><label>Name</label><input required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
              <div><label>Email</label><input required type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
              <div><label>Date of Birth</label><input type="date" value={studentForm.dob} onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })} /></div>
              <div><label>Class</label><input value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button className="btn" type="submit">{editingStudentId ? 'Update' : 'Add'} Student</button>
                {editingStudentId && (
                  <button type="button" className="btn" style={{ marginLeft: 8, background: '#6b7280' }}
                    onClick={() => { setEditingStudentId(null); setStudentForm(emptyStudentForm); }}>Cancel</button>
                )}
              </div>
            </form>

            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Class</th><th>Actions</th></tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.class}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => editStudent(s)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'teachers' && (
          <>
            <h3>{editingTeacherId ? 'Edit Teacher' : 'Add Teacher'}</h3>
            <form onSubmit={submitTeacher} className="grid-2">
              {!editingTeacherId && (
                <>
                  <div><label>Username</label><input required value={teacherForm.username} onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })} /></div>
                  <div><label>Password</label><input required type="password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} /></div>
                </>
              )}
              <div><label>Name</label><input required value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} /></div>
              <div><label>Email</label><input required type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} /></div>
              <div><label>Subject</label><input value={teacherForm.subject} onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button className="btn" type="submit">{editingTeacherId ? 'Update' : 'Add'} Teacher</button>
                {editingTeacherId && (
                  <button type="button" className="btn" style={{ marginLeft: 8, background: '#6b7280' }}
                    onClick={() => { setEditingTeacherId(null); setTeacherForm(emptyTeacherForm); }}>Cancel</button>
                )}
              </div>
            </form>

            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Actions</th></tr></thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td><td>{t.name}</td><td>{t.email}</td><td>{t.subject}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => editTeacher(t)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteTeacher(t.id)}>Delete</button>
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
