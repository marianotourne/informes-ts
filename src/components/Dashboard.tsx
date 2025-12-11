import { useState } from "react";
import { Layout } from "./Layout";
import { Reports } from "./Reports";
import { Clients } from "./Clients";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("reports");

  const renderContent = () => {
    switch (activeSection) {
      case "reports":
        return <Reports />;
      case "clients":
        return <Clients />;
      default:
        return <Reports />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </Layout>
  );
}
