'use client'
import { useEffect } from 'react'
import NProgress from 'nprogress'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  useEffect(() => {
    NProgress.done()
  }, [])

  // Mengembalikan form tanpa pembungkus eksternal agar layout kiri-kanan bisa full screen
  return <ForgotPasswordForm />
}