export default function Avatar({ name, size = 28 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div
      className={`avatar av-${name}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials}
    </div>
  )
}
