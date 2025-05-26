"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Play, Pause, RotateCcw, Trophy, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface Position {
  x: number
  y: number
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

export default function SnakeGamePage() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(150)

  const GRID_SIZE = 20

  const generateFood = useCallback(() => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const moveSnake = useCallback(() => {
    if (!gameRunning) return

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      switch (direction) {
        case "UP":
          head.y -= 1
          break
        case "DOWN":
          head.y += 1
          break
        case "LEFT":
          head.x -= 1
          break
        case "RIGHT":
          head.x += 1
          break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameRunning(false)
        setGameOver(true)
        return currentSnake
      }

      // Check self collision
      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameRunning(false)
        setGameOver(true)
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10
          if (newScore > highScore) {
            setHighScore(newScore)
          }
          return newScore
        })
        setFood(generateFood())
        // Increase speed slightly
        setSpeed((prev) => Math.max(80, prev - 2))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameRunning, generateFood, highScore])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP")
          break
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN")
          break
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT")
          break
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT")
          break
      }
    },
    [direction, gameRunning],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed)
    return () => clearInterval(gameInterval)
  }, [moveSnake, speed])

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
  }

  const pauseGame = () => {
    setGameRunning(false)
  }

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood({ x: 15, y: 15 })
    setDirection("RIGHT")
    setGameRunning(false)
    setGameOver(false)
    setScore(0)
    setSpeed(150)
  }

  const handleDirectionClick = (newDirection: Direction) => {
    if (!gameRunning) return

    const opposites = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    }

    if (direction !== opposites[newDirection]) {
      setDirection(newDirection)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Snake Game</h1>
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
              <CardContent className="p-4">
                <div className="relative bg-black rounded-lg p-4 mx-auto" style={{ width: "600px", height: "600px" }}>
                  {/* Game Grid */}
                  <div className="relative w-full h-full">
                    {/* Snake */}
                    {snake.map((segment, index) => (
                      <div
                        key={index}
                        className={`absolute transition-all duration-75 ${
                          index === 0 ? "bg-green-400 border-2 border-green-300" : "bg-green-500"
                        } rounded-sm`}
                        style={{
                          left: `${(segment.x / GRID_SIZE) * 100}%`,
                          top: `${(segment.y / GRID_SIZE) * 100}%`,
                          width: `${100 / GRID_SIZE}%`,
                          height: `${100 / GRID_SIZE}%`,
                        }}
                      />
                    ))}

                    {/* Food */}
                    <div
                      className="absolute bg-red-500 rounded-full animate-pulse"
                      style={{
                        left: `${(food.x / GRID_SIZE) * 100}%`,
                        top: `${(food.y / GRID_SIZE) * 100}%`,
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                      }}
                    />

                    {/* Game Over Overlay */}
                    {gameOver && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                          <p className="text-xl mb-4">Score: {score}</p>
                          <p className="text-lg mb-6">Length: {snake.length}</p>
                          <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                            Play Again
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Pause Overlay */}
                    {!gameRunning && !gameOver && score > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <h2 className="text-3xl font-bold mb-4">Paused</h2>
                          <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                            Resume
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Controls */}
                <div className="mt-6 lg:hidden">
                  <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                    <div></div>
                    <Button
                      onClick={() => handleDirectionClick("UP")}
                      className="bg-green-600 hover:bg-green-700 aspect-square"
                    >
                      <ArrowUp className="w-6 h-6" />
                    </Button>
                    <div></div>
                    <Button
                      onClick={() => handleDirectionClick("LEFT")}
                      className="bg-green-600 hover:bg-green-700 aspect-square"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div></div>
                    <Button
                      onClick={() => handleDirectionClick("RIGHT")}
                      className="bg-green-600 hover:bg-green-700 aspect-square"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                    <div></div>
                    <Button
                      onClick={() => handleDirectionClick("DOWN")}
                      className="bg-green-600 hover:bg-green-700 aspect-square"
                    >
                      <ArrowDown className="w-6 h-6" />
                    </Button>
                    <div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Score */}
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
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>High Score:</span>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                    {highScore}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Length:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {snake.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-400" />
                  Game Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-white">
                  <span>Speed:</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {Math.round((200 - speed) / 10)}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Direction:</span>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                    {direction}
                  </Badge>
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
                  <li>• Use arrow keys to control snake</li>
                  <li>• Eat red food to grow and score</li>
                  <li>• Avoid walls and your own tail</li>
                  <li>• Game speeds up as you grow</li>
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
