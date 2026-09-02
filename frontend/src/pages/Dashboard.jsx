import { useState, useEffect } from 'react';
import { getCases } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) {
    return <div className="spinner" style={{ margin: '2rem auto' }} />;
  }

  const openCases = cases.filter(c => c.status === 'OPEN').length;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2>Welcome back, {user?.name}</h2>
        <div className="badge badge-info">{user?.role}</div>
      </div>
      
      <div className="flex gap-6 mb-4">
        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-4">
            <Briefcase size={32} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>{cases.length}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Assigned Cases</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-4">
            <AlertCircle size={32} style={{ color: 'var(--warning)' }} />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>{openCases}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Open Cases</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4">Recent Cases</h3>
        {cases.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No cases assigned to you yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td><div className="badge badge-info">{c.case_number}</div></td>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td>
                      <span className={`badge ${c.status === 'OPEN' ? 'badge-warning' : c.status === 'CLOSED' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/cases/${c.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
