
import React, { useState, useMemo } from 'react';
import { MediaItem, ItemType, NewItemInput } from './types';
import { MediaCard } from './components/MediaCard';
import { AddModal } from './components/AddModal';
import { DetailsModal } from './components/DetailsModal';
import { fetchMediaDetails } from './services/geminiService';

// Initial Data Population with example streaming links
const INITIAL_DATA: MediaItem[] = [
  // SERIES
  { 
    id: '1', name: 'From', genre: 'Horror', imdbRating: 7.8, rottenTomatoes: '96%', year: 2022, type: ItemType.Series, 
    runPeriod: '2022-Present',
    streamingOptions: [{ platform: 'MGM+', url: 'https://www.mgmplus.com/series/from' }, { platform: 'Prime Video', url: 'https://www.amazon.com/From-Season-1/dp/B09P8X57J9' }]
  },
  { 
    id: '2', name: 'Dark', genre: 'Thriller', imdbRating: 8.7, rottenTomatoes: '95%', year: 2017, type: ItemType.Series, 
    runPeriod: '2017-2020',
    streamingOptions: [{ platform: 'Netflix', url: 'https://www.netflix.com/title/80100172' }]
  },
  { 
    id: '3', name: 'Panchayat', genre: 'Drama Comedy', imdbRating: 9.0, rottenTomatoes: 'N/A', year: 2020, type: ItemType.Series, 
    runPeriod: '2020-Present',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.primevideo.com/detail/Panchayat/0L6X1K8X1K8X1K8X1K8X1K' }]
  },
  { 
    id: '4', name: 'Pluribus', genre: 'Drama', imdbRating: 8.4, rottenTomatoes: '98%', year: 2025, type: ItemType.Series,
    runPeriod: '2025',
    streamingOptions: []
  },
  { 
    id: '5', name: 'Stranger Things', genre: 'Horror', imdbRating: 8.6, rottenTomatoes: '90%', year: 2016, type: ItemType.Series, 
    runPeriod: '2016-2025',
    streamingOptions: [{ platform: 'Netflix', url: 'https://www.netflix.com/title/80057281' }]
  },
  { 
    id: '6', name: 'The Boys', genre: 'Drama', imdbRating: 8.6, rottenTomatoes: '93%', year: 2019, type: ItemType.Series, 
    runPeriod: '2019-Present',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.amazon.com/The-Boys-Season-1/dp/B07QNJCGTK' }]
  },
  { 
    id: '7', name: 'Family Man', genre: 'Thriller', imdbRating: 8.7, rottenTomatoes: '100%', year: 2019, type: ItemType.Series, 
    runPeriod: '2019-Present',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.primevideo.com/detail/The-Family-Man/0H3D9D5D5D5D5D5D5D5D5D' }]
  },
  { 
    id: '8', name: 'Fallout', genre: 'Drama', imdbRating: 8.3, rottenTomatoes: '93%', year: 2024, type: ItemType.Series, 
    runPeriod: '2024-Present',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.amazon.com/Fallout-Season-1/dp/B0CN4H4H4H' }]
  },
  { 
    id: '9', name: 'Paatal Lok', genre: 'Thriller', imdbRating: 8.2, rottenTomatoes: '100%', year: 2020, type: ItemType.Series, 
    runPeriod: '2020',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.primevideo.com' }]
  },
  { 
    id: '10', name: 'Reacher', genre: 'Action', imdbRating: 8.0, rottenTomatoes: '96%', year: 2022, type: ItemType.Series, 
    runPeriod: '2022-Present',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.amazon.com/Reacher-Season-1/dp/B09H2K2K2K' }]
  },
  { 
    id: '11', name: 'Delhi Crime', genre: 'Drama', imdbRating: 8.5, rottenTomatoes: '83%', year: 2019, type: ItemType.Series, 
    runPeriod: '2019-Present',
    streamingOptions: [{ platform: 'Netflix', url: 'https://www.netflix.com' }]
  },
  { 
    id: '12', name: 'Money Heist', genre: 'Thriller', imdbRating: 8.2, rottenTomatoes: '94%', year: 2017, type: ItemType.Series, 
    runPeriod: '2017-2021',
    streamingOptions: [{ platform: 'Netflix', url: 'https://www.netflix.com' }]
  },
  { 
    id: '13', name: 'Squid Game', genre: 'Thriller', imdbRating: 8.0, rottenTomatoes: '85%', year: 2021, type: ItemType.Series, 
    runPeriod: '2021-Present',
    streamingOptions: [{ platform: 'Netflix', url: 'https://www.netflix.com' }]
  },
  // MOVIES
  { 
    id: '14', name: 'Shutter Island', genre: 'Thriller/Mystery', imdbRating: 8.2, rottenTomatoes: '69%', year: 2010, type: ItemType.Movie, 
    runPeriod: '2010',
    streamingOptions: [{ platform: 'Prime Video', url: 'https://www.amazon.com/Shutter-Island-Leonardo-DiCaprio/dp/B003L7DHO0' }]
  },
  // ANIME
  { 
    id: '15', name: 'One Piece', genre: 'Adventure', imdbRating: 9.0, totalSeasons: 20, year: 1999, type: ItemType.Anime, 
    runPeriod: '1999-Present',
    streamingOptions: [{ platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/series/GRMG8ZQZR/one-piece' }, { platform: 'Netflix', url: 'https://www.netflix.com' }]
  },
];

function App() {
  const [items, setItems] = useState<MediaItem[]>(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ItemType>(ItemType.Series);

  // Sorting logic: Sort by IMDb rating descending
  const sortedItems = useMemo(() => {
    return items
      .filter(item => item.type === activeTab)
      .sort((a, b) => b.imdbRating - a.imdbRating);
  }, [items, activeTab]);

  const handleAddItem = async (input: NewItemInput) => {
    setIsLoading(true);
    try {
      const details = await fetchMediaDetails(input);
      
      const newItem: MediaItem = {
        id: Date.now().toString(),
        name: input.name,
        genre: details.genre, // Use genre from AI response
        type: input.type,
        imdbRating: details.imdbRating,
        year: details.year,
        description: details.description,
        posterUrl: details.posterUrl,
        runPeriod: details.runPeriod,
        streamingOptions: details.streamingOptions,
        ...(input.type === ItemType.Anime 
          ? { totalSeasons: details.totalSeasons || 1 } 
          : { rottenTomatoes: details.rottenTomatoes || 'N/A' })
      } as MediaItem;

      setItems(prev => [...prev, newItem]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add item", error);
      alert("Failed to fetch details. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    const password = prompt("Enter password to delete this item:");
    if (password === "Ballia726") {
      setItems(prev => prev.filter(item => item.id !== id));
      // Close modal if deleted item was selected
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } else if (password !== null) {
      // If user pressed Cancel (null), do nothing. If they entered wrong password, alert.
      alert("Incorrect password. Access denied.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                CineRank<span className="text-purple-500">.ai</span>
              </h1>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black hover:bg-zinc-200 font-semibold py-2 px-6 rounded-full transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              Add New
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 mt-2 overflow-x-auto no-scrollbar">
            {Object.values(ItemType).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`pb-4 text-sm font-medium tracking-wide transition-all border-b-2 whitespace-nowrap px-2 ${
                  activeTab === type
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                TOP {type.toUpperCase()}S
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        <div className="mb-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black border border-white/5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full inline-block"></span>
              Why CineRank?
            </h2>
            <p className="text-zinc-400 leading-7 max-w-4xl text-sm md:text-base font-light">
              There are too many series, shows, and anime releasing every month. Even if you search "top series" on Google, you may miss some 
              <span className="text-zinc-200 font-medium"> golden gems </span> 
              just because they are not widely discussed. Here the solution comes: pick your choice among audience-curated favorites, arranged effectively. 
              <span className="text-purple-400 font-medium block mt-1"> No more time wasted searching for a good show.</span>
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
               Top Rated {activeTab}s
            </h2>
            <span className="text-zinc-500 text-sm font-mono hidden md:inline-block">
                Sorted by IMDb Rating
            </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sortedItems.length > 0 ? (
            sortedItems.map((item, index) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                rank={index + 1} 
                onDelete={handleDeleteItem}
                onClick={setSelectedItem}
              />
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500">
              <p>No items found in this category.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-purple-400 hover:text-purple-300 underline"
              >
                Add the first {activeTab}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/5 py-2 px-4 text-center z-50">
         <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Powered by Google Gemini 2.5 • Ratings Updated via AI
         </p>
      </div>

      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddItem}
        isLoading={isLoading}
      />
      
      <DetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default App;
