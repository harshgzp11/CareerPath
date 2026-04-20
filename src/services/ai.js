const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateRoadmap(role, level, time) {
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error("Gemini API Key is missing. Please add it to your .env file.");
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
        }
      }),
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Failed to generate roadmap");
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
