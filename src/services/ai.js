const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-flash-lite-latest";
const FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"];

function getTrackFromRole(role = "") {
  const normalized = role.toLowerCase();
  const rules = [
    { key: "frontend", terms: ["frontend", "front-end", "ui", "react", "angular", "vue"] },
    { key: "backend", terms: ["backend", "back-end", "api", "server", "node", "java", "spring", "golang"] },
    { key: "fullstack", terms: ["fullstack", "full-stack", "mern", "mean"] },
    { key: "data", terms: ["data analyst", "data science", "data engineer", "analytics", "bi"] },
    { key: "ml", terms: ["machine learning", "ml", "ai engineer", "deep learning", "nlp"] },
    { key: "mobile", terms: ["android", "ios", "mobile", "react native", "flutter"] },
    { key: "devops", terms: ["devops", "sre", "platform", "cloud engineer", "kubernetes"] },
  ];

  const match = rules.find(({ terms }) => terms.some((term) => normalized.includes(term)));
  return match?.key || "general";
}

function getPaceNote(hours) {
  if (hours >= 20) {
    return "Use your high weekly bandwidth to include one deep project in parallel.";
  }

  if (hours >= 10) {
    return "Keep a weekly build-review loop to convert concepts into portfolio output.";
  }

  return "Use a low-volume but consistent cadence, and avoid multitasking across tracks.";
}

function getTrackSteps(track) {
  const stepsByTrack = {
    frontend: [
      {
        task: "Web Fundamentals + JavaScript Mastery",
        desc: "Cover HTML, CSS, modern JavaScript, asynchronous patterns, and browser APIs.",
        resources: ["https://developer.mozilla.org", "https://javascript.info"],
      },
      {
        task: "React and Component Architecture",
        desc: "Build reusable components, state patterns, routing, forms, and accessibility foundations.",
        resources: ["https://react.dev/learn", "https://www.frontendmentor.io"],
      },
      {
        task: "Styling, UX, and Performance",
        desc: "Practice responsive design, design systems, Core Web Vitals, and debugging front-end bottlenecks.",
        resources: ["https://web.dev", "https://css-tricks.com"],
      },
    ],
    backend: [
      {
        task: "Server-Side Basics and API Design",
        desc: "Learn HTTP, REST, auth basics, request validation, and error handling patterns.",
        resources: ["https://roadmap.sh/backend", "https://developer.mozilla.org/en-US/docs/Web/HTTP"],
      },
      {
        task: "Database Design and Querying",
        desc: "Model relational/noSQL data, indexing strategy, migrations, and transactional thinking.",
        resources: ["https://www.postgresql.org/docs/", "https://www.mongodb.com/docs/"],
      },
      {
        task: "Production Readiness",
        desc: "Add logging, testing, caching, CI/CD, monitoring, and secure deployment workflows.",
        resources: ["https://12factor.net", "https://docs.github.com/en/actions"],
      },
    ],
    fullstack: [
      {
        task: "Frontend + Backend Core Integration",
        desc: "Connect UI state to APIs, auth flows, and data persistence with clean boundaries.",
        resources: ["https://fullstackopen.com/en/", "https://react.dev/learn"],
      },
      {
        task: "Build End-to-End Features",
        desc: "Ship complete features including validation, loading states, error handling, and tests.",
        resources: ["https://nextjs.org/learn", "https://www.prisma.io/docs"],
      },
      {
        task: "Deployment and Observability",
        desc: "Deploy full-stack apps with environment management, logs, and performance metrics.",
        resources: ["https://vercel.com/docs", "https://render.com/docs"],
      },
    ],
    data: [
      {
        task: "SQL, Data Cleaning, and EDA",
        desc: "Build confidence with SQL joins, aggregations, data wrangling, and exploratory analysis.",
        resources: ["https://mode.com/sql-tutorial", "https://pandas.pydata.org/docs/"],
      },
      {
        task: "Dashboarding and Storytelling",
        desc: "Create business-ready dashboards and communicate actionable insights clearly.",
        resources: ["https://learn.microsoft.com/power-bi/", "https://public.tableau.com"],
      },
      {
        task: "Analytical Projects and Case Studies",
        desc: "Build 2-3 portfolio case studies from raw data to recommendations.",
        resources: ["https://www.kaggle.com", "https://towardsdatascience.com"],
      },
    ],
    ml: [
      {
        task: "Math + Python ML Foundations",
        desc: "Cover statistics, linear algebra intuition, Python tooling, and model evaluation basics.",
        resources: ["https://scikit-learn.org/stable/user_guide.html", "https://numpy.org/learn/"],
      },
      {
        task: "Classical ML and Feature Engineering",
        desc: "Train baseline models, tune hyperparameters, and build robust validation pipelines.",
        resources: ["https://www.kaggle.com/learn", "https://developers.google.com/machine-learning/crash-course"],
      },
      {
        task: "Deployment and MLOps Basics",
        desc: "Package models, expose inference APIs, monitor drift, and version datasets/artifacts.",
        resources: ["https://mlflow.org/docs/latest/index.html", "https://docs.docker.com/get-started/"],
      },
    ],
    mobile: [
      {
        task: "Mobile Fundamentals and UI Patterns",
        desc: "Learn navigation, layouts, state handling, and platform-specific UX principles.",
        resources: ["https://reactnative.dev/docs/getting-started", "https://docs.flutter.dev"],
      },
      {
        task: "Device Features + Data Integration",
        desc: "Implement auth, API calls, storage, notifications, and offline-friendly behavior.",
        resources: ["https://firebase.google.com/docs", "https://developer.android.com/docs"],
      },
      {
        task: "Release Pipeline and Quality",
        desc: "Practice testing, profiling, app signing, and store deployment checklists.",
        resources: ["https://developer.apple.com/documentation/xcode", "https://developer.android.com/studio/publish"],
      },
    ],
    devops: [
      {
        task: "Linux, Networking, and Scripting",
        desc: "Build command-line confidence, shell scripting, and core network troubleshooting basics.",
        resources: ["https://linuxjourney.com", "https://explainshell.com"],
      },
      {
        task: "CI/CD, Containers, and IaC",
        desc: "Automate builds, use Docker, and define reproducible infra with IaC principles.",
        resources: ["https://docs.docker.com", "https://developer.hashicorp.com/terraform/docs"],
      },
      {
        task: "Kubernetes, Monitoring, and Reliability",
        desc: "Manage deployments, alerting, SLO thinking, and incident-response workflows.",
        resources: ["https://kubernetes.io/docs/home/", "https://prometheus.io/docs/introduction/overview/"],
      },
    ],
    general: [
      {
        task: "Core Foundations for the Role",
        desc: "Build core technical fluency, problem-solving habits, and a strong workflow foundation.",
        resources: ["https://roadmap.sh", "https://www.freecodecamp.org"],
      },
      {
        task: "Hands-on Practice and Mini Projects",
        desc: "Apply concepts through focused project cycles with clear goals and reflection.",
        resources: ["https://github.com", "https://www.codecademy.com/resources/blog/"],
      },
      {
        task: "Portfolio and Interview Readiness",
        desc: "Package your work into strong case studies and practice interview communication.",
        resources: ["https://leetcode.com", "https://www.pramp.com"],
      },
    ],
  };

  return stepsByTrack[track] || stepsByTrack.general;
}

