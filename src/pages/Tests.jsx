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
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-wrap justify-between items-center pb-3 gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tests Catalog & Master</h2>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-0.5">Manage tests, price and bio-reference limits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchTests(searchQuery, selectedCategory)} className="bg-white text-slate-600 px-3 py-2 text-[12px] font-bold uppercase border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { closeForm(); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 text-[12px] font-bold uppercase rounded-lg border border-emerald-700 flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer">
            <Plus size={16} /> <span className="hidden sm:inline">+ Add New Test</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm animate-fade-in-up space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <FlaskConical size={18} className="text-emerald-600" />
              <span>{editingId ? `Edit Test Profile: ${editingId}` : 'Add New Disease Test & Configure Limits'}</span>
            </h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18}/></button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Test / Disease Profile Name * (बीमारी या जाँच का नाम)
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-lg bg-white transition-all" 
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
                  className="w-full border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-lg bg-white cursor-pointer transition-all"
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
                  className="w-full border border-slate-300 p-2.5 text-xs font-bold font-mono outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-lg bg-white text-emerald-800 transition-all" 
                  placeholder="e.g. 250" 
                  required
                />
              </div>
            </div>

            {/* Dynamic Parameter Rows & Limits */}
            <div className="border border-slate-200 p-4 rounded-xl bg-white space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
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
                  className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 text-[11px] font-bold uppercase rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={13} /> + Add Parameter
                </button>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {formData.parameters.map((param, idx) => (
                  <div key={idx} className="border border-slate-200 p-3 bg-slate-50/70 rounded-xl relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                        Parameter #{idx + 1}
                      </span>
                      {formData.parameters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParamRow(idx)}
                          className="text-rose-600 hover:text-rose-800 text-[10px] font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                          title="Remove this parameter"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                          Parameter Name (पैरामीटर)
                        </label>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleParamChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Blood Sugar (F), S. Typhi O"
                          className="w-full border border-slate-300 p-2 text-xs font-bold outline-none bg-white focus:border-emerald-600 rounded-lg"
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
                          placeholder="mg/dL, %"
                          className="w-full border border-slate-300 p-2 text-xs outline-none bg-white focus:border-emerald-600 rounded-lg font-mono"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                          Normal Bio-Reference Limit (नॉर्मल लिमिट)
                        </label>
                        <input
                          type="text"
                          value={param.normal_text}
                          onChange={(e) => handleParamChange(idx, 'normal_text', e.target.value)}
                          placeholder="e.g. 70 - 110, Negative, < 1:80"
                          className="w-full border border-slate-300 p-2 text-xs outline-none bg-white focus:border-emerald-600 rounded-lg font-mono font-bold text-blue-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 text-xs font-bold uppercase rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-xs font-bold uppercase rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save size={14} /> {editingId ? 'Update Test' : 'Save Test to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-50/80">
           <div className="flex flex-wrap gap-2">
             <form onSubmit={handleSearchSubmit} className="flex items-center border border-slate-200 bg-white px-2.5 rounded-xl w-full sm:w-auto shadow-xs focus-within:border-emerald-600 transition-colors">
               <Search size={16} className="text-slate-400 shrink-0" />
               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Tests code, name..." className="p-2 text-xs font-medium outline-none w-full sm:w-52 bg-transparent" />
               <button type="submit" className="text-xs uppercase font-bold text-emerald-600 hover:text-emerald-800 px-2 cursor-pointer shrink-0">Search</button>
             </form>
             <div className="flex items-center border border-slate-200 bg-white px-2.5 rounded-xl shadow-xs">
               <Filter size={14} className="text-slate-400 mr-1.5" />
               <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="text-xs uppercase font-bold text-slate-700 bg-transparent outline-none py-2 cursor-pointer">
                 <option value="All">All Categories</option>
                 <option value="Haematology">Haematology</option>
                 <option value="Biochemistry">Biochemistry</option>
                 <option value="Serology">Serology</option>
                 <option value="Endocrinology">Endocrinology</option>
                 <option value="Microbiology">Microbiology</option>
               </select>
             </div>
           </div>
           <span className="text-[11px] font-bold uppercase text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
             Total: {tests.length} Profiles
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs text-left border-collapse">
            <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200/80">
              <tr>
                <th className="px-3.5 py-3 border-r border-slate-200/60 text-center whitespace-nowrap">Code</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60">Test / Disease Name</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 hidden sm:table-cell">Category</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 text-center hidden md:table-cell">Parameters</th>
                <th className="px-3.5 py-3 border-r border-slate-200/60 text-right">Price (₹)</th>
                <th className="px-3.5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 font-medium divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading tests...
                  </td>
                </tr>
              ) : tests.map((t) => {
                const isExpanded = expandedTestId === t.id;
                const paramCount = t.parameters ? t.parameters.length : (t.param_counts || 1);
                return (
                  <React.Fragment key={t.id}>
                    <tr className="hover:bg-purple-50/40 transition-colors">
                      <td className="px-3.5 py-3 border-r border-slate-100 font-mono font-bold text-slate-700 text-center whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{t.id}</span>
                      </td>
                      <td className="px-3.5 py-3 border-r border-slate-100 font-bold">
                        <p className="text-slate-900 text-xs sm:text-sm">{t.name}</p>
                        {t.parameters && t.parameters.length > 0 && (
                          <p className="text-[10px] text-slate-500 font-normal truncate max-w-md mt-0.5">
                            {t.parameters.map(p => `${p.name} (${p.normal_text || 'Std'})`).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="px-3.5 py-3 border-r border-slate-100 hidden sm:table-cell text-slate-600 font-medium">{t.category}</td>
                      <td className="px-3.5 py-3 border-r border-slate-100 text-center hidden md:table-cell whitespace-nowrap">
                        <button
                          onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                        >
                          <span>{paramCount} items</span>
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </td>
                      <td className="px-3.5 py-3 border-r border-slate-100 text-right font-black text-emerald-700 font-mono text-sm whitespace-nowrap">₹{t.price}</td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                           <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95" title="Edit"><Edit2 size={13} /></button>
                           <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Parameter Limits Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" className="bg-slate-50/80 p-4 border-b border-slate-200">
                          <div className="rounded-xl border border-blue-200/80 bg-white p-3.5 shadow-xs">
                            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                              <span className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5">
                                <Sliders size={13} className="text-blue-600" /> Parameters & Reference Ranges: {t.name}
                              </span>
                              <button
                                onClick={() => handleEdit(t)}
                                className="text-[10px] font-bold text-blue-700 hover:underline uppercase cursor-pointer"
                              >
                                Edit Limits
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {(t.parameters || []).map((p, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-xs">
                                  <p className="font-extrabold text-slate-800 text-[11px]">{p.name}</p>
                                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-600">
                                    <span>Unit: <b className="font-mono text-slate-700">{p.unit || '-'}</b></span>
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
