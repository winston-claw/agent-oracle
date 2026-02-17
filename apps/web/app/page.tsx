'use client';

import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { useState } from 'react';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  const features = [
    {
      title: 'Modern UI Components',
      description: 'Built with Tailwind CSS and styled components for beautiful, responsive interfaces',
      icon: '🎨',
    },
    {
      title: 'Type-Safe Database',
      description: 'Convex-powered backend with TypeScript schemas and real-time synchronization',
      icon: '🗄️',
    },
    {
      title: 'Authentication Ready',
      description: 'Better-auth integration with secure user management and session handling',
      icon: '🔐',
    },
    {
      title: 'Fast Development',
      description: 'Next.js 14 with App Router for optimal performance and developer experience',
      icon: '⚡',
    },
  ];

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: ['1 Project', 'Basic Components', 'Community Support'],
      cta: 'Get Started',
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For serious developers',
      features: ['Unlimited Projects', 'Advanced Components', 'Priority Support', 'Early Access'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For teams and companies',
      features: ['Everything in Pro', 'Custom Components', 'Dedicated Support', 'SLA', 'On-premise'],
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Build Faster with{' '}
            <span className="text-primary">Modern Stack</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A complete Next.js 14 hackathon template featuring UI components, 
            Convex database, and authentication. Start your project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Why Choose This Template?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Everything you need to build modern web applications with cutting-edge technologies
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground' : ''}`}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get the latest updates and tips delivered to your inbox
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" variant="secondary">
              Subscribe
            </Button>
          </form>
          {isSubscribed && (
            <p className="mt-4 text-green-300">Thank you for subscribing! 🎉</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary/50 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2026 Hackathon Template. Built with Next.js 14, Convex, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