function buildLocalFallbackRoadmap(role, level, time) {
  const hours = Number(time) || 8;
  const track = getTrackFromRole(role);
  const paceNote = getPaceNote(hours);
  const trackSteps = getTrackSteps(track);
  const basePlan = [
    {
      task: `Understand ${role} Fundamentals`,
      desc: `Build strong role fundamentals at the ${level} level. ${paceNote}`,
      resources: ["https://roadmap.sh", "https://developer.mozilla.org"],
    },
    ...trackSteps,
    {
      task: "Capstone + Interview Preparation",
      desc: `Build one portfolio-grade ${role} project and practice role-relevant interview rounds weekly.`,
      resources: ["https://github.com", "https://www.interviewbit.com"],
    },
  ];

  return basePlan.map((step, index) => ({ ...step, id: index + 1 }));
}

export async function generateRoadmap(role, level, time) {
  const isMissingKey = !API_KEY || API_KEY === "YOUR_GEMINI_API_KEY";
  const isPlaceholderKey = API_KEY?.toLowerCase().includes("dummy");

  if (isMissingKey || isPlaceholderKey) {
    throw new Error("Gemini API key is missing/placeholder. Add a real VITE_GEMINI_API_KEY in .env and restart the dev server.");
  }

  const prompt = `
    Act as a career counselor. Generate a personalized learning roadmap for the following parameters:
    Target Role: ${role}
    Current Skill Level: ${level}
    Time Commitment: ${time} hours per week

    Respond ONLY with a valid JSON array. Do not wrap in markdown tags. 
    The JSON array must contain objects with this exact structure:
    [{ "id": 1, "task": "Brief Task Title", "desc": "Actionable description of what to learn/do", "resources": ["https://example.com/resource"] }]
    
    Ensure there are 5-8 sequential learning steps.
  `;

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let data;
  let lastError = null;

  for (const model of modelsToTry) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    data = await response.json();
    if (!data.error) break;

    const message = data.error.message || "Failed to generate roadmap";
    const isModelNotFound =
      message.includes("not found for API version") ||
      message.includes("not supported for generateContent");

    // Only try fallback models when the current model itself is unavailable.
    if (isModelNotFound) {
      lastError = message;
      continue;
    }

    if (data.error.status === "PERMISSION_DENIED") {
      throw new Error(
        "Gemini API access denied for this Google project/key. Use a different API key/project or contact Google support."
      );
    }

    const isQuotaError =
      data.error.status === "RESOURCE_EXHAUSTED" ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit");

    if (isQuotaError) {
      console.warn("Gemini quota exceeded. Using local fallback roadmap.");
      const fallbackRoadmap = buildLocalFallbackRoadmap(role, level, time);
      fallbackRoadmap._fallback = true;
      return fallbackRoadmap;
    }

    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(lastError || "Failed to generate roadmap");
  }

  try {
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Parse Error:", err, "Raw Output:", data.candidates[0].content.parts[0].text);
    throw new Error("Failed to parse AI response into JSON. Please try again.");
  }
}
