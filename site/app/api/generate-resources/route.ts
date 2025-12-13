import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { checkAndIncrementUsage } from '@/lib/token-usage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Serper API helper for Google search with retry
const serperSearch = async (query: string, retries = 2): Promise<{ organic: Array<{ title: string; link: string; snippet?: string }> }> => {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    console.log('[Serper] No API key found');
    throw new Error('Serper API key not configured');
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, num: 20 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Serper] API error:', response.status, errorText);
        throw new Error(`Serper API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const isNetworkError = error instanceof Error && 
        (error.message.includes('fetch failed') || 
         error.message.includes('ENOTFOUND') ||
         error.cause?.toString().includes('ENOTFOUND'));
      
      if (isNetworkError && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Serper search failed after retries');
}

// YouTube Data API helper
interface YouTubeVideoDetails {
  videoId: string
  title: string
  channelName: string
  thumbnail: string
  viewCount: number
  duration: string
  publishedAt: string
  description: string
}

async function fetchYouTubeVideoDetails(videoIds: string[]): Promise<Map<string, YouTubeVideoDetails>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const results = new Map<string, YouTubeVideoDetails>();
  
  if (!apiKey || videoIds.length === 0) {
    return results;
  }
  
  try {
    const batchSize = 50;
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      const idsParam = batch.join(',');
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${idsParam}&key=${apiKey}`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.items) {
        for (const item of data.items) {
          results.set(item.id, {
            videoId: item.id,
            title: item.snippet?.title || '',
            channelName: item.snippet?.channelTitle || '',
            thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
            viewCount: parseInt(item.statistics?.viewCount || '0'),
            duration: item.contentDetails?.duration || '',
            publishedAt: item.snippet?.publishedAt || '',
            description: item.snippet?.description?.substring(0, 200) || '',
          });
        }
      }
    }
  } catch (error) {
    console.error('[YouTube API] Failed to fetch video details:', error);
  }
  
  return results;
}

