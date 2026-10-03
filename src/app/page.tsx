/* eslint-disable @next/next/no-img-element -- small static SVGs; no optimization needed */
import Calculator from "./components/Calculator";
import { withBasePath } from "@/lib/paths";

export default function Home() {
  return (
    <>
      <header>
        <div className="container">
          <nav>
            <img src={withBasePath("img/fauxdoo-logo.svg")} alt="Fauxdoo" className="logo" />
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <section className="container">
          <h1 className="text-center">
            <span className="highlight">Cut costs</span> with fauxdoo
          </h1>
          <h2 className="text-center">
            Cost savings based on average price per user for each app.
          </h2>

          <Calculator />
        </section>
      </main>
      <footer>
        <div className="container">

          <p className="text-center">Copyright 2026</p>
        </div>
      </footer>
    </>
  );
}
