import { useState } from 'react'

interface User {
  id: string;
  username?: string;
  gender: 'male' | 'female' | 'other';
  attractedTo: ('men' | 'women' | 'both')[];
  comparisons: number;
  lastActive: number;
}

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
            photoComparisons: 0,
            promptComparisons: 0,
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
                  className={`p-2 rounded border ${
                    userData.gender === gender 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                  className={`p-2 rounded border ${
                    userData.attractedTo?.[0] === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
            className="w-full bg-blue-500 text-white p-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Start Rating
          </button>
        </form>
      </div>
    </div>
  )
}

export default WelcomeModal