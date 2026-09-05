import Nav from '../features/landing/Nav';
import Hero from '../features/landing/Hero';
import StatStrip from '../features/landing/StatStrip';
import HowItWorks from '../features/landing/HowItWorks';
import Features from '../features/landing/Features';
import Cta from '../features/landing/Cta';
import Footer from '../features/landing/Footer';

const Landing = () => (
  <div className="min-h-screen scroll-smooth overflow-x-hidden bg-background">
    <Nav />
    <main>
      <Hero />
      <StatStrip />
      <HowItWorks />
      <Features />
      <Cta />
    </main>
    <Footer />
  </div>
);

export default Landing;
