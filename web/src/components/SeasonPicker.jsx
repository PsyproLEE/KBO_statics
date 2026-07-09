/** 시즌 선택 드롭다운 (useSeason 훅과 함께 사용) */
export default function SeasonPicker({ year, years, onChange, loading }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <select
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          borderRadius: 8,
          padding: '7px 10px',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'inherit',
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y} 시즌
          </option>
        ))}
      </select>
      {loading && (
        <span style={{ color: 'var(--text-3)', fontSize: 12.5 }}>불러오는 중…</span>
      )}
    </span>
  )
}
