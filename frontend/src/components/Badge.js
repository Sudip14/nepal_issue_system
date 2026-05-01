function Badge({ text, bg, color }) {
  return (
    <span style={{
      background: bg, color,
      fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 20,
      whiteSpace: 'nowrap'
    }}>
      {text}
    </span>
  );
}

export default Badge;