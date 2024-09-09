'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Eye, Edit } from 'lucide-react';
import ColleagueEditor from './ColleagueEditor';

const API_URL = '/api/colleagues';

const ColleagueMatchingGame = () => {
  const [photos, setPhotos] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [matchedDescriptions, setMatchedDescriptions] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameState, setGameState] = useState('playing');
  const [dragTarget, setDragTarget] = useState(null);
  const [totalDescriptions, setTotalDescriptions] = useState(0);
  const [allDescriptions, setAllDescriptions] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchColleagues();
  }, []);

  const fetchColleagues = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setColleagues(data);
      initializeGame(data);
    } catch (error) {
      console.error('Error fetching colleagues:', error);
    }
  };

  const handleSaveColleagues = async (colleagueData) => {
    try {
      const method = colleagueData.id ? 'PUT' : 'POST';
      const url = colleagueData.id ? `${API_URL}/${colleagueData.id}` : API_URL;

      // Ensure descriptions is an array
      const sanitizedData = {
        ...colleagueData,
        descriptions: Array.isArray(colleagueData.descriptions) ? colleagueData.descriptions : []
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchColleagues(); // Refresh the colleagues list
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving colleague:', error);
    }
  };

  const initializeGame = (currentColleagues = colleagues) => {
    const total = currentColleagues.reduce((sum, colleague) => sum + (colleague.descriptions?.length || 0), 0);
    setTotalDescriptions(total);
    setPhotos(currentColleagues.map(col => ({ id: col.id, content: col.photo, name: col.name })));
    const shuffledDescriptions = shuffleArray(currentColleagues.flatMap(col => 
      (col.descriptions || []).map(desc => ({ id: col.id, content: desc }))
    ));
    setDescriptions(shuffledDescriptions);
    setAllDescriptions(shuffledDescriptions);
    setMatchedDescriptions({});
    setScore(0);
    setTimeLeft(35);
    setGameState('playing');
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, timeLeft]);

  const resetGame = () => {
    initializeGame();
  };

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    setDragTarget(id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDragEnter = (e) => {
    e.target.classList.add('bg-yellow-200');
  };

  const onDragLeave = (e) => {
    e.target.classList.remove('bg-yellow-200');
  };

  const onDrop = (e, targetId) => {
    e.preventDefault();
    e.target.classList.remove('bg-yellow-200');
    const draggedDescription = JSON.parse(e.dataTransfer.getData('description'));
    setDragTarget(null);
    
    setMatchedDescriptions(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), draggedDescription]
    }));
    setDescriptions(prevDescriptions => 
      prevDescriptions.filter(desc => desc.content !== draggedDescription.content)
    );
  };

  const endGame = () => {
    setGameState('finished');
    let correctMatches = 0;
    Object.entries(matchedDescriptions).forEach(([colleagueId, descriptions]) => {
      const colleague = colleagues.find(col => col.id === parseInt(colleagueId));
      if (colleague && Array.isArray(colleague.descriptions)) {
        correctMatches += descriptions.filter(desc => colleague.descriptions.includes(desc.content)).length;
      }
    });
    setScore(correctMatches);
  };

  const revealAnswers = () => {
    setGameState('revealed');
    const allMatched = colleagues.reduce((acc, colleague) => {
      if (colleague && Array.isArray(colleague.descriptions)) {
        acc[colleague.id] = colleague.descriptions.map(desc => ({ id: colleague.id, content: desc }));
      }
      return acc;
    }, {});
    setMatchedDescriptions(allMatched);
    setDescriptions([]);
  };

  const getTimerClasses = () => {
    const baseClasses = "font-bold";
    if (timeLeft <= 30 && gameState === 'playing') {
      return `${baseClasses} text-red-600 animate-pulse`;
    }
    return baseClasses;
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold">Score: {score} / {totalDescriptions}</p>
        <p className={getTimerClasses()}>
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        <button 
          onClick={resetGame}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <RefreshCw className="mr-2" size={16} /> Reset Game
        </button>
        <button 
          onClick={revealAnswers}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Eye className="mr-2" size={16} /> Reveal Answers
        </button>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Edit className="mr-2" size={16} /> {isEditing ? 'Close Editor' : 'Edit Colleagues'}
        </button>
      </div>
      {gameState === 'finished' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold flex items-center">
            <AlertCircle className="mr-2" size={16} /> Game Over!
          </p>
          <p>You&apos;ve matched {score} out of {totalDescriptions} descriptions correctly.</p>
        </div>
      )}
      {isEditing ? (
        <ColleagueEditor 
          colleagues={colleagues.map(c => ({...c, descriptions: Array.isArray(c.descriptions) ? c.descriptions : []}))} 
          onSave={handleSaveColleagues} 
        />
      ) : (
        <>
          <div className="flex flex-wrap justify-center">
            {photos.map((photo, index) => (
              <div key={photo.id} className="m-2 bg-white p-4 rounded shadow">
                <img src={photo.content} alt={`Colleague ${index + 1}`} className="w-24 h-24 object-cover mb-2" />
                <div 
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, photo.id)}
                  className="min-h-[50px] bg-gray-200 p-2 text-center transition-colors duration-200"
                >
                  {photo.name}
                </div>
                <div className="mt-2 text-sm">
                  <h4 className="font-bold">Descriptions:</h4>
                  <ul className="list-disc list-inside">
                    {(gameState === 'revealed' ? allDescriptions.filter(desc => desc.id === photo.id) : matchedDescriptions[photo.id] || []).map((desc, i) => (
                      <li key={i} className={
                        gameState === 'finished' && colleagues.find(col => col.id === photo.id)?.descriptions?.includes(desc.content) === false
                          ? 'text-red-500'
                          : ''
                      }>
                        {desc.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          {gameState === 'playing' && (
            <div className="mt-8">
              {descriptions.map((desc) => (
                <div
                  key={`${desc.id}-${desc.content}`}
                  draggable
                  onDragStart={(e) => {
                    onDragStart(e, desc.id);
                    e.dataTransfer.setData('description', JSON.stringify(desc));
                  }}
                  className="bg-blue-100 p-2 mb-2 rounded cursor-move transition-transform duration-200 hover:scale-105"
                >
                  {desc.content}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ColleagueMatchingGame;