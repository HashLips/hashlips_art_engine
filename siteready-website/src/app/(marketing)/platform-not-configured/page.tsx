export default function PlatformNotConfigured() {
  return (
    <div style={{ maxWidth: 640, margin: "3rem auto", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 12 }}>
      <h2>Platform not configured</h2>
      <p>The labour-hire platform features (DB/R2) are not configured for this environment.</p>
      <p>To enable the platform:</p>
      <ul>
        <li>Bind a Cloudflare D1 database (binding name: <strong>DB</strong>).</li>
        <li>Bind a Cloudflare R2 bucket for ticket images (binding name: <strong>TICKETS_BUCKET</strong>).</li>
        <li>Set <code>APP_SECRET</code> for session signing.</li>
      </ul>
      <p>Public pages remain available. Protected features are gated until bindings are present.</p>
    </div>
  );
}
