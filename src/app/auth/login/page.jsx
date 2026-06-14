'use client'
import { useEffect } from 'react'
import NProgress from 'nprogress'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  useEffect(() => {
    NProgress.done()
  }, [])

  // Langsung return LoginForm tanpa pembungkus padding eksternal agar bisa full screen
  return <LoginForm />
}