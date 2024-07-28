import React, { useState } from 'react';
import Modal from 'react-modal';
import '../App.css';
import useAuth from '../hooks/useAuth';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

Modal.setAppElement('#root'); // Ensure this is correct for accessibility

const User = () => {
  const { auth, setAuth } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const axiosPrivate = useAxiosPrivate();

  const handleLogout = async () => {
    try {
      await axiosPrivate.post('/account/logout', {
        withCredentials: true
    });
      setAuth({ email: null, userId: null, accessToken: null });
    } catch (error) {
      console.error('There was an error logging out!', error);
      alert('Failed to logout');
    }
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    axiosPrivate.put('/account/password', {
      password: passwordData.newPassword,
    })
      .then(response => {
        console.log('Password change response:', response.data);
        alert('Password changed successfully');
        setIsModalOpen(false);
      })
      .catch(error => {
        console.error('There was an error changing the password!', error);
        alert('Failed to change password');
      });
  };

  return (
    <div className="page-content profile">
      <div className="profile-container">
        <h1>Profile</h1>
        <p>Email: {auth.email}</p>
        <p>User ID: {auth.uid}</p>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => setIsModalOpen(true)}>Change Password</button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Change Password"
        className="edit-modal"
        overlayClassName="edit-overlay"
      >
        <h2>Change Password</h2>
        <form className="edit-form" onSubmit={handleSubmitPasswordChange}>
          <label>
            Current Password:
            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handleChangePassword} required />
          </label>
          <label>
            New Password:
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handleChangePassword} required />
          </label>
          <label>
            Confirm New Password:
            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handleChangePassword} required />
          </label>
          <div className="modal-button-container">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default User;
