import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-default-key"
});

interface MatchingData {
  jobSkills: string[];
  jobRequirements: string;
  professionalSkills: string[];
  professionalExperience: number;
  professionalBio: string;
  professionalPortfolio?: { title: string; description: string; tech: string[] }[];
}

interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

export async function analyzeJobProfessionalMatch(data: MatchingData): Promise<MatchAnalysis> {
  try {
    const prompt = `
You are an AI talent matching expert. Analyze the compatibility between a job posting and a professional's profile.

Job Details:
- Required Skills: ${data.jobSkills.join(', ')}
- Requirements: ${data.jobRequirements}

Professional Profile:
- Skills: ${data.professionalSkills.join(', ')}
- Experience: ${data.professionalExperience} years
- Bio: ${data.professionalBio}
${data.professionalPortfolio ? `- Portfolio: ${data.professionalPortfolio.map(p => `${p.title} (${p.tech.join(', ')})`).join('; ')}` : ''}

Provide a comprehensive analysis in JSON format with:
- matchScore: integer from 0-100 representing compatibility
- strengths: array of 3-5 specific matching strengths
- concerns: array of 2-4 potential concerns or gaps
- recommendation: detailed recommendation paragraph

Focus on technical skills alignment, experience relevance, and overall fit.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional talent matching AI. Provide accurate, detailed analysis in JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      matchScore: Math.max(0, Math.min(100, Math.round(result.matchScore || 0))),
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      concerns: Array.isArray(result.concerns) ? result.concerns : [],
      recommendation: result.recommendation || "Unable to generate recommendation"
    };
  } catch (error) {
    console.error("OpenAI matching analysis failed:", error);
    throw new Error("Failed to analyze job-professional match: " + error.message);
  }
}

export async function generateJobRecommendations(
  professionalSkills: string[],
  availableJobs: { id: string; title: string; skills: string[]; description: string }[]
): Promise<{ jobId: string; matchScore: number; reasoning: string }[]> {
  try {
    const prompt = `
You are an AI job recommendation engine. Match a professional's skills to available job opportunities.

Professional Skills: ${professionalSkills.join(', ')}

Available Jobs:
${availableJobs.map(job => `ID: ${job.id}
Title: ${job.title}
Required Skills: ${job.skills.join(', ')}
Description: ${job.description.substring(0, 200)}...
---`).join('\n')}

Provide job recommendations in JSON format:
{
  "recommendations": [
    {
      "jobId": "job_id",
      "matchScore": integer_0_to_100,
      "reasoning": "brief explanation of why this is a good match"
    }
  ]
}

Only recommend jobs with match scores above 60. Limit to top 5 recommendations.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a job recommendation AI. Analyze skills compatibility and provide JSON recommendations only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return Array.isArray(result.recommendations) ? result.recommendations : [];
  } catch (error) {
    console.error("OpenAI job recommendations failed:", error);
    throw new Error("Failed to generate job recommendations: " + error.message);
  }
}

export async function analyzeProfessionalProfile(
  skills: string[],
  bio: string,
  experience: number,
  portfolio?: { title: string; description: string; tech: string[] }[]
): Promise<{
  profileStrength: number;
  suggestedImprovements: string[];
  marketDemand: string;
}> {
  try {
    const prompt = `
Analyze this professional's profile for market competitiveness in the Latin American tech outsourcing market.

Profile:
- Skills: ${skills.join(', ')}
- Bio: ${bio}
- Experience: ${experience} years
${portfolio ? `- Portfolio: ${portfolio.map(p => `${p.title} - ${p.description.substring(0, 100)}... (Tech: ${p.tech.join(', ')})`).join('; ')}` : ''}

Provide analysis in JSON format:
{
  "profileStrength": integer_0_to_100,
  "suggestedImprovements": ["improvement1", "improvement2", ...],
  "marketDemand": "assessment of market demand for this profile"
}

Consider current tech trends, skill demand, and profile completeness.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional profile analyst specializing in tech talent assessment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      profileStrength: Math.max(0, Math.min(100, Math.round(result.profileStrength || 0))),
      suggestedImprovements: Array.isArray(result.suggestedImprovements) ? result.suggestedImprovements : [],
      marketDemand: result.marketDemand || "Unable to assess market demand"
    };
  } catch (error) {
    console.error("OpenAI profile analysis failed:", error);
    throw new Error("Failed to analyze professional profile: " + error.message);
  }
}
