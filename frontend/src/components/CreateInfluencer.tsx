import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CreateInfluencer.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface CreateInfluencerProps {
  onInfluencerCreated: () => void;
}

const CreateInfluencer: React.FC<CreateInfluencerProps> = ({ onInfluencerCreated }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<{ username: string; platform: string }[]>([]);
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (firstName.length > 50 || lastName.length > 50) {
      setError('First name and last name must be 50 characters or less');
      return;
    }

    try {
      const uniqueAccounts = Array.from(new Set(socialMediaAccounts.map(acc => acc.username)))
        .map(username => socialMediaAccounts.find(acc => acc.username === username));
      
      await axios.post(`${BACKEND_URL}/api/influencers`, { 
        firstName, 
        lastName, 
        socialMediaAccounts: uniqueAccounts 
      });

      setFirstName('');
      setLastName('');
      setSocialMediaAccounts([]);
      setUsername('');
      setPlatform('Instagram');
      setError('');
      
      onInfluencerCreated();
    } catch (err) {
      setError('Failed to create influencer. Please try again.');
    }
  };

  const addSocialMediaAccount = () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }

    if (socialMediaAccounts.some(acc => acc.username === username)) {
      setError('This account has already been added');
      return;
    }

    setSocialMediaAccounts([...socialMediaAccounts, { username, platform }]);
    setUsername('');
    setError('');
  };

  const removeSocialMediaAccount = (username: string) => {
    setSocialMediaAccounts(socialMediaAccounts.filter(acc => acc.username !== username));
  };

  return (
    <div className="create-influencer">
      <h2>Create New Influencer</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={50}
            required
            className="form-input"
          />
          <span className="char-count">{firstName.length}/50</span>
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={50}
            required
            className="form-input"
          />
          <span className="char-count">{lastName.length}/50</span>
        </div>

        <div className="social-media-section">
          <h3>Social Media Accounts</h3>
          <div className="add-account">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              className="platform-select"
            >
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
            <button 
              type="button" 
              onClick={addSocialMediaAccount}
              className="add-button"
            >
              Add Account
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="accounts-list">
            {socialMediaAccounts.map((account, index) => (
              <div key={index} className="account-item">
                <span>{account.platform}: {account.username}</span>
                <button
                  type="button"
                  onClick={() => removeSocialMediaAccount(account.username)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Create Influencer
        </button>
      </form>
    </div>
  );
};

export default CreateInfluencer;