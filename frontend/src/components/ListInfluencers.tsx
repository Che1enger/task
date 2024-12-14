import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

  const fetchInfluencers = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/influencers`, {
        params: {
          nameFilter,
          managerFilter
        },
        timeout: 10000 // 10 second timeout
      });
      setInfluencers(response.data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setInfluencers([]); // Set empty array on error
    }
  }, [nameFilter, managerFilter, BACKEND_URL]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/influencers/employees`, {
        timeout: 10000 // 10 second timeout
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]); // Set empty array on error
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
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [nameFilter, managerFilter, fetchInfluencers]);

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
    </div>
  );
};

export default ListInfluencers;