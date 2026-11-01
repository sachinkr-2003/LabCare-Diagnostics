import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, FlaskConical, Search, Plus, CheckCircle, Clock, FileText, AlertTriangle, User, Calendar, X, ArrowRight, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { resultApi, testApi } from '../services/api';

export default function EnterResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(searchParams.get('orderId') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [resultsState, setResultsState] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [mobileTab, setMobileTab] = useState('form'); // 'queue' | 'form'
  const [catalogTests, setCatalogTests] = useState([]);
  const [selectedCatalogTestId, setSelectedCatalogTestId] = useState('');

  useEffect(() => {
    testApi.getAll().then(data => setCatalogTests(data || [])).catch(() => {});
  }, []);

  const handleAddCatalogCheck = (testId) => {
    if (!testId) return;
    const test = catalogTests.find(t => t.id === testId);
    if (!test) return;

    if (test.parameters && test.parameters.length > 0) {
      const newItems = test.parameters.map(p => ({
        id: null,
        test_id: test.id,
        test_name: test.name,
        parameter_name: p.name,
        result_value: '',
        unit: p.unit || '',
        normal_range: p.normal_text || '',
        flag: 'Normal'
      }));
      setResultsState(prev => [...prev, ...newItems]);
    } else {
      setResultsState(prev => [
        ...prev,
        {
          id: null,
          test_id: test.id,
          test_name: test.name,
          parameter_name: test.name,
          result_value: '',
          unit: '',
          normal_range: 'Standard',
          flag: 'Normal'
        }
      ]);
    }
    setSelectedCatalogTestId('');
  };

  // Fetch live suggestions / pending queue
  const fetchSuggestions = async (query = '') => {
    try {
      const list = await resultApi.getSuggestions(query);
      setSuggestions(list || []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchId);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchId]);

  const loadOrder = async (query) => {
    if (!query || !query.trim()) return;
    try {
      setLoading(true);
      const data = await resultApi.search(query.trim());
      setOrderData(data);
      setResultsState(data.results || []);
      setDoctorName(data.doctor_name || 'Self');
    } catch (err) {
      setOrderData(null);
      setResultsState([]);
      setDoctorName('');
      Swal.fire({
        icon: 'error',
        title: 'Order Not Found',
        text: err.message || `No orders found matching '${query}'`,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      setSearchId(paramId);
      loadOrder(paramId);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrder(searchId);
  };

  const handleSelectOrder = (ordId) => {
    setSearchId(ordId);
    loadOrder(ordId);
    setMobileTab('form');
  };

  const handleParamChange = (index, value) => {
    const updated = [...resultsState];
    updated[index] = { ...updated[index], result_value: value };
    setResultsState(updated);
  };

  const handleRemoveParam = (indexToRemove) => {
    setResultsState(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveTestGroup = (testNameToRemove) => {
    setResultsState(prev => prev.filter(p => (p.test_name || 'Laboratory Test') !== testNameToRemove));
  };

  const handleClearAllTests = () => {
    if (resultsState.length === 0) return;
    Swal.fire({
      title: 'Sabhi Tests Hataayein?',
      text: 'Kya aap is order se sabhi tests hatana chahte hain? Aap apni pasand ke naye test catalog se add kar payenge.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Haan, Sab Hatao (Clear All)',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-none' }
    }).then((result) => {
      if (result.isConfirmed) {
        setResultsState([]);
      }
    });
  };

  const handleAddCustomParam = () => {
    setResultsState(prev => [
      ...prev,
      {
        id: null,
        test_name: 'Extra Investigation (अतिरिक्त जाँच)',
        parameter_name: '',
        result_value: '',
        unit: 'mg/dL',
        normal_range: 'Standard',
        flag: 'Normal'
      }
    ]);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...resultsState];
    updated[index] = { ...updated[index], [field]: value };
    setResultsState(updated);
  };

  // Helper to determine live High / Low / Normal status as user types
  const getParamStatus = (val, normalRange) => {
    if (!val || !val.trim()) return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    if (!normalRange) return null;

    // Pattern: "70 - 110" or "70-110"
    const matchBetween = normalRange.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
    if (matchBetween) {
      const min = parseFloat(matchBetween[1]);
      const max = parseFloat(matchBetween[2]);
      if (num > max) return { status: 'HIGH', label: '▲ High', color: 'text-rose-700 bg-rose-100 border-rose-300 font-black' };
      if (num < min) return { status: 'LOW', label: '▼ Low', color: 'text-blue-700 bg-blue-100 border-blue-300 font-black' };
      return { status: 'NORMAL', label: '✓ Normal', color: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-bold' };
    }

    // Pattern: "< 140" or "<140"
    const matchLess = normalRange.match(/<\s*([0-9.]+)/);
    if (matchLess) {
      const max = parseFloat(matchLess[1]);
      if (num > max) return { status: 'HIGH', label: '▲ High', color: 'text-rose-700 bg-rose-100 border-rose-300 font-black' };
      return { status: 'NORMAL', label: '✓ Normal', color: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-bold' };
    }

    // Pattern: "> 60"
    const matchGreater = normalRange.match(/>\s*([0-9.]+)/);
    if (matchGreater) {
      const min = parseFloat(matchGreater[1]);
      if (num < min) return { status: 'LOW', label: '▼ Low', color: 'text-blue-700 bg-blue-100 border-blue-300 font-black' };
      return { status: 'NORMAL', label: '✓ Normal', color: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-bold' };
    }

    return null;
  };

  const handleSaveResults = async () => {
    if (!orderData) return;

    try {
      setSaving(true);
      await resultApi.save(orderData.order_id, resultsState, (doctorName && doctorName.trim()) ? doctorName.trim() : 'Self');

      Swal.fire({
        icon: 'success',
        title: 'Results Saved!',
        html: `<p class="text-sm">Order <b>${orderData.order_id}</b> for <b>${orderData.patient_name}</b> marked as Completed.</p>`,
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'View Diagnostic Report',
        cancelButtonText: 'Done',
        customClass: { popup: 'rounded-none' }
      }).then((res) => {
        if (res.isConfirmed) {
          navigate(`/reports?orderId=${orderData.order_id}`);
        } else {
          loadOrder(orderData.order_id);
          fetchSuggestions(searchId);
        }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Group parameters by test_name
  const groupedResults = resultsState.reduce((acc, curr, idx) => {
    const testName = curr.test_name || 'Laboratory Test';
    if (!acc[testName]) {
      acc[testName] = [];
    }
    acc[testName].push({ ...curr, originalIndex: idx });
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center pb-3 gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Enter Results</h2>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider mt-0.5">Search by Name, Mobile, or Order ID</p>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="flex lg:hidden bg-slate-200/70 p-1 rounded-none text-xs font-bold shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab('queue')}
          className={`flex-1 py-2 text-center rounded-none transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'queue' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={13} />
          <span>Patient Queue ({suggestions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-center rounded-none transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'form' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={13} />
          <span>Test Form {orderData ? `(${orderData.order_id})` : ''}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Search & Patient List Panel (4 Cols) */}
        <div className={`lg:col-span-4 space-y-4 ${mobileTab === 'queue' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-none border border-slate-300 p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 flex items-center justify-between">
              <span>Find Patient Order</span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-200">
                Live Search
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 uppercase mt-2">
              Search by <b className="text-slate-800">Patient Name</b> (e.g. Priya), Phone, Order ID, or Patient ID:
            </p>
            
            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="flex border-2 border-slate-700 rounded-none overflow-hidden mt-2 focus-within:border-purple-600">
              <input 
                type="text" 
                value={searchId} 
                onChange={e => setSearchId(e.target.value)} 
                placeholder="Type Name (e.g. Priya), Phone, or Order ID..." 
                className="w-full px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium" 
              />
              {searchId && (
                <button 
                  type="button" 
                  onClick={() => setSearchId('')} 
                  className="px-2 text-slate-400 hover:text-slate-700 flex items-center cursor-pointer"
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-purple-600 text-white px-4 hover:bg-purple-700 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                title="Search"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Currently Selected Order Summary Box */}
            {orderData && (
              <div className="mt-4 p-3.5 border-2 border-purple-500 bg-purple-50/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider font-mono">
                    ORDER: {orderData.order_id}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                    orderData.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {orderData.status}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 uppercase">{orderData.patient_name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ID: <span className="font-bold text-slate-800">{orderData.patient_id}</span> • {orderData.patient_gender} • {orderData.patient_age} Y • {orderData.patient_phone || '-'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 italic">Doctor: {orderData.doctor_name || 'Self / Walk-in'}</p>
              </div>
            )}
          </div>

          {/* Quick-Pick Matching Orders / Pending Queue */}
          <div className="bg-white rounded-none border border-slate-300 p-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {searchId.trim() ? `Search Matches (${suggestions.length})` : `Pending Orders Queue (${suggestions.length})`}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Click to load</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {suggestions.map((item) => {
                const isSelected = orderData && orderData.order_id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectOrder(item.id)}
                    className={`p-2.5 border transition-all cursor-pointer text-xs ${
                      isSelected 
                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' 
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 uppercase text-xs">{item.patient_name}</p>
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 border border-purple-300">
                        {item.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                      Tests: <span className="text-slate-800">{item.test_names || 'Standard Lab Panel'}</span>
                    </p>
                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>{item.patient_gender} • {item.patient_age}Y</span>
                      <span className={`px-1.5 py-0.2 border uppercase font-bold text-[9px] ${
                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}

              {suggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-50 border border-slate-200">
                  {searchId.trim() ? `No orders found for '${searchId}'` : 'No pending orders waiting for results.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Test Results Form Panel (8 Cols) */}
        <div className={`lg:col-span-8 ${mobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
          {!orderData ? (
            <div className="bg-white rounded-none border border-slate-300 p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-sm">
              <Clock size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest">Select Patient Order</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md">
                Search a patient by Name (e.g. Priya), Phone, or Order ID in the left panel, or click any order from the Pending Queue to start entering values.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-none border border-slate-300 space-y-5 p-4 sm:p-5 shadow-sm overflow-hidden">
              {/* Patient Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-none border border-slate-700/80 flex flex-wrap justify-between items-center gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black uppercase text-white">{orderData.patient_name}</span>
                    <span className="font-mono text-purple-300 font-bold text-xs">({orderData.patient_id})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Order ID: <b className="text-white font-mono">{orderData.order_id}</b> • {orderData.patient_gender} • {orderData.patient_age} Years • Phone: {orderData.patient_phone || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 border uppercase rounded-none ${
                    orderData.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'
                  }`}>
                    STATUS: {orderData.status}
                  </span>
                </div>
              </div>

              {/* Referred Doctor Edit / Review Box */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-none p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-[11px] font-bold uppercase text-blue-900 mb-1 flex items-center gap-1.5">
                    <User size={13} className="text-blue-700" /> Referred By (Doctor Name):
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    list="enter-result-doctor-list"
                    className="w-full bg-white border border-blue-200 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 rounded-none"
                    placeholder="Type Doctor Name or 'Self' if came alone"
                  />
                  <datalist id="enter-result-doctor-list">
                    <option value="DR DHARMENDAR KUMAR" />
                    <option value="Self / Walk-in" />
                    <option value="Dr. R. K. Gupta" />
                    <option value="Dr. Anita Roy" />
                  </datalist>
                </div>
                <div className="flex gap-1.5 items-end pt-4 flex-wrap">
                  {['Self', 'DR DHARMENDAR KUMAR'].map((doc) => (
                    <button
                      key={doc === 'Self' ? '✓ Self (खुद से)' : `+ ${doc}`}
                      type="button"
                      onClick={() => setDoctorName(doc)}
                      className={`text-[10px] px-2.5 py-1 border font-bold cursor-pointer transition-colors ${
                        doctorName === doc ? 'bg-blue-700 text-white border-blue-800' : 'bg-white hover:bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {doc}
                    </button>
                  ))}
                </div>
              </div>

                            {/* Quick Add / Manage Tests Bar (Top Placement) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border-2 border-slate-300">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <Plus size={14} className="text-purple-600" /> Naya Test Add Karein:
                  </span>
                  <select
                    value={selectedCatalogTestId}
                    onChange={(e) => handleAddCatalogCheck(e.target.value)}
                    className="bg-white border-2 border-purple-600 text-xs font-bold px-3 py-1.5 outline-none cursor-pointer hover:border-purple-800 text-slate-900"
                  >
                    <option value="">+ Catalog se Test Chunein (e.g. CBC, Sugar, LFT, KFT, Thyroid)...</option>
                    {catalogTests.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category || 'General'})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomParam}
                    className="text-xs font-bold bg-white text-blue-700 hover:text-blue-900 border border-blue-400 px-2.5 py-1.5 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Add manual custom test or parameter"
                  >
                    <Plus size={13} /> + Custom Parameter
                  </button>
                </div>

                {resultsState.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllTests}
                    className="text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-300 px-2.5 py-1.5 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                    title="Clear all tests from this order"
                  >
                    <Trash2 size={13} /> Sabhi Test Hataayein (Clear All)
                  </button>
                )}
              </div>

              {/* Empty state when no test is added */}
              {resultsState.length === 0 && (
                <div className="p-8 border-2 border-dashed border-purple-300 bg-purple-50/40 text-center space-y-3">
                  <FlaskConical size={36} className="mx-auto text-purple-500" />
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Koi Test Add Nahi Hai
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Mareeza ke liye jo test karna hai, upar diye gaye catalog dropdown se select karein ya custom test jodein:
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <select
                      value={selectedCatalogTestId}
                      onChange={(e) => handleAddCatalogCheck(e.target.value)}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 outline-none cursor-pointer border border-purple-900 shadow-sm"
                    >
                      <option value="" className="text-slate-900 bg-white">+ Catalog se Test Chunein...</option>
                      {catalogTests.map(t => (
                        <option key={t.id} value={t.id} className="text-slate-900 bg-white">{t.name} ({t.category || 'General'})</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomParam}
                      className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 cursor-pointer"
                    >
                      + Custom Parameter
                    </button>
                  </div>
                </div>
              )}

              {/* Investigation Tables by Test */}
              {Object.entries(groupedResults).map(([testName, params]) => (
                <div key={testName} className="rounded-none border border-slate-300 overflow-hidden bg-white shadow-2xs">
                  <div className="p-3 border-b border-slate-300 flex justify-between items-center bg-slate-100">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{testName}</h3>
                      <p className="text-[11px] text-slate-500 uppercase mt-0.5">Parameters: {params.length} items</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestGroup(testName)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title={`Remove all ${params.length} parameters of ${testName}`}
                    >
                      <Trash2 size={12} /> Remove Test
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] border-b border-slate-300">
                        <tr>
                          <th className="px-4 py-2.5 border-r border-slate-300">Test / Parameter</th>
                          <th className="px-4 py-2.5 border-r border-slate-300 text-center w-48">Observed Value</th>
                          <th className="px-4 py-2.5 border-r border-slate-300 text-center w-28">Unit</th>
                          <th className="px-4 py-2.5 border-r border-slate-300 text-center text-slate-600 w-40">Reference Range</th>
                          <th className="px-2 py-2.5 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-800 font-medium">
                        {params.map((p) => (
                          <tr key={p.originalIndex} className="hover:bg-slate-50/80 transition-colors border-b border-slate-200">
                            <td className="px-4 py-2.5 border-r border-slate-200 font-bold text-slate-900 text-xs">
                              {p.id ? (
                                p.parameter_name
                              ) : (
                                <input
                                  type="text"
                                  value={resultsState[p.originalIndex]?.parameter_name || ''}
                                  onChange={(e) => handleCustomFieldChange(p.originalIndex, 'parameter_name', e.target.value)}
                                  placeholder="Test Name"
                                  className="w-full border border-slate-300 p-1 text-xs font-bold outline-none bg-white text-slate-900"
                                />
                              )}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center">
                              <div className="flex items-center gap-1.5 justify-center">
                                <input 
                                  type="text" 
                                  value={resultsState[p.originalIndex]?.result_value || ''}
                                  onChange={(e) => handleParamChange(p.originalIndex, e.target.value)}
                                  className="w-32 bg-white border border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 p-1.5 text-center font-bold text-slate-900 text-xs outline-none" 
                                  placeholder="0.0" 
                                />
                                {(() => {
                                  const liveCheck = getParamStatus(resultsState[p.originalIndex]?.result_value, p.normal_range);
                                  if (!liveCheck) return null;
                                  return (
                                    <span className={`text-[9.5px] px-1.5 py-0.5 border shrink-0 uppercase font-bold ${liveCheck.color}`}>
                                      {liveCheck.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-200 text-center text-slate-600 font-semibold text-xs">
                              {p.id ? (
                                p.unit || '-'
                              ) : (
                                <input
                                  type="text"
                                  value={resultsState[p.originalIndex]?.unit || ''}
                                  onChange={(e) => handleCustomFieldChange(p.originalIndex, 'unit', e.target.value)}
                                  placeholder="Unit"
                                  className="w-16 border border-slate-300 p-1 text-center font-mono text-xs outline-none"
                                />
                              )}
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-200 text-center text-slate-600 font-mono text-[11px]">
                              {p.id ? (
                                p.normal_range || 'Standard'
                              ) : (
                                <input
                                  type="text"
                                  value={resultsState[p.originalIndex]?.normal_range || ''}
                                  onChange={(e) => handleCustomFieldChange(p.originalIndex, 'normal_range', e.target.value)}
                                  placeholder="Range"
                                  className="w-24 border border-slate-300 p-1 text-center font-mono text-xs outline-none"
                                />
                              )}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveParam(p.originalIndex)}
                                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                                title="Remove this parameter"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Quick Add Extra Parameter Option */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-700">Add Test:</span>
                  <select
                    value={selectedCatalogTestId}
                    onChange={(e) => handleAddCatalogCheck(e.target.value)}
                    className="bg-white border border-slate-400 text-xs font-bold px-3 py-1.5 outline-none cursor-pointer hover:border-slate-600"
                  >
                    <option value="">+ Select Test from Catalog...</option>
                    {catalogTests.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomParam}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> + Custom Parameter
                </button>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-2.5">
                <button 
                  onClick={() => navigate('/reports')} 
                  className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-xs font-bold uppercase rounded-none transition-colors cursor-pointer text-center"
                >
                  Back to Reports
                </button>
                <button 
                  onClick={handleSaveResults} 
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Results & Complete Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
