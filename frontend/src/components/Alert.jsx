export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  const classNames = {
    success: 'auth-alert auth-alert-success',
    error: 'auth-alert auth-alert-error',
    info: 'auth-alert auth-alert-info',
  };
  return (
    <div
      className={classNames[type] || classNames.info}
    >
      {message}
    </div>
  );
}
