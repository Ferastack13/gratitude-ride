import { PageShell } from "@/components/ui/page-shell";

export default function FamilyJoinPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const clean = (searchParams.code ?? "").trim().toUpperCase();
  const appLink = clean
    ? `gratituderide://family/join?code=${encodeURIComponent(clean)}`
    : "gratituderide://family/join";

  return (
    <PageShell
      eyebrow="Family"
      title="You’re invited to a Gratitude family"
      description="Open the Gratitude Ride app to join this family profile. After you sign up, the person who invited you will see that you accepted."
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        {clean ? (
          <p className="text-sm text-stone-600">
            Family code{" "}
            <span className="font-semibold tracking-[0.2em] text-emerald-900">
              {clean}
            </span>
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            Ask your family for the invite code if you don’t have a link.
          </p>
        )}
        <a
          href={appLink}
          className="mt-5 inline-flex rounded-full bg-[#12372A] px-5 py-3 text-sm font-semibold text-white"
        >
          Open Gratitude Ride
        </a>
        <p className="mt-4 text-sm text-stone-500">
          If the app doesn’t open, install Gratitude Ride, then enter this code
          on the family invite screen.
        </p>
      </div>
    </PageShell>
  );
}
