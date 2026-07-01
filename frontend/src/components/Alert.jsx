export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  const colors = {
    success: '#1a7f37',
    error: '#d1242f',
    info: '#0969da',
  };
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: '#fff',
        border: `1px solid ${colors[type]}`,
        color: colors[type],
        marginBottom: 16,
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}
