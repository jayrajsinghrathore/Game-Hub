"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, RotateCcw, Trophy, Clock, Shuffle, CheckCircle } from "lucide-react"

type PuzzleSize = 3 | 4

interface Tile {
  id: number
  value: number
  isEmpty: boolean
}

export default function SlidingPuzzlePage() {
  const [puzzleSize, setPuzzleSize] = useState<PuzzleSize>(3)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [bestTime, setBestTime] = useState<{ [key: number]: number }>({ 3: 0, 4: 0 })
  const [bestMoves, setBestMoves] = useState<{ [key: number]: number }>({ 3: 0, 4: 0 })

  const initializePuzzle = (size: PuzzleSize) => {
    const totalTiles = size * size
    const newTiles: Tile[] = []

    for (let i = 1; i < totalTiles; i++) {
      newTiles.push({
        id: i,
        value: i,
        isEmpty: false,
      })
    }

    // Add empty tile
    newTiles.push({
      id: totalTiles,
      value: totalTiles,
      isEmpty: true,
    })

    setTiles(newTiles)
    setMoves(0)
    setTimer(0)
    setGameStarted(false)
    setIsComplete(false)
  }

  const shufflePuzzle = () => {
    if (tiles.length === 0) return

    const shuffled = [...tiles]
    const size = puzzleSize

    // Perform random valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = shuffled.findIndex((tile) => tile.isEmpty)
      const emptyRow = Math.floor(emptyIndex / size)
      const emptyCol = emptyIndex % size

      const possibleMoves = []

      // Check all four directions
      if (emptyRow > 0) possibleMoves.push(emptyIndex - size) // Up
      if (emptyRow < size - 1) possibleMoves.push(emptyIndex + size) // Down
      if (emptyCol > 0) possibleMoves.push(emptyIndex - 1) // Left
      if (emptyCol < size - 1) possibleMoves.push(emptyIndex + 1) // Right

      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
        // Swap empty tile with random adjacent tile
        ;[shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]]
      }
    }

    setTiles(shuffled)
    setMoves(0)
    setTimer(0)
    setGameStarted(true)
    setIsComplete(false)
  }

  const checkWin = (currentTiles: Tile[]) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i].value !== i + 1) {
        return false
      }
    }
    return currentTiles[currentTiles.length - 1].isEmpty
  }

  const moveTile = (clickedIndex: number) => {
    if (isComplete) return

    const emptyIndex = tiles.findIndex((tile) => tile.isEmpty)
    const clickedRow = Math.floor(clickedIndex / puzzleSize)
    const clickedCol = clickedIndex % puzzleSize
    const emptyRow = Math.floor(emptyIndex / puzzleSize)
    const emptyCol = emptyIndex % puzzleSize

    // Check if the clicked tile is adjacent to the empty space
    const isAdjacent =
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow)

    if (isAdjacent) {
      const newTiles = [...tiles]
      ;[newTiles[clickedIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[clickedIndex]]

      setTiles(newTiles)
      setMoves((prev) => prev + 1)

      if (!gameStarted) {
        setGameStarted(true)
      }

      if (checkWin(newTiles)) {
        setIsComplete(true)
        setGameStarted(false)

        // Update best scores
        if (bestTime[puzzleSize] === 0 || timer < bestTime[puzzleSize]) {
          setBestTime((prev) => ({ ...prev, [puzzleSize]: timer }))
        }
        if (bestMoves[puzzleSize] === 0 || moves + 1 < bestMoves[puzzleSize]) {
          setBestMoves((prev) => ({ ...prev, [puzzleSize]: moves + 1 }))
        }
      }
    }
  }

  useEffect(() => {
    initializePuzzle(puzzleSize)
  }, [puzzleSize])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !isComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyRating = () => {
    if (puzzleSize === 3) {
      if (moves <= 50) return { rating: 3, text: "Expert!" }
      if (moves <= 100) return { rating: 2, text: "Good!" }
      return { rating: 1, text: "Keep trying!" }
    } else {
      if (moves <= 150) return { rating: 3, text: "Master!" }
      if (moves <= 300) return { rating: 2, text: "Great!" }
      return { rating: 1, text: "Nice effort!" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Sliding Puzzle</h1>
          <div className="flex gap-2">
            <Button onClick={shufflePuzzle} className="bg-blue-600 hover:bg-blue-700">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={() => initializePuzzle(puzzleSize)} className="bg-red-600 hover:bg-red-700">
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
                <div className="flex justify-center">
                  <div
                    className={`grid gap-2 p-4 bg-black/30 rounded-lg`}
                    style={{
                      gridTemplateColumns: `repeat(${puzzleSize}, 1fr)`,
                      width: puzzleSize === 3 ? "300px" : "400px",
                      height: puzzleSize === 3 ? "300px" : "400px",
                    }}
                  >
                    {tiles.map((tile, index) => (
                      <button
                        key={tile.id}
                        onClick={() => moveTile(index)}
                        className={`
                          aspect-square rounded-lg font-bold text-2xl transition-all duration-200 transform
                          ${
                            tile.isEmpty
                              ? "bg-transparent cursor-default"
                              : "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white shadow-lg hover:scale-105 cursor-pointer"
                          }
                          ${!tile.isEmpty && !isComplete ? "hover:shadow-xl" : ""}
                        `}
                        disabled={tile.isEmpty || isComplete}
                      >
                        {!tile.isEmpty && tile.value}
                      </button>
                    ))}
                  </div>
                </div>

                {isComplete && (
                  <div className="text-center mt-8 p-6 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-12 h-12 text-green-400 mr-3" />
                      <h2 className="text-3xl font-bold text-white">Puzzle Complete!</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-white mb-4">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <div className="text-xl font-bold">{moves}</div>
                        <div className="text-sm">Moves</div>
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg">
                        <div className="text-xl font-bold">{formatTime(timer)}</div>
                        <div className="text-sm">Time</div>
                      </div>
                    </div>
                    <p className="text-green-300 text-lg mb-2">{getDifficultyRating().text}</p>
                    <div className="flex justify-center">
                      {Array.from({ length: getDifficultyRating().rating }).map((_, i) => (
                        <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full mx-1"></div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Current Game Stats */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Current Game
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
                  <span>Time:</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {formatTime(timer)}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Size:</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {puzzleSize}x{puzzleSize}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono text-white text-center">{formatTime(timer)}</div>
                <div className="text-center text-gray-300 text-sm mt-2">
                  {gameStarted ? "Running..." : isComplete ? "Completed!" : "Ready to start"}
                </div>
              </CardContent>
            </Card>

            {/* Puzzle Size */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Puzzle Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setPuzzleSize(3)}
                  disabled={gameStarted}
                  className={`w-full ${
                    puzzleSize === 3 ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  3x3 (Easy)
                </Button>
                <Button
                  onClick={() => setPuzzleSize(4)}
                  disabled={gameStarted}
                  className={`w-full ${
                    puzzleSize === 4 ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  4x4 (Hard)
                </Button>
              </CardContent>
            </Card>

            {/* Best Scores */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Best Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <div className="text-sm text-gray-300 mb-1">3x3 Puzzle:</div>
                  <div className="flex justify-between text-sm">
                    <span>Moves:</span>
                    <span>{bestMoves[3] || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time:</span>
                    <span>{bestTime[3] ? formatTime(bestTime[3]) : "—"}</span>
                  </div>
                </div>
                <div className="text-white">
                  <div className="text-sm text-gray-300 mb-1">4x4 Puzzle:</div>
                  <div className="flex justify-between text-sm">
                    <span>Moves:</span>
                    <span>{bestMoves[4] || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time:</span>
                    <span>{bestTime[4] ? formatTime(bestTime[4]) : "—"}</span>
                  </div>
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
                  <li>• Click tiles adjacent to empty space</li>
                  <li>• Arrange numbers in order (1, 2, 3...)</li>
                  <li>• Empty space should be bottom-right</li>
                  <li>• Try to solve in fewer moves</li>
                  <li>• Beat your best time!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
