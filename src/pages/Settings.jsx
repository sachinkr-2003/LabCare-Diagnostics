import React, { useState, useEffect } from 'react';
import { 
  Save, Building2, Image as ImageIcon, Banknote, ShieldAlert, 
  MonitorCheck, Trash2, Edit2, RefreshCw, Download, Database, 
  FileSpreadsheet, HardDrive, Plus, X, Activity, ChevronDown, 
  ChevronUp, Sliders, CheckCircle, Search, FlaskConical, Stethoscope
} from 'lucide-react';
import Swal from 'sweetalert2';
import { settingsApi, testApi, backupApi } from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('test_rates');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    lab_name: 'APEX DIAGNOSTIC CENTRE',
    reg_number: 'UP-DEO-2024-5412',
    lab_phone: '8102002499, 8084602700',
    lab_email: 'contact@apexdiagnostic.com',
    lab_address: 'मीरगंज रोड भोरे, पंजाब नेशनल बैंक के बगल में (भोरे)',
    doctor_name: 'DR DHARMENDAR KUMAR (M.B.B.S, M.D. Pathology)',
    default_doctor: 'Self',
    header_tagline: 'होम कलेक्शन की सुविधा • ई० सी० जी० की सुविधा • 24 घण्टे सेवा उपलब्ध',
    footer_text: 'Note: Pathological Test have technical limitations. For any disparity repeated examination are required. No legal liability is accepted. Clinical correlation is also requested.'
  });

  // Tests & Parameters Master State
  const [testsList, setTestsList] = useState([]);
  const [testSearch, setTestSearch] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState('All');
  const [expandedTestId, setExpandedTestId] = useState(null);

  // Test Modal Form State
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const initialParam = { name: '', unit: '', normal_text: '', min_range: '', max_range: '' };
  const [testForm, setTestForm] = useState({
    name: '',
    category: 'Biochemistry',
    price: '',
    parameters: [{ ...initialParam }]
  });

  const fetchSettingsAndTests = async () => {
    try {
      setLoading(true);
      const [fetchedSettings, fetchedTests, statsData] = await Promise.all([
        settingsApi.get(),
        testApi.getAll(),
        backupApi.getStats().catch(() => null)
      ]);

      if (fetchedSettings && Object.keys(fetchedSettings).length > 0) {
        setSettings(prev => ({ ...prev, ...fetchedSettings }));
      }

      if (fetchedTests) {
        setTestsList(fetchedTests);
      }

      if (statsData) {
        setDbStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndTests();
  }, []);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAllSettings = async () => {
    try {
      setSaving(true);
      await settingsApi.update(settings);
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved',
        text: 'All clinic profile and report header settings saved in SQLite database.',
        timer: 1600,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none' }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setSaving(false);
    }
  };

  // Test Creation & Editing Handlers
  const openCreateTestModal = () => {
    setEditingTestId(null);
    setTestForm({
      name: '',
      category: 'Biochemistry',
      price: '',
      parameters: [{ name: '', unit: 'mg/dL', normal_text: '', min_range: '', max_range: '' }]
    });
    setShowTestModal(true);
  };

  const openEditTestModal = (test) => {
    setEditingTestId(test.id);
    setTestForm({
      name: test.name,
      category: test.category || 'Biochemistry',
      price: test.price,
      parameters: (test.parameters && test.parameters.length > 0)
        ? test.parameters.map(p => ({
            name: p.name,
            unit: p.unit || '',
            normal_text: p.normal_text || '',
            min_range: p.min_range != null ? String(p.min_range) : '',
            max_range: p.max_range != null ? String(p.max_range) : ''
          }))
        : [{ name: test.name, unit: '', normal_text: 'Standard', min_range: '', max_range: '' }]
    });
    setShowTestModal(true);
  };

  const handleParamChange = (index, field, value) => {
    const updated = [...testForm.parameters];
    updated[index] = { ...updated[index], [field]: value };
    setTestForm({ ...testForm, parameters: updated });
  };

  const handleAddParamRow = () => {
    setTestForm({
      ...testForm,
      parameters: [...testForm.parameters, { ...initialParam }]
    });
  };

  const handleRemoveParamRow = (index) => {
    if (testForm.parameters.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'At least 1 Parameter Required',
        text: 'A diagnostic test must have at least one parameter limit.',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none' }
      });
      return;
    }
    const filtered = testForm.parameters.filter((_, idx) => idx !== index);
    setTestForm({ ...testForm, parameters: filtered });
  };

  const handleSaveTestAndLimits = async (e) => {
    e?.preventDefault();
    if (!testForm.name || !testForm.name.trim()) {
      Swal.fire({ icon: 'error', title: 'Test Name Required', text: 'Please enter disease/test name!', customClass: { popup: 'rounded-none' } });
      return;
    }
    if (testForm.price === '' || isNaN(Number(testForm.price))) {
      Swal.fire({ icon: 'error', title: 'Price Required', text: 'Please enter valid test price in INR!', customClass: { popup: 'rounded-none' } });
      return;
    }

    // Clean parameters
    const cleanParams = testForm.parameters.map((p, idx) => ({
      name: (p.name && p.name.trim()) ? p.name.trim() : (testForm.parameters.length === 1 ? testForm.name.trim() : `${testForm.name.trim()} (${idx + 1})`),
      unit: p.unit ? p.unit.trim() : '',
      normal_text: p.normal_text ? p.normal_text.trim() : (p.min_range && p.max_range ? `${p.min_range} - ${p.max_range}` : 'Standard'),
      min_range: p.min_range !== '' && !isNaN(Number(p.min_range)) ? Number(p.min_range) : null,
      max_range: p.max_range !== '' && !isNaN(Number(p.max_range)) ? Number(p.max_range) : null
    }));

    try {
      if (editingTestId) {
        await testApi.update(editingTestId, {
          name: testForm.name.trim(),
          category: testForm.category,
          price: Number(testForm.price),
          parameters: cleanParams
        });
        Swal.fire({ icon: 'success', title: 'Updated!', text: `Test "${testForm.name}" & limits updated.`, timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      } else {
        await testApi.create({
          name: testForm.name.trim(),
          category: testForm.category,
          price: Number(testForm.price),
          parameters: cleanParams
        });
        Swal.fire({ icon: 'success', title: 'Saved!', text: `New test "${testForm.name}" added to catalog with ${cleanParams.length} parameters.`, timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
      }

      setShowTestModal(false);
      fetchSettingsAndTests();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.message, customClass: { popup: 'rounded-none' } });
    }
  };

  const handleDeleteTest = (id, name) => {
    Swal.fire({
      title: `Delete ${name || id}?`,
      text: 'This will remove the test and its configured limits from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      customClass: { popup: 'rounded-none' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await testApi.delete(id);
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Test record removed.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-none' } });
          fetchSettingsAndTests();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message, customClass: { popup: 'rounded-none' } });
        }
      }
    });
  };

  // Filtered Tests
  const filteredTests = testsList.filter(t => {
    const matchesSearch = testSearch.trim() === '' || 
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(testSearch.toLowerCase()) ||
      (t.parameters && t.parameters.some(p => p.name.toLowerCase().includes(testSearch.toLowerCase())));

    const matchesCategory = testCategoryFilter === 'All' || t.category === testCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-400 pb-4">
        <div>
          <h2 className="text-[24px] font-bold text-slate-800 uppercase tracking-tight">System Configuration & Limits Master</h2>
          <p className="text-slate-600 text-[12px] uppercase tracking-wider mt-0.5">
            Manage disease tests, bio-reference ranges/limits, clinic profile, and default doctors
          </p>
        </div>
        <button 
          onClick={handleSaveAllSettings} 
          disabled={saving}
          className="bg-slate-900 text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider border border-slate-950 rounded-none hover:bg-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-1/4">
          <div className="bg-white border border-slate-400 p-2 shadow-none rounded-none flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('test_rates')} 
              className={`text-left px-3.5 py-2.5 text-[12px] uppercase font-bold tracking-wider flex items-center gap-2.5 transition-colors border ${activeTab === 'test_rates' ? 'bg-blue-700 text-white border-blue-800 shadow-xs' : 'text-slate-700 hover:bg-slate-100 border-transparent'}`}
            >
              <FlaskConical size={16} className={activeTab === 'test_rates' ? 'text-cyan-300' : 'text-blue-600'} /> 
              <span>Tests & Limits Master</span>
            </button>
            <button 
              onClick={() => setActiveTab('general')} 
              className={`text-left px-3.5 py-2.5 text-[12px] uppercase font-bold tracking-wider flex items-center gap-2.5 transition-colors border ${activeTab === 'general' ? 'bg-slate-800 text-white border-slate-900' : 'text-slate-700 hover:bg-slate-100 border-transparent'}`}
            >
              <Building2 size={16} /> Clinic Profile
            </button>
            <button 
              onClick={() => setActiveTab('print')} 
              className={`text-left px-3.5 py-2.5 text-[12px] uppercase font-bold tracking-wider flex items-center gap-2.5 transition-colors border ${activeTab === 'print' ? 'bg-slate-800 text-white border-slate-900' : 'text-slate-700 hover:bg-slate-100 border-transparent'}`}
            >
              <ImageIcon size={16} /> Report Header & Doctors
            </button>
            <button 
              onClick={() => setActiveTab('system')} 
              className={`text-left px-3.5 py-2.5 text-[12px] uppercase font-bold tracking-wider flex items-center gap-2.5 transition-colors border ${activeTab === 'system' ? 'bg-slate-800 text-white border-slate-900' : 'text-slate-700 hover:bg-slate-100 border-transparent'}`}
            >
              <MonitorCheck size={16} /> Database Backup
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3.5 mt-4 text-blue-900">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle size={14} className="text-blue-600" /> Live SQLite Database
            </p>
            <p className="text-[10px] text-blue-800 leading-relaxed">
              New tests and bio-reference limits added here will immediately appear in Order Billing and Diagnostic Reports.
            </p>
          </div>
        </div>

        {/* Configuration Content Panels */}
        <div className="w-full md:w-3/4">
          
          {/* ================= TAB 1: TESTS & BIO-REFERENCE LIMITS MASTER ================= */}
          {activeTab === 'test_rates' && (
            <div className="bg-white border border-slate-400 p-5 shadow-none rounded-none space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-300 pb-3">
                <div>
                  <h3 className="text-[15px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FlaskConical size={18} className="text-blue-600" /> 
                    <span>Tests & Bio-Reference Limits Master</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 uppercase mt-0.5">
                    Add diseases/tests and configure parameter limits & normal ranges
                  </p>
                </div>
                <button
                  onClick={openCreateTestModal}
                  className="bg-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider border border-blue-900 rounded-none hover:bg-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus size={15} /> + Add New Test / Disease
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-50 p-2.5 border border-slate-300">
                <div className="flex items-center bg-white border border-slate-300 px-2 py-1 max-w-xs w-full">
                  <Search size={14} className="text-slate-400 mr-1.5" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    placeholder="Search test or parameter..."
                    className="w-full text-xs outline-none bg-transparent font-medium"
                  />
                  {testSearch && (
                    <button onClick={() => setTestSearch('')} className="text-slate-400 hover:text-slate-700">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 flex-wrap">
                  {['All', 'Biochemistry', 'Haematology', 'Serology', 'Endocrinology', 'Microbiology'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTestCategoryFilter(cat)}
                      className={`text-[10px] px-2.5 py-1 font-bold uppercase border transition-colors cursor-pointer ${
                        testCategoryFilter === cat ? 'bg-slate-800 text-white border-slate-900' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tests Master Table with Expandable Parameters */}
              <div className="overflow-x-auto border border-slate-300">
                <table className="w-full text-xs text-left border-collapse bg-white">
                  <thead className="bg-slate-800 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5 border-r border-slate-600 w-14 text-center">ID</th>
                      <th className="p-2.5 border-r border-slate-600">Test / Disease Profile Name</th>
                      <th className="p-2.5 border-r border-slate-600 w-32">Category</th>
                      <th className="p-2.5 border-r border-slate-600 w-24 text-center">Parameters</th>
                      <th className="p-2.5 border-r border-slate-600 w-24 text-right">Price (₹)</th>
                      <th className="p-2.5 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTests.map((t) => {
                      const isExpanded = expandedTestId === t.id;
                      const paramCount = t.parameters ? t.parameters.length : (t.param_counts || 1);
                      return (
                        <React.Fragment key={t.id}>
                          <tr className={`hover:bg-blue-50/40 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                            <td className="p-2.5 border-r border-slate-200 text-slate-500 font-mono font-bold text-center">
                              {t.id}
                            </td>
                            <td className="p-2.5 border-r border-slate-200">
                              <p className="font-extrabold text-slate-900 uppercase text-xs">{t.name}</p>
                              {t.parameters && t.parameters.length > 0 && (
                                <p className="text-[10px] text-slate-500 truncate max-w-sm mt-0.5">
                                  Limits: {t.parameters.map(p => `${p.name} (${p.normal_text || 'Std'})`).join(' • ')}
                                </p>
                              )}
                            </td>
                            <td className="p-2.5 border-r border-slate-200">
                              <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase border border-slate-200">
                                {t.category}
                              </span>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center">
                              <button
                                onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 cursor-pointer"
                                title="Click to view/hide parameter limits"
                              >
                                <span>{paramCount} item{paramCount > 1 ? 's' : ''}</span>
                                {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              </button>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-right font-black text-emerald-700 font-mono text-xs">
                              ₹{t.price}
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => openEditTestModal(t)}
                                  className="bg-slate-700 hover:bg-slate-900 text-white px-2 py-1 text-[10.5px] font-bold uppercase rounded-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Edit Test & Limits"
                                >
                                  <Edit2 size={11} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTest(t.id, t.name)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-1 text-[10.5px] font-bold uppercase rounded-xs transition-colors cursor-pointer"
                                  title="Delete Test"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Parameters & Limits View */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="bg-slate-50/90 p-3 border-b border-slate-300">
                                <div className="border border-blue-200 bg-white p-3 shadow-2xs">
                                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-200">
                                    <span className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1">
                                      <Sliders size={13} className="text-blue-600" /> Configured Parameters & Normal Reference Ranges
                                    </span>
                                    <button
                                      onClick={() => openEditTestModal(t)}
                                      className="text-[10px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      Edit Limits
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {(t.parameters || []).map((p, idx) => (
                                      <div key={idx} className="border border-slate-200 p-2 bg-slate-50/60 text-xs">
                                        <p className="font-extrabold text-slate-800 uppercase text-[11px]">{p.name}</p>
                                        <div className="flex justify-between items-center mt-1 text-[10px] text-slate-600">
                                          <span>Unit: <b className="font-mono text-slate-800">{p.unit || '-'}</b></span>
                                          <span>Range: <b className="font-mono text-blue-700">{p.normal_text || (p.min_range != null && p.max_range != null ? `${p.min_range} - ${p.max_range}` : 'Standard')}</b></span>
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

                    {filteredTests.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-500 italic text-xs">
                          No matching tests found. Click "+ Add New Test / Disease" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CLINIC PROFILE ================= */}
          {activeTab === 'general' && (
            <div className="bg-white border border-slate-400 p-6 shadow-none rounded-none">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-300 pb-2">
                <Building2 size={20} className="text-slate-500" />
                <h3 className="text-[15px] font-bold uppercase tracking-wider text-slate-800">Clinic Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Clinic/Lab Name</label>
                  <input 
                    type="text" 
                    value={settings.lab_name || ''} 
                    onChange={(e) => handleSettingChange('lab_name', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Registration Number</label>
                  <input 
                    type="text" 
                    value={settings.reg_number || ''} 
                    onChange={(e) => handleSettingChange('reg_number', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Helpline / WhatsApp Phones</label>
                  <input 
                    type="text" 
                    value={settings.lab_phone || ''} 
                    onChange={(e) => handleSettingChange('lab_phone', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-mono font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={settings.lab_email || ''} 
                    onChange={(e) => handleSettingChange('lab_email', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Official Address (Hindi / English)</label>
                  <textarea 
                    rows={2} 
                    value={settings.lab_address || ''} 
                    onChange={(e) => handleSettingChange('lab_address', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white leading-relaxed font-medium" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: REPORT HEADER & DOCTORS ================= */}
          {activeTab === 'print' && (
            <div className="bg-white border border-slate-400 p-6 shadow-none rounded-none space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                <ImageIcon size={20} className="text-slate-500" />
                <h3 className="text-[15px] font-bold uppercase tracking-wider text-slate-800">Report Header & Doctors Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">
                    Default Referral Doctor (डिफ़ॉल्ट डॉक्टर)
                  </label>
                  <input 
                    type="text" 
                    value={settings.default_doctor || 'Self'} 
                    onChange={(e) => handleSettingChange('default_doctor', e.target.value)} 
                    placeholder="e.g. Self (Walk-in)"
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-bold" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    When creating orders without a doctor, this value will be automatically applied (Defaults to "Self").
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">
                    Consultant Pathologist Name & Degree
                  </label>
                  <input 
                    type="text" 
                    value={settings.doctor_name || ''} 
                    onChange={(e) => handleSettingChange('doctor_name', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Header Tagline / Facility Strip</label>
                  <input 
                    type="text" 
                    value={settings.header_tagline || ''} 
                    onChange={(e) => handleSettingChange('header_tagline', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white font-medium" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">Official Report Disclaimer Note</label>
                  <textarea 
                    rows={3} 
                    value={settings.footer_text || ''} 
                    onChange={(e) => handleSettingChange('footer_text', e.target.value)} 
                    className="w-full border border-slate-400 p-2 text-[13px] outline-none focus:border-slate-800 rounded-none bg-slate-50 focus:bg-white leading-relaxed font-medium" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: DATABASE & BACKUP ================= */}
          {activeTab === 'system' && (
            <div className="bg-white border border-slate-400 p-6 shadow-none rounded-none space-y-6">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <HardDrive size={20} className="text-slate-500" />
                  <h3 className="text-[15px] font-bold uppercase tracking-wider text-slate-800">Database & Data Management</h3>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300 font-bold uppercase">
                  SQLite3 WAL Mode
                </span>
              </div>

              {dbStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-slate-300 p-3 bg-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Patients</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{dbStats.patients}</p>
                  </div>
                  <div className="border border-slate-300 p-3 bg-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Orders</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{dbStats.orders}</p>
                  </div>
                  <div className="border border-slate-300 p-3 bg-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Test Profiles</p>
                    <p className="text-xl font-black text-blue-700 mt-1">{testsList.length}</p>
                  </div>
                  <div className="border border-slate-300 p-3 bg-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Database Size</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{dbStats.db_size_kb} KB</p>
                  </div>
                </div>
              )}

              <div className="border border-slate-300 p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-800">Download SQLite Database File (.sqlite)</p>
                  <p className="text-[11px] text-slate-500">Full standalone backup including all patients, orders, and results.</p>
                </div>
                <a
                  href={backupApi.downloadDbUrl}
                  download
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-emerald-800"
                >
                  <Download size={14} /> Download Backup
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT TEST & PARAMETER LIMITS ================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative rounded-none overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b1e3b] to-[#1d4ed8] text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-blue-900 shadow-md">
              <div className="flex items-center gap-2">
                <FlaskConical size={18} className="text-cyan-300" />
                <h3 className="text-xs sm:text-sm uppercase font-black tracking-wider text-white">
                  {editingTestId ? `Edit Disease & Limits: ${testForm.name || editingTestId}` : '+ बीमारी का नाम, यूनिट एवं लिमिट सेट करें'}
                </h3>
              </div>
              <button 
                onClick={() => setShowTestModal(false)}
                className="text-white hover:text-red-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveTestAndLimits} className="overflow-y-auto flex-1 p-5 space-y-4">
              
              {/* Informative Tip */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-2.5 text-xs text-blue-950 flex items-center justify-between">
                <span>💡 <strong>आसान तरीका:</strong> यहाँ बीमारी का नाम, उसका यूनिट और नॉर्मल लिमिट डालें। यह सीधे रिपोर्ट में सेट हो जाएगी।</span>
              </div>

              {/* Disease & Test Name */}
              <div className="bg-slate-50 p-3.5 border border-slate-300 space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-900 mb-1">
                    1. बीमारी / टेस्ट का नाम (Disease / Test Name) *
                  </label>
                  <input
                    type="text"
                    value={testForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const updatedParams = [...testForm.parameters];
                      if (updatedParams.length === 1 && (!updatedParams[0].name || updatedParams[0].name === testForm.name)) {
                        updatedParams[0].name = newName;
                      }
                      setTestForm({ ...testForm, name: newName, parameters: updatedParams });
                    }}
                    placeholder="जैसे: Blood Sugar Fasting, Hemoglobin, Typhoid Widal, Dengue..."
                    className="w-full border-2 border-slate-400 p-2.5 text-sm font-bold outline-none bg-white focus:border-blue-600 rounded-none text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      कैटेगरी (Category)
                    </label>
                    <select
                      value={testForm.category}
                      onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                      className="w-full border border-slate-400 p-2 text-xs font-bold outline-none bg-white cursor-pointer rounded-none"
                    >
                      <option value="Biochemistry">Biochemistry</option>
                      <option value="Haematology">Haematology</option>
                      <option value="Serology">Serology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Microbiology">Microbiology</option>
                      <option value="Clinical Pathology">Clinical Pathology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      जाँच की फीस ₹ (Price) *
                    </label>
                    <input
                      type="number"
                      value={testForm.price}
                      onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                      placeholder="e.g. 100"
                      className="w-full border border-slate-400 p-2 text-xs font-black font-mono outline-none bg-white focus:border-blue-600 rounded-none text-emerald-800"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Single / Primary Parameter Unit & Range Setting */}
              {testForm.parameters.length === 1 && (
                <div className="bg-white border-2 border-blue-500/40 p-3.5 space-y-3">
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center">
                    <span className="text-xs font-black text-blue-900 uppercase">
                      2. यूनिट और नॉर्मल लिमिट (Unit & Reference Range)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                      रिपोर्ट में यही दिखेगा
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Unit */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold uppercase text-slate-800 mb-1">
                        यूनिट (Unit)
                      </label>
                      <input
                        type="text"
                        value={testForm.parameters[0].unit || ''}
                        onChange={(e) => handleParamChange(0, 'unit', e.target.value)}
                        placeholder="जैसे mg/dL, g/dL, %"
                        className="w-full border-2 border-slate-400 p-2 text-xs font-bold text-center outline-none bg-white focus:border-blue-600 rounded-none"
                      />
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {['mg/dL', 'g/dL', '%', 'mm/hr', '/cumm', 'Ratio', 'Negative'].map(u => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => handleParamChange(0, 'unit', u)}
                            className="text-[9.5px] bg-slate-100 hover:bg-blue-100 text-slate-800 border border-slate-300 px-1.5 py-0.5 font-bold cursor-pointer transition-colors"
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Normal Range */}
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold uppercase text-slate-800 mb-1">
                        नॉर्मल लिमिट / रेफरेंस रेंज (Normal Range) *
                      </label>
                      <input
                        type="text"
                        value={testForm.parameters[0].normal_text || ''}
                        onChange={(e) => handleParamChange(0, 'normal_text', e.target.value)}
                        placeholder="जैसे 70 - 110, < 140, 12.0 - 16.0, Negative"
                        className="w-full border-2 border-slate-400 p-2 text-xs font-mono font-bold outline-none bg-white focus:border-blue-600 rounded-none text-blue-900"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        उदाहरण: <strong>70 - 110</strong> (इसके बाहर जाने पर रिपोर्ट में लाल रंग और ▲ दिखेगा)
                      </p>
                    </div>
                  </div>

                  {/* Add more parameters option */}
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleAddParamRow}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> + क्या इस टेस्ट में एक से ज्यादा पैरामीटर हैं? (जैसे CBC, LFT)
                    </button>
                  </div>
                </div>
              )}

              {/* Multi-Parameter Rows (Only shown if user adds more parameters like CBC, LFT) */}
              {testForm.parameters.length > 1 && (
                <div className="border border-slate-300 p-3 bg-white space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                        <Sliders size={14} className="text-blue-700" />
                        <span>मल्टीपल पैरामीटर्स ({testForm.parameters.length} items)</span>
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParamRow}
                      className="bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> + Add Another
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {testForm.parameters.map((param, idx) => (
                      <div key={idx} className="border border-slate-300 p-2.5 bg-slate-50/80 rounded-none relative">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.2">
                            Parameter #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveParamRow(idx)}
                            className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                              Parameter Name
                            </label>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => handleParamChange(idx, 'name', e.target.value)}
                              placeholder="e.g. Blood Sugar (F)"
                              className="w-full border border-slate-300 p-1.5 text-xs font-bold outline-none bg-white focus:border-blue-600 rounded-none"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={param.unit}
                              onChange={(e) => handleParamChange(idx, 'unit', e.target.value)}
                              placeholder="mg/dL"
                              className="w-full border border-slate-300 p-1.5 text-xs font-mono outline-none bg-white focus:border-blue-600 rounded-none text-center"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold uppercase text-slate-700 mb-0.5">
                              Normal Range / Limit
                            </label>
                            <input
                              type="text"
                              value={param.normal_text}
                              onChange={(e) => handleParamChange(idx, 'normal_text', e.target.value)}
                              placeholder="e.g. 70 - 110"
                              className="w-full border border-slate-300 p-1.5 text-xs font-mono font-bold outline-none bg-white focus:border-blue-600 rounded-none text-blue-900"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 text-xs font-bold uppercase rounded-none transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-none transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Save size={14} /> {editingTestId ? 'Update Disease & Limits' : 'Save Disease & Unit Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}