import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { authService } from '../services/api';

const Profile = () => {
  // Assuming 'user' object with email and username is in your Redux state
  const { user } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { username, oldPassword, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    // --- Your API call to update the profile goes here ---
    // Example:
    // updateUser({ userId: user.id, username, oldPassword, newPassword })
    //   .then(response => {
    //     setSuccess('Profile updated successfully!');
    //     // Optionally, dispatch an action to update user info in Redux store
    //   })
    //   .catch(apiError => {
    //     setError(apiError.message || 'Failed to update profile.');
    //   });

    console.log('Form submitted with:', formData);
    setSuccess('Profile updated successfully! (Frontend demo)'); // Placeholder
    // Clear password fields after submission for security
    setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
  };

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [user]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-2 text-gray-600">Update your profile information and password.</p>
          </div>

          <div className="border-t border-gray-200 px-6 py-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Field (Read-only) */}
                <div className="md:col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    readOnly
                    value={user?.email || 'user@example.com'}
                    className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Username Field */}
                <div className="md:col-span-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                {/* Old Password Field */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mt-6">Change Password</h3>
                  <hr className="my-4" />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Enter your current password"
                  />
                </div>

                {/* New Password Field */}
                <div className="md:col-span-1">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Leave blank to keep the same"
                  />
                </div>

                {/* Confirm New Password Field */}
                <div className="md:col-span-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;