/* eslint-disable @next/next/no-img-element -- small static SVGs; no optimization needed */
import { withBasePath } from "@/lib/paths";
import type { Tool } from "@/lib/quote";

// Logos live in public/img. A tool added in the database without a logo
// here falls back to showing its name.
const LOGOS: Record<string, string> = {
  tasks: "img/taskana.svg",
  books: "img/fastbooks.svg",
  shop: "img/buyify.svg",
  chat: "img/slick.svg",
  cms: "img/siteflo.svg",
  crm: "img/dealforce.svg",
};

interface AppPickerProps {
  status: "loading" | "error" | "ready";
  tools: Tool[];
  selected: string[];
  onToggle: (slug: string) => void;
}

export default function AppPicker({ status, tools, selected, onToggle }: AppPickerProps) {
  return (
    <>
      <h3 id="apps-heading">1. Which apps do you use?</h3>
      <div className="apps-container" role="group" aria-labelledby="apps-heading">
        {status === "loading" && <p>Loading apps…</p>}
        {status === "error" && (
          <p role="alert">Couldn&apos;t load pricing. Refresh the page to try again.</p>
        )}
        {tools.map((tool) => {
          const checked = selected.includes(tool.slug);
          const logo = LOGOS[tool.slug];
          return (
            <div className="app-option" key={tool.slug}>
              <input
                type="checkbox"
                id={`app-${tool.slug}`}
                className="app-card-check"
                name="apps"
                value={tool.slug}
                checked={checked}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                className="app-card"
                aria-pressed={checked}
                onClick={() => onToggle(tool.slug)}
              >
                <span className="app-card-logo">
                  {logo ? <img src={withBasePath(logo)} alt={tool.name} /> : tool.name}
                </span>
                <span className="app-category">{tool.category}</span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
