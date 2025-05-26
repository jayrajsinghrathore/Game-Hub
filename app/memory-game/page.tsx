"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, RotateCcw, Clock, Trophy, Star } from "lucide-react"

interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryGamePage() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const emojis = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸", "🎺"]

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis]
    const shuffledCards = gameEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameWon(false)
    setTimer(0)
    setGameStarted(false)
  }

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameWon])

  useEffect(() => {
    if (matches === emojis.length) {
      setGameWon(true)
    }
  }, [matches])

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true)

    if (flippedCards.length === 2) return
    if (flippedCards.includes(cardId)) return
    if (cards[cardId].isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)))

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const [firstCard, secondCard] = newFlippedCards.map((id) => cards[id])

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              newFlippedCards.includes(card.id) ? { ...card, isMatched: true, isFlipped: true } : card,
            ),
          )
          setMatches((prev) => prev + 1)
          setFlippedCards([])
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (newFlippedCards.includes(card.id) ? { ...card, isFlipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreRating = () => {
    if (moves <= 12) return { rating: 3, text: "Perfect!" }
    if (moves <= 18) return { rating: 2, text: "Great!" }
    return { rating: 1, text: "Good!" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Memory Match</h1>
          <Button onClick={initializeGame} className="bg-purple-600 hover:bg-purple-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className={`
                        aspect-square text-4xl rounded-lg border-2 transition-all duration-500 transform
                        ${
                          card.isFlipped || card.isMatched
                            ? "bg-white/20 border-white/40 scale-105"
                            : "bg-purple-500/30 border-purple-400/50 hover:bg-purple-400/40 hover:scale-105"
                        }
                        ${card.isMatched ? "ring-2 ring-green-400" : ""}
                      `}
                      disabled={card.isFlipped || card.isMatched || flippedCards.length === 2}
                    >
                      {card.isFlipped || card.isMatched ? card.emoji : "?"}
                    </button>
                  ))}
                </div>

                {gameWon && (
                  <div className="text-center mt-8 p-6 bg-green-500/20 rounded-lg border border-green-400/30">
                    <h2 className="text-3xl font-bold text-white mb-2">🎉 Congratulations! 🎉</h2>
                    <p className="text-green-300 text-lg">{getScoreRating().text}</p>
                    <div className="flex justify-center mt-2">
                      {Array.from({ length: getScoreRating().rating }).map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono text-white text-center">{formatTime(timer)}</div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-white">
                  <span>Moves:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {moves}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Matches:</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {matches}/{emojis.length}
                  </Badge>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(matches / emojis.length) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Click cards to flip them</li>
                  <li>• Match pairs of emojis</li>
                  <li>• Complete in fewer moves for better score</li>
                  <li>• Try to beat your best time!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
