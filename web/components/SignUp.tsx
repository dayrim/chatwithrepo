import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, Modal, TextInput } from 'flowbite-react';
import { useAppState } from '@/hooks/useAppStore';
import useBackendClient from '@/hooks/useBackendClient';
import { v4 as uuid } from 'uuid';

// Define a schema for the user inputs using Yup
const validationSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(8, 'Password must be 8 characters or longer').matches(/[a-zA-Z]/, 'Password must contain at least one letter').matches(/[0-9]/, 'Password must contain at least one number').matches(/[@$!%*#?&]/, 'Password must contain at least one special character').required('Password is required'),
});

interface SignUpProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

const SignUp: React.FC<SignUpProps> = ({ openModal, setOpenModal }) => {
    const [submitError, setSubmitError] = useState('');

    const { usersService, authService } = useBackendClient();
    const { userId, setIsLoggedIn } = useAppState();

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setSubmitError(''); // Reset submit error
            if (usersService && userId && authService) {
                try {
                    const email = values.email;
                    const password = values.password;
                    const response = await usersService.register({ userId, email, password });
                    await authService.authenticate({
                        strategy: 'local',
                        email,
                        password,
                    });
                    setIsLoggedIn(true);

                    setOpenModal(false);
                } catch (error: any) {
                    console.error('Error signing up:', error);
                    const errorMsg = error.message || 'Failed to sign up. Please try again.';

                    if (errorMsg.includes("User is already registered")) {
                        setSubmitError('This email is already registered. Please log in or use a different email.');
                    } else {
                        setSubmitError(errorMsg);
                    }
                } finally {
                    setSubmitting(false);
                }
            }
        },
    });

    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Sign Up</Modal.Header>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <div className="space-y-6">
                        {submitError && <p className="text-sm text-red-500">{submitError}</p>}
                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email && <div className="text-sm text-red-500">{formik.errors.email}</div>}
                        <TextInput
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password && <div className="text-sm text-red-500">{formik.errors.password}</div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" color="dark" disabled={formik.isSubmitting || !formik.isValid}>
                        Sign Up
                    </Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default SignUp;
