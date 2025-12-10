'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Clock, MessageSquare, Send, ArrowLeft, Sparkles, ChevronDown, Search, BookOpen, CreditCard, Zap, HelpCircle } from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: 'general', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[400px] w-[600px] rounded-full bg-purple-500 opacity-15 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[300px] w-[400px] rounded-full bg-blue-500 opacity-10 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              We&apos;d love to hear from you
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hello? Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl p-8 md:p-10 bg-[#111] border border-white/10 hover:border-white/20 transition-colors h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Send us a message</h2>
                    <p className="text-sm text-gray-500">Fill out the form and we&apos;ll respond shortly</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Name <span className="text-purple-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        Email <span className="text-purple-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">
                      Subject
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-base text-white shadow-xs transition-colors outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 md:text-sm cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#111] text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">
                      Message <span className="text-purple-400">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 min-h-[150px] resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-base shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1 space-y-6 flex flex-col">
              {/* Response Time Card */}
              <div className="rounded-2xl p-6 bg-[#111] border border-white/10 hover:border-blue-500/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Response Time</h3>
                    <p className="text-sm text-gray-500 mb-3">We aim to respond within</p>
                    <p className="text-blue-400 font-medium">24-48 hours</p>
                  </div>
                </div>
              </div>

              {/* FAQ Card */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Check out our pricing page for common questions about plans and features.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Pricing & FAQ
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="rounded-2xl p-6 bg-[#111] border border-white/10 flex-1">
                <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Why reach out?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Quick and helpful responses
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Feature requests welcome
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Partnership opportunities
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Technical support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Find answers to common questions about DocTree
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for your queries"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-full bg-[#111] border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
              <button
                onClick={() => setActiveCategory(activeCategory === 'general' ? null : 'general')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  activeCategory === 'general'
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-[#111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeCategory === 'general' ? 'bg-purple-500/30' : 'bg-white/5'}`}>
                  <BookOpen className={`w-5 h-5 ${activeCategory === 'general' ? 'text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">About DocTree</p>
                  <p className="text-xs text-gray-500">4 Articles</p>
                </div>
              </button>

              <button
                onClick={() => setActiveCategory(activeCategory === 'pricing' ? null : 'pricing')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  activeCategory === 'pricing'
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-[#111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeCategory === 'pricing' ? 'bg-blue-500/30' : 'bg-white/5'}`}>
                  <CreditCard className={`w-5 h-5 ${activeCategory === 'pricing' ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Pricing & Billing</p>
                  <p className="text-xs text-gray-500">4 Articles</p>
                </div>
              </button>

              <button
                onClick={() => setActiveCategory(activeCategory === 'features' ? null : 'features')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  activeCategory === 'features'
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-[#111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeCategory === 'features' ? 'bg-green-500/30' : 'bg-white/5'}`}>
                  <Zap className={`w-5 h-5 ${activeCategory === 'features' ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Features</p>
                  <p className="text-xs text-gray-500">4 Articles</p>
                </div>
              </button>

              <button
                onClick={() => setActiveCategory(activeCategory === 'support' ? null : 'support')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  activeCategory === 'support'
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'bg-[#111] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${activeCategory === 'support' ? 'bg-orange-500/30' : 'bg-white/5'}`}>
                  <HelpCircle className={`w-5 h-5 ${activeCategory === 'support' ? 'text-orange-400' : 'text-gray-400'}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Support</p>
                  <p className="text-xs text-gray-500">4 Articles</p>
                </div>
              </button>
            </div>

            {/* FAQ Items */}
            <div className="max-w-3xl mx-auto space-y-3">
              {/* General Questions */}
              {(activeCategory === null || activeCategory === 'general') && (
                <>
                  {[
                    { q: 'What is DocTree?', a: 'DocTree is an interactive knowledge management platform that helps you organize, learn, and explore topics through visual knowledge trees. Upload documents, generate summaries, create flashcards, take quizzes, and more.' },
                    { q: 'How do I get started?', a: 'Simply sign up for a free account, create your first knowledge tree, and start adding topics. You can upload documents, add notes, or let our AI help you build out your knowledge structure.' },
                    { q: 'What file formats are supported?', a: 'DocTree supports PDF, DOCX, TXT, and Markdown files. We\'re constantly working on adding support for more file types based on user feedback.' },
                    { q: 'Is my data secure?', a: 'Yes! We take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.' },
                  ]
                    .filter(item => !searchQuery || item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, i) => (
                      <details key={`general-${i}`} className="group rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-colors">
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                        </summary>
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-1">
                          {item.a}
                        </div>
                      </details>
                    ))}
                </>
              )}

              {/* Pricing Questions */}
              {(activeCategory === null || activeCategory === 'pricing') && (
                <>
                  {[
                    { q: 'Is there a free plan?', a: 'Yes! Our Hobby plan is completely free and includes 3 knowledge trees, basic AI chat, and 100MB of document storage. It\'s perfect for trying out DocTree.' },
                    { q: 'Can I cancel my subscription anytime?', a: 'Absolutely! You can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your billing period.' },
                    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. We also support Apple Pay and Google Pay.' },
                    { q: 'How do I upgrade my plan?', a: 'You can upgrade your plan anytime from the Pricing page or your account settings. Your new features will be available immediately, and we\'ll prorate your billing.' },
                  ]
                    .filter(item => !searchQuery || item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, i) => (
                      <details key={`pricing-${i}`} className="group rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-colors">
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                        </summary>
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-1">
                          {item.a}
                        </div>
                      </details>
                    ))}
                </>
              )}

              {/* Features Questions */}
              {(activeCategory === null || activeCategory === 'features') && (
                <>
                  {[
                    { q: 'How does AI chat work?', a: 'Our AI chat uses your uploaded documents and knowledge tree content to provide contextual answers. Ask questions about your materials and get instant, relevant responses.' },
                    { q: 'Can I share my knowledge trees?', a: 'Currently, knowledge trees are private to your account. We\'re working on collaboration and sharing features that will be available in future updates.' },
                    { q: 'What are flashcards and quizzes?', a: 'DocTree can automatically generate flashcards and quizzes from your documents to help you learn and retain information. Track your progress and master topics efficiently.' },
                    { q: 'What is the podcast feature?', a: 'Our podcast feature converts your documents into audio summaries, allowing you to learn on the go. Perfect for commuting or multitasking while absorbing knowledge.' },
                  ]
                    .filter(item => !searchQuery || item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, i) => (
                      <details key={`features-${i}`} className="group rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-colors">
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                        </summary>
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-1">
                          {item.a}
                        </div>
                      </details>
                    ))}
                </>
              )}

              {/* Support Questions */}
              {(activeCategory === null || activeCategory === 'support') && (
                <>
                  {[
                    { q: 'How do I report a bug?', a: 'Use the contact form above and select "Technical Support" as the subject. Please include as much detail as possible about the issue, including steps to reproduce it.' },
                    { q: 'Can I request new features?', a: 'Absolutely! We love hearing from our users. Submit your feature requests through the contact form with "Feedback" as the subject. Your input shapes our roadmap.' },
                    { q: 'How can I delete my account?', a: 'You can delete your account from the Settings page. Please note that this action is irreversible and all your data will be permanently deleted.' },
                    { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee for new subscriptions. If you\'re not satisfied, contact us within 7 days of your purchase for a full refund.' },
                  ]
                    .filter(item => !searchQuery || item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, i) => (
                      <details key={`support-${i}`} className="group rounded-2xl bg-[#111] border border-white/10 hover:border-white/20 transition-colors">
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                        </summary>
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-1">
                          {item.a}
                        </div>
                      </details>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
