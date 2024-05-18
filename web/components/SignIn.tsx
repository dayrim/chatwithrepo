import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, Modal, TextInput } from 'flowbite-react';
import { useAppState } from '@/hooks/useAppStore';
import useBackendClient from '@/hooks/useBackendClient';

// Define a schema for the user inputs using Yup
const signInValidationSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required'),
});

interface SignInProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

const SignIn: React.FC<SignInProps> = ({ openModal, setOpenModal }) => {
    const [submitError, setSubmitError] = useState('');

    const { authService } = useBackendClient();
    const { setIsLoggedIn, setUserId, setUserInfo } = useAppState();

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: signInValidationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setSubmitError(''); // Reset submit error
            if (authService) {
                try {
                    const auth = await authService.authenticate({
                        strategy: 'local',
                        ...values,
                    });
                    setIsLoggedIn(true)
                    setUserInfo(auth.user)
                    setUserId(auth.user.id)
                    setOpenModal(false);
                } catch (error: any) {
                    console.error('Error signing in:', error);
                    // Handle specific or general authentication errors
                    const errorMsg = error.message || 'Failed to sign in. Please try again.';
                    setSubmitError(errorMsg);
                } finally {
                    setSubmitting(false); // Ensure form is re-enable after submission attempt
                }
            }
        },
    });

    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Sign In</Modal.Header>
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
                        Sign In
                    </Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default SignIn;
