"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "./actions"

const userPasswords: Record<string, string> = {
  dismayings: "D!s9aY#7vR8kZq2M",
  akane: "A!k4nE#6pR2vXq1Z",
  zurf: "Z!u7rF#2pL9xTq8",
  turk: "T!u6rK#3vP8zQw1",
  demise: "D!e5mI#2sA8qRz7",
  gothic: "G!o7tH#2iC9kQx4",
}

type User = {
  username: string
  display_name: string
  profile_picture: string
  bio: string
}

const DEFAULT_LOGO = "https://files.catbox.moe/6rfx2s.gif"
const ALTERNATE_LOGO = "https://files.catbox.moe/axam5m.gif"

function GlitchText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
    const randomNames = ["dismayings", "TuRk", "gothic", "zurf", "akane", "demise"]

    const triggerGlitch = () => {
      setIsGlitching(true)
      let iterations = 0
      const maxIterations = 8

      const glitchInterval = setInterval(() => {
        if (iterations < maxIterations) {
          const shouldShowRandomName = Math.random() > 0.5
          if (shouldShowRandomName) {
            const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
            setDisplayText(randomName)
          } else {
            setDisplayText(
              text
                .split("")
                .map((char) =>
                  Math.random() > 0.5 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char,
                )
                .join(""),
            )
          }
          iterations++
        } else {
          setDisplayText(text)
          setIsGlitching(false)
          clearInterval(glitchInterval)
        }
      }, 80)
    }

    const scheduleNextGlitch = () => {
      const delay = Math.random() * 5000 + 3000
      setTimeout(() => {
        triggerGlitch()
        scheduleNextGlitch()
      }, delay)
    }

    scheduleNextGlitch()
  }, [text])

  return <span className={`text-sm font-medium ${isGlitching ? "text-red-500" : ""}`}>{displayText}</span>
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingField, setEditingField] = useState<"pfp" | "bio" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [currentLogo, setCurrentLogo] = useState(DEFAULT_LOGO)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const [isDatabaseReady, setIsDatabaseReady] = useState(false)
  const isMountedRef = useRef(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    isMountedRef.current = true

    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play()
          console.log("[v0] Background music started")
        } catch (error) {
          console.log("[v0] Autoplay blocked, will play on user interaction")
          const startAudio = async () => {
            if (audioRef.current) {
              try {
                await audioRef.current.play()
                console.log("[v0] Background music started after user interaction")
                document.removeEventListener("click", startAudio)
              } catch (e) {
                console.error("[v0] Failed to start audio:", e)
              }
            }
          }
          document.addEventListener("click", startAudio, { once: true })
        }
      }
    }

    playAudio()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("username")

      if (error) {
        console.error("[shield] Error loading profiles:", error.message)
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          console.log(
            "[shield] Database table not found. Please run the SQL script: scripts/001_create_profiles_table.sql",
          )
          const fallbackUsers: User[] = [
            {
              username: "dismayings",
              display_name: "dismayings",
              profile_picture: "https://files.catbox.moe/nfwlfl.png",
              bio: "A mysterious figure in the digital realm.",
            },
            {
              username: "turk",
              display_name: "TuRk",
              profile_picture: "https://files.catbox.moe/odxzi6.png",
              bio: "A mysterious figure in the digital realm.",
            },
            {
              username: "akane",
              display_name: "akane",
              profile_picture: "https://files.catbox.moe/nlsbjl.png",
              bio: "A mysterious figure in the digital realm.",
            },
            {
              username: "zurf",
              display_name: "zurf",
              profile_picture: "https://files.catbox.moe/vx0tpn.png",
              bio: "A mysterious figure in the digital realm.",
            },
            {
              username: "demise",
              display_name: "demise",
              profile_picture: "https://files.catbox.moe/6092n9.png",
              bio: "A mysterious figure in the digital realm.",
            },
            {
              username: "gothic",
              display_name: "gothic",
              profile_picture: "https://files.catbox.moe/cdg3go.png",
              bio: "A mysterious figure in the digital realm.",
            },
          ]
          setUsers(fallbackUsers)
          if (fallbackUsers.length > 0) {
            setCurrentUser(fallbackUsers[0])
          }
          setIsDatabaseReady(false)
        }
        return
      }

      if (data) {
        console.log("[shield] Profiles loaded successfully:", data.length, "users")
        setUsers(data)
        if (data.length > 0) {
          setCurrentUser(data[0])
        }
        setIsDatabaseReady(true)
      }
    }

    loadProfiles()

    const channel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        console.log("[v0] Real-time update received:", payload.eventType, payload.new)

        if (payload.eventType === "UPDATE" && payload.new) {
          const updatedUser = payload.new as User

          setUsers((prevUsers) => {
            const newUsers = prevUsers.map((user) => (user.username === updatedUser.username ? updatedUser : user))
            console.log("[v0] Users state updated")
            return newUsers
          })

          setSelectedUser((prev) => {
            if (prev && prev.username === updatedUser.username) {
              console.log("[v0] Selected user updated with new data:", updatedUser)
              return { ...updatedUser }
            }
            return prev
          })

          setCurrentUser((prev) => {
            if (prev && prev.username === updatedUser.username) {
              console.log("[v0] Current user updated")
              return { ...updatedUser }
            }
            return prev
          })
        }
      })
      .subscribe((status) => {
        console.log("[v0] Subscription status:", status)
      })

    return () => {
      console.log("[v0] Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const savedLoggedInUser = localStorage.getItem("loggedInUser")
    if (savedLoggedInUser) {
      setLoggedInUser(savedLoggedInUser)
    }
  }, [])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setCurrentUser(user)
    setShowLoginPrompt(false)
    setShowPasswordForm(false)
    setPassword("")
    setPasswordError("")
  }

  const handleLoginClick = () => {
    setShowLoginPrompt(false)
    setShowPasswordForm(true)
  }

  const handlePasswordSubmit = () => {
    if (selectedUser && userPasswords[selectedUser.username] === password) {
      setLoggedInUser(selectedUser.username)
      localStorage.setItem("loggedInUser", selectedUser.username)
      setShowPasswordForm(false)
      setPassword("")
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password")
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    localStorage.removeItem("loggedInUser")
    setSelectedUser(null)
  }

  const handleEditField = (field: "pfp" | "bio") => {
    if (!selectedUser) return
    setEditingField(field)
    setEditValue(field === "pfp" ? selectedUser.profile_picture : selectedUser.bio)
  }

  const handleSaveChanges = async () => {
    if (!selectedUser || !editingField) return

    if (!isDatabaseReady) {
      alert("Database is not ready. Please run the SQL script first: scripts/001_create_profiles_table.sql")
      return
    }

    try {
      const updateData: any = {}

      if (editingField === "pfp") {
        updateData.profile_picture = editValue
      } else {
        updateData.bio = editValue
      }

      console.log("[v0] Saving changes for", selectedUser.username, updateData)

      const optimisticUser = { ...selectedUser, ...updateData }

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.username === selectedUser.username ? optimisticUser : user)),
      )

      setSelectedUser(optimisticUser)

      if (currentUser?.username === selectedUser.username) {
        setCurrentUser(optimisticUser)
      }

      await updateProfile(selectedUser.username, updateData)

      console.log("[v0] Changes saved successfully")

      setEditingField(null)
      setEditValue("")
    } catch (error) {
      console.error("[v0] Error saving changes:", error)
      alert("Failed to save changes. Please try again.")

      const { data } = await supabase.from("profiles").select("*").eq("username", selectedUser.username).single()

      if (data) {
        setUsers((prevUsers) => prevUsers.map((user) => (user.username === selectedUser.username ? data : user)))
        setSelectedUser(data)
        if (currentUser?.username === selectedUser.username) {
          setCurrentUser(data)
        }
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditValue(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleStartClick = () => {
    setCurrentLogo((prev) => (prev === DEFAULT_LOGO ? ALTERNATE_LOGO : DEFAULT_LOGO))
  }

  const isUserLoggedIn = selectedUser && loggedInUser === selectedUser.username

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <audio ref={audioRef} loop className="hidden">
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thats%20life%20tough%20you%20get%20sick%20and%20die-CoUCJc9H8lt8DTwQFWO8JBkuzPk9PZ.mp3"
          type="audio/mpeg"
        />
      </audio>

      <div className="fixed bottom-16 right-4 text-right text-gray-500 text-xs leading-relaxed z-10">
        <div>made by wounds</div>
        <div>inspo from valhal.la</div>
      </div>

      <header className="pt-8 pb-12 text-center">
        <h1 className="text-2xl font-mono tracking-wider">SHIELD</h1>
      </header>

      <main className="flex-1 flex">
        <div className="w-64 pl-8 pt-4">
          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            {users.map((user) => (
              <button
                key={user.username}
                onClick={() => handleUserClick(user)}
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.display_name} />
                  <AvatarFallback className="bg-gray-700">{user.display_name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <GlitchText text={user.display_name} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end pr-8">
          <div className="relative w-full max-w-sm h-[600px]">
            <img
              src={currentLogo || "/placeholder.svg"}
              alt="Anime character illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </main>

      {selectedUser && !showPasswordForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-gray-300 border-2 border-gray-400 shadow-lg" style={{ width: "320px" }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-2 py-1 flex items-center justify-between">
              <span className="text-white text-sm font-bold">{selectedUser.display_name}</span>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-5 h-5 bg-gray-300 hover:bg-red-500 border border-gray-600 flex items-center justify-center text-black hover:text-white text-xs font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-8 flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedUser.profile_picture || "/placeholder.svg"} alt={selectedUser.display_name} />
                <AvatarFallback className="bg-gray-700">{selectedUser.display_name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="text-black text-sm text-center">{selectedUser.bio}</p>

              {isUserLoggedIn ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => handleEditField("pfp")}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                    style={{ borderStyle: "outset" }}
                  >
                    Change PFP
                  </button>
                  <button
                    onClick={() => handleEditField("bio")}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                    style={{ borderStyle: "outset" }}
                  >
                    Change Bio
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                  style={{ borderStyle: "outset" }}
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                className="px-8 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                style={{ borderStyle: "outset" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordForm && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordForm(false)} />
          <div className="relative bg-gray-300 border-2 border-gray-400 shadow-lg" style={{ width: "320px" }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-2 py-1 flex items-center justify-between">
              <span className="text-white text-sm font-bold">Login - {selectedUser.display_name}</span>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="w-5 h-5 bg-gray-300 hover:bg-red-500 border border-gray-600 flex items-center justify-center text-black hover:text-white text-xs font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-8 flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedUser.profile_picture || "/placeholder.svg"} alt={selectedUser.display_name} />
                <AvatarFallback className="bg-gray-700">{selectedUser.display_name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                <label className="text-black text-sm font-medium block mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError("")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  className="w-full px-3 py-1.5 border-2 border-gray-600 text-black text-sm"
                  style={{ borderStyle: "inset" }}
                  autoFocus
                />
                {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
              </div>
              <button
                onClick={handlePasswordSubmit}
                className="px-8 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                style={{ borderStyle: "outset" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {editingField && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingField(null)} />
          <div className="relative bg-gray-300 border-2 border-gray-400 shadow-lg" style={{ width: "320px" }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-2 py-1 flex items-center justify-between">
              <span className="text-white text-sm font-bold">
                Edit {editingField === "pfp" ? "Profile Picture" : "Bio"}
              </span>
              <button
                onClick={() => setEditingField(null)}
                className="w-5 h-5 bg-gray-300 hover:bg-red-500 border border-gray-600 flex items-center justify-center text-black hover:text-white text-xs font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-full">
                <label className="text-black text-sm font-medium block mb-2">
                  {editingField === "pfp" ? "Image URL or Upload:" : "Bio:"}
                </label>
                {editingField === "pfp" ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Paste image URL here"
                      className="w-full px-3 py-1.5 border-2 border-gray-600 text-black text-sm mb-2"
                      style={{ borderStyle: "inset" }}
                      autoFocus
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                      style={{ borderStyle: "outset" }}
                    >
                      Or Choose File
                    </button>
                  </>
                ) : (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-gray-600 text-black text-sm resize-none"
                    style={{ borderStyle: "inset" }}
                    rows={4}
                    autoFocus
                  />
                )}
              </div>
              <button
                onClick={handleSaveChanges}
                className="px-8 py-1.5 bg-gray-200 hover:bg-gray-100 border-2 border-gray-600 text-black text-sm font-medium"
                style={{ borderStyle: "outset" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-12 bg-gradient-to-b from-gray-500 to-gray-600 border-t-2 border-gray-400 flex items-center px-1 gap-1">
        <button
          onClick={handleStartClick}
          className="h-9 px-3 bg-green-600 hover:bg-green-500 border-2 border-white shadow-md flex items-center gap-2 text-white text-sm font-bold"
        >
          <img src="/generic-quadrilateral-logo.png" alt="" className="w-5 h-5" />
          Start
        </button>

        {users.map((user) => (
          <button
            key={user.username}
            onClick={() => handleUserClick(user)}
            className="h-9 px-2 bg-gray-400 hover:bg-gray-300 border border-gray-300 flex items-center gap-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.display_name} />
              <AvatarFallback className="bg-gray-700 text-xs">{user.display_name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 px-3 h-9 bg-gray-400 border border-gray-300">
          <img src="/speaker-icon.png" alt="" className="w-4 h-4" />
          <span className="text-white text-xs font-medium">9:52 PM</span>
          {loggedInUser && (
            <button
              onClick={handleLogout}
              className="ml-2 px-2 py-0.5 bg-red-600 hover:bg-red-500 border border-gray-600 text-white text-xs font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
