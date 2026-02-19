import PolicyContent from "@/components/PolicyContent";
import PolicyAcceptPanel from "@/components/PolicyAcceptPanel";
import { getPolicyOrDefault } from "@/lib/policies/getPolicy";

export default async function WebsiteTermsPage() {
  const policy = await getPolicyOrDefault("frontend_terms");
  const updatedLabel = policy.published_at
    ? new Date(policy.published_at * 1000).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not published yet";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-srText">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{policy.title}</h1>
        <p className="mt-2 text-xs text-srMuted">
          Version {policy.version} · Last updated {updatedLabel}
        </p>
      </div>
      <PolicyContent markdown={policy.content_markdown} />
      <PolicyAcceptPanel policyKey="frontend_terms" version={policy.version} />
    </div>
  );
}
