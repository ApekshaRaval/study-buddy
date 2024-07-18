import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { ROLE_STUDENT, subjects } from 'src/constants/constant'
import { useAuth } from 'src/hooks/useAuth'
import * as React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const Subjects = () => {
    const { user } = useAuth()
    const [subjectsData, setSubjectsData] = React.useState([]);
    console.log('subjectsData: ', subjectsData);
    const router = useRouter()
    const role = user?.role

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSubjectsData(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const fetchSubjectData = async () => {
        const fetchResponse = await fetch(`http://localhost:1337/get-subjects/${user?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
        })
        const data = await fetchResponse.json()
        if (data?.status === 200 && data?.data?.subjects) {
            const subjectsData = data?.data?.subjects
            console.log('subjectsData: ', subjectsData);
            const isSubjectDataIsNotEmpty = (subjectsData) === '{}'
            console.log('isSubjectDataIsNotEmpty: ', isSubjectDataIsNotEmpty);
            let arr = !isSubjectDataIsNotEmpty ? subjectsData.replace(/[{}"]/g, '').split(',') : [];
            setSubjectsData(arr);
        }
    }

    React.useEffect(() => {
        fetchSubjectData()
    }, [])

    const handleSubmit = async () => {
        const payload = {
            subjects: subjectsData,
            studentId: user?.id
        }
        const fetchResponse = await fetch(`http://localhost:1337/update-subject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(payload)
        })

        const data = await fetchResponse.json()
        if (data?.status === 200) {
            toast.success(data?.message)
            router.push('/dashboard')
        }
    }

    const handleSkip = () => {
        router.push('/dashboard')
    }

    const handleReset = async () => {
        const payload = {
            subjects: [],
            studentId: user?.id
        }
        const fetchResponse = await fetch(`http://localhost:1337/update-subject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(payload)
        })
        console.log('fetchResponse: ', fetchResponse);

        const data = await fetchResponse.json()
        if (data?.status === 200) {
            toast.success(data?.message)
            router.push('/dashboard')
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title={`Welcome ${user?.userName}`} sx={{ textAlign: 'center', }} subheader={role} ></CardHeader>
                    <Box sx={{ textAlign: 'end' }}>
                        <Button variant="outlined" sx={{ mx: 4, textTransform: 'none' }} onClick={handleSkip}>Skip</Button>
                    </Box>
                    <CardContent>
                        <InputLabel id="demo-multiple-chip-label" sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}>Select your favourite subject</InputLabel>
                        <FormControl fullWidth>
                            <Select
                                labelId="demo-multiple-chip-label"
                                id="demo-multiple-chip"
                                multiple
                                value={subjectsData}
                                onChange={handleChange}
                                input={<OutlinedInput id="select-multiple-chip" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {subjects.map(subject => (
                                    <MenuItem key={subject.key} value={subject.value}>
                                        {subject.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="contained" sx={{ mt: 3, textTransform: 'none' }} onClick={handleSubmit}>Submit</Button>
                            <Button variant="contained" sx={{ mt: 3, textTransform: 'none', backgroundColor: '#98CFFD' }} onClick={handleReset}>Reset</Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid >
    )
}

Subjects.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT]
}

export default Subjects
