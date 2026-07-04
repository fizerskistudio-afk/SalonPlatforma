import type {
  NextConfig,
} from "next";

type RemotePattern = NonNullable<
  NonNullable<
    NextConfig["images"]
  >["remotePatterns"]
>[number];

function getSupabaseStoragePattern():
  RemotePattern[] {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ?.trim();

  if (!configuredUrl) {
    return [];
  }

  try {
    const url =
      new URL(
        configuredUrl
      );

    const protocol =
      url.protocol ===
      "http:"
        ? "http"
        : "https";

    return [
      {
        protocol,
        hostname:
          url.hostname,
        ...(url.port
          ? {
              port:
                url.port,
            }
          : {}),
        pathname:
          "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig:
  NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol:
          "https",
        hostname:
          "images.unsplash.com",
        pathname:
          "/**",
      },
      ...getSupabaseStoragePattern(),
    ],
  },
};

export default nextConfig;
