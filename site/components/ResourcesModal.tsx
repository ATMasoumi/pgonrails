"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Youtube, Book, User, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface ResourceData {
  youtubeVideos: { title: string; url: string; channelName: string }[]
  articles: { title: string; url: string; source: string }[]
  books: { title: string; author: string; description: string }[]
  influencers: { name: string; platform: string; handle: string; description: string }[]
}

interface ResourcesModalProps {
  isOpen: boolean
  onClose: () => void
  resources: ResourceData | null
  isLoading: boolean
}

export function ResourcesModal({ isOpen, onClose, resources, isLoading }: ResourcesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">AI Recommended Resources</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : resources ? (
          <Tabs defaultValue="youtube" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/5 border border-white/10 rounded-xl">
              <TabsTrigger value="youtube" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                <Youtube className="h-4 w-4" /> Videos
              </TabsTrigger>
              <TabsTrigger value="articles" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                <FileText className="h-4 w-4" /> Articles
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                <Book className="h-4 w-4" /> Books
              </TabsTrigger>
              <TabsTrigger value="influencers" className="rounded-lg py-2.5 text-gray-400 hover:text-white data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:shadow-none flex items-center justify-center gap-2 transition-all duration-200">
                <User className="h-4 w-4" /> Influencers
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="youtube" className="space-y-4 pr-4 mt-0">
                {resources.youtubeVideos.map((video, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-200 group-hover:text-blue-400 transition-colors">{video.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{video.channelName}</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/50" asChild>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          Watch <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="articles" className="space-y-4 pr-4 mt-0">
                {resources.articles.map((article, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-200 group-hover:text-emerald-400 transition-colors">{article.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{article.source}</p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          Read <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="books" className="space-y-4 pr-4 mt-0">
                {resources.books.map((book, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-200 group-hover:text-purple-400 transition-colors">{book.title}</h3>
                        <p className="text-sm font-medium text-gray-400 mb-2">by {book.author}</p>
                        <p className="text-sm text-gray-500">{book.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50" asChild>
                          <a href={`https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer">
                            Amazon <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/50" asChild>
                          <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`} target="_blank" rel="noopener noreferrer">
                            Goodreads <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="influencers" className="space-y-4 pr-4 mt-0">
                {resources.influencers.map((influencer, i) => {
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
                          <h3 className="font-semibold text-lg text-gray-200 group-hover:text-orange-400 transition-colors">{influencer.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{influencer.platform} • @{influencer.handle.replace('@', '')}</p>
                          <p className="text-sm text-gray-500 mt-2">{influencer.description}</p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 shrink-0" asChild>
                          <a href={getProfileUrl()} target="_blank" rel="noopener noreferrer">
                            Follow <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
