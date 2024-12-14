import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';
import { ENDPOINTS } from '../config.ts';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

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

const ListInfluencers: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('API_URL:', process.env.REACT_APP_API_URL);
  console.log('ENDPOINTS:', ENDPOINTS);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(ENDPOINTS.INFLUENCERS, {
        params: {
          nameFilter,
          managerFilter
        }
      });
      console.log('Fetched influencers:', response.data);
      setInfluencers(response.data);
    } catch (error: any) {
      console.error('Error fetching influencers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(ENDPOINTS.EMPLOYEES);
      console.log('Fetched employees:', response.data);
      setEmployees(response.data);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleManagerChange = async (influencerId: string, managerId: string | null) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating manager:', { 
        influencerId, 
        managerId,
        url: `${ENDPOINTS.INFLUENCERS}/${influencerId}/manager`
      });

      const response = await axiosInstance.patch(
        `${ENDPOINTS.INFLUENCERS}/${influencerId}/manager`,
        { managerId }
      );

      console.log('Update response:', response.data);
      setInfluencers(influencers.map(inf => 
        inf._id === influencerId ? response.data : inf
      ));
    } catch (error: any) {
      console.error('Error updating manager:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      setError('Failed to update manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [nameFilter, managerFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="list-influencers">
      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">Filter by Name:</label>
          <input
            type="text"
            placeholder="Search by first or last name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Filter by Manager:</label>
          <input
            type="text"
            placeholder="Search by manager name or type 'none'..."
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
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
                    onChange={(e) => {
                      console.log('Select changed:', e.target.value);
                      handleManagerChange(influencer._id, e.target.value || null);
                    }}
                    className="manager-select"
                    disabled={loading}
                  >
                    <option value="">No Manager</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No influencers found matching your search criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListInfluencers;