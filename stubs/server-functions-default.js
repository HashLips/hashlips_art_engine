// Stub for server-functions/default/* modules when not bundled in this environment.
export default async function handlerStub() {
  return new Response("Handler stub", { status: 200 });
}
