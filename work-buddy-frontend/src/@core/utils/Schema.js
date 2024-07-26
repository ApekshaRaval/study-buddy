
import * as yup from 'yup'

export const RegisterSchema = yup.object().shape({
    userName: yup.string().min(3, "Name must be at least 3 characters").required("Please enter your name"),
    email: yup.string().email().required("Please enter a valid email"),
    password: yup.string().min(5, "Password must be at least 5 characters").required("Please enter your password").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+|~=`{}[\]:;"'<>,.?/\\-]).{8,}$/, "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"),
    role: yup.string().required("Please select a role"),
})


export const LoginSchema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
    password: yup.string().min(5).required("Password is required"),
})