"use client"

import { useEffect } from "react"
import Clarity from "@microsoft/clarity"

const projectId = "ve2355aclx"

export function ClarityInit() {
  useEffect(() => {
    if (typeof window === "undefined") return
    Clarity.init(projectId)
  }, [])

  return null
}
