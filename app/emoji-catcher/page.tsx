"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Play, Pause, RotateCcw, Trophy, Zap } from "lucide-react"

interface FallingEmoji {
  id: number
  emoji: string
  x: number
  y: number
  speed: number
  points: number
}

interface PowerUp {
  id: number
  type: "slow" | "double" | "magnet"
  x: number
  y: number
  speed: number
}

export default function EmojiCatcherPage() {
  const [basketPosition, setBasketPosition] = useState(50)
  const [fallingEmojis, setFallingEmojis] = useState<FallingEmoji[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [activePowerUps, setActivePowerUps] = useState<{ [key: string]: number }>({})

  const emojis = [
    { emoji: "🍎", points: 10 },
    { emoji: "🍌", points: 15 },
    { emoji: "🍓", points: 20 },
    { emoji: "🥝", points: 25 },
    { emoji: "🍇", points: 30 },
    { emoji: "💎", points: 50 },
    { emoji: "⭐", points: 40 },
    { emoji: "🎁", points: 35 },
  ]

  const powerUpTypes = [
    { type: "slow" as const, emoji: "⏰", effect: "Slow down emojis" },
    { type: "double" as const, emoji: "✨", effect: "Double points" },
    { type: "magnet" as const, emoji: "🧲", effect: "Attract nearby emojis" },
  ]

  const spawnEmoji = useCallback(() => {
    const emojiData = emojis[Math.floor(Math.random() * emojis.length)]
    const newEmoji: FallingEmoji = {
      id: Date.now() + Math.random(),
      emoji: emojiData.emoji,
      x: Math.random() * 90,
      y: -5,
      speed: 1 + level * 0.2 + Math.random() * 0.5,
      points: emojiData.points,
    }
    setFallingEmojis((prev) => [...prev, newEmoji])
  }, [level])

  const spawnPowerUp = useCallback(() => {
    if (Math.random() < 0.1) {
      // 10% chance
      const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
      const newPowerUp: PowerUp = {
        id: Date.now() + Math.random(),
        type: powerUpType.type,
        x: Math.random() * 90,
        y: -5,
        speed: 0.8,
      }
      setPowerUps((prev) => [...prev, newPowerUp])
    }
  }, [])

  const moveBasket = useCallback((e: MouseEvent | TouchEvent) => {
    const gameArea = document.getElementById("game-area")
    if (!gameArea) return

    const rect = gameArea.getBoundingClientRect()
    let clientX: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }

    const x = ((clientX - rect.left) / rect.width) * 100
    setBasketPosition(Math.max(5, Math.min(95, x)))
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => moveBasket(e)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      moveBasket(e)
    }

    if (gameRunning) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [gameRunning, moveBasket])

  useEffect(() => {
    if (!gameRunning) return

    const gameLoop = setInterval(() => {
      // Move emojis
      setFallingEmojis((prev) => {
        const updated = prev.map((emoji) => ({
          ...emoji,
          y: emoji.y + (activePowerUps.slow > Date.now() ? emoji.speed * 0.5 : emoji.speed),
        }))

        // Check collisions with basket
        const basketLeft = basketPosition - 5
        const basketRight = basketPosition + 5
        const basketTop = 85

        updated.forEach((emoji) => {
          if (emoji.y >= basketTop && emoji.y <= basketTop + 5 && emoji.x >= basketLeft && emoji.x <= basketRight) {
            const points = activePowerUps.double > Date.now() ? emoji.points * 2 : emoji.points
            setScore((s) => s + points)
            emoji.y = 200 // Mark for removal
          }
        })

        // Remove emojis that hit the bottom or were caught
        const remaining = updated.filter((emoji) => {
          if (emoji.y > 100) {
            if (emoji.y !== 200) {
              // Not caught
              setLives((l) => l - 1)
            }
            return false
          }
          return true
        })

        return remaining
      })

      // Move power-ups
      setPowerUps((prev) => {
        const updated = prev.map((powerUp) => ({
          ...powerUp,
          y: powerUp.y + powerUp.speed,
        }))

        // Check collisions with basket
        const basketLeft = basketPosition - 5
        const basketRight = basketPosition + 5
        const basketTop = 85

        updated.forEach((powerUp) => {
          if (
            powerUp.y >= basketTop &&
            powerUp.y <= basketTop + 5 &&
            powerUp.x >= basketLeft &&
            powerUp.x <= basketRight
          ) {
            setActivePowerUps((prev) => ({
              ...prev,
              [powerUp.type]: Date.now() + 5000, // 5 seconds
            }))
            powerUp.y = 200 // Mark for removal
          }
        })

        return updated.filter((powerUp) => powerUp.y <= 100 && powerUp.y !== 200)
      })

      // Spawn new emojis
      if (Math.random() < 0.3 + level * 0.1) {
        spawnEmoji()
      }

      // Spawn power-ups
      spawnPowerUp()
    }, 50)

    return () => clearInterval(gameLoop)
  }, [gameRunning, basketPosition, level, activePowerUps, spawnEmoji, spawnPowerUp])

  useEffect(() => {
    if (lives <= 0) {
      setGameRunning(false)
      setGameOver(true)
    }
  }, [lives])

  useEffect(() => {
    if (score > 0 && score % 500 === 0) {
      setLevel((prev) => prev + 1)
    }
  }, [score])

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
  }

  const pauseGame = () => {
    setGameRunning(false)
  }

  const resetGame = () => {
    setFallingEmojis([])
    setPowerUps([])
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameRunning(false)
    setGameOver(false)
    setActivePowerUps({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Emoji Catcher</h1>
          <div className="flex gap-2">
            {!gameRunning && !gameOver && (
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            {gameRunning && (
              <Button onClick={pauseGame} className="bg-yellow-600 hover:bg-yellow-700">
                <Pause className="w-4 h-4 mr-2" />
                Pause
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
              <CardContent className="p-0">
                <div
                  id="game-area"
                  className="relative w-full h-96 bg-gradient-to-b from-sky-400 to-sky-600 overflow-hidden cursor-none"
                >
                  {/* Falling Emojis */}
                  {fallingEmojis.map((emoji) => (
                    <div
                      key={emoji.id}
                      className="absolute text-2xl transition-all duration-75 pointer-events-none"
                      style={{
                        left: `${emoji.x}%`,
                        top: `${emoji.y}%`,
                        transform:
                          activePowerUps.magnet > Date.now() && Math.abs(emoji.x - basketPosition) < 15 && emoji.y > 70
                            ? `translateX(${basketPosition > emoji.x ? "10px" : "-10px"})`
                            : "none",
                      }}
                    >
                      {emoji.emoji}
                    </div>
                  ))}

                  {/* Power-ups */}
                  {powerUps.map((powerUp) => (
                    <div
                      key={powerUp.id}
                      className="absolute text-xl transition-all duration-75 pointer-events-none animate-pulse"
                      style={{
                        left: `${powerUp.x}%`,
                        top: `${powerUp.y}%`,
                      }}
                    >
                      {powerUpTypes.find((p) => p.type === powerUp.type)?.emoji}
                    </div>
                  ))}

                  {/* Basket */}
                  <div
                    className="absolute bottom-4 text-4xl transition-all duration-100 pointer-events-none"
                    style={{
                      left: `${basketPosition}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    🧺
                  </div>

                  {/* Game Over Overlay */}
                  {gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                        <p className="text-xl mb-4">Final Score: {score}</p>
                        <p className="text-lg mb-6">Level Reached: {level}</p>
                        <Button onClick={resetGame} className="bg-orange-600 hover:bg-orange-700">
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pause Overlay */}
                  {!gameRunning && !gameOver && score > 0 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Paused</h2>
                        <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                          Resume
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Score & Lives */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-white">
                  <span>Score:</span>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Lives:</span>
                  <div className="flex">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < lives ? "text-red-400" : "text-gray-600"}`}>
                        ❤️
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-white">
                  <span>Level:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Active Power-ups */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-400" />
                  Power-ups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(activePowerUps).map(([type, endTime]) => {
                  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
                  const powerUpInfo = powerUpTypes.find((p) => p.type === type)

                  if (remaining <= 0) return null

                  return (
                    <div key={type} className="flex items-center justify-between text-white text-sm">
                      <span className="flex items-center">
                        <span className="mr-2">{powerUpInfo?.emoji}</span>
                        {powerUpInfo?.effect}
                      </span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {remaining}s
                      </Badge>
                    </div>
                  )
                })}
                {Object.keys(activePowerUps).length === 0 && (
                  <p className="text-gray-400 text-sm">No active power-ups</p>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Move mouse/finger to control basket</li>
                  <li>• Catch falling emojis for points</li>
                  <li>• Avoid missing emojis (lose lives)</li>
                  <li>• Collect power-ups for bonuses</li>
                  <li>• Level up every 500 points</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
