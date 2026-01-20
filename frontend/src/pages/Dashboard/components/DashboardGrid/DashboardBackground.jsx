// Background.jsx
export default function DashboardBackground() {
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
      
    </>
  );
}
