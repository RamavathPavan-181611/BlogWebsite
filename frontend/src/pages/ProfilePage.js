import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, LockKeyhole } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.updateProfile(profile);
      updateUser(response.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.updatePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Your Profile</h1>
          <p className="text-gray-400">Manage your account information and password</p>
        </div>

        <form onSubmit={saveProfile} className="card mb-6 space-y-5">
          <h2 className="text-xl font-semibold text-gray-100">Account information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="text-sm font-medium text-gray-300">Name
              <input name="name" value={profile.name} onChange={handleProfileChange} className="input-field mt-2" required />
            </label>
            <label className="text-sm font-medium text-gray-300">Email
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="input-field mt-2" required />
            </label>
            <label className="text-sm font-medium text-gray-300">Location
              <input name="location" value={profile.location} onChange={handleProfileChange} className="input-field mt-2" placeholder="City, Country" />
            </label>
            <label className="text-sm font-medium text-gray-300">Website
              <input name="website" type="url" value={profile.website} onChange={handleProfileChange} className="input-field mt-2" placeholder="https://example.com" />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-300">Bio
            <textarea name="bio" value={profile.bio} onChange={handleProfileChange} className="input-field mt-2 min-h-32" maxLength="500" placeholder="Tell readers about yourself" />
          </label>
          <button type="submit" disabled={savingProfile} className="btn-primary inline-flex items-center gap-2">
            <Save size={18} /> {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <form onSubmit={savePassword} className="card space-y-5">
          <div className="flex items-center gap-3">
            <LockKeyhole className="text-primary-400" size={22} />
            <h2 className="text-xl font-semibold text-gray-100">Change password</h2>
          </div>
          <label className="block text-sm font-medium text-gray-300">Current password
            <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} className="input-field mt-2" minLength="6" required />
          </label>
          <label className="block text-sm font-medium text-gray-300">New password
            <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} className="input-field mt-2" minLength="6" required />
          </label>
          <button type="submit" disabled={savingPassword} className="btn-secondary inline-flex items-center gap-2">
            <LockKeyhole size={18} /> {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;