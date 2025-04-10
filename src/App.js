import React, { useState, useEffect } from 'react';
import CreateJob from './components/CreateJob';
import WorkAllocation from './components/WorkAllocation';
import ProgressOverview from './components/ProgressOverview';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import * as bootstrap from 'bootstrap';
import logo from './assets/SKR_Logo.png';
import './App.css';
import 'animate.css';
import loginImg from './assets/login.svg';
import jobImg from './assets/job.svg';
import workImg from './assets/work.svg';


const postToGoogleSheet = async (task) => {
  await fetch("https://script.google.com/macros/s/AKfycbw-IKd4AI4c5lgRD3owOAG0oDudKq-p7R7BexSBMngH1OrfxSliJ-yhthSxm89ZhQn-/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
};


function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [taskState, setTaskState] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedDateTime, setAssignedDateTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [progress, setProgress] = useState('Not Started');
  const [editingIndex, setEditingIndex] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [darkMode, setDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const employeeAccounts = {
    UMESH: 'SKR@1111',
    MADHU: 'SKR@1111',
    RAKSHITHA: 'SKR@1111',
    ROJA: 'SKR@1111',
    BHUVANA: 'SKR@1111'
  };
  const handleLogin = () => {
    if (currentUser === 'SKR' && password === 'SKR@1160') {
      setUserRole('Admin');
      setLoggedIn(true);
    } else if (employeeAccounts[currentUser] && password === employeeAccounts[currentUser]) {
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
    setAssignedDateTime('');
    setPriority('Medium');
    setProgress('Not Started');
    setEditingIndex(null);
  };

  const handleAddTask = () => {
    if (taskName.trim() === '' || assignedTo.trim() === '' || deadline.trim() === '') return;
    const newTask = {
      id: uuidv4(),
      employeeName,
      taskName,
      taskState,
      deadline,
      taskDesc,
      assignedTo,
      priority,
      progress,
      assignedDateTime,
      completionDate: progress === 'Completed' ? new Date().toISOString().split('T')[0] : ''
    };
    if (editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = newTask;
      setTasks(updatedTasks);
    
      setToastMessage('Task updated successfully');
    } else {
      setTasks([...tasks, newTask]);
      postToGoogleSheet(newTask);
      setToastMessage('Task created successfully');
    }
    resetForm();
  };

  const handleStatusUpdate = (index, newProgress) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].progress = newProgress;
    updatedTasks[index].completionDate = newProgress === 'Completed' ? new Date().toISOString().split('T')[0] : '';
    setTasks(updatedTasks);
    setToastMessage('Progress updated');
  };

  const handleEditTask = (index) => {
    const task = tasks[index];
    setEmployeeName(task.employeeName);
    setTaskName(task.taskName);
    setTaskState(task.taskState);
    setDeadline(task.deadline);
    setTaskDesc(task.taskDesc);
    setAssignedTo(task.assignedTo);
    setAssignedDateTime(task.assignedDateTime);
    setPriority(task.priority);
    setProgress(task.progress);
    setEditingIndex(index);
    setActiveTab('create');
  };

  const handleDeleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setToastMessage('Task deleted');
  };

  const progressBadge = (status) => {
    switch (status) {
      case 'Not Started': return <span className="badge bg-secondary">Not Started</span>;
      case 'In Progress': return <span className="badge bg-warning text-dark">In Progress</span>;
      case 'Completed': return <span className="badge bg-success">Completed</span>;
      default: return status;
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const toast = new bootstrap.Toast(document.getElementById('toast-msg'));
      toast.show();
    }
  }, [toastMessage]);

  return (
    
    <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'min-vh-100'} >
      
      <div className="sticky-top bg-transparent container py-4 glass-effect rounded">
      <div className="d-flex align-items-center mb-4">
      <div className="d-flex align-items-center">
              <img src={logo} alt="SKR Logo" style={{ width: '60px', height: '60px', marginRight: '15px' }} />
              <h2 className="mb-0 fw-bold" style={{ color: '#6b400d' }}>SKR Work Progress Tracker</h2>
            </div>
          </div>
        {!loggedIn ? (
          <div className="card p-4 shadow-sm">
             <div className="text-center">
            <img src={loginImg} alt="Login Illustration" style={{ width: '200px', marginBottom: '1rem' }} />
            <p className="lead">Welcome! Please log in to continue.</p>
          </div>
            <h2 className="text-center">Login</h2>
            <input type="text" className="form-control mb-2" placeholder="Username" value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} />
            <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
          </div>
          
        ) 
        
        : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Task Management Tool</h3>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-info text-dark text-primary text-center fw-bold mb-10">{userRole}</span>
                <button className="btn btn-outline-dark btn-sm fw-bold bg-success text-white" onClick={() => setDarkMode(!darkMode)}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
                <button className="btn btn-danger btn-sm fw-bold  " onClick={handleLogout}>Logout</button>
              </div>
            </div>

            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                
              <button className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
  <img src={jobImg} alt="Create Job" style={{ width: '100px', marginRight: '6px' }} />
  Create Job
</button>
              </li>
              <li className="nav-item">
              <button className={`nav-link ${activeTab === 'allocation' ? 'active' : ''}`} onClick={() => setActiveTab('allocation')}>
        <img src={workImg} alt="Work Allocation" style={{ width: '100px', marginRight: '6px' }} />
        Work Allocation
      </button>              </li>
              <li className="nav-item">
              <button className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
        <img src={loginImg} alt="Progress Overview" style={{ width: '100px', marginRight: '6px' }} />
        Progress Overview
      </button>              </li>
            </ul>

            {activeTab === 'create' && userRole === 'Admin' && (
              
              <CreateJob
                employeeName={employeeName}
                taskName={taskName}
                taskState={taskState}
                deadline={deadline}
                taskDesc={taskDesc}
                assignedTo={assignedTo}
                priority={priority}
                progress={progress}
                assignedDateTime={assignedDateTime}
                setEmployeeName={setEmployeeName}
                setTaskName={setTaskName}
                setTaskState={setTaskState}
                setDeadline={setDeadline}
                setTaskDesc={setTaskDesc}
                setAssignedTo={setAssignedTo}
                setPriority={setPriority}
                setProgress={setProgress}
                setAssignedDateTime={setAssignedDateTime}
                handleAddTask={handleAddTask}
                editingIndex={editingIndex}
              />
            )}

            {activeTab === 'allocation' && (
              
              <WorkAllocation
              
                tasks={tasks}
                userRole={userRole}
                currentUser={currentUser}
                handleStatusUpdate={handleStatusUpdate}
                handleEditTask={handleEditTask}
                handleDeleteTask={handleDeleteTask}
                progressBadge={progressBadge}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressOverview
                tasks={tasks}
                userRole={userRole}
              />
            )}
          </>
        )}
      </div>

      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div id="toast-msg" className="toast align-items-center text-bg-primary border-0" role="alert">
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>
      <footer className="text-center mt-5 py-3 text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(6px)' }}>
        <small>© 2024 SKR Group. All Rights Reserved.</small>
      </footer>
    </div>
  );
}

export default App;
