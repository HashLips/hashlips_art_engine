// Minimal stub for @vercel/og to avoid pulling resvg.wasm in Cloudflare Workers.
export function ImageResponse() {
  throw new Error("ImageResponse is disabled in this deployment.");
}

export default {
  ImageResponse,
};
