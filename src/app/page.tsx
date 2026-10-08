import Calculator from "./components/Calculator";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container">
        <Hero />
        <Calculator />
      </main>
      <Footer />
    </>
  );
}
