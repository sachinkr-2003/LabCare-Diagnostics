import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Receipt, UserCheck, ArrowRight, Check, X, FlaskConical, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { patientApi, testApi, orderApi, settingsApi, resultApi, reportApi } from '../services/api';
import DiagnosticReportModal from '../components/DiagnosticReportModal';
import BillingReceiptModal from '../components/BillingReceiptModal';

export default function CreateOrder() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [testOptions, setTestOptions] = useState([]);
  const [labSettings, setLabSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Completed Order Receipt State (for immediate printing)
  const [createdOrderReceipt, setCreatedOrderReceipt] = useState(null);
  const [finalReportData, setFinalReportData] = useState(null);

  // Patient Selection / Details
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    doctor: 'Self / Walk-in'
  });

  // Test Search & Selection
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [showTestDropdown, setShowTestDropdown] = useState(false);

  // Selected Tests Line Items
  const [selectedTests, setSelectedTests] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [patientsData, testsData, labData] = await Promise.all([
          patientApi.getAll(),
          testApi.getAll(),
          settingsApi.get().catch(() => null)
        ]);
        setPatients(patientsData || []);
        setTestOptions(testsData || []);
        if (labData) setLabSettings(labData);

        // Pre-select first test if available
        if (testsData && testsData.length > 0) {
          setSelectedTests([
            { id: Date.now(), testId: testsData[0].id, name: testsData[0].name, price: testsData[0].price }
          ]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTestDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePatientSelect = (p) => {
    setSelectedPatientId(p.id);
    setPatientDetails({
      name: p.name,
      phone: p.phone,
      age: p.age,
      gender: p.gender,
      doctor: p.doctor_name || p.doctor || patientDetails.doctor || 'DR DHARMENDAR KUMAR',
      address: p.address || ''
    });
    setPatientSearch(`${p.name} (${p.id})`);
  };

  const addTestLine = () => {
    setSelectedTests([...selectedTests, { id: Date.now(), testId: '', name: '', price: 0 }]);
  };

  const updateTestLine = (id, selectedVal) => {
    const testInfo = testOptions.find(t => t.id === selectedVal);
    if (!testInfo) return;

    setSelectedTests(selectedTests.map(test => 
      test.id === id ? { ...test, testId: testInfo.id, name: testInfo.name, price: testInfo.price } : test
    ));
  };

  const addTestFromSearch = (test) => {
    // Check if test is already added
    const alreadyExists = selectedTests.some(t => t.testId === test.id);
    if (alreadyExists) {
      Swal.fire({
        icon: 'info',
        title: 'Already Added',
        text: `"${test.name}" is already in the assigned tests list!`,
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-none' }
      });
      setShowTestDropdown(false);
      setTestSearchTerm('');
      return;
    }

    // If there is an empty line, replace it; otherwise add new
    const emptyIndex = selectedTests.findIndex(t => !t.testId);
    if (emptyIndex !== -1) {
      const updated = [...selectedTests];
      updated[emptyIndex] = {
        ...updated[emptyIndex],
        testId: test.id,
        name: test.name,
        price: test.price
      };
      setSelectedTests(updated);
    } else {
      setSelectedTests([
        ...selectedTests,
        { id: Date.now(), testId: test.id, name: test.name, price: test.price }
      ]);
    }

    setShowTestDropdown(false);
    setTestSearchTerm('');
  };

  const removeTestLine = (id) => {
    setSelectedTests(selectedTests.filter(test => test.id !== id));
  };

  const subTotal = selectedTests.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const netPayable = Math.max(0, subTotal - Number(discountAmount || 0));

  const handleGenerateBill = async () => {
    if (!selectedPatientId && (!patientDetails.name || !patientDetails.phone || !patientDetails.age)) {
      Swal.fire({
        icon: 'error',
        title: 'Patient Required',
        text: 'Please select an existing patient or provide patient name, phone, and age!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    const validTestIds = selectedTests.map(t => t.testId).filter(Boolean);
    if (validTestIds.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Tests Selected',
        text: 'Please search and add at least one lab test to create an order!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    try {
      setSubmitting(true);
      let patientIdToUse = selectedPatientId;

      // If patient is not existing, create patient first
      if (!patientIdToUse) {
        const createdPatient = await patientApi.create({
          name: patientDetails.name,
          phone: patientDetails.phone,
          age: Number(patientDetails.age),
          gender: patientDetails.gender,
          doctor_name: patientDetails.doctor || 'Self / Walk-in'
        });
        patientIdToUse = createdPatient.id;
      }

      // Create Order
      const createdOrder = await orderApi.create({
        patient_id: patientIdToUse,
        doctor_name: (patientDetails.doctor && patientDetails.doctor.trim()) ? patientDetails.doctor.trim() : 'Self',
        test_ids: validTestIds,
        discount: Number(discountAmount || 0),
        payment_status: 'Paid'
      });

      // Open Receipt Slip Modal Immediately for Printing
      setCreatedOrderReceipt(createdOrder);

      // Reset form
      setSelectedPatientId('');
      setPatientSearch('');
      setPatientDetails({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        doctor: 'Self'
      });
      setDiscountAmount(0);
      setRemarks('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Order',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click: Create Order, Save Results & Directly View Printable Diagnostic Report
  const handleSaveOrderAndReport = async () => {
    if (!selectedPatientId && (!patientDetails.name || !patientDetails.phone || !patientDetails.age)) {
      Swal.fire({
        icon: 'error',
        title: 'Patient Required',
        text: 'Please select an existing patient or provide patient name, phone, and age!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    const validTests = selectedTests.filter(t => t.testId);
    if (validTests.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Tests Selected',
        text: 'Please search and add at least one lab test/check!',
        customClass: { popup: 'rounded-none' }
      });
      return;
    }

    try {
      setSubmitting(true);
      let patientIdToUse = selectedPatientId;

      if (!patientIdToUse) {
        const createdPatient = await patientApi.create({
          name: patientDetails.name,
          phone: patientDetails.phone,
          age: Number(patientDetails.age),
          gender: patientDetails.gender,
          doctor_name: patientDetails.doctor || 'Self'
        });
        patientIdToUse = createdPatient.id;
      }

      const docName = (patientDetails.doctor && patientDetails.doctor.trim()) ? patientDetails.doctor.trim() : 'Self';

      // 1. Create order in DB
      const createdOrder = await orderApi.create({
        patient_id: patientIdToUse,
        doctor_name: docName,
        test_ids: validTests.map(t => t.testId),
        discount: Number(discountAmount || 0),
        payment_status: 'Paid'
      });

      // 2. If results were typed, save them to order_results
      const resultsToSave = (createdOrder.results || []).map(r => {
        const matchingSelected = validTests.find(t => t.testId === r.test_id);
        const typedVal = matchingSelected?.observedValue;
        return {
          ...r,
          result_value: typedVal !== undefined && typedVal !== '' ? typedVal : r.result_value
        };
      });

      await resultApi.save(createdOrder.id, resultsToSave, docName);

      // 3. Load completed diagnostic report for immediate preview & print
      const fullReport = await reportApi.getById(createdOrder.id);
      setFinalReportData(fullReport);

      // Reset form
      setSelectedPatientId('');
      setPatientSearch('');
      setPatientDetails({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        doctor: 'Self'
      });
      setSelectedTests([]);
      setDiscountAmount(0);
      setRemarks('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message,
        customClass: { popup: 'rounded-none' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatientList = patientSearch.trim() === ''
    ? []
    : patients.filter(p => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
        p.phone.includes(patientSearch) ||
        p.id.toLowerCase().includes(patientSearch.toLowerCase())
      );

  // Filter test options for search bar
  const filteredSearchTests = testOptions.filter(t => 
    t.name.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(testSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-400 pb-3">
        <div>
          <h2 className="text-[20px] font-bold text-slate-800 uppercase tracking-tight">Create Order (Billing)</h2>
          <p className="text-slate-600 text-[11px] uppercase tracking-wider mt-0.5">Register patient order and add tests with fast search</p>
        </div>
        <button 
          onClick={handleGenerateBill} 
          disabled={submitting}
          className="bg-emerald-600 text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider border border-emerald-800 rounded-none hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Receipt size={14} /> {submitting ? 'Generating...' : 'Generate Bill'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Patient Details */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white border border-slate-400 p-4">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-3">
                Patient Information
              </h3>
              <div className="space-y-3 relative">
                 <div className="flex bg-slate-50 border border-slate-400">
                    <input 
                      type="text" 
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search Name, Phone or PID..." 
                      className="w-full outline-none px-3 py-1.5 text-[12px] bg-transparent" 
                    /> 

                    <button className="bg-slate-200 px-3 border-l border-slate-400 text-slate-600 hover:text-slate-800">
                      <Search size={14}/>
                    </button>
                 </div>

                 {/* Dropdown Suggestions */}
                 {filteredPatientList.length > 0 && (
                   <div className="absolute left-0 right-0 top-12 z-20 bg-white border border-slate-400 max-h-48 overflow-y-auto shadow-md">
                     {filteredPatientList.map(p => (
                       <div 
                         key={p.id}
                         onClick={() => handlePatientSelect(p)}
                         className="px-3 py-2 border-b border-slate-200 hover:bg-blue-50 cursor-pointer text-xs"
                       >
                         <p className="font-bold text-slate-800">{p.name} <span className="text-blue-600">({p.id})</span></p>
                         <p className="text-[10px] text-slate-500">Phone: {p.phone} | Age: {p.age} | {p.gender}</p>
                       </div>
                     ))}
                   </div>
                 )}

                 {selectedPatientId && (
                   <div className="p-2 bg-blue-50 border border-blue-200 text-xs flex justify-between items-center">
                     <span className="font-bold text-blue-800 flex items-center gap-1">
                       <UserCheck size={14} /> Selected: {selectedPatientId}
                     </span>
                     <button 
                       onClick={() => { setSelectedPatientId(''); setPatientSearch(''); }}
                       className="text-[10px] uppercase font-bold text-red-600 hover:underline"
                     >
                       Change
                     </button>
                   </div>
                 )}

                 <div className="pt-2 border-t border-slate-300 border-dashed">
                   <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Full Name</label>
                   <input 
                     type="text" 
                     value={patientDetails.name}
                     onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                     className="w-full border border-slate-400 p-1.5 text-[12px] outline-none" 
                     placeholder="Enter patient name" 
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                   <input 
                     type="text" 
                     value={patientDetails.phone}
                     onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                     className="w-full border border-slate-400 p-1.5 text-[12px] outline-none" 
                     placeholder="Enter phone number" 
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Age</label>
                      <input 
                        type="number" 
                        value={patientDetails.age}
                        onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                        className="w-full border border-slate-400 p-1.5 text-[12px] outline-none" 
                        placeholder="Years" 
                       />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Gender</label>
                      <select 
                        value={patientDetails.gender}
                        onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value })}
                        className="w-full border border-slate-400 p-1.5 text-[12px] outline-none bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                 </div>

                 <div>
                   <label className="block text-[11px] font-extrabold uppercase text-blue-900 mb-1 flex justify-between items-center">
                    <span>Referred By (Doctor Name)</span>
                    <span className="text-[9.5px] font-normal text-slate-500 lowercase">(optional - defaults to Self)</span>
                  </label>
                   <input 
                     type="text" 
                     value={patientDetails.doctor}
                     onChange={(e) => setPatientDetails({ ...patientDetails, doctor: e.target.value })}
                     className="w-full border border-slate-400 p-1.5 text-[12px] outline-none" 
                     placeholder="Type Doctor Name or 'Self' if came alone"
                      list="order-doctor-list" />

                    <datalist id="order-doctor-list">
                      <option value="DR DHARMENDAR KUMAR" />
                      <option value="Self / Walk-in" />
                      <option value="Dr. R. K. Gupta" />
                      <option value="Dr. Anita Roy" />
                    </datalist>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {['Self', 'DR DHARMENDAR KUMAR'].map((doc) => (
                        <button
                          key={doc}
                          type="button"
                          onClick={() => setPatientDetails({ ...patientDetails, doctor: doc })}
                          className={`text-[9.5px] px-2 py-0.5 border font-bold cursor-pointer transition-colors ${
                            patientDetails.doctor === doc ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {doc === 'Self' ? '✓ Self (खुद से)' : `+ ${doc}`}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Multiple Tests Selection */}
        <div className="lg:col-span-8 flex flex-col gap-4">
           <div className="bg-white border border-slate-400 flex-1 flex flex-col">
              
              {/* Top Bar with Add More Button */}
              <div className="p-3 border-b border-slate-400 bg-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <FlaskConical size={16} className="text-blue-600" />
                   <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-800">
                     Assigned Tests ({selectedTests.filter(t => t.testId).length})
                   </h3>
                 </div>
                 <button 
                   onClick={addTestLine} 
                   className="bg-blue-600 text-white px-3 py-1.5 text-[11px] font-bold uppercase border border-blue-800 hover:bg-blue-700 flex items-center gap-1 transition-colors"
                 >
                    <Plus size={13} /> Add Blank Line
                 </button>
              </div>

              {/* SEARCH TEST BY NAME TO ADD (New Feature) */}
              <div ref={dropdownRef} className="p-3 bg-slate-50 border-b border-slate-300 relative">
                 <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                   <span>🔍 Search Test by Name to Add:</span>
                   <span className="text-[10px] text-slate-500 font-normal">Click any result to add instantly</span>
                 </label>
                 
                 <div className="flex items-center border-2 border-blue-600 bg-white">
                   <div className="px-3 py-2 bg-blue-50 border-r border-blue-200 text-blue-700">
                     <Search size={16} />
                   </div>
                   <input 
                     type="text"
                     value={testSearchTerm}
                     onChange={(e) => {
                       setTestSearchTerm(e.target.value);
                       setShowTestDropdown(true);
                     }}
                     onFocus={() => setShowTestDropdown(true)}
                     placeholder="Type test name (e.g. CBC, Liver, Sugar, KFT, Thyroid, Lipid)..."
                     className="w-full px-3 py-2 text-[13px] outline-none font-medium placeholder:text-slate-400"
                   />
                   {testSearchTerm && (
                     <button 
                       onClick={() => setTestSearchTerm('')} 
                       className="p-1 mr-2 text-slate-400 hover:text-slate-700"
                       title="Clear search"
                     >
                       <X size={16} />
                     </button>
                   )}
                 </div>

                 {/* Dropdown Results */}
                 {showTestDropdown && (
                   <div className="absolute left-3 right-3 top-[68px] z-30 bg-white border-2 border-slate-800 shadow-2xl max-h-64 overflow-y-auto">
                     <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600 flex justify-between">
                       <span>Matching Tests in Catalog ({filteredSearchTests.length})</span>
                       <span>Click test to add</span>
                     </div>
                     {filteredSearchTests.length > 0 ? (
                       filteredSearchTests.map(test => {
                         const isAlreadySelected = selectedTests.some(t => t.testId === test.id);
                         return (
                           <div 
                             key={test.id}
                             onClick={() => addTestFromSearch(test)}
                             className="p-2.5 border-b border-slate-200 last:border-b-0 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors group"
                           >
                             <div>
                               <p className="font-bold text-slate-900 text-[13px] group-hover:text-blue-700">
                                 {test.name}
                               </p>
                               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                                 Code: <span className="font-mono text-purple-700 font-bold">{test.id}</span> • Category: {test.category} • {test.param_counts || 1} Parameters
                               </p>
                             </div>
                             <div className="flex items-center gap-3">
                               <span className="font-bold text-slate-900 text-[13px]">
                                 ₹{Number(test.price).toFixed(2)}
                               </span>
                               {isAlreadySelected ? (
                                 <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 uppercase border border-slate-300">
                                   ✓ Added
                                 </span>
                               ) : (
                                 <button 
                                   type="button"
                                   className="bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 uppercase rounded-none border border-emerald-800 flex items-center gap-1"
                                 >
                                   <Plus size={12} /> Add
                                 </button>
                               )}
                             </div>
                           </div>
                         );
                       })
                     ) : (
                       <div className="p-4 text-center text-slate-500 text-xs uppercase font-medium">
                         No test found matching "{testSearchTerm}".
                       </div>
                     )}
                   </div>
                 )}
              </div>

              {/* Tests Table */}
              <div className="flex-1 overflow-x-auto p-4 bg-white min-h-[200px]">
                 <table className="w-full text-[12px] text-left border-collapse bg-white">
                    <thead className="bg-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-2 border border-slate-400 w-12 text-center">S.No</th>
                        <th className="px-3 py-2 border border-slate-400">Selected Test Name</th>
                        <th className="px-3 py-2 border border-slate-400 w-32 text-right">Fixed Rate (₹)</th>
                        <th className="px-3 py-2 border border-slate-400 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTests.map((t, index) => (
                        <tr key={t.id} className="hover:bg-blue-50/50">
                          <td className="px-3 py-2 border border-slate-400 text-center font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2 border border-slate-400">
                             <div className="font-black text-slate-900 text-xs uppercase">{t.name || 'Select Test'}</div>
                             {t.category && <span className="text-[10px] text-slate-500 uppercase font-semibold">{t.category}</span>}
                          </td>
                          <td className="p-1 border border-slate-400 bg-emerald-50/30 text-center">
                             <div className="flex items-center gap-1 px-1">
                               <input 
                                 type="text" 
                                 value={t.observedValue || ''} 
                                 onChange={(e) => updateTestResult(t.id, e.target.value)}
                                 placeholder="मान डालें (e.g. 120)" 
                                 className="flex-1 bg-white border-2 border-emerald-500 focus:border-emerald-700 p-1.5 text-center font-black text-slate-900 text-xs outline-none" 
                               />
                               {t.unit && <span className="text-[10px] font-bold text-slate-600 shrink-0 font-mono">{t.unit}</span>}
                             </div>
                          </td>
                          <td className="px-2 py-2 border border-slate-400 text-center text-slate-600 font-mono text-[10.5px]">
                             {t.normalRange || (t.parameters && t.parameters[0]?.normal_text) || 'Standard'}
                          </td>
                          <td className="px-3 py-2 border border-slate-400 text-right font-black text-slate-800 bg-slate-50 font-mono">
                            ₹{t.price > 0 ? Number(t.price).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-2 py-2 border border-slate-400 text-center">
                            <button onClick={() => removeTestLine(t.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Remove Test">
                               <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {selectedTests.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-500 text-[12px] uppercase tracking-wider border border-slate-400 bg-slate-50">
                            No tests assigned yet. Search above by name to add tests to this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
              </div>

              {/* Billing Summary Footer */}
              <div className="p-4 border-t border-slate-400 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Remarks / Notes</p>
                   <input 
                     type="text" 
                     value={remarks}
                     onChange={(e) => setRemarks(e.target.value)}
                     className="w-full border border-slate-400 p-2 text-[12px] outline-none" 
                     placeholder="Any specific instructions..." 
                   />
                 </div>
                 <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between uppercase font-bold text-slate-600">
                       <span>Total Amount</span>
                       <span className="text-slate-800 font-bold">₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center uppercase font-bold text-slate-600">
                       <span>Discount (₹)</span>
                       <input 
                         type="number" 
                         value={discountAmount || ''} 
                         onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : 0)}
                         className="w-24 border border-slate-400 px-2 py-1 text-right outline-none text-slate-800 focus:bg-amber-50" 
                         placeholder="0"
                        />
                     </div>
                    <div className="flex justify-between items-center uppercase font-black text-[15px] text-slate-800 pt-3 border-t border-slate-400 mt-2">
                       <span>Net Payable</span>
                       <span className="text-emerald-700 font-bold bg-emerald-50 px-2 border border-emerald-300">₹{netPayable.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Immediate Full Diagnostic Report Modal */}
      {finalReportData && (
        <DiagnosticReportModal 
          report={finalReportData} 
          lab={labSettings} 
          onClose={() => setFinalReportData(null)} 
        />
      )}

      {/* Immediate Bill / Receipt Print Slip Modal */}
      {createdOrderReceipt && (
        <BillingReceiptModal 
          order={createdOrderReceipt} 
          lab={labSettings} 
          onClose={() => setCreatedOrderReceipt(null)} 
          onEnterResults={() => navigate(`/enter-result?orderId=${createdOrderReceipt.id}`)} 
        />
      )}
    </div>
  );
}
