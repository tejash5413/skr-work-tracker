import React from 'react';

const CreateJob = ({
  employeeName,
  taskName,
  taskState,
  deadline,
  taskDesc,
  assignedTo,
  priority,
  progress,
  assignedDateTime,
  setAssignedDateTime,
  handleAddTask,

  setEmployeeName,
  setTaskName,
  setTaskState,
  setDeadline,
  setTaskDesc,
  setAssignedTo,
  setPriority,
  setProgress,
  editingIndex
}) => {
  return (
    <div className="card p-4 shadow-sm card animate__animated animate__fadeInUp">
      <h5 className="mb-3">Create a Job</h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Job Title</label>
          <input type="text" className="form-control" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Work Title</label>
          <input type="text" className="form-control" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">State</label>
          <input type="text" className="form-control" value={taskState} onChange={(e) => setTaskState(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Deadline</label>
          <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Work Description</label>
          <textarea className="form-control" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Assign To</label>
          <select className="form-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
  <option value="">-- Select Employee --</option>
  <option value="UMESH">UMESH</option>
  <option value="MADHU">MADHU</option>
  <option value="RAKSHITHA">RAKSHITHA</option>
  <option value="ROJA">ROJA</option>
  <option value="BHUVANA">BHUVANA</option>
</select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Assigned Date & Time</label>
          <input type="datetime-local" className="form-control" value={assignedDateTime} onChange={(e) => setAssignedDateTime(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Priority</label>
          <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Progress</label>
          <select className="form-select" value={progress} onChange={(e) => setProgress(e.target.value)}>
            <option value="Not Started">🕒 Not Started</option>
            <option value="In Progress">🔧 In Progress</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>
      </div>
      <button className="btn btn-success mt-3" onClick={handleAddTask}>{editingIndex !== null ? 'Update Task' : 'Create Job'}</button>
    </div>
  );
};

export default CreateJob;
