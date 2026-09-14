import "./StatCard.css";

const StatCard = ({ titulo, valor, tipo = "default" }) => {
  return (
    <div className={`stat-card stat-card--${tipo}`}>
      <p className="stat-card__value">{valor}</p>
      <p className="stat-card__label">{titulo}</p>
    </div>
  );
};

export default StatCard;
