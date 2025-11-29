import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, content } = await req.json();

    if (!resumeId || !content) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from request
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader! },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // System prompt for resume analysis
    const systemPrompt = `You are an expert career advisor and resume analyst. Analyze the provided resume and return a JSON object with the following structure:
{
  "overall_score": <integer 0-100>,
  "strengths": [<array of 3-5 specific strengths>],
  "improvements": [<array of 3-5 specific areas to improve>],
  "skill_gaps": [<array of 5-8 in-demand skills the candidate should learn>],
  "job_recommendations": [
    {
      "title": "<job title>",
      "match_score": <integer 0-100>,
      "required_skills": [<array of key skills for this role>]
    }
  ]
}

Be specific and actionable. Focus on modern industry standards. Provide 3-4 job recommendations.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this resume:\n\n${content}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to analyze resume");
    }

    const aiData = await aiResponse.json();
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    // Save analysis to database
    const { data: analysis, error: dbError } = await supabase
      .from("analyses")
      .insert({
        resume_id: resumeId,
        user_id: user.id,
        overall_score: analysisResult.overall_score,
        strengths: analysisResult.strengths,
        improvements: analysisResult.improvements,
        skill_gaps: analysisResult.skill_gaps,
        job_recommendations: analysisResult.job_recommendations,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to analyze resume" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
