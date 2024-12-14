import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';

const BASE_URL = 'https://backend-omega-wine.vercel.app';

interface SocialMediaAccount {
  username: string;
  platform: 'Instagram' | 'TikTok';
}

interface Employee {
  _id: string;
  name: string;
}

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  socialMediaAccounts: SocialMediaAccount[];
  manager?: Employee;
}

interface PaginatedResponse {
  influencers: Influencer[];
  total: number;
  page: number;
  totalPages: number;
}

const ListInfluencers: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInfluencers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching influencers...');
      const response = await axios.get<PaginatedResponse>(`${BASE_URL}/api/influencers`, {
        params: {
          nameFilter,
          managerFilter,
          page,
          limit: 10
        },
        timeout: 30000
      });

      console.log('Influencers response:', response.data);
      const { influencers, totalPages: total } = response.data;
      setInfluencers(influencers);
      setTotalPages(total);
    } catch (err: any) {
      console.error('Error fetching influencers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch influencers');
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  }, [nameFilter, managerFilter, page]);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await axios.get<Employee[]>(`${BASE_URL}/api/influencers/employees`, {
        timeout: 30000
      });
      console.log('Employees response:', response.data);
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch employees');
      setEmployees([]);
    }
  };

  const handleManagerChange = async (influencerId: string, managerId: string | null) => {
    try {
      setError('');
      const response = await axios.patch<Influencer>(
        `${BASE_URL}/api/influencers/${influencerId}/manager`,
        { managerId },
        { timeout: 30000 }
      );
      setInfluencers(influencers.map(inf => 
        inf._id === influencerId ? { ...inf, manager: response.data.manager } : inf
      ));
    } catch (err: any) {
      console.error('Error updating manager:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update manager');
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="list-influencers">
      <h2>Influencers List</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter by manager..."
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          className="filter-input"
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-message">Loading...</div>
      ) : (
        <>
          <div className="influencers-list">
            {influencers.length > 0 ? (
              influencers.map((influencer) => (
                <div key={influencer._id} className="influencer-card">
                  <h3>{influencer.firstName} {influencer.lastName}</h3>
                  <div className="social-accounts">
                    <strong>Social Media:</strong>
                    {influencer.socialMediaAccounts.map((acc, idx) => (
                      <span key={idx} className="social-account">
                        {acc.platform}: {acc.username}
                      </span>
                    ))}
                  </div>
                  <div className="manager-section">
                    <strong>Manager:</strong>
                    <select
                      value={influencer.manager?._id || ''}
                      onChange={(e) => handleManagerChange(influencer._id, e.target.value || null)}
                      className="manager-select"
                    >
                      <option value="">No Manager</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No influencers found</div>
            )}
          </div>
          
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListInfluencers;