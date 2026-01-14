import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import "./Profile.css";

const Profile = () => {
  // const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setUser(data);
      setFormData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const data = await response.json();
      setUser(data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="profile-container"><p className="error">Error: {error}</p></div>;
  }

  if (!user) {
    return <div className="profile-container"><p>No profile data available</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        {!isEditing && (
          <button onClick={handleEdit} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {isEditing ? (
          <form className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="form-input"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-success"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="profile-item">
              <span className="label">Name:</span>
              <span className="value">{user.name || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <span className="label">Email:</span>
              <span className="value">{user.email || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <span className="label">Phone:</span>
              <span className="value">{user.phone || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <span className="label">Bio:</span>
              <span className="value">{user.bio || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <span className="label">Member Since:</span>
              <span className="value">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
