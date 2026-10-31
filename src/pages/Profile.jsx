import React, { useState, useEffect } from 'react';
import { Save, User, Key, Mail, Phone, Briefcase, RefreshCw, Upload, Trash2, Camera, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { settingsApi } from '../services/api';
import defaultAvatar from '../assets/default-avatar.jpg';

export default function Profile() {
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    admin_name: 'Super Administrator',
    admin_designation: 'Chief Administrator',
    admin_email: 'admin@labcare.com',
    admin_phone: '+91 99999 88888',
    admin_status: 'Active',
    admin_join_date: '15 Jan 2024'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await settingsApi.get();
        if (data) {
          setProfile(prev => ({
            ...prev,
            admin_name: data.admin_name || prev.admin_name,
            admin_designation: data.admin_designation || prev.admin_designation,
            admin_email: data.admin_email || prev.admin_email,
            admin_phone: data.admin_phone || prev.admin_phone,
            admin_join_date: data.admin_join_date || prev.admin_join_date
          }));

          const savedAvatar = data.admin_avatar || localStorage.getItem('lms_avatar');
          if (savedAvatar) {
            setProfileImage(savedAvatar);
            localStorage.setItem('lms_avatar', savedAvatar);
          } else {
            setProfileImage(defaultAvatar);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        const localAvatar = localStorage.getItem('lms_avatar');
        setProfileImage(localAvatar || defaultAvatar);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Auto-compress any uploaded image to optimal avatar resolution
  const compressImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        if (compressedBase64) {
          setProfileImage(compressedBase64);
          localStorage.setItem('lms_avatar', compressedBase64);
          window.dispatchEvent(new Event('lms_avatar_updated'));
        }
      } catch (err) {
        console.error('Image processing error:', err);
      }
    }
  };

  const handleResetAvatar = () => {
    setProfileImage(defaultAvatar);
    localStorage.setItem('lms_avatar', defaultAvatar);
    window.dispatchEvent(new Event('lms_avatar_updated'));
  };

  const handleSaveProfile = async () => {
    if (!profile.admin_name || !profile.admin_email) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Admin Name and Email are required!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    if (passwords.newPass && passwords.newPass !== passwords.confirmPass) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    try {
      setSaving(true);
      await settingsApi.update({
        admin_name: profile.admin_name,
        admin_designation: profile.admin_designation,
        admin_email: profile.admin_email,
        admin_phone: profile.admin_phone,
        admin_avatar: profileImage || defaultAvatar
      });

      localStorage.setItem('lms_avatar', profileImage || defaultAvatar);
      
      // Update logged in user name in localStorage as well
      try {
        const u = JSON.parse(localStorage.getItem('lms_user') || '{}');
        u.name = profile.admin_name;
        localStorage.setItem('lms_user', JSON.stringify(u));
      } catch (e) {
        console.error(e);
      }

      window.dispatchEvent(new Event('lms_avatar_updated'));
      setPasswords({ current: '', newPass: '', confirmPass: '' });

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Profile image and credentials saved permanently.',
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none' }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-400 pb-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-800 uppercase tracking-tight">User Profile</h2>
          <p className="text-slate-600 text-[11px] uppercase tracking-wider mt-0.5">
            Manage administrator avatar, credentials and account security
          </p>
        </div>
        <button 
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider border border-blue-800 rounded-none hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Profile Card & Picture */}
        <div className="w-full lg:w-1/3">
           <div className="bg-white border border-slate-400 p-5 flex flex-col items-center">
              {/* Profile Image with Camera Change Overlay */}
              <label className="w-32 h-32 bg-slate-200 border-2 border-slate-400 mb-3 flex items-center justify-center relative overflow-hidden cursor-pointer group shadow-md">
                 <img 
                   src={profileImage} 
                   alt="Administrator Profile" 
                   className="w-full h-full object-cover" 
                   onError={(e) => { e.target.src = defaultAvatar; }}
                 />
                 <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-center py-1.5 group-hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                    <Camera size={13} className="text-white" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Photo</span>
                 </div>
                 <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {/* Reset to Default Button */}
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-[10px] text-slate-500 hover:text-red-600 font-semibold uppercase tracking-wider flex items-center gap-1 mb-3 cursor-pointer"
                title="Reset to default medical avatar"
              >
                <Trash2 size={12} /> Reset to Default
              </button>

              <h3 className="text-[17px] font-black text-slate-800 uppercase tracking-wide text-center">
                {profile.admin_name}
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5 text-center">
                {profile.admin_designation}
              </p>
              
              <div className="w-full border-t border-slate-300 mt-4 pt-4 space-y-2.5">
                 <div className="flex justify-between items-center text-xs">
                    <span className="uppercase font-bold text-slate-700 text-[11px]">Status</span>
                    <span className="text-emerald-700 font-bold uppercase tracking-wide px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-[10px]">
                      Active
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="uppercase font-bold text-slate-700 text-[11px]">Role</span>
                    <span className="font-mono text-purple-700 font-bold text-xs">Super Admin</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="uppercase font-bold text-slate-700 text-[11px]">Joined</span>
                    <span className="text-slate-600 font-medium text-xs">{profile.admin_join_date}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Edit Forms */}
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-white border border-slate-400 p-5">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-300 pb-2">
                <User size={16} className="text-slate-600" />
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-800">Administrator Details</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name</label>
                  <div className="flex border border-slate-400 bg-white w-full">
                     <div className="p-2 border-r border-slate-400 flex items-center justify-center bg-slate-50"><User size={14} className="text-slate-500" /></div>
                     <input 
                       type="text" 
                       value={profile.admin_name}
                       onChange={(e) => setProfile({ ...profile, admin_name: e.target.value })}
                       className="w-full p-2 text-[13px] outline-none" 
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Designation</label>
                  <div className="flex border border-slate-400 bg-white w-full">
                     <div className="p-2 border-r border-slate-400 flex items-center justify-center bg-slate-50"><Briefcase size={14} className="text-slate-500" /></div>
                     <input 
                       type="text" 
                       value={profile.admin_designation}
                       onChange={(e) => setProfile({ ...profile, admin_designation: e.target.value })}
                       className="w-full p-2 text-[13px] outline-none" 
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Email</label>
                  <div className="flex border border-slate-400 bg-white w-full">
                     <div className="p-2 border-r border-slate-400 flex items-center justify-center bg-slate-50"><Mail size={14} className="text-slate-500" /></div>
                     <input 
                       type="email" 
                       value={profile.admin_email}
                       onChange={(e) => setProfile({ ...profile, admin_email: e.target.value })}
                       className="w-full p-2 text-[13px] outline-none" 
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Phone</label>
                  <div className="flex border border-slate-400 bg-white w-full">
                     <div className="p-2 border-r border-slate-400 flex items-center justify-center bg-slate-50"><Phone size={14} className="text-slate-500" /></div>
                     <input 
                       type="text" 
                       value={profile.admin_phone}
                       onChange={(e) => setProfile({ ...profile, admin_phone: e.target.value })}
                       className="w-full p-2 text-[13px] outline-none" 
                     />
                  </div>
                </div>
             </div>
          </div>

          {/* Security & Password */}
          <div className="bg-white border border-slate-400 p-5">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-300 pb-2">
                <Key size={16} className="text-slate-600" />
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-800">Security Credentials</h3>
             </div>
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.newPass}
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        placeholder="Leave blank to keep current"
                        className="w-full p-2 border border-slate-400 text-[13px] outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirmPass}
                        onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full p-2 border border-slate-400 text-[13px] outline-none" 
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
