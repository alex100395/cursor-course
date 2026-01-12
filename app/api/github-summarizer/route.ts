import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../validate-key/store';
import { generateSummary } from './chain';

// Helper function to extract API key from request headers
function extractApiKey(request: NextRequest): string | null {
  const apiKeyHeader = request.headers.get('x-api-key');
  return apiKeyHeader;
}

// Helper function to parse GitHub URL and extract owner and repo
function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '').replace(/\.git$/, '');
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
      /git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, ''),
          branch: match[3] || 'main',
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

// Function to get README.md content from GitHub repository
async function getGitHubReadme(githubUrl: string): Promise<{ content: string; error?: string }> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    
    if (!parsed) {
      return {
        content: '',
        error: 'Invalid GitHub URL format. Please provide a valid GitHub repository URL.',
      };
    }

    const { owner, repo, branch } = parsed;

    // Try GitHub API first
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-README-Fetcher',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content };
      }
    } catch (apiError) {
      console.log('GitHub API failed, trying raw URL...', apiError);
    }

    // Fallback: Try raw.githubusercontent.com
    const branchesToTry = [branch || 'main', 'master'];
    const uniqueBranches = [...new Set(branchesToTry)];
    
    for (const branchName of uniqueBranches) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}/README.md`;
        const response = await fetch(rawUrl, {
          headers: { 'User-Agent': 'GitHub-README-Fetcher' },
        });

        if (response.ok) {
          const content = await response.text();
          return { content };
        }
      } catch (rawError) {
        continue;
      }
    }

    return {
      content: '',
      error: `Could not find README.md in repository ${owner}/${repo}. The repository might not exist, be private, or not have a README.md file.`,
    };
  } catch (error) {
    console.error('Error fetching GitHub README:', error);
    return {
      content: '',
      error: `Failed to fetch README.md: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// POST - GitHub Summarizer endpoint with API key validation
export async function POST(request: NextRequest) {
  try {
    // Extract API key from headers
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please provide it in the X-API-Key header.' },
        { status: 401 }
      );
    }

    // Validate API key
    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // API key is valid, process the request
    const body = await request.json();
    const { githubUrl } = body;

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'githubUrl is required in the request body' },
        { status: 400 }
      );
    }

    // Get README.md content from GitHub
    const readmeResult = await getGitHubReadme(githubUrl);

    if (readmeResult.error) {
      return NextResponse.json(
        { error: readmeResult.error },
        { status: 404 }
      );
    }

    // Generate summary using LangChain
    const summaryResult = await generateSummary(readmeResult.content);

    return NextResponse.json({
      message: 'GitHub repository summarized successfully',
      githubUrl,
      summary: summaryResult.summary,
      cool_facts: summaryResult.cool_facts,
    });
  } catch (error) {
    console.error('Error in github-summarizer endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - GitHub Summarizer endpoint with API key validation
export async function GET(request: NextRequest) {
  try {
    // Extract API key from headers
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please provide it in the X-API-Key header.' },
        { status: 401 }
      );
    }

    // Validate API key
    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // API key is valid, process the request
    const { searchParams } = new URL(request.url);
    const githubUrl = searchParams.get('githubUrl');

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'githubUrl is required as a query parameter (e.g., ?githubUrl=https://github.com/owner/repo)' },
        { status: 400 }
      );
    }

    // Get README.md content from GitHub
    const readmeResult = await getGitHubReadme(githubUrl);

    if (readmeResult.error) {
      return NextResponse.json(
        { error: readmeResult.error },
        { status: 404 }
      );
    }

    // Generate summary using LangChain
    const summaryResult = await generateSummary(readmeResult.content);

    return NextResponse.json({
      message: 'GitHub repository summarized successfully',
      githubUrl,
      summary: summaryResult.summary,
      cool_facts: summaryResult.cool_facts,
    });
  } catch (error) {
    console.error('Error in github-summarizer endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}