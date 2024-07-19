// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

import { toast } from 'react-hot-toast'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(false)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        try {
          setLoading(true)
          const response = await fetch("http://localhost:1337/auth/user", {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + storedToken
            }
          })
          const data = await response.json()
          if (data?.status === 200 || data?.errorCode === "SUC000") {
            setLoading(false)
            setUser({ ...data?.data })
          }
        } catch (error) {
          console.log('error: ', error);
          localStorage.removeItem('userData')
          localStorage.removeItem('accessToken')
          setUser(null)
          setLoading(false)
          router.replace('/login')
        }


      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (params, errorCallback) => {
    try {
      const response = await fetch("http://localhost:1337/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      const data = await response.json()
      if (data?.status === 200 || data?.errorCode === "SUC000") {
        const role = data?.data?.rows[0]?.role
        console.log('data: ', data);
        toast.success(data.message)
        window.localStorage.setItem('userData', JSON.stringify(data?.data?.rows[0]))
        window.localStorage.setItem(authConfig.storageTokenKeyName, data.token)
        const returnUrl = router.query.returnUrl
        router.push(role === 'student' || role === 'teacher' ? '/subjects' : '/dashboard')
        setUser({ ...data?.data?.rows[0] })
        // const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        // router.replace(redirectURL)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log('error: ', error);
    }
  }

  const handleRegister = async (params) => {
    try {
      const response = await fetch("http://localhost:1337/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      const data = await response.json()

      if (data?.status === 200) {
        toast.success(data.message)
        router.push('/login')
      }

    } catch (err) {
      console.error(err)
      toast.error(err)

    }
  }

  const handleLogout = async () => {
    try {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        const fetchLogoutApi = await fetch("http://localhost:1337/auth/logout", {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + storedToken
          }
        })
        const response = await fetchLogoutApi.json()
        if (response.status === 200) {
          toast.success(response.message)
          window.localStorage.removeItem('userData')
          window.localStorage.removeItem(authConfig.storageTokenKeyName)
          setUser(null)
          setLoading(false)
          router.push('/login')
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
