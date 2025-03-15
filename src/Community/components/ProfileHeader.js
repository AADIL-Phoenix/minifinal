import React from 'react';
import PropTypes from 'prop-types';

const ProfileHeader = ({
  name,
  profilePic,
  followers,
  following,
  isOwnProfile,
  onFollow,
  onPhotoChange
}) => {
  return (
    <div className="profile-header">
      <div className="profile-pic-container">
        {isOwnProfile && (
          <input
            type="file"
            id="profile-photo-input"
            style={{ display: 'none' }}
            onChange={onPhotoChange}
            accept="image/*"
          />
        )}
        <img 
          src={profilePic || "/default-avatar.png"} 
          alt={`${name}'s profile`}
          className="profile-pic"
          onClick={() => {
            if (isOwnProfile) {
              document.getElementById('profile-photo-input').click();
            }
          }}
          style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
        />
        {isOwnProfile && (
          <div className="photo-change-overlay">
            Click to change photo
          </div>
        )}
      </div>
      
      <div className="profile-info">
        <h2>{name}</h2>
        <div className="follow-stats">
          <div className="stat">
            <span className="count">{followers}</span>
            <span className="label">Followers</span>
          </div>
          <div className="stat">
            <span className="count">{following}</span>
            <span className="label">Following</span>
          </div>
        </div>
        
        {!isOwnProfile && (
          <button 
            className="follow-button" 
            onClick={onFollow}
          >
            Follow +
          </button>
        )}
        
        {isOwnProfile && (
          <button className="edit-profile-button">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  name: PropTypes.string.isRequired,
  profilePic: PropTypes.string,
  followers: PropTypes.number.isRequired,
  following: PropTypes.number.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  onFollow: PropTypes.func.isRequired,
  onPhotoChange: PropTypes.func
};

export default ProfileHeader;
