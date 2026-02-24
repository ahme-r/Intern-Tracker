import { useState, useEffect } from 'react';
import { getInterns, deleteIntern, createIntern, updateIntern } from './api';
import './App.css';
import {
  Plus, Search, Loader2, Edit3, Trash2,
  ChevronLeft, ChevronRight, User, Mail,
  Briefcase, Activity, Target, UserPlus,
  TrendingUp, X
} from 'lucide-react';

function App() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', role: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);

  useEffect(() => {
    fetchInterns();
  }, [pagination.page, filters, search]);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const { data } = await getInterns({
        q: search,
        status: filters.status,
        role: filters.role,
        page: pagination.page,
        limit: pagination.limit
      });
      setInterns(data.data);
      setPagination(prev => ({ ...prev, ...data.pagination }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch database records');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: pagination.total,
    hired: interns.filter(i => i.status === 'Hired').length,
    interviewing: interns.filter(i => i.status === 'Interviewing').length,
    avgScore: interns.length ? (interns.reduce((acc, i) => acc + i.score, 0) / interns.length).toFixed(0) : 0
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this intern record permanently?')) return;
    try {
      await deleteIntern(id);
      fetchInterns();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Deletion failed');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.score = Number(data.score);

    try {
      if (editingIntern) {
        await updateIntern(editingIntern._id, data);
      } else {
        await createIntern(data);
      }
      setIsModalOpen(false);
      setEditingIntern(null);
      fetchInterns();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Submission failed');
    }
  };

  return (
    <div className="container">
      <header className="header animate-fade">
        <div>
          <h1 className="title">Intern Tracker</h1>
          <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Management Dashboard v2.0</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingIntern(null); setIsModalOpen(true); }}>
          <UserPlus size={18} style={{ marginRight: '0.6rem' }} /> Add New Intern
        </button>
      </header>

      <section className="stats-grid animate-fade" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
          <span className="stat-label">Total Interns</span>
          <span className="stat-value">{stats.total}</span>
          <User size={24} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.2 }} />
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <span className="stat-label">Hired</span>
          <span className="stat-value">{stats.hired}</span>
          <Target size={24} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.2 }} />
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <span className="stat-label">Interviewing</span>
          <span className="stat-value">{stats.interviewing}</span>
          <Activity size={24} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.2 }} />
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}>
          <span className="stat-label">Avg Score</span>
          <span className="stat-value">{stats.avgScore}%</span>
          <TrendingUp size={24} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', opacity: 0.2 }} />
        </div>
      </section>

      {error && <div className="error-message glass animate-fade">{error}</div>}

      <div className="card glass p-6 animate-fade" style={{ animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="search-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            />
          </div>
          <select
            className="filter-select"
            value={filters.role}
            onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPagination(p => ({ ...p, page: 1 })); }}
          >
            <option value="">All Roles</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Fullstack">Fullstack</option>
          </select>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination(p => ({ ...p, page: 1 })); }}
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading"><Loader2 className="loading-spinner" size={32} color="#6366f1" /> <div style={{ marginTop: '1rem' }}>Updating Records...</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interns.length > 0 ? interns.map(intern => (
                  <tr key={intern._id}>
                    <td><div style={{ fontWeight: '600', color: '#1e293b' }}>{intern.name}</div></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}><Mail size={14} /> {intern.email}</div></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={14} /> {intern.role}</div></td>
                    <td><span className={`badge badge-${intern.status}`}>{intern.status}</span></td>
                    <td>
                      <span className={`score-pill ${intern.score >= 80 ? 'score-high' : intern.score >= 50 ? 'score-mid' : 'score-low'}`}>
                        {intern.score}/100
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button className="action-btn" onClick={() => { setEditingIntern(intern); setIsModalOpen(true); }} title="Edit">
                          <Edit3 size={16} color="#6366f1" />
                        </button>
                        <button className="action-btn" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(intern._id)} title="Delete">
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>No records match your search criteria.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            Displaying <span style={{ color: '#1e293b' }}>{interns.length}</span> of <span style={{ color: '#1e293b' }}>{pagination.total}</span> records
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="action-btn"
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem', fontWeight: '600', background: 'white', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              {pagination.page} / {pagination.pages || 1}
            </div>
            <button
              className="action-btn"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade">
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              {editingIntern ? 'Update Intern Information' : 'Register New Intern'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Full Name</label>
                <input className="input-field" name="name" placeholder="John Doe" defaultValue={editingIntern?.name} required minLength={2} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Email Address</label>
                <input className="input-field" type="email" name="email" placeholder="john@example.com" defaultValue={editingIntern?.email} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <select className="input-field" name="role" defaultValue={editingIntern?.role || 'Frontend'} required>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Fullstack">Fullstack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Status</label>
                  <select className="input-field" name="status" defaultValue={editingIntern?.status || 'Applied'} required>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Evaluation Score (0 - 100)</label>
                <input className="input-field" type="number" name="score" placeholder="85" defaultValue={editingIntern?.score} min="0" max="100" required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="action-btn" style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }} onClick={() => setIsModalOpen(false)}>Dismiss</button>
                <button type="submit" className="btn btn-primary">
                  {editingIntern ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
