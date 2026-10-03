export default function DocCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a className="wf-card" href={href} target="_blank" rel="noreferrer">
      <div className="wf-card-body">
        <h3 className="wf-card-title">{title}</h3>
        <p className="wf-card-desc">{description}</p>
      </div>
      <span className="wf-card-arrow" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 17L17 7M17 7H8M17 7V16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
