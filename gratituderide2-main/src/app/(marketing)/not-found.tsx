import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20">404</p>
        <h1 className="mt-4 text-2xl font-bold text-dark">Page Not Found</h1>
        <p className="mt-2 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/" size="lg" className="mt-8">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
