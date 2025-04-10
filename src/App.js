import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskState, setTaskState] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [progress, setProgress] = useState('Not Started');
  const [editingIndex, setEditingIndex] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const handleLogin = () => {
    if (currentUser === 'SKR' && password === 'SKR@1160') {
      setUserRole('Admin');
      setLoggedIn(true);
    } else if (currentUser === 'SKR' && password === 'SKR@1111') {
      setUserRole('Employee');
      setLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser('');
    setPassword('');
    setUserRole('');
    setActiveTab('create');
  };

  const resetForm = () => {
    setEmployeeName('');
    setTaskName('');
    setTaskState('');
    setDeadline('');
    setTaskDesc('');
    setAssignedTo('');
    setPriority('Medium');
    setProgress('Not Started');
    setEditingIndex(null);
  };

  const handleAddTask = () => {
    if (taskName.trim() === '' || assignedTo.trim() === '' || deadline.trim() === '') return;
    const newTask = {
      employeeName,
      taskName,
      taskState,
      deadline,
      taskDesc,
      assignedTo,
      priority,
      progress
    };
    if (editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = newTask;
      setTasks(updatedTasks);
    } else {
      setTasks([...tasks, newTask]);
    }
    resetForm();
  };

  const handleStatusUpdate = (index, newProgress) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].progress = newProgress;
    setTasks(updatedTasks);
  };

  const handleEditTask = (index) => {
    const task = tasks[index];
    setEmployeeName(task.employeeName);
    setTaskName(task.taskName);
    setTaskState(task.taskState);
    setDeadline(task.deadline);
    setTaskDesc(task.taskDesc);
    setAssignedTo(task.assignedTo);
    setPriority(task.priority);
    setProgress(task.progress);
    setEditingIndex(index);
    setActiveTab('create');
  };

  const handleDeleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const uniqueEmployees = [...new Set(tasks.map(task => task.assignedTo))];

  const calculateProgress = (employee) => {
    const employeeTasks = tasks.filter(task => task.assignedTo === employee);
    const total = employeeTasks.length;
    const completed = employeeTasks.filter(task => task.progress === 'Completed').length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  if (!loggedIn) {
    return (
      <div className="container mt-5">
        <div className="card p-4 shadow-sm">
          <h2 className="text-center">Login</h2>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Username"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Task Management Tool</h3>
        <div>
          <span className="me-3">Logged in as: <strong>{userRole}</strong></span>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Create Job</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'allocation' ? 'active' : ''}`} onClick={() => setActiveTab('allocation')}>Work Allocation</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>Progress Overview</button>
        </li>
      </ul>

      {activeTab === 'create' && userRole === 'Admin' && (
        <div className="card p-4 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Work Title" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="State" value={taskState} onChange={(e) => setTaskState(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="col-12">
              <textarea className="form-control" placeholder="Work Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Assign To" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={progress} onChange={(e) => setProgress(e.target.value)}>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <button className="btn btn-success mt-3" onClick={handleAddTask}>{editingIndex !== null ? 'Update Task' : 'Create Job'}</button>
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="row">
          {tasks.map((task, index) => (
            <div key={index} className="col-md-6 mb-4">
              <div className="card p-3 shadow-sm">
                <h5>{task.taskName}</h5>
                <p><strong>Employee:</strong> {task.employeeName}</p>
                <p><em>{task.taskDesc}</em></p>
                <p><strong>State:</strong> {task.taskState}</p>
                <p><strong>Assigned To:</strong> {task.assignedTo}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Deadline:</strong> {task.deadline}</p>
                <div className="mb-2">
                  <strong>Progress:</strong> {userRole === 'Employee' && task.assignedTo === currentUser ? (
                    <select className="form-select mt-1" value={task.progress} onChange={(e) => handleStatusUpdate(index, e.target.value)}>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    task.progress
                  )}
                </div>
                {userRole === 'Admin' && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEditTask(index)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(index)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="progress-tab">
          <h4>Team Progress Overview</h4>
          {uniqueEmployees.map((employee, idx) => (
            <div key={idx} className="mb-3">
              <strong>{employee}</strong>
              <div className="progress">
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${calculateProgress(employee)}%` }}>
                  {calculateProgress(employee)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
