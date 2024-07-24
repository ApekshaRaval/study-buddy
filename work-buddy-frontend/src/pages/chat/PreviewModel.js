import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded'
import Slide from '@mui/material/Slide'
import { Box, IconButton, TextField } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />
})

export default function PreviewModel({
    open,
    setOpen,
    previewForImage,
    previewForVideo,
    data,
    user,
    setValue,
    register,
    onSubmit
}) {
    const handleClickOpen = () => {
        setOpen(true)
    }
    console.log('data: ', data)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <React.Fragment>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                maxWidth='sm'
                onClose={handleClose}
                aria-describedby='alert-dialog-slide-description'
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Are you sure want to share with {user?.userName} ?</DialogTitle>
                <IconButton
                    aria-label='close'
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 14,
                        color: theme => theme.palette.grey[500]
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>
                <DialogContent sx={{ pt: 0 }}>
                    {previewForImage !== null && data?.image && (
                        <Box sx={{ mt: 2, width: '100%' }}>
                            <img
                                src={previewForImage}
                                alt='Preview'
                                style={{ width: '100%', height: { xs: '100px', sm: '200px' } }}
                            />
                        </Box>
                    )}

                    {previewForVideo !== null && data?.video && (
                        <Box sx={{ mt: 2, width: '100%' }}>
                            <video controls style={{ width: '100%', maxHeight: '300px' }}>
                                <source src={previewForVideo} />
                            </video>
                        </Box>
                    )}
                    <TextField
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    border: 'none'
                                }
                            }
                        }}
                        id='outlined-multiline-flexible'
                        multiline
                        minRows={1}
                        placeholder='Write a message'
                        maxRows={4}
                        {...register('message')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'red', fontSize: '14px' }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '14px' }}>
                        Share
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
