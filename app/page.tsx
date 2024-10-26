'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Tweet {
  _id: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [tweet, setTweet] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await fetch('/api/tweets', {
        cache: 'no-store'  // Ensures fresh data
      });
      if (response.ok) {
        const data = await response.json();
        setTweets(data);
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch('/api/tweets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: tweet }),
          });

          if (response.ok) {
            setTweet('');
            router.refresh();
            await fetchTweets();
            break;
          } else if (response.status === 504) {
            attempts++;
            if (attempts === maxAttempts) {
              throw new Error('Operation timed out after multiple attempts');
            }
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error('Error saving tweet:', error);
          if (attempts === maxAttempts) {
            alert('Failed to save tweet. Please try again later.');
          }
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Tweet Form</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          className="w-full p-2 border rounded-md resize-none"
          rows={3}
          placeholder="What's happening?"
          maxLength={280}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Tweet
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Tweets</h2>
        {tweets.map((t) => (
          <div key={t._id} className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 p-3 rounded-md mb-2">
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
