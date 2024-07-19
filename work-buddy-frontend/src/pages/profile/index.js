// src/components/Profile.js
import { useState, useEffect } from 'react';
import { Container, Typography, Avatar, Button, TextField, CircularProgress, Box } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { ROLE_STUDENT, ROLE_TEACHER } from 'src/constants/constant';

const Profile = () => {
    // const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    console.log('file: ', file);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth()
    const BASE_URL = 'http://localhost:1337';

    const uploadAvatar = async (file, token) => {
        console.log('file: ', file);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('response: ', response);
            const data = await response.json();
            console.log('data: ', data);
        } catch (error) {
            console.error('There was an error uploading the file:', error);
            throw error;
        }
    };
    // const getUserDetails = async (userId, token) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/user/${userId}`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error fetching user details:', error);
    //         throw error;
    //     }
    // };

    // useEffect(() => {
    //     const fetchUserDetails = async () => {
    //         try {
    //             const response = await getUserDetails(userId, token);
    //             setUser(response.data);
    //         } catch (error) {
    //             console.error('Error fetching user details:', error);
    //         }
    //     };

    //     fetchUserDetails();
    // }, [userId, token]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        setLoading(true);
        try {
            await uploadAvatar(file, user?.token);
            setMessage('File uploaded successfully!');
            setLoading(false);
            // Refresh user details after successful upload
            // const response = await getUserDetails(, token);
            // setUser(response.data);
        } catch (error) {
            setMessage('File upload failed.');
            setLoading(false);
            console.error('Error:', error);
        }
    };

    if (!user) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar alt={user.name} src={user.avatarUrl} sx={{ width: 120, height: 120 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    {user.name}
                </Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    value={user.email}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="upload-avatar"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="upload-avatar">
                    <Button variant="contained" component="span" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                </label>
                <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
                {message && <Typography variant="body1">{message}</Typography>}
            </Box>
        </Container>
    );
};
Profile.acl = {
    action: 'manage',
    subject: [ROLE_TEACHER, ROLE_STUDENT],
}

export default Profile;
