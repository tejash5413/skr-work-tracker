import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec';

const Accounts = ({ userRole }) => {
    const [form, setForm] = useState({ date: '', description: '', category: '', amount: '' });
    const [searchText, setSearchText] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('');
    const [monthlyBudget, setMonthlyBudget] = useState(0);
    const [budgetHistory, setBudgetHistory] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        fetchAccounts();
        fetchBudgetHistory();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=accounts`);
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error("❌ Failed to fetch account records", err);
            alert("❌ Error loading accounts");
        }
    };
    function formatDateToDMY(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }
    const fetchBudgetHistory = async () => {
        try {
            const res = await fetch("https://script.google.com/macros/s/AKfycbxlm8E94QZ0o74WlK3elUARn9MVUvhiApWw2y-u_K_i5_LpI611u6rlWwt6xx_1Q-NZ/exec?type=budget");
            const data = await res.json();
            setBudgetHistory(data);

            const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            const current = data.find(b => b.month === currentMonth);
            if (current) setMonthlyBudget(Number(current.amount));
        } catch (err) {
            console.error("❌ Failed to fetch budget history", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        if (!form.date || !form.description || !form.category || !form.amount) {
            alert('All fields required');
            return;
        }

        const payload = {
            action: editIndex === null ? 'add_account' : 'update_account',
            ...form,
            rowIndex: editIndex
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: "no-cors",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert(`✅ Record ${editIndex === null ? 'added' : 'updated'} successfully`);
            fetchAccounts();
            setForm({ date: '', description: '', category: '', amount: '' });
            setEditIndex(null);
        } catch (err) {
            console.error("❌ Submission error", err);
        }
    };

    const handleEdit = (index) => {
        setForm(accounts[index]);
        setEditIndex(index);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: "no-cors",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_account', rowIndex: index })
            });
            alert("🗑 Deleted successfully");
            fetchAccounts();
        } catch (err) {
            console.error("❌ Delete error", err);
        }
    };

    const handleBudgetSave = async () => {
        const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const amount = parseFloat(monthlyBudgetInput);

        if (isNaN(amount) || amount <= 0) return alert("Enter valid monthly budget");

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: "no-cors",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_budget',
                    month,
                    amount
                })
            });
            alert("✅ Budget saved for " + month);
            fetchBudgetHistory();
        } catch (err) {
            alert("❌ Failed to save budget");
        }
    };

    const calculateTotal = () => {
        return accounts
            .filter(exp => {
                const date = new Date(exp.date);
                return (!fromDate || new Date(fromDate) <= date) && (!toDate || date <= new Date(toDate));
            })
            .filter(exp => exp.description.toLowerCase().includes(searchText.toLowerCase()) || exp.category.toLowerCase().includes(searchText.toLowerCase()))
            .reduce((total, exp) => total + parseFloat(exp.amount || 0), 0);
    };

    const getBadgeColor = (cat) => {
        switch (cat) {
            case 'Salary': return 'bg-primary';
            case 'Infrastructure': return 'bg-success';
            case 'Utilities': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    };

    const filteredExpenses = accounts.filter(exp => {
        const date = new Date(exp.date);
        return (!fromDate || new Date(fromDate) <= date) &&
            (!toDate || date <= new Date(toDate)) &&
            (exp.description.toLowerCase().includes(searchText.toLowerCase()) || exp.category.toLowerCase().includes(searchText.toLowerCase()));
    });

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Expense History', 14, 22);
        doc.setFontSize(12);

        const tableColumn = ['Date', 'Description', 'Category', 'Amount'];
        const tableRows = filteredExpenses.map(exp => [
            exp.date, exp.description, exp.category, `₹ ${exp.amount}`
        ]);

        doc.autoTable({ startY: 30, head: [tableColumn], body: tableRows });
        doc.save('Expense_History.pdf');
    };

    if (userRole !== 'Admin') return null;

    return (

        <div className="container py-4">
            <h4 className=" fw-bold mb-4">💰 Company Expenditure Tracker</h4>

            <div className="row mb-3">
                <div className="col-md-10">
                    <label className="form-label">Set Monthly Budget</label>
                    <input type="number" className="form-control" value={monthlyBudgetInput} onChange={e => setMonthlyBudgetInput(e.target.value)} />
                </div>
                <div className="col-md-2 d-grid align-items-end">
                    <button className="btn btn-danger" onClick={handleBudgetSave}>💾 Save Budget</button>
                </div>
            </div>

            <div className="row g-3 mb-3">
                <label className="form-label">Date</label>

                <div className="col-md-3">

                    <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} placeholder="Date" />
                </div>
                <div className="col-md-3">
                    <input type="text" name="description" className="form-control" value={form.description} onChange={handleChange} placeholder="Description" />
                </div>
                <div className="col-md-3">
                    <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                        <option value="">Select Category</option>
                        <option value="Salary">Salary</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <input type="number" name="amount" className="form-control" value={form.amount} onChange={handleChange} placeholder="Amount" />
                </div>
                <div className="col-md-1 d-grid">
                    <button className="btn btn-success" onClick={handleAdd}>{editIndex !== null ? 'Update' : 'Add'}</button>
                </div>
            </div>

            <div className="row mb-3">
                <label className="form-label">From - To </label>
                <div className="col-md-6">
                    <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} placeholder="From" />
                </div>
                <div className="col-md-6">
                    <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} placeholder="To" />
                </div>
            </div>

            <input type="text" className="form-control mb-3" placeholder="🔍 Search..." value={searchText} onChange={e => setSearchText(e.target.value)} />

            <table className="table table-bordered text-center">
                <thead className="table-dark">
                    <tr>
                        <th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExpenses.map((exp, i) => (
                        <tr key={i}>
                            <td>{exp.date}</td>
                            <td>{exp.description}</td>
                            <td><span className={`badge ${getBadgeColor(exp.category)}`}>{exp.category}</span></td>
                            <td>₹ {exp.amount}</td>
                            <td>
                                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(i)}>✏️</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="alert alert-info mt-3 fw-bold">Total Expenditure: ₹ {calculateTotal()}</div>
            <div className="alert alert-warning fw-bold">Monthly Budget: ₹  {budgetHistory.map((b, i) => (b.amount))}</div>
            <div className={`alert fw-bold ${calculateTotal() > monthlyBudget ? 'alert-danger' : 'alert-success'}`}>Balance: ₹ {budgetHistory.map((b, i) => (b.amount)) - calculateTotal()}</div>

            <button className="btn btn-outline-dark d-block mt-4" onClick={handleExportPDF}>📄 Export PDF</button>

            {budgetHistory.length > 0 && (
                <div className="mt-4">
                    <h6 className="fw-bold">📘 Budget History</h6>
                    <ul className="list-group">
                        {budgetHistory.map((b, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between">
                                <span>{formatDateToDMY(b.month)}</span>
                                <span>₹ {b.amount}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Accounts;
