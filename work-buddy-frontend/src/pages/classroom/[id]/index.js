
import { Card, CardContent, Link, Typography, Grid, IconButton, Button, Box, Chip, InputLabel, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ROLE_STUDENT } from 'src/constants/constant';
import { useAuth } from 'src/hooks/useAuth';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import EventIcon from '@mui/icons-material/Event';
import { Controller, useForm } from 'react-hook-form';

const SessionDetailPage = ({ params }) => {
    const { user } = useAuth();
    const [session, setSession] = useState();
    const [teacherDetail, setTeacherDetail] = useState();
    const quiz = session?.quizcontent;
    const [start, setStart] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const router = useRouter();
    const now = new Date();
    const fiveHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const fetchTeacherDetail = async id => {
        const response = await fetch(`http://localhost:1337/api/user-detail/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.token}`
            }
        });
        const data = await response.json();
        if (data?.status === 200) {
            setTeacherDetail(data?.data);
        }
    };

    const {
        control,
        getValues,
        formState: { errors }
    } = useForm({
        mode: 'onSubmit',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (session?.sessionDate) {
                const now = new Date().getTime();
                const sessionTime = new Date(Number(session.sessionDate)).getTime();
                const timeDiff = sessionTime - now;

                if (timeDiff <= 0) {
                    clearInterval(interval);
                    setCountdown(null);
                } else {
                    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                    setCountdown(`${hours}h ${minutes}m ${seconds}s`);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const fetchSessionDetail = async () => {
        const { id } = params;
        const fetchDetail = await fetch(`http://localhost:1337/api/session/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.token}`
            }
        });
        const data = await fetchDetail.json();
        if (data?.status === 200) {
            setSession(data?.data.rows[0]);
            fetchTeacherDetail(data?.data?.rows[0]?.teacherId);
        }
    };

    useEffect(() => {
        fetchSessionDetail();
    }, []);
    const submitQuiz = () => {
        const { quizcontent } = getValues();
        const parsedData = session?.quizcontent?.map(item => JSON.parse(item));
        const data = parsedData.map((item, index) => {

            return {
                question: item?.question,
                answer: item?.answer,
                isCorrect: (item?.answer).toLowerCase() === (quizcontent[index].answer).toLowerCase()
            }

        })
        console.log("data: ", data)
    }

    const QuestionAnswerList = ({ data }) => {
        const parsedData = data.map(item => JSON.parse(item));
        return (
            <Box sx={{ width: '100%', mt: 10, p: 10 }}>
                <Typography sx={{ mb: 3 }}>Question and Answer</Typography>
                {parsedData.map((item, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                        <Box>
                            <InputLabel
                                htmlFor='demo-simple-select-label'
                                sx={{ fontSize: '0.90rem', my: 1.5, color: '#0e74d0', fontWeight: 600 }}
                            >
                                {index + 1}) question
                            </InputLabel>
                            <Controller
                                render={({ field }) => <TextField {...field} fullWidth sx={{ mb: 2 }} disabled />}
                                name={`quizcontent.${index}.question`}
                                defaultValue={item.question}
                                control={control}
                            />
                            <InputLabel
                                htmlFor='demo-simple-select-label'
                                sx={{ fontSize: '0.90rem', my: 1.5, color: '#0e74d0', fontWeight: 600 }}
                            >
                                {index + 1}) Answer
                            </InputLabel>
                            <Controller
                                render={({ field }) => <TextField {...field} fullWidth />}
                                name={`quizcontent.${index}.answer`}
                                control={control}
                            />
                        </Box>
                    </div>
                ))}
                <Button variant='contained' onClick={submitQuiz}>Submit Quiz</Button>
            </Box>
        );
    };

    return (
        <>
            <Box sx={{ marginBottom: '20px' }}>
                <Button variant='text' onClick={() => router.back()}>
                    <ArrowBackIcon />
                </Button>
            </Box>
            <Card
                style={{
                    margin: '20px',
                    padding: '20px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    backgroundImage:
                        'url(https://t4.ftcdn.net/jpg/03/09/90/87/360_F_309908742_ylcAx40hxV26oMvqWhXNnoWbNnX5eC1S.jpg)',
                    backgroundSize: 'cover'
                }}
            >
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant='h5' gutterBottom sx={{ color: 'primary.main' }}>
                                {session?.sessionTitle}
                            </Typography>
                            <Chip
                                label={session?.subject}
                                sx={{ mb: 3, fontWeight: 'bold', backgroundColor: '#98CFFD', color: 'white' }}
                            />
                            <Chip
                                icon={<EventIcon sx={{ color: 'white !important' }} />}
                                label={new Date(Number(session?.sessionDate)).toLocaleString()}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'absolute',
                                    right: '10px',
                                    top: '20px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#0E74D0',
                                    color: 'white'
                                }}
                            />
                            {session?.sessionContent && (
                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                    <video controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <source src={session?.sessionContent} />
                                    </video>
                                </div>
                            )}
                            {session?.sessionLink && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {countdown && <Typography variant='h6' sx={{ mt: 3, fontWeight: 'bold' }}>
                                        Lecture starts in: {countdown}
                                    </Typography>}
                                    {session?.sessionDate < fiveHoursLater ? <Link href={session?.sessionLink} target='_blank' rel='noopener' disabled={session?.sessionDate > fiveHoursLater}>
                                        <IconButton color='primary'>
                                            <PlayCircleOutlineIcon />
                                        </IconButton>
                                        Join Session
                                    </Link> : <Typography sx={{ mt: 3, fontWeight: 'bold', color: 'red', fontSize: '1.2rem' }}> Session has ended</Typography>}
                                </Box>
                            )}
                            {session?.quizcontent ? countdown ? (
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant='h6' sx={{ mt: 3, fontWeight: 'bold' }}>
                                        Quiz starts in: {countdown}
                                    </Typography>
                                    <Button
                                        variant='outlined'
                                        sx={{ mt: 3, fontWeight: 'bold' }}
                                        onClick={() => setStart(true)}
                                        disabled={countdown !== 0}
                                    >
                                        Start Quiz
                                    </Button>


                                </Box>
                            ) : (
                                <Box >
                                    {!start && <Button variant='outlined' onClick={() => setStart(true)} sx={{ mt: 3, fontWeight: 'bold' }}>
                                        Start Quiz
                                    </Button>}
                                </Box>
                            ) : null}

                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant='h5' gutterBottom sx={{ color: 'primary.main' }}>
                                Teacher
                            </Typography>
                            <Typography variant='h5' gutterBottom>
                                {teacherDetail?.userName}
                            </Typography>
                            <Typography variant='body1' color='textSecondary' sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <EmailIcon fontSize='small' /> {teacherDetail?.email}
                            </Typography>
                        </Grid>

                        {start && <QuestionAnswerList data={session?.quizcontent} />}
                    </Grid>
                </CardContent>
            </Card >
        </>
    );
};

SessionDetailPage.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT]
};

export async function getServerSideProps(context) {
    const { id } = context.params;
    return {
        props: {
            params: { id }
        }
    };
}

export default SessionDetailPage
