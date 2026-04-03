import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Github, 
  Search, 
  FileText, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Settings, 
  Layers, 
  Terminal,
  ExternalLink,
  Loader2,
  ChevronRight,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AuditOptions, AuditResult, PageResult } from './types';
import { generateMarkdownReport } from './reportGenerator';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [options, setOptions] = useState<AuditOptions>({
    websiteUrl: '',
    repoUrl: '',
    branch: 'main',
    maxDepth: 2,
    onlyDocs: false,
    includeSitemap: true,
    includeLlmsTxt: true,
    includeSemantic: true,
  });

  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'seo' | 'ai' | 'repo' | 'verification' | 'diagnostics' | 'actions'>('pages');
  const [showReport, setShowReport] = useState(false);

  const startAudit = async () => {
    if (!options.websiteUrl) return;
    
    setIsAuditing(true);
    setResult(null);
    setProgress(0);
    setLogs(['Initializing audit...', `Target: ${options.websiteUrl}`]);

    try {
      // Simulate progress for UX
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      clearInterval(interval);
      
      if (!response.ok) throw new Error('Audit failed');
      
      const data = await response.json();
      setResult(data);
      setProgress(100);
      setLogs(prev => [...prev, 'Audit complete!', `Scanned ${data.pages.length} pages.`]);
    } catch (error: any) {
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setIsAuditing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const report = generateMarkdownReport(result);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_report.md';
    a.click();
  };

  const downloadCsv = () => {
    if (!result) return;
    const headers = ['URL', 'Status', 'Title', 'Score', 'Word Count', 'Type', 'Raw Links', 'Unique Links', 'HTML Len', 'Text Len', 'Anchors Found', 'Parse Success', 'Method', 'Render Type', 'Issues'];
    const rows = result.pages.map(p => [
      p.url,
      p.status,
      `"${p.title.replace(/"/g, '""')}"`,
      p.score,
      p.wordCount,
      p.pageType,
      p.rawInternalLinksCount,
      p.uniqueInternalLinksCount,
      p.diagnostics.htmlLength,
      p.diagnostics.textLength,
      p.diagnostics.anchorsFound,
      p.diagnostics.parseSuccess,
      p.diagnostics.parseMethodUsed,
      p.diagnostics.renderType,
      `"${p.issues.join(', ').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pages_report.csv';
    a.click();
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">LLM Site Optimizer Auditor</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Professional AI Readiness Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-400">System Ready</span>
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Panel: Inputs */}
        <div className="col-span-3 space-y-6">
          <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-6">
            <div className="flex items-center gap-2 text-white font-medium">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Target Configuration</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-medium">Website URL</label>
                <input 
                  type="text"
                  placeholder="https://example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                  value={options.websiteUrl}
                  onChange={e => setOptions({...options, websiteUrl: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-medium">GitHub Repository (Optional)</label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text"
                    placeholder="owner/repo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                    value={options.repoUrl}
                    onChange={e => setOptions({...options, repoUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Crawl Depth</span>
                <span className="text-xs font-mono text-blue-400">{options.maxDepth}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                value={options.maxDepth}
                onChange={e => setOptions({...options, maxDepth: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-3">
              {[
                { id: 'onlyDocs', label: 'Only scan /docs/' },
                { id: 'includeSitemap', label: 'Include sitemap scan' },
                { id: 'includeLlmsTxt', label: 'Check llms.txt' },
                { id: 'includeSemantic', label: 'Semantic scoring' },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={(options as any)[opt.id]}
                      onChange={e => setOptions({...options, [opt.id]: e.target.checked})}
                    />
                    <div className="w-4 h-4 border border-white/20 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all" />
                    <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={startAudit}
              disabled={isAuditing || !options.websiteUrl}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                isAuditing 
                  ? "bg-blue-500/10 text-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              )}
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Audit
                </>
              )}
            </button>
          </section>
        </div>

        {/* Center Panel: Progress & Logs */}
        <div className="col-span-6 space-y-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white font-medium">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Audit Execution</span>
              </div>
              {isAuditing && (
                <div className="text-xs text-blue-400 font-mono animate-pulse">
                  SCANNING...
                </div>
              )}
            </div>

            <div className="flex-1 bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-xs space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={cn(
                    log.startsWith('Error') ? "text-red-400" : 
                    log.startsWith('Audit complete') ? "text-green-400" : "text-gray-400"
                  )}>
                    {log}
                  </span>
                </div>
              ))}
              {isAuditing && (
                <div className="flex gap-3 animate-pulse">
                  <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="text-blue-400">Processing next node...</span>
                </div>
              )}
            </div>

            {isAuditing && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
            )}

            {!isAuditing && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium">System Idle</p>
                  <p className="text-xs">Configure target and start audit to begin</p>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Audit Report Ready</p>
                    <p className="text-xs text-gray-500">Generated {result.pages.length} page analyses</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowReport(true)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    View Report
                  </button>
                  <div className="flex bg-blue-600 rounded-lg overflow-hidden shadow-lg shadow-blue-600/20">
                    <button 
                      onClick={downloadReport}
                      className="px-4 py-2 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-2 border-r border-blue-400/30"
                      title="Download Markdown Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      MD
                    </button>
                    <button 
                      onClick={downloadCsv}
                      className="px-3 py-2 hover:bg-blue-500 text-white text-xs font-medium transition-colors border-r border-blue-400/30"
                      title="Download CSV Report"
                    >
                      CSV
                    </button>
                    <button 
                      onClick={downloadJson}
                      className="px-3 py-2 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                      title="Download JSON Summary"
                    >
                      JSON
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Summary */}
        <div className="col-span-3 space-y-6">
          <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-6">
            <div className="flex items-center gap-2 text-white font-medium">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Score Summary</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Overall', value: result?.overallScore || 0, color: 'text-blue-400' },
                { label: 'AI Readiness', value: result?.aiReadinessScore || 0, color: 'text-indigo-400' },
                { label: 'SEO Tech', value: result?.seoScore || 0, color: 'text-emerald-400' },
                { label: 'Reliability', value: result?.reliability.confidenceLevel || 'N/A', color: result?.reliability.confidenceLevel === 'HIGH' ? 'text-emerald-400' : 'text-amber-400' },
              ].map(score => (
                <div key={score.label} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{score.label}</p>
                  <p className={cn("text-2xl font-bold", score.color)}>{score.value}%</p>
                </div>
              ))}
            </div>

            {result && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Site Metrics</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500">Crawled Pages</span>
                    <span className="text-[10px] font-mono text-white">{result.metrics.crawledPagesCount}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500">Raw Internal Links</span>
                    <span className="text-[10px] font-mono text-white">{result.metrics.totalRawInternalLinks}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-500">Unique Internal URLs</span>
                    <span className="text-[10px] font-mono text-white">{result.metrics.totalUniqueInternalLinks}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Recommendations</span>
              </div>
              <div className="space-y-2">
                {(result?.recommendations.doNow.slice(0, 3) || [
                  "Enter a URL to see recommendations",
                  "Audit will prioritize AI-readiness gaps",
                  "Check for llms.txt presence"
                ]).map((rec, i) => (
                  <div key={i} className="flex gap-3 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg group hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1">
                      <ArrowRight className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Panel: Details */}
        <div className="col-span-12">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/5 bg-black/20">
              {[
                { id: 'pages', label: 'Pages', icon: Globe },
                { id: 'seo', label: 'SEO Analysis', icon: Search },
                { id: 'ai', label: 'AI Readiness', icon: Layers },
                { id: 'repo', label: 'Repo Insights', icon: Github },
                { id: 'verification', label: 'Verification', icon: CheckCircle2 },
                { id: 'diagnostics', label: 'Diagnostics', icon: Terminal },
                { id: 'actions', label: 'Action Plan', icon: CheckCircle2 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-4 text-xs font-medium flex items-center gap-2 transition-all relative",
                    activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-blue-400" : "")} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 min-h-[300px]">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full py-12 opacity-20">
                  <BarChart3 className="w-12 h-12 mb-4" />
                  <p className="text-sm">No audit data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeTab === 'pages' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-gray-500 border-b border-white/5">
                            <th className="pb-4 font-medium">Page URL</th>
                            <th className="pb-4 font-medium">Type</th>
                            <th className="pb-4 font-medium">Score</th>
                            <th className="pb-4 font-medium">Links (Raw/Unique)</th>
                            <th className="pb-4 font-medium">Issues</th>
                            <th className="pb-4 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.pages.map((page, i) => (
                            <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 font-mono text-xs text-blue-400 truncate max-w-md">{page.url}</td>
                              <td className="py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  page.pageType === 'docs' ? "bg-indigo-500/10 text-indigo-400" : "bg-gray-500/10 text-gray-400"
                                )}>
                                  {page.pageType}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${page.score}%` }} />
                                  </div>
                                  <span className="text-xs font-medium">{page.score}%</span>
                                </div>
                              </td>
                              <td className="py-4 font-mono text-[10px] text-gray-400">
                                {page.rawInternalLinksCount} / {page.uniqueInternalLinksCount}
                              </td>
                              <td className="py-4">
                                <span className="text-xs text-gray-500">{page.issues.length} detected</span>
                              </td>
                              <td className="py-4 text-right">
                                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Search className="w-4 h-4 text-emerald-400" />
                          Technical SEO Health
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: 'Meta Descriptions', status: result.pages.every(p => p.metaDescription) ? 'Pass' : 'Warning' },
                            { label: 'Title Tags', status: result.pages.every(p => p.title) ? 'Pass' : 'Warning' },
                            { label: 'H1 Consistency', status: result.pages.every(p => p.h1.length === 1) ? 'Pass' : 'Fail' },
                            { label: 'Robots.txt', status: 'Detected' },
                            { label: 'Sitemap.xml', status: 'Detected' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-xs text-gray-400">{item.label}</span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                item.status === 'Pass' || item.status === 'Detected' ? "bg-emerald-500/10 text-emerald-400" : 
                                item.status === 'Warning' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                              )}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-white mb-4">SEO Summary</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          The technical SEO structure is generally sound, but there are opportunities to improve meta-data consistency across sub-pages. 
                          Ensuring every page has a unique H1 and descriptive meta-tag will improve both search engine rankings and LLM context extraction.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'verification' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          Resource Verification Status
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Verified: {result.reliability.verifiedCount}
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Likely: {result.reliability.likelyCount}
                          </div>
                          <div className="flex items-center gap-1.5 text-red-400">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Failed: {result.reliability.failedCount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {result.resourceChecks.map((check, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                check.result === 'FOUND' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                              )}>
                                {check.result === 'FOUND' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-xs font-mono text-gray-300">{check.url.replace(options.websiteUrl, '') || '/'}</p>
                                <p className="text-[10px] text-gray-500">{check.contentType} • Status: {check.status}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                check.trustLevel === 'VERIFIED' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                              )}>
                                {check.trustLevel}
                              </span>
                              {check.evidenceSnippet && (
                                <button 
                                  onClick={() => alert(`Evidence Snippet:\n${check.evidenceSnippet}`)}
                                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-400 transition-all"
                                  title="View Evidence"
                                >
                                  <Terminal className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ai' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { title: 'llms.txt', status: result.resourceChecks.find(c => c.url.endsWith('llms.txt'))?.result === 'FOUND', desc: 'Machine-readable site summary for LLMs.' },
                          { title: 'Semantic HTML', status: result.contentClarityScore > 70, desc: 'Use of main, article, and section tags.' },
                          { title: 'Markdown Support', status: true, desc: 'Content is easily convertible to clean markdown.' },
                        ].map(item => (
                          <div key={item.title} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-white">{item.title}</h4>
                              {item.status ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          Verified Strengths
                        </h3>
                        <div className="space-y-4">
                          {result.findings.filter(f => f.isStrength).map((finding, i) => (
                            <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white">{finding.title}</h4>
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                  {finding.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{finding.details}</p>
                            </div>
                          ))}
                          {result.findings.filter(f => f.isStrength).length === 0 && (
                            <p className="text-xs text-gray-600 italic">No verified strengths detected yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          Verified Problems
                        </h3>
                        <div className="space-y-4">
                          {result.findings.filter(f => !f.isStrength).map((finding, i) => (
                            <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white">{finding.title}</h4>
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                                  {finding.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{finding.details}</p>
                              {finding.evidence.url && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                                  <ExternalLink className="w-3 h-3" />
                                  {finding.evidence.url} (Status: {finding.evidence.statusCode})
                                </div>
                              )}
                            </div>
                          ))}
                          {result.findings.filter(f => !f.isStrength).length === 0 && (
                            <p className="text-xs text-gray-600 italic">No verified problems detected.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'repo' && (
                    <div className="space-y-6">
                      {result.repo ? (
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                              <FileCode className="w-5 h-5 text-blue-400" />
                              <div>
                                <p className="text-xs text-gray-500">Detected Stack</p>
                                <p className="text-sm font-medium text-white">{result.repo.detectedStack}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                              <p className="text-xs font-medium text-gray-400">Repository Files</p>
                              <div className="grid grid-cols-1 gap-2">
                                {result.repo.filesFound.map((file, i) => (
                                  <div key={i} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", file.exists ? "bg-emerald-500" : "bg-red-500")} />
                                      <span className="text-gray-400 font-mono">{file.path}</span>
                                    </div>
                                    <span className="text-gray-600 italic">{file.trustLevel}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                              <p className="text-xs font-medium text-gray-400">Detected Gaps</p>
                              {result.repo.gaps.map((gap, i) => (
                                <div key={i} className="flex gap-2 text-xs text-amber-400/80">
                                  <span>•</span>
                                  <span>{gap}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Repository Files</h3>
                            <div className="space-y-2 font-mono text-xs text-gray-500">
                              {result.repo.filesFound.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <ChevronRight className="w-3 h-3" />
                                  {item.path} {item.exists ? '(Found)' : '(Missing)'}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                          <Github className="w-12 h-12 mb-4" />
                          <p className="text-sm">No repository linked for analysis</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'diagnostics' && (
                    <div className="space-y-6">
                      {/* Tool Status Grid */}
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(result.toolStatus || {}).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                                value.status === 'OK' ? "bg-emerald-500/10 text-emerald-400" :
                                value.status === 'FAILED' ? "bg-red-500/10 text-red-400" :
                                "bg-gray-500/10 text-gray-400"
                              )}>
                                {value.status}
                              </span>
                            </div>
                            {value.error && (
                              <p className="text-[10px] text-red-400/70 font-mono truncate" title={value.error}>
                                {value.error}
                              </p>
                            )}
                            {value.reason && (
                              <p className="text-[10px] text-gray-500 italic">
                                {value.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-gray-500 border-b border-white/5">
                              <th className="p-4 font-medium text-xs">Page URL</th>
                              <th className="p-4 font-medium text-xs">HTML Len</th>
                              <th className="p-4 font-medium text-xs">Text Len</th>
                              <th className="p-4 font-medium text-xs">Anchors</th>
                              <th className="p-4 font-medium text-xs">Words</th>
                              <th className="p-4 font-medium text-xs">Method</th>
                              <th className="p-4 font-medium text-xs">Render</th>
                              <th className="p-4 font-medium text-xs">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {result.pages.map((page, i) => (
                              <tr key={i} className="text-[11px]">
                                <td className="p-4 font-mono text-blue-400 truncate max-w-[200px]">{page.url}</td>
                                <td className="p-4 text-gray-400">
                                  {page.diagnostics.htmlLength}
                                  {page.diagnostics.renderedHtmlLength && (
                                    <span className="text-purple-400 ml-1">→ {page.diagnostics.renderedHtmlLength}</span>
                                  )}
                                </td>
                                <td className="p-4 text-gray-400">
                                  {page.diagnostics.textLength}
                                  {page.diagnostics.renderedTextLength && (
                                    <span className="text-purple-400 ml-1">→ {page.diagnostics.renderedTextLength}</span>
                                  )}
                                </td>
                                <td className="p-4 text-gray-400">
                                  {page.diagnostics.anchorsFound}
                                  {page.diagnostics.renderedAnchorsCount && (
                                    <span className="text-purple-400 ml-1">→ {page.diagnostics.renderedAnchorsCount}</span>
                                  )}
                                </td>
                                <td className="p-4 text-gray-400">{page.wordCount}</td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[9px] font-mono">
                                    {page.diagnostics.parseMethodUsed}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-bold",
                                    page.diagnostics.playwrightUsed ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                  )}>
                                    {page.diagnostics.playwrightUsed ? "RENDERED" : "STATIC"}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold",
                                    page.diagnostics.parseSuccess ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                  )}>
                                    {page.diagnostics.parseSuccess ? "SUCCESS" : "FAILED"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { title: 'Do Now', items: result.recommendations.doNow, color: 'text-red-400' },
                        { title: 'Do Next', items: result.recommendations.doNext, color: 'text-blue-400' },
                        { title: 'Later', items: result.recommendations.later, color: 'text-gray-400' },
                      ].map(group => (
                        <div key={group.title} className="space-y-4">
                          <h4 className={cn("text-xs font-bold uppercase tracking-widest", group.color)}>{group.title}</h4>
                          <div className="space-y-2">
                            {group.items.map((item, i) => (
                              <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-gray-400 leading-relaxed">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-white/10 w-full max-w-4xl max-h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Audit Report Preview</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={downloadReport}
                    className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Markdown
                  </button>
                  <button 
                    onClick={() => setShowReport(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <AlertCircle className="w-5 h-5 text-gray-500 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 prose prose-invert prose-blue max-w-none custom-scrollbar">
                <ReactMarkdown>{generateMarkdownReport(result)}</ReactMarkdown>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="h-12 border-t border-white/5 flex items-center justify-between px-8 text-[10px] text-gray-600 uppercase tracking-widest font-medium">
        <div>LLM Site Optimizer Auditor v1.0.0</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <div className="flex items-center gap-1.5 text-emerald-500/60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
