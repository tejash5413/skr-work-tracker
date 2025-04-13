import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { postToGoogleSheetPayroll } from '../utils/googleSheetHelper';
import logo from '../assets/SKR_Logo.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
const AdminPayroll = ({ employees, userRole }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('payroll');
  const [employeesData, setEmployeesData] = useState([]);

  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    salary: '',
    department: '',
    designation: '',
    joiningDate: '',
    gender: '',
    dob: '',
    address: '',
    bankAccount: '',
    ifsc: '',
    pan: '',
    aadhar: '',
    status: 'Active'
  });
  const [formData, setFormData] = useState({
    employee: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    gender: '',
    dob: '',
    salary: '',
    month: '',
    workDays: '',
    workingDays: '',
    basic: '',
    hra: '',
    bonus: '',
    perDaySalary: '',
    total: ''
  });
  const [editIndex, setEditIndex] = useState(null);
  const fetchProfiles = async () => {
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec?type=profile");
      const data = await res.json();
      setEmployeesData(data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec?type=payroll');
      const data = await response.json();
      setPayrolls(data);
    } catch (err) {
      console.error('Error loading payrolls:', err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchProfiles();
    fetchPayrolls();
  }, []);


  if (userRole !== 'Admin') return null;
  const generateEmployeeId = () => {
    return 'EMP' + Math.floor(1000 + Math.random() * 9000);
  };
  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEmployeeSubmit = async () => {
    const id = generateEmployeeId();
    const newEmployee = { ...employeeForm, employeeId: id };

    setEmployeesData(prev => [...prev, newEmployee]);
    try {
      await fetch("https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_profile",
          ...newEmployee
        })
      });

      alert(`✅ Employee created with ID: ${id}`);
    } catch (err) {
      console.error("❌ Failed to save employee to Google Sheets", err);
      alert("❌ Failed to save employee. Please try again.");
    }


    setEmployeeForm({
      employeeId: '',
      fullName: '',
      email: '',
      phone: '',
      salary: '',
      department: '',
      designation: '',
      joiningDate: '',
      gender: '',
      dob: '',
      address: '',
      bankAccount: '',
      ifsc: '',
      pan: '',
      aadhar: '',
      status: 'Active'
    });
  };
  const formatDateToDMY = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateTotal = (salary, workingDaysInMonth, actualWorkingDays, bonus) => {
    const perDay = salary / (workingDaysInMonth || 1);
    const earned = perDay * actualWorkingDays;

    return {
      perDaySalary: perDay.toFixed(2),
      basic: (earned * 0.7).toFixed(2),
      hra: (earned * 0.3).toFixed(2),
      total: (earned + bonus).toFixed(2)
    };
  };

  const handleChange = (e) => {
    const updatedForm = { ...formData, [e.target.name]: e.target.value };

    const salary = parseFloat(updatedForm.salary) || 0;
    const workDays = parseInt(updatedForm.workDays) || 30;
    const workingDays = parseInt(updatedForm.workingDays) || 0;
    const bonus = parseFloat(updatedForm.bonus) || 0;

    const { perDaySalary, basic, hra, total } = calculateTotal(salary, workDays, workingDays, bonus);

    updatedForm.perDaySalary = perDaySalary;
    updatedForm.basic = basic;
    updatedForm.hra = hra;
    updatedForm.total = total;

    setFormData(updatedForm);
  };


  const handleSubmit = async () => {
    if (!formData.employee || !formData.month || !formData.total) {
      alert('❗ Please fill all required fields');
      return;
    }
    const formattedRecord = {
      ...formData,
      month: `${formData.month}-01`,
      action: 'add'
    };


    try {
      await postToGoogleSheetPayroll(formattedRecord);
      console.log("Submitting to Google Sheets:", formattedRecord);
      console.log("🔍 Data to send:", formattedRecord);

      setPayrolls([...payrolls, formattedRecord]);

      setFormData({
        employee: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: '',
        gender: '',
        dob: '',
        salary: '',
        month: '',
        workDays: '',
        workingDays: '',
        basic: '0',
        hra: '0',
        bonus: '0',
        perDaySalary: '',
        total: ''
      });


      const toastEl = document.getElementById('payroll-toast');
      if (toastEl) {
        const toast = new window.bootstrap.Toast(toastEl);
        toast.show();
      }

      console.log('✅ Submitted to Google Sheets');
    } catch (err) {
      console.error('❌ Failed to submit:', err);
      alert('❌ Failed to add payroll. Please try again.');
    }
  };


  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData({ ...payrolls[index] });
  };

  const handleUpdate = () => {
    const updated = { ...formData, action: 'update', rowIndex: editIndex };
    postToGoogleSheetPayroll(updated);
    const updatedList = [...payrolls];
    updatedList[editIndex] = formData;
    setPayrolls(updatedList);
    setEditIndex(null);
    setFormData({
      employee: '', email: '', phone: '', salary: '', department: '',
      designation: '',
      joiningDate: '',
      gender: '',
      dob: '', month: '', workDays: '', workingDays: '', basic: '0', hra: '0', bonus: '0', perDaySalary: '', total: ''
    });
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure?')) return;
    postToGoogleSheetPayroll({ action: 'delete', rowIndex: index });
    setPayrolls(payrolls.filter((_, i) => i !== index));
  };

  const handleEmployeeEdit = (index) => {
    setEmployeeForm(employeesData[index]);
    setEditIndex(index);
    setActiveSubTab('employee');
  };

  const handleEmployeeUpdate = () => {
    const updated = [...employeesData];
    updated[editIndex] = { ...employeeForm };
    setEmployeesData(updated);
    fetch("https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec", {
      method: 'POST',
      mode: "no-cors",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', rowIndex: editIndex, ...employeeForm })
    });

    setEmployeeForm({
      employeeId: '', fullName: '', email: '', phone: '', salary: '', department: '', designation: '', joiningDate: '', gender: '', dob: '', address: '', bankAccount: '', ifsc: '', pan: '', aadhar: '', status: 'Active'
    });
    setEditIndex(null);
  };

  const handleEmployeeDelete = (index) => {
    if (window.confirm('Are you sure to delete this employee?')) {
      const updated = employeesData.filter((_, i) => i !== index);
      setEmployeesData(updated);

      fetch("https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec", {
        method: 'POST',
        mode: "no-cors",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_profile', rowIndex: index })
      });
    }
  };
  const generatePDF = (record) => {
    const doc = new jsPDF();
    const image = new Image();
    const matched = employeesData.find(emp => emp.fullName === record.employee);
    const employeeId = matched ? matched.employeeId : 'N/A';
    image.src = logo;

    image.onload = () => {
      doc.addImage(image, 'PNG', 150, 10, 40, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text('SKR Career Guidance', 14, 20);

      doc.setFontSize(14);
      doc.text('Employee Pay Slip', 14, 30);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 36);


      autoTable(doc, {
        startY: 42,
        head: [['Field', 'Details']],
        body: [
          ['Employee', record.employee],
          ['Employee Code', employeeId || 'N/A'],

          ['Email', record.email],
          ['Phone', record.phone],
          ['DOB', record.dob ? formatDateToDMY(record.dob) : ''],
          ['CTC', record.salary],
          ['Department', record.department],
          ['Designation', record.designation],
          ['Joining Date', record.joiningDate ? formatDateToDMY(record.joiningDate) : ''],
          ['Month', new Date(record.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255], textColor: 255 },
        styles: { fontSize: 11 }
      });


      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Earning Head', 'Amount']],
        body: [
          ['Basic', record.basic],
          ['HRA ', record.hra],
          ['Bonus', record.bonus || 0],
          ['Per Day Salary ', record.perDaySalary],
          ['Work Days', record.workDays],
          ['Working Days', record.workingDays]
        ],
        theme: 'grid',
        headStyles: { fillColor: [40, 167, 69], textColor: 255 },
        styles: { fontSize: 11 }
      });


      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        body: [['Net Salary', `${record.total}`]],
        theme: 'plain',
        styles: { fontSize: 13, fontStyle: 'bold' },
        bodyStyles: { textColor: [33, 37, 41], fillColor: [248, 249, 250] }
      });

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('This is a system-generated payslip and does not require a signature.', 14, doc.internal.pageSize.height - 10);

      doc.save(`${record.employee}_Payslip.pdf`);
    };
  };
  const filteredPayrolls = payrolls.filter(p =>
    (!filterEmployee || p.employee === filterEmployee) &&
    (!filterMonth || p.month?.startsWith(filterMonth))
  );
  const convertToInputDate = (dateStr) => {
    if (!dateStr) return '';


    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;


    if (!isNaN(Date.parse(dateStr))) {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }


    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('-');
      return `${yyyy}-${mm}-${dd}`;
    }

    return '';
  };
  const convertToInputMonth = (dateStr) => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch (e) {
      return '';
    }
  };


  return (

    <div className="p-4 bg-light rounded shadow-sm animate__animated animate__fadeInUp">
      <h4 className="mb-3">💼 Admin Manager</h4>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeSubTab === 'employee' ? 'active' : ''}`} onClick={() => setActiveSubTab('employee')}>Employee Creation</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeSubTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveSubTab('profile')}>Employee Profile</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeSubTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveSubTab('payroll')}>Payroll Manager</button>
        </li>
      </ul>
      {activeSubTab === 'payroll' && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Employee</label>
              <select
                name="employee"
                className="form-select"
                value={formData.employee}
                onChange={(e) => {
                  const selected = e.target.value;
                  const emp = employeesData.find(emp => emp.fullName === selected);
                  if (emp) {
                    setFormData(prev => ({
                      ...prev,
                      employee: emp.fullName,
                      email: emp.email,
                      phone: emp.phone,
                      salary: emp.salary,
                      department: emp.department,
                      designation: emp.designation,
                      joiningDate: emp.joiningDate,
                      gender: emp.gender,
                      dob: emp.dob
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, employee: selected }));
                  }
                }}
              >
                <option value="">-- Select Employee --</option>
                {employeesData.map((emp, i) => (
                  <option key={i} value={emp.fullName}>{emp.fullName}</option>
                ))}
              </select>

            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input name="phone" type="text" className="form-control" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Department</label>
                <input type="text" className="form-control" name="department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Designation</label>
                <input type="text" className="form-control" name="designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Joining Date</label>
                <input type="date" className="form-control" name="joiningDate" value={convertToInputDate(formData.joiningDate)} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" name="dob" value={convertToInputDate(formData.dob)} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Month</label>
              <input name="month" type="month" className="form-control" value={convertToInputMonth(formData.month)} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Actual Salary</label>
              <input name="salary" type="number" className="form-control" value={formData.salary} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Work Days</label>
              <input name="workDays" type="number" className="form-control" value={formData.workDays} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Working Days</label>
              <input name="workingDays" type="number" className="form-control" value={formData.workingDays} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Basic</label>
              <input name="basic" type="number" className="form-control" value={formData.basic} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">HRA</label>
              <input name="hra" type="number" className="form-control" value={formData.hra} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Bonus</label>
              <input name="bonus" type="number" className="form-control" value={formData.bonus} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Per Day Salary</label>
              <input name="perDaySalary" type="number" className="form-control" value={formData.perDaySalary} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Net Salary</label>
              <input name="total" type="number" className="form-control" value={formData.total} readOnly />
            </div>

            <div className="col-12">
              {editIndex !== null ? (
                <button className="btn btn-primary w-100" onClick={handleUpdate}>💾 Update Record</button>
              ) : (
                <button className="btn btn-success w-100" onClick={handleSubmit}>➕ Add Payroll</button>
              )}
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">🔍 Filter by Employee</label>
              <select className="form-select" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                <option value=''>All Employees</option>
                {employeesData.map((emp, i) => (
                  <option key={i} value={emp.fullName}>{emp.fullName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">📅 Filter by Month</label>
              <input type="month" className="form-control" value={(filterMonth)} onChange={e => setFilterMonth(e.target.value)} />
            </div>
          </div>
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 fw-semibold">Loading payroll data...</p>
            </div>
          ) : (
            <table className="table table-bordered">
            </table>
          )}
          <div className="row">
            {filteredPayrolls.map((rec, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div className="card shadow-lg border-0 h-100">
                  <div className="card-header bg-gradient bg-primary text-white d-flex justify-content-between align-items-center rounded-top">
                    <h5 className="mb-0">🧑‍💼{rec.employee}</h5>
                    <span className="badge bg-light text-dark">
                      📅{new Date(rec.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {(() => {
                        const matched = employeesData.find(emp => emp.fullName === rec.employee);
                        return matched ? (
                          <li className="list-group-item">
                            <strong>Employee Code:</strong> {matched.employeeId}
                          </li>
                        ) : null;
                      })()}
                      <li className="list-group-item"><strong>Email:</strong> {rec.email}</li>
                      <li className="list-group-item"><strong>Phone:</strong> {rec.phone}</li>
                      <li className="list-group-item"><strong>DOB:</strong> {formatDateToDMY(rec.dob)}</li>
                      <li className="list-group-item"><strong>Department</strong> {rec.department}</li>
                      <li className="list-group-item"><strong>Designation :</strong> {rec.designation}</li>
                      <li className="list-group-item"><strong>Salary:</strong> ₹{rec.salary}</li>
                      <li className="list-group-item"><strong>Work Days:</strong> {rec.workDays}</li>
                      <li className="list-group-item"><strong>Working Days:</strong> {rec.workingDays}</li>
                      <li className="list-group-item"><strong>Basic:</strong> ₹{rec.basic} </li>
                      <li className="list-group-item"><strong>HRA ₹</strong>{rec.hra} </li>

                      <li className="list-group-item">    <strong>Per Day:</strong> ₹{rec.perDaySalary}
                        <span className="badge bg-success ms-2">🎁Bonus ₹{rec.bonus}</span></li>
                      <li className="list-group-item text-end fw-bold fs-5 text-primary">
                        🧾Net: ₹{rec.total}
                      </li>
                    </ul>
                  </div>
                  <div className="card-footer d-flex justify-content-between bg-light">
                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(index)}>
                      <i className="bi bi-pencil-square me-1"></i>Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(index)}>
                      <i className="bi bi-trash-fill me-1"></i>Delete
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => generatePDF(rec)}>
                      <i className="bi bi-file-earmark-pdf me-1"></i>Payslip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeSubTab === 'employee' && (
        <div className="card p-4">
          <h5 className="mb-3">🧑‍💼 Employee Creation Form</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" value={employeeForm.fullName} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={employeeForm.email} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input type="text" name="phone" value={employeeForm.phone} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Salary</label>
              <input type="text" name="salary" value={employeeForm.salary} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <select name="department" value={employeeForm.department} onChange={handleEmployeeChange} className="form-select">
                <option value="">Select</option>
                <option value="HR">HR</option>
                <option value="Tech">Tech</option>
                <option value="Sales">Sales</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input type="text" name="designation" value={employeeForm.designation} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Joining Date</label>
              <input type="date" name="joiningDate" value={convertToInputDate(employeeForm.joiningDate)} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select name="gender" value={employeeForm.gender} onChange={handleEmployeeChange} className="form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dob" value={convertToInputDate(employeeForm.dob)} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-12">
              <label className="form-label">Address</label>
              <textarea name="address" value={employeeForm.address} onChange={handleEmployeeChange} className="form-control" rows="2"></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Bank Account No</label>
              <input type="text" name="bankAccount" value={employeeForm.bankAccount} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">IFSC Code</label>
              <input type="text" name="ifsc" value={employeeForm.ifsc} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">PAN Number</label>
              <input type="text" name="pan" value={employeeForm.pan} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Aadhar Number</label>
              <input type="text" name="aadhar" value={employeeForm.aadhar} onChange={handleEmployeeChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select name="status" value={employeeForm.status} onChange={handleEmployeeChange} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div className="col-12">
              {editIndex !== null ? (
                <button className="btn btn-warning w-100" onClick={handleEmployeeUpdate}>💾 Update Employee</button>
              ) : (
                <button className="btn btn-primary w-100" onClick={handleEmployeeSubmit}>➕ Create Employee</button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'profile' && (
        <div>
          <p>Employee Profile</p>
          <div className="row">
            {employeesData.map((emp, i) => (
              <div key={i} className="col-md-6 col-lg-4 mb-4">
                <div className="card border shadow-sm h-100">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      🧑‍💼 {emp.fullName}
                    </h6>
                    <span className="badge bg-light text-dark">{emp.employeeId}</span>
                  </div>
                  <div className="card-body">
                    <p className="mb-1"><i className="bi bi-envelope-fill text-primary me-1"></i><strong>Email:</strong> {emp.email}</p>
                    <p className="mb-1"><i className="bi bi-telephone-fill text-success me-1"></i><strong>Phone:</strong> {emp.phone}</p>
                    <p className="mb-1"><i className="bi bi-building text-info me-1"></i><strong>Department:</strong> {emp.department}</p>
                    <p className="mb-1"><i className="bi bi-person-badge text-warning me-1"></i><strong>Designation:</strong> {emp.designation}</p>
                    <p className="mb-1"><i className="bi bi-cash-coin text-danger me-1"></i><strong>Salary:</strong> ₹{emp.salary}</p>
                    <p className="mb-1"><i className="bi bi-calendar-date text-secondary me-1"></i><strong>Joining Date:</strong> {formatDateToDMY(emp.joiningDate)}</p>
                    <p className="mb-1">
                      <i className="bi bi-circle-fill me-1" style={{ color: emp.status === 'Active' ? 'green' : emp.status === 'On Leave' ? 'orange' : 'gray' }}></i>
                      <strong>Status:</strong> {emp.status}
                    </p>
                  </div>
                  <div className="card-footer bg-light d-flex justify-content-between">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEmployeeEdit(i)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleEmployeeDelete(i)}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      )}
    </div>
  );
};

export default AdminPayroll;
