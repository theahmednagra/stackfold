import type { PortfolioData } from "@/lib/types/portfolio";

/**
 * In-memory stand-in for a MongoDB collection.
 *
 * Each top-level key is a `username`, matching the path segment that
 * will eventually drive the dynamic `/[username]` portfolio routes
 * (e.g. `munyyb.com` -> portfolios["munyyb"]). Every field here maps
 * directly onto the `PortfolioData` shape that `portfolio-service.ts`
 * would otherwise fetch via Mongoose models such as `User`, `Profile`
 * and `Project`.
 */
export const portfolios: Record<string, PortfolioData> = {
  munyyb: {
    profile: {
      name: "Muneeb ur rehman",
      username: "munyyb",
      brandName: "Munyyb",
      title: "Creator • Full-stack Web Developer • Mobile App Developer",
      bio: [
        "Hey there! I'm a software engineer currently working at LogicLeaps. I have a genuine love for creating innovative products and enjoy tackling new challenges in the tech world. I specialize in full-stack and cross-platform mobile application development, using tools like React, Angular, Vue, React Native, Node.js, NestJS and many more. Additionaly I am fimilar with cloud technologies like AWS and AZURE for deploying and scaling applications.",
        "When I'm not coding, I'm probably brainstorming new ideas or figuring out how to make technology more user-friendly. I believe in continuous learning and collaboration, always open to new perspectives and ideas. Let's build something amazing together – and have some fun along the way!",
      ],
      email: "muneeburryhman@gmail.com",
      bioLinks: [{ text: "LogicLeaps", href: "/projects/logicleaps" }],
      socialLinks: [
        { platform: "twitter", url: "https://twitter.com/munyyb" },
        { platform: "github", url: "https://github.com/munyyb" },
        { platform: "linkedin", url: "https://linkedin.com/in/munyyb" },
      ],
      navLinks: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
      ],
      footerNote: "Made with",
    },
    projects: [
      {
        _id: "p1",
        slug: "appfilmbar",
        name: "AppFilmBar",
        tagline: "A real-world mobile simulations app for films",
        description: [
          "AppFilmBar is a cross-platform mobile app that lets film fans simulate real-world locations from their favourite movies, turning a phone into a pocket location-scout for cinema.",
          "Built with React Native, the app combines a curated database of filming locations with an immersive map experience, letting users browse, save and share the scenes that inspired them.",
        ],
        coverImage: "/projects/appfilmbar-cover.svg",
        icon: {
          type: "image",
          value: "/icons/appfilmbar-icon.svg",
        },
        links: [],
        features: [
          {
            title: "Location Library",
            description:
              "Browse a growing catalogue of real filming locations linked to the movies and scenes they appear in.",
          },
          {
            title: "Interactive Maps",
            description:
              "Pinpoint locations on an interactive map and plan visits with distance and travel-time estimates.",
          },
          {
            title: "Cross-Platform",
            description:
              "A single React Native codebase ships to both iOS and Android with a consistent native feel.",
          },
        ],
        featured: false,
        order: 1,
      },
      {
        _id: "p2",
        slug: "image-converter",
        name: "Image Converter",
        tagline:
          "Solve your daily life challenges in converting high quality images with instant click",
        description: [
          "Image Converter is a lightweight web utility that converts images between popular formats (PNG, JPG, WebP and more) entirely in the browser, with no upload or sign-up required.",
          "The tool focuses on speed and privacy: files never leave the user's device, conversions run client-side, and high-quality output is produced in a single click.",
        ],
        coverImage: "/projects/image-converter-cover.svg",
        icon: {
          type: "image",
          value: "/icons/image-converter-icon.svg",
        },
        links: [
          {
            label: "image-converter-blue.vercel.app",
            url: "https://image-converter-blue.vercel.app",
            icon: "external",
          },
          {
            label: "MUNYYB/image-converter",
            url: "https://github.com/munyyb/image-converter",
            icon: "github",
          },
        ],
        features: [
          {
            title: "Client-Side Processing",
            description:
              "All conversions happen locally in the browser, so files stay private and the process is instant.",
          },
          {
            title: "Multiple Formats",
            description:
              "Convert between PNG, JPG, WebP and other common image formats without quality loss.",
          },
          {
            title: "Batch Friendly",
            description:
              "Drop in several images at once and download every converted file in seconds.",
          },
        ],
        featured: false,
        order: 2,
      },
      {
        _id: "p3",
        slug: "airplate",
        name: "Airplate AI",
        tagline: "Event & banqueting contract automation for hotels",
        description: [
          "Airplate AI is an advanced platform designed to revolutionize hospitality management and automation, specifically targeting the challenges of manual labor in the industry. By automating event and banqueting contract processes, Airplate AI empowers hotels to operate more efficiently, reduce errors, and enhance guest experiences.",
          "At Airplate AI, we recognize the complexities and labor-intensive nature of hospitality management. Our platform leverages cutting-edge AI technology to streamline and automate critical processes, allowing hotel staff to focus more on providing exceptional service and less on administrative tasks. From contract generation to event management, Airplate AI simplifies operations and boosts productivity.",
          "Experience the next level of hospitality management with Airplate AI – where automation and AI come together to transform your operations and elevate your service quality.",
        ],
        coverImage: "https://res.cloudinary.com/dv4sdkrma/image/upload/v1722079917/Airplate_ltp7pk.png",
        icon: {
          type: "image",
          value: "/icons/airplate-icon.svg",
        },
        links: [
          { label: "airplate.ai", url: "https://airplate.ai", icon: "external" },
        ],
        features: [
          {
            title: "Contract Automation",
            description:
              "Automatically generate, manage, and track event and banqueting contracts, reducing the need for manual intervention and minimizing errors.",
          },
          {
            title: "Seamless Integration",
            description:
              "Easily integrate with existing hotel management systems to ensure smooth data flow and operational coherence.",
          },
          {
            title: "Customizable Solutions",
            description:
              "Tailor the platform to meet the specific needs and preferences of your hotel, ensuring that our solution aligns perfectly with your operational requirements.",
          },
          {
            title: "Enhanced Efficiency",
            description:
              "Streamline workflows and reduce the time spent on administrative tasks, allowing staff to dedicate more time to enhancing guest experiences.",
          },
          {
            title: "User-Friendly Interface",
            description:
              "Designed with ease of use in mind, Airplate AI offers an intuitive interface that makes automation accessible to all users, regardless of technical expertise.",
          },
        ],
        featured: true,
        order: 3,
        featuredOrder: 1,
      },
      {
        _id: "p4",
        slug: "chytboat",
        name: "ChytBoat",
        tagline: "Connect to anyone in the most secure way possible",
        description: [
          "ChytBoat is a real-time chat application built around end-to-end privacy, letting people connect with anyone through encrypted, low-latency messaging.",
          "The platform pairs a Socket.IO-powered messaging core with a clean, distraction-free interface, focusing on the essentials: fast delivery, presence indicators, and secure conversations.",
        ],
        coverImage: "/projects/chytboat-cover.svg",
        icon: {
          type: "image",
          value: "/icons/chytboat-icon.svg",
        },
        links: [
          {
            label: "chytboat.vercel.app",
            url: "https://chytboat.vercel.app",
            icon: "external",
          },
          {
            label: "MUNYYB/CHYTBOAT-WEB",
            url: "https://github.com/munyyb/CHYTBOAT-WEB",
            icon: "github",
          },
        ],
        features: [
          {
            title: "Real-Time Messaging",
            description:
              "Messages are delivered instantly over WebSockets, with typing indicators and live presence status.",
          },
          {
            title: "Secure by Design",
            description:
              "Conversations are protected end-to-end, so only the people in a chat can read what's shared.",
          },
          {
            title: "Minimal Interface",
            description:
              "A focused, distraction-free UI keeps the spotlight on the conversation.",
          },
        ],
        featured: false,
        order: 4,
      },
      {
        _id: "p5",
        slug: "logicleaps",
        name: "LogicLeaps",
        tagline:
          "A company specializing in AI-driven custom software development solutions",
        description: [
          "LogicLeaps is a software studio focused on building AI-driven, custom software solutions for ambitious businesses - from early-stage MVPs to scaled production platforms.",
          "We believe in Innovate, Integrate and Elevate: combining modern engineering practices with applied AI to help teams ship faster, automate manual work, and make better decisions with their data.",
        ],
        coverImage: "/projects/logicleaps-cover.svg",
        icon: {
          type: "image",
          value: "/icons/logicleaps-icon.svg",
        },
        links: [
          {
            label: "logic-leaps.vercel.app",
            url: "https://logic-leaps.vercel.app",
            icon: "external",
          },
          {
            label: "MUNYYB/LogicLeaps",
            url: "https://github.com/munyyb/LogicLeaps",
            icon: "github",
          },
        ],
        features: [
          {
            title: "Custom AI Solutions",
            description:
              "Tailored AI integrations designed around each client's existing workflows and data.",
          },
          {
            title: "Full-Stack Delivery",
            description:
              "From product strategy to deployment, covering web, mobile and cloud infrastructure end-to-end.",
          },
          {
            title: "Scalable Architecture",
            description:
              "Systems are built on modern, cloud-native foundations that grow with the business.",
          },
        ],
        featured: true,
        order: 5,
        featuredOrder: 2,
      },
      {
        _id: "p6",
        slug: "projectorate",
        name: "Projectorate",
        tagline:
          "Streamline Your Workflow with Premier Project Management Architecture",
        description: [
          "Projectorate is a final-year project: a project management platform that brings boards, tasks, and team collaboration together in a single streamlined workspace.",
          "Built with a focus on clean architecture, it gives teams a Kanban-style view of their work, role-based permissions, and real-time updates so everyone stays aligned on priorities.",
        ],
        coverImage: "/projects/projectorate-cover.svg",
        icon: {
          type: "image",
          value: "/icons/projectorate-icon.svg",
        },
        links: [
          {
            label: "projectorate.vercel.app",
            url: "https://projectorate.vercel.app",
            icon: "external",
          },
          {
            label: "MUNYYB/Projectorate",
            url: "https://github.com/munyyb/Projectorate",
            icon: "github",
          },
        ],
        features: [
          {
            title: "Kanban Boards",
            description:
              "Organize work into drag-and-drop boards that mirror how your team actually works.",
          },
          {
            title: "Role-Based Access",
            description:
              "Fine-grained permissions ensure the right people see and edit the right things.",
          },
          {
            title: "Real-Time Updates",
            description:
              "Changes sync instantly across the team, keeping everyone on the same page.",
          },
        ],
        featured: true,
        order: 6,
        featuredOrder: 3,
      },
    ],
  },
};

/** The username whose portfolio is rendered at the site root for this milestone. */
export const DEFAULT_USERNAME = "munyyb";
