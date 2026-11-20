import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import InsightsDeck from "./components/InsightsDeck";
import WhyUs from "./components/WhyUs";
import Process from "./components/Process";
import InquiryForm from "./components/InquiryForm";
import Footer from "./components/Footer";

/**
 * Single-page marketing site.
 * Sections follow the requested order and every anchor target is marked
 * with a matching id (services, why-us, process, contact).
 */
export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <InsightsDeck />
        <WhyUs />
        <Process />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
