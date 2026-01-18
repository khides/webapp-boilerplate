import { useState } from "react";
import { HomePage } from "@/pages/HomePage";
import { ItemListPage } from "@/pages/ItemListPage";
import { Header } from "@/components/layout/Header";

type Page = "home" | "items";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "items":
        return <ItemListPage />;
      case "home":
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
