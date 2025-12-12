import Link from "next/link";
import { Bot, MessageSquare, Sparkles, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              India&apos;s First Open Source AI Platform
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Build Your Perfect <span className="text-primary">AI Assistant</span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
              Create personalized AI agents for any use case. From personal assistants to AI
              friends, Meggy AI makes it simple to build, deploy, and scale your AI solutions.
            </p>

            <div className="mb-12 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need to Build AI Agents</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Powerful features designed to make AI development accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Bot className="text-primary mb-2 h-10 w-10" />
                <CardTitle>AI Agent Builder</CardTitle>
                <CardDescription>
                  Create custom AI agents with our intuitive visual builder. No coding required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="text-primary mb-2 h-10 w-10" />
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Engage with your AI agents through our advanced chat interface with streaming
                  responses.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="text-primary mb-2 h-10 w-10" />
                <CardTitle>Multi-Agent System</CardTitle>
                <CardDescription>
                  Deploy multiple specialized agents that can work together to solve complex tasks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="text-primary mb-2 h-10 w-10" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with performance in mind. Get instant responses from your AI agents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="text-primary mb-2 h-10 w-10" />
                <CardTitle>Open Source</CardTitle>
                <CardDescription>
                  Fully open source and transparent. Customize everything to fit your needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="text-primary mb-2 h-10 w-10" />
                <CardTitle>Easy Integration</CardTitle>
                <CardDescription>
                  Simple APIs and webhooks to integrate AI agents into your existing applications.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Build Your First AI Agent?</h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
              Join thousands of developers already building the future with Meggy AI
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
