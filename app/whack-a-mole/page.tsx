"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Play, RotateCcw, Trophy, Clock, Target } from "lucide-react"

interface Mole {
  id: number
  isVisible: boolean
  timeoutId?: NodeJS.Timeout
}

export default function WhackAMolePage() {
  const [moles, setMoles] = useState<Mole[]>(Array.from({ length: 9 }, (_, i) => ({ id: i, isVisible: false })))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const difficultySettings = {
    easy: { showTime: 2000, hideTime: 1500, spawnChance: 0.3 },
    medium: { showTime: 1500, hideTime: 1000, spawnChance: 0.4 },
    hard: { showTime: 1000, hideTime: 800, spawnChance: 0.5 },
  }

  const spawnMole = useCallback(() => {
    if (!gameRunning) return

    const settings = difficultySettings[difficulty]
    const availableMoles = moles.filter((mole) => !mole.isVisible)

    if (availableMoles.length > 0 && Math.random() < settings.spawnChance) {
      const randomMole = availableMoles[Math.floor(Math.random() * availableMoles.length)]

      setMoles((prev) => prev.map((mole) => (mole.id === randomMole.id ? { ...mole, isVisible: true } : mole)))

      // Hide mole after showTime
      setTimeout(() => {
        setMoles((prev) => prev.map((mole) => (mole.id === randomMole.id ? { ...mole, isVisible: false } : mole)))
      }, settings.showTime)
    }
  }, [gameRunning, moles, difficulty])

  const whackMole = (moleId: number) => {
    setMoles((prev) =>
      prev.map((mole) => {
        if (mole.id === moleId && mole.isVisible) {
          setScore((s) => s + 10)
          return { ...mole, isVisible: false }
        }
        return mole
      }),
    )
  }

  useEffect(() => {
    if (!gameRunning) return

    const spawnInterval = setInterval(spawnMole, difficultySettings[difficulty].hideTime)
    return () => clearInterval(spawnInterval)
  }, [spawnMole, gameRunning, difficulty])

  useEffect(() => {
    if (!gameRunning || timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, gameRunning])

  useEffect(() => {
    if (timeLeft <= 0 && gameRunning) {
      setGameRunning(false)
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
      }
    }
  }, [timeLeft, gameRunning, score, highScore])

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
    setTimeLeft(60)
    setScore(0)
    setMoles((prev) => prev.map((mole) => ({ ...mole, isVisible: false })))
  }

  const resetGame = () => {
    setGameRunning(false)
    setGameOver(false)
    setTimeLeft(60)
    setScore(0)
    setMoles((prev) => prev.map((mole) => ({ ...mole, isVisible: false })))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Whack-a-Mole</h1>
          <div className="flex gap-2">
            {!gameRunning && (
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {moles.map((mole) => (
                    <div
                      key={mole.id}
                      className="relative aspect-square bg-gradient-to-b from-green-600 to-green-800 rounded-full border-4 border-green-700 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105"
                      onClick={() => whackMole(mole.id)}
                    >
                      {/* Hole */}
                      <div className="absolute inset-2 bg-black rounded-full shadow-inner">
                        {/* Mole */}
                        <div
                          className={`absolute inset-0 transition-transform duration-300 ${
                            mole.isVisible ? "translate-y-0" : "translate-y-full"
                          }`}
                        >
                          <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-4xl transform transition-all duration-200 hover:scale-110">
                            🐹
                          </div>
                        </div>
                      </div>

                      {/* Hit effect */}
                      {mole.isVisible && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 animate-ping"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {gameOver && (
                  <div className="text-center mt-8 p-6 bg-orange-500/20 rounded-lg border border-orange-400/30">
                    <h2 className="text-3xl font-bold text-white mb-2">🎯 Game Over! 🎯</h2>
                    <p className="text-orange-300 text-lg">Final Score: {score}</p>
                    <p className="text-orange-300">
                      {score > highScore ? "New High Score!" : `High Score: ${highScore}`}
                    </p>
                    <Button onClick={startGame} className="mt-4 bg-orange-600 hover:bg-orange-700">
                      Play Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Score & Timer */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-white">
                  <span>Current:</span>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>High Score:</span>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                    {highScore}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Time Left
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono text-white text-center">{timeLeft}s</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-red-400" />
                  Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={gameRunning}
                    className={`w-full ${
                      difficulty === level ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Click on moles when they pop up</li>
                  <li>• Each mole gives 10 points</li>
                  <li>• You have 60 seconds</li>
                  <li>• Higher difficulty = faster moles</li>
                  <li>• Try to beat your high score!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
