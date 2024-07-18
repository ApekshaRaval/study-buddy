// ** React Imports
import { useEffect, useState } from 'react';

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ROLE_STUDENT } from 'src/constants/constant';

import { Link } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth'

const Classroom = () => {
    const { user } = useAuth()
    const [sessions, setSessions] = useState()

    const fetchSessions = async () => {
        const response = await fetch(`http://localhost:1337/api/sessions/${user?.id}`, {
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


    return (
        <Grid container spacing={6}>

            <Grid item md={6} xs={12} >
                {sessions && sessions?.length > 0 && sessions.map((session) => (
                    <Card key={session?.sessionId} style={{ marginBottom: '20px' }}>
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
                                    Join Session
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Grid>
        </Grid >
    )
}

Classroom.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT]
}

export default Classroom
