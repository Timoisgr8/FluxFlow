// Background.jsx
export default function Background() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundColor: '#111218',
          backgroundImage: `
            linear-gradient(90deg, rgba(74, 144, 226, 0.03) 1px, transparent 1px),
            linear-gradient(0deg,  rgba(74, 144, 226, 0.03) 1px, transparent 1px),
            linear-gradient(45deg, rgba(74, 144, 226, 0.02) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(74, 144, 226, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 40px 40px, 40px 40px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(74, 144, 226, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(74, 144, 226, 0.05) 0%, transparent 50%)
          `,
        }}
      />
    </>
  );
}
