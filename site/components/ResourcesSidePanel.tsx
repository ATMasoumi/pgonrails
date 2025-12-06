"use client"

import { X, Youtube, Book, User, FileText, ExternalLink, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils'
import { ResourceData } from './ResourcesModal'

interface ResourcesSidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  resources: ResourceData | null
}

export function ResourcesSidePanel({ isOpen, onClose, title, resources }: ResourcesSidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[600px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-pink-900/10 to-purple-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/20 shrink-0">
              <Library className="h-5 w-5 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">Resources for {title}</h2>
              <p className="text-xs text-gray-400">
                AI Recommended Learning Materials
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6 min-h-0 flex flex-col">
          {resources ? (
            <Tabs defaultValue="youtube" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/5 border border-white/10 rounded-xl shrink-0 mb-4">
                <TabsTrigger value="youtube" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                  <Youtube className="h-4 w-4" /> <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="articles" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                  <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Articles</span>
                </TabsTrigger>
                <TabsTrigger value="books" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                  <Book className="h-4 w-4" /> <span className="hidden sm:inline">Books</span>
                </TabsTrigger>
                <TabsTrigger value="influencers" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                  <User className="h-4 w-4" /> <span className="hidden sm:inline">People</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 relative min-h-0">
                <ScrollArea className="absolute inset-0 -mr-4 pr-4 h-full">
                  <TabsContent value="youtube" className="space-y-4 mt-0 pb-6 outline-none">
                    {resources.youtubeVideos.map((video, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-base text-gray-200 group-hover:text-blue-400 transition-colors">{video.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{video.channelName}</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/50 shrink-0" asChild>
                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                              Watch <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {resources.youtubeVideos.length === 0 && (
                      <div className="text-center text-gray-500 py-8">No videos found</div>
                    )}
                  </TabsContent>

                  <TabsContent value="articles" className="space-y-4 mt-0 pb-6 outline-none">
                    {resources.articles.map((article, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-base text-gray-200 group-hover:text-emerald-400 transition-colors">{article.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{article.source}</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 shrink-0" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              Read <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {resources.articles.length === 0 && (
                      <div className="text-center text-gray-500 py-8">No articles found</div>
                    )}
                  </TabsContent>

                  <TabsContent value="books" className="space-y-4 mt-0 pb-6 outline-none">
                    {resources.books.map((book, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-gray-200 group-hover:text-purple-400 transition-colors">{book.title}</h3>
                            <p className="text-sm font-medium text-gray-400 mb-2">by {book.author}</p>
                            <p className="text-sm text-gray-500">{book.description}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50" asChild>
                              <a href={`https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer">
                                Amazon <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/50" asChild>
                              <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer">
                                Goodreads <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {resources.books.length === 0 && (
                      <div className="text-center text-gray-500 py-8">No books found</div>
                    )}
                  </TabsContent>

                  <TabsContent value="influencers" className="space-y-4 mt-0 pb-6 outline-none">
                    {resources.influencers.map((influencer, i) => {
                      // Generate the appropriate profile URL based on platform
                      const getProfileUrl = () => {
                        const platform = influencer.platform.toLowerCase();
                        const handle = influencer.handle.replace('@', '');
                        if (platform.includes('twitter') || platform.includes('x')) {
                          return `https://twitter.com/${handle}`;
                        } else if (platform.includes('linkedin')) {
                          return `https://linkedin.com/in/${handle}`;
                        } else if (platform.includes('youtube')) {
                          return `https://youtube.com/@${handle}`;
                        } else if (platform.includes('github')) {
                          return `https://github.com/${handle}`;
                        }
                        return `https://www.google.com/search?q=${encodeURIComponent(influencer.name + ' ' + influencer.platform)}`;
                      };
                      
                      return (
                        <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base text-gray-200 group-hover:text-orange-400 transition-colors">{influencer.name}</h3>
                              <p className="text-sm font-medium text-gray-400">{influencer.platform} • @{influencer.handle.replace('@', '')}</p>
                              <p className="text-sm text-gray-500 mt-2">{influencer.description}</p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 shrink-0" asChild>
                              <a href={getProfileUrl()} target="_blank" rel="noopener noreferrer">
                                Follow <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {resources.influencers.length === 0 && (
                      <div className="text-center text-gray-500 py-8">No influencers found</div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No resources available
            </div>
          )}
        </div>
      </div>
    </>
  )
}
