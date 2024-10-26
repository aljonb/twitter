'use client';

import { useState, useEffect } from 'react';

interface Tweet {
  _id: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [tweet, setTweet] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await fetch('/api/tweets');
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
          fetchTweets(); // Refresh the tweets list
        }
      } catch (error) {
        console.error('Error saving tweet:', error);
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
          <div key={t._id} className="bg-gray-100 p-3 rounded-md mb-2">
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
