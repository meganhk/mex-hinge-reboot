import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.ts';
import { Link } from 'react-router-dom';
import { Photo, Prompt } from '../types.ts';

interface EloRatings {
  [key: number]: number;
}

interface FormData {
  name: string;
  contact: string;
  message: string;
}

function Analytics() {
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

  const allPrompts: Prompt[] = [
    { 
      id: 1, 
      question: "I'll pick the topic if you start the conversation:",
      answer: "the fake story of how we met",
      type: 'prompt'
    },
    { 
      id: 2, 
      question: "I'll fall for you if:",
      answer: "You know what all of these words mean: Beli, Strava, Shohei Ohtani, p<0.05",
      type: 'prompt'
    },
    { 
      id: 3, 
      question: "Let's debate this topic",
      answer: "peas or broccoli",
      type: 'prompt'
    },
    { 
      id: 4, 
      question: "A life goal of mine",
      answer: "Visit every country in the world. Also a marathon, maybe?",
      type: 'prompt'
    },
    { 
      id: 5, 
      question: "Two truths and a lie",
      answer: "I kill mice for a living, I have a black belt in kickboxing, my favourite musical is Hamilton.",
      type: 'prompt'
    },
    { 
      id: 6, 
      question: "The best way to ask me out is by",
      answer: "Picking out a restaurant and making the reservation.",
      type: 'prompt'
    },
    { 
      id: 7, 
      question: "What if I told you that:",
      answer: "I actually know where I want to eat",
      type: 'prompt'
    },
    { 
      id: 8, 
      question: "Teach me something about",
      answer: "What's wrong with you",
      type: 'prompt'
    },
    { 
      id: 9, 
      question: "Try to guess this about me",
      answer: "My go to coffee order",
      type: 'prompt'
    },
    { 
      id: 10, 
      question: "Try to guess this about me",
      answer: "My favourite book",
      type: 'prompt'
    },
    { 
      id: 11, 
      question: "We'll get along if",
      answer: "You can teach me poker and then discuss how game theory applies to our daily lives",
      type: 'prompt'
    },
    { 
      id: 12, 
      question: "Give me travel tips for:",
      answer: "Literally any country. Show me your favourite local haunts, or the bougiest/most viral spots.",
      type: 'prompt'
    },
    { 
      id: 13, 
      question: "First round is on me if",
      answer: "You can guess my drink order",
      type: 'prompt'
    },
    { 
      id: 14, 
      question: "Let's debate this topic",
      answer: "Favourite biscuit. Also, are jaffa cakes cakes, or biscuits?",
      type: 'prompt'
    },
  ];

  const K_FACTOR = 32;
  const INITIAL_RATING = 1500;

  const [showBest, setShowBest] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Photo | Prompt | null>(null);
  const [photoEloRatings, setPhotoEloRatings] = useState<EloRatings>({});
  const [promptEloRatings, setPromptEloRatings] = useState<EloRatings>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact: '',
    message: ''
  });


  useEffect(() => {
    const photoRatingsRef = ref(db, 'photoEloRatings');
    const photoRatingsListener = onValue(photoRatingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      const initialPhotoRatings = allPhotos.reduce((acc, photo) => {
        acc[photo.id] = data[photo.id] || INITIAL_RATING;
        return acc;
      }, {} as EloRatings);

      setPhotoEloRatings(initialPhotoRatings);
    });

    const promptRatingsRef = ref(db, 'promptEloRatings');
    const promptRatingsListener = onValue(promptRatingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      const initialPromptRatings = allPrompts.reduce((acc, prompt) => {
        acc[prompt.id] = data[prompt.id] || INITIAL_RATING;
        return acc;
      }, {} as EloRatings);

      setPromptEloRatings(initialPromptRatings);
    });

    return () => {
      photoRatingsListener();
      promptRatingsListener();
    };
  }, []);

  const sortedPhotos = [...allPhotos]
    .map(photo => ({
      ...photo,
      rating: photoEloRatings[photo.id] || INITIAL_RATING
    }))
    .sort((a, b) => showBest ? b.rating - a.rating : a.rating - b.rating)
    .slice(0, 6);

  const sortedPrompts = [...allPrompts]
    .map(prompt => ({
      ...prompt,
      rating: promptEloRatings[prompt.id] || INITIAL_RATING
    }))
    .sort((a, b) => showBest ? b.rating - a.rating : a.rating - b.rating)
    .slice(0, 3);

  const profileLayout = [
    { type: 'photo', index: 0 },
    { type: 'prompt', index: 0 },
    { type: 'photo', index: 1 },
    { type: 'photo', index: 2 },
    { type: 'prompt', index: 1 },
    { type: 'photo', index: 3 },
    { type: 'prompt', index: 2 },
    { type: 'photo', index: 4 },
    { type: 'photo', index: 5 },
  ];

  const handleInteraction = (item: Photo | Prompt): void => {
    setSelectedItem(item)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  };

  const handleEloUpdate = async (item: Photo | Prompt) => {
  }

  return (
    <div className="container">
      <div className="nav-buttons">
        <Link to="/" className="nav-button">Home</Link>
      </div>

      <h1 className="title">Profile Analytics</h1>
      
      <div className="toggle-container">
        <button 
          className={`toggle-button ${showBest ? 'active' : ''}`}
          onClick={() => setShowBest(true)}
        >
          Best Performing
        </button>
        <button 
          className={`toggle-button ${!showBest ? 'active' : ''}`}
          onClick={() => setShowBest(false)}
        >
          Worst Performing
        </button>
      </div>

      
      <div className="profile-layout">
        {profileLayout.map((item, idx) => (
          <div key={idx} className="profile-item-container">
            <div className={`profile-item ${item.type}`}>
              {item.type === 'photo' ? (
                <div className="photo-card analytics">
                  <div className="photo-wrapper">
                    <img 
                      src={sortedPhotos[item.index].url} 
                      alt={sortedPhotos[item.index].description} 
                    />
                  </div>
                  <button 
                    className="like-button"
                    onClick={() => {
                      handleInteraction(sortedPhotos[item.index]);
                      handleEloUpdate(sortedPhotos[item.index]);
                    }}
                  >
                    ♡
                  </button>
                </div>
              ) : (
                <div className="prompt-card analytics">
                  <div className="prompt-content">
                    <h3 className="prompt-question">{sortedPrompts[item.index].question}</h3>
                    <p className="prompt-answer">{sortedPrompts[item.index].answer}</p>
                  </div>
                  <button 
                    className="like-button"
                    onClick={() => {
                      handleInteraction(sortedPrompts[item.index]);
                      handleEloUpdate(sortedPrompts[item.index]);
                    }}
                  >
                    ♡
                  </button>
                </div>
              )}
            </div>

            {selectedItem && 
             ((item.type === 'photo' && selectedItem.id === sortedPhotos[item.index].id) || 
              (item.type === 'prompt' && selectedItem.id === sortedPrompts[item.index].id)) && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Your contact info"
                    value={formData.contact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({...formData, contact: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  
                  <textarea
                    placeholder="Type a message..."
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="nav-button"
                    >
                      Start a chat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedItem(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default Analytics;