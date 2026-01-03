import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, ItemType, NewItemInput, Comment } from './types'; 
import { MediaCard } from './components/MediaCard';
import { AddModal } from './components/AddModal';
import { DetailsModal } from './components/DetailsModal';
import { TrailerModal } from './components/TrailerModal'; 
import { CommentsModal } from './components/CommentsModal'; 
import { WelcomeModal } from './components/WelcomeModal'; 
import { fetchMediaDetails } from './services/geminiService'; 
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { About, Privacy, Terms, Contact } from './components/StaticPages';
import { calculateCineRank } from './cineRank';

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from './firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, query, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const ADMIN_EMAIL = "srkplayer47@gmail.com"; 
const TAB_CONTRIBUTORS = 'CONTRIBUTORS';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [items, setItems] = useState<MediaItem[]>([]); 
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [playingTrailer, setPlayingTrailer] = useState<string | null>(null);
  const [activeCommentItem, setActiveCommentItem] = useState<MediaItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(ItemType.Series);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Notification States
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('cinerank_welcome_seen_v1');
    if (!hasSeenWelcome && isHomePage) { 
        const timer = setTimeout(() => setShowWelcome(true), 1500); 
        return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  const handleCloseWelcome = () => {
      localStorage.setItem('cinerank_welcome_seen_v1', 'true');
      setShowWelcome(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "media-items"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        likedBy: doc.data().likedBy || [],
        dislikedBy: doc.data().dislikedBy || [],
        comments: doc.data().comments || [],
        starRatings: doc.data().starRatings || {} 
      })) as MediaItem[];
      setItems(dbItems);
      setIsAppLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { setSelectedGenre('All'); }, [activeTab]);

  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error(error); } };
  const handleLogout = async () => { await signOut(auth); };
  const onAddClick = () => { if (!user) { handleLogin(); } else { setIsModalOpen(true); } };

  // --- INTERACTION LOGIC ---
  const handleLike = async (item: MediaItem) => {
    if (!user || !user.email) { alert("Please login to vote!"); handleLogin(); return; }
    const itemRef = doc(db, "media-items", item.id);
    if (item.likedBy?.includes(user.email)) { await updateDoc(itemRef, { likedBy: arrayRemove(user.email) }); } 
    else { await updateDoc(itemRef, { likedBy: arrayUnion(user.email), dislikedBy: arrayRemove(user.email) }); }
  };

  const handleDislike = async (item: MediaItem) => {
    if (!user || !user.email) { alert("Please login to vote!"); handleLogin(); return; }
    const itemRef = doc(db, "media-items", item.id);
    if (item.dislikedBy?.includes(user.email)) { await updateDoc(itemRef, { dislikedBy: arrayRemove(user.email) }); } 
    else { await updateDoc(itemRef, { dislikedBy: arrayUnion(user.email), likedBy: arrayRemove(user.email) }); }
  };

  const handleRate = async (item: MediaItem, rating: number) => {
    if (!user || !user.email) { alert("Please login to rate!"); handleLogin(); return; }
    
    const currentRatings = item.starRatings || {};
    const updatedRatings = { ...currentRatings, [user.email]: rating };
    
    const itemRef = doc(db, "media-items", item.id);
    await updateDoc(itemRef, { starRatings: updatedRatings });
  };

  const handleCommentClick = (item: MediaItem) => {
    if (!user) { alert("Please login to see comments!"); handleLogin(); return; }
    setActiveCommentItem(item);
  };

  const addCommentToDb = async (itemId: string, text: string) => {
    if (!user || !user.email) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text: text.trim(),
      userId: user.email,
      userName: user.displayName || "Anonymous",
      userPhoto: user.photoURL || "",
      timestamp: Date.now()
    };
    await updateDoc(doc(db, "media-items", itemId), { comments: arrayUnion(newComment) });
  };

  // --- ADMIN: DELETE COMMENT ---
  const handleDeleteComment = async (itemId: string, commentToDelete: Comment) => {
     if (!user || user.email !== ADMIN_EMAIL) {
         alert("Unauthorized");
         return;
     }

     const itemRef = doc(db, "media-items", itemId);
     try {
         await updateDoc(itemRef, { comments: arrayRemove(commentToDelete) });
     } catch (err) {
         console.log("Standard remove failed, trying filter method...", err);
         const snapshot = await getDoc(itemRef);
         if (snapshot.exists()) {
             const currentComments = snapshot.data().comments || [];
             const updatedComments = currentComments.filter((c: Comment) => c.id !== commentToDelete.id);
             await updateDoc(itemRef, { comments: updatedComments });
         }
     }
  };

  // --- NEW: ADMIN DELETE CONTRIBUTOR ---
  const handleDeleteContributor = async (targetEmail: string) => {
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("Only admin can remove contributors.");
        return;
    }

    if (!confirm(`Are you sure you want to remove ${targetEmail} from the Hall of Fame? \n\nThis will NOT delete the movies they added, but it will change the 'Added By' credit to 'Anonymous'.`)) {
        return;
    }

    try {
        // 1. Find all items added by this user
        const itemsToUpdate = items.filter(item => item.addedByEmail === targetEmail);

        if (itemsToUpdate.length === 0) {
            alert("This user hasn't contributed any items (or is already removed).");
            return;
        }

        // 2. Update each item to remove credit
        const updatePromises = itemsToUpdate.map(item => {
            const itemRef = doc(db, "media-items", item.id);
            return updateDoc(itemRef, {
                addedBy: "Anonymous",
                addedByEmail: "", // Empty string removes them from the calculation loop
                addedByPhoto: "" 
            });
        });

        await Promise.all(updatePromises);
        alert(`Successfully anonymized ${itemsToUpdate.length} contributions.`);

    } catch (error) {
        console.error("Error removing contributor:", error);
        alert("Failed to remove contributor. Check console.");
    }
  };

  const handleAddItem = async (input: NewItemInput) => {
    if (!user) { alert("You must be logged in!"); return; }
    const normalizedInput = input.name.trim().toLowerCase();
    const duplicate = items.find(item => item.name.toLowerCase() === normalizedInput && item.type === input.type);
    if (duplicate) { setIsModalOpen(false); setShowDuplicate(true); setTimeout(() => setShowDuplicate(false), 3000); return; }

    setIsAdding(true);
    try {
      const details = await fetchMediaDetails(input);
      const officialDuplicate = items.find(item => item.name.toLowerCase() === details.name.toLowerCase() && item.type === input.type);
      if (officialDuplicate) { setIsModalOpen(false); setIsAdding(false); setShowDuplicate(true); setTimeout(() => setShowDuplicate(false), 3000); return; }
      
      const newItem = {
        ...details,
        createdAt: Date.now(),
        addedBy: user.displayName || "Anonymous",
        addedByEmail: user.email || "",
        addedByPhoto: user.photoURL || "",
        likedBy: [], dislikedBy: [], comments: [], starRatings: {}
      };
      await addDoc(collection(db, "media-items"), newItem);
      setIsModalOpen(false); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) { setIsModalOpen(false); setShowError(true); setTimeout(() => setShowError(false), 3000); } finally { setIsAdding(false); }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user || user.email !== ADMIN_EMAIL) { alert("Only admin can delete."); return; }
    if (confirm("Delete this item?")) {
      try { await deleteDoc(doc(db, "media-items", id)); if (selectedItem?.id === id) setSelectedItem(null); } 
      catch (error) { setShowError(true); setTimeout(() => setShowError(false), 3000); }
    }
  };

  const contributors = useMemo(() => {
    const counts: Record<string, { name: string; photo: string; count: number; email: string }> = {};
    items.forEach(item => {
        if (item.addedByEmail) {
            if (!counts[item.addedByEmail]) { 
                counts[item.addedByEmail] = { 
                    name: item.addedBy || 'User', 
                    photo: item.addedByPhoto || '', 
                    count: 0,
                    email: item.addedByEmail 
                }; 
            }
            counts[item.addedByEmail].count += 1;
        }
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [items]);

  const availableGenres = useMemo(() => {
    if (activeTab === TAB_CONTRIBUTORS) return [];
    const tabItems = items.filter(item => item.type === activeTab);
    const genres = new Set<string>();
    tabItems.forEach(item => genres.add(item.genre));
    return Array.from(genres).sort();
  }, [items, activeTab]);

  const displayedItems = useMemo(() => {
    if (activeTab === TAB_CONTRIBUTORS) return [];
    return items
      .filter(item => item.type === activeTab)
      .filter(item => selectedGenre === 'All' || item.genre === selectedGenre)
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        return calculateCineRank(b) - calculateCineRank(a);
      });
  }, [items, activeTab, selectedGenre, searchQuery]);

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white hidden md:block">
                Cine<span className="text-purple-500">Rank</span>
              </h1>
            </Link>
            <div className="flex items-center gap-4">
               <button onClick={onAddClick} className="bg-white text-black hover:bg-zinc-200 font-semibold py-2 px-4 md:px-6 rounded-full transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  {user ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
                  ) : <span className="md:hidden font-bold">Login</span>}
                  <span className="hidden md:inline">{user ? "Add New" : "Login to Add"}</span>
                </button>
                {user && (
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ""} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" title={`Logged in as ${user.displayName}`} />
                    <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-white underline">Log Out</button>
                  </div>
                )}
            </div>
          </div>
          
          {isHomePage && (
            <div className="flex space-x-8 mt-2 overflow-x-auto no-scrollbar">
              {Object.values(ItemType).map((type) => (
                <button key={type} onClick={() => setActiveTab(type)} className={`pb-4 text-sm font-medium tracking-wide transition-all border-b-2 whitespace-nowrap px-2 ${activeTab === type ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>TOP {type.toUpperCase()}S</button>
              ))}
              <button onClick={() => setActiveTab(TAB_CONTRIBUTORS)} className={`pb-4 text-sm font-medium tracking-wide transition-all border-b-2 whitespace-nowrap px-2 flex items-center gap-2 ${activeTab === TAB_CONTRIBUTORS ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-zinc-500 hover:text-yellow-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06z" clipRule="evenodd" /></svg>
                  TOP CONTRIBUTORS
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/" element={
                <>
                    {activeTab === TAB_CONTRIBUTORS ? (
                        <div className="animate-fade-in">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3"><span className="text-yellow-400 text-4xl">👑</span> Hall of Fame</h2>
                                <p className="text-zinc-500 mt-2">The legends keeping this library alive.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contributors.map((contributor, index) => (
                                    <div key={index} className="relative bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:bg-zinc-800/50 transition-colors group">
                                        
                                        {/* ADMIN DELETE CONTRIBUTOR BUTTON */}
                                        {user?.email === ADMIN_EMAIL && (
                                            <button 
                                                onClick={() => handleDeleteContributor(contributor.email)}
                                                className="absolute top-2 right-2 p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                title="Admin: Remove from Hall of Fame"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                        
                                        <div className="relative">
                                            <img src={contributor.photo || `https://ui-avatars.com/api/?name=${contributor.name}&background=random`} alt={contributor.name} className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${contributor.name}&background=random`; }} />
                                            {index < 3 && <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-900 ${index === 0 ? 'bg-yellow-400 text-black' : index === 1 ? 'bg-zinc-300 text-black' : 'bg-orange-400 text-black'}`}>{index + 1}</div>}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{contributor.name}</h3>
                                            <p className="text-sm text-purple-400 font-medium">{contributor.count} {contributor.count === 1 ? 'Contribution' : 'Contributions'}</p>
                                        </div>
                                    </div>
                                ))}
                                {contributors.length === 0 && <div className="col-span-full text-center py-20 text-zinc-500">No contributions recorded yet. Be the first!</div>}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Top Rated {activeTab}s</h2>
                                    <span className="text-zinc-500 text-sm font-mono mt-1 block">Sorted by CineRank Score</span>
                                </div>
                                <div className="flex flex-col gap-3 items-end">
                                <div className="relative w-full md:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-full leading-5 bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors" />
                                </div>
                                {availableGenres.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar max-w-full">
                                        <button onClick={() => setSelectedGenre('All')} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedGenre === 'All' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>All</button>
                                        {availableGenres.map(genre => (
                                            <button key={genre} onClick={() => setSelectedGenre(genre)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedGenre === genre ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>{genre}</button>
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>

                            {isAppLoading && <div className="text-center py-20 text-purple-400 animate-pulse"><p>Connecting to Community Database...</p></div>}
                            {!isAppLoading && items.length > 0 && displayedItems.length === 0 && <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl"><p>No matches found.</p><button onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }} className="mt-2 text-purple-400 hover:text-purple-300 underline text-sm">Clear Filters</button></div>}
                            {!isAppLoading && items.length === 0 && <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl"><p className="text-zinc-500 mb-4">No {activeTab}s found in the database yet.</p><button onClick={onAddClick} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium transition-colors">Add the First {activeTab}</button></div>}

                            <div className="grid grid-cols-1 gap-6">
                            {displayedItems.map((item, index) => (
                                <MediaCard 
                                    key={item.id} 
                                    item={item} 
                                    rank={index + 1} 
                                    onDelete={handleDeleteItem}
                                    onClick={(clickedItem) => {
                                        if ((clickedItem as any).isPlayRequest) { setPlayingTrailer(clickedItem.trailerUrl || null); } 
                                        else { setSelectedItem(clickedItem); }
                                    }}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                    onComment={handleCommentClick}
                                    onRate={handleRate}
                                    isAdmin={user?.email === ADMIN_EMAIL}
                                    currentUserEmail={user?.email || undefined} 
                                />
                            ))}
                            </div>
                        </>
                    )}
                </>
            } />
        </Routes>
      </main>

      <div className="bg-black/80 backdrop-blur border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
            <div className="flex gap-4">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-center md:text-right leading-relaxed">
            © {new Date().getFullYear()} CineRank Entertainments · This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
        </div>
      </div>

      <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-3 border border-green-400"><span className="font-bold tracking-wide">Added Successfully!</span></div>
      </div>
      <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-3 border border-red-400"><span className="font-bold tracking-wide">Failed to Add Item</span></div>
      </div>
      <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ${showDuplicate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-3 border border-amber-400"><span className="font-bold tracking-wide">Title Already Exists!</span></div>
      </div>

      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddItem} isLoading={isAdding} />
      <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <TrailerModal isOpen={!!playingTrailer} videoUrl={playingTrailer} onClose={() => setPlayingTrailer(null)} />
      <CommentsModal 
         isOpen={!!activeCommentItem} 
         item={activeCommentItem} 
         onClose={() => setActiveCommentItem(null)} 
         onAddComment={addCommentToDb} 
         onDeleteComment={handleDeleteComment}
         currentUserEmail={user?.email || undefined} 
         isAdmin={user?.email === ADMIN_EMAIL}
      />
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
    </div>
  );
}

export default App;