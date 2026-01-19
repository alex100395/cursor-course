'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Github, Star, GitBranch, Package, TrendingUp, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { signInWithGoogle, signOut, user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      signInWithGoogle();
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Repository Summary',
      description: 'Get comprehensive summaries of any GitHub repository, including key metrics and insights.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Star Analytics',
      description: 'Track star growth, trending periods, and popularity metrics over time.',
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'Pull Request Insights',
      description: 'Identify important pull requests, contributions, and code changes that matter.',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Version Updates',
      description: 'Stay updated with version releases, changelogs, and breaking changes.',
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: 'Cool Facts',
      description: 'Discover interesting facts, patterns, and hidden gems in open source projects.',
    },
    {
      icon: <Check className="w-6 h-6" />,
      title: 'Real-time Analysis',
      description: 'Get instant insights with our powerful analysis engine powered by AI.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 repository analyses per month',
        'Basic insights and summaries',
        'Star tracking',
        'Community support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For serious developers',
      features: [
        'Unlimited repository analyses',
        'Advanced insights & analytics',
        'Priority pull request tracking',
        'Version update alerts',
        'API access',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Custom analytics',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Wavy Background Lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-20"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 Q300,150 600,200 T1200,200"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <path
            d="M0,400 Q400,350 800,400 T1600,400"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <path
            d="M0,600 Q200,550 400,600 T800,600"
            stroke="url(#gradient3)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-2.5">
              <div className="h-10 w-10 sm:h-9 md:h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30 ring-2 ring-white/10">
                <Github className="h-6 w-6 sm:h-5 md:h-4 text-white" />
              </div>
              <span className="text-xl sm:text-lg md:text-base font-semibold text-white tracking-tight">CozyGithub</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-2">
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-cyan-500/20 active:bg-white/20 text-sm sm:text-xs md:text-[11px] font-medium px-3 sm:px-2.5 py-2 sm:py-1.5 h-10 sm:h-9 md:h-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-white/10 hover:border-purple-500/30"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 sm:gap-1.5 px-2.5 sm:px-2.5 lg:px-3 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-purple-500/40 backdrop-blur-sm min-w-0 hover:from-white/15 hover:to-white/10 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
                    {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) && (
                      <img
                        src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                        alt={user?.email || 'User'}
                        className="h-7 w-7 sm:h-6 md:h-6 rounded-full shrink-0 ring-1 ring-white/20"
                      />
                    )}
                    <span className="text-xs sm:text-xs md:text-[11px] font-medium text-white max-w-[100px] sm:max-w-[80px] md:max-w-[70px] lg:max-w-[90px] truncate">
                      {user?.user_metadata?.full_name || 
                       user?.user_metadata?.name || 
                       user?.email || 
                       'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-1.5 rounded-lg border border-white/20 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 active:from-white/25 active:to-white/15 px-3 sm:px-2.5 py-2 sm:py-1.5 text-xs sm:text-xs md:text-[11px] font-medium text-white transition-all duration-200 backdrop-blur-sm h-10 sm:h-9 md:h-8 shadow-md hover:shadow-lg hover:border-purple-500/50"
                  >
                    <svg
                      className="w-4 h-4 sm:w-3.5 md:w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={signInWithGoogle}
                    className="text-white hover:bg-white/10 active:bg-white/20 hidden sm:inline-flex text-sm font-medium px-4 py-2.5 min-h-[44px] rounded-lg transition-all duration-200"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-purple-500 via-purple-600 to-cyan-500 hover:from-purple-600 hover:via-purple-700 hover:to-cyan-600 active:from-purple-700 active:to-cyan-700 text-white border-0 px-6 sm:px-5 lg:px-8 text-base sm:text-sm md:text-xs font-semibold py-3 sm:py-2.5 md:py-2.5 min-h-[48px] sm:min-h-[44px] md:min-h-[40px] rounded-xl transition-all duration-200 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 active:scale-100 ring-2 ring-purple-500/20 hover:ring-purple-500/40"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-32">
        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight px-2">
            GitHub Insights
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              In Seconds, Not Hours
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Our platform allows your business to access deep GitHub repository insights in seconds instead of hours.
            Get summaries, track stars, identify important PRs, and stay updated with version releases.
          </p>
          <div className="flex justify-center items-center px-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div
          className={`mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 px-4">
            Everything You Need to Understand Open Source
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 px-4">
            Powerful features to help you make informed decisions about GitHub repositories
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 px-3 sm:px-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm ${
                mounted
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards' : 'none',
              }}
            >
              <CardHeader>
                <div className="mb-4 text-cyan-400">{feature.icon}</div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div
          className={`mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 px-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 px-4">
            Choose the plan that works best for you. Start free, upgrade anytime.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto px-3 sm:px-4">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 border ${
                plan.popular
                  ? 'border-cyan-500/50 scale-105 shadow-lg shadow-cyan-500/20'
                  : 'border-white/10'
              } hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards' : 'none',
              }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-white">{plan.name}</CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-sm sm:text-base text-gray-400">/{plan.period}</span>}
                </div>
                <CardDescription className="mt-2 text-xs sm:text-sm text-gray-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0'
                        : 'border border-white/20 text-white hover:bg-white/10'
                    }`}
                    onClick={plan.name === 'Enterprise' ? undefined : handleGetStarted}
                  >
                    {plan.cta}
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
        <Card
          className={`border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } transition-all duration-1000 delay-500`}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl mb-3 sm:mb-4 text-white">Ready to Get Started?</CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-300">
              Join thousands of developers analyzing GitHub repositories with CozyGithub Analyzer
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-4 sm:p-6 pt-0">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Start Your Free Analysis
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <Github className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">CozyGithub</span>
              </div>
              <p className="text-sm text-gray-400">
                The best way to analyze and understand GitHub repositories.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-purple-400 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} CozyGithub Analyzer. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
