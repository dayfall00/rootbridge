import React, { useEffect, useState } from 'react';
import { subscribeToWorkers } from '../../services/workerService';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Star, Phone, Zap } from 'lucide-react';
import CustomJobCTA from '../../components/CustomJobCTA';
import JobModal from '../../components/JobModal';

const ServicesMarketplace = () => {
  const { userData } = useUser();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log("User city:", userData?.city);
    
    const userCity = userData?.city;
    if (!userCity) return; // inside useEffect, not before setLoading
    
    console.log("ServicesMarketplace Filters -> Category:", categoryFilter, "City:", userCity);

    // Fetch ALL workers and filter entirely on frontend
    const baseQuery = query(collection(db, "workers"));

    const unsubscribe = onSnapshot(baseQuery, async (snapshot) => {
      let rawWorkers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      console.log("Raw Firestore Workers:", rawWorkers);
      
      // Frontend filtering to normalize data representations
      rawWorkers = rawWorkers.filter(worker => {
        const workerCity = (worker.city || '').toLowerCase().trim();
        const targetCity = (userData?.city || '').toLowerCase().trim();
        const cityMatch = workerCity === targetCity;
        
        const availableMatch = worker.isAvailable === true || worker.isAvailable === 'true';

        const categoryMatch = !categoryFilter ||
          (worker.category || '').toLowerCase().trim() ===
          categoryFilter.toLowerCase().trim();

        console.log("TARGET CITY:", targetCity);
        console.log("WORKER RAW:", worker.uid, worker.city, worker.isAvailable, worker.category);
        console.log("CITY MATCH:", cityMatch, "AVAILABLE:", availableMatch, "CATEGORY:", categoryMatch);
        
        return cityMatch && availableMatch && categoryMatch;
      });

      const mergedWorkers = await Promise.all(
        rawWorkers.map(async (worker) => {
          let userName = "RootBridge User";
          let userPhone = "+91XXXXXXXXXX";
          try {
            const userDoc = await getDoc(doc(db, "users", worker.uid));
            console.log("User doc for uid:", worker.uid, "exists:", userDoc.exists());
            if (userDoc.exists()) {
              userName = userDoc.data().name || userName;
              userPhone = userDoc.data().phone || userPhone;
            }
          } catch (err) {
            console.error("Error fetching user details for worker:", worker.uid);
          }

          let parsedSkills = [];
          if (Array.isArray(worker.skills)) {
            parsedSkills = worker.skills;
          } else if (typeof worker.skills === 'string') {
            parsedSkills = worker.skills.split(',').map(s => s.trim()).filter(Boolean);
          }

          return {
            uid: worker.uid,
            name: userName,
            category: worker.category,
            skills: parsedSkills,
            rating: worker.rating || 0,
            city: worker.city,
            isAvailable: worker.isAvailable,
            phone: userPhone,
            completedJobs: worker.completedJobs || 0
          };
        })
      );

      console.log("workersData", mergedWorkers);
      setWorkers(mergedWorkers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workers snapshot:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryFilter, userData?.city]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-10 selection:bg-primary/20 selection:text-text">
      <aside className="w-72 flex-shrink-0 hidden md:block">
        <div className="sticky top-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold font-headline text-text mb-6">Marketplace Filters</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold font-label text-gray-500 uppercase tracking-wider">Category</label>
                <div className="space-y-2">
                  {['Electrician', 'Plumber', 'Carpenter', 'Landscaping'].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 group cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}>
                      <input 
                        checked={categoryFilter === cat} 
                        readOnly 
                        className="rounded-md border-gray-300 text-primary focus:ring-primary h-5 w-5 cursor-pointer" 
                        type="checkbox"
                      />
                      <span className="text-sm text-text group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <CustomJobCTA onClick={() => setIsModalOpen(true)} />
        </div>
      </aside>

      <section className="flex-1">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-text mb-2">
              Expert {categoryFilter || 'Workers'}
            </h2>
            <p className="text-gray-500 text-lg">{workers.length} verified professionals available in {userData?.city || 'your area'}</p>
          </div>
        </div>

        {loading && <div className="p-10 border border-gray-200 rounded-2xl text-center bg-white shadow-sm animate-pulse">
            <p className="text-gray-500">Loading workers...</p>
        </div>}

        {workers.length === 0 && !loading && (
          <div className="p-10 border border-gray-200 rounded-2xl text-center bg-white shadow-sm">
            <p className="text-gray-500">No workers found in your city for this category</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {workers.map((worker) => (
            <div key={worker.uid} className="group bg-white rounded-[2rem] overflow-hidden transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl border border-gray-100">
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img 
                  alt="Professional Profile" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDkJOh5RZxhZTo1aP78WnhhU8v0LDeZXpE0MP2hdmaeMmZU2cmQjXKpDBt8okIpNezPb5aCDpyTPIFytIpmxPR41NHJvJKfFUa2dV_AmDdVT-7kQdDHoLjaYnHTAmg0W727uAEEhUVdWCq4k1CVHPQz58ZoDLdmYrzu_Yx-bsyMurUdk0YRoln7ZlIiBN4yR2bGLQZgbjslV5XgFCUsEza4zKYvIWLI3BtciI8vL1jQnSEAlSxSfXFrYe4KENeAqQ012Q5tJwf_0s"
                />
                {worker.isAvailable && (
                  <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Available Now</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star fill="currentColor" size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-text tracking-tight">{worker.rating || 'New'}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold font-headline text-text mb-1">{worker.name}</h3>
                    <p className="text-primary font-semibold text-sm capitalize">Expert {worker.category || 'Professional'}</p>
                    
                    {worker.skills && worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {worker.skills.map((skill, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Completed Jobs</p>
                    <p className="text-lg font-black text-text">{worker.completedJobs || 0}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Available for hire in {worker.city}. Connect directly without any middlemen. 
                </p>
                <div className="flex gap-4">
                  <a 
                    href={`tel:${worker.phone || '+91XXXXXXXXXX'}`}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Call Now
                  </a>
                  <button className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
                    <Zap size={18} />
                    Hire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <JobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default ServicesMarketplace;
