"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Home, Play, RotateCcw, Trophy, Clock, Brain, CheckCircle, XCircle } from "lucide-react"

interface Question {
  num1: number
  num2: number
  operator: "+" | "-" | "*" | "/"
  answer: number
}

type Difficulty = "easy" | "medium" | "hard"

export default function MathQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const difficultySettings = {
    easy: { maxNum: 10, operators: ["+", "-"] as const, timeBonus: 2 },
    medium: { maxNum: 50, operators: ["+", "-", "*"] as const, timeBonus: 5 },
    hard: { maxNum: 100, operators: ["+", "-", "*", "/"] as const, timeBonus: 10 },
  }

  const generateQuestion = (): Question => {
    const settings = difficultySettings[difficulty]
    const operator = settings.operators[Math.floor(Math.random() * settings.operators.length)]

    let num1 = Math.floor(Math.random() * settings.maxNum) + 1
    let num2 = Math.floor(Math.random() * settings.maxNum) + 1
    let answer: number

    switch (operator) {
      case "+":
        answer = num1 + num2
        break
      case "-":
        // Ensure positive result
        if (num1 < num2) [num1, num2] = [num2, num1]
        answer = num1 - num2
        break
      case "*":
        // Keep numbers smaller for multiplication
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        break
      case "/":
        // Ensure clean division
        answer = Math.floor(Math.random() * 12) + 1
        num1 = answer * (Math.floor(Math.random() * 12) + 1)
        num2 = num1 / answer
        break
      default:
        answer = 0
    }

    return { num1, num2, operator, answer }
  }

  const checkAnswer = () => {
    if (!currentQuestion || userAnswer === "") return

    const isCorrect = Number.parseInt(userAnswer) === currentQuestion.answer
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      const points = difficultySettings[difficulty].timeBonus * (streak + 1)
      setScore((prev) => prev + points)
      setStreak((prev) => {
        const newStreak = prev + 1
        if (newStreak > bestStreak) {
          setBestStreak(newStreak)
        }
        return newStreak
      })
    } else {
      setStreak(0)
    }

    setQuestionsAnswered((prev) => prev + 1)

    setTimeout(() => {
      setFeedback(null)
      setUserAnswer("")
      setCurrentQuestion(generateQuestion())
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer()
    }
  }

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
    }
  }, [timeLeft, gameRunning])

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
    setScore(0)
    setQuestionsAnswered(0)
    setTimeLeft(60)
    setStreak(0)
    setUserAnswer("")
    setFeedback(null)
    setCurrentQuestion(generateQuestion())
  }

  const resetGame = () => {
    setGameRunning(false)
    setGameOver(false)
    setScore(0)
    setQuestionsAnswered(0)
    setTimeLeft(60)
    setStreak(0)
    setUserAnswer("")
    setFeedback(null)
    setCurrentQuestion(null)
  }

  const accuracy =
    questionsAnswered > 0
      ? Math.round((score / (questionsAnswered * difficultySettings[difficulty].timeBonus)) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-red-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white text-center">Math Quiz</h1>
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
                {currentQuestion && gameRunning ? (
                  <div className="text-center space-y-8">
                    <div className="text-6xl font-bold text-white mb-8">
                      {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <Input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Your answer"
                        className="text-2xl text-center w-48 h-16 bg-white/20 border-white/30 text-white placeholder-white/50"
                        disabled={feedback !== null}
                        autoFocus
                      />
                      <Button
                        onClick={checkAnswer}
                        disabled={userAnswer === "" || feedback !== null}
                        className="h-16 px-8 bg-pink-600 hover:bg-pink-700"
                      >
                        Submit
                      </Button>
                    </div>

                    {feedback && (
                      <div
                        className={`text-4xl font-bold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}
                      >
                        {feedback === "correct" ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-12 h-12" />
                            <span>Correct! +{difficultySettings[difficulty].timeBonus * streak}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <XCircle className="w-12 h-12" />
                            <span>Wrong! Answer: {currentQuestion.answer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {streak > 1 && (
                      <div className="text-2xl text-yellow-400 font-bold">🔥 Streak: {streak}x Multiplier!</div>
                    )}
                  </div>
                ) : gameOver ? (
                  <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-white mb-4">🧮 Quiz Complete! 🧮</h2>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-white">
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{score}</div>
                        <div className="text-sm">Final Score</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{questionsAnswered}</div>
                        <div className="text-sm">Questions</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{accuracy}%</div>
                        <div className="text-sm">Accuracy</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bestStreak}</div>
                        <div className="text-sm">Best Streak</div>
                      </div>
                    </div>
                    <Button onClick={startGame} className="bg-pink-600 hover:bg-pink-700">
                      Play Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-white">Ready to test your math skills?</h2>
                    <p className="text-xl text-gray-300">Choose your difficulty and start the quiz!</p>
                    <Button onClick={startGame} className="bg-pink-600 hover:bg-pink-700 text-xl px-8 py-4">
                      Start Quiz
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
                  <span>Points:</span>
                  <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Questions:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {questionsAnswered}
                  </Badge>
                </div>
                <div className="flex justify-between text-white">
                  <span>Streak:</span>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                    {streak}
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
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
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
                      difficulty === level ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
                <div className="text-xs text-gray-300 mt-2">
                  {difficulty === "easy" && "Numbers 1-10, +/-"}
                  {difficulty === "medium" && "Numbers 1-50, +/-/*"}
                  {difficulty === "hard" && "Numbers 1-100, +/-/*/÷"}
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
                  <li>• Solve math problems quickly</li>
                  <li>• Build streaks for bonus points</li>
                  <li>• You have 60 seconds</li>
                  <li>• Higher difficulty = more points</li>
                  <li>• Press Enter to submit answers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
