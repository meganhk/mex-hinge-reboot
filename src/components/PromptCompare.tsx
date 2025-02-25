import React, { useState, useEffect } from 'react'
import { ref, onValue, update, get } from 'firebase/database'
import { db } from '../firebase.ts'
import { Link } from 'react-router-dom'
import { Prompt } from '../types.ts'
import { User } from '../types.ts'


interface WelcomeModalProps {
  onComplete: (userData: User) => void;
}

import WelcomeModal from './WelcomeModal';


function PromptCompare() {
  const [userData, setUserData] = useState<User | null>(null);
  const allPrompts: Prompt[] = [
    { 
      id: 1, 
      question: "I'll pick the topic if you start the conversation:",
      answer: "the fake story of how we met",
      type: 'prompt' as const
    },
    { 
      id: 2, 
      question: "I'll fall for you if:",
      answer: "You know what all of these words mean: Beli, Strava, Shohei Ohtani, p<0.05",
      type: 'prompt' as const
    },
    { 
      id: 3, 
      question: "Let's debate this topic",
      answer: "peas or broccoli",
      type: 'prompt' as const
    },
    { 
      id: 4, 
      question: "A life goal of mine",
      answer: "Visit every country in the world. Also a marathon, maybe?",
      type: 'prompt' as const
    },
    { 
      id: 5, 
      question: "Two truths and a lie",
      answer: "I kill mice for a living, I have a black belt in kickboxing, my favourite musical is Hamilton.",
      type: 'prompt' as const
    },
    { 
      id: 7, 
      question: "What if I told you that:",
      answer: "I actually know where I want to eat",
      type: 'prompt' as const
    },
    { 
      id: 8, 
      question: "Teach me something about",
      answer: "What's wrong with you",
      type: 'prompt' as const
    },
    { 
      id: 9, 
      question: "Try to guess this about me",
      answer: "My go to coffee order",
      type: 'prompt' as const
    },
    { 
      id: 10, 
      question: "Try to guess this about me",
      answer: "My favourite book",
      type: 'prompt' as const
    },
    { 
      id: 11, 
      question: "We'll get along if",
      answer: "You can teach me poker and then discuss how game theory applies to our daily lives",
      type: 'prompt' as const
    },
    { 
        id: 12, 
        question: "Give me travel tips for:",
        answer: "Literally any country. Show me your favourite local haunts, or the bougiest/most viral spots.",
        type: 'prompt' as const
      },
      { 
        id: 13, 
        question: "First round is on me if",
        answer: "You can guess my drink order",
        type: 'prompt' as const
      },
      { 
        id: 14, 
        question: "Let's debate this topic",
        answer: "Favourite biscuit. Also, are jaffa cakes cakes, or biscuits?",
        type: 'prompt' as const
      },
  ]

  const K_FACTOR = 32
  const INITIAL_RATING = 1500

  const [eloRatings, setEloRatings] = React.useState<{[key: number]: number}>({})
  const [currentPair, setCurrentPair] = React.useState<Prompt[]>([])
  const [totalVotes, setTotalVotes] = React.useState(0)

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
       
       const initialRatings = allPrompts.reduce((acc, photo) => {
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
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  }

  const updateEloRatings = (
    winnerRating: number, 
    loserRating: number, 
    actualScore: number = 1
  ): { winnerNewRating: number, loserNewRating: number } => {
    const expectedScore = calculateExpectedScore(winnerRating, loserRating)
    
    const winnerNewRating = winnerRating + K_FACTOR * (actualScore - expectedScore)
    const loserNewRating = loserRating - (winnerNewRating - winnerRating)

    return { winnerNewRating, loserNewRating }
  }

  const getRandomPair = (): Prompt[] => {
    const available = [...allPrompts]
    
    if (available.length <= 1) return available

    const sortedPrompts = available.sort((a, b) => 
      Math.abs((eloRatings[a.id] || INITIAL_RATING) - (eloRatings[b.id] || INITIAL_RATING))
    )

    const first = sortedPrompts.splice(Math.floor(Math.random() * sortedPrompts.length), 1)[0]
    const second = sortedPrompts[Math.floor(Math.random() * sortedPrompts.length)]

    return [first, second]
  }

  const handleChoice = async (winnerPrompt: Prompt, loserPrompt: Prompt): Promise<void> => {
    if (!userData) {
      console.error('No user data available')
      return
    }
  
    try {

      const userRef = ref(db, `users/${userData.id}`);
      const userSnapshot = await get(userRef);
      const currentUserData = userSnapshot.val();

      const newComparisons = (currentUserData?.comparisons || 0) + 1;
      const newPromptComparisons = (currentUserData?.photoComparisons || 0) + 1;


      const winnerRating = eloRatings[winnerPrompt.id] || INITIAL_RATING
      const loserRating = eloRatings[loserPrompt.id] || INITIAL_RATING
  
      const { winnerNewRating, loserNewRating } = updateEloRatings(
        winnerRating, 
        loserRating
      )
  
      const comparison = {
        timestamp: Date.now(),
        winner: winnerPrompt.id,
        loser: loserPrompt.id,
        winnerQuestion: winnerPrompt.question,
        winnerAnswer: winnerPrompt.answer,
        loserQuestion: loserPrompt.question,
        loserAnswer: loserPrompt.answer
      }

      const votesRef = ref(db, 'totalVotes/promptVotes')
      const snapshot = await get(votesRef)
      const currentVotes = snapshot.val() || 0
  
      const updates: {[key: string]: any} = {
        [`users/${userData.id}/comparisons`]: newComparisons,
        [`promptEloRatings/${winnerPrompt.id}`]: winnerNewRating,
        [`promptEloRatings/${loserPrompt.id}`]: loserNewRating,
        'totalVotes/promptVotes': currentVotes + 1,
        [`users/${userData.id}/promptComparisons`]: newPromptComparisons,
        [`users/${userData.id}/promptComparisonsHistory`]: [
          ...(currentUserData?.promptComparisonsHistory || []),
          comparison
        ],
        [`users/${userData.id}/lastActive`]: Date.now()
      }
  
      await update(ref(db), updates)
      setCurrentPair(getRandomPair())
    } catch (error) {
      console.error('Error updating ratings and user data:', error)
    }
  }

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
    const eloRatingsRef = ref(db, 'promptEloRatings');
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

      <h1 className="title">Choose the better prompt</h1>
      <h2 className="subtitle">Just whatever one you'd actually reply to</h2>
      
      <div className="prompt-grid">
        {currentPair.map((prompt, index) => (
          <div 
            key={prompt.id} 
            className="prompt-card"
            onClick={() => {
              const winnerPrompt = prompt
              const loserPrompt = currentPair[1 - index]
              handleChoice(winnerPrompt, loserPrompt)
            }}
          >
            <div className="prompt-content">
              <h2 className="prompt-question">{prompt.question}</h2>
              <p className="prompt-answer">{prompt.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        Total comparisons performed (by the collective): {totalVotes}
      </div>

    </div>
  )
}

export default PromptCompare