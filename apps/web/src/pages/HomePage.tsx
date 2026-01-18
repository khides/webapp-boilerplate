import { ArrowRight, Code, Server, Cloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";

type Page = "home" | "items";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    icon: Code,
    title: "React + Vite",
    description: "Modern frontend with React 19, Vite 6, TypeScript, and Tailwind CSS 4",
  },
  {
    icon: Server,
    title: "FastAPI Backend",
    description: "High-performance Python backend with automatic API documentation",
  },
  {
    icon: Cloud,
    title: "AWS Infrastructure",
    description: "Production-ready Terraform configs for Lambda, API Gateway, S3, and CloudFront",
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="py-12 text-center">
        {/* TODO: アプリケーション名に変更 */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Webapp Boilerplate
        </h1>
        {/* TODO: アプリケーションの説明に変更 */}
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern fullstack boilerplate with React, FastAPI, and AWS.
          Get started building your webapp in minutes.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => onNavigate("items")} size="lg">
            View Demo
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" asChild>
            {/* TODO: GitHubリポジトリURLに変更 */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-12 surface-2 -mx-4 px-4 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-8">Tech Stack</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {[
            { name: "React 19", category: "Frontend" },
            { name: "Vite 6", category: "Build Tool" },
            { name: "Tailwind CSS 4", category: "Styling" },
            { name: "Zustand 5", category: "State" },
            { name: "FastAPI", category: "Backend" },
            { name: "Python 3.11", category: "Runtime" },
            { name: "Terraform", category: "IaC" },
            { name: "GitHub Actions", category: "CI/CD" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="flex flex-col items-center p-4 rounded-lg bg-card border border-border"
            >
              <span className="font-medium">{tech.name}</span>
              <span className="text-xs text-muted-foreground">{tech.category}</span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
