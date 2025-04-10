
  import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ProgressOverview = ({ tasks, userRole }) => {
  if (userRole !== 'Admin') return <div className="alert alert-warning">Only Admin can view this page.</div>;

  const employees = [...new Set(tasks.map(task => task.assignedTo))];
  const progressData = employees.map(name => {
    const empTasks = tasks.filter(t => t.assignedTo === name);
    const completed = empTasks.filter(t => t.progress === 'Completed').length;
    const inProgress = empTasks.filter(t => t.progress === 'In Progress').length;
    const notStarted = empTasks.filter(t => t.progress === 'Not Started').length;
    return { name, completed, inProgress, notStarted };
  });

  const chartData = {
    labels: employees,
    datasets: [
      {
        label: 'Completed',
        data: progressData.map(d => d.completed),
        backgroundColor: 'rgba(40, 167, 69, 0.7)',
      },
      {
        label: 'In Progress',
        data: progressData.map(d => d.inProgress),
        backgroundColor: 'rgba(255, 193, 7, 0.7)',
      },
      {
        label: 'Not Started',
        data: progressData.map(d => d.notStarted),
        backgroundColor: 'rgba(108, 117, 125, 0.7)',
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Team Progress Overview</h4>

      <div className="mb-5">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>

      <h5 className="mb-3">Individual Progress Table</h5>
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Employee</th>
            <th>Completed</th>
            <th>In Progress</th>
            <th>Not Started</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((d, idx) => (
            <tr key={idx}>
              <td>{d.name}</td>
              <td className="text-success fw-bold">{d.completed}</td>
              <td className="text-warning fw-bold">{d.inProgress}</td>
              <td className="text-secondary fw-bold">{d.notStarted}</td>
              <td className="fw-bold">{d.completed + d.inProgress + d.notStarted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressOverview;
