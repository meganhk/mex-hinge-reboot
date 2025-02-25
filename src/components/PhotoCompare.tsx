import React, { useState, useEffect } from 'react'
import { ref, onValue, update, get } from 'firebase/database'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { Photo, User } from '../types'

interface WelcomeModalProps {
  onComplete: (userData: User) => void;
}

function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [userData, setUserData] = useState<Partial<User>>({
    gender: undefined,
    attractedTo: undefined
  })
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create a profile :DD</h2>
        
        <form onSubmit={(e) => {
          e.preventDefault()
          onComplete({
            ...userData,
            id: crypto.randomUUID(),
            comparisons: 0,
            lastActive: Date.now(),
            gender: userData.gender!,
            attractedTo: userData.attractedTo!
          } as User)
        }}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Username (optional)</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              onChange={(e) => setUserData(prev => ({...prev, username: e.target.value}))}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Your Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as const).map(gender => (
                <button
                  key={gender}
                  type="button"
                  className={`p-2.5 rounded-lg transition-colors duration-200 ${
                    userData.gender === gender 
                      ? 'bg-[#5b2b61] text-white hover:bg-[#5b2b61]' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-[#EADFD8]'
                  }`}
                  onClick={() => setUserData(prev => ({...prev, gender}))}
                >
                  <span className="capitalize">{gender}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Attracted to*</label>
            <div className="grid grid-cols-3 gap-2">
              {(['men', 'women', 'both'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  className={`p-2.5 rounded-lg transition-colors duration-200 ${
                    userData.attractedTo?.[0] === option
                      ? 'bg-[#5b2b61] text-white hover:bg-[#5b2b61]'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-[#EADFD8]'
                  }`}
                  onClick={() => setUserData(prev => ({
                    ...prev,
                    attractedTo: [option]
                  }))}
                >
                  <span className="capitalize">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!userData.gender || !userData.attractedTo}
            className="w-full p-2.5 rounded-lg bg-[#5b2b61] text-white transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EADFD8]"
          >
            Start Rating
          </button>
        </form>
      </div>
    </div>
  )
}


function PhotoCompare() {
  const [userData, setUserData] = useState<User | null>(null);
    const [eloRatings, setEloRatings] = React.useState<{[key: number]: number}>({})
    const [currentPair, setCurrentPair] = React.useState<Photo[]>([])
    const [totalVotes, setTotalVotes] = React.useState(0)

  const INITIAL_RATING = 1500;
  const K_FACTOR = 32;

 const allPhotos: Photo[] = [
     { id: 1, url: '/IMG_8281.jpeg', description: 'me on bed', type: 'photo' },
     { id: 2, url: '/IMG_1229.JPG', description: 'me w/ moet chandon picture', type: 'photo'},
     { id: 3, url: '/IMG_1348.jpeg', description: 'me running', type: 'photo' },
     { id: 4, url: '/IMG_4873.jpeg', description: 'me w/ hlab friendos in asakusa', type: 'photo' },
     { id: 5, url: '/IMG_5358.JPG', description: 'me with eiffel tower', type: 'photo'},
     { id: 6, url: '/IMG_6467.jpeg', description: 'me with computer selfie', type: 'photo'},
     { id: 7, url: '/IMG_6474.jpeg', description: 'me with computer selfie but sexier', type: 'photo'},
     { id: 8, url: '/IMG_7585.jpeg', description: 'me at teamlabs', type: 'photo' },
     { id: 9, url: '/IMG_8019.jpeg', description: 'me at peak', type: 'photo' },
     { id: 10, url: '/IMG_8258.jpeg', description: 'me with hand on cheek closest', type: 'photo' },
     { id: 11, url: '/IMG_8258.jpeg', description: 'me with hand on cheek further', type: 'photo' },
     { id: 12, url: '/IMG_8571.jpeg', description: 'me at kshmr', type: 'photo' },
     { id: 13, url: '/IMG_2374.JPG', description: 'me with fries at kinsman', type: 'photo' },
     { id: 14, url: '/291257EE-E610-49ED-927B-AF945471F8FF.jpg', description: 'me with da gurls in cruci', type: 'photo' },
     { id: 15, url: '/F0F926EE-72C5-453A-853C-D14F4EF3286F.jpg', description: 'me with da gurls in garden halls', type: 'photo' },
     { id: 16, url: '/IMG_3112.jpeg', description: 'me with ji chicken', type: 'photo' },
     { id: 17, url: '/IMG_2136.jpeg', description: 'me at cuckoo club', type: 'photo' },
     { id: 18, url: '/D67D1523-292D-4846-A84A-1AE86CA53CC8.jpg', description: 'me with scrubs party GANG', type: 'photo' },
     { id: 19, url: '/994EE4EA-6B66-4AA2-A3FC-93ECAEB7E0F3.jpg', description: 'me with scrubs party GANG 2', type: 'photo' },
     { id: 20, url: '/IMG_1652.JPG', description: 'me at omoide yokocho', type: 'photo' },
     { id: 21, url: '/IMG_5853.jpeg', description: 'me at hongdae pocha', type: 'photo' },
     { id: 22, url: '/FullSizeRender 2.jpeg', description: 'me w/ dior christmas tree', type: 'photo' },
     { id: 23, url: '/IMG_3254.jpeg', description: 'me w/ eiffel tower ave new york', type: 'photo' },
     { id: 24, url: '/IMG_0169.jpeg', description: 'me w/ dan mirror smiley', type: 'photo' },
     { id: 25, url: '/IMG_0188.jpeg', description: 'me w/ dan mirror schmexie', type: 'photo' },
     { id: 26, url: '/IMG_5104.jpeg', description: 'me w/ joss before heaven', type: 'photo' },
   ];
 
React.useEffect(() => {
     const votesRef = ref(db, 'totalVotes')
 
     const votesListener = onValue(votesRef, (snapshot) => {
       const data = snapshot.val() || { photoVotes: 0, promptVotes: 0 }
       console.log('Current votes data:', data)
       
       const photoVotes = Number(data.photoVotes) || 0
       const promptVotes = Number(data.promptVotes) || 0
       const totalVotesCount = photoVotes + promptVotes
 
       console.log('Calculated total votes:', {
         photoVotes, 
         promptVotes, 
         totalVotesCount
       })
 
       setTotalVotes(totalVotesCount)
     }, (error) => {
       console.error('Error fetching total votes:', error)
       setTotalVotes(0)
     })

     const eloRatingsRef = ref(db, 'photoEloRatings')
     const ratingsListener = onValue(eloRatingsRef, (snapshot) => {
       const data = snapshot.val() || {}
       
       const initialRatings = allPhotos.reduce((acc, photo) => {
         acc[photo.id] = data[photo.id] || INITIAL_RATING
         return acc
       }, {} as {[key: number]: number})
 
       setEloRatings(initialRatings)
     })
 
     const initialPair = getRandomPair()
     setCurrentPair(initialPair)
 
     return () => {
       votesListener()
       ratingsListener()
     }
   }, [])

  const calculateExpectedScore = (ratingA: number, ratingB: number): number => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  };

  const updateEloRatings = (
    winnerRating: number, 
    loserRating: number
  ): { winnerNewRating: number, loserNewRating: number } => {
    const expectedScore = calculateExpectedScore(winnerRating, loserRating);
    const winnerNewRating = winnerRating + K_FACTOR * (1 - expectedScore);
    const loserNewRating = loserRating - (winnerNewRating - winnerRating);
    return { winnerNewRating, loserNewRating };
  };

  const getRandomPair = (): Photo[] => {
    const available = [...allPhotos];
    if (available.length <= 1) return available;
    const sortedPhotos = available.sort((a, b) => 
      Math.abs((eloRatings[a.id] || INITIAL_RATING) - (eloRatings[b.id] || INITIAL_RATING))
    );
    const first = sortedPhotos.splice(Math.floor(Math.random() * sortedPhotos.length), 1)[0];
    const second = sortedPhotos[Math.floor(Math.random() * sortedPhotos.length)];
    return [first, second];
  };

  const handleChoice = async (winnerPhoto: Photo, loserPhoto: Photo): Promise<void> => {
    if (!userData) {
      console.error('No user data available')
      return
    }

    try {
      const userRef = ref(db, `users/${userData.id}`);
      const userSnapshot = await get(userRef);
      const currentUserData = userSnapshot.val();
      
      const newComparisons = (currentUserData?.comparisons || 0) + 1;
      const newPhotoComparisons = (currentUserData?.photoComparisons || 0) + 1;

      const winnerRating = eloRatings[winnerPhoto.id] || INITIAL_RATING;
      const loserRating = eloRatings[loserPhoto.id] || INITIAL_RATING;
      const { winnerNewRating, loserNewRating } = updateEloRatings(winnerRating, loserRating);

      const comparison = {
        timestamp: Date.now(),
        winner: winnerPhoto.id,
        loser: loserPhoto.id,
        winnerUrl: winnerPhoto.url,
        loserUrl: loserPhoto.url
      };

       const votesRef = ref(db, 'totalVotes/photoVotes')
            const snapshot = await get(votesRef)
            const currentVotes = snapshot.val() || 0

      const updates = {
        [`users/${userData.id}/comparisons`]: newComparisons,
        [`users/${userData.id}/photoComparisons`]: newPhotoComparisons,
        [`users/${userData.id}/lastActive`]: Date.now(),
        [`photoEloRatings/${winnerPhoto.id}`]: winnerNewRating,
        [`photoEloRatings/${loserPhoto.id}`]: loserNewRating,
        'totalVotes/photoVotes': currentVotes + 1,
        [`users/${userData.id}/photoComparisonsHistory`]: [
          ...(currentUserData?.photoComparisonsHistory || []),
          comparison
        ]
      };

      await update(ref(db), updates);

      setCurrentPair(getRandomPair());

    } catch (error) {
      console.error('Error updating ratings and user data:', error);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userRef = ref(db, `users/${storedUserId}`);
      return onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
        }
      });
    }
  }, []);

  useEffect(() => {
    const eloRatingsRef = ref(db, 'photoEloRatings');
    const unsubscribe = onValue(eloRatingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setEloRatings(data);
    });

    setCurrentPair(getRandomPair());

    return () => unsubscribe();
  }, []);

  if (currentPair.length === 0) {
    return <div>Loading...</div>;
  }

  const handleWelcomeComplete = async (newUserData: User) => {
      try {
        const userRef = ref(db, `users/${newUserData.id}`);
        
        await update(ref(db), {
          [`users/${newUserData.id}`]: newUserData
        });
        
        localStorage.setItem('userId', newUserData.id);
        
        setUserData(newUserData);
        
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

  if (!userData) {
    return <WelcomeModal onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="comparison-container">
      <div className="nav-buttons">
        <Link to="/" className="nav-button">Home</Link>
               {totalVotes >= 10 && (
                 <Link to="/analytics" className="nav-button">
                   View Analytics
                 </Link>
               )}
      </div>

      <h1 className="title">Choose the better photo</h1>
      
      <div className="photo-grid">
        {currentPair.map((photo, index) => (
          <div 
            key={photo.id} 
            className="photo-card"
            onClick={() => {
              const winnerPhoto = photo;
              const loserPhoto = currentPair[1 - index];
              handleChoice(winnerPhoto, loserPhoto);
            }}
          >
            <div className="photo-wrapper">
              <img 
                src={photo.url} 
                alt={photo.description}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>


            
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        Total comparisons performed (by the collective): {totalVotes}
      </div>

    </div>
  );
}

export default PhotoCompare;