import {
    Avatar,
    Badge,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    SpeedDial,
    SpeedDialAction,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { ROLE_STUDENT, ROLE_TEACHER } from 'src/constants/constant'
import { useAuth } from 'src/hooks/useAuth'
import ForumIcon from '@mui/icons-material/Forum'
import CallIcon from '@mui/icons-material/Call'
import GroupsIcon from '@mui/icons-material/Groups'
import VideocamIcon from '@mui/icons-material/Videocam'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import styled from '@emotion/styled'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MicIcon from '@mui/icons-material/Mic'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import EmojiPicker from 'emoji-picker-react'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import ArticleIcon from '@mui/icons-material/Article'
import { useForm } from 'react-hook-form'
import PreviewModel from './PreviewModel'
const socket = io('http://localhost:1337', {
    transports: ['websocket']
})

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -5,
        top: 28,
        // border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px'
    }
}))

const Chat = () => {
    const {
        control,
        getValues,
        register,
        watch,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: 'onSubmit'
    })
    const sm = useMediaQuery('(max-width: 600px)')
    const [messages, setMessages] = useState([])
    console.log('messages: ', messages)
    const currentMessage = useRef(null)
    const [message, setMessage] = useState('')
    const [openModel, setOpenModel] = useState(false)
    const [username, setUsername] = useState('')
    const [users, setUsers] = useState([])
    const wrapperRef = useRef(null)
    const { user } = useAuth()
    const [showEmoji, setShowEmoji] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
    const [previewForImage, setPreviewForImage] = useState(null)
    const [previewForVideo, setPreviewForVideo] = useState(null)
    const [receiver, setReceiver] = useState(null)
    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }
    useEffect(() => {
        if (currentMessage?.current) {
            currentMessage?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }, [message])

    const handleClose = () => {
        setAnchorEl(null)
    }
    const fetchAllMessages = async () => {
        // setLoading(true)
        if (!receiver) return
        console.log("calll")
        try {

            const response = await fetch(
                `http://localhost:1337/chat/message?senderId=${user?.id}&receiverId=${receiver?.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            const data = await response.json()
            setMessages(data?.data)
        } catch (error) {
            console.log('Fetch All Users Error:', error)
        }
    }

    useEffect(() => {
        fetchAllMessages()
    }, [receiver])

    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('message', 'Hello from client')
            console.log('Connected to WebSocket server')
        })

        socket.on('message', newMessage => {
            console.log('newMessage: ', newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage])
        })
        socket.on('message', (messages) => {
            console.log('Received messages:', messages);
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server')
        })

        socket.on('connect_error', error => {
            console.error('WebSocket connection error:', error)
        })

        return () => {
            socket.off('message')
            socket.off('connect')
            socket.off('disconnect')
            socket.off('connect_error')
        }
    }, [message, user, receiver])



    console.log(watch())
    const sendMessage = async () => {
        const { image, video } = getValues()
        if (!message && !image && !video) return

        let messageData = {
            text: message,
            senderId: user?.id,
            receiverId: receiver?.id
        }
        if (image && image.length > 0) {
            const reader = new FileReader()
            reader.onload = () => {
                messageData.image = reader.result
                try {
                    socketConnection.emit('send-message', messageData)
                } catch (error) {
                    console.error('Error sending message:', error)
                }
            }
            reader.readAsDataURL(image[0])
        } else if (video && video.length > 0) {
            const reader = new FileReader()
            reader.onload = () => {
                messageData.video = reader.result
                console.log('messageData', messageData)
                try {
                    socketConnection.emit('send-message', messageData)
                } catch (error) {
                    console.error('Error sending message:', error)
                }
            }
            reader.readAsDataURL(video[0])
        } else {
            try {
                socketConnection.emit('send-message', messageData)
            } catch (error) {
                console.error('Error sending message:', error)
            }
        }

        const res = await fetch('http://localhost:1337/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })

        if (res.ok) {
            socket.emit('message', messageData)
            setMessage('')
            setValue('image', null)
            setValue('video', null)
        }
    }
    const handleMessageChange = e => {
        setMessage(e.target.value)
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

    const onEmojiClick = e => {
        setMessage(prev => prev + e.emoji)
    }

    const useOutsideClick = (ref, handler) => {
        useEffect(() => {
            const handleClickOutside = event => {
                if (ref.current && !ref.current.contains(event.target)) {
                    handler()
                }
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [ref, handler])
    }

    useOutsideClick(wrapperRef, () => setShowEmoji(false))

    const onSubmit = () => {
        console.log(':vghhfghfgh,', getValues())
        sendMessage()
    }

    const handleMediaChange = (event, mediaType) => {
        const file = event.target.files[0]
        if (file) {
            const previewUrl = URL.createObjectURL(file)
            if (mediaType === 'image') {
                setOpenModel(true)
                setValue('image', [file])
                setPreviewForImage(previewUrl)
            }
            if (mediaType === 'video') {
                setOpenModel(true)
                setValue('video', [file])
                setPreviewForVideo(previewUrl)
            }
        }
    }
    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} md={3}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 4,
                            backgroundColor: '#98CFFD',
                            borderRadius: '10px 10px 0 0'
                        }}
                    >
                        <IconButton aria-label='cart'>
                            <StyledBadge badgeContent={4} color='secondary'>
                                <ForumIcon sx={{ width: 25, height: 30, color: 'white' }} />
                            </StyledBadge>
                        </IconButton>
                        <IconButton aria-label='cart'>
                            <StyledBadge badgeContent={4} color='secondary'>
                                <CallIcon sx={{ width: 25, height: 30, color: 'white' }} />
                            </StyledBadge>
                        </IconButton>
                        <IconButton aria-label='cart'>
                            <StyledBadge badgeContent={4} color='secondary'>
                                <GroupsIcon sx={{ width: 35, height: 35, color: 'white' }} />
                            </StyledBadge>
                        </IconButton>
                        <IconButton aria-label='cart'>
                            <StyledBadge badgeContent={4} color='secondary'>
                                <Avatar
                                    src={'https://i.pinimg.com/474x/8c/44/07/8c44070959b012caa775ee4929c15ffe.jpg'}
                                    sx={{ width: 35, height: 35 }}
                                />
                            </StyledBadge>
                        </IconButton>
                    </Box>
                    <Card sx={{ height: '74vh', overflow: 'auto' }}>
                        <CardHeader title='Chat' />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {users &&
                                    users.length > 0 &&
                                    users.map(user => (
                                        <Box
                                            key={user?.id}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}
                                            onClick={() => setReceiver(user)}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar
                                                    src={'https://i.pinimg.com/474x/8c/44/07/8c44070959b012caa775ee4929c15ffe.jpg'}
                                                    sx={{ width: 30, height: 30 }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        border: '2px solid white',
                                                        backgroundColor: 'success.main',
                                                        position: 'absolute',
                                                        bottom: '-1px',
                                                        right: '-2px'
                                                    }}
                                                ></Box>
                                            </Box>
                                            <Typography sx={{ fontWeight: 500, color: 'primary.main' }}>{user?.userName}</Typography>
                                        </Box>
                                    ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={9}>
                    {receiver ? (
                        <Card sx={{ height: '83vh', position: 'relative', overflow: 'auto' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 4,
                                    backgroundColor: '#98CFFD',
                                    borderRadius: '10px 10px 0 0'
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                        <Box>
                                            <Avatar
                                                src={'https://i.pinimg.com/474x/8c/44/07/8c44070959b012caa775ee4929c15ffe.jpg'}
                                                sx={{ width: 40, height: 40 }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 500, color: 'primary.main' }}>{receiver?.userName}</Typography>
                                            <Typography sx={{ fontWeight: 500, color: 'primary.main' }}>last seen at 12:00</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button variant='text'>
                                            <CallIcon sx={{ width: 25, height: 30, color: 'white' }} />
                                        </Button>
                                        <Button variant='text'>
                                            <VideocamIcon sx={{ width: 25, height: 30, color: 'white' }} />
                                        </Button>

                                        <Button variant='text'>
                                            <MoreHorizIcon sx={{ width: 25, height: 30, color: 'white' }} />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {messages &&
                                        messages?.map((data, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: user?.id === data?.senderid ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: '20px',
                                                        // borderRadius: user?._id === data?.messageByUserId ? '10px 0px 10px 10px' : '0px 10px 10px 10px',
                                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                                        background:
                                                            user?.id === data?.senderid
                                                                ? 'linear-gradient(to right bottom, #EEF5FF, #B4D4FF)'
                                                                : 'white'
                                                    }}
                                                    ref={currentMessage}
                                                >
                                                    {data?.image !== "undefined" && (data?.text !== '' || data?.text !== null) && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <img
                                                                src={data?.image}
                                                                alt='Message Image'
                                                                style={{ maxWidth: '200px', borderRadius: '10px', maxHeight: sm ? '150px' : '200px' }}
                                                            />
                                                            {data?.text && (
                                                                <Typography
                                                                    variant='body1'
                                                                    color='text.primary'
                                                                    sx={{ display: 'flex', flexDirection: 'column' }}
                                                                >
                                                                    {data?.text}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                    {data?.video !== "undefined" && (
                                                        <video controls style={{ maxWidth: '200px' }}>
                                                            <source src={data?.video} type='video/mp4' />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                    {data?.text !== '' && data?.text !== null && data?.image === "undefined" && data?.video === "undefined" && (
                                                        <Typography
                                                            variant='body1'
                                                            color='text.primary'
                                                            sx={{ display: 'flex', flexDirection: 'column' }}
                                                        >
                                                            {data?.text}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                </Box>
                            </CardContent>
                            <CardActions
                                sx={{ justifyContent: 'space-between', padding: 4, position: 'absolute', bottom: 0, left: 0, right: 0 }}
                            >
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <TextField
                                        value={message}
                                        onChange={handleMessageChange}
                                        placeholder='Message...'
                                        size='medium'
                                        sx={{ width: '100%' }}
                                    />
                                    <Box sx={{ position: 'absolute', top: 9, right: 9, display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <IconButton
                                            id='basic-button'
                                            aria-controls={open ? 'basic-menu' : undefined}
                                            aria-haspopup='true'
                                            aria-expanded={open ? 'true' : undefined}
                                            onClick={handleClick}
                                        >
                                            <AttachFileIcon />
                                        </IconButton>
                                        <Menu
                                            id='basic-menu'
                                            anchorEl={anchorEl}
                                            open={open}
                                            sx={{ width: '100px', backgroundColor: 'transparent' }}
                                            onClose={handleClose}
                                            MenuListProps={{
                                                'aria-labelledby': 'basic-button'
                                            }}
                                        >
                                            <MenuItem onClick={handleClose}>
                                                <label htmlFor='video'>
                                                    <VideoFileIcon />{' '}
                                                </label>
                                            </MenuItem>
                                            <MenuItem onClick={handleClose} id='image'>
                                                {' '}
                                                <label htmlFor='image'>
                                                    <InsertPhotoIcon />{' '}
                                                </label>
                                            </MenuItem>
                                            <MenuItem onClick={handleClose}>
                                                {' '}
                                                <label htmlFor='document'>
                                                    <ArticleIcon />
                                                </label>
                                            </MenuItem>
                                        </Menu>
                                        <input
                                            type='file'
                                            id='image'
                                            accept='image/*'
                                            style={{ display: 'none' }}
                                            {...register('image')}
                                            onChange={e => handleMediaChange(e, 'image')}
                                        />
                                        <input
                                            type='file'
                                            id='video'
                                            accept='video/*'
                                            style={{ display: 'none' }}
                                            {...register('video')}
                                            onChange={e => handleMediaChange(e, 'video')}
                                        />
                                        <input
                                            type='file'
                                            id='document'
                                            accept='pdf/*'
                                            style={{ display: 'none' }}
                                            {...register('image')}
                                            onChange={e => handleMediaChange(e, 'image')}
                                        />
                                        <IconButton onClick={() => setShowEmoji(!showEmoji)}>
                                            <SentimentSatisfiedAltIcon />
                                        </IconButton>

                                        <IconButton
                                            type='button'
                                            sx={{
                                                backgroundColor: '#0E74D0',
                                                borderRadius: '50% 0 50% 50%',
                                                ':hover': { backgroundColor: '#0E74D0' }
                                            }}
                                            onClick={onSubmit}
                                        >
                                            <SendIcon sx={{ color: 'white' }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardActions>
                            <Box ref={wrapperRef}>
                                <EmojiPicker
                                    open={showEmoji}
                                    setOpen={setShowEmoji}
                                    onEmojiClick={e => onEmojiClick(e)}
                                    width={'50%'}
                                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                                />
                            </Box>
                        </Card>
                    ) : (
                        <Card sx={{ height: '83vh', position: 'relative', overflow: 'auto' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '83vh' }}>
                                <h2>No Chats Found</h2>
                            </Box>
                        </Card>
                    )}
                </Grid>
            </Grid>
            {openModel && (
                <PreviewModel
                    open={openModel}
                    setOpen={setOpenModel}
                    previewForImage={previewForImage}
                    previewForVideo={previewForVideo}
                    data={getValues()}
                    user={user}
                    setValue={setValue}
                    register={register}
                    onSubmit={onSubmit}
                />
            )}
        </>
    )
}
Chat.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT, ROLE_TEACHER]
}

export default Chat
