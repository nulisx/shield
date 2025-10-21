"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(username: string, data: { profile_picture?: string; bio?: string }) {
  const supabase = await createClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (data.profile_picture !== undefined) {
    updateData.profile_picture = data.profile_picture
  }

  if (data.bio !== undefined) {
    updateData.bio = data.bio
  }

  console.log("[shield] Server action: Updating profile", username, updateData)

  const { error } = await supabase.from("profiles").upsert(updateData).eq("username", username)

  if (error) {
    console.error("[shield] Server action: Error updating profile:", error)
    throw new Error("Failed to update profile: " + error.message)
  }

  console.log("[shield] Server action: Profile updated successfully")

  revalidatePath("/")

  return { success: true }
}

export async function getProfile(username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (error) {
    console.error("[shield] Error fetching profile:", error)
    return null
  }

  return data
}

export async function getAllProfiles() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("*").order("username")

  if (error) {
    console.error("[shield] Error fetching profiles:", error)
    return []
  }

  return data
}
