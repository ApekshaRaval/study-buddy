import {
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { Box } from '@mui/system'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { ROLE_STUDENT, ROLE_TEACHER } from 'src/constants/constant'
import { useAuth } from 'src/hooks/useAuth'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import styled from '@emotion/styled'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import EmojiPicker from 'emoji-picker-react'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import { useForm } from 'react-hook-form'
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams, useRouter } from 'next/navigation'
const socket = io('http://localhost:1337', {
    transports: ['websocket']
})

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 2,
        top: 25,
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
    console.log('messages: ', messages);
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
    const limit = 20
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const searchParams = useSearchParams()
    const router = useRouter();
    const [searchParam, setSearchParam] = useState(searchParams.get('receiver'))
    const search = searchParams.get('receiver')
    console.log('search: ', search);

    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }

    useEffect(() => {
        if (currentMessage?.current) {
            currentMessage?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [message])

    const handleClose = () => {
        setAnchorEl(null)
    }

    const fetchAllMessages = async () => {
        if (!receiver) return
        try {
            const response = await fetch(`http://localhost:1337/chat/message?senderId=${user?.id}&receiverId=${receiver?.id}&page=${page}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const data = await response.json()
            if (data) {
                setMessages((prev) => [...data?.data,])
                setTotal(data?.total)
            }
        } catch (error) {
            console.log('Fetch All Messages Error:', error)
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
    }, [])

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
                    socket.emit('send-message', messageData)
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
                    socket.emit('send-message', messageData)
                } catch (error) {
                    console.error('Error sending message:', error)
                }
            }
            reader.readAsDataURL(video[0])
        } else {
            try {
                socket.emit('send-message', messageData)
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
    const fetchUser = async () => {
        try {
            const fetchResponse = fetch(`http://localhost:1337/api/user-detail/${search}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const response = await fetchResponse
            const data = await response.json()
            setReceiver(data?.data)
        } catch (err) {
            console.log('err: ', err)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [search])

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

    const handleSelectedUser = (user) => {
        router.push(`?receiver=${user?.id}`)
        setReceiver(user)
        setMessages([])
        setPage(1)
    }

    const fetchMoreData = async () => {
        console.log("call")
        if (!receiver) return
        setPage(prev => prev + 1)
        try {
            const response = await fetch(`http://localhost:1337/chat/message?senderId=${user?.id}&receiverId=${receiver?.id}&page=${page + 1}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            if (data) {
                setMessages((prev) => [...data?.data, ...prev])
                setTotal(data?.total)
            }
        } catch (error) {
            console.log('Fetch More Messages Error:', error)
        }
    }

    useEffect(() => {
        if (search) {
            const receiverUser = users?.find(user => user.id == search)
            if (receiverUser) {
                setReceiver(receiverUser)
                setMessages([])
                setPage(1)
            }
        }
    }, [search])

    const isMediaFilePresent = Boolean(watch('image')?.length || watch('video')?.length)
    const scrollableTargetId = 'scrollable-target'

    return (
        <Card sx={{ position: 'relative' }}>
            <CardHeader
                sx={{ backgroundColor: '#98CFFD' }}
                avatar={
                    <StyledBadge
                        overlap='circular'
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant='dot'
                        color='success'
                    >
                        <Avatar alt={receiver?.userName} src={receiver?.profilePicture ? receiver?.profilePicture : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7yCZ2XEw9y3jo1_CJpNeZCw0khxgVxh7z7fsEyK2FwrZz8gBF28sqsAdwKY1PInz4z4&usqp=CAU'} />
                    </StyledBadge>
                }

                action={
                    <Box>
                        <IconButton
                            aria-label='settings'
                            aria-controls={open ? 'demo-positioned-menu' : undefined}
                            aria-haspopup='true'
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <MoreHorizIcon />
                        </IconButton>
                        <Menu
                            id='demo-positioned-menu'
                            aria-labelledby='demo-positioned-button'
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                            }}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem>
                        </Menu>
                    </Box>
                }
                title={<Box
                    key={user.id}
                    display='flex'
                    alignItems='center'
                    p={2}
                    sx={{
                        cursor: 'pointer'
                    }}
                    onClick={() => handleSelectedUser(receiver)}
                >
                    <Typography variant='subtitle2' ml={2} sx={{ fontWeight: 700, fontSize: '18px' }}>
                        {receiver?.userName ? receiver?.userName : 'Chat'}
                    </Typography>
                </Box>}
            />
            <CardContent >
                <Box display='flex'>
                    <Grid container>
                        <Grid item xs={12} sm={3} md={2} lg={2}>
                            <Box className='users-chat-list'>
                                {users?.map(user => (
                                    <Box
                                        key={user.id}
                                        display='flex'
                                        alignItems='center'
                                        p={2}
                                        sx={{
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSelectedUser(user)}
                                    >
                                        <Avatar alt={user.userName} src={user.profilePicture ? user.profilePicture : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7yCZ2XEw9y3jo1_CJpNeZCw0khxgVxh7z7fsEyK2FwrZz8gBF28sqsAdwKY1PInz4z4&usqp=CAU'} />
                                        <Typography variant='subtitle2' ml={2}>
                                            {user.userName}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={9} md={10} lg={10}>
                            <Box display='flex' flexDirection='column'>
                                <Box
                                    id={scrollableTargetId}
                                    sx={{
                                        height: 'calc(100vh - 350px)',
                                        overflowY: 'scroll',
                                        // backgroundImage:
                                        //     'url(https://i.pinimg.com/474x/72/9e/18/729e189c068e46c48e3eeb33c53bfaba.jpg)',
                                        // backgroundSize: 'cover',
                                        // backgroundPosition: 'center',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        padding: 2,
                                    }}
                                >
                                    <InfiniteScroll
                                        dataLength={messages?.length}
                                        next={fetchMoreData}
                                        hasMore={messages?.length < total}
                                        inverse={true}
                                        scrollableTarget={scrollableTargetId}
                                    >
                                        {messages?.map((msg, index) => (
                                            <Box
                                                key={index}
                                                display='flex'
                                                flexDirection={msg.senderid === user?.id ? 'row-reverse' : 'row'}
                                                mb={2}
                                                ref={index === messages.length - 1 ? currentMessage : null}
                                            >
                                                <Avatar alt={msg.senderid} src={msg.senderProfilePicture ? msg.senderProfilePicture : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7yCZ2XEw9y3jo1_CJpNeZCw0khxgVxh7z7fsEyK2FwrZz8gBF28sqsAdwKY1PInz4z4&usqp=CAU'} />
                                                <Box
                                                    ml={msg.senderid === user?.id ? 0 : 2}
                                                    mr={msg.senderid === user?.id ? 2 : 0}
                                                    p={2}
                                                    bgcolor={msg.senderid === user?.id ? '#1976d2' : '#e0e0e0'}
                                                    borderRadius={2}
                                                >
                                                    <Typography variant='body2' color={msg.senderid === user?.id ? '#fff' : '#000'}>{msg.text}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </InfiniteScroll>
                                </Box>
                                <Box display='flex' alignItems='center' mt={2}>
                                    <TextField
                                        value={message}
                                        onChange={handleMessageChange}
                                        fullWidth
                                        variant='outlined'
                                        size='small'
                                        placeholder='Type a message'
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowEmoji(!showEmoji)}>
                                                    <SentimentSatisfiedAltIcon />
                                                </IconButton>
                                            )
                                        }}
                                    />
                                    <IconButton component='label'>
                                        <AttachFileIcon />
                                        <input type='file' hidden onChange={e => handleMediaChange(e, 'file')} />
                                    </IconButton>
                                    <IconButton component='label'>
                                        <InsertPhotoIcon />
                                        <input type='file' hidden onChange={e => handleMediaChange(e, 'image')} />
                                    </IconButton>
                                    <IconButton component='label'>
                                        <VideoFileIcon />
                                        <input type='file' hidden onChange={e => handleMediaChange(e, 'video')} />
                                    </IconButton>
                                    <Button variant='contained' color='primary' onClick={sendMessage} endIcon={<SendIcon />}>
                                        Send
                                    </Button>
                                </Box>
                                {showEmoji && (
                                    <Box ref={wrapperRef} sx={{ position: 'absolute', bottom: 70, right: 20 }}>
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box >
            </CardContent >
        </Card >
    )
}
Chat.acl = {
    action: 'manage',
    subject: [ROLE_STUDENT, ROLE_TEACHER]
}
export default Chat
