
function DashboardCard({ icon, title, value, description }) {
  return (
    <div className="card">
      <div className="card-icon">
        <i className={icon}></i>
      </div>
      <h3>{title}</h3>
      <div className="card-value">{value}</div>
      <div className="card-desc">{description}</div>
    </div>
  );
}

export default DashboardCard;