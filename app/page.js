// File: app/page.js
import ColleagueMatchingGame from './components/ColleagueMatchingGame';

export default function Home() {
  return (
    <main className="bg-white text-black container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Colleague Matching Game</h1>
      <ColleagueMatchingGame />
    </main>
  );
}