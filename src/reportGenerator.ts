import { AuditResult } from './types';

export function generateMarkdownReport(result: AuditResult): string {
  const { websiteUrl, repoUrl, timestamp, overallScore, aiReadinessScore, seoScore, repoAlignmentScore, contentClarityScore, pages, findings, recommendations, repo, reliability, resourceChecks, metrics } = result;

  const verifiedStrengths = findings.filter(f => f.status === 'VERIFIED' && f.isStrength);
  const verifiedProblems = findings.filter(f => f.status === 'VERIFIED' && !f.isStrength);

  return `# LLM Site Optimizer Audit Report (v2.1)

## 1. Audit Scope
- **Website URL:** ${websiteUrl}
- **Repository URL:** ${repoUrl || "Not provided"}
- **Date/Time:** ${new Date(timestamp).toLocaleString()}
- **Scan Mode:** Deep Verification
- **Crawl Depth:** ${pages.length} pages analyzed
- **Total URLs Checked:** ${pages.length + resourceChecks.length}

## 2. Executive Summary
The audit for **${websiteUrl}** shows an overall score of **${overallScore}/100**. 
The scan quality is rated as **${reliability.confidenceLevel}**.

- **Strongest Areas:** ${aiReadinessScore > seoScore ? "AI Discoverability" : "Technical SEO"}
- **Weakest Areas:** ${aiReadinessScore < seoScore ? "AI Discoverability" : "Technical SEO"}
- **Reliability:** ${reliability.confidenceLevel === 'HIGH' ? "This report is considered highly reliable based on direct verification of key resources." : "This report has limitations and should be reviewed carefully."}

## 3. Scan Coverage & Metrics
- **Crawled Pages:** ${metrics.crawledPagesCount}
- **Raw Internal Links Found:** ${metrics.totalRawInternalLinks}
- **Unique Internal URLs Found:** ${metrics.totalUniqueInternalLinks}

### Scan Coverage Limitations
${reliability.warnings?.map(w => `- ⚠️ **Warning:** ${w}`).join('\n') || "- No major coverage limitations detected."}

## 4. Parser Diagnostics
| Page URL | HTML Len | Text Len | Anchors | Parsed | Word Count | Success | Method | Render |
|----------|----------|----------|---------|--------|------------|---------|--------|--------|
${pages.slice(0, 10).map(p => `| ${p.url.replace(websiteUrl, '') || '/'} | ${p.diagnostics.htmlLength} | ${p.diagnostics.textLength} | ${p.diagnostics.anchorsFound} | ${p.diagnostics.anchorsParsed} | ${p.wordCount} | ${p.diagnostics.parseSuccess ? "✅" : "❌"} | ${p.diagnostics.parseMethodUsed} | ${p.diagnostics.renderType} |`).join('\n')}

### 🛠️ Playwright Integration Status
- **Available:** ${pages[0]?.diagnostics.playwrightAvailable ? "✅ Yes" : "❌ No"}
- **Used in this audit:** ${pages.some(p => p.diagnostics.playwrightUsed) ? "✅ Yes" : "❌ No"}
${pages[0]?.diagnostics.playwrightImportError ? `- **Import Error:** \`${pages[0].diagnostics.playwrightImportError}\`` : ""}
${pages[0]?.diagnostics.playwrightLaunchError ? `- **Launch Error:** \`${pages[0].diagnostics.playwrightLaunchError}\`` : ""}

${pages.some(p => p.diagnostics.playwrightUsed) ? "### ℹ️ Rendered DOM Parsing Used\nSome pages required rendered DOM parsing via Playwright because static parsing was insufficient to extract meaningful content." : ""}

## 5. Consistency Check
- **UI vs JSON Consistency:** ${result.consistencyChecks.repoUiVsJsonConsistent ? "✅ Synchronized" : "❌ Mismatch Detected"}
- **Report vs JSON Consistency:** ${result.consistencyChecks.reportVsJsonConsistent ? "✅ Synchronized" : "❌ Mismatch Detected"}
- **Page Metrics Consistency:** ${result.consistencyChecks.pageMetricsConsistent ? "✅ Verified" : "⚠️ Potential Inconsistencies"}

## 6. Scores
- **Overall Score:** ${overallScore}%
- **AI Readiness Score:** ${aiReadinessScore}% (Measures machine-readability and discoverability)
- **SEO Technical Score:** ${seoScore}% (Measures metadata and hierarchy)
- **Repository Alignment Score:** ${repoAlignmentScore}% (Measures repo-to-live consistency)
- **Content Clarity Score:** ${contentClarityScore}% (Measures semantic structure)

## 7. Verified Strengths
${verifiedStrengths.map(f => `- **${f.title}**: ${f.details}\n  - Evidence: ${f.evidence.url ? `URL ${f.evidence.url} returned ${f.evidence.statusCode}` : "Direct analysis"}`).join('\n') || "None detected."}

## 8. Verified Problems
${verifiedProblems.map(f => `- **${f.title}**: ${f.details}\n  - Evidence: ${f.evidence.url ? `URL ${f.evidence.url} returned ${f.evidence.statusCode}` : "Direct analysis"}`).join('\n') || "None detected."}

## 9. Explicit Resource Verification
| Resource | Status | Result | Trust Level | Evidence |
|----------|--------|--------|-------------|----------|
${resourceChecks.map(c => `| ${c.url.replace(websiteUrl, '') || '/'} | ${c.status} | ${c.result} | ${c.trustLevel} | ${c.status === 200 ? "Directly verified" : "Failed to locate"} |`).join('\n')}

## 10. AI / LLM Discoverability Findings
${aiReadinessScore > 70 ? "✅ The site shows strong signals for AI discoverability." : "⚠️ The site lacks key AI discoverability markers."}
- llms.txt: ${resourceChecks.find(c => c.url.endsWith('llms.txt'))?.result === 'FOUND' ? "Verified Present" : "Verified Missing"}
- Documentation Structure: ${pages.some(p => p.pageType === 'docs') || resourceChecks.some(c => c.url.includes('/docs/') && c.result === 'FOUND') ? "Detected" : "Not found"}

## 11. Repository Findings
${repo ? `
- **Detected Stack:** ${repo.detectedStack}
- **Verification:** ${repo.filesFound.filter(f => f.exists).length} key files verified in repository.
- **Files Checked:**
${repo.filesFound.map(f => `  - ${f.path}: ${f.exists ? "✅ Found" : "❌ Missing"} (${f.evidence})`).join('\n')}
- **Gaps:** ${repo.gaps.join(', ')}
` : "No repository provided."}

## 12. Page-by-Page Highlights
${pages.slice(0, 5).map(p => `
### ${p.title || p.url}
- **URL:** ${p.url}
- **Type:** ${p.pageType}
- **Raw Internal Links:** ${p.rawInternalLinksCount}
- **Unique Internal Links:** ${p.uniqueInternalLinksCount}
- **Score:** ${p.score}/100
- **Trust Level:** ${p.trustLevel}
`).join('\n')}

## 13. Prioritized Actions
### Do now
${recommendations.doNow.map(r => `- ${r}`).join('\n')}

### Do next
${recommendations.doNext.map(r => `- ${r}`).join('\n')}

### Later
${recommendations.later.map(r => `- ${r}`).join('\n')}

## 14. Suggested Next Prompt
\`\`\`text
I have audited ${websiteUrl} for AI optimization. 
Verified issues: ${verifiedProblems.map(f => f.title).join(', ')}.
Please help me implement: ${recommendations.doNow.join(', ')}.
\`\`\`
`;
}
