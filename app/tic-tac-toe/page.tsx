"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, RotateCcw, Zap, Shield, Palette, Volume2, VolumeX, Trophy, Star } from "lucide-react"

type Player = "X" | "O" | null
type PowerUp = "lightning" | "shield" | null

interface GameState {
  board: Player[]
  currentPlayer: Player
  winner: Player | "tie" | null
  score: { X: number; O: number; ties: number }
  powerUps: { X: { lightning: number; shield: number }; O: { lightning: number; shield: number } }
  theme: "neon" | "nature" | "space"
  soundEnabled: boolean
}

export default function TicTacToePage() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    score: { X: 0, O: 0, ties: 0 },
    powerUps: {
      X: { lightning: 2, shield: 1 },
      O: { lightning: 2, shield: 1 },
    },
    theme: "neon",
    soundEnabled: true,
  })

  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp>(null)
  const [animatingSquares, setAnimatingSquares] = useState<number[]>([])
  const [winningLine, setWinningLine] = useState<number[]>([])

  const themes = {
    neon: {
      bg: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
      card: "bg-black/40 border-purple-500/30",
      square: "bg-gray-800/50 border-purple-400/50 hover:bg-purple-500/20",
      squareActive: "bg-purple-500/30 border-purple-400",
      text: "text-purple-300",
      accent: "text-purple-400",
    },
    nature: {
      bg: "bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800",
      card: "bg-green-900/40 border-green-500/30",
      square: "bg-green-800/50 border-green-400/50 hover:bg-green-500/20",
      squareActive: "bg-green-500/30 border-green-400",
      text: "text-green-300",
      accent: "text-green-400",
    },
    space: {
      bg: "bg-gradient-to-br from-slate-900 via-gray-900 to-black",
      card: "bg-gray-900/40 border-gray-500/30",
      square: "bg-gray-800/50 border-gray-400/50 hover:bg-gray-500/20",
      squareActive: "bg-gray-500/30 border-gray-400",
      text: "text-gray-300",
      accent: "text-gray-400",
    },
  }

  const currentTheme = themes[gameState.theme]

  const playSound = (type: "move" | "win" | "powerup") => {
    if (!gameState.soundEnabled) return

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "move":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        break
      case "win":
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        break
      case "powerup":
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
        break
    }

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const checkWinner = (board: Player[]): { winner: Player | "tie" | null; line: number[] } => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (const line of lines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line }
      }
    }

    if (board.every((square) => square !== null)) {
      return { winner: "tie", line: [] }
    }

    return { winner: null, line: [] }
  }

  const handleSquareClick = (index: number) => {
    if (gameState.board[index] || gameState.winner) return

    const newBoard = [...gameState.board]

    if (selectedPowerUp === "lightning" && gameState.powerUps[gameState.currentPlayer].lightning > 0) {
      // Lightning power-up: can override opponent's move
      newBoard[index] = gameState.currentPlayer
      setGameState((prev) => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [prev.currentPlayer]: {
            ...prev.powerUps[prev.currentPlayer],
            lightning: prev.powerUps[prev.currentPlayer].lightning - 1,
          },
        },
      }))
      playSound("powerup")
    } else if (selectedPowerUp === "shield") {
      // Shield power-up: protect a square
      newBoard[index] = gameState.currentPlayer
      setGameState((prev) => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [prev.currentPlayer]: {
            ...prev.powerUps[prev.currentPlayer],
            shield: prev.powerUps[prev.currentPlayer].shield - 1,
          },
        },
      }))
      playSound("powerup")
    } else {
      newBoard[index] = gameState.currentPlayer
      playSound("move")
    }

    setSelectedPowerUp(null)
    setAnimatingSquares([index])

    const { winner, line } = checkWinner(newBoard)

    if (winner) {
      setWinningLine(line)
      const newScore = { ...gameState.score }
      if (winner === "tie") {
        newScore.ties++
      } else {
        newScore[winner]++
      }

      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        winner,
        score: newScore,
      }))

      if (winner !== "tie") {
        playSound("win")
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "X" ? "O" : "X",
      }))
    }

    setTimeout(() => setAnimatingSquares([]), 300)
  }

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      powerUps: {
        X: { lightning: 2, shield: 1 },
        O: { lightning: 2, shield: 1 },
      },
    }))
    setSelectedPowerUp(null)
    setWinningLine([])
  }

  const toggleTheme = () => {
    const themes: Array<"neon" | "nature" | "space"> = ["neon", "nature", "space"]
    const currentIndex = themes.indexOf(gameState.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setGameState((prev) => ({ ...prev, theme: nextTheme }))
  }

  const toggleSound = () => {
    setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} p-4`}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Super Tic-Tac-Toe</h1>
          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Palette className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleSound}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {gameState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className={`${currentTheme.card} backdrop-blur-lg`}>
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">
                  {gameState.winner
                    ? gameState.winner === "tie"
                      ? "It's a Tie!"
                      : `Player ${gameState.winner} Wins!`
                    : `Player ${gameState.currentPlayer}'s Turn`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {gameState.board.map((square, index) => (
                    <button
                      key={index}
                      onClick={() => handleSquareClick(index)}
                      className={`
                        aspect-square text-4xl font-bold rounded-lg border-2 transition-all duration-300 transform
                        ${
                          winningLine.includes(index)
                            ? `${currentTheme.squareActive} scale-110 shadow-lg`
                            : currentTheme.square
                        }
                        ${animatingSquares.includes(index) ? "animate-pulse scale-110" : ""}
                        ${square ? "cursor-default" : "cursor-pointer hover:scale-105"}
                      `}
                      disabled={!!square || !!gameState.winner}
                    >
                      {square && (
                        <span className={`${square === "X" ? "text-blue-400" : "text-red-400"} drop-shadow-lg`}>
                          {square}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score */}
            <Card className={`${currentTheme.card} backdrop-blur-lg`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Player X:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {gameState.score.X}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Player O:</span>
                  <Badge variant="secondary" className="bg-red-500/20 text-red-300">
                    {gameState.score.O}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Ties:</span>
                  <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">
                    {gameState.score.ties}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Power-ups */}
            <Card className={`${currentTheme.card} backdrop-blur-lg`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  Power-ups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white text-sm mb-2">Player {gameState.currentPlayer}'s Power-ups:</div>

                <Button
                  onClick={() => setSelectedPowerUp(selectedPowerUp === "lightning" ? null : "lightning")}
                  disabled={gameState.powerUps[gameState.currentPlayer].lightning === 0}
                  className={`w-full ${selectedPowerUp === "lightning" ? "bg-yellow-600" : "bg-yellow-500"} hover:bg-yellow-600`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Lightning ({gameState.powerUps[gameState.currentPlayer].lightning})
                </Button>

                <Button
                  onClick={() => setSelectedPowerUp(selectedPowerUp === "shield" ? null : "shield")}
                  disabled={gameState.powerUps[gameState.currentPlayer].shield === 0}
                  className={`w-full ${selectedPowerUp === "shield" ? "bg-blue-600" : "bg-blue-500"} hover:bg-blue-600`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Shield ({gameState.powerUps[gameState.currentPlayer].shield})
                </Button>

                {selectedPowerUp && (
                  <div className="text-xs text-gray-300 mt-2">
                    {selectedPowerUp === "lightning" ? "Lightning: Override any square" : "Shield: Protect your move"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Theme Info */}
            <Card className={`${currentTheme.card} backdrop-blur-lg`}>
              <CardContent className="pt-6">
                <div className="text-center text-white">
                  <div className="text-sm text-gray-300 mb-2">Current Theme</div>
                  <Badge variant="secondary" className="capitalize">
                    {gameState.theme}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
