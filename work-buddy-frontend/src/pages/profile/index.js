// src/components/Profile.js
import { useState, useEffect } from 'react';
import { Container, Typography, Avatar, Button, TextField, CircularProgress, Box } from '@mui/material';
import { useAuth } from 'src/hooks/useAuth';
import { ROLE_STUDENT, ROLE_TEACHER } from 'src/constants/constant';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials';
const Profile = () => {
    // const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    console.log('profilePicUrl: ', profilePicUrl);
    const { user } = useAuth()
    const BASE_URL = 'http://localhost:1337';

    const uploadProfilePicture = async (file, token) => {
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch(`${BASE_URL}/upload/image/${user?.id}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    // 'Content-Type': 'multipart/form-data'
                }
            });
            const data = await response.json();
        } catch (error) {
            console.error('There was an error uploading the file:', error);
            throw error;
        }
    };
    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const response = await fetch(`${BASE_URL}/get-profile/${user?.id}`, { responseType: 'blob' });
                const url = URL.createObjectURL(new Blob([response.data]));
                setProfilePicUrl(url);
            } catch (error) {
                console.error('Error fetching profile picture:', error);
            }
        };

        fetchProfilePic();
    }, [user?.id]);



    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        handleUpload(event.target.files[0]);
    };

    const handleUpload = async (file) => {
        setLoading(true);
        try {
            await uploadProfilePicture(file, user?.token);
            setMessage('File uploaded successfully!');
            setLoading(false);
            // Refresh user details after successful upload
            const response = await getUserDetails();
        } catch (error) {
            setMessage('File upload failed.');
            setLoading(false);
            console.error('Error:', error);
        }
    };

    if (!user) {
        return <CircularProgress />;
    }
    const url = `${BASE_URL}${user.profilePicFd}`
    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                    <label htmlFor="upload-avatar">
                        {/* {user?.profilePic ? (
                            <MuiAvatar
                                sx={{ width: '5rem', height: '5rem' }}
                                src={user?.profilePic}
                                alt={user?.userName}
                            />
                        ) : ( */}
                        <CustomAvatar
                            skin='light'
                            // color={store.selectedChat.contact.avatarColor}
                            sx={{ width: '7rem', height: '7rem', fontWeight: 500, fontSize: '3rem' }}
                        >
                            {getInitials(user?.userName)}

                        </CustomAvatar>
                        {/* )} */}
                        {/* <ModeEditOutlineIcon sx={{
                            cursor: 'pointer', position: 'absolute', bottom: 1, right: 1, border: '1px solid #ccc', width: 28, height: 28

                        }} onClick={() => { }} /> */}
                    </label>
                </Box>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="upload-avatar"
                    type="file"
                    onChange={handleFileChange}
                />
                {/* <Typography variant="h6" component="h1" gutterBottom>
                    {user.userName}
                </Typography> */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Full Name"
                    value={user.userName}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    value={user.email}
                    InputProps={{
                        readOnly: true,
                    }}
                />

            </Box>
        </Container>
    );
};
Profile.acl = {
    action: 'manage',
    subject: [ROLE_TEACHER, ROLE_STUDENT],
}

export default Profile;
