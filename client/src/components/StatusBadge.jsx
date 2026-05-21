export default function StatusBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{estado}</span>
}
