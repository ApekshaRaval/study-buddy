import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { ROLE_STUDENT } from 'src/constants/constant';
import { Button, Chip, Link } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { useRouter } from 'next/router';
import { Box } from '@mui/system';

const Classroom = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [countdowns, setCountdowns] = useState({});
    const router = useRouter();
    const now = new Date();

    const fiveHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const fetchSessions = async () => {
        const response = await fetch(`http://localhost:1337/api/sessions/${user?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
        });
        const data = await response.json();
        if (data?.status === 200) {
            setSessions(data?.data?.rows);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const newCountdowns = {};
            sessions.forEach(session => {
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

    const getSessionDuration = (startTime, endTime) => {
        // Ensure the startTime and endTime are valid numbers
        const start = new Date(Number(startTime));
        const end = new Date(Number(endTime));

        // Check if the dates are valid
        if (isNaN(start) || isNaN(end)) {
            return 'Invalid date';
        }

        // Calculate the duration in milliseconds
        const duration = end - start;

        // Convert duration to hours and minutes
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    return (
        <Grid container spacing={6} mt={5}>
            {sessions &&
                sessions.length > 0 &&
                sessions.map(session => (
                    <Grid item xs={12} md={6} lg={4} key={session.sessionId}>
                        <Card
                            key={session.sessionId}
                            style={{
                                position: 'relative',
                                minWidth: { xs: '100%', lg: '300px', md: '400px' },
                                width: '100%',
                                minHeight: '200px',
                                height: 'auto',
                                marginBottom: '20px',
                                cursor: 'pointer',
                                backgroundImage: 'url(https://t4.ftcdn.net/jpg/03/09/90/87/360_F_309908742_ylcAx40hxV26oMvqWhXNnoWbNnX5eC1S.jpg)',
                                backgroundSize: 'cover'
                            }}
                            onClick={() => router.push(`/classroom/${session.sessionId}`)}
                        >
                            <Chip
                                label={
                                    session?.sessionType === 'schedule'
                                        ? `Duration: ${getSessionDuration(session?.startTime, session?.endTime)}`
                                        : session?.sessionDate < fiveHoursLater ? 'Ongoing' : session?.sessionDate === fiveHoursLater ? 'Ended' : countdowns[session.sessionId]
                                }
                                sx={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#98CFFD',
                                    color: 'white'
                                }}
                                variant='outlined'
                            />
                            <CardContent>
                                <Typography variant='h5' sx={{ mb: 3 }}>{session.sessionTitle}</Typography>
                                <Chip label={session.subject} sx={{ mb: 3, fontWeight: 'bold', backgroundColor: '#98CFFD', color: 'white' }} />
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
                                {session.sessionContent && (
                                    <video controls style={{ width: '100%', maxHeight: '300px' }}>
                                        <source src={session.sessionContent} />
                                    </video>
                                )}
                                {session.sessionLink && (
                                    <Link href={session.sessionLink} target='_blank' rel='noopener' sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
                                        {session.sessionLink}
                                    </Link>
                                )}
                                {session?.quizcontent && session?.quizcontent.length > 0 && (
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ mt: 3, fontWeight: 'bold' }}>
                                            Quiz starts in: {countdowns[session.sessionId] || 'Loading...'}
                                        </Typography>
                                        <Button
                                            variant='outlined'
                                            sx={{ mt: 3, fontWeight: 'bold' }}
                                            onClick={() => router.push(`/quiz/${session.sessionId}`)}
                                            disabled={countdowns[session.sessionId] !== 'Started'}
                                        >
                                            Start Quiz
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    );
};

Classroom.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT]
};

export default Classroom;
