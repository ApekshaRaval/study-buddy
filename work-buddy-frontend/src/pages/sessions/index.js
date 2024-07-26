// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ROLE_TEACHER } from 'src/constants/constant'

// ** Third Party Imports
import * as yup from 'yup'
import { useFieldArray, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Chip, Link, Tooltip } from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import CreateSessionModal from './CreateSessionModal'
import CreateQuizModal from './CreateQuizModal'
import { Box } from '@mui/system'
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
const SessionsPage = () => {
  const [previewForVideo, setPreviewForVideo] = useState(null)
  const [tab, setTab] = useState('create')
  const { user } = useAuth()
  const [sessionDate, setSessionDate] = useState()
  const [sessionStartTime, setSessionStartTime] = useState(new Date().getTime())
  const [sessionEndTime, setSessionEndTime] = useState(new Date().getTime())
  const [sessions, setSessions] = useState()
  const router = useRouter()
  const [editSession, setEditSession] = useState(false)
  const [users, setUsers] = useState([])

  const handleChange = (event, newValue) => {
    setTab(newValue)
    setPreviewForVideo(null), reset()
  }
  // ** Hooks
  const schema = yup.object().shape({
    sessionTitle: yup.string().required()
  })
  const [open, setOpen] = useState(false)
  const [OpenQuiz, setOpenQuiz] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleOpenQuiz = () => {
    setOpenQuiz(true)
  }


  const handleCloseQuiz = () => {
    setOpenQuiz(false)
  }
  const handleClose = () => {
    setOpen(false)
    setPreviewForVideo(null), reset()
  }

  const {
    control,
    setError,
    handleSubmit,
    reset,
    watch,
    register,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(schema)
  })
  const [countdowns, setCountdowns] = useState({});
  const now = new Date();
  const fiveHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);


  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: "quizcontent",
  });

  const sendNotification = async (selectedUser, message) => {
    const response = await fetch('http://localhost:1337/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderid: user?.id,
        receiverid: selectedUser,
        message
      })
    })
    const responseData = await response.json()
    if (responseData?.status === 200 || responseData?.errorCode === 'SUC000') {
      toast.success(responseData.message)
    } else {
      toast.error(responseData.message)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const fetchResponse = fetch('http://localhost:1337/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${window.localStorage.getItem('accessToken')}`
        }
      })

      const response = await fetchResponse
      const data = await response.json()
      const users = data?.data?.filter(users => users.id !== user?.id)
      setUsers(users)
    } catch (err) {
      console.log('err: ', err)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const onSubmit = async (data) => {
    try {
      const payload = {
        sessionTitle: data?.sessionTitle,
        sessionDate: Number(sessionDate?.valueOf()),
        startTime: Number(sessionStartTime?.valueOf()),
        endTime: Number(sessionEndTime?.valueOf()),
        sessionContent: previewForVideo,
        sessionLink: data?.sessionLink,
        teacherId: user?.id,
        subject: data?.subject,
        sessionType: tab,
        quizcontent: data?.quizcontent
      };

      const response = await fetch('http://localhost:1337/api/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      if (responseData?.status === 200 || responseData?.errorCode === 'SUC000') {
        toast.success(responseData.message);
        setOpen(false)
        setPreviewForVideo(null)
        reset()
        fetchSessions()
        if (users?.length > 0) {
          const filteredUsers = users?.filter(user => user.role === 'student' && user.subjects?.includes(data?.subject)).map(user => user.id);
          const message = `${user?.userName} has created a new session!`;
          await sendNotification(filteredUsers, message);
        }
      } else {
        toast.error(responseData.message);
      }

    } catch (error) {
      console.log('error: ', error);
      toast.error("An error occurred while creating the session");
      console.error(error);
    }
  };


  const handleMediaChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewForVideo(previewUrl);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};
      sessions && sessions.forEach(session => {
        const sessionTime = new Date(Number(session.sessionDate)).getTime();
        const now = new Date().getTime();
        const timeDiff = sessionTime - now;

        if (timeDiff > 0) {
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          newCountdowns[session.sessionId] = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          newCountdowns[session.sessionId] = 'Started';
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/teacher-sessions/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        }
      });

      const data = await response.json();
      if (data?.status === 200) {
        setSessions(data?.data?.rows);
      } else {
        toast.error(data?.message || "Failed to fetch sessions");
      }
    } catch (error) {
      toast.error("An error occurred while fetching sessions");
      console.error(error);
    }
  };


  useEffect(() => {
    fetchSessions()
  }, [])

  const deleteSession = async (sessionId) => {
    const response = await fetch(`http://localhost:1337/api/delete-session/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`
      }
    })
    const data = await response.json()
    if (data?.status === 200) {
      toast.success(data?.message)
      fetchSessions()
    }
  }

  return (
    <Box sx={{ position: 'relative' }} >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', '& .css-o01fge-MuiButtonBase-root-MuiButton-root': { p: 0, minWidth: '30px', height: '30px' } }}>
        <Tooltip title='Create Session'>
          <Button onClick={handleClickOpen}><AddIcon /></Button>
        </Tooltip>
        <Tooltip title='Create Quiz'>
          <Button onClick={handleOpenQuiz}><QuizIcon /></Button>
        </Tooltip>
      </Box>
      <Grid container spacing={6} mt={5}>
        {sessions &&
          sessions?.length > 0 &&
          sessions.map(session => (
            <Grid item xs={12} md={6} lg={4} key={session?.sessionId}>
              <Card
                key={session?.sessionId}
                style={{
                  position: 'relative',
                  minWidth: { xs: '100%', lg: '300px', md: '400px' },
                  width: '100%',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  backgroundImage:
                    'url(https://img.freepik.com/premium-photo/white-flowers-background_853558-41364.jpg)',
                  backgroundSize: 'cover'
                }}
              >
                <Chip label={session?.sessionDate < fiveHoursLater ? 'Ongoing' : session?.sessionDate === fiveHoursLater ? 'Ended' : countdowns[session.sessionId] || 'loading..'}
                  sx={{ position: 'absolute', bottom: '10px', right: '10px', fontWeight: 'bold', backgroundColor: session?.sessionDate < fiveHoursLater ? '#0E74D0' : session?.sessionDate === fiveHoursLater ? 'red' : '#98CFFD', color: 'white' }} variant='outlined' />
                <CardContent>
                  <Typography variant='h5' sx={{ mb: 3 }}>{session?.sessionTitle}</Typography>
                  <Chip label={session?.subject} sx={{ mb: 3, fontWeight: 'bold', backgroundColor: '#98CFFD', color: 'white' }} />
                  <Typography variant='body2' sx={{ mb: 3, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {new Date(Number(session?.sessionDate)).toDateString()}
                    {session?.sessionType === 'schedule' && (
                      <>
                        {' - '}
                        {new Date(Number(session?.startTime)).getHours().toString().padStart(2, '0')}:
                        {new Date(Number(session?.startTime)).getMinutes().toString().padStart(2, '0')}
                        {' to '}
                        {new Date(Number(session?.endTime)).getHours().toString().padStart(2, '0')}:
                        {new Date(Number(session?.endTime)).getMinutes().toString().padStart(2, '0')}
                      </>
                    )}
                  </Typography>


                  {session?.sessionContent && (
                    <Box sx={{ mb: 4 }}>
                      <video controls style={{ width: '100%', maxHeight: '300px', borderRadius: '10px' }}>
                        <source src={session?.sessionContent} />
                      </video>
                    </Box>
                  )}
                  {session?.sessionLink && (
                    <Box sx={{ mb: 4 }}>
                      <Link href={session?.sessionLink} target='_blank' rel='noopener' sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
                        {session?.sessionLink}
                      </Link>
                    </Box>
                  )}
                  {
                    session?.quizcontent && session?.quizcontent.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Button variant='outlined' sx={{ mt: 3, fontWeight: 'bold', mb: 4 }}>View Quiz</Button>
                      </Box>
                    )
                  }
                </CardContent>
                <Box sx={{ position: 'absolute', top: '10px', right: '10px', '& .css-o01fge-MuiButtonBase-root-MuiButton-root': { p: 0, minWidth: '30px', height: '30px' } }}>
                  <Button sx={{ width: '30px', height: '30px', px: 0, color: 'black' }} onClick={() => router.push(`/sessions/${session?.sessionId}`)}><RemoveRedEyeIcon /></Button>
                  <Button onClick={() => { setEditSession(!editSession), setOpen(true) }} sx={{ width: '30px', height: '30px', px: 0 }}><ModeEditIcon /></Button>
                  <Button sx={{ width: '30px', height: '30px', px: 0 }} color='error' onClick={() => deleteSession(session?.sessionId)}><DeleteIcon /></Button>
                </Box>

              </Card>
            </Grid>
          ))}
      </Grid>
      {
        sessions?.length <= 0 && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><h2>No Sessions Found</h2></Box>
      }
      {
        open ? (
          <CreateSessionModal
            previewForVideo={previewForVideo}
            errors={errors}
            control={control}
            onSubmit={handleSubmit(onSubmit)}
            handleMediaChange={handleMediaChange}
            sessionDate={sessionDate}
            setSessionDate={setSessionDate}
            setPreviewForVideo={setPreviewForVideo}
            tab={tab}
            setTab={setTab}
            edit={editSession}
            handleChange={handleChange}
            open={open}
            setOpen={setOpen}
            handleClose={handleClose}
            sessionEndTime={sessionEndTime}
            sessionStartTime={sessionStartTime}
            setSessionEndTime={setSessionEndTime}
            setSessionStartTime={setSessionStartTime}
          />
        ) : null
      }
      {
        OpenQuiz ? (
          <CreateQuizModal
            previewForVideo={previewForVideo}
            errors={errors}
            control={control}
            onSubmit={handleSubmit(onSubmit)}
            handleMediaChange={handleMediaChange}
            sessionDate={sessionDate}
            setSessionDate={setSessionDate}
            setPreviewForVideo={setPreviewForVideo}
            tab={tab}
            setTab={setTab}
            handleChange={handleChange}
            open={OpenQuiz}
            setOpen={setOpenQuiz}
            handleClose={handleCloseQuiz}
            register={register}
            fields={fields}
            append={append}
            remove={remove}
          />
        ) : null
      }
    </Box >
  )
}

SessionsPage.acl = {
  action: 'manage',
  subject: [ROLE_TEACHER]
}

export default SessionsPage
