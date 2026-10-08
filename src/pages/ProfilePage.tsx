import React, { useState, useEffect } from 'react';
import { User, Lock, MapPin, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Address } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Profile Form
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    district: '',
    postal_code: '',
    country: 'United States',
    is_default: true,
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/addresses/');
      setAddresses(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Error fetching addresses', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.post('/api/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.old_password?.[0] || 'Password update failed.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/addresses/', newAddress);
      showToast('Address added!', 'success');
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      showToast('Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.delete(`/api/auth/addresses/${id}/`);
      showToast('Address removed.', 'info');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to delete address.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings &amp; Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your contact credentials and saved delivery addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Details Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            General Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Username</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-400 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            Security &amp; Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-all"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Delivery Addresses Management */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Saved Delivery Addresses
          </h2>
          <button
            onClick={() => setShowAddressModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No saved addresses found. Add an address for faster checkout.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{a.full_name}</span>
                    {a.is_default && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 leading-relaxed">
                    {a.street_address}, {a.city}, {a.postal_code}
                    <br />
                    {a.country}
                  </div>
                  <div className="text-slate-400 font-mono">Tel: {a.phone}</div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(a.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-bold text-base text-white">Add Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.full_name}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddress.street_address}
                  onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
