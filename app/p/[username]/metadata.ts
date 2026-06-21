import type { Metadata } from "next";
import { getProfileStatus } from "./layout"; // Import the cached engine from your layout file

// ================= PRODUCTION METADATA ENGINE =================
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;

    // ⚡ CRITICAL: Use your production environment URL or fall back to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://stackfold.vercel.app";
    const fallbackTitle = "Stackfold Portfolio";
    const fallbackDesc = "Build a portfolio that commands attention. The minimalist developer platform.";

    // Global Favicon Overrides to force platform link overlays to use Stackfold branding
    const globalIconsConfig = {
        icon: [
            { url: `${baseUrl}/favicon.ico`, sizes: "any" },
            { url: `${baseUrl}/icon.png`, type: "image/png" }
        ],
        apple: `${baseUrl}/apple-touch-icon.png`, // Perfect for Apple shortcut support
    };


    if (!username) {
        return {
            title: fallbackTitle,
            description: fallbackDesc,
            icons: globalIconsConfig,
        };
    }

    const resolution = await getProfileStatus(username);
    const formattedUsername = username.toLowerCase().trim();

    // 1. Soft fallback state if the user hasn't created their profile document yet
    if (resolution.status === "UNINITIALIZED") {
        const title = `@${formattedUsername} - Space Reserved`;
        const description = `The portfolio workspace for @${formattedUsername} is currently under construction on Stackfold.`;

        const ogImageParams = new URLSearchParams();
        ogImageParams.set("name", "Space Reserved");
        ogImageParams.set("username", formattedUsername);
        const dynamicOgImageUrl = `${baseUrl}/api/og?${ogImageParams.toString()}`;

        return {
            title,
            description,
            icons: globalIconsConfig,
            openGraph: {
                title,
                description,
                type: "website",
                url: `${baseUrl}/${formattedUsername}`,
                images: [{ url: dynamicOgImageUrl, width: 1200, height: 630, alt: "Stackfold Space Reserved" }],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [dynamicOgImageUrl],
            },
        };
    }

    // 2. Hard hidden private or non-existent profiles
    if (resolution.status !== "ACTIVE") {
        const title = "Profile Not Found - Stackfold";

        const ogImageParams = new URLSearchParams();
        ogImageParams.set("name", "Profile Not Found");
        ogImageParams.set("username", formattedUsername);
        const dynamicOgImageUrl = `${baseUrl}/api/og?${ogImageParams.toString()}`;

        return {
            title,
            description: "This portfolio space does not exist or has been set to private by the owner.",
            icons: globalIconsConfig,
            openGraph: {
                title,
                type: "website",
                images: [{ url: dynamicOgImageUrl, width: 1200, height: 630 }],
            },
            twitter: {
                card: "summary_large_image",
                title,
                images: [dynamicOgImageUrl],
            },
        };
    }

    // 3. Fully Active Public Profiles
    const { profile } = resolution;
    const profileTitle = `${profile.fullname || "Developer"} (@${formattedUsername})`;
    const profileDesc = profile.bio || "Crafting premium user experiences and highly optimized web interfaces.";

    // Generate parameters to feed our dynamic /api/og image generator
    const ogImageParams = new URLSearchParams();
    if (profile.fullname) {
        ogImageParams.set("name", profile.fullname);
    } else {
        ogImageParams.set("name", "Portfolio Space");
    }
    ogImageParams.set("username", formattedUsername);
    const dynamicOgImageUrl = `${baseUrl}/api/og?${ogImageParams.toString()}`;

    return {
        title: `${profile.fullname || "Developer"} - Portfolio`,
        description: profileDesc,
        icons: globalIconsConfig, // Ensures Stackfold's brand always applies to live links
        openGraph: {
            title: profileTitle,
            description: profileDesc,
            type: "profile",
            username: formattedUsername,
            url: `${baseUrl}/${formattedUsername}`,
            siteName: "Stackfold",
            images: [
                {
                    url: dynamicOgImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${profileTitle} Portfolio Showcase Overview`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: profileTitle,
            description: profileDesc,
            images: [dynamicOgImageUrl],
        },
    };
}