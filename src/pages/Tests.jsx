import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, RefreshCw, Filter, Sliders, ChevronDown, ChevronUp, Save, FlaskConical } from 'lucide-react';
import Swal from 'sweetalert2';
import { testApi } from '../services/api';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTestId, setExpandedTestId] = useState(null);
  
  const initialParam = { name: '', unit: '', normal_text: '', min_range: '', max_range: '' };
  const initialForm = { 
    name: '', 
    category: 'Biochemistry', 
    price: '',
    parameters: [{ ...initialParam }] 
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTests = async (search = searchQuery, category = selectedCategory) => {
    try {
      setLoading(true);
      const data = await testApi.getAll(search, category);
      setTests(data || []);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Fetching Tests',
        text: err.message || 'Could not load tests from database',
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTests(searchQuery, selectedCategory);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParamChange = (index, field, value) => {
    const updated = [...formData.parameters];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, parameters: updated });
  };

  const handleAddParamRow = () => {
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { ...initialParam }]
    });
  };

  const handleRemoveParamRow = (index) => {
    if (formData.parameters.length <= 1) return;
    const filtered = formData.parameters.filter((_, idx) => idx !== index);
    setFormData({ ...formData, parameters: filtered });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name || !formData.name.trim() || formData.price === '' || isNaN(Number(formData.price))) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Info',
        text: 'Please provide Test Name and Price!',
        confirmButtonColor: '#059669',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    const cleanParams = formData.parameters.map((p, idx) => ({
      name: p.name.trim() || `${formData.name.trim()} (${idx + 1})`,
      unit: p.unit ? p.unit.trim() : '',
      normal_text: p.normal_text ? p.normal_text.trim() : (p.min_range && p.max_range ? `${p.min_range} - ${p.max_range}` : 'Standard'),
      min_range: p.min_range !== '' && !isNaN(Number(p.min_range)) ? Number(p.min_range) : null,
      max_range: p.max_range !== '' && !isNaN(Number(p.max_range)) ? Number(p.max_range) : null
    }));

    try {
      if (editingId) {
        await testApi.update(editingId, {
          name: formData.name.trim(),
          category: formData.category,
          price: Number(formData.price),
          parameters: cleanParams
        });
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Test catalog & limits updated.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      } else {
        await testApi.create({
          name: formData.name.trim(),
          category: formData.category,
          price: Number(formData.price),
          parameters: cleanParams
        });
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'New test profile created with limits.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      }
      closeForm();
      fetchTests(searchQuery, selectedCategory);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    }
  };

  const handleEdit = (t) => {
    setFormData({
      name: t.name,
      category: t.category,
      price: t.price,
      parameters: (t.parameters && t.parameters.length > 0)
        ? t.parameters.map(p => ({
            name: p.name,
            unit: p.unit || '',
            normal_text: p.normal_text || '',
            min_range: p.min_range != null ? String(p.min_range) : '',
            max_range: p.max_range != null ? String(p.max_range) : ''
          }))
        : [{ name: t.name, unit: '', normal_text: 'Standard', min_range: '', max_range: '' }]
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Test?',
      text: `Do you want to delete test profile ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#059669',
      confirmButtonText: 'Yes, delete it',
      customClass: { popup: 'rounded-none' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await testApi.delete(id);
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Test removed from catalog.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
          fetchTests(searchQuery, selectedCategory);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-400 pb-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 uppercase tracking-tight">Test Catalog & Bio-Reference Limits</h2>
          <p className="text-slate-600 text-[12px] uppercase tracking-wider mt-1">
            Add disease profiles, configure test parameters, units, and biological limits
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchTests(searchQuery, selectedCategory)}
            className="bg-slate-200 text-slate-700 px-3 py-2 text-[12px] font-bold uppercase tracking-wider border border-slate-400 rounded-none hover:bg-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { closeForm(); setShowForm(true); }}
            className="bg-emerald-600 text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider border border-emerald-800 rounded-none hover:bg-emerald-700 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} /> + Add Test / Disease Profile
          </button>
        </div>
      </div>

      {/* Test Creation & Parameter Limits Form */}
      {showForm && (
        <div className="bg-white border-2 border-slate-700 p-5 shadow-lg rounded-none transition-all space-y-4">
          <div className="flex justify-between items-center border-b border-slate-300 pb-2">
            <h3 className="text-[14px] font-black uppercase text-slate-900 flex items-center gap-2">
              <FlaskConical size={18} className="text-emerald-600" />
              <span>{editingId ? `Edit Test Profile: ${editingId}` : 'Add New Disease Test & Configure Limits'}</span>
            </h3>
            <button onClick={closeForm} className="text-slate-500 hover:text-red-500 cursor-pointer"><X size={18}/></button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-3 border border-slate-300">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Test / Disease Profile Name * (बीमारी या जाँच का नाम)
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-slate-400 p-2 text-xs font-bold outline-none focus:border-emerald-600 rounded-none bg-white" 
                  placeholder="e.g. Widal Test, Dengue NS1, Thyroid Profile" 
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Category (श्रेणी)</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full border border-slate-400 p-2 text-xs font-bold outline-none focus:border-emerald-600 rounded-none bg-white cursor-pointer"
                >
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Haematology">Haematology</option>
                  <option value="Serology">Serology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Clinical Pathology">Clinical Pathology</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Price ₹ * (फीस)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  className="w-full border border-slate-400 p-2 text-xs font-bold font-mono outline-none focus:border-emerald-600 rounded-none bg-white text-emerald-800" 
                  placeholder="e.g. 250" 
                  required
                />
              </div>
            </div>

            {/* Dynamic Parameter Rows & Limits */}
            <div className="border border-slate-300 p-3 bg-white space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-emerald-700" />
                    <span>Test Parameters & Bio-Reference Limits (पैरामीटर्स एवं नॉर्मल लिमिट्स)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Configure parameter limits and normal ranges that will appear on printed test reports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddParamRow}
                  className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} /> + Add Parameter
                </button>
              </div>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {formData.parameters.map((param, idx) => (
                  <div key={idx} className="border border-slate-300 p-2.5 bg-slate-50/80 rounded-none relative">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.2">
                        Parameter #{idx + 1}
                      </span>
                      {formData.parameters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParamRow(idx)}
                          className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                          title="Remove this parameter"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                          Parameter Name (पैरामीटर)
                        </label>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleParamChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Blood Sugar (F), S. Typhi O"
                          className="w-full border border-slate-300 p-1.5 text-xs font-bold outline-none bg-white focus:border-emerald-600 rounded-none"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                          Unit (इकाई)
                        </label>
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) => handleParamChange(idx, 'unit', e.target.value)}
                          placeholder="mg/dL, g/dL"
                          className="w-full border border-slate-300 p-1.5 text-xs font-mono outline-none bg-white focus:border-emerald-600 rounded-none text-center"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                          Bio-Reference Limit / Normal Range (नॉर्मल लिमिट)
                        </label>
                        <input
                          type="text"
                          value={param.normal_text}
                          onChange={(e) => handleParamChange(idx, 'normal_text', e.target.value)}
                          placeholder="e.g. 70 - 110, < 140, Negative"
                          className="w-full border border-slate-300 p-1.5 text-xs font-mono font-bold outline-none bg-white focus:border-emerald-600 rounded-none text-blue-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-emerald-600 text-white px-6 py-2 text-[12px] font-bold uppercase border border-emerald-800 rounded-none hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} /> {editingId ? 'Update Test & Limits' : 'Save Test & Configure Limits'}
              </button>
              <button 
                type="button" 
                onClick={closeForm} 
                className="bg-slate-200 text-slate-800 px-5 py-2 text-[12px] font-bold uppercase border border-slate-400 rounded-none hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white border border-slate-400 rounded-none">
        <div className="p-4 border-b border-slate-400 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-100">
           <div className="flex gap-3">
             <form onSubmit={handleSearchSubmit} className="flex items-center border border-slate-400 bg-white px-2">
               <Search size={16} className="text-slate-400" />
               <input 
                 type="text" 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 placeholder="Search Tests code, name..." 
                 className="p-2 text-[13px] outline-none w-64 bg-transparent" 
               />
               <button type="submit" className="text-xs uppercase font-bold text-emerald-600 hover:text-emerald-800 px-2 cursor-pointer">
                 Search
               </button>
             </form>
             <div className="flex items-center border border-slate-400 bg-white px-2">
               <Filter size={14} className="text-slate-500 mr-1" />
               <select 
                 value={selectedCategory} 
                 onChange={(e) => setSelectedCategory(e.target.value)}
                 className="text-[12px] uppercase font-bold text-slate-700 bg-transparent outline-none py-1.5 cursor-pointer"
               >
                 <option value="All">All Categories</option>
                 <option value="Haematology">Haematology</option>
                 <option value="Biochemistry">Biochemistry</option>
                 <option value="Serology">Serology</option>
                 <option value="Endocrinology">Endocrinology</option>
                 <option value="Microbiology">Microbiology</option>
               </select>
             </div>
           </div>
           <span className="text-[12px] font-bold uppercase text-slate-600 bg-slate-200 px-3 py-1 border border-slate-300">
             Total: {tests.length} Profiles
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 border border-slate-400 w-20 text-center">Code</th>
                <th className="px-4 py-3 border border-slate-400">Test / Disease Name</th>
                <th className="px-4 py-3 border border-slate-400 w-36">Category</th>
                <th className="px-4 py-3 border border-slate-400 w-28 text-center">Parameters</th>
                <th className="px-4 py-3 border border-slate-400 w-28 text-right">Price (₹)</th>
                <th className="px-4 py-3 border border-slate-400 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider border border-slate-400">
                    Loading tests...
                  </td>
                </tr>
              ) : tests.map((t) => {
                const isExpanded = expandedTestId === t.id;
                const paramCount = t.parameters ? t.parameters.length : (t.param_counts || 1);
                return (
                  <React.Fragment key={t.id}>
                    <tr className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-4 py-3 border border-slate-400 font-mono font-bold text-slate-700 text-center">{t.id}</td>
                      <td className="px-4 py-3 border border-slate-400 font-bold">
                        <p>{t.name}</p>
                        {t.parameters && t.parameters.length > 0 && (
                          <p className="text-[10px] text-slate-500 font-normal truncate max-w-md mt-0.5">
                            {t.parameters.map(p => `${p.name} (${p.normal_text || 'Std'})`).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-slate-400">{t.category}</td>
                      <td className="px-4 py-3 border border-slate-400 text-center">
                        <button
                          onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 cursor-pointer"
                        >
                          <span>{paramCount} items</span>
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 border border-slate-400 text-right font-black text-emerald-700 font-mono">₹{t.price}</td>
                      <td className="px-4 py-3 border border-slate-400 text-center">
                        <div className="flex justify-center gap-2">
                           <button onClick={() => handleEdit(t)} className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                           <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-red-600 transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Parameter Limits Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" className="bg-slate-50 p-3 border border-slate-300">
                          <div className="border border-blue-200 bg-white p-3">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200">
                              <span className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1">
                                <Sliders size={13} className="text-blue-600" /> Parameters & Reference Ranges: {t.name}
                              </span>
                              <button
                                onClick={() => handleEdit(t)}
                                className="text-[10px] font-bold text-blue-700 hover:underline uppercase cursor-pointer"
                              >
                                Edit Limits
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {(t.parameters || []).map((p, idx) => (
                                <div key={idx} className="border border-slate-200 p-2 bg-slate-50 text-xs">
                                  <p className="font-extrabold text-slate-800 text-[11px]">{p.name}</p>
                                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-600">
                                    <span>Unit: <b className="font-mono">{p.unit || '-'}</b></span>
                                    <span>Limit: <b className="font-mono text-blue-700">{p.normal_text || 'Standard'}</b></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
