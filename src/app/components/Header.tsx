/* eslint-disable @next/next/no-img-element -- small static SVG; no optimization needed */
import { withBasePath } from "@/lib/paths";

export default function Header() {
  return (
    <header>
      <div className="container">
        <nav role="navigation" className="nav-menu-wrapper w-nav-menu">
          <div className="nav-menu-flex">
            <a href="https://fauxdoo-software.webflow.io" className="brand w-nav-brand">
              <img
                src={withBasePath("img/fauxdoo-logo.svg")}
                className="logo"
                alt="Fauxdoo"
                width="150"
              />
            </a>

            <ul role="list" className="nav-menu w-list-unstyled">
              <li>
                <a href="https://fauxdoo-software.webflow.io/#process" className="nav-link">
                  Process
                </a>
              </li>
              <li>
                <a href="https://fauxdoo-software.webflow.io/#about" className="nav-link">
                  About
                </a>
              </li>
              <li>
                <a href="https://fauxdoo-software.webflow.io/#pricing" className="nav-link">
                  Pricing
                </a>
              </li>
            </ul>

            <div className="navbar-button-wrapper">
              <a href="/savings-calculator" className="button cc-small w-button">
                Savings Calculator
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
