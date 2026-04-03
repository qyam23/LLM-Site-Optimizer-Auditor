export type VerificationStatus = 'VERIFIED' | 'LIKELY' | 'UNCERTAIN' | 'FAILED_TO_VERIFY';

export interface ResourceCheck {
  url: string;
  status: number;
  finalUrl: string;
  contentType: string;
  result: 'FOUND' | 'NOT_FOUND' | 'ERROR';
  trustLevel: VerificationStatus;
  evidenceSnippet?: string;
  timestamp: string;
}

export interface FindingEvidence {
  title: string;
  status: VerificationStatus;
  details: string;
  isStrength?: boolean;
  evidence: {
    url?: string;
    statusCode?: number;
    contentType?: string;
    timestamp: string;
    additionalData?: any;
  };
}

export interface PageDiagnostics {
  htmlLength: number;
  textLength: number;
  anchorsFound: number;
  anchorsParsed: number;
  internalLinksFound: number;
  externalLinksFound: number;
  headingsFoundCount: number;
  parseSuccess: boolean;
  parseNotes: string;
  parseMethodUsed: 'static' | 'container_fallback' | 'playwright_render' | 'failed';
  parseAttempts: string[];
  renderType: 'static' | 'rendered' | 'unknown';
  parseFailureReason?: string;
  playwrightAvailable: boolean;
  playwrightImportError?: string;
  playwrightLaunchError?: string;
  playwrightUsed: boolean;
  playwrightPythonImportOk?: boolean;
  playwrightBrowserLaunchOk?: boolean;
  pythonExecutablePath?: string;
  renderedHtmlLength?: number;
  renderedTextLength?: number;
  renderedAnchorsCount?: number;
}

export interface ToolStatus {
  status: 'OK' | 'FAILED' | 'SKIPPED' | 'NOT_AVAILABLE';
  reason?: string;
  error?: string;
}

export interface PageResult {
  url: string;
  status: number;
  contentType: string;
  title: string;
  h1: string[];
  h2: string[];
  h3: string[];
  metaDescription: string;
  canonical: string;
  robots: string;
  rawInternalLinksCount: number;
  uniqueInternalLinksCount: number;
  externalLinksCount: number;
  uniqueInternalLinks: string[];
  wordCount: number;
  pageType: 'docs' | 'knowledge' | 'landing' | 'blog' | 'utility' | 'unknown';
  score: number;
  issues: string[];
  trustLevel: VerificationStatus;
  diagnostics: PageDiagnostics;
}

export interface RepoResult {
  detectedStack: string;
  filesFound: {
    path: string;
    exists: boolean;
    trustLevel: VerificationStatus;
    evidence?: string;
  }[];
  gaps: string[];
}

export interface AuditResult {
  websiteUrl: string;
  repoUrl?: string;
  timestamp: string;
  overallScore: number;
  aiReadinessScore: number;
  seoScore: number;
  repoAlignmentScore: number;
  contentClarityScore: number;
  reliability: {
    verifiedCount: number;
    likelyCount: number;
    uncertainCount: number;
    failedCount: number;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    warnings?: string[];
  };
  metrics: {
    totalRawInternalLinks: number;
    totalUniqueInternalLinks: number;
    crawledPagesCount: number;
  };
  resourceChecks: ResourceCheck[];
  pages: PageResult[];
  findings: FindingEvidence[];
  recommendations: {
    doNow: string[];
    doNext: string[];
    later: string[];
  };
  repo?: RepoResult;
  toolStatus: {
    staticParser: ToolStatus;
    containerFallback: ToolStatus;
    playwrightImport: ToolStatus;
    playwrightLaunch: ToolStatus;
    playwrightRender: ToolStatus;
    repositoryInspection: ToolStatus;
    resourceVerification: ToolStatus;
  };
  consistencyChecks: {
    repoUiVsJsonConsistent: boolean;
    reportVsJsonConsistent: boolean;
    pageMetricsConsistent: boolean;
  };
}

export interface AuditOptions {
  websiteUrl: string;
  repoUrl?: string;
  branch?: string;
  maxDepth: number;
  onlyDocs: boolean;
  includeSitemap: boolean;
  includeLlmsTxt: boolean;
  includeSemantic: boolean;
}
