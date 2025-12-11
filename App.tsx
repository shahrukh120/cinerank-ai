import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, ItemType, NewItemInput } from './types';
import { MediaCard } from './components/MediaCard';
import { AddModal } from './components/AddModal';
import { DetailsModal } from './components/DetailsModal';
import { fetchMediaDetails } from './services/geminiService'; // Ensure this points to mediaService now

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from './firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- SECURITY CONFIG ---
const ADMIN_EMAIL = "srkplayer47@gmail.com"; 

function App() {
  const [items, setItems] = useState<MediaItem[]>([]); 
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<ItemType>(ItemType.Series);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- NEW: SUCCESS STATE ---
  const [showSuccess, setShowSuccess] = useState(false);

  // --- 1. LISTEN TO AUTH CHANGES ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. LISTEN TO DATABASE ---
  useEffect(() => {
    const q = query(collection(db, "media-items"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MediaItem[];
      setItems(dbItems);
      setIsAppLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSelectedGenre('All');
  }, [activeTab]);

  // --- AUTH ACTIONS ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- DERIVED DATA ---
  const availableGenres = useMemo(() => {
    const tabItems = items.filter(item => item.type === activeTab);
    const genres = new Set<string>();
    tabItems.forEach(item => genres.add(item.genre));
    return Array.from(genres).sort();
  }, [items, activeTab]);

  const displayedItems = useMemo(() => {
    return items
      .filter(item => item.type === activeTab)
      .filter(item => selectedGenre === 'All' || item.genre === selectedGenre)
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.imdbRating - a.imdbRating);
  }, [items, activeTab, selectedGenre, searchQuery]);

  const handleAddItem = async (input: NewItemInput) => {
    const normalizedInput = input.name.trim().toLowerCase();
    
    // Check local duplicate first to save API calls
    const duplicate = items.find(item => item.name.toLowerCase() === normalizedInput && item.type === input.type);
    if (duplicate) { alert(`"${duplicate.name}" is already listed!`); return; }

    setIsAdding(true);
    try {
      const details = await fetchMediaDetails(input);
      
      // Check official name duplicate
      const officialDuplicate = items.find(item => item.name.toLowerCase() === details.name.toLowerCase() && item.type === input.type);
      if (officialDuplicate) { alert(`"${details.name}" is already listed!`); setIsAdding(false); return; }
      
      const newItem = {
        name: details.name,
        genre: details.genre,
        type: input.type,
        imdbRating: details.imdbRating,
        rottenTomatoes: details.rottenTomatoes || 'N/A',
        year: details.year,
        description: details.description,
        posterUrl: details.posterUrl || "",
        runPeriod: details.runPeriod,
        streamingOptions: details.streamingOptions,
        totalSeasons: details.totalSeasons || null,
        createdAt: Date.now()
      };

      await addDoc(collection(db, "media-items"), newItem);
      
      setIsModalOpen(false);

      // --- TRIGGER SUCCESS TOAST ---
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Hide after 3 seconds

    } catch (error) {
      console.error("Failed to add item", error);
      alert("Failed to add item.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Only the admin can delete items.");
      return;
    }

    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "media-items", id));
        if (selectedItem?.id === id) setSelectedItem(null);
      } catch (error) {
        alert("Failed to delete item.");
      }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white hidden md:block">
                CineRank<span className="text-purple-500">.ai</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-black hover:bg-zinc-200 font-semibold py-2 px-4 md:px-6 rounded-full transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Add New</span>
                </button>

                {user ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL || ""} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-zinc-700"
                      title={`Logged in as ${user.email}`}
                    />
                    <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-white underline">
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Admin Login
                  </button>
                )}
            </div>
          </div>

          <div className="flex space-x-8 mt-2 overflow-x-auto no-scrollbar">
            {Object.values(ItemType).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`pb-4 text-sm font-medium tracking-wide transition-all border-b-2 whitespace-nowrap px-2 ${
                  activeTab === type ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                TOP {type.toUpperCase()}S
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              just because they are not widely discussed.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white">Top Rated {activeTab}s</h2>
                <span className="text-zinc-500 text-sm font-mono mt-1 block">Sorted by IMDb Rating</span>
            </div>

            <div className="flex flex-col gap-3 items-end">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-full leading-5 bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                />
              </div>

              {availableGenres.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar max-w-full">
                      <button
                          onClick={() => setSelectedGenre('All')}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedGenre === 'All' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                      >
                          All
                      </button>
                      {availableGenres.map(genre => (
                          <button
                              key={genre}
                              onClick={() => setSelectedGenre(genre)}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedGenre === genre ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                          >
                              {genre}
                          </button>
                      ))}
                  </div>
              )}
            </div>
        </div>

        {isAppLoading && (
           <div className="text-center py-20 text-purple-400 animate-pulse">
              <p>Connecting to Community Database...</p>
           </div>
        )}

        {!isAppLoading && items.length > 0 && displayedItems.length === 0 && (
            <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <p>No matches found.</p>
                <button onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }} className="mt-2 text-purple-400 hover:text-purple-300 underline text-sm">Clear Filters</button>
            </div>
        )}

        {!isAppLoading && items.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 mb-4">No {activeTab}s found in the database yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium transition-colors">Add the First {activeTab}</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {displayedItems.map((item, index) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              rank={index + 1} 
              onDelete={handleDeleteItem}
              onClick={setSelectedItem}
              isAdmin={user?.email === ADMIN_EMAIL} 
            />
          ))}
        </div>
      </main>

      {/* --- SUCCESS TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-3 border border-green-400">
          <div className="bg-white text-green-600 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="font-bold tracking-wide">Added Successfully!</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/5 py-2 px-4 text-center z-50">
         <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Powered by Google Gemini 2.5 • Ratings Updated via AI • Live on Firebase
         </p>
      </div>

      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddItem} isLoading={isAdding} />
      <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

export default App;