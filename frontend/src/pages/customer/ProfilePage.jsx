import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { User, MapPin, Lock, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { updateUser } from '../../store/slices/authSlice';
import { updatePassword } from '../../store/slices/authSlice';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const INDIA_STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'password', label: 'Password', icon: Lock },
];

const emptyAddress = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressLoading, setAddressLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    const result = await dispatch(updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }));
    if (!result.error) setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      let res;
      if (editingAddress) {
        res = await userAPI.updateAddress(editingAddress._id, addressForm);
      } else {
        res = await userAPI.addAddress(addressForm);
      }
      setAddresses(res.data.addresses);
      dispatch(updateUser({ addresses: res.data.addresses }));
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm(emptyAddress);
      toast.success(editingAddress ? 'Address updated!' : 'Address added!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await userAPI.deleteAddress(addressId);
      setAddresses(res.data.addresses);
      dispatch(updateUser({ addresses: res.data.addresses }));
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault });
    setShowAddressForm(true);
  };

  return (
    <>
      <Helmet><title>My Profile — LUXE Fashion</title></Helmet>
      <div className="pt-24 pb-20 page-container">
        <h1 className="font-display text-3xl font-medium mb-8">My Account</h1>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar tabs */}
          <aside>
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-luxe-gold flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-3">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-luxe-muted">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                    tab === id ? 'bg-luxe-black text-white' : 'hover:bg-luxe-cream text-luxe-charcoal'
                  }`}
                >
                  <Icon size={16} />{label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab content */}
          <div className="bg-white p-8">
            {/* Profile tab */}
            {tab === 'profile' && (
              <div>
                <h2 className="font-display text-2xl font-medium mb-6">Personal Information</h2>
                <form onSubmit={handleProfileSave} className="max-w-md space-y-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input value={user?.email} className="input-field bg-gray-50 text-luxe-muted" readOnly />
                    <p className="text-xs text-luxe-muted mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="10-digit number" pattern="[6-9][0-9]{9}" />
                  </div>
                  <button type="submit" disabled={profileLoading} className="btn-primary">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Addresses tab */}
            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-medium">Saved Addresses</h2>
                  <button
                    onClick={() => { setEditingAddress(null); setAddressForm(emptyAddress); setShowAddressForm(true); }}
                    className="btn-outline text-xs flex items-center gap-2"
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {!showAddressForm ? (
                  addresses.length === 0 ? (
                    <p className="text-luxe-muted text-sm">No saved addresses. Add one to make checkout faster.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div key={addr._id} className="border border-luxe-border p-4 relative">
                          {addr.isDefault && (
                            <span className="absolute top-3 right-3 text-2xs text-green-600 flex items-center gap-1">
                              <Check size={10} /> Default
                            </span>
                          )}
                          <p className="font-medium text-sm mb-1">{addr.name}</p>
                          <p className="text-sm text-luxe-muted">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="text-sm text-luxe-muted">{addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="text-sm text-luxe-muted">{addr.phone}</p>
                          <div className="flex gap-3 mt-3">
                            <button onClick={() => startEditAddress(addr)} className="text-xs text-luxe-muted hover:text-luxe-black flex items-center gap-1 transition-colors">
                              <Edit2 size={12} /> Edit
                            </button>
                            <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div>
                    <h3 className="text-sm font-medium mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-4 max-w-lg">
                      <div>
                        <label className="input-label">Full Name *</label>
                        <input value={addressForm.name} onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                      </div>
                      <div>
                        <label className="input-label">Phone *</label>
                        <input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} className="input-field" required />
                      </div>
                      <div className="col-span-2">
                        <label className="input-label">Address Line 1 *</label>
                        <input value={addressForm.line1} onChange={e => setAddressForm(f => ({ ...f, line1: e.target.value }))} className="input-field" required />
                      </div>
                      <div className="col-span-2">
                        <label className="input-label">Address Line 2</label>
                        <input value={addressForm.line2} onChange={e => setAddressForm(f => ({ ...f, line2: e.target.value }))} className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">City *</label>
                        <input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} className="input-field" required />
                      </div>
                      <div>
                        <label className="input-label">Pincode *</label>
                        <input value={addressForm.pincode} onChange={e => setAddressForm(f => ({ ...f, pincode: e.target.value }))} className="input-field" required />
                      </div>
                      <div className="col-span-2">
                        <label className="input-label">State *</label>
                        <select value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} className="input-field" required>
                          <option value="">Select state</option>
                          {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))} className="accent-luxe-black" />
                          Set as default address
                        </label>
                      </div>
                      <div className="col-span-2 flex gap-3">
                        <button type="submit" disabled={addressLoading} className="btn-primary">{addressLoading ? 'Saving...' : 'Save Address'}</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Password tab */}
            {tab === 'password' && (
              <div>
                <h2 className="font-display text-2xl font-medium mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                  <div>
                    <label className="input-label">Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="input-field" required minLength={8} />
                  </div>
                  <div>
                    <label className="input-label">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input-field" required />
                  </div>
                  <button type="submit" className="btn-primary">Update Password</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
