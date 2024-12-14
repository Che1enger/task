import React, { useState } from 'react';
import CreateInfluencer from './components/CreateInfluencer.tsx';
import ListInfluencers from './components/ListInfluencers.tsx';
import './styles/App.css';

const App: React.FC = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleInfluencerCreated = () => {
    setRefreshList(!refreshList);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Influencer Management System</h1>
      <CreateInfluencer onInfluencerCreated={handleInfluencerCreated} />
      <hr className="app-divider" />
      <ListInfluencers key={refreshList.toString()} />
    </div>
  );
};

export default App;