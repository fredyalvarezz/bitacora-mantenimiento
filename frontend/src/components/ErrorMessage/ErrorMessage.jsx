import "./ErrorMessage.css";

const ErrorMessage = ({ mensaje }) => {
  if (!mensaje) return null;
  return <div className="error-message">{mensaje}</div>;
};

export default ErrorMessage;
