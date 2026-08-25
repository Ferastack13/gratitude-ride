import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Delivery tips, company news, and insights from Gratitude Ride.",
};

const blogPosts = [
  {
    id: "1",
    title: "5 Tips for Faster Same-Day Deliveries in Lagos",
    slug: "faster-deliveries-lagos",
    excerpt: "Learn how businesses in Lagos are cutting delivery times by 40% with smart routing and express services.",
    category: "Tips",
    read_time: 5,
    published_at: "2026-07-15",
  },
  {
    id: "2",
    title: "How We Verify Every Gratitude Ride Rider",
    slug: "rider-verification-process",
    excerpt: "Transparency into our 6-step rider verification process that keeps your packages safe.",
    category: "Company",
    read_time: 4,
    published_at: "2026-07-01",
  },
  {
    id: "3",
    title: "Expanding to Port Harcourt: What You Need to Know",
    slug: "port-harcourt-launch",
    excerpt: "Gratitude Ride is now live in Port Harcourt. Here's everything about coverage, pricing, and rider availability.",
    category: "News",
    read_time: 3,
    published_at: "2026-06-20",
  },
  {
    id: "4",
    title: "E-commerce Last-Mile Delivery: A Complete Guide",
    slug: "ecommerce-last-mile-guide",
    excerpt: "The ultimate guide for Nigerian e-commerce businesses looking to optimize their last-mile delivery strategy.",
    category: "Business",
    read_time: 8,
    published_at: "2026-06-05",
  },
];

export default function BlogPage() {
  return (
    <div className="pt-20 min-h-screen bg-surface">
      <section className="section-padding bg-gradient-hero">
        <div className="container-app mx-auto text-center">
          <Badge variant="secondary" className="mb-4">Blog</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Insights & Updates
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Delivery tips, company news, and industry insights.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-app mx-auto grid md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card variant="elevated" className="h-full hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
                <Badge variant="primary" className="mb-3">{post.category}</Badge>
                <h2 className="text-xl font-bold text-dark">{post.title}</h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <span>{new Date(post.published_at).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.read_time} min read
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
