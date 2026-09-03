import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Compass, Bookmark, User, Camera } from "lucide-react";
import { getProfile, updateProfile } from "../services/userService";
import { uploadImage } from "../services/cloudinaryService";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFullName(data.fullName || "");
        setBio(data.bio || "");
        setPhoneNumber(data.phoneNumber || "");
      } catch (error) {
        console.error("Error while loading the profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = {
        fullName: fullName,
        bio: bio,
        phoneNumber: phoneNumber,
      };
      const updatedProfile = await updateProfile(updatedData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error while saving the profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile.fullName || "");
    setBio(profile.bio || "");
    setPhoneNumber(profile.phoneNumber || "");
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const imageUrl = await uploadImage(file);
      const updatedProfile = await updateProfile({
        profilePic: imageUrl,
      });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error while uploading the photo:", error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-bg-glow" />

      <header className="profile-header">  
        {isEditing ? (
          <button
            className="profile-edit-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        ) : (
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </header>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {profile?.profilePic ? (
              <img
                src={profile.profilePic}
                alt="Profile"
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <User size={40} color="rgba(212,148,58,0.4)" />
              </div>
            )}
            <label className="profile-camera-btn" title="Change photo">
              <Camera size={12} color="#1a0e04" />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
              />
            </label>
          </div>
          {isUploadingPhoto && (
            <p className="profile-uploading-text"> Uploading...</p>
          )}
          <h2 className="profile-name">{profile?.fullName || "No name"}</h2>
          <p className="profile-email">{profile?.email}</p>
        </div>

        <div className="profile-info-section">
          <div className="profile-field">
            <span className="profile-field-label">Full Name</span>
            {isEditing ? (
              <input
                className="profile-field-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
              />
            ) : (
              <span className="profile-field-value">
                {profile?.fullName || "Name is missing"}
              </span>
            )}
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value muted">{profile?.email}</span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Bio</span>
            {isEditing ? (
              <textarea
                className="profile-field-input profile-field-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
              />
            ) : (
              <span className="profile-field-value muted">
                {profile?.bio || "No bio yet..."}
              </span>
            )}
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Phone Number</span>
            {isEditing ? (
              <input
                className="profile-field-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            ) : (
              <span className="profile-field-value muted">
                {profile?.phoneNumber || "Not available"}
              </span>
            )}
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Member since</span>
            <span className="profile-field-value">
              {formatDate(profile?.createdAt)}
            </span>
          </div>

          {isEditing && (
            <button className="profile-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}

          <button className="profile-logout-btn" onClick={handleLogout}>
            Log out
          </button>

          {localStorage.getItem("role") === "ROLE_ADMIN" && (
            <button className="profile-admin-btn" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}
        </div>
      </div>

      <nav className="bottom-navigation-dock">
        <button className="dock-item" onClick={() => navigate("/home")}>
          <Home size={22} className="dock-icon" />
          <span className="dock-label">Home</span>
        </button>
        <button className="dock-item" onClick={() => navigate("/plan")}>
          <Compass size={22} />
          <span>Plan</span>
        </button>
        <button className="dock-item" onClick={() => navigate("/saved")}>
          <Bookmark size={22} />
          <span>Saved</span>
        </button>
        <button className="dock-item active">
          <User size={22} className="dock-icon" />
          <span className="dock-label">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfilePage;
