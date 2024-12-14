import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';

const BACKEND_URL = `https://backend-omega-wine.vercel.app`;

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
  const [error, setError] = useState('');

  const fetchInfluencers = useCallback(async () => {
    try {
      console.log('Fetching influencers...');
      const response = await axios.get(`${BACKEND_URL}/api/influencers`, {
        params: {
          nameFilter,
          managerFilter
        },
        timeout: 10000
      });
      console.log('Influencers response:', response.data);
      setInfluencers(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error: any) {
      console.error('Error fetching influencers:', error.response?.data || error.message);
      setInfluencers([]);
      setError('Failed to fetch influencers');
    }
  }, [nameFilter, managerFilter]);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await axios.get(`${BACKEND_URL}/api/influencers/employees`, {
        timeout: 10000
      });
      console.log('Employees response:', response.data);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching employees:', error.response?.data || error.message);
      setEmployees([]);
    }
  };

  const handleManagerChange = async (influencerId: string, managerId: string | null) => {
    try {
      const response = await axios.patch(`${BACKEND_URL}/api/influencers/${influencerId}/manager`, {
        managerId
      });
      setInfluencers(influencers.map(inf => 
        inf._id === influencerId ? response.data : inf
      ));
    } catch (error: any) {
      console.error('Error updating manager:', error.response?.data || error.message);
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
      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">Filter by Name:</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Filter by Manager:</label>
          <input
            type="text"
            placeholder="Search by manager name..."
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="influencers-list">
        {Array.isArray(influencers) && influencers.length > 0 ? (
          influencers.map((influencer) => (
            <div key={influencer._id} className="influencer-card">
              <h3>{influencer.firstName} {influencer.lastName}</h3>
              <div className="social-accounts">
                <strong>Social Media:</strong>
                {Array.isArray(influencer.socialMediaAccounts) && 
                  influencer.socialMediaAccounts.map((acc, idx) => (
                    <span key={idx} className="social-account">
                      {acc.platform}: {acc.username}
                    </span>
                  ))
                }
              </div>
              <div className="manager-section">
                <strong>Manager:</strong>
                <select
                  value={influencer.manager?._id || ''}
                  onChange={(e) => handleManagerChange(influencer._id, e.target.value || null)}
                  className="manager-select"
                >
                  <option value="">No Manager</option>
                  {Array.isArray(employees) && employees.map((employee) => (
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
    </div>
  );
};

export default ListInfluencers;