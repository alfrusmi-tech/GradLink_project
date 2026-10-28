// Small inline error message shown under a form field.
const FieldError = ({ id, message }) => {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
};

export default FieldError;