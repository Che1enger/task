import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListInfluencers.css';
import { ENDPOINTS } from '../config.ts';

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
    const response = await axios.get(ENDPOINTS.INFLUENCERS, {
      params: {
        nameFilter,
        managerFilter
      }
    });
    setInfluencers(response.data);
  };

  const fetchEmployees = async () => {
    const response = await axios.get(ENDPOINTS.EMPLOYEES);
    setEmployees(response.data);
  };

  const handleManagerChange = async (influencerId: string, managerId: string | null) => {
    try {
      const response = await axios.patch(`${ENDPOINTS.INFLUENCERS}/${influencerId}/manager`, {
        managerId
      });
      setInfluencers(influencers.map(inf => 
        inf._id === influencerId ? response.data : inf
      ));
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  const renderManagerColumn = (influencer: Influencer) => {
    if (process.env.NODE_ENV === 'production') {
      return (
        <td>
          {influencer.manager ? influencer.manager.name : 'No manager'}
        </td>
      );
    }

    return (
      <td>
        <select
          value={influencer.manager?._id || ''}
          onChange={(e) => handleManagerChange(influencer._id, e.target.value || null)}
          className="manager-select"
        >
          <option value="">No manager</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>
      </td>
    );
  };

  useEffect(() => {
    fetchInfluencers();
  }, [nameFilter, managerFilter]);

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
      
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Manager</th>
            <th>Social Media</th>
          </tr>
        </thead>
        <tbody>
          {influencers.length > 0 ? (
            influencers.map((influencer) => (
              <tr key={influencer._id}>
                <td>{influencer.firstName}</td>
                <td>{influencer.lastName}</td>
                {renderManagerColumn(influencer)}
                <td>
                  <strong>Social Media:</strong>
                  {influencer.socialMediaAccounts.map((acc, idx) => (
                    <span key={idx} className="social-account">
                      {acc.platform}: {acc.username}
                    </span>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="no-results">
                No influencers found matching your search criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListInfluencers;