"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Play, Pause, RotateCcw, Trophy, RotateCw, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"

interface Block {
  type: BlockType
  x: number
  y: number
  rotation: number
  shape: number[][]
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const SHAPES: Record<BlockType, number[][][]> = {
  I: [[[1, 1, 1, 1]], [[1], [1], [1], [1]]],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  ],
}

const COLORS: Record<BlockType, string> = {
  I: "bg-cyan-500",
  O: "bg-yellow-500",
  T: "bg-purple-500",
  S: "bg-green-500",
  Z: "bg-red-500",
  J: "bg-blue-500",
  L: "bg-orange-500",
}

export default function FallingBlocksPage() {
  const [board, setBoard] = useState<(BlockType | null)[][]>(
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null)),
  )
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const [nextBlock, setNextBlock] = useState<BlockType>("I")
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [dropTime, setDropTime] = useState(1000)

  const blockTypes: BlockType[] = ["I", "O", "T", "S", "Z", "J", "L"]

  const createNewBlock = useCallback((type: BlockType): Block => {
    return {
      type,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0,
      shape: SHAPES[type][0],
    }
  }, [])

  const getRandomBlockType = (): BlockType => {
    return blockTypes[Math.floor(Math.random() * blockTypes.length)]
  }

  const isValidPosition = (block: Block, board: (BlockType | null)[][]): boolean => {
    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          const newX = block.x + x
          const newY = block.y + y

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }

  const placeBlock = (block: Block, board: (BlockType | null)[][]): (BlockType | null)[][] => {
    const newBoard = board.map((row) => [...row])

    for (let y = 0; y < block.shape.length; y++) {
      for (let x = 0; x < block.shape[y].length; x++) {
        if (block.shape[y][x]) {
          const boardY = block.y + y
          const boardX = block.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = block.type
          }
        }
      }
    }
    return newBoard
  }

  const clearLines = (board: (BlockType | null)[][]): { newBoard: (BlockType | null)[][]; linesCleared: number } => {
    const newBoard = board.filter((row) => row.some((cell) => cell === null))
    const linesCleared = BOARD_HEIGHT - newBoard.length

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, linesCleared }
  }

  const moveBlock = (direction: "left" | "right" | "down"): boolean => {
    if (!currentBlock) return false

    const newBlock = { ...currentBlock }

    switch (direction) {
      case "left":
        newBlock.x -= 1
        break
      case "right":
        newBlock.x += 1
        break
      case "down":
        newBlock.y += 1
        break
    }

    if (isValidPosition(newBlock, board)) {
      setCurrentBlock(newBlock)
      return true
    }

    return false
  }

  const rotateBlock = (): void => {
    if (!currentBlock) return

    const rotations = SHAPES[currentBlock.type]
    const nextRotation = (currentBlock.rotation + 1) % rotations.length
    const newBlock = {
      ...currentBlock,
      rotation: nextRotation,
      shape: rotations[nextRotation],
    }

    if (isValidPosition(newBlock, board)) {
      setCurrentBlock(newBlock)
    }
  }

  const dropBlock = useCallback((): void => {
    if (!currentBlock) return

    if (!moveBlock("down")) {
      // Block can't move down, place it
      const newBoard = placeBlock(currentBlock, board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

      setBoard(clearedBoard)
      setLines((prev) => prev + linesCleared)
      setScore((prev) => prev + linesCleared * 100 * level + 10)

      // Create new block
      const newBlockType = nextBlock
      const newBlock = createNewBlock(newBlockType)

      if (isValidPosition(newBlock, clearedBoard)) {
        setCurrentBlock(newBlock)
        setNextBlock(getRandomBlockType())
      } else {
        setGameRunning(false)
        setGameOver(true)
      }
    }
  }, [currentBlock, board, nextBlock, level, createNewBlock])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case "ArrowLeft":
          moveBlock("left")
          break
        case "ArrowRight":
          moveBlock("right")
          break
        case "ArrowDown":
          dropBlock()
          break
        case "ArrowUp":
        case " ":
          rotateBlock()
          break
      }
    },
    [gameRunning, dropBlock],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (!gameRunning) return

    const interval = setInterval(dropBlock, dropTime)
    return () => clearInterval(interval)
  }, [dropBlock, dropTime, gameRunning])

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1
    setLevel(newLevel)
    setDropTime(Math.max(100, 1000 - (newLevel - 1) * 100))
  }, [lines])

  const startGame = () => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
    setBoard(newBoard)
    setScore(0)
    setLines(0)
    setLevel(1)
    setDropTime(1000)
    setGameRunning(true)
    setGameOver(false)

    const firstBlock = createNewBlock(getRandomBlockType())
    setCurrentBlock(firstBlock)
    setNextBlock(getRandomBlockType())
  }

  const pauseGame = () => {
    setGameRunning(false)
  }

  const resetGame = () => {
    setGameRunning(false)
    setGameOver(false)
    setCurrentBlock(null)
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null)),
    )
    setScore(0)
    setLines(0)
    setLevel(1)
  }

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    // Add current block to display
    if (currentBlock) {
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const boardY = currentBlock.y + y
            const boardX = currentBlock.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentBlock.type
            }
          }
        }
      }
    }

    return displayBoard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Falling Blocks</h1>
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
                <div className="flex justify-center">
                  <div className="relative bg-black rounded-lg p-4" style={{ width: "300px", height: "600px" }}>
                    <div className="grid grid-cols-10 gap-0 h-full">
                      {renderBoard().map((row, y) =>
                        row.map((cell, x) => (
                          <div
                            key={`${y}-${x}`}
                            className={`border border-gray-700 ${
                              cell ? COLORS[cell] : "bg-gray-900"
                            } transition-colors duration-150`}
                          />
                        )),
                      )}
                    </div>

                    {gameOver && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                          <p className="text-xl mb-2">Score: {score}</p>
                          <p className="text-lg mb-4">Lines: {lines}</p>
                          <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                            Play Again
                          </Button>
                        </div>
                      </div>
                    )}

                    {!gameRunning && !gameOver && score > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <h2 className="text-2xl font-bold mb-4">Paused</h2>
                          <Button onClick={() => setGameRunning(true)} className="bg-green-600 hover:bg-green-700">
                            Resume
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Controls */}
                <div className="mt-6 lg:hidden">
                  <div className="grid grid-cols-4 gap-2 max-w-64 mx-auto">
                    <Button onClick={() => moveBlock("left")} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <Button onClick={rotateBlock} className="bg-purple-600 hover:bg-purple-700">
                      <RotateCw className="w-6 h-6" />
                    </Button>
                    <Button onClick={() => moveBlock("right")} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                    <Button onClick={dropBlock} className="bg-purple-600 hover:bg-purple-700">
                      <ArrowDown className="w-6 h-6" />
                    </Button>
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
                  <span>Score:</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Lines:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {lines}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Level:</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Next Block */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Next Block</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="grid gap-1 p-2 bg-black/30 rounded">
                    {SHAPES[nextBlock][0].map((row, y) =>
                      row.map((cell, x) => (
                        <div key={`${y}-${x}`} className={`w-4 h-4 ${cell ? COLORS[nextBlock] : "bg-transparent"}`} />
                      )),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• ← → Move left/right</li>
                  <li>• ↓ Soft drop</li>
                  <li>• ↑ or Space: Rotate</li>
                  <li>• Clear lines to score points</li>
                  <li>• Speed increases with level</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
