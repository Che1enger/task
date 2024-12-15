import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';

const API_BASE_URL = 'backend-omega-opal-70.vercel.app';

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

  const fetchInfluencers = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/influencers`, {
      params: {
        nameFilter,
        managerFilter
      }
    });
    setInfluencers(response.data);
  };

  const fetchEmployees = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/influencers/employees`);
    setEmployees(response.data);
  };

  const handleManagerChange = async (influencerId: string, managerId: string | null) => {
    try {
      const url = `${API_BASE_URL}/api/influencers/${influencerId}/manager`;
      console.log('Making request to:', url);
      
      const response = await axios({
        method: 'PATCH',
        url,
        data: { managerId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response:', response);
      
      if (response.data) {
        setInfluencers(influencers.map(inf => 
          inf._id === influencerId ? response.data : inf
        ));
      }
    } catch (error) {
      console.error('Error updating manager:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [influencersRes, employeesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/influencers`, {
            params: {
              nameFilter,
              managerFilter
            }
          }),
          axios.get(`${API_BASE_URL}/api/influencers/employees`)
        ]);
        
        console.log('Influencers Response:', influencersRes);  // Log the full response

        console.log('Influencers Response Data:', influencersRes.data);  // Log the response data

        setInfluencers(influencersRes.data);
        setEmployees(employeesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [nameFilter, managerFilter]);

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