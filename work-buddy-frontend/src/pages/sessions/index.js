// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ROLE_TEACHER, subjects } from 'src/constants/constant';

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Tab,
  TextField,
} from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import { Box } from '@mui/system'
import { Delete } from '@mui/icons-material'
import { useAuth } from 'src/hooks/useAuth'
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import InputIcon from "react-multi-date-picker/components/input_icon"
import DatePickerHeader from "react-multi-date-picker/plugins/date_picker_header"
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import styled from '@emotion/styled'
import { TabContext, TabList } from '@mui/lab'

const SessionsPage = () => {
  const [previewForVideo, setPreviewForVideo] = useState(null)
  const [tab, setTab] = useState('create');
  const { user } = useAuth()
  const [sessionDate, setSessionDate] = useState()
  const [sessions, setSessions] = useState()
  const router = useRouter()

  const handleChange = (event, newValue) => {
    setTab(newValue);
    setPreviewForVideo(null),
      reset()
  };
  // ** Hooks
  const ability = useContext(AbilityContext)
  const schema = yup.object().shape({
    sessionTitle: yup.string().required(),
  })
  console.log(new Date(1721316600984));

  const {
    control,
    setError,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(schema)
  })

  const TabListStyled = styled(TabList)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    marginLeft: '12px',
    marginLeft: '12px',
    '& .MuiTabs-indicator': {
      display: 'none'
    },
    '& .Mui-selected': {
      textTransform: 'capitalize',
      color: 'white !important',
      backgroundColor: theme.palette.primary.main,
      borderRadius: 4
    }
  }))
  const sendNotification = async () => {
    const response = await fetch('http://localhost:1337/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderId: user?.id,
      })
    })
    const responseData = await response.json()
    if (responseData?.status === 200 || responseData?.errorCode === "SUC000") {
      toast.success(responseData.message)
    } else {
      toast.error(responseData.message)
    }
  }

  const onSubmit = async (data) => {
    const payload = {
      sessionTitle: data?.sessionTitle,
      sessionDate: Number(sessionDate?.valueOf()),
      sessionContent: previewForVideo,
      sessionLink: data?.sessionLink,
      teacherId: user?.id,
      subject: data?.subject,
      sessionType: tab
    }

    const response = await fetch('http://localhost:1337/api/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()
    if (responseData?.status === 200 || responseData?.errorCode === "SUC000") {
      toast.success(responseData.message)
      router.push('/dashboard')
    } else {
      toast.error(responseData.message)
    }
  }

  const handleMediaChange = event => {
    const file = event.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreviewForVideo(previewUrl)
      UploadFile(file)
    }
  }

  const UploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('http://localhost:1337/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    })
    const responseData = await response.json()
    if (responseData?.status === 200 || responseData?.errorCode === "SUC000") {
      toast.success(responseData.message)
    } else {
      toast.error(responseData.message)
    }
  }

  const fetchSessions = async () => {
    const response = await fetch(`http://localhost:1337/api/teacher-sessions/${user?.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
    })
    const data = await response.json()
    if (data?.status === 200) {
      setSessions(data?.data?.rows)
    };
  }

  useEffect(() => {
    fetchSessions()
  }, [])
  const options = {
    body: "Your code submission has received 3 new review comments.",
    renotify: true,
  };

  return (
    <Grid container spacing={6} >
      <Grid item md={6} xs={12} >
        <Card sx={{ minHeight: "600px", height: "100%" }}>
          <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper', mt: 3, px: 3 }}>
            <TabContext value={tab}>
              <TabListStyled
                onChange={handleChange}
                aria-label="scrollable force tabs example"
              >
                <Tab label="Create Session" value={'create'} sx={{ fontSize: '0.90rem', color: '#0e74d0', fontWeight: 600, textTransform: 'capitalize' }} />
                <Tab label="Schedule Session" value={'schedule'} sx={{ fontSize: '0.90rem', color: '#0e74d0', fontWeight: 600, textTransform: 'capitalize' }} />
              </TabListStyled>
            </TabContext>
          </Box>
          <CardContent>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <InputLabel htmlFor='auth-login-v2-email' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Session Title</InputLabel>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Controller
                  name='sessionTitle'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoFocus
                      size='small'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      error={Boolean(errors.title)}
                      placeholder='Enter title'
                    />
                  )}
                />
                {errors.sessionTitle && <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}>{errors.sessionTitle.message}</FormHelperText>}
              </FormControl>
              <InputLabel htmlFor='auth-login-v2-email' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Session Date</InputLabel>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Controller
                  name='sessionDate'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <DatePicker
                      render={<InputIcon />}
                      format="MM/DD/YYYY HH:mm:ss"
                      showOtherDays
                      minDate={new Date()}
                      onChange={setSessionDate}
                      value={sessionDate}
                      plugins={[
                        <TimePicker position="bottom" />,
                        <DatePickerHeader position="left" />
                      ]}
                    />
                  )}
                />
                {errors.sessionDate && <FormHelperText sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}>{errors.sessionDate.message}</FormHelperText>}
              </FormControl>
              {tab === 'create' && previewForVideo === null && (
                <>
                  <InputLabel htmlFor='demo-simple-select-label' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Upload Session</InputLabel>

                  <Button variant='outlined' component='label' sx={{ width: '100%', mb: 2, height: '100px' }}>
                    <VideoFileIcon sx={{ color: '#0e74d0', fontSize: '2rem' }} />
                    <input
                      type='file'
                      accept='video/*'
                      hidden
                      onChange={handleMediaChange}
                    />
                  </Button>
                </>
              )}
              {previewForVideo !== null && (
                <>
                  <InputLabel htmlFor='demo-simple-select-label' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}> Preview Session</InputLabel>

                  <Box sx={{ mt: 2, width: '100%', position: 'relative', mb: 2 }}>
                    <Delete sx={{ color: 'red', fontSize: '2rem', position: 'absolute', top: 10, right: 10 }} style={{ zIndex: 1, cursor: 'pointer' }} onClick={() => setPreviewForVideo(null)} />
                    <video controls style={{ width: '100%', maxHeight: '300px' }}>
                      <source src={previewForVideo} />
                    </video>
                  </Box>
                </>
              )}
              <InputLabel htmlFor='demo-simple-select-label' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>{tab === 'create' ? 'Link' : 'Meet link'}</InputLabel>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Controller
                  name='sessionLink'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoFocus
                      value={value}
                      size='small'
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={tab === 'create' ? 'Enter link' : 'Enter meet link'}
                    />
                  )}
                />
              </FormControl>
              <InputLabel htmlFor='demo-simple-select-label' sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Subject</InputLabel>
              <FormControl fullWidth>
                <Controller
                  name='subject'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      size='small'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      sx={{ '& .css-1qffa26-MuiList-root-MuiMenu-list': { height: '300px !important' } }}
                      {...field}
                    >
                      {subjects.map(subject => (
                        <MenuItem key={subject.key} value={subject.value}>
                          {subject.value}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <Button type='submit' variant='contained' sx={{ width: '100%', mt: 4, textTransform: 'capitalize' }}>Create Session</Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={6} xs={12} >
        {sessions && sessions?.length > 0 && sessions.map((session) => (
          <Card key={session?.sessionId} style={{ marginBottom: '20px', cursor: 'pointer', backgroundImage: 'url(https://img.freepik.com/free-vector/watercolor-background-with-hand-drawn-elements_23-2148863701.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1721260800&semt=ais_user)', backgroundSize: 'cover' }} onClick={() => router.push(`/sessions/${session?.sessionId}`)}>
            <CardContent>
              <Typography variant="h5">{session?.sessionTitle}</Typography>
              <Typography variant="subtitle1">{session?.subject}</Typography>
              <Typography variant="body2">
                {new Date(Number(session?.sessionDate)).toLocaleString()}
              </Typography>
              {session?.sessionContent && (
                <video controls style={{ width: '100%', maxHeight: '300px' }}>
                  <source src={session?.sessionContent} />
                </video>
              )}
              {session?.sessionLink && (
                <Link href={session?.sessionLink} target="_blank" rel="noopener">
                  {session?.sessionLink}
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid >
  )
}

SessionsPage.acl = {
  action: 'manage',
  subject: [ROLE_TEACHER]
}

export default SessionsPage
