import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import PromptGenerator from "../components/PromptGenerator";
import CodePreview from "../components/CodePreview";
import ExplainCanister from "../components/ExplainCanister";
import TemplatesSection from "../components/TemplatesSection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PromptGenerator />
      <CodePreview />
      <ExplainCanister />
      <TemplatesSection />
      <Footer />
    </div>
  );
};

export default Index;