async function searchYouTubeVideos(query: string, maxResults = 6): Promise<YouTubeVideoDetails[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) return [];
  
  try {
    const searchCount = Math.min(maxResults * 3, 25);
    
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${searchCount}&order=relevance&relevanceLanguage=en&key=${apiKey}`
    );
    
    if (!searchResponse.ok) return [];
    
    const searchData = await searchResponse.json();
    const videoIds = searchData.items?.map((item: { id?: { videoId?: string } }) => item.id?.videoId).filter(Boolean) || [];
    
    if (videoIds.length === 0) return [];
    
    const detailsMap = await fetchYouTubeVideoDetails(videoIds);
    
    let videos = videoIds
      .map((id: string) => detailsMap.get(id))
      .filter((v: YouTubeVideoDetails | undefined): v is YouTubeVideoDetails => v !== undefined);
    
    const MIN_VIEWS = 1000;
    const qualityVideos = videos.filter(v => v.viewCount >= MIN_VIEWS);
    
    if (qualityVideos.length >= maxResults) {
      videos = qualityVideos;
    } else if (qualityVideos.length > 0) {
      const remainingVideos = videos.filter(v => v.viewCount < MIN_VIEWS);
      videos = [...qualityVideos, ...remainingVideos];
    }
    
    videos.sort((a, b) => b.viewCount - a.viewCount);
    
    return videos.slice(0, maxResults);
  } catch (error) {
    console.error('[YouTube API] Search failed:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { documentId, topic, content, rootTitle } = await req.json()

    if (!documentId || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check limits
    await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

    // Check if resources already exist
    const { data: existing } = await supabase
      .from('resources')
      .select('*')
      .eq('document_id', documentId)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        resources: existing[0].data,
        isExisting: true
      })
    }

    // Fetch YouTube videos
    interface EnrichedYouTubeVideo {
      title: string;
      url: string;
      channelName: string;
      videoId?: string;
      thumbnail?: string;
      viewCount?: number;
      duration?: string;
      publishedAt?: string;
      description?: string;
    }

    let youtubeVideos: EnrichedYouTubeVideo[] = [];
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    
    if (youtubeApiKey) {
      const searchQuery = rootTitle && rootTitle !== topic 
        ? `${rootTitle} ${topic}` 
        : `${topic}`;
      const youtubeResults = await searchYouTubeVideos(searchQuery, 6);
      
      if (youtubeResults.length > 0) {
        youtubeVideos = youtubeResults.map(v => ({
          title: v.title,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          channelName: v.channelName,
          videoId: v.videoId,
          thumbnail: v.thumbnail,
          viewCount: v.viewCount,
          duration: v.duration,
          publishedAt: v.publishedAt,
          description: v.description,
        }));
      }
    }

    // Use Serper for articles, books, and experts
    let searchContext = '';
    const serperApiKey = process.env.SERPER_API_KEY;
    
    if (serperApiKey) {
      try {
        const [articleResponse, bookResponse, expertResponse] = await Promise.all([
          serperSearch(`${topic} tutorial guide site:medium.com OR site:dev.to OR site:freecodecamp.org`),
          serperSearch(`${topic} best books site:goodreads.com OR site:amazon.com`),
          serperSearch(`${topic} expert site:twitter.com OR site:linkedin.com`)
        ]);

        const articleResults = (articleResponse.organic || [])
          .filter(r => !r.link.includes('youtube.com'))
          .slice(0, 6);
        
        const bookResults = (bookResponse.organic || [])
          .filter(r => r.link.includes('amazon.com') || r.link.includes('goodreads.com'))
          .slice(0, 4);
        
        const expertResults = (expertResponse.organic || [])
          .filter(r => r.link.includes('twitter.com') || r.link.includes('x.com') || r.link.includes('linkedin.com'))
          .slice(0, 4);

        searchContext = `
SEARCH RESULTS:

Articles found:
${articleResults.map(r => `- "${r.title}" - ${r.link}`).join('\n')}

Books found:
${bookResults.map(r => `- "${r.title}" - ${r.link}`).join('\n')}

Experts found:
${expertResults.map(r => `- "${r.title}" - ${r.link}`).join('\n')}
`;
      } catch (searchError) {
        console.error('[Resources API] Search error:', searchError);
      }
    }
    
    if (!searchContext) {
      searchContext = `No web search available. Generate high-quality resources based on your knowledge:

For the topic "${topic}", recommend REAL, VERIFIED resources:
- Popular articles from Medium, freeCodeCamp, dev.to, official documentation
- Classic and highly-rated books with real authors
- Recognized experts and thought leaders with real Twitter/LinkedIn handles

IMPORTANT: Only recommend resources you are confident actually exist.`;
    }

    // Generate articles, books, and influencers with AI
    const { object, usage } = await generateObject({
      model: openai('gpt-5-mini'),
      system: `You are an expert educational curator. Your goal is to recommend ONLY genuinely useful, verified resources.

CRITICAL GUIDELINES:

For Articles:
- Prefer articles from reputable sources: official documentation, Medium publications, dev.to, freeCodeCamp, etc.
- Look for comprehensive guides, tutorials, and in-depth explanations
- Include the actual domain as the source (e.g., "Medium", "freeCodeCamp", "Official Docs")

For Books:
- Recommend well-established, highly-rated books on the topic
- Include classic texts and modern essentials
- Provide a brief description of why each book is valuable

For Experts/Influencers:
- Recommend real, verifiable experts in the field
- Include their primary platform (Twitter, LinkedIn, YouTube, etc.)
- Provide their actual handle/username when available
- Only include people who actively share educational content

IMPORTANT: Only return resources you are confident are real and useful. Quality over quantity.`,
      prompt: `Find the best learning resources for: "${topic}"

Topic Context: ${content ? content.substring(0, 800) : 'No additional context'}

Web Search Results:
${searchContext}

Based on these search results and your knowledge, provide high quality articles, books, and experts to follow.`,
      schema: z.object({
        articles: z.array(z.object({
          title: z.string().describe("The article title"),
          url: z.string().describe("Full article URL"),
          source: z.string().describe("The website name (e.g., 'Medium', 'freeCodeCamp', 'Official Docs')")
        })).describe("3-5 comprehensive articles or documentation pages"),
        books: z.array(z.object({
          title: z.string().describe("The book title"),
          author: z.string().describe("The author's name"),
          description: z.string().describe("Why this book is valuable for learning this topic (1-2 sentences)")
        })).describe("2-4 highly recommended books"),
        influencers: z.array(z.object({
          name: z.string().describe("The person's real name"),
          platform: z.string().describe("Primary platform: 'Twitter', 'LinkedIn', 'YouTube', etc."),
          handle: z.string().describe("Their username/handle on the platform"),
          description: z.string().describe("Their expertise and why they're worth following (1 sentence)")
        })).describe("3-5 recognized experts who share educational content")
      })
    })

    if (usage) {
      console.log(`[Resources API] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    }

    const resourceData = {
      ...object,
      youtubeVideos: youtubeVideos
    }

    // Save resources to database
    const { error } = await supabase
      .from('resources')
      .insert({
        document_id: documentId,
        user_id: user.id,
        data: resourceData
      })

    if (error) {
      console.error('Error saving resources:', error)
      return NextResponse.json({ error: 'Failed to save resources' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      resources: resourceData,
      isExisting: false
    })
  } catch (error) {
    console.error('[Resources API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate resources' }, { status: 500 })
  }
}
