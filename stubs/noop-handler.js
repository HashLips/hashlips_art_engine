export default function noop() {
  return new Response(null, { status: 204 });
}
