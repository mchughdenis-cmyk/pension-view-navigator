import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Clock, Trophy, CheckCircle2, PlayCircle, FileText, Users, TrendingUp, Shield, Wallet, Target } from "lucide-react";
import { useState } from "react";

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
  completed: boolean;
  content?: string;
}

export default function LearningCentre() {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const sippModules: Module[] = [
    {
      id: "sipp-basics",
      title: "SIPP Fundamentals",
      duration: "45 min",
      completed: false,
      description: "Understanding Self-Invested Personal Pensions",
      lessons: [
        {
          id: "sipp-1",
          title: "What is a SIPP?",
          duration: "10 min",
          type: "article",
          completed: false,
          content: "A Self-Invested Personal Pension (SIPP) is a pension 'wrapper' that allows you to save, invest and build up a pot of money for your retirement. It's a type of personal pension that gives you more flexibility with your investments."
        },
        {
          id: "sipp-2",
          title: "SIPP vs Traditional Pensions",
          duration: "15 min",
          type: "video",
          completed: false,
          content: "Learn the key differences between SIPPs and traditional workplace or personal pensions, including investment choices, costs, and control levels."
        },
        {
          id: "sipp-3",
          title: "Tax Benefits Explained",
          duration: "12 min",
          type: "article",
          completed: false,
          content: "Discover how tax relief works with SIPPs, including basic rate and higher rate tax relief, and how contributions can reduce your tax bill."
        },
        {
          id: "sipp-4",
          title: "Knowledge Check",
          duration: "8 min",
          type: "quiz",
          completed: false
        }
      ]
    },
    {
      id: "investment-options",
      title: "Investment Options in SIPPs",
      duration: "60 min",
      completed: false,
      description: "Exploring available investment choices",
      lessons: [
        {
          id: "inv-1",
          title: "Stocks and Shares",
          duration: "15 min",
          type: "article",
          completed: false,
          content: "Learn about investing in individual company shares, including UK and international stocks, and understanding market risks."
        },
        {
          id: "inv-2",
          title: "Investment Funds and ETFs",
          duration: "20 min",
          type: "video",
          completed: false,
          content: "Understand how collective investments work, including mutual funds, index funds, and exchange-traded funds (ETFs)."
        },
        {
          id: "inv-3",
          title: "Commercial Property",
          duration: "15 min",
          type: "article",
          completed: false,
          content: "Explore how SIPPs can invest in commercial property and the rules around property investments."
        },
        {
          id: "inv-4",
          title: "Alternative Investments",
          duration: "10 min",
          type: "article",
          completed: false
        }
      ]
    },
    {
      id: "drawdown-options",
      title: "Understanding Drawdown",
      duration: "40 min",
      completed: false,
      description: "How to access your pension in retirement",
      lessons: [
        {
          id: "draw-1",
          title: "Flexi-Access Drawdown",
          duration: "15 min",
          type: "video",
          completed: false
        },
        {
          id: "draw-2",
          title: "Tax-Free Cash",
          duration: "10 min",
          type: "article",
          completed: false
        },
        {
          id: "draw-3",
          title: "Income Strategies",
          duration: "15 min",
          type: "article",
          completed: false
        }
      ]
    }
  ];

  const investingModules: Module[] = [
    {
      id: "investing-basics",
      title: "Introduction to Investing",
      duration: "50 min",
      completed: false,
      description: "Start your investment journey",
      lessons: [
        {
          id: "basic-1",
          title: "Why Invest?",
          duration: "10 min",
          type: "article",
          completed: false,
          content: "Understand the importance of investing for long-term wealth building and beating inflation."
        },
        {
          id: "basic-2",
          title: "Risk and Return",
          duration: "15 min",
          type: "video",
          completed: false,
          content: "Learn the fundamental relationship between risk and potential returns in investing."
        },
        {
          id: "basic-3",
          title: "Time in the Market",
          duration: "12 min",
          type: "article",
          completed: false,
          content: "Discover why time in the market beats timing the market for long-term investors."
        },
        {
          id: "basic-4",
          title: "Compound Interest Magic",
          duration: "13 min",
          type: "video",
          completed: false
        }
      ]
    },
    {
      id: "diversification",
      title: "Portfolio Diversification",
      duration: "45 min",
      completed: false,
      description: "Building a balanced portfolio",
      lessons: [
        {
          id: "div-1",
          title: "Asset Classes Explained",
          duration: "20 min",
          type: "article",
          completed: false
        },
        {
          id: "div-2",
          title: "Geographic Diversification",
          duration: "15 min",
          type: "video",
          completed: false
        },
        {
          id: "div-3",
          title: "Rebalancing Strategies",
          duration: "10 min",
          type: "article",
          completed: false
        }
      ]
    },
    {
      id: "long-term-strategies",
      title: "Long-Term Investment Strategies",
      duration: "55 min",
      completed: false,
      description: "Strategies for sustainable growth",
      lessons: [
        {
          id: "strat-1",
          title: "Dollar-Cost Averaging",
          duration: "15 min",
          type: "video",
          completed: false
        },
        {
          id: "strat-2",
          title: "Value vs Growth Investing",
          duration: "20 min",
          type: "article",
          completed: false
        },
        {
          id: "strat-3",
          title: "ESG and Sustainable Investing",
          duration: "20 min",
          type: "article",
          completed: false
        }
      ]
    }
  ];

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const updated = new Set(prev);
      if (updated.has(lessonId)) {
        updated.delete(lessonId);
      } else {
        updated.add(lessonId);
      }
      return updated;
    });
  };

  const calculateProgress = (modules: Module[]) => {
    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completed = modules.reduce((acc, module) => 
      acc + module.lessons.filter(lesson => completedLessons.has(lesson.id)).length, 0
    );
    return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
  };

  const renderModule = (module: Module) => (
    <Card key={module.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {module.title}
              {calculateProgress([module]) === 100 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{module.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{module.duration}</span>
          </div>
        </div>
        <Progress value={calculateProgress([module])} className="mt-3 h-2" />
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lessons" className="border-none">
            <AccordionTrigger className="hover:no-underline pt-0">
              <span className="text-sm font-medium">
                {module.lessons.length} Lessons
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-2">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {lesson.type === 'video' && <PlayCircle className="h-4 w-4 text-primary" />}
                        {lesson.type === 'article' && <FileText className="h-4 w-4 text-primary" />}
                        {lesson.type === 'quiz' && <Trophy className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                    </div>
                    <Button
                      variant={completedLessons.has(lesson.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleLessonComplete(lesson.id)}
                    >
                      {completedLessons.has(lesson.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </>
                      ) : (
                        "Start"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Centre</h1>
          <p className="text-muted-foreground">Build your knowledge of pensions and long-term investing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>SIPP Knowledge</span>
                    <span>{Math.round(calculateProgress(sippModules))}%</span>
                  </div>
                  <Progress value={calculateProgress(sippModules)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Investing Basics</span>
                    <span>{Math.round(calculateProgress(investingModules))}%</span>
                  </div>
                  <Progress value={calculateProgress(investingModules)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">First Lesson</Badge>
                <Badge variant="secondary">Quiz Master</Badge>
                <Badge variant="outline">SIPP Expert</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="sm">
                Join Discussion Forum
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sipps" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sipps">SIPPs</TabsTrigger>
            <TabsTrigger value="investing">Investing</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="sipps" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">SIPP Education Modules</h2>
            </div>
            {sippModules.map(renderModule)}
          </TabsContent>

          <TabsContent value="investing" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Long-Term Investing</h2>
            </div>
            {investingModules.map(renderModule)}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Additional Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Glossary</CardTitle>
                  <CardDescription>Key terms and definitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Glossary</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calculators</CardTitle>
                  <CardDescription>Pension and investment tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Open Calculators</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Webinars</CardTitle>
                  <CardDescription>Live and recorded sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Schedule</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">FAQs</CardTitle>
                  <CardDescription>Common questions answered</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Browse FAQs</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg">Need Personal Advice?</CardTitle>
                <CardDescription>
                  While our learning centre provides general education, your personal circumstances are unique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Schedule Adviser Consultation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}