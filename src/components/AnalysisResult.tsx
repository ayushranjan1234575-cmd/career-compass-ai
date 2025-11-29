import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Target, Briefcase } from "lucide-react";

interface AnalysisResultProps {
  data: {
    overall_score: number;
    strengths: string[];
    improvements: string[];
    skill_gaps: string[];
    job_recommendations: Array<{ title: string; match_score: number; required_skills: string[] }>;
  };
}

const AnalysisResult = ({ data }: AnalysisResultProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Score */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Your resume performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-6xl font-bold ${getScoreColor(data.overall_score)}`}>
              {data.overall_score}
            </div>
            <div className="flex-1">
              <Progress value={data.overall_score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {data.overall_score >= 80 && "Excellent! Your resume is in great shape."}
                {data.overall_score >= 60 && data.overall_score < 80 && "Good job! Some improvements can make it better."}
                {data.overall_score < 60 && "There's room for improvement. Follow the suggestions below."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Skills to Learn
          </CardTitle>
          <CardDescription>
            These skills could enhance your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.skill_gaps.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Recommended Roles
          </CardTitle>
          <CardDescription>
            Jobs that match your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.job_recommendations.map((job, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{job.title}</h4>
                  <Badge variant={job.match_score >= 80 ? "default" : "secondary"}>
                    {job.match_score}% match
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.required_skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;
