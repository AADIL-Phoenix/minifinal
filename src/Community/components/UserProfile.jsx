import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context';
import './styles/UserProfile.css';
import axios from 'axios';

const UserProfile = () => {
  const { user } = useGlobalContext();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigate to create profile if the user doesn't have a profile
  useEffect(() => {
    if (user && !user.hasProfile && !userId) {
      navigate('/create-profile', { replace: true });
    }
  }, [user, userId, navigate]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      // Check if user is available
      if (!userId && (!user || !user.id)) {
        setError('User not found');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/api/profile/${userId || user.id}`);
        setProfile(response.data);
        setEditedProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Check if user is available
      if (!user || !user.id) {
        setError('User not found');
        return;
      }
      
      const response = await axios.put(`/api/profile/${user.id}`, editedProfile);
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedProfile({
      ...editedProfile,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  const filteredBooks = activeTab === 'all' 
    ? profile.books || []
    : (profile.books || []).filter(book => book.status === activeTab);

  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.name} />
            ) : (
              <span>{profile.name && profile.name[0] ? profile.name[0].toUpperCase() : ''}</span>
            )}
          </div>
          <div className="profile-info">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name || ''}
                  onChange={handleChange}
                  className="edit-input"
                />
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email || ''}
                  onChange={handleChange}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">Save</button>
                  <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="profile-name">{profile.name || 'No Name'}</h2>
                <p className="profile-email">{profile.email || 'No Email'}</p>
                {!userId && (  // Only show edit button on own profile
                  <button onClick={handleEditClick} className="edit-btn">
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Display bio and website if available */}
        {(profile.bio || profile.website) && (
          <div className="profile-details">
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.website && (
              <p className="profile-website">
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  {profile.website}
                </a>
              </p>
            )}
          </div>
        )}
        
        {/* Display favorite genres if available */}
        {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
          <div className="profile-genres">
            <h3>Favorite Genres</h3>
            <div className="genre-tags">
              {profile.favoriteGenres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="books-section">
        <h2 className="books-title">Your Books</h2>
        
        <div className="tabs">
          <button 
            onClick={() => setActiveTab('all')}
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            All Books
          </button>
          <button 
            onClick={() => setActiveTab('want-to-read')}
            className={`tab ${activeTab === 'want-to-read' ? 'active' : ''}`}
          >
            Want to Read
          </button>
          <button 
            onClick={() => setActiveTab('currently-reading')}
            className={`tab ${activeTab === 'currently-reading' ? 'active' : ''}`}
          >
            Currently Reading
          </button>
          <button 
            onClick={() => setActiveTab('read')}
            className={`tab ${activeTab === 'read' ? 'active' : ''}`}
          >
            Read
          </button>
        </div>
        
        {!profile.books || filteredBooks.length === 0 ? (
          <p className="no-books">
            {activeTab === 'all' 
              ? "You haven't added any books to your profile yet." 
              : `You don't have any books marked as "${activeTab.replace('-', ' ')}".`}
          </p>
        ) : (
          <div className="books-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <Link to={`/book/${book.id}`} className="book-title-link">
                  <h3 className="book-title">{book.title}</h3>
                </Link>
                <p className="book-author">{book.author}</p>
                <div className="book-status">
                  <span className={`status-badge ${book.status}`}>
                    {book.status === 'want-to-read' ? 'Want to Read' :
                     book.status === 'currently-reading' ? 'Currently Reading' : 'Read'}
                  </span>
                </div>
                <p className="book-updated">
                  Updated: {book.updatedAt && typeof book.updatedAt === 'string' 
                      ? new Date(book.updatedAt).toLocaleDateString() 
                      : book.updatedAt instanceof Date 
                          ? book.updatedAt.toLocaleDateString() 
                          : 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;