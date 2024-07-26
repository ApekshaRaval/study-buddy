// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { FormHelperText, MenuItem, Select } from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { RegisterSchema } from 'src/@core/utils/Schema'


// ** Styled Components
const RegisterIllustration = styled('img')({
  height: 'auto',
  maxWidth: '100%'
})

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('lg')]: {
    maxWidth: 480
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 635
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(12)
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const Register = () => {

  // ** States
  const [showPassword, setShowPassword] = useState(false)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const auth = useAuth()
  // ** Vars
  const { skin } = settings

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(RegisterSchema)
  })

  /**
   * The onSubmit function takes user input data and registers a new user with the provided information.
   */
  const onSubmit = data => {
    const { userName, email, password, role } = data
    auth.register({ email, password, userName, role })
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ p: 12, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "#BBE2FF" }}>
          <RegisterIllustration
            width={600}
            alt='register-illustration'
            src={`/images/pages/registerPage.svg`}
          />
        </Box>
      ) : null}
      <RightWrapper
        sx={{ ...(skin === 'bordered' && !hidden && { borderLeft: `1px solid ${theme.palette.divider}` }) }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 400 }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center' }}>
            <img src={`/images/logos/owlLogo.png`} alt='logo' width={100} height={100} />
            <Typography
              variant='h5'
              sx={{
                ml: 2,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: '-0.45px',
                textTransform: 'capitalize',
                fontSize: '1.75rem !important'
              }}
            >
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Typography variant='h6' sx={{ mb: 1.5 }}>
            Adventure starts here 🚀
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>Make your app management easy and fun!</Typography>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <InputLabel htmlFor='auth-login-v2-email' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Full Name</InputLabel>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Controller
                name='userName'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (<TextField autoFocus fullWidth sx={{ mb: 1 }} placeholder='john doe' type='text' {...field} />)}
              />
              {errors.userName && <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}>{errors.userName.message}</FormHelperText>}
            </FormControl>
            <InputLabel htmlFor='auth-login-v2-email' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Email</InputLabel>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (<TextField autoFocus fullWidth sx={{ mb: 2 }} placeholder='xyz@example.com' type='email'{...field} />)}
              />
              {errors.email && <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}>{errors.email.message}</FormHelperText>}
            </FormControl>
            <InputLabel htmlFor='auth-login-v2-password' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Password</InputLabel>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <OutlinedInput
                    id='auth-login-v2-password'
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                )}
              />
              {errors.password && (
                <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }} id=''>
                  {errors.password.message}
                </FormHelperText>
              )}
            </FormControl>
            <InputLabel htmlFor='demo-simple-select-label' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Role</InputLabel>
            <FormControl fullWidth>
              <Controller
                name='role'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    {...field}
                  >
                    <MenuItem value={'teacher'}>Teacher</MenuItem>
                    <MenuItem value={'student'}>Student</MenuItem>
                  </Select>
                )}
              />
              {errors.role && (
                <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }} id=''>
                  {errors.role.message}
                </FormHelperText>
              )}
            </FormControl>
            <FormControlLabel
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', color: 'text.secondary' } }}
              control={<Checkbox />}
              label={
                <>
                  <Typography variant='body2' component='span'>
                    I agree to{' '}
                  </Typography>
                  <LinkStyled href='/' onClick={e => e.preventDefault()}>
                    privacy policy & terms
                  </LinkStyled>
                </>
              }
            />
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4, textTransform: 'capitalize' }}>
              Sign up
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant='body2' sx={{ mr: 2 }}>
                Already have an account?
              </Typography>
              <Typography variant='body2'>
                <LinkStyled href='/login'>Sign in instead</LinkStyled>
              </Typography>
            </Box>
            <Divider sx={{ my: `${theme.spacing(6)} !important` }}>or</Divider>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton href='/' component={Link} sx={{ color: '#497ce2' }} onClick={e => e.preventDefault()}>
                <Icon icon='bxl:facebook-circle' />
              </IconButton>
              <IconButton href='/' component={Link} sx={{ color: '#1da1f2' }} onClick={e => e.preventDefault()}>
                <Icon icon='bxl:twitter' />
              </IconButton>
              <IconButton
                href='/'
                component={Link}
                onClick={e => e.preventDefault()}
                sx={{ color: theme.palette.mode === 'light' ? '#272727' : 'grey.300' }}
              >
                <Icon icon='bxl:github' />
              </IconButton>
              <IconButton href='/' component={Link} sx={{ color: '#db4437' }} onClick={e => e.preventDefault()}>
                <Icon icon='bxl:google' />
              </IconButton>
            </Box>
          </form>
        </Box>
      </RightWrapper >
    </Box >
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true

export default Register
