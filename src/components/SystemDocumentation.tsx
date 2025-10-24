import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Home, 
  Users, 
  TrendingUp, 
  ArrowLeftRight, 
  DollarSign, 
  BookOpen,
  Shield,
  CreditCard,
  Calendar,
  Download,
  Settings,
  BarChart3,
  FileCheck,
  Wallet,
  Building,
  PlayCircle,
  UserCheck,
  Receipt
} from "lucide-react";

const SystemDocumentation = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      const htmlDocx = await import('html-docx-js/dist/html-docx');
      
      const content = document.getElementById('documentation-content');
      if (!content) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Pension Navigator - System Documentation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h1 { color: #1a1a1a; font-size: 24pt; margin-bottom: 12pt; }
              h2 { color: #2a2a2a; font-size: 18pt; margin-top: 18pt; margin-bottom: 10pt; }
              h3 { color: #3a3a3a; font-size: 14pt; margin-top: 14pt; margin-bottom: 8pt; }
              p { margin-bottom: 10pt; }
              ul { margin-bottom: 12pt; }
              li { margin-bottom: 6pt; }
              .feature-list { margin-left: 20pt; }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `;

      const converted = htmlDocx.asBlob(htmlContent);
      const url = URL.createObjectURL(converted);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Pension-Navigator-Documentation.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
    }
  };

  const features = [
    {
      category: "Authentication & Access",
      icon: Shield,
      color: "bg-blue-500",
      items: [
        {
          name: "Login System",
          icon: Shield,
          description: "Secure authentication portal with email/password login, role-based access control, and session management.",
          features: [
            "Email and password authentication",
            "Role-based access (Client, Adviser, Admin)",
            "Secure session management",
            "Password recovery functionality"
          ]
        }
      ]
    },
    {
      category: "Client Dashboard",
      icon: Home,
      color: "bg-green-500",
      items: [
        {
          name: "Products Dashboard",
          icon: Home,
          description: "Central hub for all client pension products and services with real-time portfolio values and quick access to all features.",
          features: [
            "Total portfolio value display with monthly change tracking",
            "Monthly drawdown summary with next payment date",
            "Risk profile status and last review date",
            "Quick access cards to all products and services",
            "Status indicators (Active, Pending, Available, Scheduled)",
            "System demo launcher for guided tours"
          ]
        },
        {
          name: "Pension Portfolio",
          icon: Wallet,
          description: "Comprehensive view of all pension schemes with detailed breakdowns of accumulation, drawdown, and allowances.",
          features: [
            "Multi-scheme portfolio overview",
            "Real-time portfolio valuation across all schemes",
            "Accumulation vs Drawdown breakdown",
            "Annual allowance tracking and usage",
            "Carry forward allowance history",
            "Individual scheme performance metrics",
            "Investment allocation by scheme",
            "Contribution tracking per scheme"
          ]
        }
      ]
    },
    {
      category: "Client Onboarding",
      icon: UserCheck,
      color: "bg-purple-500",
      items: [
        {
          name: "Client Registration",
          icon: Users,
          description: "Comprehensive onboarding process collecting personal details, financial information, risk assessment, and goal setting.",
          features: [
            "Personal information collection",
            "Financial situation assessment",
            "Risk tolerance questionnaire",
            "Investment goal setting",
            "Retirement planning objectives",
            "Automated risk profiling",
            "Portfolio recommendation based on risk profile"
          ]
        },
        {
          name: "Digital Welcome Pack",
          icon: FileText,
          description: "Interactive welcome materials with system guides, terms and conditions, and key documents for new clients.",
          features: [
            "System overview and getting started guide",
            "Terms and conditions acceptance",
            "GDPR and privacy policy acknowledgment",
            "Key features information document",
            "Contact information and support details",
            "Download capability for all documents"
          ]
        }
      ]
    },
    {
      category: "Compliance & Verification",
      icon: FileCheck,
      color: "bg-red-500",
      items: [
        {
          name: "KYC/AML Verification",
          icon: Shield,
          description: "Full Know Your Customer and Anti-Money Laundering verification process with document upload and compliance checks.",
          features: [
            "Identity document verification (Passport, Driver's License, National ID)",
            "Address verification with proof of residence",
            "Document upload with validation",
            "Source of funds declaration",
            "Source of wealth verification",
            "Politically Exposed Person (PEP) screening",
            "Sanctions list checking",
            "Enhanced Due Diligence (EDD) triggers",
            "Compliance status tracking",
            "Document expiry monitoring",
            "Multi-step verification progress"
          ]
        }
      ]
    },
    {
      category: "Contributions & Payments",
      icon: CreditCard,
      color: "bg-blue-600",
      items: [
        {
          name: "Payment Provider",
          icon: CreditCard,
          description: "Comprehensive payment management system for contributions and withdrawals with multiple payment methods.",
          features: [
            "Payment method management (Cards and Bank Accounts)",
            "Card verification and validation",
            "Bank account linking with sort code validation",
            "One-time contribution processing",
            "Recurring contribution setup (Monthly, Quarterly, Annual)",
            "Contribution amount validation",
            "Tax relief calculation and display",
            "Withdrawal requests with multiple options",
            "Withdrawal amount validation",
            "Full withdrawal vs partial withdrawal",
            "Transaction history with status tracking",
            "Payment method verification status",
            "Default payment method selection",
            "Secure payment processing"
          ]
        },
        {
          name: "Initial Contribution",
          icon: DollarSign,
          description: "Process for adding initial funds to pension schemes with payment method selection and confirmation.",
          features: [
            "Contribution amount entry",
            "Payment method selection",
            "Tax relief preview",
            "Annual allowance impact calculation",
            "Confirmation and receipt generation"
          ]
        }
      ]
    },
    {
      category: "Transfers",
      icon: ArrowLeftRight,
      color: "bg-orange-500",
      items: [
        {
          name: "Pension Transfer In",
          icon: ArrowLeftRight,
          description: "Complete journey for transferring existing pensions into the system with provider details and valuation.",
          features: [
            "Previous provider information capture",
            "Scheme type identification",
            "Current value estimation",
            "Transfer value request",
            "Exit charge calculation",
            "Protected benefits checker",
            "Transfer timeline estimation",
            "Documentation requirements list",
            "Transfer authorization"
          ]
        },
        {
          name: "Transfer Out Journey",
          icon: ArrowLeftRight,
          description: "Process for transferring pension funds to external providers with comprehensive checks and authorizations.",
          features: [
            "Receiving provider details",
            "Transfer value calculation",
            "Exit charge disclosure",
            "Benefits comparison",
            "Appropriate advice confirmation",
            "Transfer authorization",
            "Progress tracking"
          ]
        },
        {
          name: "Instrument Transfer",
          icon: Building,
          description: "In-specie transfer of investments between schemes without liquidation.",
          features: [
            "Asset selection for transfer",
            "Source and destination scheme selection",
            "Transfer value calculation",
            "Tax implications analysis",
            "Market value capture",
            "Transfer execution"
          ]
        }
      ]
    },
    {
      category: "Drawdown Options",
      icon: TrendingUp,
      color: "bg-green-600",
      items: [
        {
          name: "Drawdown Journey",
          icon: TrendingUp,
          description: "Main drawdown planning interface for selecting income options and configuring regular payments.",
          features: [
            "PCLS (Pension Commencement Lump Sum) calculator",
            "Tax-free cash calculation",
            "Regular income setup",
            "Payment frequency selection",
            "Income type selection (Level, Escalating)",
            "Sustainability projection",
            "Tax implications preview",
            "Annual income limits",
            "Drawdown strategy recommendations"
          ]
        },
        {
          name: "Drip Feed Drawdown",
          icon: Calendar,
          description: "Sophisticated drip-feed withdrawal strategy with customizable schedules and automatic rebalancing.",
          features: [
            "Custom withdrawal schedule creation",
            "Frequency options (Monthly, Quarterly, Annual)",
            "Amount per withdrawal configuration",
            "Start and end date selection",
            "Automatic disinvestment",
            "Portfolio rebalancing options",
            "Tax-efficient withdrawal sequencing",
            "Withdrawal history and tracking",
            "Projection modeling",
            "Pause and resume functionality"
          ]
        },
        {
          name: "Regular Income Setup",
          icon: Receipt,
          description: "Configure recurring income payments with flexible frequencies and escalation options.",
          features: [
            "Payment amount configuration",
            "Payment frequency selection",
            "Bank account designation",
            "Payment date selection",
            "Escalation settings",
            "Income review dates",
            "Payment history"
          ]
        },
        {
          name: "Instant Withdrawal",
          icon: Wallet,
          description: "On-demand withdrawal facility for immediate access to pension funds.",
          features: [
            "Immediate withdrawal requests",
            "Amount selection with validation",
            "Available funds checker",
            "Tax calculation on withdrawal",
            "Emergency access provisions",
            "Same-day processing (where available)",
            "Withdrawal confirmation and tracking"
          ]
        }
      ]
    },
    {
      category: "Portfolio Management",
      icon: BarChart3,
      color: "bg-indigo-500",
      items: [
        {
          name: "Investment Overview",
          icon: BarChart3,
          description: "Detailed view of investment allocations, performance, and asset distribution across all schemes.",
          features: [
            "Asset allocation breakdown",
            "Performance charts and metrics",
            "Fund-level detail",
            "Sector analysis",
            "Geographic distribution",
            "Historical performance tracking",
            "Benchmark comparisons"
          ]
        },
        {
          name: "Pension Illustration",
          icon: TrendingUp,
          description: "Interactive projection tool showing potential future values based on various contribution and growth scenarios.",
          features: [
            "Future value projections",
            "Multiple growth rate scenarios",
            "Contribution impact modeling",
            "Retirement age comparison",
            "Income projection at retirement",
            "Graphical timeline visualization",
            "Printable illustration documents"
          ]
        }
      ]
    },
    {
      category: "Reporting & Documents",
      icon: FileText,
      color: "bg-yellow-500",
      items: [
        {
          name: "Annual Summary",
          icon: Calendar,
          description: "Comprehensive yearly statement with performance, contributions, withdrawals, and tax information.",
          features: [
            "Annual performance summary",
            "Total contributions for the year",
            "Withdrawals and income taken",
            "Tax relief received",
            "Charges and fees breakdown",
            "Opening and closing values",
            "Investment allocation changes",
            "Allowance usage tracking",
            "PDF generation for printing"
          ]
        },
        {
          name: "Portfolio Report",
          icon: FileText,
          description: "Detailed printable report with complete portfolio breakdown and performance analysis.",
          features: [
            "Full portfolio valuation",
            "Individual scheme details",
            "Investment holdings list",
            "Performance metrics",
            "Fee breakdown",
            "Transaction history",
            "Print-optimized formatting"
          ]
        }
      ]
    },
    {
      category: "Education & Support",
      icon: BookOpen,
      color: "bg-teal-500",
      items: [
        {
          name: "Learning Centre",
          icon: BookOpen,
          description: "Educational resources covering pension basics, investment concepts, and retirement planning.",
          features: [
            "Pension fundamentals guides",
            "Investment education articles",
            "Tax and allowance explanations",
            "Retirement planning tools",
            "Video tutorials",
            "Glossary of terms",
            "FAQ section",
            "Downloadable guides"
          ]
        }
      ]
    },
    {
      category: "Settings & Preferences",
      icon: Settings,
      color: "bg-gray-500",
      items: [
        {
          name: "User Settings",
          icon: Settings,
          description: "Personal preferences, notification settings, and account management.",
          features: [
            "Personal information updates",
            "Contact details management",
            "Communication preferences",
            "Notification settings",
            "Password change",
            "Two-factor authentication setup",
            "Marketing consent management",
            "Document delivery preferences"
          ]
        }
      ]
    },
    {
      category: "System Demonstration",
      icon: PlayCircle,
      color: "bg-pink-500",
      items: [
        {
          name: "Interactive System Demo",
          icon: PlayCircle,
          description: "Guided walkthrough of the entire system from onboarding to drawdown with pre-populated demo data.",
          features: [
            "Step-by-step journey simulation",
            "Client onboarding demonstration",
            "Contribution examples with sample data",
            "Transfer process walkthrough",
            "Drawdown options showcase",
            "Regular income setup demonstration",
            "Instant withdrawal examples",
            "Progress tracking through demo",
            "Skip and reset functionality",
            "Interactive navigation between stages"
          ]
        }
      ]
    },
    {
      category: "Admin Portal",
      icon: Shield,
      color: "bg-slate-700",
      items: [
        {
          name: "Admin Dashboard",
          icon: Shield,
          description: "Comprehensive administrative interface for managing clients, monitoring system activity, and generating reports.",
          features: [
            "Client management overview",
            "User role management",
            "System activity monitoring",
            "Compliance tracking",
            "Document management",
            "Bulk operations",
            "Reporting and analytics",
            "Audit trail access",
            "System configuration"
          ]
        },
        {
          name: "Adviser View",
          icon: Users,
          description: "Dedicated interface for financial advisers to manage their client portfolios and provide advice.",
          features: [
            "Multi-client dashboard",
            "Client portfolio overview",
            "Advice recording",
            "Document generation",
            "Client communication tools",
            "Review scheduling",
            "Performance reporting"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Print Friendly */}
      <div className="bg-primary text-primary-foreground p-8 print:bg-white print:text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between print:flex-col print:items-start">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Pension Navigator</h1>
                <p className="text-lg opacity-90">Complete System Documentation</p>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleExportWord} variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Export as Word
              </Button>
              <Button onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="documentation-content" className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">System Overview</CardTitle>
            <CardDescription>
              Pension Navigator is a comprehensive pension management platform designed to streamline the entire pension lifecycle
              from client onboarding through to retirement income drawdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Key Benefits
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete client lifecycle management</li>
                  <li>• Automated compliance and KYC/AML verification</li>
                  <li>• Flexible contribution and payment options</li>
                  <li>• Sophisticated drawdown strategies</li>
                  <li>• Real-time portfolio tracking and reporting</li>
                  <li>• Educational resources and client support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Roles
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <Badge variant="outline">Client</Badge> - Full access to personal pension portfolio</li>
                  <li>• <Badge variant="outline">Adviser</Badge> - Multi-client management and advice tools</li>
                  <li>• <Badge variant="outline">Admin</Badge> - System configuration and oversight</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Feature Categories */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold">Features & Functionality</h2>
          
          {features.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <div key={categoryIndex} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div className={`${category.color} p-3 rounded-lg`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.category}</h3>
                </div>

                {/* Category Items */}
                <div className="grid gap-6 ml-12">
                  {category.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    return (
                      <Card key={itemIndex} className="break-inside-avoid">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ItemIcon className="w-5 h-5" />
                            {item.name}
                          </CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-semibold mb-3 text-sm">Key Features:</h4>
                          <ul className="space-y-2">
                            {item.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Security</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• End-to-end encryption</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Role-based access control</li>
                  <li>• Audit trail logging</li>
                  <li>• PCI DSS compliant payments</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Compliance</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• FCA regulated processes</li>
                  <li>• KYC/AML verification</li>
                  <li>• GDPR compliant</li>
                  <li>• Automated reporting</li>
                  <li>• Document retention policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Integration</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Real-time data updates</li>
                  <li>• API connectivity</li>
                  <li>• Third-party integrations</li>
                  <li>• Document management system</li>
                  <li>• Payment gateway integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm pt-8 border-t">
          <p>© 2024 Pension Navigator. All rights reserved.</p>
          <p className="mt-2">This documentation is current as of {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:flex-col {
            flex-direction: column !important;
          }
          .print\\:items-start {
            align-items: flex-start !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemDocumentation;