"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Grid3X3, Brain, Target, Github, Twitter, Linkedin, Mail, Sparkles, Trophy, Zap } from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const games = [
    {
      title: "Super Tic-Tac-Toe",
      description: "Classic game with power-ups, animations, and dynamic themes",
      icon: Grid3X3,
      href: "/tic-tac-toe",
      color: "bg-gradient-to-br from-blue-500 to-purple-600",
      features: ["Power-ups", "Animations", "Themes"],
    },
    {
      title: "Memory Match",
      description: "Test your memory with this engaging card matching game",
      icon: Brain,
      href: "/memory-game",
      color: "bg-gradient-to-br from-green-500 to-teal-600",
      features: ["Brain Training", "Levels", "Timer"],
    },
    {
      title: "Emoji Catcher",
      description: "Catch falling emojis with your basket in this fun arcade game",
      icon: Target,
      href: "/emoji-catcher",
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      features: ["Arcade Style", "High Score", "Power-ups"],
    },
    {
      title: "Snake Game",
      description: "Classic snake game with smooth animations and increasing difficulty",
      icon: Zap,
      href: "/snake-game",
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
      features: ["Classic", "Smooth", "Progressive"],
    },
    {
      title: "Whack-a-Mole",
      description: "Quick reflexes game - whack the moles as they pop up!",
      icon: Target,
      href: "/whack-a-mole",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      features: ["Reflexes", "Timing", "Fun"],
    },
    {
      title: "Math Quiz",
      description: "Quick-fire math questions with multiple difficulty levels",
      icon: Brain,
      href: "/math-quiz",
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      features: ["Education", "Timed", "Levels"],
    },
    {
      title: "Falling Blocks",
      description: "Tetris-like puzzle game with falling blocks and line clearing",
      icon: Grid3X3,
      href: "/falling-blocks",
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      features: ["Puzzle", "Strategy", "Classic"],
    },
    {
      title: "Sliding Puzzle",
      description: "Classic tile sliding puzzle with drag-and-drop controls",
      icon: Gamepad2,
      href: "/sliding-puzzle",
      color: "bg-gradient-to-br from-cyan-500 to-blue-600",
      features: ["Logic", "Drag & Drop", "Classic"],
    },
  ]

  const socialLinks = [
    { icon: Github, href: "https://github.com/jayrajsinghrathore", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/jayraj-singh-rathore-786b13217", label: "LinkedIn" },
    { icon: Mail, href: "mailto:jayrajsingh1416@gmail.com", label: "Email" },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              GameHub
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome to an interactive gaming experience featuring reimagined classics with modern twists, animations,
            and engaging gameplay mechanics.
          </p>
        </header>

        {/* Games Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
            Featured Games
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {games.map((game, index) => (
              <Card
                key={game.title}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${game.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <game.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{game.title}</CardTitle>
                  <CardDescription className="text-gray-300">{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {game.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link href={game.href}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                      Play Now
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
            Connect With Me
          </h3>
          <div className="flex justify-center space-x-6">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="group">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                  <social.icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-400">
          <p>&copy; 2025 GameHub. Built with Next.js and Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  )
}
