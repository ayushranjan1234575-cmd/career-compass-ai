import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import AnalysisResult from "./AnalysisResult";

const ResumeUpload = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter both title and resume content");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save resume
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // Call AI analysis edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-resume",
        {
          body: { resumeId: resume.id, content: content.trim() },
        }
      );

      if (analysisError) throw analysisError;

      setAnalysisResult(analysisData);
      toast.success("Resume analyzed successfully!");
      
      // Clear form
      setTitle("");
      setContent("");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Your Resume
          </CardTitle>
          <CardDescription>
            Enter your resume details to get AI-powered analysis and job recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resume Title</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer Resume 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Resume Content</Label>
              <Textarea
                id="content"
                placeholder="Paste your resume content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isAnalyzing}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysisResult && <AnalysisResult data={analysisResult} />}
    </div>
  );
};

export default ResumeUpload;
