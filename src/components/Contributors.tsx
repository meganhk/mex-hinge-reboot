import React, { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase.ts'
import { User } from '../types.ts'
import { push, set } from 'firebase/database'

// Function to save a response to Firebase
export const saveResponse = (userId, message, metadata = {}) => {
  const responsesRef = ref(db, 'responses')
  const newResponseRef = push(responsesRef)
  
  return set(newResponseRef, {
    userId,
    message,
    timestamp: Date.now(),
    ...metadata
  })
}

function Contributors() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const usersRef = ref(db, 'users')
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const userArray = Object.values(data) as User[]
        const sortedUsers = userArray.sort((a, b) => b.comparisons - a.comparisons)
        setUsers(sortedUsers)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-fixed min-h-screen h-full bg-[linear-gradient(180deg,transparent_70%,#FFFFFF_70%,#FCFCFC_85%,#EFEFEF_100%)]">
      <div className="z-50 font-sans text-sm sm:text-base absolute top-0 w-full flex flex-row justify-between p-5">
        <a href="/" className="nav-button hover:bg-[#bd87c4] transition-colors duration-200">
          Home
        </a>
      </div>

      <div className="text-center relative mx-auto flex max-w-2xl flex-col gap-0 overflow-visible sm:p-4 pt-32">
        <div className="mt-16 h-20">
          <h1 className="text-5xl font-bold">
            Top Contributors
          </h1>
        </div>

        <div className="relative mx-auto w-full max-w bg-white rounded-lg shadow-md mx-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-16 py-3 px-4 text-left text-sm font-semibold text-gray-600 pl-4">#</th>
                <th className="w-full py-3 px-4 text-center text-sm font-semibold text-gray-600">Username</th>
                <th className="w-32 py-3 px-4 text-right text-sm font-semibold text-gray-600 pr-4">Number of Comparisons Made</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-yellow-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 text-sm text-gray-500 pl-4">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-center">
                    {user.username || 'Anonymous'}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-500 pr-4">
                    {user.comparisons}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full pb-2 pt-8 text-center text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default Contributors