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
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-wrap justify-between items-center pb-3 gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Patient Directory</h2>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-0.5">Manage all registered patients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchPatients(searchQuery)} className="bg-white text-slate-600 px-3 py-2 text-[12px] font-bold uppercase border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { closeForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-[12px] font-bold uppercase rounded-lg border border-blue-700 flex items-center gap-1.5 transition-colors shadow-md shadow-blue-500/20 cursor-pointer">
            <Plus size={16} /> <span className="hidden sm:inline">Add New Patient</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
             <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
               {editingId ? `Edit Patient: ${editingId}` : 'New Patient Registration Form'}
             </h3>
             <button onClick={closeForm} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white transition-all" placeholder="Enter patient full name" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white transition-all" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Age & Gender *</label>
              <div className="flex gap-2">
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-1/3 border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white transition-all" placeholder="Age" />
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-2/3 border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white cursor-pointer transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Referred Doctor & Address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center justify-between">
                <span>Referred By (Doctor)</span>
                <span className="text-[10px] text-blue-700 font-semibold lowercase">e.g. DR DHARMENDAR KUMAR or Self</span>
              </label>
              <input 
                type="text" 
                name="doctor_name" 
                list="doctor-suggestions"
                value={formData.doctor_name} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white transition-all" 
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
                className="w-full border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg bg-white transition-all" 
                placeholder="e.g. Bhingari Bazaar, Deoria" 
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2.5">
             <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer">
               {editingId ? 'Update Detail' : 'Save Patient'}
             </button>
             <button onClick={closeForm} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 text-xs font-bold uppercase rounded-lg border border-slate-200 transition-all cursor-pointer">
               Cancel
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-50/80">
           <form onSubmit={handleSearchSubmit} className="flex items-center border border-slate-200 bg-white px-2.5 rounded-xl w-full sm:w-auto shadow-xs focus-within:border-blue-500 transition-colors">
             <Search size={16} className="text-slate-400 shrink-0" />
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Patient ID, Name or Phone..." className="p-2 text-xs font-medium outline-none w-full sm:w-64 bg-transparent" />
             <button type="submit" className="text-xs uppercase font-bold text-blue-600 hover:text-blue-800 px-2 shrink-0 cursor-pointer">Search</button>
           </form>
           <span className="text-[11px] font-bold uppercase text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
             Total: {patients.length} Records
           </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-xs text-left border-collapse">
            <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200/80">
              <tr>
                <th className="px-3.5 py-3 border-r border-slate-200/60 whitespace-nowrap">Patient ID</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60">Name</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 text-center hidden sm:table-cell">Age/Gender</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 hidden md:table-cell">Phone</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 hidden lg:table-cell">Referred Doctor</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 hidden xl:table-cell">Reg. Date</th>
                <th className="px-3.5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-blue-500" />
                    Loading patients...
                  </td>
                </tr>
              ) : patients.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-3.5 py-3 border-r border-slate-100 whitespace-nowrap">
                    <span className="font-mono text-blue-700 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {p.id}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 border-r border-slate-100">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-500 sm:hidden">{p.age}Y • {p.gender?.[0]} • {p.phone}</p>
                    {p.address && <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-xs">{p.address}</p>}
                  </td>
                  <td className="px-3.5 py-3 border-r border-slate-100 text-center hidden sm:table-cell whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {p.age}Y / {p.gender ? p.gender[0] : 'M'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 border-r border-slate-100 hidden md:table-cell font-mono text-slate-600">{p.phone}</td>
                  <td className="px-3.5 py-3 border-r border-slate-100 text-slate-700 font-medium hidden lg:table-cell">{p.doctor_name || 'Self / Walk-in'}</td>
                  <td className="px-3.5 py-3 border-r border-slate-100 hidden xl:table-cell text-slate-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  <td className="px-3.5 py-3 text-center whitespace-nowrap">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95" title="Edit Patient"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95" title="Delete Patient"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
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
