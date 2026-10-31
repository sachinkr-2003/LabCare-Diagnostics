import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { patientApi } from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = { name: '', phone: '', age: '', gender: 'Male', doctor_name: 'Self / Walk-in', address: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const data = await patientApi.getAll(query);
      setPatients(data || []);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Fetching Patients',
        text: err.message || 'Could not connect to backend server',
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.age) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill all required fields (Name, Phone, Age)!',
        confirmButtonColor: '#3085d6',
        customClass: { popup: 'rounded-none border border-slate-400' }
      });
      return;
    }

    try {
      if (editingId) {
        await patientApi.update(editingId, {
          name: formData.name,
          phone: formData.phone,
          age: Number(formData.age),
          gender: formData.gender,
          doctor_name: (formData.doctor_name && formData.doctor_name.trim()) ? formData.doctor_name.trim() : 'Self',
          address: formData.address || ''
        });
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Patient details updated.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      } else {
        await patientApi.create({
          name: formData.name,
          phone: formData.phone,
          age: Number(formData.age),
          gender: formData.gender,
          doctor_name: (formData.doctor_name && formData.doctor_name.trim()) ? formData.doctor_name.trim() : 'Self',
          address: formData.address || ''
        });
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'New patient registered.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      }
      closeForm();
      fetchPatients(searchQuery);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    }
  };

  const handleEdit = (p) => {
    setFormData({
      name: p.name,
      phone: p.phone,
      age: p.age,
      gender: p.gender,
      doctor_name: p.doctor_name || p.doctor || 'Self / Walk-in',
      address: p.address || ''
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete patient record ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: { popup: 'rounded-none' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await patientApi.delete(id);
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Record removed.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
          fetchPatients(searchQuery);
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message, customClass: { popup: 'rounded-none' } });
        }
      }
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-400 pb-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 uppercase tracking-tight">Patient Directory</h2>
          <p className="text-slate-600 text-[12px] uppercase tracking-wider mt-1">Manage all registered patients with live SQLite Database</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchPatients(searchQuery)}
            className="bg-slate-200 text-slate-700 px-3 py-2 text-[12px] font-bold uppercase tracking-wider border border-slate-400 rounded-none hover:bg-slate-300 flex items-center gap-1.5 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { closeForm(); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 text-[12px] font-bold uppercase tracking-wider border border-blue-800 rounded-none hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add New Patient
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-400 p-5 shadow-none rounded-none transition-all">
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4">
             <h3 className="text-[14px] font-bold uppercase text-slate-800">
               {editingId ? `Edit Patient: ${editingId}` : 'New Patient Registration Form'}
             </h3>
             <button onClick={closeForm} className="text-slate-500 hover:text-red-500"><X size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white" placeholder="Enter patient full name" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Age & Gender *</label>
              <div className="flex gap-2">
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-1/3 border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white" placeholder="Age" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-2/3 border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white cursor-pointer">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* NEW FIELDS: Referred Doctor & Address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center justify-between">
                <span>Referred By (Doctor)</span>
                <span className="text-[10px] text-blue-700 font-normal lowercase">e.g. DR DHARMENDAR KUMAR or Self</span>
              </label>
              <input 
                type="text" 
                name="doctor_name" 
                list="doctor-suggestions"
                value={formData.doctor_name} 
                onChange={handleInputChange} 
                className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white font-medium" 
                placeholder="Type Doctor Name or 'Self' (Leave blank for Self)" 
              />
              <datalist id="doctor-suggestions">
                <option value="DR DHARMENDAR KUMAR" />
                <option value="Self / Walk-in" />
                <option value="Dr. R. K. Gupta" />
                <option value="Dr. Anita Roy" />
              </datalist>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Patient Address / City</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-blue-500 rounded-none bg-slate-50 focus:bg-white" 
                placeholder="e.g. Bhingari Bazaar, Deoria" 
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
             <button onClick={handleSave} className="bg-green-600 text-white px-5 py-2 text-[12px] font-bold uppercase border border-green-800 rounded-none hover:bg-green-700 transition-colors">
               {editingId ? 'Update Detail' : 'Save Patient'}
             </button>
             <button onClick={closeForm} className="bg-slate-200 text-slate-800 px-5 py-2 text-[12px] font-bold uppercase border border-slate-400 rounded-none hover:bg-slate-300 transition-colors">
               Cancel
             </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-400 rounded-none">
        <div className="p-4 border-b border-slate-400 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-100">
           <form onSubmit={handleSearchSubmit} className="flex items-center border border-slate-400 bg-white px-2">
             <Search size={16} className="text-slate-400" />
             <input 
               type="text" 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               placeholder="Search Patient ID, Name or Phone..." 
               className="p-2 text-[13px] outline-none w-72 bg-transparent" 
             />
             <button type="submit" className="text-xs uppercase font-bold text-blue-600 hover:text-blue-800 px-2">
               Search
             </button>
           </form>
           <span className="text-[12px] font-bold uppercase text-slate-600 bg-slate-200 px-3 py-1 border border-slate-300">
             Total: {patients.length} Records
           </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 border border-slate-400 w-24">Patient ID</th>
                <th className="px-4 py-3 border border-slate-400">Name</th>
                <th className="px-4 py-3 border border-slate-400 text-center w-28">Age/Gender</th>
                <th className="px-4 py-3 border border-slate-400 w-32">Phone</th>
                <th className="px-4 py-3 border border-slate-400">Referred Doctor</th>
                <th className="px-4 py-3 border border-slate-400 w-28">Reg. Date</th>
                <th className="px-4 py-3 border border-slate-400 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider border border-slate-400">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 border border-slate-400 text-blue-700 font-bold">{p.id}</td>
                  <td className="px-4 py-2 border border-slate-400">
                    <p className="font-bold">{p.name}</p>
                    {p.address && <p className="text-[10px] text-slate-500">{p.address}</p>}
                  </td>
                  <td className="px-4 py-2 border border-slate-400 text-center">{p.age} / {p.gender ? p.gender[0] : 'M'}</td>
                  <td className="px-4 py-2 border border-slate-400">{p.phone}</td>
                  <td className="px-4 py-2 border border-slate-400 text-slate-700 font-medium">{p.doctor_name || 'Self / Walk-in'}</td>
                  <td className="px-4 py-2 border border-slate-400">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-2 border border-slate-400 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800" title="Edit Patient"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700" title="Delete Patient"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider border border-slate-400">
                    No matching patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
