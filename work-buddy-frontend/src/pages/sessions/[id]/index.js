import { Card, CardContent, Link, Typography, Grid, IconButton, Button, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { ROLE_TEACHER } from "src/constants/constant";
import { useAuth } from "src/hooks/useAuth";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/router";
const SessionDetailPage = ({ params }) => {
    const { user } = useAuth();
    const [session, setSession] = useState();
    const [teacherDetail, setTeacherDetail] = useState();
    const router = useRouter()
    const fetchTeacherDetail = async (id) => {
        const response = await fetch(`http://localhost:1337/api/user-detail/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
        });
        const data = await response.json();
        if (data?.status === 200) {
            setTeacherDetail(data?.data);
        }
    };

    const fetchSessionDetail = async () => {
        const { id } = params;
        const fetchDetail = await fetch(`http://localhost:1337/api/session/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
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

    return (
        <>
            <Box sx={{ marginBottom: '20px' }}>
                <Button variant="text" onClick={() => router.back()}  ><ArrowBackIcon /></Button>
            </Box>
            <Card style={{ margin: '20px', padding: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>{session?.sessionTitle}</Typography>
                            <Typography variant="h6" color="textSecondary" gutterBottom >{session?.subject}</Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                {new Date(Number(session?.sessionDate)).toLocaleString()}
                            </Typography>
                            {session?.sessionContent && (
                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                    <video controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <source src={session?.sessionContent} />
                                    </video>
                                </div>
                            )}
                            {session?.sessionLink && (
                                <Link href={session?.sessionLink} target="_blank" rel="noopener">
                                    <IconButton color="primary">
                                        <PlayCircleOutlineIcon />
                                    </IconButton>
                                    Join Session
                                </Link>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>Teacher</Typography>
                            <Typography variant="h5" gutterBottom>{teacherDetail?.userName}</Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <EmailIcon fontSize="small" /> {teacherDetail?.email}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
};

SessionDetailPage.acl = {
    action: 'manage',
    subject: [ROLE_TEACHER]
};

export async function getServerSideProps(context) {
    const { id } = context.params;
    return {
        props: {
            params: { id },
        },
    };
}

export default SessionDetailPage;
